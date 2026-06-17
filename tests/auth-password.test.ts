import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/server/password";

describe("password auth helpers", () => {
  it("hashes and verifies a password without storing the raw value", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(hash).not.toContain("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("rejects unsupported stored hash formats", async () => {
    await expect(verifyPassword("password", "plain-text")).resolves.toBe(false);
  });
});
