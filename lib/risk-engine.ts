import {
  Assumption,
  ClarificationQuestion,
  ContractComparison,
  ExclusionCheck,
  HiddenScopeFlag,
  IssueLogItem,
  MissingDocument,
  Project,
  QuestionGroup,
  ReportNote,
  RiskCategory,
  RiskFlag,
  RiskReview,
  Severity,
} from "@/lib/types";

const CATEGORY_KEYS: RiskCategory[] = [
  "scope-gap",
  "payment",
  "schedule",
  "change-order",
  "backcharge",
  "insurance-indemnity",
  "local-code-ahj",
  "labor-wage",
  "design-responsibility",
  "warranty-closeout",
  "flow-down",
  "ambiguous-language",
  "missing-document",
  "document-conflict",
  "financial-exposure",
];

const SEVERITY_POINTS: Record<Severity, number> = {
  low: 3,
  medium: 7,
  high: 12,
  critical: 18,
};

const HIDDEN_SCOPE_PATTERNS: Array<{
  terms: string[];
  obligation: string;
  impact: string;
  question: string;
  severity: Severity;
}> = [
  {
    terms: ["reasonably inferable", "reasonably inferred", "shown or implied", "work shown or implied"],
    obligation: "Work that is not shown clearly but could be treated as included",
    impact: "The GC may argue that unpriced items were foreseeable and included in the lump sum.",
    question: "Please confirm that only specifically listed scope is included unless added by written change order.",
    severity: "high",
  },
  {
    terms: ["complete system", "complete and operational", "complete installation"],
    obligation: "Complete system responsibility",
    impact: "System language can pull in controls, supports, testing, startup, accessories, and coordination not listed in the bid.",
    question: "Which exact system components, accessories, testing, and startup items are included in our scope?",
    severity: "high",
  },
  {
    terms: ["per plans and specs", "per the plans and specifications", "all drawings and specifications", "per plans and specifications"],
    obligation: "All plans and specifications by reference",
    impact: "Broad incorporation can override the subcontractor's narrower proposal and exclusions.",
    question: "Do our proposal, inclusions, exclusions, and bid date control over conflicting drawings and specs?",
    severity: "high",
  },
  {
    terms: ["all work required", "all labor, materials", "includes but is not limited to", "field verify all conditions"],
    obligation: "Open-ended scope",
    impact: "Open-ended wording can make the subcontractor responsible for unlisted work needed by other trades or the GC.",
    question: "Please revise the scope to list included work and preserve our stated exclusions.",
    severity: "high",
  },
  {
    terms: ["no additional compensation", "without additional compensation", "at no additional cost", "failure to provide notice waives", "time is of the essence"],
    obligation: "Extra work without added pay",
    impact: "This can block recovery for acceleration, resequencing, field directives, or work outside the priced basis.",
    question: "Please confirm extra work, acceleration, and resequencing require a written change order.",
    severity: "critical",
  },
  {
    terms: ["coordinate with all trades", "all means and methods", "inspected site and accepts existing conditions"],
    obligation: "Coordination, means-and-methods, or existing-condition acceptance",
    impact: "These phrases can shift jobsite coordination, means and methods, and unknown existing conditions to the subcontractor.",
    question: "Please confirm coordination duties and existing-condition repairs are limited to our listed scope and priced assumptions.",
    severity: "high",
  },
];

