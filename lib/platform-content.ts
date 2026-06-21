export type RoleMode =
  | "subcontractor"
  | "gc-pm"
  | "estimator"
  | "superintendent"
  | "developer-owner"
  | "affordable-housing"
  | "consultant";

export type WorkflowSlug =
  | "what-am-i-missing"
  | "contract-review"
  | "scope-comparison"
  | "bid-request"
  | "bid-leveling"
  | "rfi-builder"
  | "change-order"
  | "budget-risk"
  | "site-walk"
  | "handoff"
  | "email-writer"
  | "conflict-finder"
  | "trade-scope-builder"
  | "field-notes"
  | "requirement-radar";

export interface DashboardAction {
  title: string;
  description: string;
  href: string;
  tag?: string;
}

export interface RoleDefinition {
  id: RoleMode;
  label: string;
  shortLabel: string;
  description: string;
}

export interface WorkflowDefinition {
  slug: WorkflowSlug;
  title: string;
  shortTitle: string;
  category: string;
  description: string;
  purpose: string;
  bestFor: string[];
  projectPhases: string[];
  audiences: string[];
  inputLabels: string[];
  reviewFocus: string[];
  outputSections: string[];
  nextActions: string[];
  cta: string;
}

export interface PromptDefinition {
  id: string;
  category: string;
  role: string;
  task: string;
  projectPhase: string;
  trade: string;
  riskType: string;
  outputType: string;
  experienceLevel: string;
  title: string;
  useCase: string;
  inputsNeeded: string[];
  expectedOutput: string;
  prompt: string;
  workflowSlug?: WorkflowSlug;
}

export interface TemplateDefinition {
  id: string;
  category: string;
  role: string;
  trade: string;
  title: string;
  description: string;
  type: "Checklist" | "Matrix" | "Form" | "Tracker" | "Report";
  sections: string[];
}

export interface TradeRiskDefinition {
  slug: string;
  title: string;
  trade: string;
  reviewMode: string;
  summary: string;
  commonMisses: string[];
  badExclusions: string[];
  hiddenCosts: string[];
  coordinationIssues: string[];
  questions: string[];
  alternates: string[];
  allowances: string[];
  changeOrderTriggers: string[];
  inspectionConcerns: string[];
  closeoutItems: string[];
  bidFormBreakouts: string[];
  suggestedPrompts: string[];
  suggestedTemplates: string[];
  suggestedChecklist: string[];
}

export interface RequirementBucketDefinition {
  id: string;
  title: string;
  summary: string;
  questions: string[];
  documents: string[];
  verifyWith: string[];
}

export interface QuickToolDefinition {
  slug: string;
  title: string;
  description: string;
  output: string;
}

export interface CalculatorDefinition {
  slug: string;
  title: string;
  description: string;
  inputs: string[];
  formulaHint: string;
}

