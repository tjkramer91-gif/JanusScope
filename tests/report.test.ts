import { describe, expect, it } from "vitest";
import { createEmptyProject } from "@/lib/catalogs";
import { createDemoProject } from "@/lib/demo-project";
import { buildHtmlReport, buildIssueLogCsv, buildTextReport } from "@/lib/report";
import { generateRiskReview } from "@/lib/risk-engine";
import { SYNTHETIC_REPORT_FOOTER } from "@/lib/synthetic-data";

describe("report builders", () => {
  it("includes the synthetic footer for approved demo reports", () => {
    const project = createDemoProject();
    const review = generateRiskReview(project);

    expect(buildTextReport(project, review)).toContain(SYNTHETIC_REPORT_FOOTER);
    expect(buildTextReport(project, review)).toContain("TOP 10 RISKS");
    expect(buildTextReport(project, review)).toContain("CONTRACT CONFLICTS");
    expect(buildHtmlReport(project, review)).toContain(SYNTHETIC_REPORT_FOOTER);
    expect(buildIssueLogCsv(review.issueLog, { syntheticDemo: true })).toContain(SYNTHETIC_REPORT_FOOTER);
  });

  it("does not claim user-entered projects are synthetic", () => {
    const project = createEmptyProject({
      name: "User Review Package",
      projectAddress: "Project address withheld",
      tradeType: "Electrical",
      gcName: "GC withheld",
      ownerName: "Owner withheld",
      subcontractText: "Bid scope is narrow and preserved in the subcontract.",
      bidText: "Proposal includes listed scope only.",
      documents: createEmptyProject().documents.map((document) => ({ ...document, available: true })),
    });
    const review = generateRiskReview(project);

    expect(buildTextReport(project, review)).not.toContain(SYNTHETIC_REPORT_FOOTER);
    expect(buildHtmlReport(project, review)).not.toContain(SYNTHETIC_REPORT_FOOTER);
  });
});
