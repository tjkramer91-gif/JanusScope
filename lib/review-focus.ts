export const REVIEW_FOCUS_OPTIONS = [
  { id: "review-everything", label: "Review everything" },
  { id: "biggest-risks", label: "I am not sure, find the biggest risks" },
  { id: "scope-gaps", label: "Scope gaps" },
  { id: "bid-exclusions", label: "Bid exclusions" },
  { id: "contract-risk", label: "Contract risk" },
  { id: "pricing-variance", label: "Pricing variance" },
  { id: "permit-code", label: "Permit/code requirements" },
  { id: "schedule-risk", label: "Schedule risk" },
  { id: "allowances", label: "Allowances" },
  { id: "unit-pricing", label: "Unit pricing" },
  { id: "warranty-risk", label: "Warranty risk" },
  { id: "insurance-risk", label: "Insurance risk" },
  { id: "change-order-risk", label: "Change order risk" },
  { id: "missing-documents", label: "Missing documents" },
] as const;

export type ReviewFocusId = (typeof REVIEW_FOCUS_OPTIONS)[number]["id"];

export function reviewFocusLabels(ids: string[]): string[] {
  const labels = new Map<string, string>(REVIEW_FOCUS_OPTIONS.map((option) => [option.id, option.label]));
  return ids.map((id) => labels.get(id)).filter((label): label is string => Boolean(label));
}

export function extractReviewFocus(notesText: string): string {
  return notesText.split("\n").find((line) => line.startsWith("Review focus:"))?.replace("Review focus:", "").trim() || "Review everything";
}