export interface AffordableHousingModuleDefinition {
  slug: string;
  title: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export type NavigationItem = readonly [string, string];

export interface NavigationGroup {
  title: string;
  items: readonly NavigationItem[];
}

export const OUTPUT_AUDIENCES = [
  "Internal team",
  "Owner",
  "Subcontractor",
  "Architect",
  "Lender",
  "Executive",
  "Field team",
] as const;

export const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Experienced", "Executive summary"] as const;

export const PROJECT_PHASES = [
  "Due diligence",
  "Preconstruction",
  "Bidding",
  "Buyout",
  "Construction",
  "Change management",
  "Closeout",
] as const;

export const ROLE_MODES: RoleDefinition[] = [
  {
    id: "subcontractor",
    label: "Subcontractor",
    shortLabel: "Sub",
    description: "Protect bid intent, scope clarity, notice rights, payment position, and field documentation.",
  },
  {
    id: "gc-pm",
    label: "General Contractor / Project Manager",
    shortLabel: "PM",
    description: "Keep buyout, communication, risk tracking, subcontract language, and owner updates organized.",
  },
  {
    id: "estimator",
    label: "Estimator / Preconstruction",
    shortLabel: "Precon",
    description: "Review drawings, scope, alternates, allowances, and bid carry before the miss becomes buyout pain.",
  },
  {
    id: "superintendent",
    label: "Superintendent / Field",
    shortLabel: "Field",
    description: "Turn site observations into usable records, RFIs, coordination notes, and issue packages.",
  },
  {
    id: "developer-owner",
    label: "Developer / Owner",
    shortLabel: "Owner",
    description: "Pressure-test budget, immediate needs, due diligence risk, lender questions, and project assumptions.",
  },
  {
    id: "affordable-housing",
    label: "Affordable Housing Team",
    shortLabel: "Housing",
    description: "Review NSPIRE, PCNA, occupied rehab, funding requirement areas, and lender-driven scope risk.",
  },
  {
    id: "consultant",
    label: "Consultant",
    shortLabel: "Consultant",
    description: "Structure deliverables, matrices, owner memos, and review outputs around practical construction questions.",
  },
];

export const PLATFORM_NAVIGATION_GROUPS: readonly NavigationGroup[] = [
  {
    title: "Workspace",
    items: [
      ["/app/dashboard", "Dashboard"],
      ["/app/ask", "Ask Janus"],
      ["/app/workflows", "Workflows"],
      ["/app/projects", "Projects"],
      ["/app/reports", "Reports / Exports"],
    ],
  },
  {
    title: "Libraries",
    items: [
      ["/app/prompts", "Role-Based Prompt Library"],
      ["/app/trade-risks", "Trade Risk Library"],
      ["/app/templates", "Templates"],
      ["/app/lessons", "Lessons Learned"],
      ["/app/playbooks", "Company Playbooks"],
    ],
  },
  {
    title: "Specialized",
    items: [
      ["/app/requirements", "Requirement Radar"],
      ["/app/affordable-housing", "Affordable Housing"],
      ["/app/quick-tools", "Quick Tools"],
      ["/app/calculators", "Calculators"],
      ["/app/consulting", "Consulting Request"],
    ],
  },
  {
    title: "Admin",
    items: [
      ["/app/trust", "Trust / Data Handling"],
      ["/app/settings", "Settings"],
    ],
  },
] as const;

export const PLATFORM_NAVIGATION: ReadonlyArray<readonly [string, string]> = PLATFORM_NAVIGATION_GROUPS.flatMap((group) => group.items);

export const LANDING_HELP_AREAS = [
  "What Am I Missing reviews",
  "Contract and subcontract review",
  "Bid versus contract scope comparison",
  "Trade-specific bid requests and bid forms",
  "Bid leveling and buyout clarification",
  "RFI drafting and field issue packaging",
  "Change order narratives and notice language",
  "Budget risk and due diligence review",
  "Requirement Radar issue spotting",
  "Lessons learned and company playbooks",
];

export const USER_TYPES = [
  "Subcontractors",
  "General contractors",
  "Estimators and preconstruction teams",
  "Project managers",
  "Superintendents",
  "Developers and owners",
  "Affordable housing teams",
  "Consultants",
];

export const HOW_JANUS_WORKS = [
  ["Pick the work", "Choose the construction question, workflow, or library entry that matches the task."],
  ["Add project facts", "Paste notes, upload documents, and state what is known, unclear, or risky."],
  ["Review by role", "Switch the lens to estimator, PM, superintendent, owner, subcontractor, or housing team."],
  ["Generate deliverables", "Create checklists, RFIs, matrices, reports, owner updates, or internal notes."],
  ["Save and reuse", "Attach outputs to a project, export them, or turn them into lessons and playbooks."],
];

export const ROLE_BASED_ACTIONS: Record<RoleMode, DashboardAction[]> = {
  estimator: [
    { title: "Review drawings/specs for scope gaps", description: "Spot unclear work, incomplete breakouts, and likely misses before bid day.", href: "/app/workflows/what-am-i-missing", tag: "Flagship" },
    { title: "Build bid package", description: "Create a trade request with breakouts, alternates, and bidder questions.", href: "/app/workflows/bid-request" },
    { title: "Create trade scope", description: "Draft required inclusions, exclusions to clarify, and bidder response requirements.", href: "/app/workflows/trade-scope-builder" },
    { title: "Level bids", description: "Compare qualifications, exclusions, and pricing spreads across proposals.", href: "/app/workflows/bid-leveling" },
    { title: "Generate alternates", description: "Turn scope uncertainty into structured alternates and allowance candidates.", href: "/app/templates" },
    { title: "Review budget risk", description: "Pressure-test carry, allowances, and missing subcontractor input.", href: "/app/workflows/budget-risk" },
    { title: "Prepare precon handoff", description: "Summarize budget risk, open questions, and buyout priorities.", href: "/app/workflows/handoff" },
    { title: "Ask estimator question", description: "Use experienced-estimator framing for scope, carry, and buyout questions.", href: "/app/ask?prompt=Ask%20an%20experienced%20estimator%20to%20review%20this%20scope." },
    { title: "Browse estimator prompts", description: "Open prompts for scope gaps, clarifications, alternates, and bid forms.", href: "/app/prompts" },
  ],
  "gc-pm": [
    { title: "Review subcontract", description: "Check flow-down scope, notice obligations, and hidden risk before buyout.", href: "/app/workflows/contract-review", tag: "High risk" },
    { title: "Draft RFI", description: "Convert an unclear condition into a clean question with references and impact language.", href: "/app/workflows/rfi-builder" },
    { title: "Draft change order", description: "Build a factual narrative around direction, added work, dates, and impacts.", href: "/app/workflows/change-order" },
    { title: "Write owner update", description: "Turn a messy issue into a clear owner-facing summary.", href: "/app/ask?prompt=Write%20an%20owner-facing%20update%20based%20on%20these%20facts." },
    { title: "Track risk item", description: "Move a scope or budget concern into a structured next-action list.", href: "/app/reports" },
    { title: "Create meeting agenda", description: "Prepare focused agenda items before coordination calls or OAC meetings.", href: "/app/quick-tools" },
    { title: "Clean up meeting minutes", description: "Convert rough notes into action items, owners, and due dates.", href: "/app/quick-tools" },
    { title: "Build buyout checklist", description: "Organize missing scope, long lead items, exhibits, and closeout needs.", href: "/app/templates" },
    { title: "Browse PM prompts", description: "Use owner updates, escalation memos, and clarification prompts.", href: "/app/prompts" },
  ],
  superintendent: [
    { title: "Create daily report", description: "Turn field notes into clean daily reporting language.", href: "/app/workflows/field-notes" },
    { title: "Document field issue", description: "Capture the issue, location, likely impact, and next question.", href: "/app/workflows/field-notes", tag: "Field" },
    { title: "Build look-ahead notes", description: "Prepare three-week look-ahead notes and coordination concerns.", href: "/app/quick-tools" },
    { title: "Create RFI from field condition", description: "Package location, condition, references, and needed answer.", href: "/app/workflows/rfi-builder" },
    { title: "Generate punch list", description: "Turn observations into trade-tagged closeout issues.", href: "/app/templates" },
    { title: "Prepare subcontractor coordination notes", description: "Write clear field direction without losing the facts.", href: "/app/quick-tools" },
    { title: "Convert field notes into PM package", description: "Translate field issues into PM-ready communication and documentation.", href: "/app/workflows/field-notes" },
    { title: "Browse field prompts", description: "Use prompts for field issue documentation, look-aheads, and reports.", href: "/app/prompts" },
  ],
  subcontractor: [
    { title: "Review contract before signing", description: "Protect proposal intent, exclusions, and notice requirements.", href: "/app/workflows/contract-review", tag: "Protect margin" },
    { title: "Compare bid vs subcontract", description: "Check whether contract language asks for work you did not clearly price.", href: "/app/workflows/scope-comparison" },
    { title: "Draft clarification request", description: "Request cleaner scope direction before signing or proceeding.", href: "/app/workflows/email-writer" },
    { title: "Draft change order notice", description: "Build a direct written notice around added work and direction.", href: "/app/workflows/change-order" },
    { title: "Draft payment follow-up", description: "Write a clear payment status or backup request.", href: "/app/quick-tools" },
    { title: "Draft delay notice", description: "Capture cause, dates, and required next action in writing.", href: "/app/quick-tools" },
    { title: "Build exclusion language", description: "Sharpen proposal exclusions and clarify vague complete-system asks.", href: "/app/quick-tools" },
    { title: "Browse subcontractor prompts", description: "Open prompts for contract protection, notices, and payment follow-up.", href: "/app/prompts" },
  ],
  "developer-owner": [
    { title: "Review PCNA", description: "Find immediate needs, budget gaps, and missing scope before closing.", href: "/app/affordable-housing" },
    { title: "Review GC budget", description: "Compare carries, allowances, and missing scope against due diligence inputs.", href: "/app/workflows/budget-risk", tag: "Budget" },
    { title: "Find missing scope", description: "Run a top-down practical review across reports, budgets, and scope.", href: "/app/workflows/what-am-i-missing" },
    { title: "Create lender summary", description: "Prepare a concise risk memo for lender or investment review.", href: "/app/reports" },
    { title: "Analyze contingency", description: "Pressure-test the current contingency against likely scope misses.", href: "/app/calculators" },
    { title: "Create risk memo", description: "Turn concerns into an owner-facing summary with next actions.", href: "/app/ask?prompt=Create%20an%20owner%20risk%20memo%20from%20these%20facts." },
    { title: "Generate due diligence questions", description: "Ask better questions before scope, funding, or schedule gets locked.", href: "/app/requirements" },
    { title: "Check funding requirement areas", description: "Issue-spot likely compliance and lender buckets that need review.", href: "/app/requirements" },
    { title: "Browse developer prompts", description: "Open prompts for risk memos, budget review, and contingency questions.", href: "/app/prompts" },
  ],
  "affordable-housing": [
    { title: "Review NSPIRE report", description: "Turn deficiencies into trades, priorities, and field verification needs.", href: "/app/affordable-housing", tag: "Housing" },
    { title: "Build unit deficiency matrix", description: "Organize unit-by-unit issues and likely scope buckets.", href: "/app/affordable-housing" },
    { title: "Review PCNA / CNA", description: "Extract immediate needs, short-term capital needs, and missing scope.", href: "/app/affordable-housing" },
    { title: "Check LIHTC / HUD / funding requirement areas", description: "Identify requirement buckets and verification questions.", href: "/app/requirements" },
    { title: "Build immediate needs tracker", description: "Separate lender-driven needs from broader renovation scope.", href: "/app/templates" },
    { title: "Build occupied rehab checklist", description: "Capture phasing, access, relocation, and tenant-impact questions.", href: "/app/affordable-housing" },
    { title: "Create lender/owner risk memo", description: "Summarize scope, budget, and requirement issues for decision-makers.", href: "/app/reports" },
    { title: "Generate scope questions for GC / architect", description: "Write focused clarifications around deficiencies and rehab scope.", href: "/app/ask?prompt=Generate%20scope%20questions%20for%20the%20GC%20and%20architect%20based%20on%20these%20housing%20issues." },
  ],
  consultant: [
    { title: "What am I missing?", description: "Run a practical risk review across mixed project inputs.", href: "/app/workflows/what-am-i-missing", tag: "Flagship" },
    { title: "Compare conflicting documents", description: "Surface conflict points and draft clarification questions.", href: "/app/workflows/conflict-finder" },
    { title: "Build requirement issue list", description: "Capture questions for AHJ, lender, architect, and owner.", href: "/app/requirements" },
    { title: "Write owner memo", description: "Convert findings into a cleaner executive-level summary.", href: "/app/ask?prompt=Write%20an%20executive-level%20owner%20memo%20from%20these%20construction%20findings." },
    { title: "Prepare trade checklist", description: "Use the trade library to standardize review habits by scope package.", href: "/app/trade-risks" },
    { title: "Build scope gap matrix", description: "Create a reusable included-versus-missing matrix for the team.", href: "/app/templates" },
    { title: "Save a lesson learned", description: "Turn a miss into reusable team guidance.", href: "/app/lessons" },
    { title: "Browse consultant prompts", description: "Open prompts for memos, matrices, and review packaging.", href: "/app/prompts" },
  ],
};

export const DASHBOARD_WORK_ITEMS: DashboardAction[] = [
  { title: "What am I missing?", description: "Flag likely misses, biggest risks, missing information, and next questions.", href: "/app/workflows/what-am-i-missing", tag: "Flagship" },
  { title: "Review a contract or subcontract", description: "Find hidden scope, flow-down risk, notice issues, payment risk, and missing backup.", href: "/app/workflows/contract-review" },
  { title: "Compare bid vs contract scope", description: "Check whether the contract asks for work your bid did not clearly include.", href: "/app/workflows/scope-comparison" },
  { title: "Build a bid request", description: "Create a clean trade package, scope sheet, bid form, and clarification deadline.", href: "/app/workflows/bid-request" },
  { title: "Level bids", description: "Compare qualifications, exclusions, pricing gaps, and scope misses across proposals.", href: "/app/workflows/bid-leveling" },
  { title: "Draft an RFI", description: "Turn a field issue, drawing conflict, or missing answer into a clean RFI.", href: "/app/workflows/rfi-builder" },
  { title: "Build a change order narrative", description: "Convert facts, dates, direction, and impacts into a clear change order story.", href: "/app/workflows/change-order" },
  { title: "Review a budget", description: "Scan a budget for missing scope, risky assumptions, and items that need backup.", href: "/app/workflows/budget-risk" },
  { title: "Prepare for a site walk", description: "Generate questions, photos to take, measurements to verify, and existing conditions to document.", href: "/app/workflows/site-walk" },
  { title: "Create a project handoff", description: "Convert precon notes into PM priorities, open risks, buyout needs, and next steps.", href: "/app/workflows/handoff" },
  { title: "Check code / funding requirement areas", description: "Spot requirement buckets that need confirmation with the right party.", href: "/app/requirements" },
  { title: "Browse role-based prompts", description: "Search prompts by role, task, phase, trade, risk, and output.", href: "/app/prompts" },
  { title: "Browse trade risk library", description: "Review what experienced teams usually check by trade.", href: "/app/trade-risks" },
  { title: "Add a lesson learned", description: "Capture a miss and convert it into a future checklist or playbook item.", href: "/app/lessons" },
  { title: "Ask Janus a question", description: "Paste language or describe a problem and get a construction-focused response shape.", href: "/app/ask" },
];

export const WORKFLOWS: WorkflowDefinition[] = [
  {
    slug: "what-am-i-missing",
    title: "What Am I Missing?",
    shortTitle: "What am I missing",
    category: "Flagship review",
    description: "Upload or paste any construction package and get the likely misses first.",
    purpose: "Review mixed construction inputs and return the top likely misses, biggest cost and schedule risks, biggest scope conflicts, requirement areas to verify, missing information, field verification items, clarification questions, and the next best action.",
    bestFor: ["Estimators", "Project managers", "Owners", "Subcontractors", "Consultants"],
    projectPhases: ["Due diligence", "Preconstruction", "Bidding", "Buyout", "Construction"],
    audiences: [...OUTPUT_AUDIENCES],
    inputLabels: ["Project type", "User role", "Project phase", "Trade if applicable", "Known concerns", "Desired output audience", "Paste text or notes", "File upload references"],
    reviewFocus: ["Top 10 likely misses", "Cost risk", "Schedule risk", "Scope risk", "Document conflicts", "Requirement areas to verify", "Missing information", "Clarification questions", "Field verification checklist", "Next best action"],
    outputSections: ["Executive summary", "Top 10 likely misses", "Risk table", "Missing information", "Clarification questions", "Field verification checklist", "Next best action", "Draft email"],
    nextActions: ["Send clarification email", "Request pricing breakout", "Schedule site walk", "Verify with AHJ or funding party", "Save to project"],
    cta: "Run What Am I Missing?",
  },
  {
    slug: "contract-review",
    title: "Contract / Subcontract Review",
    shortTitle: "Contract review",
    category: "Contracts",
    description: "Review contract language before signing or before a dispute grows.",
    purpose: "Identify scope responsibility, hidden inclusions, flow-down obligations, payment risk, notice requirements, schedule risk, warranty exposure, and items that need legal or professional review.",
    bestFor: ["Subcontractors", "Project managers", "Owners", "Consultants"],
    projectPhases: ["Buyout", "Construction"],
    audiences: ["Internal team", "Owner", "Subcontractor", "Executive"],
    inputLabels: ["User role", "Project phase", "Trade or scope", "Contract or subcontract language", "Bid or proposal language", "Exclusions and assumptions", "Known concerns"],
    reviewFocus: ["Scope responsibility", "Hidden inclusions", "Payment terms", "Retainage", "Change order notice", "Schedule obligations", "Warranty", "Indemnity", "Insurance", "Document conflicts"],
    outputSections: ["Executive summary", "High-risk items", "Missing information", "Questions before signing", "Suggested clarification email", "Go / caution / no-go recommendation"],
    nextActions: ["Preserve proposal language", "Ask for exhibit revisions", "Escalate for legal review", "Hold signature until clarified"],
    cta: "Start Contract Review",
  },
  {
    slug: "scope-comparison",
    title: "Bid vs Contract Scope Comparison",
    shortTitle: "Scope comparison",
    category: "Scope review",
    description: "Compare what was priced against what later documents require.",
    purpose: "Find work included in the contract but missing from the bid, excluded in the bid but included in the contract, vague complete-system language, and coordination scope that needs clarification.",
    bestFor: ["Estimators", "Subcontractors", "Project managers"],
    projectPhases: ["Bidding", "Buyout", "Construction"],
    audiences: ["Internal team", "Owner", "Subcontractor"],
    inputLabels: ["Project role", "Bid or proposal", "Contract scope", "Scope exhibit", "Exclusions", "Addenda or drawings", "Trade"],
    reviewFocus: ["Included versus excluded work", "Vague phrases", "Alternates", "Allowances", "Testing and commissioning", "Cleanup", "Permits", "Warranty", "Schedule impacts"],
    outputSections: ["Scope conflict matrix", "Risk summary", "Questions for GC or owner", "Suggested email response", "Internal estimator notes"],
    nextActions: ["Request contract markup", "Break out disputed items", "Escalate hidden inclusions", "Save to project"],
    cta: "Compare Scope",
  },
  {
    slug: "bid-request",
    title: "Bid Request Builder",
    shortTitle: "Bid request",
    category: "Bidding",
    description: "Build a cleaner trade request with fewer vague assumptions.",
    purpose: "Create a bid request email, scope sheet, bid form table, alternates list, allowance list, required breakout pricing, and bidder questions.",
    bestFor: ["General contractors", "Owners", "Estimators", "Consultants"],
    projectPhases: ["Preconstruction", "Bidding"],
    audiences: ["Internal team", "Subcontractor", "Executive"],
    inputLabels: ["Project type", "Trade", "Scope summary", "Renovation or new construction", "Occupied or vacant", "Funding type", "Alternates", "Allowances", "Unit prices needed", "Breakout pricing needed"],
    reviewFocus: ["Scope clarity", "Required inclusions", "Bid form structure", "Alternates", "Allowances", "Clarification deadline", "Common exclusions", "Bidder questions"],
    outputSections: ["Bid request email", "Trade scope sheet", "Bid form table", "Alternates list", "Allowances list", "Bidder questions"],
    nextActions: ["Export to XLSX later", "Issue package", "Schedule walk", "Attach to playbook"],
    cta: "Build Bid Request",
  },
  {
    slug: "bid-leveling",
    title: "Bid Leveling Assistant",
    shortTitle: "Bid leveling",
    category: "Bidding",
    description: "Compare proposals and find the differences that matter.",
    purpose: "Level multiple bids without exposing sensitive internal budget information in subcontractor-facing outputs.",
    bestFor: ["Estimators", "Project managers", "General contractors", "Owners"],
    projectPhases: ["Bidding", "Buyout"],
    audiences: ["Internal team", "Executive", "Owner"],
    inputLabels: ["Trade", "Bidder names", "Bid summaries", "Original bid request", "Scope sheet", "Budget if provided", "Known concerns"],
    reviewFocus: ["Scope inclusions", "Exclusions", "Pricing gaps", "Missing scope", "Follow-up questions", "Clarification needs", "Spread variance"],
    outputSections: ["Bid comparison summary", "Leveling table", "Risk flags", "Follow-up questions by bidder", "Clarification recommendation"],
    nextActions: ["Request bidder breakout", "Clarify exclusions", "Hold buyout", "Add to risk register"],
    cta: "Level Bids",
  },
  {
    slug: "rfi-builder",
    title: "RFI Builder",
    shortTitle: "RFI builder",
    category: "Construction",
    description: "Turn an unclear scope item, conflict, or field issue into a clean RFI.",
    purpose: "Structure the question, background, references, field condition, impact language, and needed answer so the RFI is easy to respond to.",
    bestFor: ["Project managers", "Superintendents", "Subcontractors", "Consultants"],
    projectPhases: ["Construction"],
    audiences: ["Internal team", "Architect", "Owner", "Field team"],
    inputLabels: ["Issue description", "Location", "Drawing/spec reference", "Field condition", "Impact", "Needed answer", "Proposed solution", "Attachments referenced"],
    reviewFocus: ["Clear question", "Background", "References", "Potential cost impact", "Potential schedule impact", "Responsible party"],
    outputSections: ["RFI title", "RFI question", "Background", "References", "Impact language", "Formal RFI format"],
    nextActions: ["Issue RFI", "Attach photos", "Track response date", "Save to project"],
    cta: "Draft RFI",
  },
  {
    slug: "change-order",
    title: "Change Order Narrative Builder",
    shortTitle: "Change order",
    category: "Construction",
    description: "Create a clear change order narrative based on facts.",
    purpose: "Convert original scope, added work, direction, dates, location, cost impact, schedule impact, and backup into a usable change order narrative.",
    bestFor: ["Project managers", "Subcontractors", "General contractors"],
    projectPhases: ["Construction", "Change management"],
    audiences: ["Internal team", "Owner", "Subcontractor", "Executive"],
    inputLabels: ["Original scope", "Changed condition or added work", "Who directed the work", "Dates", "Location", "Cost impact", "Schedule impact", "Supporting documents"],
    reviewFocus: ["Basis of change", "Added scope", "Direction and dates", "Cost impact", "Schedule impact", "Backup checklist", "Submission email"],
    outputSections: ["Change order title", "Executive summary", "Basis of change", "Added scope", "Assumptions", "Impact wording", "Backup checklist", "Submission email"],
    nextActions: ["Issue notice", "Collect backup", "Update cost log", "Escalate owner sensitivity"],
    cta: "Build Narrative",
  },
  {
    slug: "budget-risk",
    title: "Budget Risk Review",
    shortTitle: "Budget risk",
    category: "Budget",
    description: "Review a budget for missing scope, assumptions, and pricing exposure.",
    purpose: "Find undercarried scope, risky assumptions, line items needing subcontractor input, allowance candidates, site verification needs, and owner or developer questions.",
    bestFor: ["Developers", "Owners", "Estimators", "Consultants"],
    projectPhases: ["Due diligence", "Preconstruction", "Bidding", "Buyout"],
    audiences: ["Internal team", "Owner", "Lender", "Executive"],
    inputLabels: ["Budget", "Scope of work", "Reports or inspections", "Project type", "Unit count", "Location", "Building age", "Known funding or AHJ requirements"],
    reviewFocus: ["Missing scope", "Allowances", "Underpriced assumptions", "Subcontractor input", "Site verification", "AHJ concerns", "Funding questions", "Precon risk register"],
    outputSections: ["Budget risk summary", "Missing scope", "Line items needing clarification", "Allowance candidates", "Site verification checklist", "Owner questions", "Precon risk register"],
    nextActions: ["Move item to allowance", "Request trade pricing", "Verify with owner", "Build lender summary"],
    cta: "Review Budget",
  },
  {
    slug: "site-walk",
    title: "Site Walk Checklist Generator",
    shortTitle: "Site walk",
    category: "Field",
    description: "Create a field-focused site walk checklist for the real scope questions.",
    purpose: "Prepare questions, photos, measurements, existing conditions, access concerns, and likely scope misses before walking the site.",
    bestFor: ["Superintendents", "Estimators", "Project managers", "Consultants"],
    projectPhases: ["Due diligence", "Preconstruction", "Construction"],
    audiences: ["Internal team", "Field team"],
    inputLabels: ["Project type", "Trade or full project", "Known scope", "Known issues", "Building age", "Occupied or vacant", "Location", "Photos or reports"],
    reviewFocus: ["Questions to ask", "Photos to take", "Measurements", "Existing conditions", "Safety and access", "Likely missed scope"],
    outputSections: ["Site walk checklist", "Questions", "Photo list", "Measurements", "Existing conditions", "Safety/access concerns", "Scope misses"],
    nextActions: ["Schedule site walk", "Assign checklist owner", "Attach photos", "Save to project"],
    cta: "Build Checklist",
  },
  {
    slug: "handoff",
    title: "Precon to Operations Handoff Builder",
    shortTitle: "Project handoff",
    category: "Operations",
    description: "Create a PM and field handoff from preconstruction information.",
    purpose: "Turn budget, bid tabs, scope sheets, owner notes, schedule risks, alternates, allowances, long lead items, and open questions into a usable handoff.",
    bestFor: ["Preconstruction", "Project managers", "Superintendents", "Owners"],
    projectPhases: ["Buyout", "Construction"],
    audiences: ["Internal team", "Executive", "Field team"],
    inputLabels: ["Budget", "Bid tabs", "Scope sheets", "Owner notes", "Project schedule", "Risk items", "Pending questions", "Buyout status", "Long lead items"],
    reviewFocus: ["Budget status", "Scope risks", "Buyout priorities", "Open questions", "AHJ concerns", "Schedule risks", "Immediate next steps"],
    outputSections: ["Executive summary", "Project overview", "Budget status", "Scope risks", "Buyout priorities", "Open questions", "Schedule risks", "PM focus list"],
    nextActions: ["Assign owners", "Update risk register", "Transfer lessons learned", "Schedule kickoff"],
    cta: "Build Handoff",
  },
  {
    slug: "email-writer",
    title: "Construction Email Writer",
    shortTitle: "Construction email",
    category: "Communication",
    description: "Write direct construction emails for clarification, pricing, change, or follow-up.",
    purpose: "Create a clean subject line, email body, shorter version, and firmer version based on facts, recipient, tone, and due date.",
    bestFor: ["Project managers", "Estimators", "Superintendents", "Consultants"],
    projectPhases: ["Preconstruction", "Bidding", "Construction", "Change management"],
    audiences: ["Owner", "Subcontractor", "Architect", "Executive", "Internal team"],
    inputLabels: ["Recipient", "Purpose", "Context", "Tone", "Key facts", "Attachments referenced", "Due date"],
    reviewFocus: ["Subject line", "Clear ask", "Facts only", "Response date", "Attachment references", "Tone control"],
    outputSections: ["Subject line", "Clean email body", "Short version", "Firmer version", "Verification notes"],
    nextActions: ["Send clarification", "Save to project", "Create follow-up task"],
    cta: "Write Email",
  },
  {
    slug: "conflict-finder",
    title: "Document Conflict Finder",
    shortTitle: "Conflict finder",
    category: "Document review",
    description: "Compare multiple documents and identify conflicts and dispute risk.",
    purpose: "Compare drawings, specs, bids, contracts, budgets, reports, logs, and notes to identify conflicting direction, vague responsibility, and scope carried in one place but missing in another.",
    bestFor: ["Estimators", "Project managers", "Consultants", "Owners"],
    projectPhases: ["Preconstruction", "Bidding", "Buyout", "Construction"],
    audiences: ["Internal team", "Owner", "Executive"],
    inputLabels: ["Drawings/specs text", "Bid or proposal", "Contract or subcontract", "Scope sheet", "Budget", "Reports or logs", "Known conflicts"],
    reviewFocus: ["Bid says excluded, contract says included", "Spec requires X, drawing shows Y", "Budget allowance versus complete scope", "RFI versus subcontract conflict", "Owner report versus GC budget gap", "Proposal qualifications versus contract language"],
    outputSections: ["Conflict summary", "Conflict matrix", "Risk level", "Clarification questions", "Suggested next action", "Draft clarification email"],
    nextActions: ["Hold buyout until clarified", "Issue clarification", "Update scope matrix", "Escalate owner sensitivity"],
    cta: "Run Conflict Finder",
  },
  {
    slug: "trade-scope-builder",
    title: "Trade Scope Builder",
    shortTitle: "Trade scope builder",
    category: "Bidding",
    description: "Build trade-specific scope, breakouts, and bidder questions.",
    purpose: "Generate base scope, required inclusions, suggested exclusions to clarify, alternates, allowances, unit prices, clarification questions, common misses, submittal requirements, and closeout requirements.",
    bestFor: ["Estimators", "Project managers", "General contractors"],
    projectPhases: ["Preconstruction", "Bidding", "Buyout"],
    audiences: ["Internal team", "Subcontractor", "Executive"],
    inputLabels: ["Project type", "Trade", "Renovation or new construction", "Occupied or vacant", "Funding type", "Known conditions", "Known exclusions", "Known alternates", "Known allowances"],
    reviewFocus: ["Base scope", "Required inclusions", "Suggested exclusions to clarify", "Alternates", "Allowances", "Unit prices", "Bid form", "Closeout requirements"],
    outputSections: ["Trade scope", "Required inclusions", "Clarification questions", "Alternates and allowances", "Bid form structure", "Common misses"],
    nextActions: ["Issue bid package", "Attach trade checklist", "Export bid form later"],
    cta: "Build Trade Scope",
  },
  {
    slug: "field-notes",
    title: "Field Notes to PM Package",
    shortTitle: "Field notes package",
    category: "Field",
    description: "Turn field notes into a PM-ready package with next actions.",
    purpose: "Convert field notes, photo observations, and issue descriptions into daily report notes, an RFI draft, potential change notice, subcontractor direction email, photo captions, cost and schedule impact language, and questions to resolve.",
    bestFor: ["Superintendents", "Project managers", "Consultants"],
    projectPhases: ["Construction", "Change management"],
    audiences: ["Internal team", "Field team", "Owner", "Architect"],
    inputLabels: ["Field notes", "Photo observations", "Voice transcript or pasted memo", "Location", "Trade", "Issue date", "Responsible party if known", "Potential impact"],
    reviewFocus: ["Daily report language", "RFI draft", "Potential change notice", "Direction email", "Photo log captions", "Cost and schedule impact", "Questions to resolve", "Next best action"],
    outputSections: ["Daily report note", "RFI draft", "Potential change notice", "Direction email", "Photo captions", "Impact statement", "Questions to resolve", "Recommended next action"],
    nextActions: ["Send to PM", "Issue RFI", "Open change log item", "Attach to project"],
    cta: "Build PM Package",
  },
  {
    slug: "requirement-radar",
    title: "Requirement Radar",
    shortTitle: "Requirement radar",
    category: "Requirement review",
    description: "Identify likely requirement buckets that need human verification.",
    purpose: "Help the team identify likely requirement areas to verify based on project type, location, funding type, occupancy, building age, and scope of work. This is issue spotting, not final compliance.",
    bestFor: ["Owners", "Affordable housing teams", "Consultants", "Project managers"],
    projectPhases: ["Due diligence", "Preconstruction", "Construction"],
    audiences: ["Internal team", "Owner", "Lender", "Executive"],
    inputLabels: ["Project location", "Project type", "Building type", "Occupancy", "Building age", "New construction or renovation", "Occupied or vacant", "Scope of work", "Funding type", "Known AHJ concerns"],
    reviewFocus: ["Federal requirements", "HUD / NSPIRE", "LIHTC / Section 42", "Local AHJ and code", "Accessibility", "Energy code", "Fire and life safety", "Environmental", "Lender requirements", "Resident notification"],
    outputSections: ["Requirement buckets to verify", "Questions to ask", "Documents to request", "Who to verify with", "Inspection risks", "Recommended next action", "Disclaimer"],
    nextActions: ["Verify with AHJ", "Verify with funding agency", "Request missing documents", "Save to project"],
    cta: "Run Requirement Radar",
  },
];

export const PROMPTS: PromptDefinition[] = [
  {
    id: "estimator-miss",
    category: "Estimator prompts",
    role: "Estimator",
    task: "Find what I probably missed before I send this bid out",
    projectPhase: "Bidding",
    trade: "General",
    riskType: "Scope gap",
    outputType: "Checklist",
    experienceLevel: "Experienced",
    title: "Find what I probably missed before I send this bid out",
    useCase: "Run a fast pre-bid self-check before the package goes out or the price gets finalized.",
    inputsNeeded: ["Scope summary", "Plans/spec notes", "Bid form", "Known exclusions", "Trade"],
    expectedOutput: "Top likely misses, pricing breakouts needed, questions to ask, field verification list.",
    workflowSlug: "what-am-i-missing",
    prompt: "You are JanusScope acting as an experienced estimator. Review the scope, notes, and assumptions below. Tell me what I would check first, what is likely missing, what needs breakout pricing, which exclusions usually cause trouble, what field verification I still need, and what clarification questions should go out before bid day. Separate known facts from assumptions and put the biggest cost risk first.",
  },
  {
    id: "estimator-trade-form",
    category: "Estimator prompts",
    role: "Estimator",
    task: "Create trade-specific bid form",
    projectPhase: "Bidding",
    trade: "General",
    riskType: "Document completeness",
    outputType: "Bid form",
    experienceLevel: "Intermediate",
    title: "Create a trade-specific bid form",
    useCase: "Build cleaner pricing requests with fewer vague allowances and hidden exclusions.",
    inputsNeeded: ["Project type", "Trade", "Scope summary", "Alternates", "Allowances", "Unit prices"],
    expectedOutput: "Bid form table, required inclusions, questions bidders must answer, alternates, clarifications.",
    workflowSlug: "trade-scope-builder",
    prompt: "Build a trade-specific bid form from the information below. Include pricing breakouts, required inclusions, bidder yes-no confirmations, allowance placeholders, alternates, unit pricing, common misses to clarify, and closeout requirements. Keep the tone practical and written for construction use.",
  },
  {
    id: "pm-owner-update",
    category: "PM prompts",
    role: "PM",
    task: "Turn this messy issue into a clean owner update",
    projectPhase: "Construction",
    trade: "General",
    riskType: "Owner sensitivity",
    outputType: "Owner summary",
    experienceLevel: "Executive summary",
    title: "Turn this messy issue into a clean owner update",
    useCase: "Rewrite internal construction issues into a steady owner-facing tone.",
    inputsNeeded: ["Issue facts", "What is known", "What is unclear", "Cost impact", "Schedule impact", "Recommended next step"],
    expectedOutput: "Owner-facing update with facts, current status, verification items, and next action.",
    prompt: "Rewrite the issue below as an owner-facing construction update. Use only the facts provided. Keep the tone calm and direct. Separate what is known, what is being verified, what could affect cost or schedule, and what the recommended next step is. Do not overclaim certainty.",
  },
  {
    id: "pm-buyout-checklist",
    category: "PM prompts",
    role: "PM",
    task: "Create a buyout checklist for this trade",
    projectPhase: "Buyout",
    trade: "General",
    riskType: "Buyout risk",
    outputType: "Checklist",
    experienceLevel: "Intermediate",
    title: "Create a buyout checklist for this trade",
    useCase: "Build a practical checklist before finalizing buyout or issuing a subcontract.",
    inputsNeeded: ["Trade", "Scope sheet", "Proposal", "Budget notes", "Long lead items", "Closeout items"],
    expectedOutput: "Buyout checklist, clarification items, risk items, missing documents, and next actions.",
    workflowSlug: "handoff",
    prompt: "Create a trade buyout checklist from the information below. Include missing scope to verify, proposal qualifications to preserve, alternates, allowances, long lead concerns, closeout needs, submittal requirements, and questions that should be answered before buyout is closed.",
  },
  {
    id: "field-rfi",
    category: "Superintendent prompts",
    role: "Superintendent",
    task: "Turn a field issue into an RFI",
    projectPhase: "Construction",
    trade: "General",
    riskType: "Field issue",
    outputType: "RFI",
    experienceLevel: "Beginner",
    title: "Turn a field issue into an RFI",
    useCase: "Package a field condition clearly so the design side can answer faster.",
    inputsNeeded: ["Issue description", "Location", "Reference", "What the crew found", "Impact"],
    expectedOutput: "RFI title, question, background, references, impact wording, request for response.",
    workflowSlug: "rfi-builder",
    prompt: "Turn the field issue below into a clean construction RFI. Include a short title, the exact question, relevant background, references, field condition, possible cost or schedule impact language, and the answer needed from the design team. Do not invent facts.",
  },
  {
    id: "field-photo-summary",
    category: "Superintendent prompts",
    role: "Superintendent",
    task: "Summarize photo observations",
    projectPhase: "Construction",
    trade: "General",
    riskType: "Documentation",
    outputType: "Report",
    experienceLevel: "Intermediate",
    title: "Summarize photo observations",
    useCase: "Turn photo notes and rough observations into a PM-ready package.",
    inputsNeeded: ["Photo descriptions", "Location", "Trade", "Issue", "Potential impact"],
    expectedOutput: "Photo log captions, issue summary, impact note, next questions.",
    workflowSlug: "field-notes",
    prompt: "Review the photo observations below and create clear photo log captions, the issue summary, why it matters, likely cost or schedule effect, and the next questions that should be resolved before direction is issued.",
  },
  {
    id: "subcontractor-protection",
    category: "Subcontractor prompts",
    role: "Subcontractor",
    task: "Protect me before I sign this subcontract",
    projectPhase: "Buyout",
    trade: "General",
    riskType: "Contract risk",
    outputType: "Report",
    experienceLevel: "Experienced",
    title: "Protect me before I sign this subcontract",
    useCase: "Review subcontract language against proposal intent and exclusions.",
    inputsNeeded: ["Subcontract language", "Proposal", "Exclusions", "Assumptions", "Scope exhibit"],
    expectedOutput: "Red flags, scope conflicts, payment and notice issues, questions to raise, suggested language.",
    workflowSlug: "contract-review",
    prompt: "Review the subcontract below against my proposal, exclusions, and assumptions. Identify what could make me responsible for work I did not clearly include, what notice or payment language could create risk, what schedule or warranty language needs attention, and what clarification requests should go out before signing. Do not provide legal conclusions.",
  },
  {
    id: "subcontractor-delay",
    category: "Subcontractor prompts",
    role: "Subcontractor",
    task: "Draft a delay notice",
    projectPhase: "Construction",
    trade: "General",
    riskType: "Schedule impact",
    outputType: "Email",
    experienceLevel: "Intermediate",
    title: "Draft a delay notice",
    useCase: "Write a factual written notice around delay conditions or blocked access.",
    inputsNeeded: ["Cause of delay", "Dates", "Location", "Effect on work", "Requested resolution"],
    expectedOutput: "Notice email with facts, dates, impact, and requested action.",
    workflowSlug: "email-writer",
    prompt: "Draft a construction delay notice based only on the facts below. Include the condition, dates, impacted work, why it affects the schedule, what records exist, and the resolution needed. Keep the tone factual and preserve rights without overarguing.",
  },
  {
    id: "owner-risk-memo",
    category: "Developer prompts",
    role: "Developer / Owner",
    task: "Create owner risk memo",
    projectPhase: "Due diligence",
    trade: "General",
    riskType: "Budget risk",
    outputType: "Internal memo",
    experienceLevel: "Executive summary",
    title: "Build an owner risk memo",
    useCase: "Summarize high-priority scope, budget, and requirement concerns for decision-makers.",
    inputsNeeded: ["Project summary", "Reports", "Budget concerns", "Funding notes", "Known schedule pressures"],
    expectedOutput: "Executive summary, high-priority risks, questions to verify, recommended actions.",
    workflowSlug: "budget-risk",
    prompt: "Create an owner risk memo from the information below. Focus on what could become expensive, what remains unclear, what needs outside verification, what documents are still missing, and what decision or next step leadership should take now.",
  },
  {
    id: "owner-due-diligence",
    category: "Developer prompts",
    role: "Developer / Owner",
    task: "Generate due diligence questions",
    projectPhase: "Due diligence",
    trade: "General",
    riskType: "Requirement verification",
    outputType: "Checklist",
    experienceLevel: "Intermediate",
    title: "Generate due diligence questions",
    useCase: "Surface the questions that should be answered before closing, pricing, or lender review.",
    inputsNeeded: ["Project type", "Building age", "Funding type", "Reports", "Known concerns"],
    expectedOutput: "Questions for owner, architect, lender, AHJ, and consultants plus missing documents.",
    workflowSlug: "requirement-radar",
    prompt: "Based on the project details below, generate due diligence questions grouped by owner, architect, lender, AHJ, and consultant. Identify likely requirement buckets, missing documents, schedule risks, and what should be verified before relying on the current scope or budget.",
  },
  {
    id: "housing-nspire",
    category: "Affordable Housing prompts",
    role: "Affordable Housing Team",
    task: "Review NSPIRE report",
    projectPhase: "Due diligence",
    trade: "Occupied Rehab",
    riskType: "Inspection risk",
    outputType: "Matrix",
    experienceLevel: "Experienced",
    title: "Review NSPIRE report and build a deficiency matrix",
    useCase: "Translate a housing inspection report into scope, priority, and trade assignments.",
    inputsNeeded: ["NSPIRE report notes", "Unit list", "Occupied or vacant notes", "Scope assumptions"],
    expectedOutput: "Unit deficiency matrix, trade assignment, priority, immediate needs, field verification questions.",
    workflowSlug: "what-am-i-missing",
    prompt: "Review the NSPIRE findings below and turn them into a deficiency matrix. Separate immediate needs from broader renovation scope, assign likely trades, flag occupied-unit concerns, estimate likely cost buckets at a high level, and list the questions the owner, architect, or GC should answer next.",
  },
  {
    id: "housing-funding",
    category: "Affordable Housing prompts",
    role: "Affordable Housing Team",
    task: "Check funding requirement areas",
    projectPhase: "Preconstruction",
    trade: "Affordable Housing Compliance",
    riskType: "Funding compliance",
    outputType: "Checklist",
    experienceLevel: "Intermediate",
    title: "Check LIHTC / HUD / funding requirement areas",
    useCase: "Identify issue-spotting questions for housing projects with layered funding.",
    inputsNeeded: ["Funding type", "State", "Project type", "Scope of work", "Known concerns"],
    expectedOutput: "Requirement buckets, documents to request, questions to ask, schedule concerns.",
    workflowSlug: "requirement-radar",
    prompt: "Review the project details below and identify likely funding and housing requirement areas that should be verified. Separate requirement buckets, documents to request, parties to verify with, schedule and documentation risks, and the next best questions to ask. This is issue spotting only, not a final compliance determination.",
  },
  {
    id: "consultant-conflict",
    category: "Consultant prompts",
    role: "Consultant",
    task: "Compare conflicting documents",
    projectPhase: "Preconstruction",
    trade: "General",
    riskType: "Document conflict",
    outputType: "Matrix",
    experienceLevel: "Experienced",
    title: "Compare conflicting documents and summarize the risk",
    useCase: "Create a concise conflict matrix for mixed project documentation.",
    inputsNeeded: ["Document excerpts", "What each source says", "Known concerns", "Audience"],
    expectedOutput: "Conflict matrix, risk levels, clarification questions, next action.",
    workflowSlug: "conflict-finder",
    prompt: "Compare the documents below and identify where they conflict, why the conflict matters, who needs to answer, what the cost or schedule exposure could be, and what clarification should be requested next. Put the most expensive potential miss first.",
  },
];

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "scope-gap-matrix",
    category: "Scope review",
    role: "Estimator / PM",
    trade: "General",
    title: "Scope gap matrix",
    description: "Compare scope items across the budget, bid, contract, and responsible party.",
    type: "Matrix",
    sections: ["Scope item", "Document source", "Included in budget?", "Included in bid?", "Included in contract?", "Responsible party", "Risk level", "Clarification needed"],
  },
  {
    id: "trade-bid-form",
    category: "Bid forms",
    role: "Estimator",
    trade: "General",
    title: "Trade bid form",
    description: "Structure pricing breakouts, alternates, allowances, unit prices, exclusions, and clarifications.",
    type: "Form",
    sections: ["Base bid", "Required inclusions", "Alternates", "Allowances", "Unit prices", "Clarifications", "Exclusions"],
  },
  {
    id: "owner-risk-memo",
    category: "Reports",
    role: "Developer / Owner",
    trade: "General",
    title: "Owner risk memo",
    description: "Summarize high-priority scope, budget, schedule, and requirement issues for decision-makers.",
    type: "Report",
    sections: ["Purpose", "Inputs reviewed", "Executive summary", "High-priority risks", "Questions to verify", "Recommended next action"],
  },
  {
    id: "nspire-matrix",
    category: "Affordable Housing",
    role: "Affordable Housing Team",
    trade: "Occupied Rehab",
    title: "NSPIRE deficiency matrix",
    description: "Track unit-by-unit deficiencies, trade assignment, priority, occupancy impact, and next steps.",
    type: "Matrix",
    sections: ["Unit", "Deficiency", "Trade", "Priority", "Occupied or vacant", "Immediate need or rehab scope", "Questions", "Status"],
  },
  {
    id: "buyout-checklist",
    category: "Buyout",
    role: "PM",
    trade: "General",
    title: "Buyout checklist",
    description: "Track scope carry, proposal qualifications, alternates, long lead items, and closeout requirements.",
    type: "Checklist",
    sections: ["Scope carry", "Qualifications", "Alternates", "Allowances", "Long lead items", "Submittals", "Closeout"],
  },
  {
    id: "field-issue-package",
    category: "Field",
    role: "Superintendent",
    trade: "General",
    title: "Field issue to PM package",
    description: "Capture field observations, photo notes, impact language, and next questions.",
    type: "Report",
    sections: ["Issue summary", "Location", "Photos", "Current impact", "Questions to resolve", "Recommended next action"],
  },
  {
    id: "lessons-template",
    category: "Lessons",
    role: "All roles",
    trade: "General",
    title: "Lessons learned entry",
    description: "Turn a miss into a reusable prevention note and checklist item.",
    type: "Form",
    sections: ["Missed scope", "What happened", "Cause", "Cost impact", "Schedule impact", "How to prevent it", "Checklist item"],
  },
  {
    id: "requirement-checklist",
    category: "Requirement Radar",
    role: "Owner / Consultant",
    trade: "General",
    title: "Requirement verification checklist",
    description: "Group likely requirement buckets, documents, and parties to verify with.",
    type: "Checklist",
    sections: ["Requirement bucket", "Why it matters", "Documents to request", "Who to verify with", "Status"],
  },
];

