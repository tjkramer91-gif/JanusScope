import { documentCategoryFor } from "@/lib/document-extraction";
import { createSyntheticDemoProfile } from "@/lib/synthetic-data";
import type { Project, UploadedFile, VerificationDocumentCategory } from "@/lib/types";

export type EvidenceConfidence = "High" | "Medium" | "Low";
export type SourceRiskLevel = "High" | "Medium" | "Low";

export interface DocumentAuditItem {
  fileName: string;
  fileType: string;
  uploadDate: string;
  category: VerificationDocumentCategory;
  extractionStatus: string;
  extractionMessage: string;
  reviewedScope: string;
  includedInFinalReview: boolean;
}

export interface SourceBackedFinding {
  id: string;
  title: string;
  category: string;
  risk: SourceRiskLevel;
  confidence: EvidenceConfidence;
  confidenceReason: string;
  sourceDocument: string;
  sourceLocation: string;
  extractedText: string;
  explanation: string;
  costOrScheduleImpact: string;
  recommendedAction: string;
  followUpQuestion: string;
}

export interface DocumentComparisonMatrixRow {
  id: string;
  comparison: string;
  status: "Conflict found" | "Aligned" | "Unable to verify";
  leftSource: string;
  rightSource: string;
  finding: string;
  confidence: EvidenceConfidence;
  requiredAction: string;
}

export interface ExternalSourceCheck {
  id: string;
  sourceTitle: string;
  url: string;
  publisher: string;
  dateAccessed: string;
  factChecked: string;
  sourceType: string;
  confidence: EvidenceConfidence;
}

export interface ContractRequirementFinding {
  id: string;
  requirement: string;
  sourceDocument: string;
  sourceLocation: string;
  extractedText: string;
  risk: SourceRiskLevel;
  confidence: EvidenceConfidence;
  explanation: string;
  action: string;
}

export interface MissingVerificationItem {
  id: string;
  item: string;
  reason: string;
  neededDocument: string;
  confidenceReason: string;
}

export interface VerificationSummary {
  documentsReviewed: number;
  documentsUnableToExtract: number;
  sourceBackedFindings: number;
  comparisonsRun: number;
  externalSourcesChecked: number;
  missingVerificationItems: number;
  conclusion: string;
}

export interface SourceVerificationReport {
  generatedAt: string;
  documentAudit: DocumentAuditItem[];
  findings: SourceBackedFinding[];
  comparisonMatrix: DocumentComparisonMatrixRow[];
  externalSourcesChecked: ExternalSourceCheck[];
  contractRequirementReview: ContractRequirementFinding[];
  missingInformation: MissingVerificationItem[];
  summary: VerificationSummary;
}

interface CsvRecord {
  rowNumber: number;
  rawLine: string;
  values: Record<string, string>;
}

interface EvidenceDocument {
  file: UploadedFile;
  category: VerificationDocumentCategory;
  text: string;
  records: CsvRecord[];
}

interface EvidenceMatch {
  document: EvidenceDocument;
  record: CsvRecord;
}

const UNABLE_TO_VERIFY = "Unable to verify with the documents and sources currently available.";
const SYNTHETIC_AHJ_PROFILE = createSyntheticDemoProfile("source-verification-sample");
const SYNTHETIC_AHJ_LABEL = `${SYNTHETIC_AHJ_PROFILE.city} Building Department`;

const EXAMPLE_CITY_EXTERNAL_SOURCES = [
  {
    id: "example-city-building-permit-plan-review",
    sourceTitle: `${SYNTHETIC_AHJ_PROFILE.city} Building Permit and Plan Review`,
    url: "https://example.com/example-city-building-permits",
    publisher: SYNTHETIC_AHJ_LABEL,
    factChecked:
      "Synthetic sample source states that permit scope, adopted code basis, and inspection sequencing must be confirmed before work starts.",
    sourceType: "Synthetic AHJ sample source",
    confidence: "High" as const,
  },
  {
    id: "example-city-construction-inspections",
    sourceTitle: `${SYNTHETIC_AHJ_PROFILE.city} Construction Inspections`,
    url: "https://example.com/example-city-inspections",
    publisher: SYNTHETIC_AHJ_LABEL,
    factChecked:
      "Synthetic sample source states that inspections should be requested before concealed work is covered.",
    sourceType: "Synthetic AHJ sample source",
    confidence: "High" as const,
  },
];

