export function safeReturnTo(value: string | undefined, fallback = "/app/dashboard"): string {
  if (!value) return fallback;
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
