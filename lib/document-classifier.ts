import { DOCUMENT_CATALOG } from "@/lib/catalogs";
import type { DocumentId, Project, UploadedFile } from "@/lib/types";

export type ClassificationConfidence = "High" | "Medium" | "Low";

export interface DocumentClassification {
  documentId: DocumentId;
  label: string;
  confidence: ClassificationConfidence;
  status: "Classified" | "Needs confirmation";
}

export const DOCUMENT_CLASSIFICATION_LABELS: Record<DocumentId, string> = {
  "gc-subcontract": "Subcontract agreement",
  "bid-proposal": "Subcontractor proposal/bid",
  "scope-letter": "Owner scope of work",
  "exclusions-assumptions": "Bid exclusions/assumptions",
  msa: "Subcontract agreement",
  drawings: "Drawings/specifications",
  specifications: "Drawings/specifications",
  addenda: "Addendum",
  "rfi-log": "RFI/clarification",
  clarifications: "RFI/clarification",
  schedule: "Schedule",
  insurance: "Insurance requirement",
  bonding: "Insurance requirement",
  safety: "Unknown",
  wage: "Unknown",
  "permit-ahj": "AHJ/city/code requirement",
  "prime-contract-excerpt": "Subcontract agreement",
  budget: "Budget",
  "product-data": "Product data/submittal",
  other: "Unknown",
};

const STRONG_CLASSIFICATION_TERMS: Record<DocumentId, RegExp[]> = {
  "gc-subcontract": [/subcontract|agreement|contract/],
  "bid-proposal": [/bid|proposal|quote|estimate/],
  "scope-letter": [/owner[-_ ]?scope|scope[-_ ]?of[-_ ]?work|scope[-_ ]?sheet|work[-_ ]?letter/],
  "exclusions-assumptions": [/exclusion|assumption|qualification|clarification/],
  msa: [/master[-_ ]?service|msa/],
  drawings: [/drawing|plan|sheet|a\d|e\d|m\d|p\d|civil/],
  specifications: [/specification|spec[-_ ]?section|project[-_ ]?manual/],
  addenda: [/addendum|addenda/],
  "rfi-log": [/rfi/],
  clarifications: [/clarification/],
  schedule: [/schedule|milestone|baseline|phasing/],
  insurance: [/insurance|coi|additional[-_ ]?insured/],
  bonding: [/bond|bonding|performance[-_ ]?bond|payment[-_ ]?bond/],
  safety: [/safety|site[-_ ]?requirement|osha/],
  wage: [/wage|davis|bacon|prevailing|certified[-_ ]?payroll/],
  "permit-ahj": [/permit|inspection|ahj|code|fire[-_ ]?marshal|city|county/],
  "prime-contract-excerpt": [/prime|owner[-_ ]?contract|flow[-_ ]?down/],
  budget: [/budget|allowance|cost[-_ ]?plan|owner[-_ ]?estimate/],
  "product-data": [/product[-_ ]?data|submittal|cut[-_ ]?sheet|manufacturer|spec[-_ ]?sheet/],
  other: [],
};

export function classifyUploadedFile(file: UploadedFile): DocumentClassification {
  const label = DOCUMENT_CLASSIFICATION_LABELS[file.documentId] ?? "Unknown";
  if (file.documentId === "other") {
    return { documentId: file.documentId, label, confidence: "Low", status: "Needs confirmation" };
  }

  const name = file.name.toLowerCase();
  const strongMatch = STRONG_CLASSIFICATION_TERMS[file.documentId]?.some((pattern) => pattern.test(name)) ?? false;
  return {
    documentId: file.documentId,
    label,
    confidence: strongMatch ? "High" : "Medium",
    status: strongMatch ? "Classified" : "Needs confirmation",
  };
}

export function classificationOptions(): Array<{ id: DocumentId; label: string }> {
  return DOCUMENT_CATALOG.map((document) => ({
    id: document.id,
    label: DOCUMENT_CLASSIFICATION_LABELS[document.id] ?? document.label,
  }));
}

export function classificationCounts(project: Project): { classified: number; needsConfirmation: number } {
  return project.uploadedFiles.reduce(
    (counts, file) => {
      const classification = classifyUploadedFile(file);
      if (classification.status === "Needs confirmation") counts.needsConfirmation += 1;
      else counts.classified += 1;
      return counts;
    },
    { classified: 0, needsConfirmation: 0 },
  );
}
