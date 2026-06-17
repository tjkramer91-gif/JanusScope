import type { DetectedTradeScope, TradeScopeCategory } from "@/lib/trade-detector";
import type { Project, Severity } from "@/lib/types";

export interface TradeReviewFinding {
  id: string;
  trade: TradeScopeCategory;
  title: string;
  whyItMatters: string;
  evidence: string;
  riskLevel: Severity;
  confidence: "High" | "Medium" | "Low";
  recommendedAction: string;
}

interface TradeRule {
  id: string;
  terms: RegExp[];
  title: string;
  whyItMatters: string;
  riskLevel: Severity;
  recommendedAction: string;
}

const ELECTRICAL_RULES: TradeRule[] = [
  {
    id: "electrical-permits-utility",
    terms: [/permit|inspection|utility coordination|meter bank|service upgrade/],
    title: "Electrical permit, inspection, or utility coordination exposure",
    whyItMatters: "Panel, meter, feeder, and service work can stall if permit ownership, inspections, and utility coordination are not clear.",
    riskLevel: "high",
    recommendedAction: "Confirm who owns permits, utility coordination, inspection scheduling, and failed inspection costs.",
  },
  {
    id: "electrical-panels-feeders",
    terms: [/panel|subpanel|meter bank|feeder|grounding|bonding/],
    title: "Panel, feeder, grounding, or meter scope needs quantity backup",
    whyItMatters: "These items can drive material cost and outage sequencing. Missing quantities create buyout and change-order exposure.",
    riskLevel: "high",
    recommendedAction: "Verify quantities, unit prices, outage windows, resident access, and utility requirements against drawings or scope sheets.",
  },
  {
    id: "electrical-fire-alarm-low-voltage",
    terms: [/fire alarm|low voltage|smoke|co\b|gfci|afci/],
    title: "Life-safety or low-voltage scope may be hidden in the package",
    whyItMatters: "Smoke/CO, fire alarm tie-ins, GFCI/AFCI, and low-voltage work often sit between trades and can be missed in base scope.",
    riskLevel: "medium",
    recommendedAction: "Ask whether life-safety devices, low-voltage tie-ins, testing, and inspections are included or by others.",
  },
];

const WINDOW_RULES: TradeRule[] = [
  {
    id: "windows-flashing-water",
    terms: [/window|flashing|sill pan|sealant|water intrusion|weather barrier/],
    title: "Window flashing and water-intrusion scope needs confirmation",
    whyItMatters: "Window packages can miss sill pans, flashing, sealants, WRB tie-ins, patching, and warranty exposure.",
    riskLevel: "high",
    recommendedAction: "Confirm flashing, sill pans, sealants, WRB tie-ins, testing, patching, and warranty responsibility.",
  },
  {
    id: "windows-code-performance",
    terms: [/u-factor|shgc|egress|tempered|safety glazing|energy code|historic/],
    title: "Window code and performance criteria may affect product selection",
    whyItMatters: "Egress, tempered glazing, U-factor, SHGC, historic constraints, and energy code can change cost and lead time.",
    riskLevel: "high",
    recommendedAction: "Verify product data against egress, safety glazing, energy code, historic, and AHJ requirements.",
  },
  {
    id: "windows-occupied-rehab",
    terms: [/occupied|resident|unit access|protection|disposal|weather delay/],
    title: "Occupied-rehab window sequencing can create access and protection costs",
    whyItMatters: "Resident access, personal property protection, disposal, weather delays, and daily dry-in obligations can add unpriced labor.",
    riskLevel: "medium",
    recommendedAction: "Clarify unit access, protection, disposal, weather-delay rules, daily completion expectations, and resident notices.",
  },
];

function allProjectText(project: Project): string {
  return [
    project.name,
    project.tradeType,
    project.notesText,
    project.subcontractText,
    project.bidText,
    project.exclusionsText,
    ...project.uploadedFiles.flatMap((file) => [file.name, file.extractedText ?? ""]),
  ].join(" ").toLowerCase();
}

function sourceEvidence(project: Project, rule: TradeRule): string {
  const file = project.uploadedFiles.find((uploadedFile) =>
    rule.terms.some((term) => term.test(`${uploadedFile.name} ${uploadedFile.extractedText ?? ""}`.toLowerCase())),
  );
  if (file) return file.extractedText ? `${file.name} extracted text or filename` : `${file.name} filename`;
  if (project.notesText && rule.terms.some((term) => term.test(project.notesText.toLowerCase()))) return "User review notes";
  return "Detected trade scope";
}

function runRules(project: Project, detected: DetectedTradeScope, rules: TradeRule[]): TradeReviewFinding[] {
  const text = allProjectText(project);
  return rules
    .filter((rule) => rule.terms.some((term) => term.test(text)))
    .map((rule) => ({
      id: rule.id,
      trade: detected.trade,
      title: rule.title,
      whyItMatters: rule.whyItMatters,
      evidence: sourceEvidence(project, rule),
      riskLevel: rule.riskLevel,
      confidence: detected.confidence === "High" ? "High" : "Medium",
      recommendedAction: rule.recommendedAction,
    }));
}

export function buildTradeSpecificReview(project: Project, detected: DetectedTradeScope): TradeReviewFinding[] {
  if (detected.trade === "Electrical") return runRules(project, detected, ELECTRICAL_RULES);
  if (detected.trade === "Windows") return runRules(project, detected, WINDOW_RULES);
  return [];
}

export function tradeModuleStatus(trade: TradeScopeCategory): string {
  if (trade === "Electrical") return "Electrical module applied";
  if (trade === "Windows") return "Window module applied";
  if (trade === "Unknown/mixed scope") return "General review applied";
  return "General review applied; trade module not added yet";
}