export const TRADE_REVIEW_MODES = [
  "Electrical Scope Reviewer",
  "Plumbing Scope Reviewer",
  "HVAC Scope Reviewer",
  "Window Scope Reviewer",
  "Roofing Scope Reviewer",
  "Flooring Scope Reviewer",
  "Drywall / Paint Scope Reviewer",
  "Doors / Hardware Reviewer",
  "Cabinets / Countertops Reviewer",
  "Abatement Reviewer",
  "Fire / Life Safety Reviewer",
  "Accessibility Reviewer",
];

export const TRADE_RISKS: TradeRiskDefinition[] = [
  {
    slug: "electrical",
    title: "Electrical",
    trade: "Electrical",
    reviewMode: "Electrical Scope Reviewer",
    summary: "Use when panel upgrades, occupied rehab, grounding, devices, fixture swaps, low voltage, and utility coordination are easy to undercarry.",
    commonMisses: ["Panel schedules may not match existing conditions", "Meter packs or service upgrades may be unclear", "Grounding and bonding scope may be missing", "Drywall patching after electrical work may be excluded", "Temporary power may not be carried", "Occupied-unit access premium may not be priced"],
    badExclusions: ["Permit fees excluded without owner awareness", "Testing and inspection support excluded", "Device replacement versus reuse left vague", "Firestopping excluded even though penetrations are required"],
    hiddenCosts: ["Utility coordination", "Arc-fault and GFCI upgrades", "Labeling and circuit tracing", "Existing aluminum wiring conditions", "Weekend access in occupied work"],
    coordinationIssues: ["Low voltage responsibility unclear", "Fire alarm interface unclear", "Drywall and paint patching not aligned", "Utility shutdown timing not coordinated"],
    questions: ["Does pricing include permit, utility coordination, inspection support, and patching?", "Are panel, breakers, grounding, and labeling all included?", "What assumptions were made about existing conditions?"],
    alternates: ["Panel replacement alternate", "Fixture package alternate", "Occupied-unit premium alternate"],
    allowances: ["Allowance for concealed condition repairs", "Allowance for drywall patching", "Allowance for utility company fees"],
    changeOrderTriggers: ["Existing conditions differ from panel schedule", "Utility requirements expand scope", "Concealed wiring damage discovered", "Access restrictions reduce crew productivity"],
    inspectionConcerns: ["AFCI/GFCI applicability", "Bonding continuity", "Inspection sequencing", "Temporary life-safety requirements"],
    closeoutItems: ["Panel directories", "As-builts", "Test reports", "O&M data", "Warranty coverage"],
    bidFormBreakouts: ["Mobilization", "Permit", "Demo", "Subpanel replacement", "Meter pack work", "Feeders", "Grounding / bonding", "Devices", "Fixtures", "Fire alarm", "Low voltage", "Drywall patching yes or no", "Testing / inspection", "Unit price per panel", "Unit price per device"],
    suggestedPrompts: ["Find likely missing electrical scope", "Compare electrical proposal against subcontract", "Build electrical bid form", "Ask what an experienced estimator would verify first"],
    suggestedTemplates: ["Trade bid form", "Scope gap matrix", "Buyout checklist"],
    suggestedChecklist: ["Verify panel assumptions", "Verify permit and utility scope", "Verify patching responsibility", "Verify low voltage and fire alarm boundaries"],
  },
  {
    slug: "plumbing",
    title: "Plumbing",
    trade: "Plumbing",
    reviewMode: "Plumbing Scope Reviewer",
    summary: "Use when shutoffs, occupied-unit access, fixture swaps, patching, and existing condition assumptions are easy to miss.",
    commonMisses: ["Domestic isolation and shutdown planning", "Wall and floor patching after pipe work", "Fixture carrier or support conditions", "Water heater venting revisions", "Existing supply and waste condition uncertainty"],
    badExclusions: ["Permit excluded without clear owner carry", "Water shutoff coordination excluded", "Access panels excluded", "Testing and disinfection excluded"],
    hiddenCosts: ["Weekend shutdowns", "Concealed piping repairs", "Fixture protection and reinstallation", "Hot water recirculation balancing"],
    coordinationIssues: ["Cabinet and countertop penetrations", "Firestopping at pipe penetrations", "Roofing tie-ins for vents", "Resident notice for occupied shutdowns"],
    questions: ["Who carries shutdown planning and resident notices?", "Does scope include patching and access panels?", "What was assumed about concealed piping condition?"],
    alternates: ["Water heater replacement alternate", "Pipe insulation alternate"],
    allowances: ["Allowance for concealed piping damage", "Allowance for occupied-unit overtime"],
    changeOrderTriggers: ["Unusable existing valves", "Inaccessible or deteriorated piping", "Additional code-driven replacements"],
    inspectionConcerns: ["Pressure testing", "Backflow requirements", "Water temperature controls", "Trap and vent compliance"],
    closeoutItems: ["Valve charts", "Warranty data", "Start-up records", "O&M manuals"],
    bidFormBreakouts: ["Demo", "Fixture replacement", "Water heaters", "Branch piping", "Valves", "Insulation", "Testing", "Patching", "Unit pricing"],
    suggestedPrompts: ["Review this plumbing scope for hidden cost", "Draft plumbing clarification questions", "Build plumbing bid form"],
    suggestedTemplates: ["Trade bid form", "Field issue package"],
    suggestedChecklist: ["Verify shutoff assumptions", "Verify patching", "Verify testing", "Verify access constraints"],
  },
  {
    slug: "hvac",
    title: "HVAC",
    trade: "HVAC",
    reviewMode: "HVAC Scope Reviewer",
    summary: "Use when controls, balancing, insulation, patching, and existing equipment conditions create hidden carry.",
    commonMisses: ["Controls integration scope", "Testing, adjusting, and balancing", "Line set concealment and patching", "Condensate routing revisions", "Equipment curb or structural support needs"],
    badExclusions: ["Startup excluded", "Permit excluded", "Roof patching excluded without coordination", "Demolition and disposal left vague"],
    hiddenCosts: ["Occupied temperature control measures", "Lead times on equipment", "Electrical disconnect and control coordination", "Commissioning support"],
    coordinationIssues: ["Controls versus electrician scope", "Roof penetration patching", "Ceiling access and restoration", "Tenant comfort during cutovers"],
    questions: ["Who owns startup, balancing, controls, and commissioning support?", "What was assumed about roof patching and structural support?", "How will occupied comfort be maintained during cutovers?"],
    alternates: ["Equipment replacement alternate", "Controls upgrade alternate"],
    allowances: ["Allowance for roof patching", "Allowance for control revisions"],
    changeOrderTriggers: ["Existing equipment conditions differ", "Controls compatibility issues", "Duct rerouting due to field conflicts"],
    inspectionConcerns: ["Mechanical permit closeout", "Fresh air and exhaust requirements", "Thermostat control sequencing"],
    closeoutItems: ["Startup reports", "TAB reports", "Controls training", "Warranty documentation"],
    bidFormBreakouts: ["Equipment", "Demo", "Controls", "Line sets", "Duct revisions", "Insulation", "Roof patching", "Balancing", "Commissioning support"],
    suggestedPrompts: ["Find HVAC scope risk", "Prepare HVAC bidder questions", "Build HVAC scope sheet"],
    suggestedTemplates: ["Trade bid form", "Buyout checklist"],
    suggestedChecklist: ["Verify controls", "Verify balancing", "Verify patching", "Verify lead times"],
  },
  {
    slug: "roofing",
    title: "Roofing",
    trade: "Roofing",
    reviewMode: "Roofing Scope Reviewer",
    summary: "Use when dry-in responsibility, flashing, deck repairs, and tie-in sequencing create expensive ambiguity.",
    commonMisses: ["Deck repair assumptions", "Penetration flashing coordination", "Temporary dry-in", "Tapered insulation transitions", "Warranty inspection coordination"],
    badExclusions: ["Permit excluded", "Deck repairs broadly excluded", "Sheet metal interface left vague", "Temporary weather protection excluded"],
    hiddenCosts: ["Occupied leak response", "Roof access logistics", "Material staging constraints", "Unexpected deck replacement"],
    coordinationIssues: ["HVAC curb work", "Sheet metal trim", "Lightning protection", "Solar or low voltage penetrations"],
    questions: ["Who owns temporary dry-in and protection?", "How are deck repairs handled if discovered?", "Who coordinates penetrations and flashing details?"],
    alternates: ["Additional insulation alternate", "Warranty level alternate"],
    allowances: ["Allowance for deck repairs", "Allowance for occupied weather protection"],
    changeOrderTriggers: ["Wet insulation discovery", "Deck deterioration", "Unexpected penetration conflicts"],
    inspectionConcerns: ["Manufacturer inspection", "Flashing details", "Drainage slope and ponding risks"],
    closeoutItems: ["Warranty paperwork", "Inspection signoff", "As-built roof plan"],
    bidFormBreakouts: ["Demo", "Dry-in", "Membrane", "Insulation", "Sheet metal", "Deck repairs allowance", "Warranty", "Penetration flashing"],
    suggestedPrompts: ["Review roofing exclusions", "Build roofing bidder checklist"],
    suggestedTemplates: ["Trade bid form", "Scope gap matrix"],
    suggestedChecklist: ["Verify dry-in", "Verify deck repairs", "Verify flashing scope", "Verify warranty support"],
  },
  {
    slug: "windows",
    title: "Windows",
    trade: "Windows",
    reviewMode: "Window Scope Reviewer",
    summary: "Use when removal assumptions, flashing, trims, patching, and occupant protection are easy to overlook.",
    commonMisses: ["Interior trim restoration", "Exterior flashing integration", "Lead-safe or hazmat prep", "Occupied dust control and protection", "Water testing responsibility"],
    badExclusions: ["Patching excluded without clear owner carry", "Permit excluded", "Temporary weatherproofing excluded", "Disposal left vague"],
    hiddenCosts: ["Rot repair", "Interior finish restoration", "Tenant access coordination", "Shoring or temporary protection"],
    coordinationIssues: ["Stucco or siding patching", "Interior paint", "Blinds and hardware removal", "Schedule sequencing by unit"],
    questions: ["Who owns interior and exterior patching?", "What was assumed about rot or substrate damage?", "How are occupied-unit access and protection handled?"],
    alternates: ["Premium glazing alternate", "Trim replacement alternate"],
    allowances: ["Allowance for substrate repair", "Allowance for occupied-unit protection"],
    changeOrderTriggers: ["Rot or substrate failure", "Unexpected dimension mismatch", "Additional finish restoration needed"],
    inspectionConcerns: ["Flashing details", "Water intrusion testing", "Safety glazing requirements"],
    closeoutItems: ["Warranty information", "Product data", "Care instructions"],
    bidFormBreakouts: ["Demo", "New windows", "Flashing", "Interior trim", "Exterior patching", "Protection", "Testing", "Unit pricing"],
    suggestedPrompts: ["Find likely missing window scope", "Draft window clarification questions"],
    suggestedTemplates: ["Trade bid form", "Field issue package"],
    suggestedChecklist: ["Verify patching", "Verify substrate assumptions", "Verify occupied protection", "Verify testing"],
  },
  {
    slug: "flooring",
    title: "Flooring",
    trade: "Flooring",
    reviewMode: "Flooring Scope Reviewer",
    summary: "Use when floor prep, moisture, transitions, occupied work, and furniture moving are underdefined.",
    commonMisses: ["Floor prep level and quantity", "Moisture mitigation need", "Furniture moving", "Closet and stair areas", "Occupied-unit premium"],
    badExclusions: ["Floor prep excluded entirely", "Transitions excluded", "Disposal left vague", "Base replacement or reset unclear"],
    hiddenCosts: ["Moisture testing", "Adhesive abatement concerns", "After-hours access", "Resident protection"],
    coordinationIssues: ["Cabinet kick removal", "Appliance move and reconnect", "Door undercuts", "Painting after base removal"],
    questions: ["What was assumed for floor prep and moisture?", "Who moves furniture and appliances?", "Are stairs and closets included?"],
    alternates: ["LVP alternate", "Moisture mitigation allowance alternate"],
    allowances: ["Allowance for floor prep", "Allowance for moisture mitigation"],
    changeOrderTriggers: ["Substrate damage", "Moisture failure", "Unexpected transition conditions"],
    inspectionConcerns: ["Moisture testing records", "Trip transitions", "Finish quality in occupied units"],
    closeoutItems: ["Maintenance data", "Warranty", "Attic stock if required"],
    bidFormBreakouts: ["Carpet SF", "LVP SF", "Base LF", "Floor prep allowance", "Moisture mitigation", "Furniture moving", "Demo and removal", "Disposal", "Transitions", "Stairs", "Occupied-unit premium", "Unit pricing"],
    suggestedPrompts: ["Review flooring scope gaps", "Build flooring bid form"],
    suggestedTemplates: ["Trade bid form", "Lessons learned entry"],
    suggestedChecklist: ["Verify floor prep", "Verify furniture moving", "Verify transitions", "Verify moisture testing"],
  },
  {
    slug: "doors-hardware",
    title: "Doors / Hardware",
    trade: "Doors / Hardware",
    reviewMode: "Doors / Hardware Reviewer",
    summary: "Use when handing, frame conditions, access control, and fire-rating issues create downstream confusion.",
    commonMisses: ["Existing frame condition assumptions", "Keying and core schedule", "Fire-rated opening repairs", "Access control integration", "Door and frame field verification"],
    badExclusions: ["Hardware schedule coordination excluded", "Painting excluded", "Fire caulk and label issues excluded"],
    hiddenCosts: ["Frame repairs", "Lead times on hardware", "Rekeying labor", "Access control interface work"],
    coordinationIssues: ["Electrical for electrified hardware", "Access control programming", "Wall patching around frames", "Resident access during occupied work"],
    questions: ["Who owns keying and core schedule coordination?", "What was assumed about existing frame condition?", "Does scope include access control interface work?"],
    alternates: ["Hardware package alternate", "Access control alternate"],
    allowances: ["Allowance for frame repairs", "Allowance for electrified hardware revisions"],
    changeOrderTriggers: ["Frame damage", "Fire-rated opening deficiencies", "Access control scope expansion"],
    inspectionConcerns: ["Egress hardware", "Fire door labels", "Closer and latch operation"],
    closeoutItems: ["Hardware schedule as-installed", "Key log", "Warranty data"],
    bidFormBreakouts: ["Door slabs", "Frames", "Hardware", "Keying", "Painting", "Access control interface", "Frame repair allowance"],
    suggestedPrompts: ["Review door and hardware scope", "Prepare hardware clarification questions"],
    suggestedTemplates: ["Trade bid form", "Buyout checklist"],
    suggestedChecklist: ["Verify handing", "Verify keying", "Verify electrified hardware", "Verify frame condition"],
  },
  {
    slug: "abatement",
    title: "Abatement",
    trade: "Abatement",
    reviewMode: "Abatement Reviewer",
    summary: "Use when sampling assumptions, containment, negative air, clearance testing, and occupied sequencing create major risk.",
    commonMisses: ["Sampling limitations", "Clearance testing responsibility", "Temporary containment impacts", "Resident notice and relocation needs", "Disposal manifest handling"],
    badExclusions: ["Clearance testing excluded without owner awareness", "Permit and notification scope unclear", "Overtime containment work excluded", "Unexpected quantities broadly excluded"],
    hiddenCosts: ["Occupied phasing", "Air monitoring", "After-hours work", "Additional containment"],
    coordinationIssues: ["Trade turnover after clearance", "Resident relocation timing", "Waste haul routes", "Protection of adjacent finished spaces"],
    questions: ["Who owns sampling, testing, and clearance?", "How will containment affect adjacent work and occupants?", "What assumptions were made about quantities and access?"],
    alternates: ["Additional unit quantity alternate", "After-hours occupied work alternate"],
    allowances: ["Allowance for additional quantities", "Allowance for occupied containment premium"],
    changeOrderTriggers: ["Additional hazardous material found", "Expanded containment area", "Delayed clearance results"],
    inspectionConcerns: ["Air monitoring", "Clearance timing", "Manifest completeness"],
    closeoutItems: ["Clearance reports", "Waste manifests", "Final abatement summary"],
    bidFormBreakouts: ["Sampling", "Containment", "Removal", "Disposal", "Clearance", "Occupied premium", "Additional quantity unit prices"],
    suggestedPrompts: ["Review abatement scope assumptions", "Build abatement bidder questions"],
    suggestedTemplates: ["Trade bid form", "Requirement verification checklist"],
    suggestedChecklist: ["Verify sampling", "Verify clearance", "Verify occupied sequencing", "Verify disposal documentation"],
  },
  {
    slug: "fire-life-safety",
    title: "Fire / Life Safety",
    trade: "Fire / Life Safety",
    reviewMode: "Fire / Life Safety Reviewer",
    summary: "Use when fire alarm, sprinklers, egress, smoke barriers, and inspections cut across multiple trades.",
    commonMisses: ["System shutdown coordination", "Monitoring and fire watch", "Penetration firestopping", "Sprinkler head relocation versus replacement", "Sequence of life-safety inspections"],
    badExclusions: ["Monitoring coordination excluded", "Temporary life-safety measures excluded", "Testing support excluded"],
    hiddenCosts: ["Night work to maintain occupancy", "Fire watch labor", "Cross-trade coordination", "AHJ-driven revisions"],
    coordinationIssues: ["Electrical and low voltage boundaries", "Ceiling patching after sprinkler work", "Firestopping ownership", "Resident notification"],
    questions: ["Who owns monitoring and testing support?", "What temporary life-safety measures are required during shutdowns?", "Where do firestopping responsibilities land?"],
    alternates: ["Alarm device replacement alternate", "Sprinkler head replacement alternate"],
    allowances: ["Allowance for fire watch", "Allowance for patching after above-ceiling work"],
    changeOrderTriggers: ["AHJ interpretation changes", "Existing system compatibility issues", "Unexpected deficiency corrections"],
    inspectionConcerns: ["Alarm testing", "Sprinkler coverage and spacing", "Egress path integrity", "Smoke barrier continuity"],
    closeoutItems: ["Test reports", "Monitoring certification", "As-builts", "Warranty"],
    bidFormBreakouts: ["Demo", "Alarm", "Sprinkler", "Firestopping", "Monitoring", "Testing", "Patching", "Fire watch allowance"],
    suggestedPrompts: ["Review fire-life-safety scope", "Draft life-safety clarification questions"],
    suggestedTemplates: ["Trade bid form", "Requirement verification checklist"],
    suggestedChecklist: ["Verify shutdowns", "Verify monitoring", "Verify firestopping", "Verify inspection sequence"],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    trade: "Accessibility",
    reviewMode: "Accessibility Reviewer",
    summary: "Use when thresholds, clearances, accessible fixtures, paths, and housing accessibility obligations need issue spotting.",
    commonMisses: ["Threshold and transition compliance questions", "Clear floor space impacts", "Accessible hardware and mounting heights", "Bathroom accessory layouts", "Route and maneuvering clearance conflicts"],
    badExclusions: ["Field verification excluded", "Accessory scope pushed to owner without clarity", "Patch and finish work excluded"],
    hiddenCosts: ["Rework from missed clearance", "Accessory resets", "Door hardware changes", "Site path upgrades"],
    coordinationIssues: ["Cabinetry and countertop heights", "Door hardware and closer force", "Site path slopes", "Plumbing and electrical fixture mounting"],
    questions: ["Which accessibility standard applies and who is confirming it?", "What field dimensions still need verification?", "Which disciplines need to coordinate mounting and clearances?"],
    alternates: ["Accessory package alternate", "Threshold revision alternate"],
    allowances: ["Allowance for field-driven accessory relocation", "Allowance for finish patching"],
    changeOrderTriggers: ["Field dimensions differ from drawings", "Owner standard changes", "AHJ or consultant comments add scope"],
    inspectionConcerns: ["Clearances", "Reach ranges", "Threshold heights", "Door operation"],
    closeoutItems: ["As-built dimensions if required", "Product data", "Warranty information"],
    bidFormBreakouts: ["Accessories", "Door hardware revisions", "Threshold work", "Fixture mounting", "Patching", "Unit pricing"],
    suggestedPrompts: ["Issue-spot accessibility risk", "Build accessibility verification questions"],
    suggestedTemplates: ["Requirement verification checklist", "Scope gap matrix"],
    suggestedChecklist: ["Verify standard", "Verify field dimensions", "Verify mounting coordination", "Verify paths of travel"],
  },
  {
    slug: "occupied-rehab",
    title: "Occupied Rehab",
    trade: "Occupied Rehab",
    reviewMode: "Accessibility Reviewer",
    summary: "Use when phasing, resident impact, access, notices, and unit turnover assumptions drive scope and schedule risk.",
    commonMisses: ["Resident notice sequencing", "Temporary facilities or relocation assumptions", "Daily clean-up standards", "Access windows by unit", "Tenant protection measures"],
    badExclusions: ["Resident coordination excluded", "Protection and temporary barriers excluded", "After-hours premium left vague"],
    hiddenCosts: ["Reduced crew productivity", "Tenant reschedules", "Protection and cleanup", "Longer turnover durations"],
    coordinationIssues: ["Owner notices", "Move management", "Resident services coordination", "Inspection timing by unit"],
    questions: ["What are the access windows per unit?", "Who handles tenant communication?", "What protection and cleanup standards apply each day?"],
    alternates: ["Vacant-unit pricing alternate", "After-hours occupied work alternate"],
    allowances: ["Allowance for resident protection materials", "Allowance for schedule float due to access"],
    changeOrderTriggers: ["Denied access", "Unexpected resident needs", "Expanded protection requirements"],
    inspectionConcerns: ["Habitability", "Daily clean-up", "Temporary life-safety", "Resident communication logs"],
    closeoutItems: ["Unit turnover records", "Resident signoff if applicable", "Closeout punch tracking"],
    bidFormBreakouts: ["Unit pricing", "Occupied premium", "Protection", "Cleaning", "Access coordination", "Turnover duration"],
    suggestedPrompts: ["Plan occupied rehab phasing", "Build resident-impact checklist"],
    suggestedTemplates: ["NSPIRE deficiency matrix", "Field issue package"],
    suggestedChecklist: ["Verify notices", "Verify access windows", "Verify protection", "Verify turnover assumptions"],
  },
];

