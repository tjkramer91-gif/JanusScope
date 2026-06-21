type LogLevel = "info" | "warn" | "error";

type LogDetails = Record<string, string | number | boolean | null | undefined>;

const SENSITIVE_KEY_PATTERN = /(email|phone|address|name|file|path|client|owner|company|projectname)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /\b(?:\+?1[-. (]*)?(?:\d{3}[-. )]+\d{3}[-. ]+\d{4}|\d{3}-\d{4})\b/g;
const ADDRESS_PATTERN =
  /\b\d{2,5}\s+[A-Z][A-Za-z0-9.'-]*(?:\s+[A-Z][A-Za-z0-9.'-]*){0,5}\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct|Place|Pl|Terrace|Ter)\b/g;

function redactString(value: string): string {
  return value
    .replace(EMAIL_PATTERN, "[email]")
    .replace(PHONE_PATTERN, "[phone]")
    .replace(ADDRESS_PATTERN, "[address]");
}

function cleanDetails(details: LogDetails = {}): LogDetails {
  return Object.fromEntries(
    Object.entries(details)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        if (typeof value !== "string") return [key, value];
        if (SENSITIVE_KEY_PATTERN.test(key)) return [key, "[redacted]"];
        return [key, redactString(value)];
      }),
  ) as LogDetails;
}

export function logEvent(level: LogLevel, event: string, details: LogDetails = {}): void {
  const payload = {
    event,
    ...cleanDetails(details),
  };

  if (level === "error") {
    console.error("[subscope]", payload);
    return;
  }

  if (level === "warn") {
    console.warn("[subscope]", payload);
    return;
  }

  console.log("[subscope]", payload);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
