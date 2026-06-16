import { z } from "zod";

const riskLevelSchema = z.enum(["Low", "Moderate", "High", "Severe"]);

const issueSchema = z.object({
  id: z.string(),
  category: z.string(),
  riskLevel: riskLevelSchema,
  issueTitle: z.string(),
  issueDescription: z.string(),
  documentSource: z.string(),
  contractReference: z.string(),
  bidReference: z.string(),
  whyItMatters: z.string(),
  recommendedAction: z.string(),
  suggestedRevision: z.string(),
  status: z.string(),
});

export const riskAnalysisSchema = z.object({
  projectSummary: z.record(z.string(), z.unknown()),
  overallRiskScore: z.number().int().min(0).max(100),
  riskLevel: riskLevelSchema,
  executiveSummary: z.string(),
  topIssues: z.array(issueSchema),
  contractVsBidConflicts: z.array(z.unknown()),
  hiddenScopeFlags: z.array(z.unknown()),
  exclusionsCheck: z.array(z.unknown()),
  paymentRisks: z.array(z.unknown()),
  changeOrderRisks: z.array(z.unknown()),
  scheduleRisks: z.array(z.unknown()),
  insuranceRisks: z.array(z.unknown()),
  localRequirementChecklist: z.array(z.unknown()),
  missingDocuments: z.array(z.unknown()),
  questionsForGC: z.array(z.string()),
  suggestedContractRevisions: z.array(z.string()),
  signingRecommendation: z.string(),
});

export type RiskAnalysisJson = z.infer<typeof riskAnalysisSchema>;
