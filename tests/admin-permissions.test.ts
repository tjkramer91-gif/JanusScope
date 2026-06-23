import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isAdminProfile } from "@/lib/server/store";

describe("admin portal foundation", () => {
  it("allows either an admin role or an explicit admin flag", () => {
    expect(isAdminProfile({ role: "admin", isAdmin: false })).toBe(true);
    expect(isAdminProfile({ role: "member", isAdmin: true })).toBe(true);
    expect(isAdminProfile({ role: "Admin", isAdmin: false })).toBe(true);
    expect(isAdminProfile({ role: "member", isAdmin: false })).toBe(false);
  });

  it("scaffolds the required admin routes", () => {
    for (const route of [
      "app/admin/page.tsx",
      "app/admin/dashboard/page.tsx",
      "app/admin/leads/page.tsx",
      "app/admin/users/page.tsx",
      "app/admin/companies/page.tsx",
      "app/admin/projects/page.tsx",
      "app/admin/documents/page.tsx",
      "app/admin/usage/page.tsx",
      "app/admin/data-review/page.tsx",
      "app/admin/pricing/page.tsx",
      "app/admin/feedback/page.tsx",
      "app/admin/settings/page.tsx",
    ]) {
      expect(existsSync(join(process.cwd(), route))).toBe(true);
    }
  });
});