function formatMoney(value: number | null): string {
  if (value === null) return "not stated";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function normalizedHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
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
      values.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsvRecords(text: string): CsvRecord[] {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2 || !lines[0].includes(",")) return [];

  const headers = parseCsvLine(lines[0]).map(normalizedHeader);
  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const values = headers.reduce<Record<string, string>>((record, header, headerIndex) => {
      if (header) record[header] = cells[headerIndex] ?? "";
      return record;
    }, {});
    return { rowNumber: index + 2, rawLine: line, values };
  });
}

function recordText(record: CsvRecord): string {
  return Object.values(record.values).join(" ").toLowerCase();
}

function numberFromValue(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function numberField(record: CsvRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = numberFromValue(record.values[key]);
    if (value !== null) return value;
  }
  return null;
}

function sourceLocation(match: EvidenceMatch): string {
  return `${match.document.file.name} row ${match.record.rowNumber}`;
}

function sourceDocuments(matches: EvidenceMatch[]): string {
  return matches.map((match) => match.document.file.name).join("; ");
}

function sourceLocations(matches: EvidenceMatch[]): string {
  return matches.map(sourceLocation).join("; ");
}

function extractedText(matches: EvidenceMatch[]): string {
  return matches.map((match) => match.record.rawLine).join("\n");
}

function makeEvidenceDocuments(project: Project): EvidenceDocument[] {
  return project.uploadedFiles
    .filter((file) => file.extractionStatus === "extracted" && Boolean(file.extractedText?.trim()))
    .map((file) => ({
      file,
      category: file.documentCategory ?? documentCategoryFor(file.documentId, file.name),
      text: file.extractedText?.trim() ?? "",
      records: parseCsvRecords(file.extractedText ?? ""),
    }));
}

function documentsByCategory(documents: EvidenceDocument[], category: VerificationDocumentCategory): EvidenceDocument[] {
  return documents.filter((document) => document.category === category);
}

function findRecord(documents: EvidenceDocument[], patterns: RegExp[]): EvidenceMatch | null {
  for (const document of documents) {
    for (const record of document.records) {
      const haystack = recordText(record);
      if (patterns.every((pattern) => pattern.test(haystack))) {
        return { document, record };
      }
    }
  }
  return null;
}

function hasEvidenceCategory(documents: EvidenceDocument[], category: VerificationDocumentCategory): boolean {
  return documents.some((document) => document.category === category);
}

function exampleCitySourceChecks(project: Project, dateAccessed: string): ExternalSourceCheck[] {
  const isSyntheticSourceCity =
    project.city.trim().toLowerCase() === SYNTHETIC_AHJ_PROFILE.city.trim().toLowerCase() &&
    project.state.trim().toLowerCase() === SYNTHETIC_AHJ_PROFILE.state.trim().toLowerCase();
  if (!isSyntheticSourceCity) return [];
  return EXAMPLE_CITY_EXTERNAL_SOURCES.map((source) => ({ ...source, dateAccessed }));
}

function buildDocumentAudit(project: Project): DocumentAuditItem[] {
  return project.uploadedFiles.map((file) => {
    const category = file.documentCategory ?? documentCategoryFor(file.documentId, file.name);
    const extractionStatus = file.extractionStatus ?? "metadata-only";
    const reviewedSectionCount = file.reviewedSectionCount ?? 0;
    return {
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      uploadDate: file.uploadedAt,
      category,
      extractionStatus,
      extractionMessage:
        file.extractionMessage ??
        (file.extractedText ? "Extracted text is available for review." : "Stored as metadata only."),
      reviewedScope:
        extractionStatus === "extracted"
          ? `${reviewedSectionCount} row${reviewedSectionCount === 1 ? "" : "s"} reviewed`
          : "No readable text reviewed",
      includedInFinalReview: Boolean(file.includedInReview && file.extractedText),
    };
  });
}

