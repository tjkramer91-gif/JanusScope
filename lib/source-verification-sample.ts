import { documentCategoryFor } from "@/lib/document-extraction";
import type { DocumentId, Project, UploadedFile } from "@/lib/types";

export interface SourceVerificationSampleDocument {
  name: string;
  type: string;
  documentId: DocumentId;
  content: string;
}

export const SOURCE_VERIFICATION_SAMPLE_DOCUMENTS: SourceVerificationSampleDocument[] = [
  {
    name: "owner-budget-electrical.csv",
    type: "text/csv",
    documentId: "other",
    content: [
      "section,item,quantity,unit,unit_price,total,note",
      "Electrical,Apartment subpanel,124,each,1700,210800,Owner budget allowance for apartment subpanels",
      "Electrical,Firestopping,124,each,185,22940,Owner scope includes firestopping at electrical penetrations",
    ].join("\n"),
  },
  {
    name: "subcontractor-bid-electrical.csv",
    type: "text/csv",
    documentId: "bid-proposal",
    content: [
      "section,item,quantity,unit,unit_price,total,note",
      "Electrical,Apartment subpanel,124,each,2650,328600,Includes upgraded panels feeders grounding meter packs; excludes permits and utility coordination",
      "Electrical,Firestopping,0,allowance,0,0,Excluded by subcontractor bid",
    ].join("\n"),
  },
  {
    name: "owner-scope-electrical.csv",
    type: "text/csv",
    documentId: "scope-letter",
    content: [
      "section,scope_note",
      "Electrical,Provide upgraded apartment subpanels feeders grounding meter packs permits utility coordination and firestopping for occupied rehab units",
    ].join("\n"),
  },
  {
    name: "gc-subcontract-language.csv",
    type: "text/csv",
    documentId: "gc-subcontract",
    content: [
      "clause_title,clause",
      "Pay-if-paid,Payment to Subcontractor is a condition precedent and only due after Contractor receives payment from Owner.",
      "Flow-down,Subcontractor assumes toward Contractor all obligations Contractor assumes toward Owner under the prime contract.",
      "Exclusions overridden,Subcontractor proposal exclusions are superseded by this subcontract and incorporated documents unless expressly listed in this agreement.",
      "Change order notice,No extra work is payable without written authorization before the work proceeds.",
    ].join("\n"),
  },
  {
    name: "mesa-ahj-source.csv",
    type: "text/csv",
    documentId: "permit-ahj",
    content: [
      "source,fact",
      "City of Mesa Building Permit and Plan Review,Mesa adopted the 2024 ICC family of codes and 2023 NEC; project-specific permit requirements must be confirmed with Development Services.",
      "City of Mesa Construction Inspections,Permits are not complete until required inspections are conducted and construction is approved.",
    ].join("\n"),
  },
  {
    name: "sample-pricing-reference.csv",
    type: "text/csv",
    documentId: "other",
    content: [
      "source,item,unit_price,note",
      "Internal historical buyout reference,Apartment subpanel,2400,Sample reference for reasonableness only; not an external market quote",
    ].join("\n"),
  },
];

export function sourceVerificationSampleProjectInput(): Omit<
  Project,
  | "id"
  | "organizationId"
  | "userId"
  | "documents"
  | "uploadedFiles"
  | "intakeAnswers"
  | "subcontractText"
  | "bidText"
  | "exclusionsText"
  | "notesText"
  | "status"
  | "riskScore"
  | "riskLevel"
  | "deleteDocumentsAfterReport"
  | "createdAt"
  | "updatedAt"
> {
  return {
    name: "Source-backed review sample",
    projectAddress: "55 W Main St",
    city: "Mesa",
    state: "AZ",
    zip: "85201",
    tradeType: "Electrical",
    gcName: "Sample GC",
    ownerName: "Sample Owner",
    contractAmount: 525000,
    bidDate: "2026-06-01",
    executionDeadline: "2026-06-30",
    hasMasterServiceAgreement: "not-sure",
    publicOrPrivate: "private",
    prevailingWageStatus: "not-sure",
    projectType: "affordable-housing",
  };
}

export function sourceVerificationSampleTextFields(): Pick<Project, "subcontractText" | "bidText" | "exclusionsText" | "notesText"> {
  return {
    subcontractText:
      "Payment is due only after owner payment. Proposal exclusions are superseded unless expressly preserved in the subcontract.",
    bidText:
      "Electrical bid includes apartment subpanels at $2,650 each. Bid note excludes permits, utility coordination, and firestopping.",
    exclusionsText: "Permits, utility coordination, and firestopping are excluded unless added by written change order.",
    notesText:
      "Sample package intentionally omits drawings and specifications so the report can show Unable to verify items.",
  };
}

export function createSampleUploadedFiles(uploadedAt = new Date().toISOString()): UploadedFile[] {
  return SOURCE_VERIFICATION_SAMPLE_DOCUMENTS.map((document, index) => {
    const reviewedSectionCount = Math.max(0, document.content.split("\n").filter(Boolean).length - 1);
    return {
      id: `sample-doc-${index + 1}`,
      name: document.name,
      size: Buffer.byteLength(document.content, "utf8"),
      type: document.type,
      documentId: document.documentId,
      documentCategory: documentCategoryFor(document.documentId, document.name),
      storagePath: `sample/${document.name}`,
      processingStatus: "classified",
      extractionStatus: "extracted",
      extractionMessage: "CSV text extracted and available for source-backed review.",
      extractedText: document.content,
      reviewedSectionCount,
      includedInReview: true,
      uploadedAt,
    };
  });
}
