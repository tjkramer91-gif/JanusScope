import { documentCategoryFor } from "@/lib/document-extraction";
import {
  SYNTHETIC_STORAGE_PREFIX,
  createSyntheticDemoProfile,
  syntheticDatasetApprovalNote,
  syntheticPriceFor,
} from "@/lib/synthetic-data";
import type { DocumentId, Project, UploadedFile } from "@/lib/types";

export interface SourceVerificationSampleDocument {
  name: string;
  type: string;
  documentId: DocumentId;
  content: string;
}

const SAMPLE_PROFILE = createSyntheticDemoProfile("source-verification-sample");
export const SOURCE_VERIFICATION_SAMPLE_QUANTITIES = {
  subpanels: 124,
  firestopping: 124,
} as const;
const SUBPANEL_QUANTITY = SOURCE_VERIFICATION_SAMPLE_QUANTITIES.subpanels;
const FIRESTOPPING_QUANTITY = SOURCE_VERIFICATION_SAMPLE_QUANTITIES.firestopping;
const OWNER_BUDGET_SUBPANEL_PRICE = syntheticPriceFor("electrical-panel-replacement", SAMPLE_PROFILE.seed, "owner-budget");
const SUBCONTRACTOR_BID_SUBPANEL_PRICE = syntheticPriceFor("apartment-subpanel-upgrade", SAMPLE_PROFILE.seed, "sub-bid");
const FIRESTOPPING_PRICE = syntheticPriceFor("firestopping-penetration", SAMPLE_PROFILE.seed, "firestopping");
const AHJ_LABEL = `${SAMPLE_PROFILE.city} Building Department`;

export const SOURCE_VERIFICATION_SAMPLE_DOCUMENTS: SourceVerificationSampleDocument[] = [
  {
    name: "synthetic-owner-budget-electrical.csv",
    type: "text/csv",
    documentId: "other",
    content: [
      "section,item,quantity,unit,unit_price,total,note",
      `Electrical,Apartment subpanel,${SUBPANEL_QUANTITY},each,${OWNER_BUDGET_SUBPANEL_PRICE},${SUBPANEL_QUANTITY * OWNER_BUDGET_SUBPANEL_PRICE},Synthetic owner budget allowance for apartment subpanels`,
      `Electrical,Firestopping,${FIRESTOPPING_QUANTITY},each,${FIRESTOPPING_PRICE},${FIRESTOPPING_QUANTITY * FIRESTOPPING_PRICE},Synthetic owner scope includes firestopping at electrical penetrations`,
    ].join("\n"),
  },
  {
    name: "synthetic-subcontractor-bid-electrical.csv",
    type: "text/csv",
    documentId: "bid-proposal",
    content: [
      "section,item,quantity,unit,unit_price,total,note",
      `Electrical,Apartment subpanel,${SUBPANEL_QUANTITY},each,${SUBCONTRACTOR_BID_SUBPANEL_PRICE},${SUBPANEL_QUANTITY * SUBCONTRACTOR_BID_SUBPANEL_PRICE},Includes upgraded panels feeders grounding meter packs; excludes permits and utility coordination`,
      "Electrical,Firestopping,0,allowance,0,0,Excluded by subcontractor bid",
    ].join("\n"),
  },
  {
    name: "synthetic-owner-scope-electrical.csv",
    type: "text/csv",
    documentId: "scope-letter",
    content: [
      "section,scope_note",
      "Electrical,Provide upgraded apartment subpanels feeders grounding meter packs permits utility coordination and firestopping for occupied rehab units",
    ].join("\n"),
  },
  {
    name: "synthetic-contract-language.csv",
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
    name: "synthetic-ahj-source.csv",
    type: "text/csv",
    documentId: "permit-ahj",
    content: [
      "source,fact",
      `${AHJ_LABEL} Permit and Plan Review,Synthetic sample source states that permit scope adopted code basis and inspection sequencing must be confirmed before work starts.`,
      `${AHJ_LABEL} Construction Inspections,Synthetic sample source states that inspections should be requested before concealed work is covered.`,
    ].join("\n"),
  },
  {
    name: "synthetic-pricing-reference.csv",
    type: "text/csv",
    documentId: "other",
    content: [
      "source,item,unit_price,note",
      `Synthetic pricing engine reference,Apartment subpanel,${syntheticPriceFor("apartment-subpanel-upgrade", SAMPLE_PROFILE.seed, "reference")},Synthetic reasonableness reference only; not an external market quote`,
    ].join("\n"),
  },
];

export function sourceVerificationSampleProjectInput(): Omit<
  Project,
  | "id"
  | "organizationId"
  | "companyId"
  | "userId"
  | "region"
  | "assetType"
  | "renovationOrNew"
  | "unitCount"
  | "grossSquareFeet"
  | "rentableSquareFeet"
  | "buildingCount"
  | "fundingType"
  | "currentPhase"
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
  | "allowedForAnonymizedLearning"
  | "deleteDocumentsAfterReport"
  | "excludedFromBenchmarking"
  | "consentStatus"
  | "createdAt"
  | "updatedAt"
> {
  return {
    name: `${SAMPLE_PROFILE.projectName} source-backed sample`,
    projectAddress: SAMPLE_PROFILE.projectAddress,
    city: SAMPLE_PROFILE.city,
    state: SAMPLE_PROFILE.state,
    zip: SAMPLE_PROFILE.zip,
    tradeType: "Electrical",
    gcName: SAMPLE_PROFILE.gcName,
    ownerName: SAMPLE_PROFILE.ownerName,
    contractAmount: SAMPLE_PROFILE.contractAmount,
    bidDate: SAMPLE_PROFILE.bidDate,
    executionDeadline: SAMPLE_PROFILE.executionDeadline,
    hasMasterServiceAgreement: "not-sure",
    publicOrPrivate: "private",
    prevailingWageStatus: "not-sure",
    projectType: "multifamily",
  };
}

export function sourceVerificationSampleTextFields(): Pick<Project, "subcontractText" | "bidText" | "exclusionsText" | "notesText"> {
  return {
    subcontractText:
      "Payment is due only after owner payment. Proposal exclusions are superseded unless expressly preserved in the subcontract.",
    bidText:
      `Electrical bid includes apartment subpanels at $${SUBCONTRACTOR_BID_SUBPANEL_PRICE.toLocaleString("en-US")} each. Bid note excludes permits, utility coordination, and firestopping.`,
    exclusionsText: "Permits, utility coordination, and firestopping are excluded unless added by written change order.",
    notesText:
      `${syntheticDatasetApprovalNote(SAMPLE_PROFILE.seed, "Source-backed sample review")} Sample package intentionally omits drawings and specifications so the report can show Unable to verify items.`,
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
      storagePath: `${SYNTHETIC_STORAGE_PREFIX}/${document.name}`,
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
