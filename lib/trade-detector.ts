import type { Project, UploadedFile } from "@/lib/types";

export type TradeScopeCategory =
  | "Electrical"
  | "Plumbing"
  | "HVAC/mechanical"
  | "Roofing"
  | "Windows"
  | "Doors/hardware"
  | "Flooring"
  | "Cabinets/countertops"
  | "Painting"
  | "Drywall"
  | "Framing"
  | "Concrete"
  | "Sitework"
  | "Landscaping"
  | "Abatement"
  | "Fire protection"
  | "Appliances"
  | "General conditions"
  | "Multifamily occupied rehab"
  | "Unknown/mixed scope";

export interface DetectedTradeScope {
  trade: TradeScopeCategory;
  confidence: "High" | "Medium" | "Low";
  evidence: string[];
}

const TRADE_PATTERNS: Array<{ trade: TradeScopeCategory; terms: RegExp[] }> = [
  { trade: "Electrical", terms: [/electrical|electric|division 26|panel|meter bank|feeder|grounding|gfci|afci|fire alarm|low voltage/] },
  { trade: "Plumbing", terms: [/plumbing|division 22|pipe|fixture|water heater|sanitary|domestic water/] },
  { trade: "HVAC/mechanical", terms: [/hvac|mechanical|division 23|air handler|rtu|duct|diffuser|condensing|refrigerant/] },
  { trade: "Roofing", terms: [/roof|roofing|membrane|flashing|coping|underlayment|shingle/] },
  { trade: "Windows", terms: [/window|glazing|u-factor|shgc|sill pan|tempered|egress|storefront/] },
  { trade: "Doors/hardware", terms: [/door|hardware|frame|hinge|lockset|closer|threshold/] },
  { trade: "Flooring", terms: [/flooring|lvt|carpet|tile|base|underlayment/] },
  { trade: "Cabinets/countertops", terms: [/cabinet|countertop|casework|solid surface|quartz/] },
  { trade: "Painting", terms: [/paint|painting|primer|coating|finish coat/] },
  { trade: "Drywall", terms: [/drywall|gypsum|gyp|taping|texture|level 5/] },
  { trade: "Framing", terms: [/framing|stud|joist|truss|rough carpentry/] },
  { trade: "Concrete", terms: [/concrete|rebar|slab|footing|formwork|post-tension/] },
  { trade: "Sitework", terms: [/sitework|earthwork|grading|utility|storm drain|asphalt|paving/] },
  { trade: "Landscaping", terms: [/landscape|irrigation|planting|tree|mulch|sod/] },
  { trade: "Abatement", terms: [/abatement|asbestos|lead paint|lead-safe|hazmat|hazardous material|mold remediation/] },
  { trade: "Fire protection", terms: [/fire protection|sprinkler|nfpa|fire pump|standpipe/] },
  { trade: "Appliances", terms: [/appliance|refrigerator|range|dishwasher|washer|dryer/] },
  { trade: "General conditions", terms: [/general conditions|supervision|site logistics|temporary facilities/] },
  { trade: "Multifamily occupied rehab", terms: [/occupied rehab|resident|tenant|unit access|multifamily|apartment/] },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ");
}

function evidenceText(project: Project): string {
  return [
    project.tradeType,
    project.name,
    project.projectAddress,
    project.notesText,
    project.subcontractText,
    project.bidText,
    project.exclusionsText,
    ...project.uploadedFiles.flatMap((file) => [file.name, file.extractedText ?? ""]),
  ].join(" ");
}

function fileEvidence(files: UploadedFile[], pattern: RegExp): string | null {
  const match = files.find((file) => pattern.test(normalize(`${file.name} ${file.extractedText ?? ""}`)));
  return match ? match.name : null;
}

export function detectTradeScope(project: Project): DetectedTradeScope {
  const text = normalize(evidenceText(project));
  const scores = TRADE_PATTERNS.map(({ trade, terms }) => {
    const matchedTerms = terms.filter((term) => term.test(text));
    const directTradeInput = project.tradeType && terms.some((term) => term.test(normalize(project.tradeType)));
    const tradeName = trade.toLowerCase().split("/")[0];
    const singularTradeName = tradeName.endsWith("s") ? tradeName.slice(0, -1) : tradeName;
    const explicitTradeName = text.includes(tradeName) || text.includes(singularTradeName);
    return {
      trade,
      score: matchedTerms.length + (directTradeInput ? 3 : 0) + (explicitTradeName ? 2 : 0),
      matchedTerms,
    };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  if (!top || top.score <= 0) {
    return {
      trade: "Unknown/mixed scope",
      confidence: "Low",
      evidence: ["No trade-specific terms were strong enough to route the review."],
    };
  }

  const evidence = top.matchedTerms.slice(0, 4).map((term) => `Matched term: ${term.source.replace(/\\|\/|\[|\]|\(|\)|\|/g, "")}`);
  const sourceFile = fileEvidence(project.uploadedFiles, top.matchedTerms[0]);
  if (project.tradeType) evidence.unshift(`Project trade input: ${project.tradeType}`);
  if (sourceFile) evidence.push(`Document evidence: ${sourceFile}`);

  return {
    trade: top.trade,
    confidence: top.score >= 4 ? "High" : top.score >= 2 ? "Medium" : "Low",
    evidence: evidence.slice(0, 5),
  };
}
