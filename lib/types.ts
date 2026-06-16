export type Severity = "low" | "medium" | "high" | "critical";

export type ProjectType =
  | "multifamily"
  | "affordable-housing"
  | "commercial"
  | "tenant-improvement"
  | "civil"
  | "industrial"
  | "public-works"
  | "other";

export type ProjectStatus =
  | "draft"
  | "documents-uploaded"
  | "processing"
  | "questions-needed"
  | "report-ready"
  | "failed";

export type AnswerOption = "yes" | "no" | "not-sure" | "not-applicable";
export type MasterServiceAgreementStatus = "yes" | "no" | "not-sure";
export type PublicPrivateStatus = "public" | "private" | "not-sure";
export type PrevailingWageStatus = "yes" | "no" | "not-sure";
export type DocumentProcessingStatus = "uploaded" | "extracting" | "classified" | "failed";

export type DocumentId =
  | "gc-subcontract"
  | "bid-proposal"
  | "scope-letter"
  | "exclusions-assumptions"
  | "msa"
  | "drawings"
  | "specifications"
  | "addenda"
  | "rfi-log"
  | "clarifications"
  | "schedule"
  | "insurance"
  | "bonding"
  | "safety"
  | "wage"
  | "permit-ahj"
  | "prime-contract-excerpt"
  | "other";

export interface DocumentAvailability {
  id: DocumentId;
  label: string;
  available: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  documentId: DocumentId;
  storagePath: string;
  processingStatus: DocumentProcessingStatus;
  uploadedAt: string;
}

export interface IntakeAnswer {
  questionKey: string;
  questionText: string;
  answer: AnswerOption;
}

export interface Project {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  projectAddress: string;
  city: string;
  state: string;
  zip: string;
  tradeType: string;
  gcName: string;
  ownerName: string;
  contractAmount: number | null;
  bidDate: string;
  executionDeadline: string;
  hasMasterServiceAgreement: MasterServiceAgreementStatus;
  publicOrPrivate: PublicPrivateStatus;
  prevailingWageStatus: PrevailingWageStatus;
  projectType: ProjectType;
  status: ProjectStatus;
  riskScore: number | null;
  riskLevel: string;
  deleteDocumentsAfterReport: boolean;
  documents: DocumentAvailability[];
  uploadedFiles: UploadedFile[];
  intakeAnswers: IntakeAnswer[];
  subcontractText: string;
  bidText: string;
  exclusionsText: string;
  notesText: string;
  createdAt: string;
  updatedAt: string;
}

export type RiskCategory =
  | "scope-gap"
  | "payment"
  | "schedule"
  | "change-order"
  | "backcharge"
  | "insurance-indemnity"
  | "local-code-ahj"
  | "labor-wage"
  | "design-responsibility"
  | "warranty-closeout"
  | "flow-down"
  | "ambiguous-language"
  | "missing-document"
  | "document-conflict"
  | "financial-exposure";

export interface RiskFlag {
  id: string;
  category: RiskCategory;
  severity: Severity;
  issue: string;
  whyItMatters: string;
  whatToVerify: string;
  suggestedAction: string;
}

export type QuestionGroup =
  | "GC / Contract Admin"
  | "Estimating Team"
  | "Project Manager"
  | "Insurance / Broker"
  | "Attorney"
  | "AHJ / Local Authority"
  | "Internal Decision";

export interface ClarificationQuestion {
  id: string;
  group: QuestionGroup;
  question: string;
  priority: Severity;
}

export interface MissingDocument {
  document: string;
  reason: string;
  priority: Severity;
}

export interface Assumption {
  id: string;
  statement: string;
  basis: string;
}

export interface ContractComparison {
  id: string;
  item: string;
  bidPosition: string;
  contractPosition: string;
  conflict: string;
  riskLevel: Severity;
  recommendedClarification: string;
}

export interface HiddenScopeFlag {
  id: string;
  obligation: string;
  contractLanguage: string;
  whyItMatters: string;
  potentialCostImpact: string;
  questionToAsk: string;
  severity: Severity;
}

export interface ExclusionCheck {
  id: string;
  exclusion: string;
  foundInBid: "yes" | "no" | "unclear";
  contractPreservesIt: "yes" | "no" | "unclear";
  contradictedByContract: "yes" | "no" | "unclear";
  requiredAction: string;
  severity: Severity;
}

export interface ReportNote {
  label: string;
  value: string;
  risk: Severity;
}

export interface IssueLogItem {
  id: string;
  category: RiskCategory;
  issueTitle: string;
  documentSource: string;
  contractSection: string;
  bidReference: string;
  issueDescription: string;
  whyItMatters: string;
  riskLevel: Severity;
  potentialCostImpact: string;
  recommendedClarification: string;
  suggestedRevision: string;
  status: string;
  owner: string;
  dateResolved: string;
}

export interface RiskReview {
  generatedAt: string;
  overallRating: Severity;
  score: number;
  riskLevel: string;
  categoryRatings: Record<RiskCategory, Severity>;
  flags: RiskFlag[];
  comparisons: ContractComparison[];
  hiddenScopeFlags: HiddenScopeFlag[];
  exclusionChecks: ExclusionCheck[];
  questions: ClarificationQuestion[];
  missingDocuments: MissingDocument[];
  paymentTerms: ReportNote[];
  changeOrderTerms: ReportNote[];
  scheduleTerms: ReportNote[];
  insuranceTerms: ReportNote[];
  localRequirements: ReportNote[];
  recommendedRevisions: string[];
  finalRecommendation: string;
  assumptions: Assumption[];
  issueLog: IssueLogItem[];
}
