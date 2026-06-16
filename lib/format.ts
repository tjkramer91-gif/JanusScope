import { Severity } from "@/lib/types";

export function formatCurrency(value: number | null): string {
  if (value === null) return "Not provided";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function severityLabel(severity: Severity): string {
  return {
    low: "Low",
    medium: "Moderate",
    high: "High",
    critical: "Severe",
  }[severity];
}

export function severityColor(severity: Severity): string {
  return {
    low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    medium: "bg-amber-50 text-amber-800 ring-amber-200",
    high: "bg-orange-50 text-orange-800 ring-orange-200",
    critical: "bg-red-50 text-red-700 ring-red-200",
  }[severity];
}