const COMPARISON_RULES: Array<{
  item: string;
  category: RiskCategory;
  exclusionTerms: string[];
  contractTerms: string[];
  bidPosition: string;
  contractPosition: string;
  conflict: string;
  recommendation: string;
  severity: Severity;
}> = [
  {
    item: "Permits and inspection fees",
    category: "local-code-ahj",
    exclusionTerms: ["permit", "permits", "inspection fee", "utility fee"],
    contractTerms: ["permit", "permits", "inspection fee", "fees", "licenses"],
    bidPosition: "Bid appears to exclude permits, inspection fees, or third-party fees.",
    contractPosition: "Subcontract appears to assign permits, inspections, licenses, or fees to the subcontractor.",
    conflict: "Potential unpaid permit or inspection obligation.",
    recommendation: "State that permits, utility fees, and third-party inspection costs are excluded unless listed as an allowance or change order.",
    severity: "high",
  },
  {
    item: "Firestopping",
    category: "scope-gap",
    exclusionTerms: ["firestopping", "fire stopping", "firestop"],
    contractTerms: ["firestopping", "fire stopping", "firestop", "fire rated penetration"],
    bidPosition: "Bid appears to exclude firestopping.",
    contractPosition: "Subcontract or specifications appear to include firestopping.",
    conflict: "Scope may shift firestopping back to the subcontractor.",
    recommendation: "Confirm firestopping is by others or add a priced scope and quantity basis.",
    severity: "high",
  },
  {
    item: "Patching and restoration",
    category: "scope-gap",
    exclusionTerms: ["patching", "repair", "restoration", "existing condition"],
    contractTerms: ["patching", "repair", "restore", "restoration", "make good", "existing condition"],
    bidPosition: "Bid appears to exclude patching, restoration, or existing condition repairs.",
    contractPosition: "Subcontract appears to require patching, restoration, or correction of existing conditions.",
    conflict: "Existing or adjacent work could become unpaid subcontractor scope.",
    recommendation: "Limit patching and restoration to specifically listed work areas and require written authorization for existing condition repairs.",
    severity: "high",
  },
  {
    item: "Engineering or delegated design",
    category: "design-responsibility",
    exclusionTerms: ["engineering", "delegated design", "design", "calculation", "stamped"],
    contractTerms: ["engineering", "delegated design", "design-build", "design build", "shop drawing engineering", "stamped calculations"],
    bidPosition: "Bid appears to exclude engineering, calculations, or delegated design.",
    contractPosition: "Subcontract appears to require engineering or delegated design.",
    conflict: "Professional design responsibility may be shifted without fee, schedule, or insurance basis.",
    recommendation: "Exclude delegated design unless specifically priced, insured, and listed with deliverables.",
    severity: "critical",
  },
  {
    item: "Overtime, premium time, or acceleration",
    category: "schedule",
    exclusionTerms: ["overtime", "premium time", "weekend", "acceleration", "second shift"],
    contractTerms: ["overtime", "premium time", "weekend", "accelerate", "acceleration", "manpower", "at no additional cost"],
    bidPosition: "Bid appears to exclude overtime, premium time, or acceleration.",
    contractPosition: "Subcontract appears to require overtime, manpower increases, or acceleration.",
    conflict: "Schedule recovery costs may be pushed to the subcontractor.",
    recommendation: "Clarify standard working hours and require written change order for acceleration, resequencing, weekend work, or premium time.",
    severity: "critical",
  },
  {
    item: "Temporary facilities and hoisting",
    category: "financial-exposure",
    exclusionTerms: ["temporary power", "temporary water", "dumpster", "scaffold", "scaffolding", "lift", "hoisting", "storage"],
    contractTerms: ["temporary power", "temporary water", "dumpster", "scaffold", "scaffolding", "lift", "hoisting", "storage"],
    bidPosition: "Bid appears to exclude temporary facilities, dumpsters, lifts, scaffolding, storage, or hoisting.",
    contractPosition: "Subcontract appears to assign temporary facilities or equipment obligations to the subcontractor.",
    conflict: "Rental, equipment, logistics, and disposal costs may be unpriced.",
    recommendation: "List temporary facilities by responsible party and price any subcontractor-provided equipment separately.",
    severity: "high",
  },
  {
    item: "Testing and inspections",
    category: "local-code-ahj",
    exclusionTerms: ["testing", "inspection", "special inspection", "commissioning"],
    contractTerms: ["testing", "inspection", "special inspection", "commissioning", "third-party testing"],
    bidPosition: "Bid appears to exclude testing, inspections, or commissioning.",
    contractPosition: "Subcontract appears to require testing, inspections, or commissioning.",
    conflict: "Third-party and retest costs may be shifted to the subcontractor.",
    recommendation: "Identify who pays for required tests, inspections, failed tests, retests, and commissioning.",
    severity: "high",
  },
  {
    item: "Unit prices",
    category: "change-order",
    exclusionTerms: ["unit price", "unit prices", "$/"],
    contractTerms: ["unit price", "unit prices"],
    bidPosition: "Bid appears to include unit prices or a unit-price basis.",
    contractPosition: "Subcontract text may not preserve the same unit prices.",
    conflict: "Future quantity changes may be disputed or repriced by the GC.",
    recommendation: "Attach the unit price exhibit and state that it controls added or deducted quantities.",
    severity: "medium",
  },
  {
    item: "Sales tax, freight, storage, or escalation",
    category: "financial-exposure",
    exclusionTerms: ["sales tax", "tax", "freight", "storage", "escalation", "material escalation"],
    contractTerms: ["tax", "freight", "storage", "escalation", "fixed price", "no escalation"],
    bidPosition: "Bid appears to exclude tax, freight, storage, or material escalation.",
    contractPosition: "Subcontract appears silent, fixed-price, or inclusive of these costs.",
    conflict: "Material and delivery exposure may be absorbed by the subcontractor.",
    recommendation: "State whether tax, freight, storage, and escalation are included, excluded, or carried as allowances.",
    severity: "high",
  },
  {
    item: "Warranty duration",
    category: "warranty-closeout",
    exclusionTerms: ["warranty", "one year", "1 year"],
    contractTerms: ["warranty", "two year", "2 year", "extended warranty", "correction period"],
    bidPosition: "Bid appears to limit warranty or carry a standard one-year basis.",
    contractPosition: "Subcontract appears to require a longer or broader warranty.",
    conflict: "Warranty cost and callback exposure may exceed the priced basis.",
    recommendation: "Align warranty duration, start date, exclusions, and manufacturer warranties before signing.",
    severity: "medium",
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ");
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function firstMatch(text: string, terms: string[]): string {
  return terms.find((term) => text.includes(term)) ?? terms[0] ?? "language";
}

function severityFromScore(score: number): Severity {
  if (score >= 76) return "critical";
  if (score >= 51) return "high";
  if (score >= 26) return "medium";
  return "low";
}

function riskLevelFromScore(score: number): string {
  if (score >= 76) return "Severe risk";
  if (score >= 51) return "High risk";
  if (score >= 26) return "Moderate risk";
  return "Low risk";
}

function hasDocument(project: Project, id: Project["documents"][number]["id"]): boolean {
  return project.documents.some((document) => document.id === id && document.available);
}

function textSuggestsExclusion(bidText: string, exclusionsText: string, terms: string[]): boolean {
  const exclusions = normalize(exclusionsText);
  const bid = normalize(bidText);
  if (includesAny(exclusions, terms)) return true;

  return terms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const before = new RegExp(`(?:exclude|excludes|excluded|excluding|not included|by others|others to provide|not responsible).{0,90}${escaped}`);
    const after = new RegExp(`${escaped}.{0,90}(?:exclude|excludes|excluded|excluding|not included|by others|others to provide|not responsible)`);
    return before.test(bid) || after.test(bid);
  });
}

