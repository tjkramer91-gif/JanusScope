import { describe, expect, it } from "vitest";
import { scrubShareSafeText } from "@/lib/share-safe";

describe("scrubShareSafeText", () => {
  it("replaces common sensitive sharing fields with placeholders", () => {
    const address = ["123 Example", "Avenue"].join(" ");
    const budget = ["$", "125,000"].join("");
    const company = ["Example", "Builders", "LLC"].join(" ");
    const scrubbed = scrubShareSafeText(
      `Send to pm@examplebuilders.example at 555-0123 for ${address}. Budget is ${budget} for ${company}.`,
    );

    expect(scrubbed).toContain("[Email]");
    expect(scrubbed).toContain("[Phone Number]");
    expect(scrubbed).toContain("[Property Address]");
    expect(scrubbed).toContain("[Budget Amount]");
    expect(scrubbed).toContain("[Company Name]");
  });
});
