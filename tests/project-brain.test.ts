import { describe, expect, it } from "vitest";
import { createEmptyProject } from "@/lib/catalogs";
import { buildProjectBrain } from "@/lib/project-brain";
import { generateRiskReview } from "@/lib/risk-engine";

describe("Project Brain", () => {
  it("shows project metadata and empty states without crashing", () => {
    const project = createEmptyProject({
      name: "Harbor Flats Renovation",
      city: "Example City",
      state: "ST",
      region: "Southwest",
      projectType: "affordable-housing",
      assetType: "Multifamily",
      renovationOrNew: "renovation",
      unitCount: 120,
      grossSquareFeet: 96000,
      buildingCount: 4,
      fundingType: "LIHTC",
      currentPhase: "Preconstruction",
    });
    const brain = buildProjectBrain(project, null, generateRiskReview(project));

    expect(brain.profile).toContainEqual({ label: "Project name", value: "Harbor Flats Renovation" });
    expect(brain.profile).toContainEqual({ label: "Region", value: "Southwest" });
    expect(brain.profile).toContainEqual({ label: "Unit count", value: "120" });
    expect(brain.knownScope.length).toBeGreaterThan(0);
    expect(brain.decisions).toContain("Project excluded from benchmarking.");
  });

  it("uses stored project memory summaries when available", () => {
    const project = createEmptyProject({ name: "Cedar Ridge Apartments", tradeType: "Electrical" });
    const brain = buildProjectBrain(
      project,
      {
        id: "memory_1",
        projectId: project.id,
        projectProfileSummary: "Cedar Ridge Apartments; affordable housing.",
        knownScopeSummary: "Electrical panels | Devices | Testing",
        pricingMemorySummary: "Panel replacement carried as allowance",
        contractMemorySummary: "Permit responsibility unclear",
        openQuestionsSummary: "Who carries patchback? | Are inspections included?",
        topRisksSummary: "High: Permit responsibility unclear",
        decisionsSummary: "Project excluded from benchmarking.",
        lessonsLearnedSummary: "Verify occupied-unit access earlier.",
        lastUpdatedAt: "2026-06-22T12:00:00.000Z",
      },
      generateRiskReview(project),
    );

    expect(brain.knownScope).toEqual(["Electrical panels", "Devices", "Testing"]);
    expect(brain.openQuestions).toContain("Who carries patchback?");
    expect(brain.lessonsLearned).toEqual(["Verify occupied-unit access earlier."]);
  });
});
