import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeUsageEventMetadata, USAGE_EVENT_TYPES } from "@/lib/server/usage";

const tempDirs: string[] = [];

afterEach(() => {
  vi.unstubAllEnvs();
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("usage tracking utilities", () => {
  it("defines every supported usage event type", () => {
    expect(USAGE_EVENT_TYPES).toEqual([
      "signup",
      "login",
      "project_created",
      "document_uploaded",
      "document_classified",
      "report_generated",
      "pdf_downloaded",
      "project_brain_viewed",
      "budget_uploaded",
      "budget_column_mapped",
      "budget_compared",
      "budget_report_generated",
      "pricing_item_extracted",
      "risk_finding_created",
      "feedback_submitted",
      "admin_data_approved",
      "admin_data_rejected",
      "admin_data_excluded",
      "lead_score_updated",
    ]);
  });

  it("removes raw document content and redacts sensitive identifiers from metadata", () => {
    const metadata = sanitizeUsageEventMetadata({
      eventSource: "upload",
      documentCategory: "Bid",
      extractedText: "Full uploaded subcontract text should not live here.",
      fileName: "real-project-budget.xlsx",
      nested: {
        bidText: "Raw bid scope.",
        fileSize: 12345,
      },
    });

    expect(metadata.eventSource).toBe("upload");
    expect(metadata.documentCategory).toBe("Bid");
    expect(metadata.extractedText).toBe("[removed]");
    expect(metadata.fileName).toBe("[redacted]");
    expect(metadata.nested).toEqual({
      bidText: "[removed]",
      fileSize: 12345,
    });
  });

  it("sanitizes metadata at the store boundary for direct usage writes", async () => {
    const dataDir = mkdtempSync(join(tmpdir(), "januscope-usage-"));
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

    await store.recordUsageEvent(user, {
      eventType: "document_uploaded",
      eventMetadata: {
        fileName: "sensitive-budget.csv",
        extractedText: "Raw document text should not be stored in usage events.",
        nested: {
          ownerName: "Sensitive Owner",
          amount: 123456,
        },
      },
    });

    const db = JSON.parse(readFileSync(join(dataDir, "subscope-db.json"), "utf8"));
    expect(db.usageEvents[0].eventMetadata).toEqual({
      fileName: "[redacted]",
      extractedText: "[removed]",
      nested: {
        ownerName: "[redacted]",
        amount: "[redacted]",
      },
    });
  });
});
