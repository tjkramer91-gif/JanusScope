import { RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import {
  IntelligenceEdge,
  IntelligenceGraph,
  IntelligenceNode,
  IntelligenceSignal,
  Project,
  RiskCategory,
  RiskReview,
  Severity,
} from "@/lib/types";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function slug(value: string, maxLength = 72): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (normalized || "unknown").slice(0, maxLength).replace(/-+$/g, "") || "unknown";
}

function text(value: string, fallback: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function summarize(value: string, maxLength = 170): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 3).trim()}...`;
}

function categoryLabel(category: RiskCategory): string {
  return RISK_CATEGORY_LABELS[category] ?? category;
}

function maxSeverity(a?: Severity, b?: Severity): Severity | undefined {
  if (!a) return b;
  if (!b) return a;
  return SEVERITY_WEIGHT[a] >= SEVERITY_WEIGHT[b] ? a : b;
}

function confidenceFor(count: number): IntelligenceSignal["confidence"] {
  if (count >= 3) return "supported";
  if (count >= 2) return "emerging";
  return "observed";
}

function addNode(nodes: Map<string, IntelligenceNode>, node: IntelligenceNode): void {
  const existing = nodes.get(node.id);
  if (!existing) {
    nodes.set(node.id, node);
    return;
  }

  nodes.set(node.id, {
    ...existing,
    summary: existing.summary || node.summary,
    weight: Math.max(existing.weight, node.weight),
    severity: maxSeverity(existing.severity, node.severity),
    metadata: { ...existing.metadata, ...node.metadata },
  });
}

function addEdge(edges: Map<string, IntelligenceEdge>, edge: IntelligenceEdge): void {
  const existing = edges.get(edge.id);
  if (!existing) {
    edges.set(edge.id, edge);
    return;
  }

  edges.set(edge.id, { ...existing, weight: Math.max(existing.weight, edge.weight) });
}

function nodeHistoryCount(history: IntelligenceGraph[], nodeId: string): number {
  return history.filter((graph) => graph.nodes.some((node) => node.id === nodeId)).length;
}

function ratedCategories(review: RiskReview): Array<[RiskCategory, Severity]> {
  return (Object.entries(review.categoryRatings) as Array<[RiskCategory, Severity]>)
    .filter(([, severity]) => severity !== "low")
    .sort((a, b) => SEVERITY_WEIGHT[b[1]] - SEVERITY_WEIGHT[a[1]])
    .slice(0, 6);
}

export function buildProjectIntelligenceGraph(
  project: Project,
  review: RiskReview,
  history: IntelligenceGraph[] = [],
): IntelligenceGraph {
  const nodes = new Map<string, IntelligenceNode>();
  const edges = new Map<string, IntelligenceEdge>();
  const signals: IntelligenceSignal[] = [];
  const projectNodeId = `project:${project.id}`;
  const gcName = text(project.gcName, "GC not provided");
  const tradeName = text(project.tradeType, "Trade not provided");
  const gcNodeId = `gc:${slug(gcName)}`;
  const tradeNodeId = `trade:${slug(tradeName)}`;

  addNode(nodes, {
    id: projectNodeId,
    type: "project",
    label: text(project.name, "Untitled review"),
    summary: `${gcName} / ${tradeName}`,
    weight: review.score,
    severity: review.overallRating,
    metadata: {
      riskScore: review.score,
      riskLevel: review.riskLevel,
      projectType: project.projectType,
    },
  });

  addNode(nodes, {
    id: gcNodeId,
    type: "gc",
    label: gcName,
    summary: "General contractor named on this review.",
    weight: 1 + nodeHistoryCount(history, gcNodeId),
  });
  addEdge(edges, {
    id: `${projectNodeId}->${gcNodeId}:involves`,
    from: projectNodeId,
    to: gcNodeId,
    type: "involves",
    label: "GC on review",
    weight: 1,
  });

  addNode(nodes, {
    id: tradeNodeId,
    type: "trade",
    label: tradeName,
    summary: "Trade package reviewed for scope and contract risk.",
    weight: 1 + nodeHistoryCount(history, tradeNodeId),
  });
  addEdge(edges, {
    id: `${projectNodeId}->${tradeNodeId}:involves`,
    from: projectNodeId,
    to: tradeNodeId,
    type: "involves",
    label: "Trade package",
    weight: 1,
  });

  for (const [category, severity] of ratedCategories(review)) {
    const categoryNodeId = `risk-category:${category}`;
    addNode(nodes, {
      id: categoryNodeId,
      type: "risk-category",
      label: categoryLabel(category),
      summary: `${categoryLabel(category)} rated ${severity} in this review.`,
      weight: SEVERITY_WEIGHT[severity] + nodeHistoryCount(history, categoryNodeId),
      severity,
    });
    addEdge(edges, {
      id: `${projectNodeId}->${categoryNodeId}:flags`,
      from: projectNodeId,
      to: categoryNodeId,
      type: "flags",
      label: "Risk category",
      weight: SEVERITY_WEIGHT[severity],
    });
    addEdge(edges, {
      id: `${gcNodeId}->${categoryNodeId}:repeats-with`,
      from: gcNodeId,
      to: categoryNodeId,
      type: "repeats-with",
      label: "GC pattern candidate",
      weight: Math.max(1, nodeHistoryCount(history, categoryNodeId)),
    });
    addEdge(edges, {
      id: `${tradeNodeId}->${categoryNodeId}:repeats-with`,
      from: tradeNodeId,
      to: categoryNodeId,
      type: "repeats-with",
      label: "Trade pattern candidate",
      weight: Math.max(1, nodeHistoryCount(history, categoryNodeId)),
    });
  }

  for (const issue of review.issueLog.slice(0, 8)) {
    const issueNodeId = `issue:${slug(issue.issueTitle)}`;
    const categoryNodeId = `risk-category:${issue.category}`;
    addNode(nodes, {
      id: categoryNodeId,
      type: "risk-category",
      label: categoryLabel(issue.category),
      summary: `${categoryLabel(issue.category)} appears in the issue log.`,
      weight: SEVERITY_WEIGHT[issue.riskLevel] + nodeHistoryCount(history, categoryNodeId),
      severity: issue.riskLevel,
    });
    addNode(nodes, {
      id: issueNodeId,
      type: "issue",
      label: issue.issueTitle,
      summary: summarize(issue.issueDescription || issue.whyItMatters),
      weight: SEVERITY_WEIGHT[issue.riskLevel],
      severity: issue.riskLevel,
      metadata: {
        source: issue.documentSource,
        contractSection: issue.contractSection,
      },
    });
    addEdge(edges, {
      id: `${projectNodeId}->${issueNodeId}:flags`,
      from: projectNodeId,
      to: issueNodeId,
      type: "flags",
      label: "Issue found",
      weight: SEVERITY_WEIGHT[issue.riskLevel],
    });
    addEdge(edges, {
      id: `${issueNodeId}->${categoryNodeId}:belongs-to`,
      from: issueNodeId,
      to: categoryNodeId,
      type: "belongs-to",
      label: "Risk category",
      weight: SEVERITY_WEIGHT[issue.riskLevel],
    });
  }

  for (const missingDocument of review.missingDocuments.slice(0, 6)) {
    const documentNodeId = `document:${slug(missingDocument.document)}`;
    addNode(nodes, {
      id: documentNodeId,
      type: "document",
      label: missingDocument.document,
      summary: missingDocument.reason,
      weight: SEVERITY_WEIGHT[missingDocument.priority],
      severity: missingDocument.priority,
    });
    addEdge(edges, {
      id: `${projectNodeId}->${documentNodeId}:needs`,
      from: projectNodeId,
      to: documentNodeId,
      type: "needs",
      label: "Missing document",
      weight: SEVERITY_WEIGHT[missingDocument.priority],
    });
  }

  for (const question of review.questions.slice(0, 5)) {
    const questionNodeId = `question:${slug(question.question)}`;
    addNode(nodes, {
      id: questionNodeId,
      type: "question",
      label: question.group,
      summary: question.question,
      weight: SEVERITY_WEIGHT[question.priority],
      severity: question.priority,
    });
    addEdge(edges, {
      id: `${projectNodeId}->${questionNodeId}:asks`,
      from: projectNodeId,
      to: questionNodeId,
      type: "asks",
      label: "Clarification question",
      weight: SEVERITY_WEIGHT[question.priority],
    });
  }

  const gcEvidenceCount = nodeHistoryCount(history, gcNodeId) + 1;
  const topIssue = review.issueLog[0];
  signals.push({
    id: "signal:gc-pattern",
    title: `${gcName} review memory`,
    body: topIssue
      ? `${gcName} appears in ${gcEvidenceCount} saved review${gcEvidenceCount === 1 ? "" : "s"}. Current high-priority review work starts with ${topIssue.issueTitle}.`
      : `${gcName} appears in ${gcEvidenceCount} saved review${gcEvidenceCount === 1 ? "" : "s"}. No high-priority issue pattern is visible yet.`,
    severity: review.overallRating,
    confidence: confidenceFor(gcEvidenceCount),
    evidenceCount: gcEvidenceCount,
    nodeIds: [projectNodeId, gcNodeId],
  });

  const tradeEvidenceCount = nodeHistoryCount(history, tradeNodeId) + 1;
  if (review.hiddenScopeFlags.length > 0 || review.comparisons.length > 0) {
    signals.push({
      id: "signal:trade-scope",
      title: `${tradeName} scope watchlist`,
      body: `${tradeName} has ${review.hiddenScopeFlags.length} hidden scope warning${review.hiddenScopeFlags.length === 1 ? "" : "s"} and ${review.comparisons.length} contract-vs-bid conflict${review.comparisons.length === 1 ? "" : "s"} in this review.`,
      severity: review.hiddenScopeFlags.some((flag) => flag.severity === "critical") ? "critical" : review.overallRating,
      confidence: confidenceFor(tradeEvidenceCount),
      evidenceCount: tradeEvidenceCount,
      nodeIds: [projectNodeId, tradeNodeId],
    });
  }

  const repeatedCategories = ratedCategories(review)
    .map(([category, severity]) => ({
      category,
      severity,
      nodeId: `risk-category:${category}`,
      historyCount: nodeHistoryCount(history, `risk-category:${category}`),
    }))
    .filter((item) => item.historyCount > 0);

  if (repeatedCategories.length > 0) {
    const primary = repeatedCategories[0];
    signals.push({
      id: "signal:category-repeat",
      title: "Repeated risk category",
      body: `${categoryLabel(primary.category)} has appeared in prior saved reviews and is rated ${primary.severity} here. Treat it as a pattern candidate, not a one-off flag.`,
      severity: primary.severity,
      confidence: confidenceFor(primary.historyCount + 1),
      evidenceCount: primary.historyCount + 1,
      nodeIds: [projectNodeId, primary.nodeId],
    });
  }

  if (review.missingDocuments.length > 0) {
    signals.push({
      id: "signal:document-gap",
      title: "Document gap to close",
      body: `${review.missingDocuments.length} missing document item${review.missingDocuments.length === 1 ? "" : "s"} should be closed before relying on the report. Start with ${review.missingDocuments[0].document}.`,
      severity: review.missingDocuments[0].priority,
      confidence: "observed",
      evidenceCount: review.missingDocuments.length,
      nodeIds: [projectNodeId, `document:${slug(review.missingDocuments[0].document)}`],
    });
  }

  if (signals.length === 0) {
    signals.push({
      id: "signal:no-patterns-yet",
      title: "No durable pattern yet",
      body: "This review does not have enough repeated evidence for a memory pattern. Save the report so future reviews can compare against it.",
      severity: "low",
      confidence: "observed",
      evidenceCount: 1,
      nodeIds: [projectNodeId],
    });
  }

  return {
    generatedAt: review.generatedAt,
    projectId: project.id,
    organizationId: project.organizationId,
    nodes: Array.from(nodes.values()).sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)),
    edges: Array.from(edges.values()).sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)),
    signals: signals.slice(0, 4),
  };
}