function contractPreservesProposal(contractText: string): boolean {
  return /proposal|bid|exclusion|clarification/.test(contractText) && /incorporat|control|prevail|attached|exhibit/.test(contractText);
}

function addUnique<T>(items: T[], predicate: (item: T) => boolean, item: T): boolean {
  if (items.some(predicate)) return false;
  items.push(item);
  return true;
}

export function generateRiskReview(project: Project, asOf = new Date()): RiskReview {
  const flags: RiskFlag[] = [];
  const comparisons: ContractComparison[] = [];
  const hiddenScopeFlags: HiddenScopeFlag[] = [];
  const exclusionChecks: ExclusionCheck[] = [];
  const questions: ClarificationQuestion[] = [];
  const missingDocuments: MissingDocument[] = [];
  const assumptions: Assumption[] = [];
  const issueLog: IssueLogItem[] = [];
  const recommendedRevisions = new Set<string>();
  const categoryScores = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, 0])) as Record<RiskCategory, number>;
  let score = 0;

  const contractText = normalize(project.subcontractText);
  const bidText = normalize(project.bidText);
  const exclusionsText = normalize(project.exclusionsText);
  const allText = normalize(`${project.subcontractText} ${project.bidText} ${project.exclusionsText} ${project.notesText}`);
  const proposalIsPreserved = contractPreservesProposal(contractText);

  const bump = (category: RiskCategory, severity: Severity, multiplier = 1) => {
    const points = Math.round(SEVERITY_POINTS[severity] * multiplier);
    score += points;
    categoryScores[category] = Math.min(100, categoryScores[category] + points * 4);
  };

  const addQuestion = (group: QuestionGroup, question: string, priority: Severity = "medium") => {
    addUnique(
      questions,
      (item) => item.question === question,
      { id: `question-${questions.length + 1}`, group, question, priority },
    );
  };

  const addAssumption = (statement: string, basis: string) => {
    assumptions.push({ id: `assumption-${assumptions.length + 1}`, statement, basis });
  };

  const addIssueLog = (
    category: RiskCategory,
    riskLevel: Severity,
    issueTitle: string,
    recommendedClarification: string,
    potentialCostImpact = "Unpriced cost, schedule, or claim exposure",
    source = "Rule-based review",
    contractSection = "Needs section reference",
    bidReference = "Needs bid reference",
    whyItMatters = "This item can shift cost, schedule, payment, or legal risk to the subcontractor.",
    suggestedRevision = recommendedClarification,
  ) => {
    issueLog.push({
      id: `ISS-${String(issueLog.length + 1).padStart(3, "0")}`,
      category,
      issueTitle,
      documentSource: source,
      contractSection,
      bidReference,
      issueDescription: issueTitle,
      whyItMatters,
      riskLevel,
      potentialCostImpact,
      recommendedClarification,
      suggestedRevision,
      status: "Open",
      owner: "Subcontractor",
      dateResolved: "",
    });
  };

  const addFlag = (
    category: RiskCategory,
    severity: Severity,
    issue: string,
    whyItMatters: string,
    whatToVerify: string,
    suggestedAction: string,
    potentialCostImpact?: string,
  ) => {
    const added = addUnique(
      flags,
      (flag) => flag.issue === issue,
      { id: `flag-${flags.length + 1}`, category, severity, issue, whyItMatters, whatToVerify, suggestedAction },
    );
    if (!added) return;
    bump(category, severity);
    addIssueLog(category, severity, issue, suggestedAction, potentialCostImpact, "Rule-based review", "Needs section reference", "Needs bid reference", whyItMatters);
  };

  const addMissing = (document: string, reason: string, priority: Severity) => {
    const added = addUnique(
      missingDocuments,
      (item) => item.document === document,
      { document, reason, priority },
    );
    if (!added) return;
    bump("missing-document", priority, 0.7);
    addIssueLog("missing-document", priority, `Missing document: ${document}`, reason, "Unknown until document is reviewed");
  };

  if (!project.subcontractText.trim()) {
    addFlag(
      "missing-document",
      "critical",
      "Subcontract language has not been pasted for review",
      "The tool cannot test payment, scope, flow-down, insurance, schedule, or change-order terms without contract language.",
      "Current subcontract agreement and all exhibits.",
      "Paste the subcontract text or key clauses before relying on the report.",
      "Unknown contract exposure",
    );
  }

  if (!project.bidText.trim() && !project.exclusionsText.trim()) {
    addFlag(
      "missing-document",
      "high",
      "Bid, proposal, exclusions, or assumptions are missing from the comparison basis",
      "The central risk is whether the subcontract matches what was priced. Without the bid basis, conflicts may be missed.",
      "Bid proposal, scope letter, alternates, allowances, unit prices, exclusions, and assumptions.",
      "Add the bid and exclusion language before signing.",
      "Unpriced scope may not be visible",
    );
  }

  const requiredDocuments: Array<[Project["documents"][number]["id"], string, string, Severity]> = [
    ["gc-subcontract", "Full subcontract", "The signed obligation must be reviewed before execution.", "critical"],
    ["bid-proposal", "Bid or proposal", "The subcontract should be compared to the priced basis.", "critical"],
    ["exclusions-assumptions", "Assumptions and exclusions", "Exclusions must be preserved in the subcontract.", "high"],
    ["msa", "Master service agreement", "Any MSA should be checked for payment, insurance, indemnity, dispute, and flow-down terms.", "medium"],
    ["drawings", "Drawings", "Broad drawing incorporation can add hidden locations, details, and coordination work.", "medium"],
    ["specifications", "Specifications", "Specification requirements can override shorter scope descriptions.", "medium"],
    ["addenda", "Addenda", "Addenda can change scope after the bid date.", "medium"],
    ["rfi-log", "RFI log", "RFIs and clarifications can change the bid basis or contract scope.", "medium"],
    ["schedule", "Schedule", "Milestones, overtime, acceleration, and manpower needs should be checked.", "high"],
    ["insurance", "Insurance requirements", "Coverage, additional insured, waiver, and indemnity terms should match your program.", "high"],
    ["prime-contract-excerpt", "Prime contract flow-down terms", "Flow-down clauses can import owner terms the subcontractor has not seen.", "high"],
  ];

  requiredDocuments.forEach(([id, label, reason, priority]) => {
    if (!hasDocument(project, id)) addMissing(label, reason, priority);
  });

  if (project.hasMasterServiceAgreement === "yes" && !hasDocument(project, "msa")) {
    addMissing("Master service agreement", "An existing MSA may change risk, insurance, payment, dispute, or flow-down terms.", "high");
  }

  if ((project.publicOrPrivate === "public" || project.projectType === "public-works" || project.projectType === "affordable-housing") && !hasDocument(project, "wage")) {
    addMissing("Wage determination or certified payroll requirements", "Public or affordable work may require prevailing wage, certified payroll, or funding compliance.", "high");
  }

  if (!hasDocument(project, "permit-ahj")) {
    addMissing(
      "Local code or AHJ requirements",
      "Permits, inspections, licensing, fire marshal requirements, utility coordination, and trade-specific rules should be verified locally.",
      "medium",
    );
  }

  COMPARISON_RULES.forEach((rule) => {
    const excluded = textSuggestsExclusion(project.bidText, project.exclusionsText, rule.exclusionTerms);
    const required = includesAny(contractText, rule.contractTerms);
    if (!excluded || !required) return;

    comparisons.push({
      id: `comparison-${comparisons.length + 1}`,
      item: rule.item,
      bidPosition: rule.bidPosition,
      contractPosition: rule.contractPosition,
      conflict: rule.conflict,
      riskLevel: rule.severity,
      recommendedClarification: rule.recommendation,
    });
    bump(rule.category, rule.severity);
    bump("document-conflict", rule.severity, 0.5);
    addIssueLog(rule.category, rule.severity, rule.conflict, rule.recommendation, "Potential direct cost or disputed change-order recovery", "Contract vs bid comparison");
    recommendedRevisions.add(rule.recommendation);
    addQuestion("GC / Contract Admin", rule.recommendation, rule.severity);
  });

  HIDDEN_SCOPE_PATTERNS.forEach((pattern) => {
    if (!includesAny(contractText, pattern.terms)) return;
    const matched = firstMatch(contractText, pattern.terms);
    hiddenScopeFlags.push({
      id: `hidden-${hiddenScopeFlags.length + 1}`,
      obligation: pattern.obligation,
      contractLanguage: matched,
      whyItMatters: pattern.impact,
      potentialCostImpact: pattern.severity === "critical" ? "High to severe" : "Moderate to high",
      questionToAsk: pattern.question,
      severity: pattern.severity,
    });
    bump("ambiguous-language", pattern.severity);
    addIssueLog("ambiguous-language", pattern.severity, pattern.obligation, pattern.question, pattern.impact, "Subcontract language");
    recommendedRevisions.add(pattern.question);
  });

  const exclusionTerms = [
    "permits",
    "engineering",
    "delegated design",
    "overtime",
    "premium time",
    "testing",
    "inspections",
    "patching",
    "temporary power",
    "dumpsters",
    "hoisting",
    "sales tax",
    "freight",
    "escalation",
    "warranty",
    "as-builts",
    "closeout",
  ];

  exclusionTerms.forEach((term) => {
    if (!textSuggestsExclusion(project.bidText, project.exclusionsText, [term])) return;
    const contradicted = contractText.includes(term.replace(/s$/, "")) || contractText.includes(term);
    const severity: Severity = contradicted ? "high" : proposalIsPreserved ? "low" : "medium";
    exclusionChecks.push({
      id: `exclusion-${exclusionChecks.length + 1}`,
      exclusion: term,
      foundInBid: "yes",
      contractPreservesIt: proposalIsPreserved ? "yes" : "unclear",
      contradictedByContract: contradicted ? "yes" : "unclear",
      requiredAction: contradicted
        ? `Revise the subcontract so the ${term} exclusion is expressly preserved.`
        : `Confirm the ${term} exclusion is attached and controls over conflicting language.`,
      severity,
    });
    if (severity !== "low") bump(contradicted ? "document-conflict" : "scope-gap", severity, 0.45);
  });

  if (!proposalIsPreserved && (bidText || exclusionsText)) {
    addFlag(
      "flow-down",
      "high",
      "Proposal and exclusions are not clearly incorporated",
      "If the subcontract does not attach and prioritize the proposal, broad contract documents may supersede the exclusions that protected the bid.",
      "Exhibit order of precedence, proposal date, revision number, exclusions, alternates, and unit-price exhibit.",
      "Add an order-of-precedence clause preserving the subcontractor proposal and exclusions over conflicting general scope language.",
      "Bid exclusions may be lost",
    );
  }

  if (/pay[- ]?if[- ]?paid|condition precedent|payment by owner is a condition/.test(contractText)) {
    addFlag(
      "payment",
      "critical",
      "Pay-if-paid or conditional payment language found",
      "Payment could be conditioned on the GC receiving funds from the owner, shifting owner nonpayment risk to the subcontractor.",
      "Exact payment clause, lien rights, state enforceability, and owner funding status.",
      "Request removal or attorney review of conditional payment language before signing.",
      "Potential nonpayment despite completed work",
    );
    addQuestion("Attorney", "Is the conditional payment language enforceable for this project location and project type?", "critical");
  } else if (/pay[- ]?when[- ]?paid|paid when contractor is paid|after receipt of payment/.test(contractText)) {
    addFlag(
      "payment",
      "high",
      "Pay-when-paid timing language found",
      "Payment timing may stretch beyond normal billing cycles and affect cash flow.",
      "Payment deadline, owner payment status, prompt payment laws, and lien waiver requirements.",
      "Add a fixed outside payment date regardless of owner payment timing.",
      "Delayed cash flow",
    );
  }

  if (/retainage|retention/.test(contractText)) {
    addQuestion("GC / Contract Admin", "What retainage percentage applies, when is it released, and is it reduced at substantial completion?", "medium");
  }

  if (/lien waiver|waiver and release|conditional waiver|unconditional waiver/.test(contractText)) {
    addFlag(
      "payment",
      "medium",
      "Lien waiver requirements need review",
      "Unconditional waivers or broad releases can give up rights before payment clears or before open changes are resolved.",
      "Waiver form, payment timing, release carve-outs, stored material treatment, and change-order reservation language.",
      "Use conditional waivers before funds clear and reserve unresolved change orders.",
      "Potential loss of payment rights",
    );
  }

  if (/written change order|prior written authorization|no oral|waiver|notice within|within \d+ (?:day|days|hour|hours)/.test(contractText)) {
    addFlag(
      "change-order",
      "high",
      "Strict change-order or notice requirements found",
      "Late notice or work performed before written authorization may waive payment or time extensions.",
      "Notice deadline, authorized signer, field directive process, time extension language, and daily documentation requirements.",
      "Create a written notice and change-order tracking process before starting work.",
      "Extra work may become unpaid",
    );
    addQuestion("Project Manager", "What happens if the GC verbally directs extra work before a written change order is issued?", "high");
  }

  if (/backcharge|setoff|deduct|cleanup|damage to work|charge against/.test(contractText)) {
    addFlag(
      "backcharge",
      "high",
      "Backcharge or setoff rights need limits",
      "Broad backcharge language can deduct costs without notice, cure opportunity, proof, or agreed rates.",
      "Notice requirement, cure period, documentation standard, markups, and dispute process.",
      "Require written notice, opportunity to cure, supporting documentation, and dispute reservation before backcharges.",
      "Uncontrolled deductions",
    );
  }

  if (/indemnif|hold harmless|defend/.test(contractText)) {
    addFlag(
      "insurance-indemnity",
      "high",
      "Indemnity and defense language found",
      "Broad indemnity can create liability beyond the subcontractor's negligence or insurance coverage.",
      "Negligence standard, defense trigger, additional insured coverage, policy limits, and state anti-indemnity law.",
      "Have insurance and counsel review the indemnity clause before signing.",
      "Liability beyond priced work",
    );
    addQuestion("Insurance / Broker", "Do our current policies support the additional insured, waiver, primary and noncontributory, and indemnity requirements?", "high");
  }

  if (/additional insured|primary and noncontributory|waiver of subrogation|umbrella|excess liability/.test(contractText)) {
    addFlag(
      "insurance-indemnity",
      "medium",
      "Insurance endorsements need broker confirmation",
      "Required endorsements may not be automatic and can delay mobilization or create compliance issues.",
      "Required forms, limits, completed operations term, waiver of subrogation, and certificate language.",
      "Send the insurance exhibit to the broker before signing.",
      "Coverage gaps or mobilization delay",
    );
  }

  if (/liquidated damages|\blds\b|no damages for delay|delay damages|acceleration|manpower|overtime|weekend/.test(contractText)) {
    addFlag(
      "schedule",
      /liquidated damages|\blds\b|no damages for delay/.test(contractText) ? "critical" : "high",
      "Schedule, delay, or acceleration exposure found",
      "The subcontractor may carry delay damages, no-damage-for-delay limits, or acceleration duties without matching compensation.",
      "Milestones, LD pass-through, float ownership, delay notice, acceleration authorization, and compensable delay rights.",
      "Add schedule assumptions and require written direction plus compensation for acceleration or resequencing.",
      "Delay damages or premium labor cost",
    );
  }

  if (
    /prevailing wage|davis[- ]?bacon|certified payroll|apprentice|labor compliance/.test(contractText) ||
    project.publicOrPrivate === "public" ||
    project.prevailingWageStatus === "yes" ||
    project.projectType === "public-works"
  ) {
    addFlag(
      "labor-wage",
      "high",
      "Labor or wage compliance should be verified",
      "Prevailing wage, certified payroll, apprentice ratios, and funding rules can add administrative and labor cost.",
      "Wage determination, classification, fringe, payroll process, penalties, and flow-down to lower tiers.",
      "Obtain the wage exhibit and confirm labor compliance duties before signing.",
      "Payroll penalties or labor cost increase",
    );
  }

  if (/as[- ]?built|closeout|o&m|operation and maintenance|submittal|attic stock|warranty/.test(contractText)) {
    addQuestion("Project Manager", "Which submittals, closeout documents, O&M manuals, as-builts, attic stock, and warranty items are included in our price?", "medium");
  }

  if (/prime contract|flow[- ]?down|incorporated by reference|owner contract|contract documents/.test(contractText)) {
    addFlag(
      "flow-down",
      "high",
      "Prime contract or other documents are incorporated by reference",
      "The subcontractor may be bound to owner terms, specs, schedules, or exhibits that were not reviewed with the bid.",
      "Complete list of incorporated documents, order of precedence, prime contract excerpts, addenda, and owner requirements.",
      "Require delivery of incorporated documents and preserve the subcontractor proposal over conflicts.",
      "Unknown owner-term exposure",
    );
  }

  if (project.projectAddress || project.tradeType) {
    addQuestion(
      "AHJ / Local Authority",
      `For ${project.tradeType || "this trade"} at ${project.projectAddress || "the project location"}, which permits, inspections, licensing, utility coordination, fire marshal items, right-of-way rules, or special inspections must be verified?`,
      "medium",
    );
  }

  [
    "Did your bid include permits?",
    "Did your bid include engineering or delegated design?",
    "Did your bid include overtime or premium time?",
    "Did your bid include testing and inspections?",
    "Did your bid include patching and repair of existing conditions?",
    "Did your bid include temporary facilities, dumpsters, lifts, scaffolding, storage, or hoisting?",
    "Did your bid include sales tax, freight, escalation, or storage?",
    "Did your bid include warranty beyond one year?",
    "Are your exclusions attached to the subcontract?",
    "Does the subcontract reference the correct bid date and revision?",
    "Are unit prices and allowances clearly included?",
    "Has the GC included all addenda?",
    "Are you exposed to liquidated damages?",
    "Are change orders required before work starts?",
  ].forEach((question) => addQuestion("Estimating Team", question, "medium"));

  const answerMap = new Map(project.intakeAnswers.map((answer) => [answer.questionKey, answer.answer]));
  const checklistFlags: Array<[string, RiskCategory, string, string, string]> = [
    ["permits", "local-code-ahj", "Permits may not be in the bid", "Confirm whether permits and AHJ fees are excluded or carried as an allowance.", "Permits, fees, and plan review costs can become unpaid scope if the subcontract assigns them to the sub."],
    ["inspections-testing", "local-code-ahj", "Testing or inspections may not be in the bid", "Clarify who pays for third-party testing, special inspections, retesting, and commissioning.", "Testing costs and failed inspections can create direct cost and schedule exposure."],
    ["engineering", "design-responsibility", "Engineering or delegated design may not be in the bid", "Confirm delegated design, stamped calculations, and engineering are excluded unless priced.", "Design duties can create professional liability and schedule obligations."],
    ["premium-time", "schedule", "Premium time may not be in the bid", "Clarify standard work hours and require a written change order for overtime, weekend, shift, or premium time.", "Premium labor can erase margin quickly if schedule pressure is shifted to the subcontractor."],
    ["acceleration", "schedule", "Acceleration or resequencing may not be in the bid", "Confirm acceleration, resequencing, and manpower increases require written change order approval.", "Acceleration without compensation can create major labor and supervision cost."],
    ["exclusions-attached", "flow-down", "Exclusions may not be attached to the subcontract", "Attach the exclusions and state they control over conflicting general scope language.", "Unattached exclusions are easier for the GC to ignore after signing."],
    ["unit-prices", "change-order", "Unit prices may be missing from the subcontract", "Attach unit prices and confirm they apply to adds and deducts.", "Quantity changes can become disputes if unit pricing is not incorporated."],
    ["liquidated-damages", "schedule", "Liquidated damages exposure needs review", "Confirm whether LDs flow down and cap exposure before signing.", "LD pass-through can create exposure larger than the subcontractor's fee."],
    ["conditional-payment", "payment", "Conditional payment language needs review", "Identify and revise pay-if-paid or pay-when-paid terms before signing.", "Payment can be delayed or denied based on owner funding risk."],
    ["written-change-orders", "change-order", "Written change order requirements need a tracking process", "Confirm the notice deadline, authorized signer, and extra-work documentation process.", "Work can become unpaid if notice or written authorization rules are missed."],
  ];

  checklistFlags.forEach(([key, category, issue, action, why]) => {
    const answer = answerMap.get(key);
    if (answer === "no" || answer === "not-sure") {
      addFlag(category, answer === "not-sure" ? "medium" : "high", issue, why, project.intakeAnswers.find((item) => item.questionKey === key)?.questionText ?? "Checklist answer", action);
    }
  });

  if (project.uploadedFiles.length > 0) {
    addAssumption(
      "Uploaded files are classified by file name and selected document type in this MVP.",
      "File contents stay in the browser and are not parsed by a server-side document extraction pipeline.",
    );
  }

  if (project.notesText.trim()) {
    addAssumption("User notes are treated as context, not verified contract language.", "Notes were entered separately from subcontract or bid text.");
  }

  if (!hasDocument(project, "prime-contract-excerpt") && /flow[- ]?down|prime contract|owner contract/.test(contractText)) {
    addMissing("Full prime contract excerpts", "Flow-down language appears in the subcontract but the upstream terms are not available.", "critical");
  }

  const paymentTerms: ReportNote[] = [
    {
      label: "Retainage",
      value: /retainage|retention/.test(contractText) ? "Retainage language found. Confirm percentage and release timing." : "No retainage language found in pasted text.",
      risk: /retainage|retention/.test(contractText) ? "medium" : "low",
    },
    {
      label: "Conditional payment",
      value: /pay[- ]?if[- ]?paid|condition precedent/.test(contractText)
        ? "Pay-if-paid or condition precedent language found."
        : /pay[- ]?when[- ]?paid/.test(contractText)
          ? "Pay-when-paid timing language found."
          : "No conditional payment language found in pasted text.",
      risk: /pay[- ]?if[- ]?paid|condition precedent/.test(contractText)
        ? "critical"
        : /pay[- ]?when[- ]?paid/.test(contractText)
          ? "high"
          : "low",
    },
    {
      label: "Lien waivers",
      value: /lien waiver|waiver and release|conditional waiver|unconditional waiver/.test(contractText)
        ? "Lien waiver language found. Review form and release timing."
        : "No lien waiver language found in pasted text.",
      risk: /lien waiver|waiver and release|conditional waiver|unconditional waiver/.test(contractText) ? "medium" : "low",
    },
  ];

  const changeOrderTerms: ReportNote[] = [
    {
      label: "Notice deadline",
      value: /notice within|within \d+ (?:day|days|hour|hours)/.test(contractText)
        ? "Notice deadline language found. Build a tracking process before mobilization."
        : "No specific notice deadline found in pasted text.",
      risk: /notice within|within \d+ (?:day|days|hour|hours)/.test(contractText) ? "high" : "low",
    },
    {
      label: "Written authorization",
      value: /written change order|prior written authorization|no oral/.test(contractText)
        ? "Written authorization appears required before extra work."
        : "Written authorization requirement not found in pasted text.",
      risk: /written change order|prior written authorization|no oral/.test(contractText) ? "high" : "medium",
    },
  ];

  const scheduleTerms: ReportNote[] = [
    {
      label: "Liquidated damages",
      value: /liquidated damages|\blds\b/.test(contractText) ? "LD language found." : "No LD language found in pasted text.",
      risk: /liquidated damages|\blds\b/.test(contractText) ? "critical" : "low",
    },
    {
      label: "No damages for delay",
      value: /no damages for delay/.test(contractText) ? "No-damages-for-delay language found." : "No no-damages-for-delay language found in pasted text.",
      risk: /no damages for delay/.test(contractText) ? "critical" : "low",
    },
    {
      label: "Acceleration and manpower",
      value: /acceleration|accelerate|overtime|weekend|manpower/.test(contractText)
        ? "Acceleration, overtime, weekend, or manpower language found."
        : "No acceleration language found in pasted text.",
      risk: /acceleration|accelerate|overtime|weekend|manpower/.test(contractText) ? "high" : "low",
    },
  ];

  const insuranceTerms: ReportNote[] = [
    {
      label: "Additional insured",
      value: /additional insured/.test(contractText) ? "Additional insured language found." : "No additional insured language found in pasted text.",
      risk: /additional insured/.test(contractText) ? "medium" : "low",
    },
    {
      label: "Indemnity",
      value: /indemnif|hold harmless|defend/.test(contractText) ? "Indemnity, hold harmless, or duty to defend language found." : "No indemnity language found in pasted text.",
      risk: /indemnif|hold harmless|defend/.test(contractText) ? "high" : "low",
    },
    {
      label: "Bonding",
      value: /bond|payment bond|performance bond/.test(contractText) ? "Bonding language found." : "No bonding language found in pasted text.",
      risk: /bond|payment bond|performance bond/.test(contractText) ? "medium" : "low",
    },
  ];

  const localRequirements: ReportNote[] = [
    {
      label: "Location and trade scan",
      value: project.projectAddress || project.tradeType
        ? "Verify local permits, inspections, licensing, fire marshal items, utility coordination, right-of-way rules, and trade-specific requirements. This MVP does not claim certainty without uploaded or verified source documents."
        : "Enter project location and trade to generate a local verification prompt.",
      risk: hasDocument(project, "permit-ahj") ? "medium" : "high",
    },
    {
      label: "Wage requirements",
      value: project.publicOrPrivate === "public" || project.prevailingWageStatus === "yes" || /prevailing wage|davis[- ]?bacon|certified payroll/.test(allText)
        ? "Verify wage determination, classifications, fringe, certified payroll, and lower-tier flow-down."
        : "No wage requirement language found in pasted text.",
      risk: project.publicOrPrivate === "public" || project.prevailingWageStatus === "yes" || /prevailing wage|davis[- ]?bacon|certified payroll/.test(allText) ? "high" : "low",
    },
  ];

  const addExtraPoints = (category: RiskCategory, points: number) => {
    score += points;
    categoryScores[category] = Math.min(100, categoryScores[category] + points * 3);
  };

  if (!proposalIsPreserved && (bidText || exclusionsText)) addExtraPoints("flow-down", 15);
  if (/proposal.*(?:superseded|void|not binding)|contract documents.*control|subcontract.*controls over.*proposal/.test(contractText)) {
    addExtraPoints("flow-down", 15);
  }
  if (/pay[- ]?if[- ]?paid|condition precedent|payment by owner is a condition/.test(contractText)) addExtraPoints("payment", 10);
  if (/indemnif|hold harmless|defend/.test(contractText)) addExtraPoints("insurance-indemnity", 10);
  if (/liquidated damages|\blds\b/.test(contractText)) addExtraPoints("schedule", 10);
  if (/no damages for delay/.test(contractText)) addExtraPoints("schedule", 8);
  if (/acceleration|accelerate/.test(contractText) && /no additional compensation|without additional compensation|at no additional cost/.test(contractText)) {
    addExtraPoints("schedule", 10);
  }
  if (/order of precedence|contract documents|incorporated by reference/.test(contractText) && !proposalIsPreserved) {
    addExtraPoints("ambiguous-language", 8);
  }
  if (project.hasMasterServiceAgreement !== "no" && !hasDocument(project, "msa") && /msa|master service/.test(contractText)) {
    addExtraPoints("missing-document", 10);
  }
  if (!hasDocument(project, "prime-contract-excerpt") && /flow[- ]?down|prime contract|owner contract/.test(contractText)) {
    addExtraPoints("missing-document", 10);
  }

  [
    "Subcontractor's proposal dated [date] is incorporated into the subcontract and controls over conflicting scope language.",
    "Subcontractor exclusions and clarifications are incorporated and shall not be superseded by general scope language.",
    "Subcontractor is not responsible for work outside the specific scope listed in Exhibit A unless authorized by written change order.",
    "Premium time, acceleration, resequencing, and overtime are excluded unless mutually agreed by written change order.",
    "Existing condition repairs are excluded unless specifically listed in the subcontract scope.",
    "Permits, testing, inspections, engineering, utility fees, and third-party costs are excluded unless specifically included.",
  ].forEach((revision) => recommendedRevisions.add(revision));

  score = Math.min(100, Math.max(0, Math.round(score)));

  const categoryRatings = Object.fromEntries(
    CATEGORY_KEYS.map((category) => {
      const flagSeverity = flags
        .filter((flag) => flag.category === category)
        .reduce<Severity>(
          (highest, flag) => (severityRank(flag.severity) > severityRank(highest) ? flag.severity : highest),
          severityFromScore(categoryScores[category]),
        );
      const issueSeverity = issueLog
        .filter((issue) => issue.category === category)
        .reduce<Severity>(
          (highest, issue) => (severityRank(issue.riskLevel) > severityRank(highest) ? issue.riskLevel : highest),
          flagSeverity,
        );
      return [category, issueSeverity];
    }),
  ) as Record<RiskCategory, Severity>;

  const overallRating = severityFromScore(score);
  const criticalIssues = flags.some((flag) => flag.severity === "critical") || comparisons.some((item) => item.riskLevel === "critical");
  const finalRecommendation =
    score >= 76 || criticalIssues
      ? "Attorney review recommended before signing"
      : score >= 51
        ? "Do not sign until major contract conflicts are resolved"
        : score >= 26
          ? "Sign only after clarifications are added"
          : "Acceptable to sign as-is";

  return {
    generatedAt: asOf.toISOString(),
    overallRating,
    score,
    riskLevel: riskLevelFromScore(score),
    categoryRatings,
    flags: flags.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    comparisons: comparisons.sort((a, b) => severityRank(b.riskLevel) - severityRank(a.riskLevel)),
    hiddenScopeFlags: hiddenScopeFlags.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    exclusionChecks: exclusionChecks.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    questions: questions.sort((a, b) => severityRank(b.priority) - severityRank(a.priority)),
    missingDocuments: missingDocuments.sort((a, b) => severityRank(b.priority) - severityRank(a.priority)),
    paymentTerms,
    changeOrderTerms,
    scheduleTerms,
    insuranceTerms,
    localRequirements,
    recommendedRevisions: Array.from(recommendedRevisions),
    finalRecommendation,
    assumptions,
    issueLog,
  };
}

export function severityRank(severity: Severity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[severity];
}
