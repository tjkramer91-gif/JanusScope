import type { NormalizedTradeCategory } from "@/lib/budgetscope";

export type BudgetComparisonRiskFlag =
  | "large_unit_cost_increase"
  | "large_unit_cost_decrease"
  | "large_quantity_increase"
  | "large_quantity_decrease"
  | "new_current_line_item"
  | "missing_prior_line_item"
  | "changed_unit_of_measure"
  | "possible_duplicate_line_item"
  | "allowance_changed"
  | "scope_may_have_expanded"
  | "prior_budget_may_have_been_undercarried"
  | "current_budget_may_include_added_scope"
  | "current_budget_may_be_missing_prior_scope"
  | "pricing_should_be_validated_with_subcontractor_quote"
  | "trade_mapping_may_be_uncertain";

export interface BudgetMetricContext {
  grossSquareFeet: number | null;
  rentableSquareFeet: number | null;
  unitCount: number | null;
  buildingCount: number | null;
}

export interface BudgetComparisonLineItemInput {
  id: string;
  budgetId: string;
  budgetVersionId: string;
  rowNumber: number;
  costCode: string;
  normalizedTrade: NormalizedTradeCategory;
  normalizedScopeCategory: string;
  normalizedScopeSubcategory: string;
  rawDescription: string;
  quantity: number | null;
  unitOfMeasure: string;
  unitCost: number | null;
  totalCost: number | null;
  isAllowance: boolean;
  confidenceScore: number;
  mappingStatus: string;
}

export interface BudgetComparisonResultInput {
  priorBudgetId: string;
  currentBudgetId: string;
  priorBudgetVersionId: string | null;
  currentBudgetVersionId: string | null;
  priorContext: BudgetMetricContext;
  currentContext: BudgetMetricContext;
  priorLineItems: BudgetComparisonLineItemInput[];
  currentLineItems: BudgetComparisonLineItemInput[];
}

export interface BudgetComparisonLineResult {
  normalizedTrade: string;
  normalizedScopeCategory: string;
  normalizedScopeSubcategory: string;
  priorLineItemId: string | null;
  currentLineItemId: string | null;
  priorDescription: string;
  currentDescription: string;
  priorQuantity: number | null;
  currentQuantity: number | null;
  quantityVariance: number | null;
  quantityVariancePercent: number | null;
  priorUnitOfMeasure: string;
  currentUnitOfMeasure: string;
  priorUnitCost: number | null;
  currentUnitCost: number | null;
  unitCostVariance: number | null;
  unitCostVariancePercent: number | null;
  priorTotalCost: number | null;
  currentTotalCost: number | null;
  totalCostVariance: number | null;
  totalCostVariancePercent: number | null;
  priorCostPerGsf: number | null;
  currentCostPerGsf: number | null;
  priorCostPerRsf: number | null;
  currentCostPerRsf: number | null;
  priorCostPerUnit: number | null;
  currentCostPerUnit: number | null;
  priorCostPerBuilding: number | null;
  currentCostPerBuilding: number | null;
  reasonForVariance: string;
  riskFlag: BudgetComparisonRiskFlag | "";
  confidenceScore: number;
  recommendedQuestion: string;
  reviewStatus: string;
}

export interface BudgetTradeSummary {
  normalizedTrade: string;
  priorTotalCost: number;
  currentTotalCost: number;
  totalCostVariance: number;
  totalCostVariancePercent: number | null;
  priorCostPerGsf: number | null;
  currentCostPerGsf: number | null;
  priorCostPerRsf: number | null;
  currentCostPerRsf: number | null;
  priorCostPerUnit: number | null;
  currentCostPerUnit: number | null;
  priorCostPerBuilding: number | null;
  currentCostPerBuilding: number | null;
  priorShareOfTotal: number | null;
  currentShareOfTotal: number | null;
  likelyVarianceDriver: string;
  riskLevel: "High" | "Medium" | "Low" | "Info";
}

