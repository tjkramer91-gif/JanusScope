import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function user() {
  return {
    id: "demo-user",
    auth0UserId: "demo|subscope",
    email: "demo@januscope.local",
    name: "Demo Reviewer",
  };
}

function makeAdmin(dataDir: string) {
  const dbPath = join(dataDir, "subscope-db.json");
  const db = JSON.parse(readFileSync(dbPath, "utf8"));
  db.users = db.users.map((profile: Record<string, unknown>) => ({ ...profile, role: "admin", isAdmin: true }));
  db.companies = db.companies.map((company: Record<string, unknown>) => ({
    ...company,
    companyName: "Sample Workspace",
    companyType: "General Contractor",
    trade: "Preconstruction",
    state: "ST",
    region: "Southwest",
  }));
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function createSyntheticProject(store: typeof import("@/lib/server/store"), projectName: string) {
  return store.createProject(user(), {
    name: projectName,
    projectAddress: "",
    city: "Example City",
    state: "ST",
    zip: "",
    tradeType: "Electrical",
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
}

describe("lead activity tracking", () => {
  it("updates lead score after high-intent usage events and lists admin leads", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-leads-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    await createSyntheticProject(store, "Harbor Flats Renovation");
    await createSyntheticProject(store, "Cedar Ridge Apartments");
    for (const eventType of [
      "project_created",
      "document_uploaded",
      "document_uploaded",
      "budget_uploaded",
      "budget_uploaded",
      "budget_compared",
      "budget_compared",
      "report_generated",
      "pdf_downloaded",
      "feedback_submitted",
    ] as const) {
      await store.recordUsageEvent(user(), { eventType, eventMetadata: { source: "test" } });
    }

    makeAdmin(dataDir);
    const leads = await store.listAdminLeads(user());
    expect(leads).toHaveLength(1);
    expect(leads[0].leadScore).toBeGreaterThanOrEqual(70);
    expect(leads[0].leadStatus).toBe("High Intent");
    expect(leads[0].highIntentActions).toEqual(expect.arrayContaining([
      "Uploaded multiple budgets",
      "Compared budgets",
      "Used BudgetScope more than once",
      "Created multiple projects",
    ]));
    expect(leads[0]).toMatchObject({
      companyName: "Sample Workspace",
      companyType: "General Contractor",
      trade: "Preconstruction",
      projectsCount: 2,
      documentsUploaded: 2,
      budgetComparisonsCount: 2,
      reportsGeneratedCount: 1,
      pdfsDownloadedCount: 1,
      feedbackCount: 1,
    });
  });

  it("blocks non-admin users from lead activity", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-leads-"));
    tempDirs.push(dataDir);
    vi.stubEnv("SUBSCOPE_DATA_DIR", dataDir);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.resetModules();

    const store = await import("@/lib/server/store");
    await store.ensureWorkspace(user());
    await expect(store.listAdminLeads(user())).rejects.toThrow("Admin access required");
    await expect(store.getAdminDashboardAnalytics(user())).rejects.toThrow("Admin access required");
  });
});
