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
  "One package upload",
  "Automatic document classification",
  "Manual classification confirmation",
  "Review notes",
  "Review focus chips",
  "Trade/scope detection",
];

export const RISK_OUTPUT_AREAS = [
  "Overall risk rating",
  "Top 5 risks",
  "Biggest cost misses",
  "Contract and scope traps",
  "Missing information",
  "Questions to ask",
  "Source-backed findings",
  "Full detail on demand",
  "Exportable report",
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
  ["Create project", "Enter the basic project context. Trade can be left blank if the package makes it clear."],
  ["Upload package", "Drop the documents in one place and add any notes about what should be checked."],
  ["Review package", "JanusScope classifies documents, detects the likely trade, and starts the review."],
  ["Read risk output", "See top risks, cost misses, contract traps, missing information, and next questions first."],
  ["Expand detail", "Open the full source audit, tables, and export views when deeper backup is needed."],
];

export const COMING_SOON_PRODUCTS = [
  {
    name: "DevScope",
    audience: "Owners and developers",
    body: "Future workflow support for developer-side scope, budget, document, and execution risk.",
  },
  {
    name: "GCScope",
    audience: "General contractors",
    body: "Future workflow support for subcontractor review, buyout, change orders, and project controls for GC teams.",
  },
];
