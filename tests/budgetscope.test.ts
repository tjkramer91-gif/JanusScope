import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeBudgetTrade, parseBudgetCsv } from "@/lib/budgetscope";
import { createEmptyProject } from "@/lib/catalogs";

const tempDirs: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("BudgetScope CSV parser", () => {
  it("auto-detects common budget columns and normalizes trades", () => {
    const parsed = parseBudgetCsv(`Cost Code,Trade,Description,Qty,UOM,Unit Cost,Total Cost,Allowance,Notes
26-001,Electrical,Panel replacement,12,EA,1950,23400,Yes,Confirm grounding
09-001,Flooring,LVP replacement,4000,SF,4.25,17000,,Occupied units`);

    expect(parsed.lineItems).toHaveLength(2);
    expect(parsed.mapping.totalCost).toBe("Total Cost");
    expect(parsed.lineItems[0]).toMatchObject({
      costCode: "26-001",
      rawTrade: "Electrical",
      normalizedTrade: "Electrical",
      rawDescription: "Panel replacement",
      quantity: 12,
      unitOfMeasure: "EA",
      unitCost: 1950,
      totalCost: 23400,
      isAllowance: true,
      mappingStatus: "mapped",
    });
    expect(parsed.lineItems[1].normalizedTrade).toBe("Flooring");
  });

  it("allows manual mapping for custom exported headers", () => {
    const parsed = parseBudgetCsv(
      `Code,Scope Bucket,Work Item,Count,Unit,Each,Extended,Clarification
08-001,Openings,Window replacement,50,EA,875,43750,Verify blinds`,
      {
        costCode: "Code",
        trade: "Scope Bucket",
        description: "Work Item",
        quantity: "Count",
        unitOfMeasure: "Unit",
        unitCost: "Each",
        totalCost: "Extended",
        notes: "Clarification",
      },
    );

    expect(parsed.lineItems[0]).toMatchObject({
      costCode: "08-001",
      normalizedTrade: "Windows",
      rawDescription: "Window replacement",
      totalCost: 43750,
      notes: "Verify blinds",
    });
  });

  it("returns friendly validation errors for unusable CSV files", () => {
    expect(() => parseBudgetCsv("Only Header")).toThrow("Budget CSV needs a header row and at least one line item.");
    expect(() => parseBudgetCsv("Mystery\nValue")).toThrow("Map at least a description or total cost column before saving BudgetScope line items.");
  });

  it("uses Other/Unmapped when a trade cannot be inferred", () => {
    expect(normalizeBudgetTrade("", "General Conditions")).toBe("General Conditions");
    expect(normalizeBudgetTrade("Unclear", "Miscellaneous owner request")).toBe("Other/Unmapped");
  });

  it("saves parsed budget line items to the local database store", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-budgetscope-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    const user = {
      id: "demo-user",
      auth0UserId: "demo|subscope",
      email: "demo@januscope.local",
      name: "Demo Reviewer",
    };
    const workspace = await store.ensureWorkspace(user);
    const project = createEmptyProject({
      id: "project_budgetscope_test",
      organizationId: workspace.organizationId,
      companyId: workspace.companyId,
      userId: workspace.userId,
      name: "Harbor Flats Renovation",
      city: "Example City",
      state: "ST",
    });
    const parsed = parseBudgetCsv(`Trade,Description,Qty,UOM,Unit Cost,Total Cost
Electrical,Panel replacement,12,EA,1950,23400`);

    const result = await store.saveBudgetScopeImport(user, project, {
      budgetName: "Harbor Flats Renovation Budget",
      budgetVersion: "Initial import",
      budgetType: "budget",
      sourceType: "budget",
      city: project.city,
      state: project.state,
      region: project.region,
      projectType: project.projectType,
      assetType: project.assetType,
      renovationOrNew: project.renovationOrNew,
      estimateDate: null,
      grossSquareFeet: project.grossSquareFeet,
      rentableSquareFeet: project.rentableSquareFeet,
      unitCount: project.unitCount,
      buildingCount: project.buildingCount,
      fundingType: project.fundingType,
      occupiedOrVacant: "unknown",
      sourceFileId: null,
      consentStatus: project.consentStatus,
      lineItems: parsed.lineItems,
    });

    expect(result.lineItemCount).toBe(1);
    const db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.budgets).toHaveLength(1);
    expect(db.budgetVersions).toHaveLength(1);
    expect(db.budgetLineItems).toHaveLength(1);
    expect(db.budgetLineItems[0]).toMatchObject({
      normalizedTrade: "Electrical",
      totalCost: 23400,
      mappingStatus: "mapped",
    });
  });

  it("saves budget comparison records and updates Project Brain in the local store", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-budgetscope-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    const user = {
      id: "demo-user",
      auth0UserId: "demo|subscope",
      email: "demo@januscope.local",
      name: "Demo Reviewer",
    };
    const workspace = await store.ensureWorkspace(user);
    void workspace;
    const createdProject = await store.createProject(user, {
      name: "Cedar Ridge Apartments",
      projectAddress: "",
      city: "Example City",
      state: "ST",
      zip: "",
      tradeType: "",
      gcName: "",
      ownerName: "",
      contractAmount: null,
      bidDate: "",
      executionDeadline: "",
      hasMasterServiceAgreement: "not-sure",
      publicOrPrivate: "not-sure",
      prevailingWageStatus: "not-sure",
      projectType: "multifamily",
    });
    const project = await store.saveProject(user, {
      ...createdProject,
      grossSquareFeet: 10000,
      unitCount: 50,
    }, "test.project.updated");
    const prior = parseBudgetCsv(`Trade,Description,Qty,UOM,Unit Cost,Total Cost
Electrical,Panel replacement,10,EA,1900,19000`);
    const current = parseBudgetCsv(`Trade,Description,Qty,UOM,Unit Cost,Total Cost
Electrical,Panel replacement,12,EA,2100,25200`);

    const priorResult = await store.saveBudgetScopeImport(user, project, {
      budgetName: "Prior Budget",
      budgetVersion: "Prior",
      budgetType: "budget",
      sourceType: "budget",
      city: project.city,
      state: project.state,
      region: project.region,
      projectType: project.projectType,
      assetType: project.assetType,
      renovationOrNew: project.renovationOrNew,
      estimateDate: null,
      grossSquareFeet: project.grossSquareFeet,
      rentableSquareFeet: project.rentableSquareFeet,
      unitCount: project.unitCount,
      buildingCount: project.buildingCount,
      fundingType: project.fundingType,
      occupiedOrVacant: "unknown",
      sourceFileId: null,
      consentStatus: project.consentStatus,
      lineItems: prior.lineItems,
    });
    const currentResult = await store.saveBudgetScopeImport(user, project, {
      budgetName: "Current Budget",
      budgetVersion: "Current",
      budgetType: "budget",
      sourceType: "budget",
      city: project.city,
      state: project.state,
      region: project.region,
      projectType: project.projectType,
      assetType: project.assetType,
      renovationOrNew: project.renovationOrNew,
      estimateDate: null,
      grossSquareFeet: project.grossSquareFeet,
      rentableSquareFeet: project.rentableSquareFeet,
      unitCount: project.unitCount,
      buildingCount: project.buildingCount,
      fundingType: project.fundingType,
      occupiedOrVacant: "unknown",
      sourceFileId: null,
      consentStatus: project.consentStatus,
      lineItems: current.lineItems,
    });

    const comparison = await store.saveBudgetComparison(user, project.id, {
      currentBudgetId: currentResult.budget.id,
      priorBudgetId: priorResult.budget.id,
      comparisonName: "Current vs Prior",
      comparisonType: "budget-to-budget",
    });

    expect(comparison.report.executiveSummary.totalProjectCostVariance).toBe(6200);
    const db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.budgetComparisons).toHaveLength(1);
    expect(db.budgetComparisonResults).toHaveLength(1);
    expect(db.projectMemory[0].pricingMemorySummary).toContain("Budget comparison: Current vs Prior");
  });
});
