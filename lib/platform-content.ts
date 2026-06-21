export type WorkflowSlug =
  | "contract-review"
  | "scope-comparison"
  | "bid-request"
  | "bid-leveling"
  | "rfi-builder"
  | "change-order"
  | "budget-risk"
  | "site-walk"
  | "handoff"
  | "email-writer";

export interface WorkflowDefinition {
  slug: WorkflowSlug;
  title: string;
  shortTitle: string;
  description: string;
  purpose: string;
  bestFor: string[];
  inputLabels: string[];
  reviewFocus: string[];
  outputSections: string[];
  cta: string;
}

export interface PromptDefinition {
  id: string;
  category: string;
  title: string;
  useCase: string;
  bestUsedBy: string[];
  inputsNeeded: string[];
  prompt: string;
}

export interface TemplateDefinition {
  id: string;
  category: string;
  title: string;
  description: string;
  type: "Checklist" | "Matrix" | "Form" | "Tracker" | "Report";
  sections: string[];
}

export const PLATFORM_NAVIGATION = [
  ["/app/dashboard", "Dashboard"],
  ["/app/ask", "Ask Janus"],
  ["/app/workflows", "Workflows"],
  ["/app/prompts", "Prompt Library"],
  ["/app/templates", "Templates"],
  ["/app/projects", "Projects"],
  ["/app/reports", "Reports"],
  ["/app/consulting", "Consulting"],
  ["/app/settings", "Settings"],
] as const;

export const LANDING_HELP_AREAS = [
  "Contract review",
  "Scope gap review",
  "Bid leveling",
  "Bid request packages",
  "RFI drafting",
  "Change order narratives",
  "Budget risk review",
  "Site walk preparation",
  "Project handoff documents",
  "Construction emails and clarification requests",
];

export const USER_TYPES = [
  "Subcontractors",
  "General contractors",
  "Developers and owners",
  "Project managers",
  "Estimators",
  "Superintendents",
  "Consultants",
];

export const HOW_JANUS_WORKS = [
  ["Pick the work", "Choose the construction task you are trying to move forward."],
  ["Upload or paste context", "Add the contract, scope, bid, field issue, budget, or notes you have."],
  ["Follow a workflow", "Use a focused form that asks only for the details needed for that task."],
  ["Generate the output", "Create a risk review, matrix, checklist, RFI, email, or report section."],
  ["Export or save", "Copy the result, attach it to a project, or use it as a team handoff."],
];

export const DASHBOARD_WORK_ITEMS = [
  ["Review a contract or subcontract", "Find hidden scope, flow-down risk, notice issues, payment risk, and missing backup.", "/app/workflows/contract-review"],
  ["Compare bid vs contract scope", "Check whether the contract asks for work your bid did not clearly include.", "/app/workflows/scope-comparison"],
  ["Build a bid request", "Create a clean trade package, scope sheet, bid form, and clarification deadline.", "/app/workflows/bid-request"],
  ["Level bids", "Compare qualifications, exclusions, pricing gaps, and scope misses across proposals.", "/app/workflows/bid-leveling"],
  ["Draft an RFI", "Turn a field issue, drawing conflict, or missing answer into a clean RFI.", "/app/workflows/rfi-builder"],
  ["Build a change order narrative", "Convert facts, dates, direction, and impacts into a clear change order story.", "/app/workflows/change-order"],
  ["Review a budget", "Scan a budget for missing scope, risky assumptions, and items that need backup.", "/app/workflows/budget-risk"],
  ["Prepare for a site walk", "Generate questions, photos to take, measurements to verify, and existing conditions to document.", "/app/workflows/site-walk"],
  ["Create a project handoff", "Convert precon notes into PM priorities, open risks, buyout needs, and next steps.", "/app/workflows/handoff"],
  ["Write a construction email", "Draft clear clarification, follow-up, change, owner, or internal project emails.", "/app/workflows/email-writer"],
  ["Ask Janus a question", "Paste language or describe a problem and get a construction-focused response shape.", "/app/ask"],
  ["Browse prompt library", "Copy construction prompts for contract, scope, budget, field, and communication work.", "/app/prompts"],
] as const;

