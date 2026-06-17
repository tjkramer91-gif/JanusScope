import {
  DocumentAvailability,
  DocumentId,
  Project,
  ProjectStatus,
  PublicPrivateStatus,
  RiskCategory,
} from "@/lib/types";

export const DOCUMENT_CATALOG: Omit<DocumentAvailability, "available">[] = [
  { id: "gc-subcontract", label: "GC subcontract" },
  { id: "bid-proposal", label: "Subcontractor bid or proposal" },
  { id: "scope-letter", label: "Scope sheet" },
  { id: "exclusions-assumptions", label: "Assumptions and exclusions" },
  { id: "msa", label: "Master service agreement" },
  { id: "drawings", label: "Drawings" },
  { id: "specifications", label: "Specifications" },
  { id: "addenda", label: "Addenda" },
  { id: "rfi-log", label: "RFI log" },
  { id: "clarifications", label: "Clarifications" },
  { id: "schedule", label: "Schedule" },
  { id: "insurance", label: "Insurance requirements" },
  { id: "bonding", label: "Bonding requirements" },
  { id: "safety", label: "Safety requirements" },
  { id: "wage", label: "Wage requirements" },
  { id: "permit-ahj", label: "Permit or AHJ requirements" },
  { id: "prime-contract-excerpt", label: "Prime contract excerpt" },
  { id: "budget", label: "Budget" },
  { id: "product-data", label: "Product data or submittal" },
  { id: "other", label: "Other supporting document" },
];

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  "scope-gap": "Scope gap",
  payment: "Payment",
  schedule: "Schedule",
  "change-order": "Change order",
  backcharge: "Backcharge",
  "insurance-indemnity": "Insurance and indemnity",
  "local-code-ahj": "Local code and AHJ",
  "labor-wage": "Labor and wage",
  "design-responsibility": "Design responsibility",
  "warranty-closeout": "Warranty and closeout",
  "flow-down": "Flow-down",
  "ambiguous-language": "Ambiguous language",
  "missing-document": "Missing document",
  "document-conflict": "Document conflict",
  "financial-exposure": "Financial exposure",
};

export const PROJECT_TYPE_LABELS: Record<Project["projectType"], string> = {
  multifamily: "Multifamily",
  "affordable-housing": "Affordable housing",
  commercial: "Commercial",
  "tenant-improvement": "Tenant improvement",
  civil: "Civil",
  industrial: "Industrial",
  "public-works": "Public works",
  other: "Other",
};

export const MSA_STATUS_LABELS: Record<Project["hasMasterServiceAgreement"], string> = {
  yes: "Yes",
  no: "No",
  "not-sure": "Not sure",
};

export const PUBLIC_PRIVATE_LABELS: Record<PublicPrivateStatus, string> = {
  public: "Public",
  private: "Private",
  "not-sure": "Not sure",
};

export const YES_NO_NOT_SURE_LABELS = {
  yes: "Yes",
  no: "No",
  "not-sure": "Not sure",
} as const;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  "documents-uploaded": "Documents uploaded",
  processing: "Processing",
  "questions-needed": "Review package saved",
  "report-ready": "Report ready",
  failed: "Failed",
};

export function createEmptyProject(overrides: Partial<Project> = {}): Project {
  const now = new Date().toISOString();

  return {
    id: globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`,
    organizationId: "local-org",
    userId: "local-user",
    name: "",
    projectAddress: "",
    city: "",
    state: "",
    zip: "",
    tradeType: "",
    gcName: "",
    ownerName: "",
    contractAmount: null,
    bidDate: "",
    executionDeadline: "",
    hasMasterServiceAgreement: "not-sure",
    publicOrPrivate: "not-sure",
    prevailingWageStatus: "not-sure",
    projectType: "commercial",
    status: "draft",
    riskScore: null,
    riskLevel: "",
    deleteDocumentsAfterReport: false,
    documents: DOCUMENT_CATALOG.map((document) => ({ ...document, available: false })),
    uploadedFiles: [],
    intakeAnswers: [],
    subcontractText: "",
    bidText: "",
    exclusionsText: "",
    notesText: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function classifyFileName(fileName: string): DocumentId {
  const name = fileName.toLowerCase();
  if (/(subcontract|sub[-_ ]?contract|agreement|contract)/.test(name)) return "gc-subcontract";
  if (/(bid|proposal|quote|estimate)/.test(name)) return "bid-proposal";
  if (/(budget|allowance|cost[-_ ]?plan|owner[-_ ]?estimate)/.test(name)) return "budget";
  if (/(product[-_ ]?data|submittal|cut[-_ ]?sheet|manufacturer|spec[-_ ]?sheet)/.test(name)) return "product-data";
  if (/(scope|work letter|scope letter)/.test(name)) return "scope-letter";
  if (/(exclusion|assumption)/.test(name)) return "exclusions-assumptions";
  if (/(msa|master service)/.test(name)) return "msa";
  if (/(drawing|plan|sheet|a\d|e\d|m\d|p\d|civil)/.test(name)) return "drawings";
  if (/(spec|specification)/.test(name)) return "specifications";
  if (/(addendum|addenda)/.test(name)) return "addenda";
  if (/(rfi)/.test(name)) return "rfi-log";
  if (/(clarification)/.test(name)) return "clarifications";
  if (/(schedule|milestone|baseline|phasing)/.test(name)) return "schedule";
  if (/(prime|owner contract|flow[-_ ]?down)/.test(name)) return "prime-contract-excerpt";
  if (/(insurance|coi|additional insured)/.test(name)) return "insurance";
  if (/(bond|bonding|performance bond|payment bond)/.test(name)) return "bonding";
  if (/(safety|site requirement|osha)/.test(name)) return "safety";
  if (/(wage|davis|bacon|prevailing|certified payroll)/.test(name)) return "wage";
  if (/(permit|inspection|ahj|code|fire marshal|city|county)/.test(name)) return "permit-ahj";
  return "other";
}