export const REQUIREMENT_BUCKETS: RequirementBucketDefinition[] = [
  {
    id: "federal",
    title: "Federal requirements",
    summary: "Use when federal funding, federal oversight, or federal reporting may shape scope and documentation.",
    questions: ["Is any federal funding involved or possible?", "Do wage, procurement, or reporting rules flow from that funding?", "What deadlines or documentation are tied to the funding source?"],
    documents: ["Funding agreements", "Grant or loan terms", "Procurement requirements", "Reporting forms"],
    verifyWith: ["Owner", "Lender", "Funding agency", "Consultant"],
  },
  {
    id: "hud-nspire",
    title: "HUD / NSPIRE",
    summary: "Use when HUD-assisted housing, NSPIRE deficiencies, or inspection-driven rehab scope could control priorities.",
    questions: ["Is the property HUD-assisted or subject to NSPIRE?", "Are there inspection findings or immediate needs already documented?", "What correction timelines apply?"],
    documents: ["NSPIRE reports", "HUD correspondence", "Immediate needs lists", "Unit matrices"],
    verifyWith: ["Owner", "HUD representative", "Property management", "Architect"],
  },
  {
    id: "lihtc",
    title: "LIHTC / Section 42",
    summary: "Use when tax-credit requirements, placed-in-service timing, or agency review may affect the project.",
    questions: ["Is LIHTC involved?", "What state housing agency requirements apply?", "Are placed-in-service or tenant-impact deadlines driving the plan?"],
    documents: ["Allocation documents", "Agency correspondence", "Project schedule milestones", "Compliance guides"],
    verifyWith: ["Owner", "State housing finance agency", "Tax credit consultant", "Lender"],
  },
  {
    id: "ahj",
    title: "Local AHJ / adopted building codes",
    summary: "Use when permit path, local amendments, or AHJ interpretation could expand scope or change sequencing.",
    questions: ["Who is the AHJ and what permit path applies?", "Are local amendments likely to matter?", "What inspections or phased signoffs control the work?"],
    documents: ["Permit notes", "Local amendment references", "Prior permit history", "AHJ comments"],
    verifyWith: ["AHJ", "Architect", "Engineer", "Permit expediter"],
  },
  {
    id: "accessibility",
    title: "Accessibility requirements",
    summary: "Use when route, unit, or fixture work may trigger accessible design or field verification questions.",
    questions: ["Which accessibility standard likely applies?", "What field dimensions or existing conditions still need verification?", "Which disciplines share the accessibility scope?"],
    documents: ["Accessibility review notes", "Plans", "Consultant comments", "Existing condition dimensions"],
    verifyWith: ["Architect", "Accessibility consultant", "AHJ", "Owner"],
  },
  {
    id: "fire-life-safety",
    title: "Fire / life safety",
    summary: "Use when fire alarm, sprinklers, egress, barriers, or temporary life-safety measures may be affected.",
    questions: ["What systems will be impacted?", "What temporary protection is required during work?", "What test or shutdown procedures control sequencing?"],
    documents: ["Fire alarm plans", "Sprinkler plans", "Inspection reports", "AHJ comments"],
    verifyWith: ["AHJ", "Fire protection engineer", "GC", "Owner"],
  },
  {
    id: "environmental",
    title: "Environmental / hazardous materials",
    summary: "Use when building age, prior reports, or renovation scope suggest asbestos, lead, mold, or other hazards.",
    questions: ["Are hazmat reports available?", "What assumptions were made about quantities and locations?", "How do abatement sequencing and access affect the larger schedule?"],
    documents: ["Hazmat reports", "Sampling plans", "Abatement scopes", "Clearance documentation"],
    verifyWith: ["Owner", "Environmental consultant", "Abatement contractor", "GC"],
  },
  {
    id: "lender-owner",
    title: "Lender requirements and owner standards",
    summary: "Use when closeout formats, reserve release conditions, or owner-specific standards affect deliverables.",
    questions: ["What does the lender need for release or approval?", "Are there owner standards beyond drawings and specs?", "What immediate needs documentation is required?"],
    documents: ["Lender requirements", "Owner standards", "Immediate needs trackers", "Draw request documentation"],
    verifyWith: ["Lender", "Owner", "Developer representative", "Consultant"],
  },
  {
    id: "resident",
    title: "Resident notification / relocation",
    summary: "Use when occupied work, resident services, or temporary relocation may change the plan.",
    questions: ["How are residents notified and tracked?", "What access windows exist?", "Are temporary relocations or special accommodations needed?"],
    documents: ["Resident communication plans", "Occupancy lists", "Phasing plans", "Relocation policies"],
    verifyWith: ["Owner", "Property management", "Resident services", "GC"],
  },
  {
    id: "workforce",
    title: "Prevailing wage, Section 3, and participation goals",
    summary: "Use when funding or owner requirements may create wage, workforce, or participation obligations.",
    questions: ["Could prevailing wage apply?", "Are Section 3 or MBE / WBE goals in play?", "What documentation or reporting is required?"],
    documents: ["Funding documents", "Bid instructions", "Owner requirements", "Workforce reporting forms"],
    verifyWith: ["Owner", "Funding agency", "Lender", "Consultant"],
  },
];