export const WORKFLOWS: WorkflowDefinition[] = [
  {
    slug: "contract-review",
    title: "Contract / Subcontract Review",
    shortTitle: "Contract review",
    description: "Review contract or subcontract language before signing.",
    purpose: "Identify scope responsibility, hidden inclusions, flow-down obligations, payment risk, notice requirements, schedule risk, warranty exposure, and items that need legal or professional review.",
    bestFor: ["Subcontractors", "General contractors", "Owners", "Consultants"],
    inputLabels: ["User role", "Project name", "Trade or scope", "Contract or subcontract language", "Bid or proposal language", "Exclusions and assumptions", "Known concerns"],
    reviewFocus: ["Scope responsibility", "Hidden inclusions", "Payment terms", "Retainage", "Change order notice", "Schedule obligations", "Liquidated damages", "Warranty", "Indemnity and insurance", "Document conflicts"],
    outputSections: ["Executive summary", "High-risk items", "Missing information", "Questions before signing", "Suggested clarification email", "Go / caution / no-go recommendation"],
    cta: "Start Contract Review",
  },
  {
    slug: "scope-comparison",
    title: "Bid vs Contract Scope Comparison",
    shortTitle: "Scope comparison",
    description: "Compare what was bid against what the contract or scope exhibit says.",
    purpose: "Find work included in the contract but missing from the bid, excluded in the bid but included in the contract, vague complete-system language, and coordination scope that needs clarification.",
    bestFor: ["Estimators", "Subcontractors", "Project managers"],
    inputLabels: ["Bid or proposal", "Contract scope", "Scope exhibit", "Exclusions", "Addenda or drawings", "Trade type"],
    reviewFocus: ["Included vs excluded work", "Vague phrases", "Allowances and alternates", "Testing and commissioning", "Cleanup", "Permits", "Warranty", "Schedule impacts"],
    outputSections: ["Scope conflict matrix", "Risk summary", "Questions for GC or owner", "Suggested email response", "Internal estimator notes"],
    cta: "Compare Scope",
  },
  {
    slug: "bid-request",
    title: "Bid Request Builder",
    shortTitle: "Bid request",
    description: "Build a clean bid request package for a trade.",
    purpose: "Create a bid request email, scope sheet, bid form table, alternates list, allowance list, required breakout pricing, and bidder questions.",
    bestFor: ["General contractors", "Owners", "Estimators", "Consultants"],
    inputLabels: ["Project name", "Location", "Trade", "Scope summary", "Bid due date", "Site walk date", "Known alternates", "Required breakouts"],
    reviewFocus: ["Scope clarity", "Required inclusions", "Bid form structure", "Alternates", "Allowances", "Clarification deadline", "Common exclusions"],
    outputSections: ["Bid request email", "Trade scope sheet", "Bid form table", "Alternates list", "Allowances list", "Bidder questions"],
    cta: "Build Bid Request",
  },
  {
    slug: "bid-leveling",
    title: "Bid Leveling Assistant",
    shortTitle: "Bid leveling",
    description: "Compare proposals and identify gaps, qualifications, and risk.",
    purpose: "Level multiple bids without exposing sensitive internal budget information in subcontractor-facing outputs.",
    bestFor: ["Estimators", "Project managers", "General contractors", "Owners"],
    inputLabels: ["Bidder names", "Bid summaries", "Original bid request", "Scope sheet", "Budget if provided", "Trade"],
    reviewFocus: ["Scope inclusions", "Exclusions", "Pricing gaps", "Missing scope", "Follow-up questions", "Clarification needs"],
    outputSections: ["Bid comparison summary", "Leveling table", "Risk flags", "Follow-up questions by bidder", "Clarification recommendation"],
    cta: "Level Bids",
  },
  {
    slug: "rfi-builder",
    title: "RFI Builder",
    shortTitle: "RFI builder",
    description: "Turn an unclear scope item, conflict, or field issue into a clean RFI.",
    purpose: "Structure the question, background, references, field condition, impact language, and needed answer so the RFI is easy to respond to.",
    bestFor: ["Project managers", "Superintendents", "Subcontractors", "Consultants"],
    inputLabels: ["Project name", "Issue description", "Location", "Drawing/spec reference", "Field condition", "Impact", "Needed answer", "Proposed solution"],
    reviewFocus: ["Clear question", "Background", "References", "Potential cost impact", "Potential schedule impact", "Responsible party"],
    outputSections: ["RFI title", "RFI question", "Background", "References", "Impact language", "Formal RFI format"],
    cta: "Draft RFI",
  },
  {
    slug: "change-order",
    title: "Change Order Narrative Builder",
    shortTitle: "Change order",
    description: "Create a clear change order narrative based on facts.",
    purpose: "Convert original scope, added work, direction, dates, location, cost impact, schedule impact, and backup into a usable change order narrative.",
    bestFor: ["Project managers", "Subcontractors", "General contractors"],
    inputLabels: ["Original scope", "Changed condition or added work", "Who directed the work", "Dates", "Location", "Cost impact", "Schedule impact", "Supporting documents"],
    reviewFocus: ["Basis of change", "Added scope", "Direction and dates", "Cost impact", "Schedule impact", "Backup checklist", "Submission email"],
    outputSections: ["Change order title", "Executive summary", "Basis of change", "Added scope", "Assumptions", "Impact wording", "Backup checklist", "Submission email"],
    cta: "Build Narrative",
  },
  {
    slug: "budget-risk",
    title: "Budget Risk Review",
    shortTitle: "Budget risk",
    description: "Review a budget for missing scope, assumptions, and pricing exposure.",
    purpose: "Find undercarried scope, risky assumptions, line items needing subcontractor input, allowance candidates, site verification needs, and owner/developer questions.",
    bestFor: ["Developers", "Owners", "Estimators", "Consultants"],
    inputLabels: ["Budget", "Scope of work", "Reports or inspections", "Project type", "Unit count", "Location", "Building age", "Known funding or AHJ requirements"],
    reviewFocus: ["Missing scope", "Allowances", "Underpriced assumptions", "Subcontractor input", "Site verification", "AHJ concerns", "Precon risk register"],
    outputSections: ["Budget risk summary", "Missing scope", "Line items needing clarification", "Allowance candidates", "Site verification checklist", "Owner questions", "Precon risk register"],
    cta: "Review Budget",
  },
  {
    slug: "site-walk",
    title: "Site Walk Checklist Generator",
    shortTitle: "Site walk",
    description: "Create a site walk checklist for the project, trade, and known concerns.",
    purpose: "Prepare questions, photos, measurements, existing conditions, access concerns, and likely scope misses before walking the site.",
    bestFor: ["Superintendents", "Estimators", "Project managers", "Consultants"],
    inputLabels: ["Project type", "Trade or full project", "Known scope", "Known issues", "Building age", "Occupied or vacant", "Location", "Photos or reports"],
    reviewFocus: ["Questions to ask", "Photos to take", "Measurements", "Existing conditions", "Safety and access", "Likely missed scope"],
    outputSections: ["Site walk checklist", "Questions", "Photo list", "Measurements", "Existing conditions", "Safety/access concerns", "Scope misses"],
    cta: "Build Checklist",
  },
  {
    slug: "handoff",
    title: "Precon to Operations Handoff Builder",
    shortTitle: "Project handoff",
    description: "Create a PM and field handoff from preconstruction information.",
    purpose: "Turn budget, bid tabs, scope sheets, owner notes, schedule risks, alternates, allowances, long lead items, and open questions into a usable handoff.",
    bestFor: ["Preconstruction", "Project managers", "Superintendents", "Owners"],
    inputLabels: ["Budget", "Bid tabs", "Scope sheets", "Owner notes", "Project schedule", "Risk items", "Pending questions", "Buyout status", "Long lead items"],
    reviewFocus: ["Budget status", "Scope risks", "Buyout priorities", "Open questions", "AHJ concerns", "Schedule risks", "Immediate next steps"],
    outputSections: ["Executive summary", "Project overview", "Budget status", "Scope risks", "Buyout priorities", "Open questions", "Schedule risks", "PM focus list"],
    cta: "Build Handoff",
  },
  {
    slug: "email-writer",
    title: "Construction Email Writer",
    shortTitle: "Construction email",
    description: "Write direct construction emails for clarification, pricing, changes, RFIs, owner updates, and internal handoffs.",
    purpose: "Create a clean subject line, email body, shorter version, and firmer version based on facts, recipient, tone, and due date.",
    bestFor: ["Project managers", "Estimators", "Superintendents", "Consultants"],
    inputLabels: ["Recipient", "Purpose", "Context", "Tone", "Key facts", "Attachments referenced", "Due date"],
    reviewFocus: ["Subject line", "Clear ask", "Facts only", "Response date", "Attachment references", "Tone control"],
    outputSections: ["Subject line", "Clean email body", "Short version", "Firmer version", "Verification notes"],
    cta: "Write Email",
  },
];

