import { describe, expect, it } from "vitest";
import { createEmptyProject } from "@/lib/catalogs";
import { buildSourceVerification } from "@/lib/source-verification";
import { createSyntheticDemoProfile, syntheticPriceFor } from "@/lib/synthetic-data";
import {
  SOURCE_VERIFICATION_SAMPLE_QUANTITIES,
  createSampleUploadedFiles,
  sourceVerificationSampleProjectInput,
  sourceVerificationSampleTextFields,
} from "@/lib/source-verification-sample";

const REVIEW_DATE = "2026-06-17T12:00:00.000Z";
const SAMPLE_PROFILE = createSyntheticDemoProfile("source-verification-sample");
const EXPECTED_BUDGET_GAP = (syntheticPriceFor("apartment-subpanel-upgrade", SAMPLE_PROFILE.seed, "sub-bid") -
  syntheticPriceFor("electrical-panel-replacement", SAMPLE_PROFILE.seed, "owner-budget")) *
  SOURCE_VERIFICATION_SAMPLE_QUANTITIES.subpanels;

function sampleProject() {
  const input = sourceVerificationSampleProjectInput();
  return createEmptyProject({
    ...input,
    ...sourceVerificationSampleTextFields(),
    id: "sample-source-verification",
    uploadedFiles: createSampleUploadedFiles(REVIEW_DATE),
    status: "report-ready",
  });
}

describe("buildSourceVerification", () => {
  it("produces source-backed findings for the sample review package", () => {
    const report = buildSourceVerification(sampleProject(), { now: REVIEW_DATE });

    expect(report.summary.documentsReviewed).toBe(6);
    expect(report.documentAudit.every((document) => document.includedInFinalReview)).toBe(true);
    expect(report.externalSourcesChecked).toHaveLength(2);
    expect(report.externalSourcesChecked[0]?.url).toContain("example.com");

    const pricing = report.findings.find((finding) => finding.id === "pricing-subpanel-budget-gap");
    expect(pricing?.sourceLocation).toContain("synthetic-owner-budget-electrical.csv row 2");
    expect(pricing?.sourceLocation).toContain("synthetic-subcontractor-bid-electrical.csv row 2");
    expect(pricing?.costOrScheduleImpact).toContain(
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(EXPECTED_BUDGET_GAP),
    );
    expect(pricing?.confidence).toBe("High");

    expect(report.findings.some((finding) => finding.id === "scope-conflict-permits-firestopping")).toBe(true);
    expect(report.findings.some((finding) => finding.id === "contract-overrides-bid-exclusions")).toBe(true);
    expect(report.contractRequirementReview.some((finding) => finding.id === "pay-if-paid")).toBe(true);
    expect(report.comparisonMatrix.some((row) => row.id === "budget-vs-bid" && row.status === "Conflict found")).toBe(true);
  });

  it("uses unable-to-verify language for missing documents and unsupported files", () => {
    const project = sampleProject();
    project.uploadedFiles.push({
      id: "pdf-1",
      name: "electrical-drawings.pdf",
      size: 1200,
      type: "application/pdf",
      documentId: "drawings",
      documentCategory: "Drawings",
      storagePath: "sample/electrical-drawings.pdf",
      processingStatus: "classified",
      extractionStatus: "unsupported",
      extractionMessage: "Stored and classified, but text extraction is not available for this file type yet.",
      reviewedSectionCount: 0,
      includedInReview: false,
      uploadedAt: REVIEW_DATE,
    });

    const report = buildSourceVerification(project, { now: REVIEW_DATE });

    expect(report.summary.documentsUnableToExtract).toBe(1);
    expect(report.missingInformation.some((item) => item.reason.includes("Unable to verify with the documents and sources currently available."))).toBe(true);
    expect(report.missingInformation.some((item) => item.item.includes("electrical-drawings.pdf"))).toBe(true);
  });
});