function addPricingComparison(
  findings: SourceBackedFinding[],
  comparisons: DocumentComparisonMatrixRow[],
  documents: EvidenceDocument[],
) {
  const budgetMatch = findRecord(documentsByCategory(documents, "Budget"), [/subpanel|panel/]);
  const bidMatch = findRecord(documentsByCategory(documents, "Subcontractor bid"), [/subpanel|panel/]);
  if (!budgetMatch || !bidMatch) {
    comparisons.push({
      id: "budget-vs-bid",
      comparison: "Owner budget vs subcontractor bid",
      status: "Unable to verify",
      leftSource: budgetMatch ? sourceLocation(budgetMatch) : "Budget not found",
      rightSource: bidMatch ? sourceLocation(bidMatch) : "Bid not found",
      finding: `${UNABLE_TO_VERIFY} JanusScope needs an extracted budget row and an extracted bid row for the same scope item.`,
      confidence: "Low",
      requiredAction: "Upload readable budget and bid detail with quantities, unit prices, and item descriptions.",
    });
    return;
  }

  const budgetUnit = numberField(budgetMatch.record, ["unit_price", "unit_cost", "price"]);
  const bidUnit = numberField(bidMatch.record, ["unit_price", "unit_cost", "price"]);
  const quantity =
    numberField(bidMatch.record, ["quantity", "qty"]) ?? numberField(budgetMatch.record, ["quantity", "qty"]);
  const unitSpread = bidUnit !== null && budgetUnit !== null ? bidUnit - budgetUnit : null;
  const totalSpread = unitSpread !== null && quantity !== null ? unitSpread * quantity : null;
  const matches = [budgetMatch, bidMatch];

  findings.push({
    id: "pricing-subpanel-budget-gap",
    title: "Electrical subpanel budget appears undercarried",
    category: "Pricing variance",
    risk: totalSpread !== null && totalSpread > 50_000 ? "High" : "Medium",
    confidence: budgetUnit !== null && bidUnit !== null && quantity !== null ? "High" : "Medium",
    confidenceReason: "Direct extracted rows state the budget unit price, bid unit price, and quantity.",
    sourceDocument: sourceDocuments(matches),
    sourceLocation: sourceLocations(matches),
    extractedText: extractedText(matches),
    explanation: `The budget row carries ${formatMoney(budgetUnit)} per unit while the bid row carries ${formatMoney(bidUnit)} per unit for the same apartment subpanel item.`,
    costOrScheduleImpact:
      totalSpread !== null
        ? `Potential uncarried spread is ${formatMoney(totalSpread)} before markup, contingency, or scope clarifications.`
        : "Potential cost spread could not be calculated because one or more numeric fields were missing.",
    recommendedAction: "Reconcile the carried budget value against the bid basis before relying on the owner budget.",
    followUpQuestion:
      "Should the bid value, owner budget, or scope quantity be revised before the subcontract package is treated as covered?",
  });

  comparisons.push({
    id: "budget-vs-bid",
    comparison: "Owner budget vs subcontractor bid",
    status: unitSpread !== null && unitSpread > 0 ? "Conflict found" : "Aligned",
    leftSource: sourceLocation(budgetMatch),
    rightSource: sourceLocation(bidMatch),
    finding:
      unitSpread !== null && unitSpread > 0
        ? `Bid unit price exceeds owner budget unit price by ${formatMoney(unitSpread)}.`
        : "No unit price conflict was detected from the extracted rows.",
    confidence: budgetUnit !== null && bidUnit !== null ? "High" : "Medium",
    requiredAction: "Confirm which value controls the buyout and update the project budget or bid qualification.",
  });
}

function addPricingReferenceComparison(comparisons: DocumentComparisonMatrixRow[], documents: EvidenceDocument[]) {
  const bidMatch = findRecord(documentsByCategory(documents, "Subcontractor bid"), [/subpanel|panel/]);
  const referenceMatch = findRecord(documentsByCategory(documents, "Pricing reference"), [/subpanel|panel/]);
  if (!bidMatch || !referenceMatch) return;

  const bidUnit = numberField(bidMatch.record, ["unit_price", "unit_cost", "price"]);
  const referenceUnit = numberField(referenceMatch.record, ["unit_price", "unit_cost", "price"]);
  comparisons.push({
    id: "bid-vs-pricing-reference",
    comparison: "Subcontractor bid vs pricing reference",
    status: bidUnit !== null && referenceUnit !== null && bidUnit > referenceUnit ? "Conflict found" : "Unable to verify",
    leftSource: sourceLocation(bidMatch),
    rightSource: sourceLocation(referenceMatch),
    finding:
      bidUnit !== null && referenceUnit !== null
        ? `Bid unit price is ${formatMoney(bidUnit)} and the uploaded pricing reference is ${formatMoney(referenceUnit)}. Treat the reference as a reasonableness check, not a market quote.`
        : `${UNABLE_TO_VERIFY} Numeric pricing fields were not available in both rows.`,
    confidence: bidUnit !== null && referenceUnit !== null ? "Medium" : "Low",
    requiredAction: "Confirm the reference basis before using it to challenge or accept the bid value.",
  });
}

