import { describe, expect, it } from "vitest";
import { classifyUploadedFile } from "@/lib/document-classifier";
import type { UploadedFile } from "@/lib/types";

function file(overrides: Partial<UploadedFile>): UploadedFile {
  return {
    id: "doc-1",
    name: "Unknown.pdf",
    size: 100,
    type: "application/pdf",
    documentId: "other",
    storagePath: "test",
    processingStatus: "classified",
    uploadedAt: "2026-06-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("classifyUploadedFile", () => {
  it("labels strong filename matches as classified", () => {
    const classification = classifyUploadedFile(file({ name: "BDG Electric Proposal.pdf", documentId: "bid-proposal" }));

    expect(classification.label).toBe("Subcontractor proposal/bid");
    expect(classification.confidence).toBe("High");
    expect(classification.status).toBe("Classified");
  });

  it("marks unknown files for confirmation", () => {
    const classification = classifyUploadedFile(file({ name: "scan-001.pdf", documentId: "other" }));

    expect(classification.label).toBe("Unknown");
    expect(classification.confidence).toBe("Low");
    expect(classification.status).toBe("Needs confirmation");
  });
});