export interface BudgetExecutiveSummary {
  priorTotalCost: number;
  currentTotalCost: number;
  totalProjectCostVariance: number;
  totalProjectPercentVariance: number | null;
  priorCostPerGsf: number | null;
  currentCostPerGsf: number | null;
  priorCostPerRsf: number | null;
  currentCostPerRsf: number | null;
  priorCostPerUnit: number | null;
  currentCostPerUnit: number | null;
  priorCostPerBuilding: number | null;
  currentCostPerBuilding: number | null;
  biggestIncreases: BudgetComparisonLineResult[];
  biggestDecreases: BudgetComparisonLineResult[];
  mostImportantQuestions: string[];
}

export interface BudgetComparisonReport {
  executiveSummary: BudgetExecutiveSummary;
  tradeSummaries: BudgetTradeSummary[];
  lineResults: BudgetComparisonLineResult[];
  newScope: BudgetComparisonLineResult[];
  missingScope: BudgetComparisonLineResult[];
  changedUnits: BudgetComparisonLineResult[];
  possibleDuplicates: BudgetComparisonLineResult[];
  pricingQuestions: string[];
}

function amount(value: number | null | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function round(value: number | null, digits = 2): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function variance(current: number | null, prior: number | null): number | null {
  if (current === null && prior === null) return null;
  return round(amount(current) - amount(prior));
}

function percentVariance(current: number | null, prior: number | null): number | null {
  const priorAmount = amount(prior);
  if (priorAmount === 0) return current && current !== 0 ? 100 : null;
  return round(((amount(current) - priorAmount) / Math.abs(priorAmount)) * 100);
}

function costPer(total: number | null, basis: number | null): number | null {
  if (!basis || basis <= 0 || total === null) return null;
  return round(total / basis);
}

function normalizedText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scopeKey(item: BudgetComparisonLineItemInput): string {
  const description = normalizedText(item.rawDescription);
  const costCode = normalizedText(item.costCode);
  return [item.normalizedTrade, costCode || description].join("::");
}

function tokenSet(value: string): Set<string> {
  const stopWords = new Set(["and", "or", "the", "with", "for", "of", "to", "in", "unit", "units", "work"]);
  return new Set(normalizedText(value).split(" ").filter((token) => token.length > 2 && !stopWords.has(token)));
}

function tokenOverlap(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (left.size === 0 || right.size === 0) return 0;
  const matches = Array.from(left).filter((token) => right.has(token)).length;
  return matches / Math.max(left.size, right.size);
}

function confidence(prior: BudgetComparisonLineItemInput | null, current: BudgetComparisonLineItemInput | null, matchedBy: "exact" | "similar" | "missing" | "new"): number {
  const base = matchedBy === "exact" ? 0.9 : matchedBy === "similar" ? 0.65 : 0.75;
  const mappingConfidence = [prior?.confidenceScore, current?.confidenceScore].filter((value): value is number => typeof value === "number");
  const average = mappingConfidence.length > 0 ? mappingConfidence.reduce((sum, value) => sum + value, 0) / mappingConfidence.length : 0.7;
  const uncertainPenalty = prior?.mappingStatus === "needs_review" || current?.mappingStatus === "needs_review" ? 0.15 : 0;
  return round(Math.max(0.35, Math.min(0.98, base * 0.6 + average * 0.4 - uncertainPenalty))) ?? 0.7;
}

function varianceReason(prior: BudgetComparisonLineItemInput | null, current: BudgetComparisonLineItemInput | null): string {
  if (!prior && current) return "Current budget includes this line item and the prior budget does not.";
  if (prior && !current) return "Prior budget carried this line item and the current budget does not.";
  if (!prior || !current) return "Budget line item needs review.";
  if (prior.unitOfMeasure && current.unitOfMeasure && prior.unitOfMeasure.toLowerCase() !== current.unitOfMeasure.toLowerCase()) {
    return "Unit of measure changed, so quantity and unit cost should be validated before relying on the variance.";
  }
  const quantityPercent = percentVariance(current.quantity, prior.quantity);
  const unitCostPercent = percentVariance(current.unitCost, prior.unitCost);
  const totalPercent = percentVariance(current.totalCost, prior.totalCost);
  if (quantityPercent !== null && Math.abs(quantityPercent) >= 20) return "Quantity changed enough to drive the budget variance.";
  if (unitCostPercent !== null && Math.abs(unitCostPercent) >= 20) return "Unit cost changed enough to drive the budget variance.";
  if (totalPercent !== null && Math.abs(totalPercent) >= 20) return "Total cost changed materially. Validate scope, quantity, and pricing basis.";
  return "Variance appears moderate. Confirm scope basis and pricing source.";
}

function riskFlag(prior: BudgetComparisonLineItemInput | null, current: BudgetComparisonLineItemInput | null, duplicateKeys: Set<string>): BudgetComparisonRiskFlag | "" {
  const key = current ? scopeKey(current) : prior ? scopeKey(prior) : "";
  if (key && duplicateKeys.has(key)) return "possible_duplicate_line_item";
  if (!prior && current) return "new_current_line_item";
  if (prior && !current) return "missing_prior_line_item";
  if (!prior || !current) return "";
  if (prior.unitOfMeasure && current.unitOfMeasure && prior.unitOfMeasure.toLowerCase() !== current.unitOfMeasure.toLowerCase()) return "changed_unit_of_measure";
  if (prior.isAllowance !== current.isAllowance) return "allowance_changed";
  const quantityPercent = percentVariance(current.quantity, prior.quantity);
  if (quantityPercent !== null && quantityPercent >= 25) return "large_quantity_increase";
  if (quantityPercent !== null && quantityPercent <= -25) return "large_quantity_decrease";
  const unitCostPercent = percentVariance(current.unitCost, prior.unitCost);
  if (unitCostPercent !== null && unitCostPercent >= 20) return "large_unit_cost_increase";
  if (unitCostPercent !== null && unitCostPercent <= -20) return "large_unit_cost_decrease";
  const totalPercent = percentVariance(current.totalCost, prior.totalCost);
  if (totalPercent !== null && totalPercent >= 25) return "scope_may_have_expanded";
  if (totalPercent !== null && totalPercent <= -25) return "current_budget_may_be_missing_prior_scope";
  if (prior.mappingStatus === "needs_review" || current.mappingStatus === "needs_review") return "trade_mapping_may_be_uncertain";
  return "";
}

function questionFor(prior: BudgetComparisonLineItemInput | null, current: BudgetComparisonLineItemInput | null, flag: string): string {
  const trade = current?.normalizedTrade ?? prior?.normalizedTrade ?? "this trade";
  const description = current?.rawDescription || prior?.rawDescription || "this scope item";
  if (flag === "new_current_line_item") return `Was ${description} intentionally added to the current ${trade} budget, and what document or quote supports it?`;
  if (flag === "missing_prior_line_item") return `Why was ${description} removed from the current ${trade} budget, and is that scope carried somewhere else?`;
  if (flag === "changed_unit_of_measure") return `Why did the unit of measure change for ${description}, and are the quantities comparable?`;
  if (flag === "possible_duplicate_line_item") return `Is ${description} duplicated elsewhere in the budget or intentionally split between scopes?`;
  if (flag === "allowance_changed") return `Did ${description} move into or out of an allowance, and what is the pricing basis?`;
  if (flag === "large_unit_cost_increase" || flag === "large_unit_cost_decrease") return `What quote, assumption, or scope change explains the unit cost movement for ${description}?`;
  if (flag === "large_quantity_increase" || flag === "large_quantity_decrease") return `What drawing, takeoff, or scope change explains the quantity movement for ${description}?`;
  if (trade === "Concrete") return "Does the concrete number include demo, haul-off, reinforcing, vapor barrier, thickened slabs, sidewalks, testing, inspections, and permits?";
  return `Validate ${description} with the responsible ${trade} bidder or budget owner before relying on this variance.`;
}

function lineResult(
  prior: BudgetComparisonLineItemInput | null,
  current: BudgetComparisonLineItemInput | null,
  context: BudgetComparisonResultInput,
  duplicateKeys: Set<string>,
  matchedBy: "exact" | "similar" | "missing" | "new",
): BudgetComparisonLineResult {
  const priorTotal = prior?.totalCost ?? null;
  const currentTotal = current?.totalCost ?? null;
  const flag = riskFlag(prior, current, duplicateKeys);
  return {
    normalizedTrade: current?.normalizedTrade ?? prior?.normalizedTrade ?? "Other/Unmapped",
    normalizedScopeCategory: current?.normalizedScopeCategory ?? prior?.normalizedScopeCategory ?? "Other/Unmapped",
    normalizedScopeSubcategory: current?.normalizedScopeSubcategory ?? prior?.normalizedScopeSubcategory ?? "",
    priorLineItemId: prior?.id ?? null,
    currentLineItemId: current?.id ?? null,
    priorDescription: prior?.rawDescription ?? "",
    currentDescription: current?.rawDescription ?? "",
    priorQuantity: prior?.quantity ?? null,
    currentQuantity: current?.quantity ?? null,
    quantityVariance: variance(current?.quantity ?? null, prior?.quantity ?? null),
    quantityVariancePercent: percentVariance(current?.quantity ?? null, prior?.quantity ?? null),
    priorUnitOfMeasure: prior?.unitOfMeasure ?? "",
    currentUnitOfMeasure: current?.unitOfMeasure ?? "",
    priorUnitCost: prior?.unitCost ?? null,
    currentUnitCost: current?.unitCost ?? null,
    unitCostVariance: variance(current?.unitCost ?? null, prior?.unitCost ?? null),
    unitCostVariancePercent: percentVariance(current?.unitCost ?? null, prior?.unitCost ?? null),
    priorTotalCost: priorTotal,
    currentTotalCost: currentTotal,
    totalCostVariance: variance(currentTotal, priorTotal),
    totalCostVariancePercent: percentVariance(currentTotal, priorTotal),
    priorCostPerGsf: costPer(priorTotal, context.priorContext.grossSquareFeet),
    currentCostPerGsf: costPer(currentTotal, context.currentContext.grossSquareFeet),
    priorCostPerRsf: costPer(priorTotal, context.priorContext.rentableSquareFeet),
    currentCostPerRsf: costPer(currentTotal, context.currentContext.rentableSquareFeet),
    priorCostPerUnit: costPer(priorTotal, context.priorContext.unitCount),
    currentCostPerUnit: costPer(currentTotal, context.currentContext.unitCount),
    priorCostPerBuilding: costPer(priorTotal, context.priorContext.buildingCount),
    currentCostPerBuilding: costPer(currentTotal, context.currentContext.buildingCount),
    reasonForVariance: varianceReason(prior, current),
    riskFlag: flag,
    confidenceScore: confidence(prior, current, matchedBy),
    recommendedQuestion: questionFor(prior, current, flag),
    reviewStatus: "raw",
  };
}

function duplicateKeys(items: BudgetComparisonLineItemInput[]): Set<string> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = scopeKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key));
}