function addScopeComparison(
  findings: SourceBackedFinding[],
  comparisons: DocumentComparisonMatrixRow[],
  documents: EvidenceDocument[],
) {
  const scopeMatch = findRecord(documentsByCategory(documents, "Owner scope"), [/permit|utility|firestopping|firestop/]);
  const bidExclusionMatch =
    findRecord(documentsByCategory(documents, "Subcontractor bid"), [/exclude|excluded/, /permit|utility|firestopping|firestop/]) ??
    findRecord(documentsByCategory(documents, "Exclusions and assumptions"), [/exclude|excluded/, /permit|utility|firestopping|firestop/]);

  if (!scopeMatch || !bidExclusionMatch) {
    comparisons.push({
      id: "owner-scope-vs-bid-exclusions",
      comparison: "Owner scope vs bid exclusions",
      status: "Unable to verify",
      leftSource: scopeMatch ? sourceLocation(scopeMatch) : "Owner scope not found",
      rightSource: bidExclusionMatch ? sourceLocation(bidExclusionMatch) : "Bid exclusion not found",
      finding: `${UNABLE_TO_VERIFY} JanusScope needs readable owner scope and readable bid exclusions to confirm this comparison.`,
      confidence: "Low",
      requiredAction: "Upload readable scope and bid exclusion detail.",
    });
    return;
  }

  const matches = [scopeMatch, bidExclusionMatch];
  findings.push({
    id: "scope-conflict-permits-firestopping",
    title: "Bid exclusions conflict with owner scope requirements",
    category: "Scope conflict",
    risk: "High",
    confidence: "High",
    confidenceReason: "The owner scope and bid rows both reference the same permit, utility coordination, or firestopping scope.",
    sourceDocument: sourceDocuments(matches),
    sourceLocation: sourceLocations(matches),
    extractedText: extractedText(matches),
    explanation:
      "The owner scope requires permit, utility coordination, or firestopping work while the bid record excludes one or more of those items.",
    costOrScheduleImpact:
      "This can create an unfunded change order, permit-delay exposure, or dispute over whether the subcontractor owns the excluded work.",
    recommendedAction: "Clarify in writing whether the excluded items are in base scope, owner/GC furnished, or priced as alternates.",
    followUpQuestion: "Who owns permits, utility coordination, and firestopping if the subcontract language overrides bid exclusions?",
  });

  comparisons.push({
    id: "owner-scope-vs-bid-exclusions",
    comparison: "Owner scope vs bid exclusions",
    status: "Conflict found",
    leftSource: sourceLocation(scopeMatch),
    rightSource: sourceLocation(bidExclusionMatch),
    finding: "Owner scope includes work that the bid excludes or qualifies.",
    confidence: "High",
    requiredAction: "Resolve the exclusion before signing or carrying the value as covered.",
  });
}

