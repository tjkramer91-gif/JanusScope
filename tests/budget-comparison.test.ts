import { describe, expect, it } from "vitest";
import { compareBudgets, type BudgetComparisonLineItemInput } from "@/lib/budget-comparison";

function item(input: Partial<BudgetComparisonLineItemInput> & { id: string; trade: BudgetComparisonLineItemInput["normalizedTrade"]; description: string; total: number }): BudgetComparisonLineItemInput {
  return {
    id: input.id,
    budgetId: input.budgetId ?? "budget",
    budgetVersionId: input.budgetVersionId ?? "version",
    rowNumber: input.rowNumber ?? 1,
    costCode: input.costCode ?? "",
    normalizedTrade: input.trade,
    normalizedScopeCategory: input.normalizedScopeCategory ?? input.trade,
    normalizedScopeSubcategory: input.normalizedScopeSubcategory ?? "",
    rawDescription: input.description,
    quantity: input.quantity ?? null,
    unitOfMeasure: input.unitOfMeasure ?? "",
    unitCost: input.unitCost ?? null,
    totalCost: input.total,
    isAllowance: input.isAllowance ?? false,
    confidenceScore: input.confidenceScore ?? 0.9,
    mappingStatus: input.mappingStatus ?? "mapped",
  };
}

describe("BudgetScope comparison engine", () => {
  it("calculates project, trade, line item, cost/SF, and cost/unit variance", () => {
    const report = compareBudgets({
      priorBudgetId: "prior",
      currentBudgetId: "current",
      priorBudgetVersionId: "prior-version",
      currentBudgetVersionId: "current-version",
      priorContext: { grossSquareFeet: 10000, rentableSquareFeet: 9000, unitCount: 50, buildingCount: 2 },
      currentContext: { grossSquareFeet: 10000, rentableSquareFeet: 9000, unitCount: 50, buildingCount: 2 },
      priorLineItems: [
        item({ id: "prior-electrical", trade: "Electrical", description: "Panel replacement", quantity: 10, unitOfMeasure: "EA", unitCost: 1900, total: 19000 }),
        item({ id: "prior-flooring", trade: "Flooring", description: "LVP replacement", quantity: 4000, unitOfMeasure: "SF", unitCost: 4, total: 16000 }),
      ],
      currentLineItems: [
        item({ id: "current-electrical", trade: "Electrical", description: "Panel replacement", quantity: 12, unitOfMeasure: "EA", unitCost: 2100, total: 25200 }),
        item({ id: "current-flooring", trade: "Flooring", description: "LVP replacement", quantity: 4000, unitOfMeasure: "SF", unitCost: 4, total: 16000 }),
      ],
    });

    expect(report.executiveSummary.priorTotalCost).toBe(35000);
    expect(report.executiveSummary.currentTotalCost).toBe(41200);
    expect(report.executiveSummary.totalProjectCostVariance).toBe(6200);
    expect(report.executiveSummary.totalProjectPercentVariance).toBe(17.71);
    expect(report.executiveSummary.currentCostPerGsf).toBe(4.12);
    expect(report.executiveSummary.currentCostPerUnit).toBe(824);
    expect(report.tradeSummaries[0]).toMatchObject({
      normalizedTrade: "Electrical",
      priorTotalCost: 19000,
      currentTotalCost: 25200,
      totalCostVariance: 6200,
    });
    expect(report.lineResults[0]).toMatchObject({
      normalizedTrade: "Electrical",
      quantityVariance: 2,
      quantityVariancePercent: 20,
      unitCostVariance: 200,
      totalCostVariance: 6200,
    });
  });

  it("flags new, missing, changed unit, and duplicate scope conditions", () => {
    const report = compareBudgets({
      priorBudgetId: "prior",
      currentBudgetId: "current",
      priorBudgetVersionId: null,
      currentBudgetVersionId: null,
      priorContext: { grossSquareFeet: null, rentableSquareFeet: null, unitCount: null, buildingCount: null },
      currentContext: { grossSquareFeet: null, rentableSquareFeet: null, unitCount: null, buildingCount: null },
      priorLineItems: [
        item({ id: "prior-door", trade: "Doors/Hardware", description: "Interior door replacement", quantity: 10, unitOfMeasure: "EA", unitCost: 400, total: 4000 }),
        item({ id: "prior-roof", trade: "Roofing", description: "Roof repair allowance", total: 10000, isAllowance: true }),
      ],
      currentLineItems: [
        item({ id: "current-door", trade: "Doors/Hardware", description: "Interior door replacement", quantity: 10, unitOfMeasure: "LS", unitCost: 4500, total: 4500 }),
        item({ id: "current-paint", trade: "Paint", description: "Common area paint", quantity: 2000, unitOfMeasure: "SF", unitCost: 2, total: 4000 }),
        item({ id: "current-window", trade: "Windows", description: "Window replacement", quantity: 20, unitOfMeasure: "EA", unitCost: 800, total: 16000 }),
        item({ id: "current-window-duplicate", trade: "Windows", description: "Window replacement", quantity: 20, unitOfMeasure: "EA", unitCost: 800, total: 16000 }),
      ],
    });

    expect(report.lineResults.map((line) => line.riskFlag)).toEqual(expect.arrayContaining([
      "changed_unit_of_measure",
      "new_current_line_item",
      "missing_prior_line_item",
      "possible_duplicate_line_item",
    ]));
    expect(report.newScope.length).toBeGreaterThan(0);
    expect(report.missingScope.length).toBeGreaterThan(0);
    expect(report.changedUnits.length).toBe(1);
  });
});
