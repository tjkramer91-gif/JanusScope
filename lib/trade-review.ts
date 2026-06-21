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

interface TradeLibrary {
  moduleName: string;
  commonMisses: string[];
  badExclusions: string[];
  hiddenCosts: string[];
  coordinationIssues: string[];
  questions: string[];
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

const TRADE_LIBRARY: Partial<Record<TradeScopeCategory, TradeLibrary>> = {
  Electrical: {
    moduleName: "Electrical",
    commonMisses: ["Panel schedules may not match existing conditions", "Meter packs or service upgrades may be unclear", "Grounding and bonding scope may be missing", "Temporary power may not be carried"],
    badExclusions: ["Permit fees excluded without owner awareness", "Testing and inspection support excluded", "Firestopping excluded even though penetrations are required"],
    hiddenCosts: ["Utility coordination", "AFCI/GFCI upgrades", "Labeling and circuit tracing", "Occupied-unit access premium"],
    coordinationIssues: ["Low voltage responsibility unclear", "Fire alarm interface unclear", "Drywall and paint patching not aligned"],
    questions: ["Does pricing include permit, utility coordination, inspection support, and patching?", "Are panels, breakers, grounding, and labeling all included?", "What assumptions were made about existing conditions?"],
  },
  Plumbing: {
    moduleName: "Plumbing",
    commonMisses: ["Shutdown planning", "Wall and floor patching after pipe work", "Fixture carrier or support conditions", "Existing supply and waste condition uncertainty"],
    badExclusions: ["Permit excluded without clear owner carry", "Water shutoff coordination excluded", "Access panels excluded", "Testing and disinfection excluded"],
    hiddenCosts: ["Weekend shutdowns", "Concealed piping repairs", "Fixture protection and reinstallation"],
    coordinationIssues: ["Cabinet and countertop penetrations", "Firestopping at pipe penetrations", "Roofing tie-ins for vents", "Resident notice for occupied shutdowns"],
    questions: ["Who carries shutdown planning and resident notices?", "Does scope include patching and access panels?", "What was assumed about concealed piping condition?"],
  },
  "HVAC/mechanical": {
    moduleName: "HVAC",
    commonMisses: ["Controls integration scope", "Testing, adjusting, and balancing", "Line set concealment and patching", "Condensate routing revisions"],
    badExclusions: ["Startup excluded", "Permit excluded", "Roof patching excluded without coordination", "Demolition and disposal left vague"],
    hiddenCosts: ["Occupied temperature control measures", "Lead times on equipment", "Electrical disconnect and control coordination", "Commissioning support"],
    coordinationIssues: ["Controls versus electrician scope", "Roof penetration patching", "Ceiling access and restoration", "Tenant comfort during cutovers"],
    questions: ["Who owns startup, balancing, controls, and commissioning support?", "What was assumed about roof patching and structural support?", "How will occupied comfort be maintained during cutovers?"],
  },
  Roofing: {
    moduleName: "Roofing",
    commonMisses: ["Deck repair assumptions", "Penetration flashing coordination", "Temporary dry-in", "Warranty inspection coordination"],
    badExclusions: ["Permit excluded", "Deck repairs broadly excluded", "Sheet metal interface left vague", "Temporary weather protection excluded"],
    hiddenCosts: ["Occupied leak response", "Roof access logistics", "Material staging constraints", "Unexpected deck replacement"],
    coordinationIssues: ["HVAC curb work", "Sheet metal trim", "Lightning protection", "Solar or low voltage penetrations"],
    questions: ["Who owns temporary dry-in and protection?", "How are deck repairs handled if discovered?", "Who coordinates penetrations and flashing details?"],
  },
  Windows: {
    moduleName: "Window",
    commonMisses: ["Interior trim restoration", "Exterior flashing integration", "Lead-safe or hazmat prep", "Occupied dust control and protection"],
    badExclusions: ["Patching excluded without clear owner carry", "Permit excluded", "Temporary weatherproofing excluded", "Disposal left vague"],
    hiddenCosts: ["Rot repair", "Interior finish restoration", "Tenant access coordination", "Shoring or temporary protection"],
    coordinationIssues: ["Stucco or siding patching", "Interior paint", "Blinds and hardware removal", "Schedule sequencing by unit"],
    questions: ["Who owns interior and exterior patching?", "What was assumed about rot or substrate damage?", "How are occupied-unit access and protection handled?"],
  },
  "Doors/hardware": {
    moduleName: "Doors / Hardware",
    commonMisses: ["Existing frame condition assumptions", "Keying and core schedule", "Fire-rated opening repairs", "Access control integration"],
    badExclusions: ["Hardware schedule coordination excluded", "Painting excluded", "Fire caulk and label issues excluded"],
    hiddenCosts: ["Frame repairs", "Lead times on hardware", "Rekeying labor", "Access control interface work"],
    coordinationIssues: ["Electrical for electrified hardware", "Access control programming", "Wall patching around frames", "Resident access during occupied work"],
    questions: ["Who owns keying and core schedule coordination?", "What was assumed about existing frame condition?", "Does scope include access control interface work?"],
  },
  Flooring: {
    moduleName: "Flooring",
    commonMisses: ["Floor prep level and quantity", "Moisture mitigation need", "Furniture moving", "Closet and stair areas", "Occupied-unit premium"],
    badExclusions: ["Floor prep excluded entirely", "Transitions excluded", "Disposal left vague", "Base replacement or reset unclear"],
    hiddenCosts: ["Moisture testing", "Adhesive abatement concerns", "After-hours access", "Resident protection"],
    coordinationIssues: ["Cabinet kick removal", "Appliance move and reconnect", "Door undercuts", "Painting after base removal"],
    questions: ["What was assumed for floor prep and moisture?", "Who moves furniture and appliances?", "Are stairs and closets included?"],
  },
  "Cabinets/countertops": {
    moduleName: "Cabinets / Countertops",
    commonMisses: ["Field measurements", "Scribe/filler responsibility", "Backsplash and side splash", "Hardware and pulls", "Sink and appliance cutouts"],
    badExclusions: ["Template trips excluded", "Blocking excluded", "Repairs to walls after removal excluded", "Caulking left vague"],
    hiddenCosts: ["Out-of-square walls", "Lead times", "Damaged existing substrate", "Occupied-unit access"],
    coordinationIssues: ["Plumbing rough-in", "Electrical devices", "Appliance dimensions", "Wall patching and paint"],
    questions: ["Who owns field measuring and template trips?", "Are blocking, fillers, cutouts, and caulking included?", "How are damaged walls or substrate handled?"],
  },
  Painting: {
    moduleName: "Drywall / Paint",
    commonMisses: ["Primer requirements", "Patch-to-match expectations", "Occupied protection", "Level of finish", "Color changes"],
    badExclusions: ["Touch-up only language", "Patching by others", "Protection excluded", "After-hours premium left vague"],
    hiddenCosts: ["Multiple mobilizations", "Substrate repairs", "Color matching", "Resident access delays"],
    coordinationIssues: ["Drywall patch quality", "Door and cabinet interfaces", "Flooring/base sequence", "Punch list standards"],
    questions: ["What finish level and paint system apply?", "Who owns substrate repair before paint?", "How are occupied-unit access and protection priced?"],
  },
  Drywall: {
    moduleName: "Drywall / Paint",
    commonMisses: ["Patch-to-match limits", "Fire-rated assemblies", "Level 5 or texture requirements", "Access panel scope", "Moisture-resistant board locations"],
    badExclusions: ["Fire caulk excluded", "Backing/blocking excluded", "Texture matching excluded", "Cleanup excluded"],
    hiddenCosts: ["Multiple patch mobilizations", "Existing wall damage", "Inspection rework", "Occupied protection"],
    coordinationIssues: ["Electrical and plumbing penetrations", "Firestopping", "Painting sequence", "Cabinet and door interfaces"],
    questions: ["Which assemblies are rated and who owns firestopping?", "What texture or finish level is required?", "Are access panels and backing included?"],
  },
  Abatement: {
    moduleName: "Abatement",
    commonMisses: ["Sampling limitations", "Clearance testing responsibility", "Temporary containment impacts", "Resident notice and relocation needs"],
    badExclusions: ["Clearance testing excluded without owner awareness", "Permit and notification scope unclear", "Overtime containment work excluded"],
    hiddenCosts: ["Occupied phasing", "Air monitoring", "After-hours work", "Additional containment"],
    coordinationIssues: ["Trade turnover after clearance", "Resident relocation timing", "Waste haul routes", "Protection of adjacent finished spaces"],
    questions: ["Who owns sampling, testing, and clearance?", "How will containment affect adjacent work and occupants?", "What assumptions were made about quantities and access?"],
  },
  Appliances: {
    moduleName: "Appliances",
    commonMisses: ["Delivery and staging", "Haul-off of existing appliances", "Connection kits", "Anti-tip brackets", "Damaged-unit replacement process"],
    badExclusions: ["Install excluded", "Disposal excluded", "Occupied-unit coordination excluded", "Accessories excluded"],
    hiddenCosts: ["Freight damage", "Storage constraints", "Re-delivery fees", "Resident access delays"],
    coordinationIssues: ["Electrical receptacles", "Plumbing connections", "Cabinet openings", "Floor protection"],
    questions: ["Who owns delivery, install, connection kits, and haul-off?", "How are damaged or missing units handled?", "Are cabinet openings and utilities field verified?"],
  },
  Sitework: {
    moduleName: "Sitework",
    commonMisses: ["Unsuitable soils", "Utility conflicts", "Storm drain tie-ins", "Traffic control", "Erosion control maintenance"],
    badExclusions: ["Rock excavation excluded", "Utility potholing excluded", "Permits excluded", "Dewatering excluded"],
    hiddenCosts: ["Export/import quantities", "Weather delays", "Unknown utilities", "Testing and compaction rework"],
    coordinationIssues: ["Building pad turnover", "Utility company work", "Landscape interfaces", "Public right-of-way requirements"],
    questions: ["Who owns potholing and utility coordination?", "What is the allowance or unit price for unsuitable soils?", "Which permits and right-of-way controls apply?"],
  },
  "Fire protection": {
    moduleName: "Fire / Life Safety",
    commonMisses: ["System shutdown coordination", "Monitoring and fire watch", "Penetration firestopping", "Sprinkler head relocation versus replacement"],
    badExclusions: ["Monitoring coordination excluded", "Temporary life-safety measures excluded", "Testing support excluded"],
    hiddenCosts: ["Night work to maintain occupancy", "Fire watch labor", "Cross-trade coordination", "AHJ-driven revisions"],
    coordinationIssues: ["Electrical and low voltage boundaries", "Ceiling patching after sprinkler work", "Firestopping ownership", "Resident notification"],
    questions: ["Who owns monitoring and testing support?", "What temporary life-safety measures are required during shutdowns?", "Where do firestopping responsibilities land?"],
  },
  "Multifamily occupied rehab": {
    moduleName: "Occupied Rehab",
    commonMisses: ["Resident notice sequencing", "Temporary facilities or relocation assumptions", "Daily clean-up standards", "Access windows by unit"],
    badExclusions: ["Resident coordination excluded", "Protection and temporary barriers excluded", "After-hours premium left vague"],
    hiddenCosts: ["Reduced crew productivity", "Tenant reschedules", "Protection and cleanup", "Longer turnover durations"],
    coordinationIssues: ["Owner notices", "Move management", "Resident services coordination", "Inspection timing by unit"],
    questions: ["What are the access windows per unit?", "Who handles tenant communication?", "What protection and cleanup standards apply each day?"],
  },
};

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

function libraryFindingId(trade: TradeScopeCategory, suffix: string): string {
  return `${trade.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${suffix}`.replace(/^-|-$/g, "");
}

function buildLibraryReview(detected: DetectedTradeScope): TradeReviewFinding[] {
  const library = TRADE_LIBRARY[detected.trade];
  if (!library) return [];

  const evidence = detected.evidence.length > 0 ? detected.evidence.join("; ") : "Detected trade scope";
  const confidence = detected.confidence === "Low" ? "Low" : detected.confidence;
  return [
    {
      id: libraryFindingId(detected.trade, "common-misses"),
      trade: detected.trade,
      title: `${library.moduleName} missed scope to verify`,
      whyItMatters: library.commonMisses.slice(0, 4).join("; "),
      evidence,
      riskLevel: "high",
      confidence,
      recommendedAction: library.questions[0] ?? "Clarify included scope, exclusions, and field verification before relying on the package.",
    },
    {
      id: libraryFindingId(detected.trade, "exclusions-hidden-costs"),
      trade: detected.trade,
      title: `${library.moduleName} exclusions and hidden costs need cleanup`,
      whyItMatters: [...library.badExclusions.slice(0, 2), ...library.hiddenCosts.slice(0, 2)].join("; "),
      evidence,
      riskLevel: "high",
      confidence,
      recommendedAction: library.questions[1] ?? "Request pricing breakouts and written assumptions for exclusions, allowances, and hidden-cost items.",
    },
    {
      id: libraryFindingId(detected.trade, "coordination"),
      trade: detected.trade,
      title: `${library.moduleName} coordination and inspection items need ownership`,
      whyItMatters: library.coordinationIssues.slice(0, 4).join("; "),
      evidence,
      riskLevel: "medium",
      confidence,
      recommendedAction: library.questions[2] ?? "Assign ownership for coordination, inspection, closeout, and field-verification items.",
    },
  ];
}

function uniqueFindings(findings: TradeReviewFinding[]): TradeReviewFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    if (seen.has(finding.id)) return false;
    seen.add(finding.id);
    return true;
  });
}

export function buildTradeSpecificReview(project: Project, detected: DetectedTradeScope): TradeReviewFinding[] {
  const focusedRules =
    detected.trade === "Electrical" ? runRules(project, detected, ELECTRICAL_RULES) :
      detected.trade === "Windows" ? runRules(project, detected, WINDOW_RULES) :
        [];
  return uniqueFindings([...focusedRules, ...buildLibraryReview(detected)]);
}

export function tradeModuleStatus(trade: TradeScopeCategory): string {
  if (trade === "Electrical") return "Electrical module applied";
  if (trade === "Windows") return "Window module applied";
  const library = TRADE_LIBRARY[trade];
  if (library) return `${library.moduleName} module applied`;
  if (trade === "Unknown/mixed scope") return "General review applied";
  return "General review applied; trade module not added yet";
}