export const AFFORDABLE_HOUSING_MODULES: AffordableHousingModuleDefinition[] = [
  {
    slug: "nspire",
    title: "NSPIRE Matrix Builder",
    description: "Turn inspection findings into a deficiency matrix with trades, priorities, occupied status, and next questions.",
    inputs: ["NSPIRE report", "Unit matrix", "Occupied or vacant data", "Scope notes", "Trade assignments if known"],
    outputs: ["Unit-by-unit deficiency matrix", "Trade assignment", "Priority ranking", "Immediate needs versus renovation scope", "Bid package scope items", "Field verification checklist"],
  },
  {
    slug: "pcna",
    title: "PCNA / CNA Review Assistant",
    description: "Review capital needs reports for immediate needs, long-term gaps, and missing pricing coverage.",
    inputs: ["PCNA / CNA report", "Budget if available", "Scope of work", "Project type", "Building age", "Funding type"],
    outputs: ["Immediate needs", "Short-term needs", "Long-term capital needs", "Missing scope", "Budget risk", "Lender concerns"],
  },
  {
    slug: "funding-checklist",
    title: "LIHTC / Funding Requirement Checklist",
    description: "Issue-spot funding-related requirement buckets and questions to verify.",
    inputs: ["Funding type", "State", "Project type", "Rehab or new construction", "Owner requirements", "Scope of work"],
    outputs: ["Requirement areas to verify", "Questions for owner", "Questions for architect", "Questions for lender", "Schedule and documentation risks"],
  },
  {
    slug: "occupied-rehab",
    title: "Occupied Rehab Planner",
    description: "Plan phasing, access, tenant impact, and sequencing risk for occupied work.",
    inputs: ["Unit count", "Occupied or vacant units", "Scope by unit", "Work days per unit", "Relocation assumptions", "Inspection requirements", "Long lead materials"],
    outputs: ["Phasing questions", "Crew flow assumptions", "Tenant impact list", "Critical path risks", "Field coordination checklist"],
  },
];

