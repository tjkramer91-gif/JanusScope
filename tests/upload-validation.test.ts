import { describe, expect, it } from "vitest";
import { validateUploadFile } from "@/lib/upload-validation";

describe("validateUploadFile", () => {
  it("allows the supported document and image types", () => {
    expect(validateUploadFile({ name: "subcontract.pdf", size: 1024, type: "application/pdf" })).toBeNull();
    expect(validateUploadFile({ name: "scope.docx", size: 1024, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBeNull();
    expect(validateUploadFile({ name: "bid.xlsx", size: 1024, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })).toBeNull();
    expect(validateUploadFile({ name: "log.csv", size: 1024, type: "text/csv" })).toBeNull();
    expect(validateUploadFile({ name: "budget.csv", size: 1024, type: "application/vnd.ms-excel" })).toBeNull();
    expect(validateUploadFile({ name: "photo.png", size: 1024, type: "image/png" })).toBeNull();
    expect(validateUploadFile({ name: "site.jpg", size: 1024, type: "image/jpeg" })).toBeNull();
  });

  it("rejects unsupported, empty, and oversized files", () => {
    expect(validateUploadFile({ name: "notes.txt", size: 1024, type: "text/plain" })).toContain("Upload PDF");
    expect(validateUploadFile({ name: "empty.pdf", size: 0, type: "application/pdf" })).toContain("Choose a file");
    expect(validateUploadFile({ name: "large.pdf", size: 26 * 1024 * 1024, type: "application/pdf" })).toContain("25 MB");
  });
});
