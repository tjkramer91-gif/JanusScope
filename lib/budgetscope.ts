export const NORMALIZED_TRADE_CATEGORIES = [
  "General Conditions",
  "Demo",
  "Abatement",
  "Concrete",
  "Masonry",
  "Rough Carpentry",
  "Finish Carpentry",
  "Cabinets/Countertops",
  "Doors/Hardware",
  "Windows",
  "Roofing",
  "Waterproofing",
  "Insulation",
  "Drywall",
  "Paint",
  "Flooring",
  "Appliances",
  "Plumbing",
  "HVAC",
  "Electrical",
  "Fire Protection",
  "Low Voltage",
  "Sitework",
  "Landscaping",
  "Asphalt/Paving",
  "Fencing",
  "ADA/Accessibility",
  "Permits/Fees",
  "Testing/Inspections",
  "Contingency",
  "Allowances",
  "Other/Unmapped",
] as const;

export type NormalizedTradeCategory = (typeof NORMALIZED_TRADE_CATEGORIES)[number];
export type BudgetSourceType = "budget" | "bid" | "estimate" | "actual" | "allowance" | "conceptual";
export type OccupiedOrVacant = "occupied" | "vacant" | "mixed" | "unknown";

export interface BudgetColumnMapping {
  costCode?: string;
  csiDivision?: string;
  trade?: string;
  description?: string;
  quantity?: string;
  unitOfMeasure?: string;
  unitCost?: string;
  totalCost?: string;
  notes?: string;
  exclusions?: string;
  alternates?: string;
  allowanceFlag?: string;
}

export interface ParsedBudgetLineItem {
  rowNumber: number;
  costCode: string;
  csiDivision: string;
  rawTrade: string;
  normalizedTrade: NormalizedTradeCategory;
  rawDescription: string;
  normalizedScopeCategory: string;
  normalizedScopeSubcategory: string;
  quantity: number | null;
  unitOfMeasure: string;
  unitCost: number | null;
  totalCost: number | null;
  notes: string;
  exclusions: string;
  alternates: string;
  isAllowance: boolean;
  isContingency: boolean;
  confidenceScore: number;
  mappingStatus: string;
  reviewStatus: string;
}

export interface ParsedBudgetCsv {
  headers: string[];
  lineItems: ParsedBudgetLineItem[];
  mapping: Required<BudgetColumnMapping>;
}

const EMPTY_MAPPING: Required<BudgetColumnMapping> = {
  costCode: "",
  csiDivision: "",
  trade: "",
  description: "",
  quantity: "",
  unitOfMeasure: "",
  unitCost: "",
  totalCost: "",
  notes: "",
  exclusions: "",
  alternates: "",
  allowanceFlag: "",
};

const COLUMN_SYNONYMS: Record<keyof BudgetColumnMapping, string[]> = {
  costCode: ["cost code", "costcode", "code", "item code", "cost item"],
  csiDivision: ["csi", "csi division", "division", "div"],
  trade: ["trade", "category", "scope", "contractor"],
  description: ["description", "scope description", "item", "line item", "work item", "scope item"],
  quantity: ["qty", "quantity", "amount"],
  unitOfMeasure: ["uom", "unit", "unit of measure", "measure"],
  unitCost: ["unit cost", "unit price", "cost/unit", "price/unit"],
  totalCost: ["total", "total cost", "extended cost", "extension", "amount", "budget"],
  notes: ["notes", "note", "comments", "comment"],
  exclusions: ["exclusions", "excluded", "exclusion"],
  alternates: ["alternates", "alternate", "alts", "alt"],
  allowanceFlag: ["allowance", "allowance flag", "is allowance"],
};

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

function detectColumn(headers: string[], field: keyof BudgetColumnMapping, provided?: string): string {
  if (provided?.trim()) {
    const exact = headers.find((header) => normalizeHeader(header) === normalizeHeader(provided));
    return exact ?? provided.trim();
  }

  const normalizedHeaders = headers.map((header) => ({ header, normalized: normalizeHeader(header) }));
  return normalizedHeaders.find(({ normalized }) => COLUMN_SYNONYMS[field].some((synonym) => normalized === synonym || normalized.includes(synonym)))?.header ?? "";
}

function rowValue(row: Record<string, string>, column: string): string {
  if (!column) return "";
  const exact = row[column];
  if (exact !== undefined) return exact;
  const normalized = normalizeHeader(column);
  const key = Object.keys(row).find((header) => normalizeHeader(header) === normalized);
  return key ? row[key] ?? "" : "";
}

