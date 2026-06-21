import { describe, expect, it } from "vitest";
import { documentCategoryFor, extractUploadedFileText } from "@/lib/document-extraction";

describe("document extraction", () => {
  it("extracts CSV text and marks it as included in review", async () => {
    const file = new File(["item,quantity,unit_price\nApartment subpanel,124,2650"], "bid.csv", { type: "text/csv" });

    const extracted = await extractUploadedFileText(file, "bid-proposal");

    expect(extracted.extractionStatus).toBe("extracted");
    expect(extracted.documentCategory).toBe("Subcontractor bid");
    expect(extracted.reviewedSectionCount).toBe(1);
    expect(extracted.includedInReview).toBe(true);
    expect(extracted.extractedText).toContain("Apartment subpanel");
  });

  it("does not pretend unsupported files were text-reviewed", async () => {
    const file = new File(["%PDF-1.4"], "drawings.pdf", { type: "application/pdf" });

    const extracted = await extractUploadedFileText(file, "drawings");

    expect(extracted.extractionStatus).toBe("unsupported");
    expect(extracted.documentCategory).toBe("Drawings");
    expect(extracted.reviewedSectionCount).toBe(0);
    expect(extracted.includedInReview).toBe(false);
    expect(extracted.extractedText).toBe("");
  });

  it("classifies owner budgets and pricing references from filenames", () => {
    expect(documentCategoryFor("other", "synthetic-owner-budget-electrical.csv")).toBe("Budget");
    expect(documentCategoryFor("other", "synthetic-pricing-reference.csv")).toBe("Pricing reference");
  });
});
