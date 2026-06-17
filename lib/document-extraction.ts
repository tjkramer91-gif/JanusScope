import type { DocumentId, TextExtractionStatus, UploadedFile, VerificationDocumentCategory } from "@/lib/types";

export interface ExtractedDocumentDetails {
  documentCategory: VerificationDocumentCategory;
  extractionStatus: TextExtractionStatus;
  extractionMessage: string;
  extractedText: string;
  reviewedSectionCount: number;
  includedInReview: boolean;
}

const MAX_EXTRACTED_TEXT_LENGTH = 40_000;

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
}

function normalizeExtractedText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().slice(0, MAX_EXTRACTED_TEXT_LENGTH);
}

function countSections(text: string, extension: string): number {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (extension === ".csv") return Math.max(0, lines.length - 1);
  return lines.length;
}

export function documentCategoryFor(documentId: DocumentId, fileName: string): VerificationDocumentCategory {
  const name = fileName.toLowerCase();
  if (/(budget|allowance|owner[-_ ]?estimate|cost[-_ ]?plan)/.test(name)) return "Budget";
  if (/(pricing|price[-_ ]?reference|cost[-_ ]?reference|historical)/.test(name)) return "Pricing reference";

  switch (documentId) {
    case "bid-proposal":
      return "Subcontractor bid";
    case "scope-letter":
      return "Owner scope";
    case "gc-subcontract":
    case "prime-contract-excerpt":
    case "msa":
      return "Contract";
    case "drawings":
      return "Drawings";
    case "specifications":
      return "Specifications";
    case "addenda":
    case "rfi-log":
    case "clarifications":
      return "Addenda / RFI";
    case "schedule":
      return "Schedule";
    case "insurance":
    case "bonding":
      return "Insurance / Bonding";
    case "safety":
      return "Safety";
    case "wage":
      return "Wage";
    case "permit-ahj":
      return "AHJ source";
    case "budget":
      return "Budget";
    case "product-data":
      return "Product data / submittal";
    case "exclusions-assumptions":
      return "Exclusions and assumptions";
    default:
      return "Other";
  }
}

export async function extractUploadedFileText(file: File, documentId: UploadedFile["documentId"]): Promise<ExtractedDocumentDetails> {
  const extension = fileExtension(file.name);
  const documentCategory = documentCategoryFor(documentId, file.name);
  const isTextLike =
    extension === ".csv" ||
    file.type === "text/csv" ||
    file.type === "application/csv" ||
    file.type === "application/vnd.ms-excel";

  if (!isTextLike) {
    return {
      documentCategory,
      extractionStatus: "unsupported",
      extractionMessage: "Stored and classified, but text extraction is not available for this file type yet.",
      extractedText: "",
      reviewedSectionCount: 0,
      includedInReview: false,
    };
  }

  try {
    const extractedText = normalizeExtractedText(await file.text());
    if (!extractedText) {
      return {
        documentCategory,
        extractionStatus: "failed",
        extractionMessage: "No readable text was found in this file.",
        extractedText: "",
        reviewedSectionCount: 0,
        includedInReview: false,
      };
    }

    return {
      documentCategory,
      extractionStatus: "extracted",
      extractionMessage: "CSV text extracted and available for source-backed review.",
      extractedText,
      reviewedSectionCount: countSections(extractedText, extension),
      includedInReview: true,
    };
  } catch {
    return {
      documentCategory,
      extractionStatus: "failed",
      extractionMessage: "Text extraction failed for this file.",
      extractedText: "",
      reviewedSectionCount: 0,
      includedInReview: false,
    };
  }
}
