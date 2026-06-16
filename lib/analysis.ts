import { RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import { severityLabel } from "@/lib/format";
import { riskAnalysisSchema, RiskAnalysisJson } from "@/lib/analysis-schema";
import { Project, RiskReview } from "@/lib/types";

function cleanRiskLevel(riskLevel: string): "Low" | "Moderate" | "High" | "Severe" {
  if (riskLevel.toLowerCase().includes("severe")) return "Severe";
  if (riskLevel.toLowerCase().includes("high")) return "High";
  if (riskLevel.toLowerCase().includes("moderate")) return "Moderate";
  return "Low";
}

export function buildRiskAnalysisJson(project: Project, review: RiskReview): RiskAnalysisJson {
  const candidate = {
    projectSummary: {
      projectName: project.name,
      projectAddress: project.projectAddress,
      city: project.city,
      state: project.state,
      zip: project.zip,
      gcName: project.gcName,
      trade: project.tradeType,
      contractAmount: project.contractAmount,
    },
    overallRiskScore: review.score,
    riskLevel: cleanRiskLevel(review.riskLevel),
    executiveSummary: `${review.riskLevel}. ${review.finalRecommendation}.`,
    topIssues: review.issueLog.slice(0, 10).map((issue) => ({
      id: issue.id,
      category: RISK_CATEGORY_LABELS[issue.category],
      riskLevel: cleanRiskLevel(severityLabel(issue.riskLevel)),
      issueTitle: issue.issueTitle,
      issueDescription: issue.issueDescription,
      documentSource: issue.documentSource,
      contractReference: issue.contractSection,
      bidReference: issue.bidReference,
      whyItMatters: issue.whyItMatters,
      recommendedAction: issue.recommendedClarification,
      suggestedRevision: issue.suggestedRevision,
      status: issue.status,
    })),
    contractVsBidConflicts: review.comparisons,
    hiddenScopeFlags: review.hiddenScopeFlags,
    exclusionsCheck: review.exclusionChecks,
    paymentRisks: review.paymentTerms,
    changeOrderRisks: review.changeOrderTerms,
    scheduleRisks: review.scheduleTerms,
    insuranceRisks: review.insuranceTerms,
    localRequirementChecklist: review.localRequirements,
    missingDocuments: review.missingDocuments,
    questionsForGC: review.questions.map((question) => question.question),
    suggestedContractRevisions: review.recommendedRevisions,
    signingRecommendation: review.finalRecommendation,
  };

  return riskAnalysisSchema.parse(candidate);
}
