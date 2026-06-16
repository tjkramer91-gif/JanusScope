export const PROBLEM_POINTS = [
  "Their bid exclusions do not survive into the subcontract",
  "GC contracts bury broad scope language",
  "Specs conflict with drawings",
  "Addenda are missed",
  "Schedule obligations are vague",
  "Payment terms are unfavorable",
  "Change order notice requirements are strict",
  "Flow-down clauses create risk",
  "Verbal assumptions are not documented",
];

export const SUBSCOPE_REVIEW_AREAS = [
  "GC subcontract vs subcontractor bid",
  "Scope of work vs exclusions",
  "Drawings/specs vs proposal",
  "Schedule obligations vs bid assumptions",
  "Insurance requirements vs standard coverage",
  "Payment terms",
  "Change order language",
  "Notice requirements",
  "Liquidated damages",
  "Indemnity",
  "Warranty obligations",
  "Retainage",
  "Flow-down clauses",
];

export const DOCUMENT_UPLOAD_AREAS = [
  "Subcontract agreement",
  "Subcontractor bid/proposal",
  "Scope sheet",
  "Drawings",
  "Specifications",
  "Addenda",
  "Schedule",
  "Insurance requirements",
  "Master service agreement",
  "Other supporting documents",
];

export const RISK_OUTPUT_AREAS = [
  "Overall risk rating",
  "High-risk contract clauses",
  "Hidden scope warnings",
  "Missing exclusions",
  "Conflicting document notes",
  "Clarification questions",
  "Suggested contract comments",
  "Suggested qualifications/exclusions",
  "Executive summary",
  "Export to PDF placeholder",
];

export const SUBSCOPE_MEMORY_ITEMS = [
  ["GC preferences", "Preferred form terms, recurring markups, and review habits."],
  ["Common contract issues by GC", "Repeated clause patterns that deserve early attention."],
  ["Past clarification responses", "How prior questions were answered and what changed."],
  ["Common scope gaps by trade", "Typical misses for electrical, drywall, civil, MEP, and specialty trades."],
  ["Historical change order issues", "Items that became unpaid work or dispute points."],
  ["Bid win/loss notes", "Pricing, qualification, and schedule context from prior pursuits."],
  ["Lessons learned", "Post-project notes that should influence the next subcontract review."],
];

export const SECURITY_CONTROLS = [
  "Customer documents stay private",
  "Organization-based access",
  "Role-based permissions planned",
  "Secure document handling planned",
  "Audit log planned",
  "Data retention controls planned",
  "No customer data used to train outside models unless explicitly allowed",
  "Export/delete controls planned",
];

export const HOW_IT_WORKS_STEPS = [
  ["Create project", "Enter project, GC, trade, amount, location, bid date, and execution deadline."],
  ["Upload documents", "Add the subcontract, proposal, scope sheet, drawings, specs, addenda, schedule, insurance, MSA, and support files."],
  ["Review package", "Compare contract language against what you priced, excluded, assumed, and received in the document set."],
  ["Read risk output", "Review clause risk, hidden scope, missing exclusions, conflicts, questions, and suggested comments before signing."],
  ["Build memory", "Capture GC patterns, trade gaps, past clarification responses, change order issues, and lessons learned."],
];

export const COMING_SOON_PRODUCTS = [
  {
    name: "DevScope",
    audience: "Owners and developers",
    body: "Future project intelligence for developer-side scope, budget, document, and execution risk.",
  },
  {
    name: "GCScope",
    audience: "General contractors",
    body: "Future subcontractor, buyout, change order, and project controls intelligence for GC teams.",
  },
];
