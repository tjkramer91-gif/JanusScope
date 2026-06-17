type LogLevel = "info" | "warn" | "error";

type LogDetails = Record<string, string | number | boolean | null | undefined>;

function cleanDetails(details: LogDetails = {}): LogDetails {
  return Object.fromEntries(
    Object.entries(details).filter(([, value]) => value !== undefined),
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
