import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parseBudgetCsv } from "@/lib/budgetscope";

const tempDirs: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function localUser() {
  return {
    id: "demo-user",
    auth0UserId: "demo|subscope",
    email: "demo@januscope.local",
    name: "Demo Reviewer",
  };
}

function makeUserAdmin(dataDir: string) {
  const dbPath = join(dataDir, "subscope-db.json");
  const db = JSON.parse(readFileSync(dbPath, "utf8"));
  db.users = db.users.map((user: Record<string, unknown>) => ({
    ...user,
    role: "admin",
    isAdmin: true,
  }));
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

describe("BudgetScope data review and benchmark eligibility", () => {
  it("queues eligible parsed pricing, approves benchmarks, and excludes rejected records", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-data-review-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    const user = localUser();
    const createdProject = await store.createProject(user, {
      name: "Willow Creek Rehab",
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
      allowedForAnonymizedLearning: true,
      excludedFromBenchmarking: false,
      deleteDocumentsAfterReport: false,
      consentStatus: "granted",
      grossSquareFeet: 12000,
      rentableSquareFeet: 10000,
      unitCount: 60,
      buildingCount: 3,
    }, "test.consent.updated");
    const parsed = parseBudgetCsv(`Trade,Description,Qty,UOM,Unit Cost,Total Cost
Electrical,Panel replacement,12,EA,1950,23400
Flooring,LVP replacement,4000,SF,4.25,17000
Paint,Common area paint,2000,SF,2,4000`);

    await store.saveBudgetScopeImport(user, project, {
      budgetName: "Approved Budget",
      budgetVersion: "Initial",
      budgetType: "budget",
      sourceType: "budget",
      city: project.city,
      state: project.state,
      region: project.region,
      projectType: project.projectType,
      assetType: project.assetType,
      renovationOrNew: project.renovationOrNew,
      estimateDate: "2026-06-01",
      grossSquareFeet: project.grossSquareFeet,
      rentableSquareFeet: project.rentableSquareFeet,
      unitCount: project.unitCount,
      buildingCount: project.buildingCount,
      fundingType: project.fundingType,
      occupiedOrVacant: "unknown",
      sourceFileId: null,
      consentStatus: "granted",
      lineItems: parsed.lineItems,
    });

    let db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.dataReviewQueue).toHaveLength(3);
    makeUserAdmin(dataDir);
    db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    const [approveItem, rejectItem, excludeItem] = db.dataReviewQueue;

    await store.updateAdminDataReviewItem(user, {
      id: approveItem.id,
      action: "approve",
      normalizedTrade: "Electrical",
      normalizedScopeCategory: "Electrical",
      adminNotes: "Approved synthetic test record.",
    });
    await store.updateAdminDataReviewItem(user, {
      id: rejectItem.id,
      action: "reject",
      normalizedTrade: rejectItem.normalizedTrade,
      normalizedScopeCategory: rejectItem.normalizedScopeCategory,
      adminNotes: "Rejected test record.",
    });
    await store.updateAdminDataReviewItem(user, {
      id: excludeItem.id,
      action: "exclude",
      normalizedTrade: excludeItem.normalizedTrade,
      normalizedScopeCategory: excludeItem.normalizedScopeCategory,
      adminNotes: "Excluded test record.",
    });

    db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.dataReviewQueue.map((item: { reviewStatus: string }) => item.reviewStatus)).toEqual([
      "approved",
      "rejected",
      "excluded_from_learning",
    ]);
    expect(db.pricingBenchmarkRecords).toHaveLength(1);
    expect(db.pricingBenchmarkRecords[0]).toMatchObject({
      trade: "Electrical",
      consentStatus: "granted",
      reviewStatus: "approved",
      costPerGrossSf: 1.95,
      costPerUnit: 390,
      costPerBuilding: 7800,
    });
    expect(db.usageEvents.map((event: { eventType: string }) => event.eventType)).toEqual(expect.arrayContaining([
      "admin_data_approved",
      "admin_data_rejected",
      "admin_data_excluded",
    ]));
    expect(db.adminAuditLog.map((entry: { actionType: string }) => entry.actionType)).toEqual(expect.arrayContaining([
      "data_review.approve",
      "data_review.reject",
      "data_review.exclude",
    ]));

    const pricingRows = await store.listAdminPricingBenchmarks(user, { trade: "Electrical" });
    expect(pricingRows).toHaveLength(1);
    expect(pricingRows[0]).toMatchObject({
      trade: "Electrical",
      recordCount: 1,
      averageUnitCost: 1950,
    });
  });

  it("blocks non-admin users from data review records", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-data-review-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    await store.ensureWorkspace(localUser());

    await expect(store.listAdminDataReviewQueue(localUser())).rejects.toThrow("Admin access required");
    await expect(store.listAdminPricingBenchmarks(localUser())).rejects.toThrow("Admin access required");
  });

  it("does not queue budget line items when project consent is missing", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-data-review-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    const user = localUser();
    const project = await store.createProject(user, {
      name: "Mesa Vista Senior Living",
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
    const parsed = parseBudgetCsv(`Trade,Description,Qty,UOM,Unit Cost,Total Cost
Electrical,Panel replacement,12,EA,1950,23400`);

    await store.saveBudgetScopeImport(user, project, {
      budgetName: "Non-consented Budget",
      budgetVersion: "Initial",
      budgetType: "budget",
      sourceType: "budget",
      city: project.city,
      state: project.state,
      region: project.region,
      projectType: project.projectType,
      assetType: project.assetType,
      renovationOrNew: project.renovationOrNew,
      estimateDate: "2026-06-01",
      grossSquareFeet: project.grossSquareFeet,
      rentableSquareFeet: project.rentableSquareFeet,
      unitCount: project.unitCount,
      buildingCount: project.buildingCount,
      fundingType: project.fundingType,
      occupiedOrVacant: "unknown",
      sourceFileId: null,
      consentStatus: "not-requested",
      lineItems: parsed.lineItems,
    });

    const db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.dataReviewQueue).toHaveLength(0);
    expect(db.pricingBenchmarkRecords).toHaveLength(0);
  });
});