function numberOrNull(value: string): number | null {
  const clean = value.replace(/[$,%]/g, "").replace(/,/g, "").trim();
  if (!clean) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanish(value: string): boolean {
  return /^(true|yes|y|1|allowance)$/i.test(value.trim());
}

export function normalizeBudgetTrade(value: string, description = ""): NormalizedTradeCategory {
  const text = `${value} ${description}`.toLowerCase();
  if (/general condition|gc\b|supervision|mobilization/.test(text)) return "General Conditions";
  if (/demo|demolition/.test(text)) return "Demo";
  if (/abatement|hazmat|asbestos|lead/.test(text)) return "Abatement";
  if (/concrete|slab|foundation/.test(text)) return "Concrete";
  if (/masonry|cmu|brick/.test(text)) return "Masonry";
  if (/rough carpentry|framing|lumber/.test(text)) return "Rough Carpentry";
  if (/finish carpentry|trim|millwork/.test(text)) return "Finish Carpentry";
  if (/cabinet|countertop/.test(text)) return "Cabinets/Countertops";
  if (/door|hardware/.test(text)) return "Doors/Hardware";
  if (/window|glazing/.test(text)) return "Windows";
  if (/roof/.test(text)) return "Roofing";
  if (/waterproof/.test(text)) return "Waterproofing";
  if (/insulation/.test(text)) return "Insulation";
  if (/drywall|gypsum|gyp/.test(text)) return "Drywall";
  if (/paint|coating/.test(text)) return "Paint";
  if (/floor|carpet|lvp|tile/.test(text)) return "Flooring";
  if (/appliance|refrigerator|range/.test(text)) return "Appliances";
  if (/plumb|fixture|pipe/.test(text)) return "Plumbing";
  if (/hvac|mechanical|duct/.test(text)) return "HVAC";
  if (/electric|panel|lighting|power/.test(text)) return "Electrical";
  if (/fire sprinkler|fire protection/.test(text)) return "Fire Protection";
  if (/low voltage|data|telecom|access control/.test(text)) return "Low Voltage";
  if (/sitework|earthwork|grading|utility/.test(text)) return "Sitework";
  if (/landscap|irrigation/.test(text)) return "Landscaping";
  if (/asphalt|paving|parking/.test(text)) return "Asphalt/Paving";
  if (/fenc/.test(text)) return "Fencing";
  if (/ada|accessib/.test(text)) return "ADA/Accessibility";
  if (/permit|fee|impact fee/.test(text)) return "Permits/Fees";
  if (/testing|inspection|commission/.test(text)) return "Testing/Inspections";
  if (/contingenc/.test(text)) return "Contingency";
  if (/allowance/.test(text)) return "Allowances";
  return "Other/Unmapped";
}

export function parseBudgetCsv(csv: string, mappingInput: BudgetColumnMapping = {}): ParsedBudgetCsv {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) throw new Error("Budget CSV needs a header row and at least one line item.");

  const headers = rows[0].map((header) => header.trim()).filter(Boolean);
  if (headers.length === 0) throw new Error("Budget CSV header row is empty.");

  const mapping: Required<BudgetColumnMapping> = { ...EMPTY_MAPPING };
  for (const field of Object.keys(mapping) as Array<keyof BudgetColumnMapping>) {
    mapping[field] = detectColumn(headers, field, mappingInput[field]);
  }

  if (!mapping.description && !mapping.totalCost) {
    throw new Error("Map at least a description or total cost column before saving BudgetScope line items.");
  }

  const lineItems = rows.slice(1).map((cells, index) => {
    const row = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] ?? ""]));
    const rawTrade = rowValue(row, mapping.trade);
    const rawDescription = rowValue(row, mapping.description);
    const totalCost = numberOrNull(rowValue(row, mapping.totalCost));
    const unitCost = numberOrNull(rowValue(row, mapping.unitCost));
    const quantity = numberOrNull(rowValue(row, mapping.quantity));
    const normalizedTrade = normalizeBudgetTrade(rawTrade, rawDescription);
    const allowanceText = `${rowValue(row, mapping.allowanceFlag)} ${rawTrade} ${rawDescription}`;
    const confidenceScore = [mapping.description, mapping.totalCost, mapping.trade, mapping.quantity, mapping.unitCost].filter(Boolean).length / 5;

    return {
      rowNumber: index + 2,
      costCode: rowValue(row, mapping.costCode),
      csiDivision: rowValue(row, mapping.csiDivision),
      rawTrade,
      normalizedTrade,
      rawDescription,
      normalizedScopeCategory: normalizedTrade,
      normalizedScopeSubcategory: "",
      quantity,
      unitOfMeasure: rowValue(row, mapping.unitOfMeasure),
      unitCost,
      totalCost,
      notes: rowValue(row, mapping.notes),
      exclusions: rowValue(row, mapping.exclusions),
      alternates: rowValue(row, mapping.alternates),
      isAllowance: booleanish(rowValue(row, mapping.allowanceFlag)) || /allowance/i.test(allowanceText),
      isContingency: /contingenc/i.test(`${rawTrade} ${rawDescription}`),
      confidenceScore: Number(confidenceScore.toFixed(2)),
      mappingStatus: confidenceScore >= 0.6 ? "mapped" : "needs_review",
      reviewStatus: "raw",
    } satisfies ParsedBudgetLineItem;
  }).filter((item) => item.rawDescription || item.totalCost !== null || item.rawTrade);

  if (lineItems.length === 0) throw new Error("No usable budget line items were found in the CSV.");
  return { headers, lineItems, mapping };
}