function addContractReview(
  findings: SourceBackedFinding[],
  comparisons: DocumentComparisonMatrixRow[],
  contractRequirementReview: ContractRequirementFinding[],
  documents: EvidenceDocument[],
) {
  const contractDocs = documentsByCategory(documents, "Contract");
  const bidExclusionMatch = findRecord(documentsByCategory(documents, "Subcontractor bid"), [/exclude|excluded/]);
  const exclusionOverrideMatch = findRecord(contractDocs, [/exclusion|proposal/, /superseded|override|unless expressly/]);
  const payIfPaidMatch = findRecord(contractDocs, [/condition precedent|owner payment|receives payment/]);
  const flowDownMatch = findRecord(contractDocs, [/flow|assumes/, /owner|prime/]);
  const changeOrderMatch = findRecord(contractDocs, [/written authorization|extra work|change order/]);

  if (bidExclusionMatch && exclusionOverrideMatch) {
    const matches = [bidExclusionMatch, exclusionOverrideMatch];
    findings.push({
      id: "contract-overrides-bid-exclusions",
      title: "Contract language may override bid exclusions",
      category: "Contract risk",
      risk: "High",
      confidence: "High",
      confidenceReason: "The bid exclusion row and contract override clause were both extracted from uploaded documents.",
      sourceDocument: sourceDocuments(matches),
      sourceLocation: sourceLocations(matches),
      extractedText: extractedText(matches),
      explanation:
        "The bid excludes certain work, but the contract row says proposal exclusions are superseded unless expressly preserved.",
      costOrScheduleImpact:
        "The subcontractor may be forced to perform excluded work without an agreed price if the exclusion is not carried into the contract.",
      recommendedAction: "Attach an exhibit that expressly preserves accepted exclusions or add contract language that controls the conflict.",
      followUpQuestion: "Which bid exclusions are expressly incorporated into the subcontract?",
    });

    comparisons.push({
      id: "contract-vs-bid-exclusions",
      comparison: "Contract language vs proposal exclusions",
      status: "Conflict found",
      leftSource: sourceLocation(exclusionOverrideMatch),
      rightSource: sourceLocation(bidExclusionMatch),
      finding: "Contract language appears to supersede exclusions that remain in the bid.",
      confidence: "High",
      requiredAction: "Confirm accepted exclusions in the executed subcontract documents.",
    });
  }

  if (payIfPaidMatch) {
    contractRequirementReview.push({
      id: "pay-if-paid",
      requirement: "Payment tied to owner payment",
      sourceDocument: payIfPaidMatch.document.file.name,
      sourceLocation: sourceLocation(payIfPaidMatch),
      extractedText: payIfPaidMatch.record.rawLine,
      risk: "High",
      confidence: "High",
      explanation:
        "The clause states payment is a condition precedent or otherwise tied to the contractor receiving payment from the owner.",
      action: "Ask counsel and the GC whether pay-if-paid risk can be softened, capped, or paired with transparency rights.",
    });
  }

  if (flowDownMatch) {
    contractRequirementReview.push({
      id: "flow-down",
      requirement: "Prime contract obligations flow down",
      sourceDocument: flowDownMatch.document.file.name,
      sourceLocation: sourceLocation(flowDownMatch),
      extractedText: flowDownMatch.record.rawLine,
      risk: "Medium",
      confidence: "High",
      explanation:
        "The subcontractor appears to assume obligations from the prime contract, but the prime contract itself may not be fully available.",
      action: "Request the controlling prime contract excerpts and list any obligations not priced in the proposal.",
    });
  }

  if (changeOrderMatch) {
    contractRequirementReview.push({
      id: "written-change-order",
      requirement: "Written authorization before extra work",
      sourceDocument: changeOrderMatch.document.file.name,
      sourceLocation: sourceLocation(changeOrderMatch),
      extractedText: changeOrderMatch.record.rawLine,
      risk: "Medium",
      confidence: "High",
      explanation:
        "The clause requires written authorization before extra work is payable, which can waive field-directed work if notice is missed.",
      action: "Set a field process for written direction, ticketing, and daily backup before performing extra work.",
    });
  }
}

function addAhjFinding(findings: SourceBackedFinding[], externalSources: ExternalSourceCheck[]) {
  const buildingSource = externalSources.find((source) => source.id === "example-city-building-permit-plan-review");
  if (!buildingSource) return;

  findings.push({
    id: "example-city-permit-code-source",
    title: `${SYNTHETIC_AHJ_PROFILE.city} permit and code basis needs project-specific confirmation`,
    category: "AHJ / permitting",
    risk: "Medium",
    confidence: "High",
    confidenceReason: "The finding uses a synthetic sample AHJ source package, not a real project or real jurisdiction claim.",
    sourceDocument: buildingSource.sourceTitle,
    sourceLocation: buildingSource.url,
    extractedText: buildingSource.factChecked,
    explanation:
      "The official AHJ page identifies the adopted code basis, but the uploaded package does not prove which project permits or inspections are required.",
    costOrScheduleImpact:
      "Permit or inspection requirements can affect start dates, concealed work sequencing, closeout, and responsibility for fees.",
    recommendedAction: "Confirm permit scope, inspection sequence, and fee responsibility with the actual AHJ and the GC.",
    followUpQuestion: "Which permit and inspection obligations are assigned to the electrical subcontractor in the executed documents?",
  });
}

