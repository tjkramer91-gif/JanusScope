import type { ProjectMemoryRecord } from "@/lib/server/store";
import type { IssueLogItem, Project, RiskReview, Severity } from "@/lib/types";

export interface ProjectBrainProfileItem {
  label: string;
  value: string;
}

export interface ProjectBrainPricingItem {
  trade: string;
  scopeItem: string;
  quantity: string;
  unitOfMeasure: string;
  unitCost: string;
  totalCost: string;
  costPerSf: string;
  costPerUnit: string;
  sourceDocument: string;
  confidenceScore: string;
  reviewStatus: string;
}

export interface ProjectBrainContractItem {
  label: string;
  value: string;
  status: "present" | "unclear" | "not-found";
}

export interface ProjectBrainViewModel {
  profile: ProjectBrainProfileItem[];
  knownScope: string[];
  openQuestions: string[];
  topRisks: Array<{
    title: string;
    severity: Severity | "informational";
    type: string;
    source: string;
    action: string;
  }>;
  pricingMemory: ProjectBrainPricingItem[];
  contractMemory: ProjectBrainContractItem[];
  decisions: string[];
  lessonsLearned: string[];
  lastUpdatedAt: string | null;
}

function display(value: string | number | null | undefined, fallback = "Not set"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function currency(value: number | null): string {
  if (value === null) return "Not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function numberDisplay(value: number | null): string {
  if (value === null) return "Not set";
  return value.toLocaleString();
}

function splitMemorySummary(summary: string | undefined, emptyState: string): string[] {
  if (!summary?.trim()) return [emptyState];
  return summary
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function riskType(issue: IssueLogItem): string {
  const text = `${issue.category} ${issue.issueTitle} ${issue.issueDescription}`.toLowerCase();
  if (/price|unit|cost|budget/.test(text)) return "Pricing gap";
  if (/allowance/.test(text)) return "Allowance risk";
  if (/schedule|delay|acceleration/.test(text)) return "Schedule risk";
  if (/missing document|missing/.test(text)) return "Missing document";
  if (/quantity/.test(text)) return "Missing quantity";
  if (/code|permit|inspection|funding|ahj/.test(text)) return "Funding/code risk";
  if (/responsibility|by others|scope/.test(text)) return "Undefined responsibility";
  if (/exclude|excluded|exclusion/.test(text)) return "Excluded scope";
  if (/contract|pay|indemnity|insurance|notice/.test(text)) return "Contract risk";
  return "Scope gap";
}

export function buildProjectBrain(project: Project, memory: ProjectMemoryRecord | null, review: RiskReview): ProjectBrainViewModel {
  const profile: ProjectBrainProfileItem[] = [
    { label: "Project name", value: display(project.name) },
    { label: "City", value: display(project.city) },
    { label: "State", value: display(project.state) },
    { label: "Region", value: display(project.region) },
    { label: "Project type", value: display(project.projectType) },
    { label: "Asset type", value: display(project.assetType) },
    { label: "Renovation or new", value: display(project.renovationOrNew) },
    { label: "Unit count", value: numberDisplay(project.unitCount) },
    { label: "Gross SF", value: numberDisplay(project.grossSquareFeet) },
    { label: "Rentable SF", value: numberDisplay(project.rentableSquareFeet) },
    { label: "Building count", value: numberDisplay(project.buildingCount) },
    { label: "Funding type", value: display(project.fundingType) },
    { label: "Current phase", value: display(project.currentPhase) },
    { label: "Company", value: display(project.companyId) },
    { label: "User role", value: "Not set" },
  ];

  const knownScope = splitMemorySummary(memory?.knownScopeSummary, "No known scope captured yet.");
  const openQuestions = [
    ...splitMemorySummary(memory?.openQuestionsSummary, "No open questions captured yet."),
    ...review.questions.slice(0, 6).map((question) => question.question),
    ...review.missingDocuments.slice(0, 4).map((document) => `Missing document: ${document.document}`),
  ].filter((item, index, array) => array.indexOf(item) === index);

  const topRisks = review.issueLog.slice(0, 8).map((issue) => ({
    title: issue.issueTitle,
    severity: issue.riskLevel,
    type: riskType(issue),
    source: issue.documentSource || "Project review",
    action: issue.recommendedClarification,
  }));

  const pricingMemory: ProjectBrainPricingItem[] = [];
  if (project.contractAmount !== null) {
    pricingMemory.push({
      trade: display(project.tradeType, "Project"),
      scopeItem: "Entered contract amount",
      quantity: "1",
      unitOfMeasure: "LS",
      unitCost: currency(project.contractAmount),
      totalCost: currency(project.contractAmount),
      costPerSf: project.grossSquareFeet ? currency(project.contractAmount / project.grossSquareFeet) : "Not available",
      costPerUnit: project.unitCount ? currency(project.contractAmount / project.unitCount) : "Not available",
      sourceDocument: "Project setup",
      confidenceScore: "User-entered",
      reviewStatus: "Needs verification",
    });
  }
  pricingMemory.push(
    ...review.issueLog
      .filter((issue) => riskType(issue) === "Pricing gap" || riskType(issue) === "Allowance risk")
      .slice(0, 5)
      .map((issue) => ({
        trade: display(project.tradeType, "Unknown"),
        scopeItem: issue.issueTitle,
        quantity: "Not extracted",
        unitOfMeasure: "Not extracted",
        unitCost: "Not extracted",
        totalCost: issue.potentialCostImpact,
        costPerSf: "Not calculated",
        costPerUnit: "Not calculated",
        sourceDocument: issue.documentSource,
        confidenceScore: "Needs review",
        reviewStatus: issue.status,
      })),
  );

  const contractMemory: ProjectBrainContractItem[] = [
    { label: "Scope obligations", value: project.subcontractText ? "Subcontract text uploaded or pasted." : "Not found yet.", status: project.subcontractText ? "present" : "not-found" },
    { label: "Exclusions", value: project.exclusionsText ? "Exclusions or assumptions text is present." : "Not found yet.", status: project.exclusionsText ? "present" : "not-found" },
    { label: "Assumptions", value: project.bidText ? "Bid or proposal text is present." : "Not found yet.", status: project.bidText ? "present" : "not-found" },
    { label: "Alternates", value: "Not extracted yet.", status: "unclear" },
    { label: "Retainage", value: review.paymentTerms.find((term) => /retain/i.test(term.label))?.value ?? "Not extracted yet.", status: "unclear" },
    { label: "Pay-if-paid / pay-when-paid", value: review.paymentTerms.find((term) => /pay/i.test(term.label))?.value ?? "Not extracted yet.", status: "unclear" },
    { label: "Indemnity", value: review.insuranceTerms.find((term) => /indemn/i.test(term.label))?.value ?? "Not extracted yet.", status: "unclear" },
    { label: "Insurance", value: review.insuranceTerms[0]?.value ?? "Not extracted yet.", status: review.insuranceTerms.length > 0 ? "present" : "unclear" },
    { label: "Schedule obligations", value: review.scheduleTerms[0]?.value ?? "Not extracted yet.", status: review.scheduleTerms.length > 0 ? "present" : "unclear" },
    { label: "Warranty", value: review.issueLog.find((issue) => /warranty/i.test(issue.issueTitle))?.issueDescription ?? "Not extracted yet.", status: "unclear" },
    { label: "Liquidated damages", value: review.issueLog.find((issue) => /liquidated/i.test(issue.issueTitle))?.issueDescription ?? "Not extracted yet.", status: "unclear" },
    { label: "Notice requirements", value: review.changeOrderTerms[0]?.value ?? "Not extracted yet.", status: review.changeOrderTerms.length > 0 ? "present" : "unclear" },
    { label: "Change order requirements", value: review.changeOrderTerms[1]?.value ?? "Not extracted yet.", status: review.changeOrderTerms.length > 1 ? "present" : "unclear" },
    { label: "Vague scope language", value: review.hiddenScopeFlags[0]?.obligation ?? "No vague scope language flagged yet.", status: review.hiddenScopeFlags.length > 0 ? "present" : "not-found" },
  ];
  const liveDecisions = [
    project.excludedFromBenchmarking ? "Project excluded from benchmarking." : "",
    project.allowedForAnonymizedLearning ? "Project allowed for anonymized learning." : "",
    project.deleteDocumentsAfterReport ? "Source files marked for deletion after report generation." : "",
    project.status === "report-ready" ? "Risk report generated." : "",
  ].filter(Boolean);
  const storedDecisions = splitMemorySummary(memory?.decisionsSummary, "");
  const decisions = [...storedDecisions, ...liveDecisions].filter((item, index, array) => item && array.indexOf(item) === index);

  return {
    profile,
    knownScope,
    openQuestions,
    topRisks,
    pricingMemory,
    contractMemory,
    decisions: decisions.length > 0 ? decisions : ["No decisions captured yet."],
    lessonsLearned: splitMemorySummary(memory?.lessonsLearnedSummary, "No lessons learned captured yet."),
    lastUpdatedAt: memory?.lastUpdatedAt ?? null,
  };
}
