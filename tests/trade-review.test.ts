import { describe, expect, it } from "vitest";
import { createEmptyProject } from "@/lib/catalogs";
import { buildPrioritizedReport } from "@/lib/prioritized-report";
import { generateRiskReview } from "@/lib/risk-engine";
import { buildSourceVerification } from "@/lib/source-verification";
import { createSampleUploadedFiles, sourceVerificationSampleProjectInput } from "@/lib/source-verification-sample";
import { detectTradeScope } from "@/lib/trade-detector";
import { buildTradeSpecificReview, tradeModuleStatus } from "@/lib/trade-review";

describe("trade routing and priority output", () => {
  it("detects electrical scope and applies the electrical review module", () => {
    const project = createEmptyProject({
      ...sourceVerificationSampleProjectInput(),
      uploadedFiles: createSampleUploadedFiles("2026-06-17T00:00:00.000Z"),
      notesText: "Focus on panel replacements, permits, and utility coordination.",
    });

    const detected = detectTradeScope(project);
    const findings = buildTradeSpecificReview(project, detected);

    expect(detected.trade).toBe("Electrical");
    expect(detected.confidence).toBe("High");
    expect(tradeModuleStatus(detected.trade)).toBe("Electrical module applied");
    expect(findings.some((finding) => finding.title.includes("permit"))).toBe(true);
  });

  it("detects window scope and avoids unrelated electrical review", () => {
    const project = createEmptyProject({
      name: "Window replacement package",
      tradeType: "",
      notesText: "Focus on windows, flashing, sill pans, egress, U-factor, SHGC, unit access, and resident protection.",
      uploadedFiles: [
        {
          id: "window-bid",
          name: "window-bid.csv",
          size: 100,
          type: "text/csv",
          documentId: "bid-proposal",
          storagePath: "test/window-bid.csv",
          processingStatus: "classified",
          extractionStatus: "extracted",
          extractedText: "item,note\nWindows,Flashing sill pans egress U-factor SHGC occupied unit access",
          reviewedSectionCount: 1,
          includedInReview: true,
          uploadedAt: "2026-06-17T00:00:00.000Z",
        },
      ],
    });

    const detected = detectTradeScope(project);
    const findings = buildTradeSpecificReview(project, detected);

    expect(detected.trade).toBe("Windows");
    expect(tradeModuleStatus(detected.trade)).toBe("Window module applied");
    expect(findings.every((finding) => finding.trade === "Windows")).toBe(true);
  });

  it("puts source-backed and trade-specific misses into top risks", () => {
    const project = createEmptyProject({
      ...sourceVerificationSampleProjectInput(),
      uploadedFiles: createSampleUploadedFiles("2026-06-17T00:00:00.000Z"),
      notesText: "Review focus: Review everything",
    });
    const review = generateRiskReview(project);
    const sourceVerification = buildSourceVerification(project, { now: "2026-06-17T00:00:00.000Z" });
    const detectedTrade = detectTradeScope(project);
    const tradeFindings = buildTradeSpecificReview(project, detectedTrade);

    const prioritized = buildPrioritizedReport({ review, sourceVerification, detectedTrade, tradeFindings });

    expect(prioritized.topRisks.length).toBeGreaterThan(0);
    expect(prioritized.biggestCostMisses.some((finding) => finding.title.includes("subpanel"))).toBe(true);
    expect(prioritized.contractTraps.length).toBeGreaterThan(0);
  });
});