export const PROMPTS: PromptDefinition[] = [
  {
    id: "hidden-scope",
    category: "Contracts",
    title: "Review subcontract for hidden scope",
    useCase: "Use before signing a subcontract to identify unclear or risky language.",
    bestUsedBy: ["Subcontractors", "Project managers", "Estimators"],
    inputsNeeded: ["Subcontract language", "Proposal", "Exclusions", "Scope exhibit", "Plans/specs if available"],
    prompt: "Act as a construction scope and contract review assistant. Review the subcontract language below against my proposal, exclusions, and assumptions. Identify language that could make me responsible for work I did not clearly include. Separate high-risk, medium-risk, and low-risk items. List missing information, clarification questions, and suggested language I should request before signing. Do not make legal conclusions. Focus on practical construction risk, scope responsibility, payment risk, schedule risk, change order notice requirements, and vague language.",
  },
  {
    id: "scope-gap",
    category: "Scope Review",
    title: "Find missing scope in this package",
    useCase: "Use when a bid, scope exhibit, drawings, or notes feel inconsistent.",
    bestUsedBy: ["Estimators", "Project managers", "Consultants"],
    inputsNeeded: ["Scope summary", "Bid/proposal", "Contract scope", "Drawings/spec references", "Known exclusions"],
    prompt: "Review the information below for missing scope, vague requirements, document conflicts, and unclear responsibility. Start with the biggest cost exposure. Put findings in a table with issue, source, why it matters, who should answer, and recommended clarification. Separate facts from assumptions and list anything that needs verification.",
  },
  {
    id: "rfi-draft",
    category: "RFIs",
    title: "Turn this field issue into an RFI",
    useCase: "Use when a field condition, drawing conflict, or missing detail needs a formal answer.",
    bestUsedBy: ["Superintendents", "Project managers", "Subcontractors"],
    inputsNeeded: ["Issue description", "Location", "Drawing/spec reference", "Impact", "Needed answer", "Photos if available"],
    prompt: "Turn the facts below into a clean RFI. Include a short title, the question that needs answering, background, drawing/spec references, field condition, potential cost or schedule impact language, and a direct requested response. Do not invent facts. Flag missing information separately.",
  },
  {
    id: "change-order",
    category: "Change Orders",
    title: "Draft a change order narrative",
    useCase: "Use to explain changed work clearly without overarguing.",
    bestUsedBy: ["Project managers", "Subcontractors", "General contractors"],
    inputsNeeded: ["Original scope", "Added work", "Direction", "Dates", "Location", "Cost/schedule impact", "Backup"],
    prompt: "Create a change order narrative from the facts below. Include executive summary, basis of change, scope of added work, exclusions and assumptions, cost impact wording, schedule impact wording, backup checklist, and a clean submission email. Keep the tone direct and factual.",
  },
  {
    id: "budget-risk",
    category: "Budgets",
    title: "Find risk in this budget",
    useCase: "Use before budget handoff, owner review, or buyout.",
    bestUsedBy: ["Developers", "Owners", "Estimators", "Consultants"],
    inputsNeeded: ["Budget", "Scope", "Reports", "Unit count", "Project type", "Known AHJ or funding requirements"],
    prompt: "Review this construction budget for missing scope, undercarried assumptions, line items that need subcontractor input, allowance candidates, and site verification needs. Prioritize the biggest risk first. Provide a risk table, questions for the owner/developer, and a precon risk register.",
  },
  {
    id: "site-walk",
    category: "Site Walks",
    title: "Build a site walk checklist",
    useCase: "Use before walking a project so the team captures the right facts.",
    bestUsedBy: ["Estimators", "Superintendents", "Project managers"],
    inputsNeeded: ["Project type", "Trade", "Known scope", "Known issues", "Building age", "Occupied/vacant status"],
    prompt: "Build a site walk checklist for the project information below. Include questions to ask, photos to take, measurements to verify, existing conditions to document, safety/access concerns, and scope items likely to be missed. Keep it practical for field use.",
  },
  {
    id: "handoff",
    category: "Project Handoff",
    title: "Summarize this for PM handoff",
    useCase: "Use when moving from preconstruction to operations.",
    bestUsedBy: ["Preconstruction", "Project managers", "Superintendents"],
    inputsNeeded: ["Budget notes", "Bid tabs", "Scope sheets", "Owner notes", "Schedule", "Open risks", "Buyout status"],
    prompt: "Create a precon to operations handoff from the information below. Include project overview, budget status, scope risks, buyout priorities, open questions, AHJ/permit concerns, schedule risks, long lead items, owner sensitivities, immediate next steps, and PM focus list.",
  },
  {
    id: "clarification-email",
    category: "Emails",
    title: "Write a clarification email",
    useCase: "Use to ask a GC, owner, consultant, or subcontractor for a clear answer.",
    bestUsedBy: ["Project managers", "Estimators", "Consultants"],
    inputsNeeded: ["Recipient", "Issue", "Context", "Question", "Due date", "Attachments"],
    prompt: "Write a direct construction clarification email using the facts below. Include a clear subject line, brief context, numbered questions, requested response date, attachment references, and a short closing. Do not add facts I did not provide.",
  },
];

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "subcontract-review",
    category: "Contracts",
    title: "Subcontract review checklist",
    description: "A pre-signing checklist for scope, flow-down, payment, notice, schedule, warranty, indemnity, and missing documents.",
    type: "Checklist",
    sections: ["Scope responsibility", "Payment", "Change order notice", "Schedule", "Warranty", "Insurance", "Questions before signing"],
  },
  {
    id: "scope-gap",
    category: "Scope Review",
    title: "Scope gap matrix",
    description: "Compare bid position, contract position, conflict, risk level, owner, and clarification needed.",
    type: "Matrix",
    sections: ["Item", "Bid position", "Contract position", "Conflict", "Risk", "Clarification"],
  },
  {
    id: "bid-request",
    category: "Bid Requests",
    title: "Bid request form",
    description: "A structured request for pricing, due dates, alternates, allowances, breakouts, and required bidder answers.",
    type: "Form",
    sections: ["Project facts", "Trade scope", "Due dates", "Breakout pricing", "Alternates", "Questions"],
  },
  {
    id: "bid-leveling",
    category: "Bid Leveling",
    title: "Bid leveling spreadsheet structure",
    description: "Columns for bidder, base bid, inclusions, exclusions, alternates, allowances, qualifications, and follow-up.",
    type: "Matrix",
    sections: ["Bidders", "Pricing", "Inclusions", "Exclusions", "Alternates", "Qualifications", "Follow-up"],
  },
  {
    id: "rfi",
    category: "RFIs",
    title: "RFI form",
    description: "A simple RFI structure with title, question, background, references, impact language, and requested response.",
    type: "Form",
    sections: ["Title", "Question", "Background", "References", "Impact", "Requested answer"],
  },
  {
    id: "change-order",
    category: "Change Orders",
    title: "Change order narrative template",
    description: "A factual narrative structure for scope change, direction, timing, cost impact, schedule impact, and backup.",
    type: "Report",
    sections: ["Summary", "Basis of change", "Added work", "Assumptions", "Impacts", "Backup"],
  },
  {
    id: "site-walk",
    category: "Site Walks",
    title: "Site walk checklist",
    description: "Field checklist for questions, photos, measurements, existing conditions, access, and scope verification.",
    type: "Checklist",
    sections: ["Questions", "Photos", "Measurements", "Existing conditions", "Access", "Safety"],
  },
  {
    id: "risk-register",
    category: "Reports",
    title: "Risk register",
    description: "Track construction risk by category, severity, owner, source, action, status, and due date.",
    type: "Tracker",
    sections: ["Risk", "Source", "Severity", "Owner", "Action", "Status", "Due date"],
  },
];

export const CONSULTING_SERVICES = [
  "Contract / subcontract review",
  "Scope gap review",
  "Bid package review",
  "Bid leveling support",
  "Budget risk review",
  "Change order support",
  "Preconstruction handoff review",
  "Custom AI workflow setup",
];

export const ASK_JANUS_STARTERS = [
  "Review this scope and tell me what is unclear.",
  "Compare this proposal against this subcontract language.",
  "What questions should I ask before signing this subcontract?",
  "Turn this field issue into an RFI.",
  "Draft a change order narrative from these facts.",
  "Build a site walk checklist for this project.",
  "Find potential missing scope in this budget.",
  "Write a clarification email to a subcontractor.",
  "Summarize this document for a PM handoff.",
  "What would a good estimator check before bidding this?",
];

export function getWorkflow(slug: string): WorkflowDefinition | undefined {
  return WORKFLOWS.find((workflow) => workflow.slug === slug);
}
