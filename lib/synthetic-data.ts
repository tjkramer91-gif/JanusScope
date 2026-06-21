import type { Project } from "@/lib/types";

export const USE_FAKE_SAMPLE_DATA_ONLY = true;
export const SYNTHETIC_DATA_APPROVAL_FLAG = "[JANUSSCOPE_SYNTHETIC_DATA_APPROVED]";
export const SYNTHETIC_DATASET_APPROVAL_ID = "synthetic-demo-v2";
export const SYNTHETIC_STORAGE_PREFIX = "synthetic-demo";
export const SYNTHETIC_REPORT_FOOTER =
  "All project data shown within this report is synthetic and generated solely for demonstration purposes. No real project, company, client, contractor, vendor, property, or financial information is used.";

export const SYNTHETIC_DATA_GOVERNANCE_PROMISES = [
  "JanusScope does not use customer data as demo content.",
  "Customer uploads remain isolated from synthetic demo examples.",
  "Example projects are synthetic.",
  "Training examples are synthetic.",
  "Reports generated for demonstrations use synthetic data.",
  "No client-specific information is intentionally embedded within the platform.",
] as const;

export interface SyntheticPricingRule {
  key: string;
  label: string;
  unit: "each" | "lf" | "sf" | "allowance" | "month";
  basePrice: number;
  maxVariance: number;
  roundTo: number;
}

export interface SyntheticDemoProfile {
  seed: string;
  approvalId: string;
  projectName: string;
  projectAddress: string;
  city: string;
  state: string;
  zip: string;
  tradeType: string;
  gcName: string;
  ownerName: string;
  architectName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contractAmount: number;
  bidDate: string;
  executionDeadline: string;
}

const PROJECT_PREFIXES = ["Cinder Grove", "North Orchard", "Signal Ridge", "Copper Lantern", "Dry Creek"];
const PROJECT_SUFFIXES = ["Renovation", "Rehab Package", "Scope Review", "Unit Refresh", "Bid Package"];
const GC_NAMES = [
  "Synthetic Builders Collective LLC",
  "Demo Construction Partners LLC",
  "Sample Field Coordination Group LLC",
  "Placeholder Buyout Services LLC",
];
const OWNER_NAMES = [
  "Synthetic Housing Sponsor LLC",
  "Demo Asset Stewardship Group LLC",
  "Sample Capital Housing Partners LLC",
  "Placeholder Property Holdings LLC",
];
const ARCHITECT_NAMES = [
  "Placeholder Design Studio LLC",
  "Synthetic Architecture Workshop LLC",
  "Demo Project Design Group LLC",
];
const PEOPLE = ["Jordan Placeholder", "Casey Example", "Taylor Sample", "Morgan Demo", "Alex Synthetic"];
const STREETS = ["Cinder Mesa Drive", "Signal Foundry Avenue", "North Surveyor Lane", "Copper Orchard Way", "Dry Creek Terrace"];
const CITIES = ["Example City", "Sample Junction", "Demo Crossing", "Placeholder Basin"];
const TRADES = ["Electrical", "Windows", "Roofing", "Flooring", "Doors and Hardware"];
const EMAIL_PREFIXES = ["estimating", "pm", "buyout", "ops", "review"];
const EMAIL_DOMAINS = ["synthetic-builders.example", "demo-housing.example", "placeholder-design.invalid"];

export const SYNTHETIC_PRICING_RULES: SyntheticPricingRule[] = [
  { key: "electrical-panel-replacement", label: "Electrical Panel Replacement", unit: "each", basePrice: 1950, maxVariance: 0.16, roundTo: 25 },
  { key: "window-replacement", label: "Window Replacement", unit: "each", basePrice: 875, maxVariance: 0.15, roundTo: 25 },
  { key: "interior-door-replacement", label: "Interior Door Replacement", unit: "each", basePrice: 425, maxVariance: 0.14, roundTo: 25 },
  { key: "apartment-subpanel-upgrade", label: "Apartment Subpanel Upgrade", unit: "each", basePrice: 2475, maxVariance: 0.18, roundTo: 25 },
  { key: "firestopping-penetration", label: "Firestopping Penetration", unit: "each", basePrice: 185, maxVariance: 0.12, roundTo: 5 },
  { key: "occupied-unit-premium", label: "Occupied Unit Premium", unit: "each", basePrice: 135, maxVariance: 0.1, roundTo: 5 },
];

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: string, salt: string): T {
  return items[hashSeed(`${seed}:${salt}`) % items.length] as T;
}

function integer(seed: string, salt: string, min: number, max: number): number {
  const span = max - min + 1;
  return min + (hashSeed(`${seed}:${salt}`) % span);
}

