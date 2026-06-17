import type { SourceVerificationReport } from "@/lib/source-verification";
import type { DetectedTradeScope } from "@/lib/trade-detector";
import type { TradeReviewFinding } from "@/lib/trade-review";
import type { IssueLogItem, MissingDocument, RiskReview, Severity } from "@/lib/types";

export interface PriorityFinding {
  id: string;
  title: string;
  whyItMatters: string;
  evidence: string;
  riskLevel: Severity;
  confidence: "High" | "Medium" | "Low";
  impact: string;
  recommendedAction: string;
}

export interface PrioritizedReport {
  overallRisk: Severity;
  detectedTrade: DetectedTradeScope;
  topRisks: PriorityFinding[];
  biggestCostMisses: PriorityFinding[];
  contractTraps: PriorityFinding[];
  missingInformation: Array<{ id: string; item: string; whyItMatters: string; action: string; riskLevel: Severity }>;
  questionsToAsk: string[];
}

const RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function severityFromSourceRisk(risk: string): Severity {
  if (risk === "High") return "high";
  if (risk === "Medium") return "medium";
  return "low";
}

function fromIssue(issue: IssueLogItem): PriorityFinding {
  return {
    id: issue.id,
    title: issue.issueTitle,
    whyItMatters: issue.whyItMatters,
    evidence: `${issue.documentSource}; ${issue.contractSection}; ${issue.bidReference}`,
    riskLevel: issue.riskLevel,
    confidence: issue.documentSource === "Rule-based review" ? "Medium" : "High",
    impact: issue.potentialCostImpact,
    recommendedAction: issue.recommendedClarification,
  };
}

function fromTradeFinding(finding: TradeReviewFinding): PriorityFinding {
  return {
    id: finding.id,
    title: finding.title,
    whyItMatters: finding.whyItMatters,
    evidence: finding.evidence,
    riskLevel: finding.riskLevel,
    confidence: finding.confidence,
    impact: "Trade-specific scope, cost, schedule, or coordination exposure.",
    recommendedAction: finding.recommendedAction,
  };
}

function sortFindings(findings: PriorityFinding[]): PriorityFinding[] {
  return findings.sort((a, b) => RANK[b.riskLevel] - RANK[a.riskLevel]);
}

function isChecklistStyleQuestion(question: string): boolean {
  return /^(did your bid include|did you include|are your|does the subcontract reference|are you required)/i.test(question);
}

export function buildPrioritizedReport({
  review,
  sourceVerification,
  detectedTrade,
  tradeFindings,
}: {
  review: RiskReview;
  sourceVerification: SourceVerificationReport;
  detectedTrade: DetectedTradeScope;
  tradeFindings: TradeReviewFinding[];
}): PrioritizedReport {
  const sourceFindings: PriorityFinding[] = sourceVerification.findings.map((finding) => ({
    id: finding.id,
    title: finding.title,
    whyItMatters: finding.explanation,
    evidence: `${finding.sourceDocument}; ${finding.sourceLocation}`,
    riskLevel: severityFromSourceRisk(finding.risk),
    confidence: finding.confidence,
    impact: finding.costOrScheduleImpact,
    recommendedAction: finding.recommendedAction,
  }));

  const issueFindings = review.issueLog.map(fromIssue);
  const tradePriorityFindings = tradeFindings.map(fromTradeFinding);
  const allFindings = sortFindings([...sourceFindings, ...tradePriorityFindings, ...issueFindings]);

  const biggestCostMisses = sortFindings(
    allFindings.filter((finding) =>
      /cost|price|pricing|budget|allowance|unit|money|unpriced|spread|fee|tax|freight|storage/i.test(
        `${finding.title} ${finding.impact} ${finding.whyItMatters}`,
      ),
    ),
  ).slice(0, 5);

  const contractTraps = sortFindings(
    allFindings.filter((finding) =>
      /contract|payment|pay-if-paid|flow-down|change order|notice|warranty|indemnity|exclusion|proposal/i.test(
        `${finding.title} ${finding.whyItMatters}`,
      ),
    ),
  ).slice(0, 5);

  const missingInformation = [
    ...sourceVerification.missingInformation.map((item) => ({
      id: item.id,
      item: item.item,
      whyItMatters: item.reason,
      action: `Provide ${item.neededDocument}.`,
      riskLevel: "medium" as Severity,
    })),
    ...review.missingDocuments.slice(0, 8).map((document: MissingDocument) => ({
      id: document.document,
      item: document.document,
      whyItMatters: document.reason,
      action: "Upload or request this document before relying on the review.",
      riskLevel: document.priority,
    })),
  ];

  return {
    overallRisk: review.overallRating,
    detectedTrade,
    topRisks: allFindings.slice(0, 5),
    biggestCostMisses,
    contractTraps,
    missingInformation: missingInformation.slice(0, 8),
    questionsToAsk: review.questions
      .map((question) => question.question)
      .filter((question) => !isChecklistStyleQuestion(question))
      .slice(0, 8),
  };
}
