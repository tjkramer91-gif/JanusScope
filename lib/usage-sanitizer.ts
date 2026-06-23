const RAW_DOCUMENT_KEYS = new Set([
  "rawtext",
  "documenttext",
  "extractedtext",
  "subcontracttext",
  "contracttext",
  "bidtext",
  "exclusionstext",
  "notestext",
  "filecontent",
  "content",
  "body",
  "html",
  "markdown",
  "fulltext",
  "ocrtext",
]);

const SENSITIVE_KEY_PATTERN = /(email|phone|address|fileName|name|client|owner|company|contact|pricing|budget|amount)/i;
const MAX_METADATA_DEPTH = 4;
const MAX_STRING_LENGTH = 500;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeValue(key: string, value: unknown, depth: number): unknown {
  const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, "");
  if (RAW_DOCUMENT_KEYS.has(normalizedKey)) return "[removed]";
  if (SENSITIVE_KEY_PATTERN.test(key)) return "[redacted]";
  if (depth > MAX_METADATA_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 20).map((item, index) => sanitizeValue(String(index), item, depth + 1));
  if (isPlainObject(value)) return sanitizeUsageEventMetadata(value, depth + 1);
  if (typeof value === "string") return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return String(value);
}

export function sanitizeUsageEventMetadata(
  metadata: Record<string, unknown> = {},
  depth = 0,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, sanitizeValue(key, value, depth)]),
  );
}