export const QUICK_TOOLS: QuickToolDefinition[] = [
  { slug: "email-cleaner", title: "Construction email cleaner", description: "Rewrite rough notes into a direct construction email.", output: "Email" },
  { slug: "rfi-title", title: "RFI title generator", description: "Generate sharper titles for RFIs from rough issue notes.", output: "RFI title" },
  { slug: "meeting-agenda", title: "Meeting agenda builder", description: "Turn open issues into an organized agenda with owners.", output: "Agenda" },
  { slug: "minutes-cleaner", title: "Meeting minutes cleaner", description: "Convert rough minutes into action items and due dates.", output: "Minutes" },
  { slug: "scope-cleaner", title: "Scope language cleaner", description: "Rewrite vague scope language into something tighter and clearer.", output: "Scope sheet" },
  { slug: "exclusions", title: "Exclusion language builder", description: "Draft exclusions that preserve what was assumed or omitted.", output: "Proposal language" },
  { slug: "owner-update", title: "Owner update builder", description: "Turn issue facts into an owner-facing update.", output: "Owner update" },
  { slug: "cost-exposure", title: "Cost exposure summary", description: "Summarize what could cost more and why.", output: "Internal memo" },
  { slug: "photo-caption", title: "Photo caption generator", description: "Create consistent captions for field photos.", output: "Photo log" },
  { slug: "risk-register", title: "Project risk register updater", description: "Turn issues into risk register entries with owners and next action.", output: "Risk register" },
];

