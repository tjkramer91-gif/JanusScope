import { describe, expect, it } from "vitest";
import { createEmptyProject } from "@/lib/catalogs";
import { createDemoProject } from "@/lib/demo-project";
import { generateRiskReview } from "@/lib/risk-engine";

const REVIEW_DATE = new Date("2026-06-13T12:00:00-07:00");

describe("generateRiskReview", () => {
  it("rates the demo subcontract review as severe with direct bid conflicts", () => {
    const review = generateRiskReview(createDemoProject(), REVIEW_DATE);

    expect(review.overallRating).toBe("critical");
    expect(review.score).toBeGreaterThanOrEqual(76);
    expect(review.finalRecommendation).toBe("Attorney review recommended before signing");
    expect(review.comparisons.some((item) => item.item.includes("Permits"))).toBe(true);
    expect(review.comparisons.some((item) => item.item.includes("Engineering"))).toBe(true);
    expect(review.comparisons.some((item) => item.item.includes("Overtime"))).toBe(true);
    expect(review.hiddenScopeFlags.some((item) => item.contractLanguage.includes("reasonably inferable"))).toBe(true);
    expect(review.issueLog.length).toBeGreaterThan(0);
  });

  it("keeps a complete narrow subcontract review low risk", () => {
    const project = createEmptyProject();
    project.name = "Clean Limited Scope";
    project.projectAddress = "Phoenix, AZ";
    project.tradeType = "Painting";
    project.gcName = "Example GC";
    project.contractAmount = 85000;
    project.documents = project.documents.map((document) => ({ ...document, available: true }));
    project.subcontractText =
      "Subcontractor proposal dated 2026-06-01 is incorporated and controls over conflicting scope language. Scope is limited to painting listed rooms during standard working hours. Change orders require written approval and are paid by agreed price.";
    project.bidText = "Proposal includes painting listed rooms during standard working hours.";
    project.exclusionsText = "";

    const review = generateRiskReview(project, REVIEW_DATE);

    expect(review.overallRating).toBe("low");
    expect(review.score).toBeLessThan(26);
    expect(review.missingDocuments).toHaveLength(0);
    expect(review.comparisons).toHaveLength(0);
  });

  it("flags pay-if-paid language and missing prime contract excerpts", () => {
    const project = createEmptyProject();
    project.documents = project.documents.map((document) => ({
      ...document,
      available: ["gc-subcontract", "bid-proposal", "exclusions-assumptions"].includes(document.id),
    }));
    project.subcontractText =
      "Payment by owner is a condition precedent. This subcontract incorporates the prime contract by reference.";
    project.bidText = "Bid includes listed scope only.";

    const review = generateRiskReview(project, REVIEW_DATE);

    expect(review.flags.some((flag) => flag.issue.includes("Pay-if-paid"))).toBe(true);
    expect(review.missingDocuments.some((item) => item.document === "Full prime contract excerpts")).toBe(true);
    expect(review.overallRating).toBe("critical");
  });

  it("raises labor and wage risk for public projects without wage documents", () => {
    const project = createEmptyProject();
    project.projectType = "public-works";
    project.publicOrPrivate = "public";
    project.documents = project.documents.map((document) => ({
      ...document,
      available: document.id !== "wage",
    }));
    project.subcontractText = "Subcontractor shall comply with certified payroll and labor compliance requirements.";
    project.bidText = "Proposal includes listed public project scope.";

    const review = generateRiskReview(project, REVIEW_DATE);

    expect(review.missingDocuments.some((item) => item.document.includes("Wage determination"))).toBe(true);
    expect(review.flags.some((flag) => flag.category === "labor-wage")).toBe(true);
    expect(["high", "critical"]).toContain(review.categoryRatings["labor-wage"]);
  });
});
