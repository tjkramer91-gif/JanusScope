export const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".csv", ".png", ".jpg", ".jpeg"] as const;

const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
]);

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 20;

export interface UploadFileLike {
  name: string;
  size: number;
  type?: string;
}

function fileExtension(name: string): string {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
}

export function validateUploadFile(file: UploadFileLike): string | null {
  if (file.size <= 0) return "Choose a file before uploading.";
  if (file.size > MAX_UPLOAD_BYTES) return "Each uploaded file must be 25 MB or smaller.";

  const extension = fileExtension(file.name);
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extension as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number])) {
    return "Upload PDF, DOCX, XLSX, CSV, PNG, or JPG files only.";
  }

  if (file.type && !ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
    return "Upload PDF, DOCX, XLSX, CSV, PNG, or JPG files only.";
  }

  return null;
}