export const CALCULATORS: CalculatorDefinition[] = [
  { slug: "cost-sf", title: "Cost per SF", description: "Divide total cost by square footage to compare scopes and budgets.", inputs: ["Total cost", "Square footage"], formulaHint: "Total cost / square footage" },
  { slug: "cost-unit", title: "Cost per unit", description: "Compare rehab or replacement costs per dwelling unit.", inputs: ["Total cost", "Unit count"], formulaHint: "Total cost / unit count" },
  { slug: "contingency", title: "Contingency calculator", description: "Apply contingency percentages to a budget or package.", inputs: ["Base amount", "Contingency percent"], formulaHint: "Base amount x contingency percent" },
  { slug: "escalation", title: "Escalation calculator", description: "Estimate cost growth over time using an escalation rate.", inputs: ["Base amount", "Escalation percent", "Duration in months"], formulaHint: "Base amount x escalation percent x duration factor" },
  { slug: "retainage", title: "Retainage calculator", description: "Estimate current retainage held against billed work.", inputs: ["Contract value", "Percent complete", "Retainage percent"], formulaHint: "Earned value x retainage percent" },
  { slug: "markup", title: "Change order markup calculator", description: "Apply markup to direct cost for pricing reviews.", inputs: ["Direct cost", "Markup percent"], formulaHint: "Direct cost x markup percent" },
  { slug: "burn", title: "General conditions monthly burn", description: "Estimate monthly general conditions spend and duration impact.", inputs: ["Monthly burn", "Months"], formulaHint: "Monthly burn x duration" },
  { slug: "rent-loss", title: "Rent loss / downtime calculator", description: "Estimate downtime cost for occupied rehab or unit outages.", inputs: ["Units affected", "Monthly rent", "Days offline"], formulaHint: "Rent x units x downtime factor" },
];