function buildMissingInformation(project: Project, documents: EvidenceDocument[]): MissingVerificationItem[] {
  const missing: MissingVerificationItem[] = [];
  const addMissing = (id: string, item: string, reason: string, neededDocument: string, confidenceReason: string) => {
    missing.push({ id, item, reason, neededDocument, confidenceReason });
  };

  if (!hasEvidenceCategory(documents, "Drawings")) {
    addMissing(
      "missing-drawings",
      "Drawings",
      `${UNABLE_TO_VERIFY} No readable drawings were available to confirm counts, locations, assemblies, or sheet references.`,
      "Electrical drawings, plan sheets, or drawing excerpts",
      "Low confidence on quantity and location-specific issues without drawings.",
    );
  }

  if (!hasEvidenceCategory(documents, "Specifications")) {
    addMissing(
      "missing-specifications",
      "Specifications",
      `${UNABLE_TO_VERIFY} No readable specifications were available to confirm product, material, testing, closeout, or warranty requirements.`,
      "Project specifications or relevant spec sections",
      "Low confidence on spec compliance until specifications are reviewed.",
    );
  }

  if (!hasEvidenceCategory(documents, "Addenda / RFI")) {
    addMissing(
      "missing-addenda-rfis",
      "Addenda and RFIs",
      `${UNABLE_TO_VERIFY} No readable addenda, RFIs, or clarification log was available to confirm whether scope changed after pricing.`,
      "Addenda, RFI log, clarification responses",
      "Medium confidence because bid and scope can change through addenda.",
    );
  }

  if (!hasEvidenceCategory(documents, "AHJ source") && project.city.trim()) {
    addMissing(
      "missing-project-ahj-document",
      "Project-specific AHJ permit document",
      `${UNABLE_TO_VERIFY} Official city sources were checked where available, but the uploaded package does not include a project-specific permit matrix or approved permit notes.`,
      "Permit matrix, plan review notes, permit card, or AHJ correspondence",
      "Medium confidence on general AHJ source checks, low confidence on project-specific permit assignments.",
    );
  }

  for (const file of project.uploadedFiles) {
    if (file.extractionStatus === "unsupported" || file.extractionStatus === "failed") {
      addMissing(
        `unreadable-${file.id}`,
        `Readable text for ${file.name}`,
        `${UNABLE_TO_VERIFY} ${file.extractionMessage ?? "The file could not be text-extracted."}`,
        "A CSV export or pasted text excerpt for the same document",
        "The file is visible in the upload audit, but it was not included as source evidence.",
      );
    }
  }

  return missing;
}

export function buildSourceVerification(project: Project, options: { now?: Date | string } = {}): SourceVerificationReport {
  const generatedAt =
    typeof options.now === "string" ? new Date(options.now).toISOString() : (options.now ?? new Date()).toISOString();
  const dateAccessed = generatedAt.slice(0, 10);
  const documents = makeEvidenceDocuments(project);
  const documentAudit = buildDocumentAudit(project);
  const externalSourcesChecked = exampleCitySourceChecks(project, dateAccessed);
  const findings: SourceBackedFinding[] = [];
  const comparisonMatrix: DocumentComparisonMatrixRow[] = [];
  const contractRequirementReview: ContractRequirementFinding[] = [];

  addPricingComparison(findings, comparisonMatrix, documents);
  addPricingReferenceComparison(comparisonMatrix, documents);
  addScopeComparison(findings, comparisonMatrix, documents);
  addContractReview(findings, comparisonMatrix, contractRequirementReview, documents);
  addAhjFinding(findings, externalSourcesChecked);

  const missingInformation = buildMissingInformation(project, documents);
  const includedDocuments = documentAudit.filter((document) => document.includedInFinalReview).length;
  const unableToExtract = documentAudit.filter((document) => document.extractionStatus !== "extracted").length;

  return {
    generatedAt,
    documentAudit,
    findings,
    comparisonMatrix,
    externalSourcesChecked,
    contractRequirementReview,
    missingInformation,
    summary: {
      documentsReviewed: includedDocuments,
      documentsUnableToExtract: unableToExtract,
      sourceBackedFindings: findings.length,
      comparisonsRun: comparisonMatrix.length,
      externalSourcesChecked: externalSourcesChecked.length,
      missingVerificationItems: missingInformation.length,
      conclusion:
        includedDocuments > 0
          ? `JanusScope reviewed ${includedDocuments} extracted upload${includedDocuments === 1 ? "" : "s"} and produced ${findings.length} source-backed finding${findings.length === 1 ? "" : "s"}. Items without extracted source evidence are marked unable to verify.`
          : `${UNABLE_TO_VERIFY} No uploaded document text was extracted for source-backed review.`,
    },
  };
}