function total(items: BudgetComparisonLineItemInput[]): number {
  return round(items.reduce((sum, item) => sum + amount(item.totalCost), 0)) ?? 0;
}

function riskLevel(variancePercent: number | null, totalVariance: number): BudgetTradeSummary["riskLevel"] {
  if (variancePercent !== null && Math.abs(variancePercent) >= 25) return "High";
  if (Math.abs(totalVariance) >= 25000) return "High";
  if (variancePercent !== null && Math.abs(variancePercent) >= 10) return "Medium";
  if (Math.abs(totalVariance) > 0) return "Low";
  return "Info";
}

function tradeDriver(lines: BudgetComparisonLineResult[]): string {
  const top = [...lines].sort((a, b) => Math.abs(amount(b.totalCostVariance)) - Math.abs(amount(a.totalCostVariance)))[0];
  if (!top) return "No line item variance.";
  return top.reasonForVariance;
}

function tradeSummaries(
  lineResults: BudgetComparisonLineResult[],
  priorTotal: number,
  currentTotal: number,
  priorContext: BudgetMetricContext,
  currentContext: BudgetMetricContext,
): BudgetTradeSummary[] {
  const byTrade = new Map<string, BudgetComparisonLineResult[]>();
  for (const result of lineResults) {
    byTrade.set(result.normalizedTrade, [...(byTrade.get(result.normalizedTrade) ?? []), result]);
  }
  return Array.from(byTrade.entries())
    .map(([normalizedTrade, lines]) => {
      const priorTradeTotal = round(lines.reduce((sum, line) => sum + amount(line.priorTotalCost), 0)) ?? 0;
      const currentTradeTotal = round(lines.reduce((sum, line) => sum + amount(line.currentTotalCost), 0)) ?? 0;
      const totalCostVariance = round(currentTradeTotal - priorTradeTotal) ?? 0;
      const totalCostVariancePercent = percentVariance(currentTradeTotal, priorTradeTotal);
      return {
        normalizedTrade,
        priorTotalCost: priorTradeTotal,
        currentTotalCost: currentTradeTotal,
        totalCostVariance,
        totalCostVariancePercent,
        priorCostPerGsf: costPer(priorTradeTotal, priorContext.grossSquareFeet),
        currentCostPerGsf: costPer(currentTradeTotal, currentContext.grossSquareFeet),
        priorCostPerRsf: costPer(priorTradeTotal, priorContext.rentableSquareFeet),
        currentCostPerRsf: costPer(currentTradeTotal, currentContext.rentableSquareFeet),
        priorCostPerUnit: costPer(priorTradeTotal, priorContext.unitCount),
        currentCostPerUnit: costPer(currentTradeTotal, currentContext.unitCount),
        priorCostPerBuilding: costPer(priorTradeTotal, priorContext.buildingCount),
        currentCostPerBuilding: costPer(currentTradeTotal, currentContext.buildingCount),
        priorShareOfTotal: priorTotal > 0 ? round((priorTradeTotal / priorTotal) * 100) : null,
        currentShareOfTotal: currentTotal > 0 ? round((currentTradeTotal / currentTotal) * 100) : null,
        likelyVarianceDriver: tradeDriver(lines),
        riskLevel: riskLevel(totalCostVariancePercent, totalCostVariance),
      };
    })
    .sort((a, b) => Math.abs(b.totalCostVariance) - Math.abs(a.totalCostVariance));
}