function rounded(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

function amount(rule: SyntheticPricingRule, seed: string, salt: string): number {
  const hash = hashSeed(`${seed}:${salt}`);
  const normalized = (hash % 10000) / 10000;
  const multiplier = 1 - rule.maxVariance + normalized * rule.maxVariance * 2;
  return rounded(rule.basePrice * multiplier, rule.roundTo);
}

function syntheticZip(seed: string): string {
  return String(integer(seed, "zip", 0, 99999)).padStart(5, "0");
}

function syntheticAddressNumber(seed: string): number {
  return integer(seed, "address-number", 1100, 4895);
}

function syntheticContractAmount(seed: string): number {
  return rounded(integer(seed, "contract-amount", 680000, 2840000), 25);
}

function syntheticDate(seed: string, salt: string, baseDay: number): string {
  const month = String(integer(seed, `${salt}:month`, 1, 12)).padStart(2, "0");
  const day = String(integer(seed, `${salt}:day`, baseDay, Math.min(baseDay + 6, 28))).padStart(2, "0");
  return `2026-${month}-${day}`;
}

function syntheticEmail(seed: string): string {
  const prefix = pick(EMAIL_PREFIXES, seed, "email-prefix");
  const domain = pick(EMAIL_DOMAINS, seed, "email-domain");
  return `${prefix}@${domain}`;
}

function syntheticPhone(seed: string): string {
  return `555-01${String(integer(seed, "phone", 0, 99)).padStart(2, "0")}`;
}

export function createSyntheticDemoProfile(seed = "janusscope-demo"): SyntheticDemoProfile {
  const projectPrefix = pick(PROJECT_PREFIXES, seed, "project-prefix");
  const projectSuffix = pick(PROJECT_SUFFIXES, seed, "project-suffix");
  return {
    seed,
    approvalId: `${SYNTHETIC_DATASET_APPROVAL_ID}:${seed}`,
    projectName: `Synthetic ${projectPrefix} ${projectSuffix}`,
    projectAddress: `${syntheticAddressNumber(seed)} ${pick(STREETS, seed, "street")}`,
    city: pick(CITIES, seed, "city"),
    state: "ST",
    zip: syntheticZip(seed),
    tradeType: pick(TRADES, seed, "trade"),
    gcName: pick(GC_NAMES, seed, "gc"),
    ownerName: pick(OWNER_NAMES, seed, "owner"),
    architectName: pick(ARCHITECT_NAMES, seed, "architect"),
    contactName: pick(PEOPLE, seed, "person"),
    contactEmail: syntheticEmail(seed),
    contactPhone: syntheticPhone(seed),
    contractAmount: syntheticContractAmount(seed),
    bidDate: syntheticDate(seed, "bid-date", 3),
    executionDeadline: syntheticDate(seed, "execution-date", 15),
  };
}

export function syntheticPriceFor(ruleKey: string, seed: string, salt = "base"): number {
  const rule = SYNTHETIC_PRICING_RULES.find((item) => item.key === ruleKey);
  if (!rule) throw new Error(`Unknown synthetic pricing rule: ${ruleKey}`);
  return amount(rule, seed, salt);
}

export function buildSyntheticPricingBook(seed = "janusscope-pricing"): Record<string, number> {
  return Object.fromEntries(SYNTHETIC_PRICING_RULES.map((rule) => [rule.key, syntheticPriceFor(rule.key, seed, "book")]));
}

export function syntheticDatasetApprovalNote(seed: string, purpose: string): string {
  return `${SYNTHETIC_DATA_APPROVAL_FLAG} ${purpose} approved under ${SYNTHETIC_DATASET_APPROVAL_ID} for seed ${seed}.`;
}

export function syntheticDatasetSourceLabel(seed: string): string {
  return `Synthetic dataset ${seed}`;
}

export const SYNTHETIC_DEMO_EXAMPLES = [
  createSyntheticDemoProfile("janusscope-example-a"),
  createSyntheticDemoProfile("janusscope-example-b"),
  createSyntheticDemoProfile("janusscope-example-c"),
];

export const SYNTHETIC_SAMPLE_IDENTITIES = {
  projects: SYNTHETIC_DEMO_EXAMPLES.map((profile) => profile.projectName),
  companies: Array.from(new Set(SYNTHETIC_DEMO_EXAMPLES.flatMap((profile) => [profile.gcName, profile.ownerName, profile.architectName]))),
  people: SYNTHETIC_DEMO_EXAMPLES.map((profile) => profile.contactName),
  address: `${SYNTHETIC_DEMO_EXAMPLES[0]?.projectAddress}, ${SYNTHETIC_DEMO_EXAMPLES[0]?.city}, ${SYNTHETIC_DEMO_EXAMPLES[0]?.state} ${SYNTHETIC_DEMO_EXAMPLES[0]?.zip}`,
  emails: SYNTHETIC_DEMO_EXAMPLES.map((profile) => profile.contactEmail),
  phones: SYNTHETIC_DEMO_EXAMPLES.map((profile) => profile.contactPhone),
};

export function isSyntheticDemoProject(project: Pick<Project, "id" | "notesText" | "uploadedFiles">): boolean {
  return (
    project.id.startsWith("demo-subscope-risk-review") ||
    project.notesText.includes(SYNTHETIC_DATA_APPROVAL_FLAG) ||
    project.uploadedFiles.some((file) => file.storagePath.startsWith(`${SYNTHETIC_STORAGE_PREFIX}/`))
  );
}