export const CONSULTING_SERVICES = [
  "Contract and subcontract review",
  "Scope gap review",
  "Bid package and bid form setup",
  "Bid leveling support",
  "Budget risk review",
  "Change order support",
  "Requirement issue spotting",
  "Affordable housing review support",
  "Workflow and playbook setup",
];

export const ASK_JANUS_STARTERS = [
  "What am I missing in this package?",
  "Review this subcontract and tell me what could hurt me.",
  "Compare this proposal against this subcontract language.",
  "Draft an RFI from this field condition.",
  "Turn this field note into a PM package.",
  "Build a change order narrative from these facts.",
  "Create an owner-facing risk memo from this issue.",
  "Find missing scope in this budget.",
  "Check what requirement areas we should verify.",
  "What would an experienced estimator check first?",
];

export const TRANSFORM_ACTIONS = [
  "Explain this like I am new",
  "Make this shorter",
  "Make this more formal",
  "Make this field-friendly",
  "Make this owner-facing",
  "Make this subcontractor-facing",
  "Make this executive-level",
  "Turn into an email",
  "Turn into a checklist",
  "Turn into an Excel table",
  "Save to project",
  "Export PDF",
];

export function getWorkflow(slug: string): WorkflowDefinition | undefined {
  return WORKFLOWS.find((workflow) => workflow.slug === slug);
}

export function getRoleMode(roleId: string): RoleDefinition | undefined {
  return ROLE_MODES.find((role) => role.id === roleId);
}

export function getTradeRisk(slug: string): TradeRiskDefinition | undefined {
  return TRADE_RISKS.find((trade) => trade.slug === slug);
}
