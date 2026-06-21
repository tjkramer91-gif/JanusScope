import { describe, expect, it } from "vitest";
import { createDemoProject } from "@/lib/demo-project";
import { buildProjectIntelligenceGraph } from "@/lib/intelligence-graph";
import { generateRiskReview } from "@/lib/risk-engine";

const REVIEW_DATE = new Date("2026-06-13T12:00:00-07:00");

describe("buildProjectIntelligenceGraph", () => {
  it("turns a risk review into connected memory nodes and links", () => {
    const project = createDemoProject();
    const review = generateRiskReview(project, REVIEW_DATE);
    const graph = buildProjectIntelligenceGraph(project, review);

    expect(graph.projectId).toBe(project.id);
    expect(graph.nodes.some((node) => node.id === "gc:example-builders-llc")).toBe(true);
    expect(graph.nodes.some((node) => node.id === "trade:electrical")).toBe(true);
    expect(graph.nodes.some((node) => node.type === "risk-category")).toBe(true);
    expect(graph.edges.some((edge) => edge.type === "flags")).toBe(true);
    expect(graph.signals.some((signal) => signal.id === "signal:gc-pattern")).toBe(true);
  });

  it("uses saved graph history to identify emerging repeat patterns", () => {
    const firstProject = createDemoProject();
    const firstReview = generateRiskReview(firstProject, REVIEW_DATE);
    const firstGraph = buildProjectIntelligenceGraph(firstProject, firstReview);

    const secondProject = {
      ...createDemoProject(),
      id: "demo-subscope-risk-review-2",
      name: "Harbor Flats Renovation - Follow-up Review",
    };
    const secondReview = generateRiskReview(secondProject, REVIEW_DATE);
    const secondGraph = buildProjectIntelligenceGraph(secondProject, secondReview, [firstGraph]);
    const gcSignal = secondGraph.signals.find((signal) => signal.id === "signal:gc-pattern");

    expect(gcSignal?.evidenceCount).toBe(2);
    expect(gcSignal?.confidence).toBe("emerging");
    expect(secondGraph.edges.some((edge) => edge.type === "repeats-with")).toBe(true);
  });
});