export function compareBudgets(input: BudgetComparisonResultInput): BudgetComparisonReport {
  const priorByKey = new Map(input.priorLineItems.map((item) => [scopeKey(item), item]));
  const currentByKey = new Map(input.currentLineItems.map((item) => [scopeKey(item), item]));
  const duplicateScopeKeys = new Set([...duplicateKeys(input.priorLineItems), ...duplicateKeys(input.currentLineItems)]);
  const usedPrior = new Set<string>();
  const usedCurrent = new Set<string>();
  const lineResults: BudgetComparisonLineResult[] = [];

  for (const [key, current] of currentByKey.entries()) {
    const prior = priorByKey.get(key) ?? null;
    if (prior) {
      usedPrior.add(prior.id);
      usedCurrent.add(current.id);
      lineResults.push(lineResult(prior, current, input, duplicateScopeKeys, "exact"));
    }
  }

  const unmatchedPrior = input.priorLineItems.filter((item) => !usedPrior.has(item.id));
  const unmatchedCurrent = input.currentLineItems.filter((item) => !usedCurrent.has(item.id));
  for (const current of unmatchedCurrent) {
    const similar = unmatchedPrior
      .filter((prior) => !usedPrior.has(prior.id) && prior.normalizedTrade === current.normalizedTrade)
      .map((prior) => ({ prior, score: tokenOverlap(prior.rawDescription, current.rawDescription) }))
      .sort((a, b) => b.score - a.score)[0];
    if (similar && similar.score >= 0.55) {
      usedPrior.add(similar.prior.id);
      usedCurrent.add(current.id);
      lineResults.push(lineResult(similar.prior, current, input, duplicateScopeKeys, "similar"));
    }
  }

  for (const current of input.currentLineItems.filter((item) => !usedCurrent.has(item.id))) {
    lineResults.push(lineResult(null, current, input, duplicateScopeKeys, "new"));
  }
  for (const prior of input.priorLineItems.filter((item) => !usedPrior.has(item.id))) {
    lineResults.push(lineResult(prior, null, input, duplicateScopeKeys, "missing"));
  }

  const priorTotalCost = total(input.priorLineItems);
  const currentTotalCost = total(input.currentLineItems);
  const sortedByVariance = [...lineResults].sort((a, b) => amount(b.totalCostVariance) - amount(a.totalCostVariance));
  const questions = lineResults
    .filter((line) => line.riskFlag || Math.abs(amount(line.totalCostVariance)) > 0)
    .sort((a, b) => Math.abs(amount(b.totalCostVariance)) - Math.abs(amount(a.totalCostVariance)))
    .map((line) => line.recommendedQuestion)
    .filter((question, index, list) => question && list.indexOf(question) === index)
    .slice(0, 8);

  return {
    executiveSummary: {
      priorTotalCost,
      currentTotalCost,
      totalProjectCostVariance: round(currentTotalCost - priorTotalCost) ?? 0,
      totalProjectPercentVariance: percentVariance(currentTotalCost, priorTotalCost),
      priorCostPerGsf: costPer(priorTotalCost, input.priorContext.grossSquareFeet),
      currentCostPerGsf: costPer(currentTotalCost, input.currentContext.grossSquareFeet),
      priorCostPerRsf: costPer(priorTotalCost, input.priorContext.rentableSquareFeet),
      currentCostPerRsf: costPer(currentTotalCost, input.currentContext.rentableSquareFeet),
      priorCostPerUnit: costPer(priorTotalCost, input.priorContext.unitCount),
      currentCostPerUnit: costPer(currentTotalCost, input.currentContext.unitCount),
      priorCostPerBuilding: costPer(priorTotalCost, input.priorContext.buildingCount),
      currentCostPerBuilding: costPer(currentTotalCost, input.currentContext.buildingCount),
      biggestIncreases: sortedByVariance.filter((line) => amount(line.totalCostVariance) > 0).slice(0, 5),
      biggestDecreases: [...lineResults].sort((a, b) => amount(a.totalCostVariance) - amount(b.totalCostVariance)).filter((line) => amount(line.totalCostVariance) < 0).slice(0, 5),
      mostImportantQuestions: questions,
    },
    tradeSummaries: tradeSummaries(lineResults, priorTotalCost, currentTotalCost, input.priorContext, input.currentContext),
    lineResults: lineResults.sort((a, b) => Math.abs(amount(b.totalCostVariance)) - Math.abs(amount(a.totalCostVariance))),
    newScope: lineResults.filter((line) => line.riskFlag === "new_current_line_item"),
    missingScope: lineResults.filter((line) => line.riskFlag === "missing_prior_line_item"),
    changedUnits: lineResults.filter((line) => line.riskFlag === "changed_unit_of_measure"),
    possibleDuplicates: lineResults.filter((line) => line.riskFlag === "possible_duplicate_line_item"),
    pricingQuestions: questions,
  };
}
