import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getCache } from "@vercel/functions";
import { DOCUMENT_CATALOG, createEmptyProject } from "@/lib/catalogs";
import { extractUploadedFileText } from "@/lib/document-extraction";
import { errorMessage, logEvent } from "@/lib/server/logger";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/server/supabase";
import { sanitizeUsageEventMetadata } from "@/lib/usage-sanitizer";
import type { SessionUser } from "@/lib/server/auth";
import type {
  BudgetSourceType,
  OccupiedOrVacant,
  ParsedBudgetLineItem,
} from "@/lib/budgetscope";
import { compareBudgets, type BudgetComparisonLineResult, type BudgetComparisonReport } from "@/lib/budget-comparison";
import {
  AccountType,
  CompanyType,
  ConsentStatus,
  DataReviewStatus,
  DocumentId,
  IntakeAnswer,
  IntelligenceGraph,
  Project,
  ProjectStatus,
  RiskReview,
  UploadedFile,
  UsageEventType,
} from "@/lib/types";

export interface StoredReview {
  id: string;
  projectId: string;
  organizationId: string;
  userId: string;
  status: ProjectStatus;
  rawAnalysisJson: unknown;
  overallSummary: string;
  riskScore: number;
  riskLevel: string;
  signingRecommendation: string;
  intelligenceGraph?: IntelligenceGraph;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  projectId: string | null;
  action: string;
  details: Record<string, unknown>;
  createdAt: string;
}

interface UserRecord {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
  organizationId: string;
  companyId: string;
  role: string;
  accountType: AccountType;
  isAdmin: boolean;
  passwordHash?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRecord {
  id: string;
  companyName: string;
  companyType: CompanyType;
  trade: string;
  website: string;
  city: string;
  state: string;
  region: string;
  leadStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemoryRecord {
  id: string;
  projectId: string;
  projectProfileSummary: string;
  knownScopeSummary: string;
  pricingMemorySummary: string;
  contractMemorySummary: string;
  openQuestionsSummary: string;
  topRisksSummary: string;
  decisionsSummary: string;
  lessonsLearnedSummary: string;
  lastUpdatedAt: string;
}

export interface UsageEventRecord {
  id: string;
  userId: string;
  companyId: string;
  projectId: string | null;
  eventType: UsageEventType;
  eventMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  adminUserId: string;
  actionType: string;
  targetTable: string;
  targetRecordId: string | null;
  actionMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackRecord {
  id: string;
  userId: string;
  companyId: string;
  projectId: string | null;
  relatedOutputId: string | null;
  feedbackType: string;
  rating: number | null;
  comment: string;
  createdAt: string;
}

export interface DataReviewQueueRecord {
  id: string;
  sourceType: string;
  sourceTable: string;
  sourceRecordId: string;
  projectId: string | null;
  userId: string | null;
  companyId: string | null;
  extractedValueSummary: string;
  normalizedTrade: string;
  normalizedScopeCategory: string;
  normalizedScopeSubcategory: string;
  confidenceScore: number | null;
  reviewStatus: DataReviewStatus;
  reviewedByAdminId: string | null;
  reviewedAt: string | null;
  adminNotes: string;
  reviewMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface LeadScoreRecord {
  id: string;
  userId: string;
  companyId: string;
  leadScore: number;
  leadStatus: LeadStatus;
  leadReason: string;
  highIntentActions: string[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = "New" | "Watching" | "High Intent" | "Contacted" | "Converted" | "Not Qualified";

export interface BudgetRecord {
  id: string;
  projectId: string;
  userId: string;
  companyId: string;
  budgetName: string;
  budgetVersion: string;
  budgetType: string;
  sourceType: BudgetSourceType;
  city: string;
  state: string;
  region: string;
  projectType: string;
  assetType: string;
  renovationOrNew: Project["renovationOrNew"];
  estimateDate: string | null;
  grossSquareFeet: number | null;
  rentableSquareFeet: number | null;
  unitCount: number | null;
  buildingCount: number | null;
  fundingType: string;
  occupiedOrVacant: OccupiedOrVacant;
  sourceFileId: string | null;
  consentStatus: ConsentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetVersionRecord {
  id: string;
  budgetId: string;
  projectId: string;
  versionName: string;
  versionNumber: number;
  sourceFileId: string | null;
  uploadedByUserId: string;
  estimateDate: string | null;
  notes: string;
  createdAt: string;
}

export interface BudgetLineItemRecord extends ParsedBudgetLineItem {
  id: string;
  budgetId: string;
  budgetVersionId: string;
  projectId: string;
  sourceFileId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBudgetInput {
  budgetName: string;
  budgetVersion: string;
  budgetType: string;
  sourceType: BudgetSourceType;
  city: string;
  state: string;
  region: string;
  projectType: string;
  assetType: string;
  renovationOrNew: Project["renovationOrNew"];
  estimateDate: string | null;
  grossSquareFeet: number | null;
  rentableSquareFeet: number | null;
  unitCount: number | null;
  buildingCount: number | null;
  fundingType: string;
  occupiedOrVacant: OccupiedOrVacant;
  sourceFileId: string | null;
  consentStatus: ConsentStatus;
  lineItems: ParsedBudgetLineItem[];
}

export interface SavedBudgetResult {
  budget: BudgetRecord;
  budgetVersion: BudgetVersionRecord;
  lineItemCount: number;
}

export interface BudgetComparisonRecord {
  id: string;
  projectId: string;
  userId: string;
  companyId: string;
  currentBudgetId: string;
  priorBudgetId: string;
  currentBudgetVersionId: string | null;
  priorBudgetVersionId: string | null;
  comparisonName: string;
  comparisonType: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetComparisonResultRecord extends BudgetComparisonLineResult {
  id: string;
  budgetComparisonId: string;
  createdAt: string;
}

export interface SavedBudgetComparison {
  comparison: BudgetComparisonRecord;
  results: BudgetComparisonResultRecord[];
  report: BudgetComparisonReport;
}

export interface PricingBenchmarkRecord {
  id: string;
  sourceBudgetId: string | null;
  sourceBudgetLineItemId: string | null;
  sourceProjectId: string | null;
  sourceCompanyId: string | null;
  trade: string;
  scopeCategory: string;
  scopeSubcategory: string;
  description: string;
  unitOfMeasure: string;
  unitCost: number | null;
  totalCost: number | null;
  quantity: number | null;
  costPerGrossSf: number | null;
  costPerRentableSf: number | null;
  costPerUnit: number | null;
  costPerBuilding: number | null;
  city: string;
  state: string;
  region: string;
  projectType: string;
  assetType: string;
  renovationOrNew: string;
  fundingType: string;
  estimateDate: string | null;
  sourceType: string;
  consentStatus: ConsentStatus;
  reviewStatus: DataReviewStatus;
  confidenceScore: number | null;
  approvedByAdminId: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface AdminPricingAggregateRow {
  trade: string;
  scopeCategory: string;
  scopeSubcategory: string;
  unitOfMeasure: string;
  sourceType: string;
  lowUnitCost: number | null;
  averageUnitCost: number | null;
  medianUnitCost: number | null;
  highUnitCost: number | null;
  recordCount: number;
  confidenceLevel: string;
  lastUpdatedAt: string;
}

export interface AdminPricingFilters {
  trade?: string;
  scopeCategory?: string;
  scopeSubcategory?: string;
  city?: string;
  state?: string;
  region?: string;
  projectType?: string;
  assetType?: string;
  renovationOrNew?: string;
  fundingType?: string;
  estimateDateFrom?: string;
  estimateDateTo?: string;
  unitOfMeasure?: string;
  reviewStatus?: DataReviewStatus;
  consentStatus?: ConsentStatus;
}

interface Database {
  users: UserRecord[];
  companies: CompanyRecord[];
  projects: Project[];
  reviews: StoredReview[];
  auditLogs: AuditLog[];
  projectMemory: ProjectMemoryRecord[];
  usageEvents: UsageEventRecord[];
  adminAuditLog: AdminAuditLogRecord[];
  feedback: FeedbackRecord[];
  dataReviewQueue: DataReviewQueueRecord[];
  leadScores: LeadScoreRecord[];
  budgets: BudgetRecord[];
  budgetVersions: BudgetVersionRecord[];
  budgetLineItems: BudgetLineItemRecord[];
  budgetComparisons: BudgetComparisonRecord[];
  budgetComparisonResults: BudgetComparisonResultRecord[];
  pricingBenchmarkRecords: PricingBenchmarkRecord[];
}

export interface PasswordUser {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
  passwordHash: string | null;
  companyId: string;
  role: string;
  accountType: AccountType;
  isAdmin: boolean;
  lastLoginAt: string | null;
}

export interface UserProfile {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  accountType: AccountType;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  companiesAdded: number;
  projectsCreated: number;
  documentsUploaded: number;
  reportsGenerated: number;
  usageEventsCount: number;
  feedbackCount: number;
  dataReviewPending: number;
  dataReviewApproved: number;
  dataReviewRejected: number;
  highIntentLeads: number;
  budgetComparisonsGenerated: number;
  pricingRecordsPendingReview: number;
  approvedBenchmarkRecords: number;
}

export interface AdminAnalyticsItem {
  label: string;
  value: number;
}

export interface AdminDashboardAnalytics {
  mostActiveCompanies: AdminAnalyticsItem[];
  mostActiveUsers: AdminAnalyticsItem[];
  mostUsedModules: AdminAnalyticsItem[];
  mostCommonTrades: AdminAnalyticsItem[];
  mostCommonProjectStates: AdminAnalyticsItem[];
  mostCommonRiskCategories: AdminAnalyticsItem[];
  userGrowthThisWeek: number;
  projectGrowthThisWeek: number;
}

export type AdminUserRow = UserProfile;

export interface AdminCompanyRow {
  id: string;
  companyName: string;
  companyType: string;
  trade: string;
  city: string;
  state: string;
  leadStatus: string;
  createdAt: string;
}

export interface AdminProjectRow {
  id: string;
  userId: string;
  companyId: string;
  projectName: string;
  city: string;
  state: string;
  projectType: string;
  currentPhase: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDocumentRow {
  id: string;
  projectId: string;
  userId: string;
  companyId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentCategory: string;
  extractionStatus: string;
  consentStatus: string;
  uploadedAt: string;
}

export interface AdminUsageEventRow {
  id: string;
  userId: string;
  companyId: string;
  projectId: string | null;
  eventType: string;
  eventMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminFeedbackRow {
  id: string;
  userId: string;
  companyId: string;
  projectId: string | null;
  feedbackType: string;
  rating: number | null;
  comment: string;
  createdAt: string;
}

export interface AdminDataReviewQueueRow {
  id: string;
  sourceType: string;
  sourceTable: string;
  sourceRecordId: string;
  projectId: string | null;
  userId: string | null;
  companyId: string | null;
  extractedValueSummary: string;
  normalizedTrade: string;
  normalizedScopeCategory: string;
  normalizedScopeSubcategory: string;
  confidenceScore: number | null;
  reviewStatus: DataReviewStatus;
  reviewedByAdminId: string | null;
  reviewedAt: string | null;
  adminNotes: string;
  reviewMetadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminDataReviewFilters {
  sourceType?: string;
  trade?: string;
  projectId?: string;
  minConfidence?: number | null;
  reviewStatus?: DataReviewStatus | "all";
}

export interface AdminLeadRow {
  userId: string;
  userName: string;
  email: string;
  companyId: string;
  companyName: string;
  companyType: string;
  trade: string;
  state: string;
  region: string;
  leadScore: number;
  leadStatus: LeadStatus;
  leadReason: string;
  highIntentActions: string[];
  lastActivityAt: string;
  projectsCount: number;
  documentsUploaded: number;
  budgetComparisonsCount: number;
  reportsGeneratedCount: number;
  pdfsDownloadedCount: number;
  feedbackCount: number;
}

export interface UsageEventInput {
  eventType: UsageEventType;
  projectId?: string | null;
  eventMetadata?: Record<string, unknown>;
}

type DbRow = Record<string, unknown>;
type Workspace = { userId: string; organizationId: string; companyId: string };

const DATA_DIR = process.env.SUBSCOPE_DATA_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), "subscope-data") : path.join(process.cwd(), ".data"));
const DB_PATH = path.join(DATA_DIR, "subscope-db.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const RUNTIME_CACHE_DB_KEY = "db";
const RUNTIME_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

function shouldUseSupabase(): boolean {
  return hasSupabaseConfig();
}

function allowRuntimeCacheFallback(): boolean {
  return process.env.ALLOW_RUNTIME_CACHE_STORE_FALLBACK === "true";
}

function shouldUseRuntimeCache(): boolean {
  return Boolean(process.env.VERCEL) && !shouldUseSupabase() && allowRuntimeCacheFallback();
}

function assertProductionStoreConfigured(operation: string): void {
  if (process.env.NODE_ENV === "production" && process.env.VERCEL && !shouldUseSupabase() && !allowRuntimeCacheFallback()) {
    logEvent("error", "storage.production_missing", { operation });
    throw new Error("Production storage is not configured. Add Supabase environment variables before using JanusScope in production.");
  }
}

function emptyDb(): Database {
  return {
    users: [],
    companies: [],
    projects: [],
    reviews: [],
    auditLogs: [],
    projectMemory: [],
    usageEvents: [],
    adminAuditLog: [],
    feedback: [],
    dataReviewQueue: [],
    leadScores: [],
    budgets: [],
    budgetVersions: [],
    budgetLineItems: [],
    budgetComparisons: [],
    budgetComparisonResults: [],
    pricingBenchmarkRecords: [],
  };
}

function backendDocumentCategoryFor(documentId: DocumentId): UploadedFile["backendDocumentCategory"] {
  switch (documentId) {
    case "budget":
      return "Budget";
    case "bid-proposal":
      return "Bid";
    case "gc-subcontract":
    case "prime-contract-excerpt":
      return "Subcontract";
    case "msa":
      return "Master Service Agreement";
    case "scope-letter":
      return "Scope Sheet";
    case "drawings":
      return "Drawing";
    case "specifications":
    case "product-data":
      return "Specification";
    case "schedule":
      return "Schedule";
    case "rfi-log":
    case "clarifications":
    case "addenda":
      return "RFI";
    default:
      return "Other";
  }
}

function normalizeUploadedFile(file: UploadedFile, project: Project): UploadedFile {
  return {
    ...file,
    companyId: file.companyId ?? project.companyId ?? project.organizationId,
    backendDocumentCategory: file.backendDocumentCategory ?? backendDocumentCategoryFor(file.documentId),
    filePath: file.filePath ?? file.storagePath,
    extractionConfidence:
      file.extractionConfidence ??
      (file.extractionStatus === "extracted" ? 0.8 : file.extractionStatus === "unsupported" ? 0.2 : null),
    sensitiveDataDetected: file.sensitiveDataDetected ?? false,
    allowedForAnonymizedLearning: file.allowedForAnonymizedLearning ?? false,
    deleteAfterReportGeneration: file.deleteAfterReportGeneration ?? project.deleteDocumentsAfterReport,
    excludedFromBenchmarking: file.excludedFromBenchmarking ?? true,
    consentStatus: file.consentStatus ?? project.consentStatus ?? "not-requested",
  };
}

function normalizeProject(project: Project): Project {
  const normalized = createEmptyProject({
    ...project,
    companyId: project.companyId ?? project.organizationId,
    region: project.region ?? "",
    assetType: project.assetType ?? "",
    renovationOrNew: project.renovationOrNew ?? "unknown",
    unitCount: project.unitCount ?? null,
    grossSquareFeet: project.grossSquareFeet ?? null,
    rentableSquareFeet: project.rentableSquareFeet ?? null,
    buildingCount: project.buildingCount ?? null,
    fundingType: project.fundingType ?? "",
    currentPhase: project.currentPhase ?? "",
    allowedForAnonymizedLearning: project.allowedForAnonymizedLearning ?? false,
    excludedFromBenchmarking: project.excludedFromBenchmarking ?? true,
    consentStatus: project.consentStatus ?? "not-requested",
  });
  return {
    ...normalized,
    uploadedFiles: (normalized.uploadedFiles ?? []).map((file) => normalizeUploadedFile(file, normalized)),
  };
}

function normalizeUserRecord(user: UserRecord): UserRecord {
  const organizationId = user.organizationId || orgIdForUser(user);
  return {
    ...user,
    organizationId,
    companyId: user.companyId || organizationId,
    role: user.role || "member",
    accountType: user.accountType || (user.id === "demo-user" ? "demo" : "individual"),
    isAdmin: Boolean(user.isAdmin),
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

function normalizeDb(value: Partial<Database>): Database {
  const db = { ...emptyDb(), ...value };
  db.users = (db.users ?? []).map(normalizeUserRecord);
  const companiesById = new Map((db.companies ?? []).map((company) => [company.id, company]));
  for (const user of db.users) {
    if (!companiesById.has(user.companyId)) {
      companiesById.set(user.companyId, {
        id: user.companyId,
        companyName: `${user.name || user.email} Workspace`,
        companyType: "Other",
        trade: "",
        website: "",
        city: "",
        state: "",
        region: "",
        leadStatus: "new",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }
  db.companies = Array.from(companiesById.values());
  db.projects = (db.projects ?? []).map(normalizeProject);
  db.reviews = db.reviews ?? [];
  db.auditLogs = db.auditLogs ?? [];
  db.projectMemory = db.projectMemory ?? [];
  db.usageEvents = db.usageEvents ?? [];
  db.adminAuditLog = db.adminAuditLog ?? [];
  db.feedback = db.feedback ?? [];
  db.dataReviewQueue = (db.dataReviewQueue ?? []).map((item) => ({
    ...item,
    normalizedTrade: item.normalizedTrade ?? "",
    normalizedScopeCategory: item.normalizedScopeCategory ?? "",
    normalizedScopeSubcategory: item.normalizedScopeSubcategory ?? "",
    reviewMetadata: item.reviewMetadata ?? {},
  }));
  db.leadScores = (db.leadScores ?? []).map((item) => ({
    ...item,
    leadStatus: item.leadStatus ?? leadStatusForScore(item.leadScore),
  }));
  db.budgets = db.budgets ?? [];
  db.budgetVersions = db.budgetVersions ?? [];
  db.budgetLineItems = db.budgetLineItems ?? [];
  db.budgetComparisons = db.budgetComparisons ?? [];
  db.budgetComparisonResults = db.budgetComparisonResults ?? [];
  db.pricingBenchmarkRecords = db.pricingBenchmarkRecords ?? [];
  return db;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function readDb(): Promise<Database> {
  assertProductionStoreConfigured("db.read");
  if (shouldUseRuntimeCache()) {
    try {
      const cached = await getCache({ namespace: "subscope-store" }).get(RUNTIME_CACHE_DB_KEY);
      return cached ? normalizeDb(cached as Partial<Database>) : emptyDb();
    } catch (error) {
      logEvent("warn", "runtime_cache.read_failed", { reason: errorMessage(error) });
    }
  }

  await ensureDataDir();
  try {
    const value = await fs.readFile(DB_PATH, "utf8");
    return normalizeDb(JSON.parse(value) as Partial<Database>);
  } catch {
    return emptyDb();
  }
}

async function writeDb(db: Database): Promise<void> {
  assertProductionStoreConfigured("db.write");
  if (shouldUseRuntimeCache()) {
    try {
      await getCache({ namespace: "subscope-store" }).set(RUNTIME_CACHE_DB_KEY, db, {
        ttl: RUNTIME_CACHE_TTL_SECONDS,
        tags: ["subscope-db"],
        name: "subscope-db",
      });
      return;
    } catch (error) {
      logEvent("warn", "runtime_cache.write_failed", { reason: errorMessage(error) });
    }
  }

  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function authSubjectForEmail(email: string): string {
  return `password:${crypto.createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 32)}`;
}

function orgIdForUser(user: Pick<SessionUser, "auth0UserId">): string {
  return `org_${crypto.createHash("sha256").update(user.auth0UserId).digest("hex").slice(0, 16)}`;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalNumber(value: unknown): number | undefined {
  const parsed = asNumberOrNull(value);
  return parsed === null ? undefined : parsed;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function dateOrNull(value: string): string | null {
  return value.trim() ? value : null;
}

function storageBucket(): string | null {
  return process.env.SUPABASE_UPLOAD_BUCKET || null;
}

function requireStorageBucket(): string {
  const bucket = storageBucket();
  if (!bucket) {
    logEvent("error", "upload.storage_bucket_missing", { storage: "supabase" });
    throw new Error("Upload storage bucket is not configured. Set SUPABASE_UPLOAD_BUCKET before accepting project files.");
  }
  return bucket;
}

function uploadedFilesFromRows(rows: DbRow[]): UploadedFile[] {
  return rows.map((row) => ({
    id: asString(row.id),
    companyId: asString(row.company_id),
    name: asString(row.file_name),
    size: Number(row.file_size ?? 0),
    type: asString(row.file_type, "application/octet-stream"),
    documentId: asString(row.document_type, "other") as DocumentId,
    documentCategory: optionalString(row.document_category) as UploadedFile["documentCategory"],
    backendDocumentCategory: optionalString(row.backend_document_category) as UploadedFile["backendDocumentCategory"],
    storagePath: asString(row.storage_path),
    filePath: asString(row.file_path, asString(row.storage_path)),
    processingStatus: asString(row.processing_status, "classified") as UploadedFile["processingStatus"],
    extractionStatus: asString(row.extraction_status, row.extracted_text ? "extracted" : "metadata-only") as UploadedFile["extractionStatus"],
    extractionConfidence: asNumberOrNull(row.extraction_confidence),
    extractionMessage: optionalString(row.extraction_message),
    extractedText: optionalString(row.extracted_text),
    reviewedSectionCount: optionalNumber(row.reviewed_section_count),
    includedInReview: typeof row.included_in_review === "boolean" ? row.included_in_review : Boolean(row.extracted_text),
    sensitiveDataDetected: asBoolean(row.sensitive_data_detected),
    allowedForAnonymizedLearning: asBoolean(row.allowed_for_anonymized_learning),
    deleteAfterReportGeneration: asBoolean(row.delete_after_report_generation),
    excludedFromBenchmarking: asBoolean(row.excluded_from_benchmarking, true),
    consentStatus: asString(row.consent_status, "not-requested") as ConsentStatus,
    uploadedAt: asString(row.created_at, now()),
  }));
}

function answersFromRows(rows: DbRow[]): IntakeAnswer[] {
  return rows.map((row) => ({
    questionKey: asString(row.question_key),
    questionText: asString(row.question_text),
    answer: asString(row.answer, "not-sure") as IntakeAnswer["answer"],
  }));
}

function projectFromRow(row: DbRow, uploadedFiles: UploadedFile[] = [], intakeAnswers: IntakeAnswer[] = []): Project {
  const uploadedTypes = new Set(uploadedFiles.map((file) => file.documentId));
  return createEmptyProject({
    id: asString(row.id),
    organizationId: asString(row.organization_id),
    companyId: asString(row.company_id, asString(row.organization_id)),
    userId: asString(row.user_id),
    name: asString(row.project_name),
    projectAddress: asString(row.project_address),
    city: asString(row.city),
    state: asString(row.state),
    region: asString(row.region),
    zip: asString(row.zip),
    tradeType: asString(row.trade_type),
    gcName: asString(row.gc_name),
    ownerName: asString(row.owner_name),
    contractAmount: asNumberOrNull(row.contract_amount),
    bidDate: asString(row.bid_date),
    executionDeadline: asString(row.execution_deadline),
    hasMasterServiceAgreement: asString(row.msa_status, "not-sure") as Project["hasMasterServiceAgreement"],
    publicOrPrivate: asString(row.public_or_private, "not-sure") as Project["publicOrPrivate"],
    prevailingWageStatus: asString(row.prevailing_wage_status, "not-sure") as Project["prevailingWageStatus"],
    projectType: asString(row.project_type, "commercial") as Project["projectType"],
    assetType: asString(row.asset_type),
    renovationOrNew: asString(row.renovation_or_new, "unknown") as Project["renovationOrNew"],
    unitCount: asNumberOrNull(row.unit_count),
    grossSquareFeet: asNumberOrNull(row.gross_square_feet),
    rentableSquareFeet: asNumberOrNull(row.rentable_square_feet),
    buildingCount: asNumberOrNull(row.building_count),
    fundingType: asString(row.funding_type),
    currentPhase: asString(row.current_phase),
    status: asString(row.status, "draft") as ProjectStatus,
    riskScore: asNumberOrNull(row.risk_score),
    riskLevel: asString(row.risk_level),
    allowedForAnonymizedLearning: asBoolean(row.allowed_for_anonymized_learning),
    deleteDocumentsAfterReport: asBoolean(row.delete_documents_after_report),
    excludedFromBenchmarking: asBoolean(row.excluded_from_benchmarking, true),
    consentStatus: asString(row.consent_status, "not-requested") as ConsentStatus,
    documents: DOCUMENT_CATALOG.map((document) => ({ ...document, available: uploadedTypes.has(document.id) })),
    uploadedFiles,
    intakeAnswers,
    subcontractText: asString(row.subcontract_text),
    bidText: asString(row.bid_text),
    exclusionsText: asString(row.exclusions_text),
    notesText: asString(row.notes_text),
    createdAt: asString(row.created_at, now()),
    updatedAt: asString(row.updated_at, now()),
  });
}

function projectToRow(project: Project): DbRow {
  return {
    organization_id: project.organizationId,
    user_id: project.userId,
    company_id: project.companyId,
    project_name: project.name,
    project_address: project.projectAddress,
    city: project.city,
    state: project.state,
    region: project.region,
    zip: project.zip,
    trade_type: project.tradeType,
    gc_name: project.gcName,
    owner_name: project.ownerName,
    contract_amount: project.contractAmount,
    bid_date: dateOrNull(project.bidDate),
    execution_deadline: dateOrNull(project.executionDeadline),
    project_type: project.projectType,
    asset_type: project.assetType,
    renovation_or_new: project.renovationOrNew,
    unit_count: project.unitCount,
    gross_square_feet: project.grossSquareFeet,
    rentable_square_feet: project.rentableSquareFeet,
    building_count: project.buildingCount,
    funding_type: project.fundingType,
    current_phase: project.currentPhase,
    public_or_private: project.publicOrPrivate,
    prevailing_wage_status: project.prevailingWageStatus,
    msa_status: project.hasMasterServiceAgreement,
    status: project.status,
    risk_score: project.riskScore,
    risk_level: project.riskLevel,
    subcontract_text: project.subcontractText,
    bid_text: project.bidText,
    exclusions_text: project.exclusionsText,
    notes_text: project.notesText,
    allowed_for_anonymized_learning: project.allowedForAnonymizedLearning,
    delete_documents_after_report: project.deleteDocumentsAfterReport,
    excluded_from_benchmarking: project.excludedFromBenchmarking,
    consent_status: project.consentStatus,
    updated_at: now(),
  };
}

function budgetFromRow(row: DbRow): BudgetRecord {
  return {
    id: asString(row.id),
    projectId: asString(row.project_id),
    userId: asString(row.user_id),
    companyId: asString(row.company_id),
    budgetName: asString(row.budget_name),
    budgetVersion: asString(row.budget_version),
    budgetType: asString(row.budget_type),
    sourceType: asString(row.source_type, "budget") as BudgetSourceType,
    city: asString(row.city),
    state: asString(row.state),
    region: asString(row.region),
    projectType: asString(row.project_type),
    assetType: asString(row.asset_type),
    renovationOrNew: asString(row.renovation_or_new, "unknown") as Project["renovationOrNew"],
    estimateDate: asString(row.estimate_date) || null,
    grossSquareFeet: asNumberOrNull(row.gross_square_feet),
    rentableSquareFeet: asNumberOrNull(row.rentable_square_feet),
    unitCount: asNumberOrNull(row.unit_count),
    buildingCount: asNumberOrNull(row.building_count),
    fundingType: asString(row.funding_type),
    occupiedOrVacant: asString(row.occupied_or_vacant, "unknown") as OccupiedOrVacant,
    sourceFileId: asString(row.source_file_id) || null,
    consentStatus: asString(row.consent_status, "not-requested") as ConsentStatus,
    createdAt: asString(row.created_at, now()),
    updatedAt: asString(row.updated_at, now()),
  };
}

function budgetVersionFromRow(row: DbRow): BudgetVersionRecord {
  return {
    id: asString(row.id),
    budgetId: asString(row.budget_id),
    projectId: asString(row.project_id),
    versionName: asString(row.version_name),
    versionNumber: Number(row.version_number ?? 1),
    sourceFileId: asString(row.source_file_id) || null,
    uploadedByUserId: asString(row.uploaded_by_user_id),
    estimateDate: asString(row.estimate_date) || null,
    notes: asString(row.notes),
    createdAt: asString(row.created_at, now()),
  };
}

function budgetToRow(budget: BudgetRecord): DbRow {
  return {
    project_id: budget.projectId,
    user_id: budget.userId,
    company_id: budget.companyId,
    budget_name: budget.budgetName,
    budget_version: budget.budgetVersion,
    budget_type: budget.budgetType,
    source_type: budget.sourceType,
    city: budget.city,
    state: budget.state,
    region: budget.region,
    project_type: budget.projectType,
    asset_type: budget.assetType,
    renovation_or_new: budget.renovationOrNew,
    estimate_date: budget.estimateDate,
    gross_square_feet: budget.grossSquareFeet,
    rentable_square_feet: budget.rentableSquareFeet,
    unit_count: budget.unitCount,
    building_count: budget.buildingCount,
    funding_type: budget.fundingType,
    occupied_or_vacant: budget.occupiedOrVacant,
    source_file_id: budget.sourceFileId,
    consent_status: budget.consentStatus,
    updated_at: budget.updatedAt,
  };
}

function budgetVersionToRow(version: BudgetVersionRecord): DbRow {
  return {
    budget_id: version.budgetId,
    project_id: version.projectId,
    version_name: version.versionName,
    version_number: version.versionNumber,
    source_file_id: version.sourceFileId,
    uploaded_by_user_id: version.uploadedByUserId,
    estimate_date: version.estimateDate,
    notes: version.notes,
  };
}

function budgetLineItemToRow(item: BudgetLineItemRecord): DbRow {
  return {
    budget_id: item.budgetId,
    budget_version_id: item.budgetVersionId,
    project_id: item.projectId,
    source_file_id: item.sourceFileId,
    row_number: item.rowNumber,
    cost_code: item.costCode,
    csi_division: item.csiDivision,
    raw_trade: item.rawTrade,
    normalized_trade: item.normalizedTrade,
    raw_description: item.rawDescription,
    normalized_scope_category: item.normalizedScopeCategory,
    normalized_scope_subcategory: item.normalizedScopeSubcategory,
    quantity: item.quantity,
    unit_of_measure: item.unitOfMeasure,
    unit_cost: item.unitCost,
    total_cost: item.totalCost,
    notes: item.notes,
    exclusions: item.exclusions,
    alternates: item.alternates,
    is_allowance: item.isAllowance,
    is_contingency: item.isContingency,
    confidence_score: item.confidenceScore,
    mapping_status: item.mappingStatus,
    review_status: item.reviewStatus,
    updated_at: item.updatedAt,
  };
}

function budgetLineItemFromRow(row: DbRow): BudgetLineItemRecord {
  return {
    id: asString(row.id),
    budgetId: asString(row.budget_id),
    budgetVersionId: asString(row.budget_version_id),
    projectId: asString(row.project_id),
    sourceFileId: asString(row.source_file_id) || null,
    rowNumber: Number(row.row_number ?? 0),
    costCode: asString(row.cost_code),
    csiDivision: asString(row.csi_division),
    rawTrade: asString(row.raw_trade),
    normalizedTrade: asString(row.normalized_trade, "Other/Unmapped") as BudgetLineItemRecord["normalizedTrade"],
    rawDescription: asString(row.raw_description),
    normalizedScopeCategory: asString(row.normalized_scope_category),
    normalizedScopeSubcategory: asString(row.normalized_scope_subcategory),
    quantity: asNumberOrNull(row.quantity),
    unitOfMeasure: asString(row.unit_of_measure),
    unitCost: asNumberOrNull(row.unit_cost),
    totalCost: asNumberOrNull(row.total_cost),
    notes: asString(row.notes),
    exclusions: asString(row.exclusions),
    alternates: asString(row.alternates),
    isAllowance: asBoolean(row.is_allowance),
    isContingency: asBoolean(row.is_contingency),
    confidenceScore: Number(row.confidence_score ?? 0),
    mappingStatus: asString(row.mapping_status, "raw"),
    reviewStatus: asString(row.review_status, "raw"),
    createdAt: asString(row.created_at, now()),
    updatedAt: asString(row.updated_at, now()),
  };
}

function budgetComparisonFromRow(row: DbRow): BudgetComparisonRecord {
  return {
    id: asString(row.id),
    projectId: asString(row.project_id),
    userId: asString(row.user_id),
    companyId: asString(row.company_id),
    currentBudgetId: asString(row.current_budget_id),
    priorBudgetId: asString(row.prior_budget_id),
    currentBudgetVersionId: asString(row.current_budget_version_id) || null,
    priorBudgetVersionId: asString(row.prior_budget_version_id) || null,
    comparisonName: asString(row.comparison_name),
    comparisonType: asString(row.comparison_type),
    createdAt: asString(row.created_at, now()),
    updatedAt: asString(row.updated_at, now()),
  };
}

function budgetComparisonResultFromRow(row: DbRow): BudgetComparisonResultRecord {
  return {
    id: asString(row.id),
    budgetComparisonId: asString(row.budget_comparison_id),
    normalizedTrade: asString(row.normalized_trade),
    normalizedScopeCategory: asString(row.normalized_scope_category),
    normalizedScopeSubcategory: asString(row.normalized_scope_subcategory),
    priorLineItemId: asString(row.prior_line_item_id) || null,
    currentLineItemId: asString(row.current_line_item_id) || null,
    priorDescription: asString(row.prior_description),
    currentDescription: asString(row.current_description),
    priorQuantity: asNumberOrNull(row.prior_quantity),
    currentQuantity: asNumberOrNull(row.current_quantity),
    quantityVariance: asNumberOrNull(row.quantity_variance),
    quantityVariancePercent: asNumberOrNull(row.quantity_variance_percent),
    priorUnitOfMeasure: asString(row.prior_unit_of_measure),
    currentUnitOfMeasure: asString(row.current_unit_of_measure),
    priorUnitCost: asNumberOrNull(row.prior_unit_cost),
    currentUnitCost: asNumberOrNull(row.current_unit_cost),
    unitCostVariance: asNumberOrNull(row.unit_cost_variance),
    unitCostVariancePercent: asNumberOrNull(row.unit_cost_variance_percent),
    priorTotalCost: asNumberOrNull(row.prior_total_cost),
    currentTotalCost: asNumberOrNull(row.current_total_cost),
    totalCostVariance: asNumberOrNull(row.total_cost_variance),
    totalCostVariancePercent: asNumberOrNull(row.total_cost_variance_percent),
    priorCostPerGsf: asNumberOrNull(row.prior_cost_per_gsf),
    currentCostPerGsf: asNumberOrNull(row.current_cost_per_gsf),
    priorCostPerRsf: asNumberOrNull(row.prior_cost_per_rsf),
    currentCostPerRsf: asNumberOrNull(row.current_cost_per_rsf),
    priorCostPerUnit: asNumberOrNull(row.prior_cost_per_unit),
    currentCostPerUnit: asNumberOrNull(row.current_cost_per_unit),
    priorCostPerBuilding: asNumberOrNull(row.prior_cost_per_building),
    currentCostPerBuilding: asNumberOrNull(row.current_cost_per_building),
    reasonForVariance: asString(row.reason_for_variance),
    riskFlag: asString(row.risk_flag) as BudgetComparisonResultRecord["riskFlag"],
    confidenceScore: Number(row.confidence_score ?? 0),
    recommendedQuestion: asString(row.recommended_question),
    reviewStatus: asString(row.review_status, "raw"),
    createdAt: asString(row.created_at, now()),
  };
}

function budgetComparisonResultToRow(result: BudgetComparisonResultRecord): DbRow {
  return {
    budget_comparison_id: result.budgetComparisonId,
    normalized_trade: result.normalizedTrade,
    normalized_scope_category: result.normalizedScopeCategory,
    normalized_scope_subcategory: result.normalizedScopeSubcategory,
    prior_line_item_id: result.priorLineItemId,
    current_line_item_id: result.currentLineItemId,
    prior_description: result.priorDescription,
    current_description: result.currentDescription,
    prior_quantity: result.priorQuantity,
    current_quantity: result.currentQuantity,
    quantity_variance: result.quantityVariance,
    quantity_variance_percent: result.quantityVariancePercent,
    prior_unit_of_measure: result.priorUnitOfMeasure,
    current_unit_of_measure: result.currentUnitOfMeasure,
    prior_unit_cost: result.priorUnitCost,
    current_unit_cost: result.currentUnitCost,
    unit_cost_variance: result.unitCostVariance,
    unit_cost_variance_percent: result.unitCostVariancePercent,
    prior_total_cost: result.priorTotalCost,
    current_total_cost: result.currentTotalCost,
    total_cost_variance: result.totalCostVariance,
    total_cost_variance_percent: result.totalCostVariancePercent,
    prior_cost_per_gsf: result.priorCostPerGsf,
    current_cost_per_gsf: result.currentCostPerGsf,
    prior_cost_per_rsf: result.priorCostPerRsf,
    current_cost_per_rsf: result.currentCostPerRsf,
    prior_cost_per_unit: result.priorCostPerUnit,
    current_cost_per_unit: result.currentCostPerUnit,
    prior_cost_per_building: result.priorCostPerBuilding,
    current_cost_per_building: result.currentCostPerBuilding,
    reason_for_variance: result.reasonForVariance,
    risk_flag: result.riskFlag,
    confidence_score: result.confidenceScore,
    recommended_question: result.recommendedQuestion,
    review_status: result.reviewStatus,
    created_at: result.createdAt,
  };
}

function pricingBenchmarkFromRow(row: DbRow): PricingBenchmarkRecord {
  return {
    id: asString(row.id),
    sourceBudgetId: asString(row.source_budget_id) || null,
    sourceBudgetLineItemId: asString(row.source_budget_line_item_id) || null,
    sourceProjectId: asString(row.source_project_id) || null,
    sourceCompanyId: asString(row.source_company_id) || null,
    trade: asString(row.trade),
    scopeCategory: asString(row.scope_category),
    scopeSubcategory: asString(row.scope_subcategory),
    description: asString(row.description),
    unitOfMeasure: asString(row.unit_of_measure),
    unitCost: asNumberOrNull(row.unit_cost),
    totalCost: asNumberOrNull(row.total_cost),
    quantity: asNumberOrNull(row.quantity),
    costPerGrossSf: asNumberOrNull(row.cost_per_gross_sf),
    costPerRentableSf: asNumberOrNull(row.cost_per_rentable_sf),
    costPerUnit: asNumberOrNull(row.cost_per_unit),
    costPerBuilding: asNumberOrNull(row.cost_per_building),
    city: asString(row.city),
    state: asString(row.state),
    region: asString(row.region),
    projectType: asString(row.project_type),
    assetType: asString(row.asset_type),
    renovationOrNew: asString(row.renovation_or_new),
    fundingType: asString(row.funding_type),
    estimateDate: asString(row.estimate_date) || null,
    sourceType: asString(row.source_type),
    consentStatus: asString(row.consent_status, "not-requested") as ConsentStatus,
    reviewStatus: asString(row.review_status, "raw") as DataReviewStatus,
    confidenceScore: asNumberOrNull(row.confidence_score),
    approvedByAdminId: asString(row.approved_by_admin_id) || null,
    approvedAt: asString(row.approved_at) || null,
    createdAt: asString(row.created_at, now()),
  };
}

function pricingBenchmarkToRow(record: PricingBenchmarkRecord): DbRow {
  return {
    source_budget_id: record.sourceBudgetId,
    source_budget_line_item_id: record.sourceBudgetLineItemId,
    source_project_id: record.sourceProjectId,
    source_company_id: record.sourceCompanyId,
    trade: record.trade,
    scope_category: record.scopeCategory,
    scope_subcategory: record.scopeSubcategory,
    description: record.description,
    unit_of_measure: record.unitOfMeasure,
    unit_cost: record.unitCost,
    total_cost: record.totalCost,
    quantity: record.quantity,
    cost_per_gross_sf: record.costPerGrossSf,
    cost_per_rentable_sf: record.costPerRentableSf,
    cost_per_unit: record.costPerUnit,
    cost_per_building: record.costPerBuilding,
    city: record.city,
    state: record.state,
    region: record.region,
    project_type: record.projectType,
    asset_type: record.assetType,
    renovation_or_new: record.renovationOrNew,
    funding_type: record.fundingType,
    estimate_date: record.estimateDate,
    source_type: record.sourceType,
    consent_status: record.consentStatus,
    review_status: record.reviewStatus,
    confidence_score: record.confidenceScore,
    approved_by_admin_id: record.approvedByAdminId,
    approved_at: record.approvedAt,
    created_at: record.createdAt,
  };
}

function dataReviewQueueFromRow(row: DbRow): DataReviewQueueRecord {
  return {
    id: asString(row.id),
    sourceType: asString(row.source_type),
    sourceTable: asString(row.source_table),
    sourceRecordId: asString(row.source_record_id),
    projectId: asString(row.project_id) || null,
    userId: asString(row.user_id) || null,
    companyId: asString(row.company_id) || null,
    extractedValueSummary: asString(row.extracted_value_summary),
    normalizedTrade: asString(row.normalized_trade),
    normalizedScopeCategory: asString(row.normalized_scope_category),
    normalizedScopeSubcategory: asString(row.normalized_scope_subcategory),
    confidenceScore: asNumberOrNull(row.confidence_score),
    reviewStatus: asString(row.review_status, "raw") as DataReviewStatus,
    reviewedByAdminId: asString(row.reviewed_by_admin_id) || null,
    reviewedAt: asString(row.reviewed_at) || null,
    adminNotes: asString(row.admin_notes),
    reviewMetadata: (row.review_metadata as Record<string, unknown>) ?? {},
    createdAt: asString(row.created_at, now()),
  };
}

function dataReviewQueueToRow(item: DataReviewQueueRecord): DbRow {
  return {
    source_type: item.sourceType,
    source_table: item.sourceTable,
    source_record_id: item.sourceRecordId,
    project_id: item.projectId,
    user_id: item.userId,
    company_id: item.companyId,
    extracted_value_summary: item.extractedValueSummary,
    normalized_trade: item.normalizedTrade,
    normalized_scope_category: item.normalizedScopeCategory,
    normalized_scope_subcategory: item.normalizedScopeSubcategory,
    confidence_score: item.confidenceScore,
    review_status: item.reviewStatus,
    reviewed_by_admin_id: item.reviewedByAdminId,
    reviewed_at: item.reviewedAt,
    admin_notes: item.adminNotes,
    review_metadata: item.reviewMetadata,
    created_at: item.createdAt,
  };
}

async function supabaseProject(projectId: string, workspace: Workspace): Promise<Project | null> {
  const client = getSupabaseAdmin();
  const { data: projectRow, error: projectError } = await client
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", workspace.userId)
    .eq("organization_id", workspace.organizationId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!projectRow) return null;

  const [{ data: documentRows, error: documentError }, { data: answerRows, error: answerError }] = await Promise.all([
    client.from("documents").select("*").eq("project_id", projectId).order("created_at", { ascending: true }),
    client.from("intake_answers").select("*").eq("project_id", projectId).order("created_at", { ascending: true }),
  ]);

  if (documentError) throw documentError;
  if (answerError) throw answerError;

  return projectFromRow(projectRow as DbRow, uploadedFilesFromRows((documentRows ?? []) as DbRow[]), answersFromRows((answerRows ?? []) as DbRow[]));
}

async function ensureSupabaseCompanyForWorkspace(client: ReturnType<typeof getSupabaseAdmin>, userId: string, organizationId: string, companyName: string): Promise<string> {
  const { error: companyError } = await client.from("companies").upsert(
    {
      id: organizationId,
      company_name: companyName || "JanusScope Workspace",
      company_type: "Other",
      lead_status: "new",
      updated_at: now(),
    },
    { onConflict: "id" },
  );
  if (companyError) throw companyError;

  const { error: userError } = await client
    .from("users")
    .update({ company_id: organizationId, updated_at: now() })
    .eq("id", userId);
  if (userError) throw userError;

  return organizationId;
}

async function supabaseWorkspaceForUser(user: SessionUser): Promise<Workspace> {
  const client = getSupabaseAdmin();
  const { data: userRow, error: userError } = await client
    .from("users")
    .select("id, auth0_user_id, email, name, company_id")
    .eq("auth0_user_id", user.auth0UserId)
    .maybeSingle();

  if (userError) throw userError;

  let dbUser = userRow as DbRow | null;
  if (!dbUser) {
    const { data: insertedUser, error: insertError } = await client
      .from("users")
      .insert({
        auth0_user_id: user.auth0UserId,
        email: normalizeEmail(user.email),
        name: user.name,
        role: "member",
        account_type: user.id === "demo-user" ? "demo" : "individual",
        is_admin: false,
      })
      .select("id, auth0_user_id, email, name, company_id")
      .single();
    if (insertError) throw insertError;
    dbUser = insertedUser as DbRow;
  }

  const userId = asString(dbUser.id);
  const { data: membership, error: memberError } = await client
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (membership) {
    const organizationId = asString((membership as DbRow).organization_id);
    const companyId =
      asString(dbUser.company_id) ||
      await ensureSupabaseCompanyForWorkspace(client, userId, organizationId, `${user.name || user.email} Workspace`);
    return { userId, organizationId, companyId };
  }

  const { data: organization, error: orgError } = await client
    .from("organizations")
    .insert({ name: `${user.name || user.email} Workspace` })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const organizationId = asString((organization as DbRow).id);
  const { error: insertMemberError } = await client
    .from("organization_members")
    .insert({ organization_id: organizationId, user_id: userId, role: "owner" });
  if (insertMemberError) throw insertMemberError;

  const companyId = await ensureSupabaseCompanyForWorkspace(client, userId, organizationId, `${user.name || user.email} Workspace`);
  return { userId, organizationId, companyId };
}

export async function findPasswordUserByEmail(email: string): Promise<PasswordUser | null> {
  const normalizedEmail = normalizeEmail(email);
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from("users")
      .select("id, auth0_user_id, email, name, password_hash, company_id, role, account_type, is_admin, last_login_at")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as DbRow;
    return {
      id: asString(row.id),
      auth0UserId: asString(row.auth0_user_id),
      email: asString(row.email),
      name: asString(row.name, asString(row.email)),
      passwordHash: asString(row.password_hash) || null,
      companyId: asString(row.company_id),
      role: asString(row.role, "member"),
      accountType: asString(row.account_type, "individual") as AccountType,
      isAdmin: asBoolean(row.is_admin),
      lastLoginAt: asString(row.last_login_at) || null,
    };
  }

  const db = await readDb();
  const user = db.users.find((item) => normalizeEmail(item.email) === normalizedEmail);
  return user
    ? {
        id: user.id,
        auth0UserId: user.auth0UserId,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash ?? null,
        companyId: user.companyId,
        role: user.role,
        accountType: user.accountType,
        isAdmin: user.isAdmin,
        lastLoginAt: user.lastLoginAt ?? null,
      }
    : null;
}

export async function createPasswordUser(email: string, passwordHash: string): Promise<SessionUser> {
  const normalizedEmail = normalizeEmail(email);
  const name = normalizedEmail.split("@")[0] || "SubScope user";
  const auth0UserId = authSubjectForEmail(normalizedEmail);

  if (shouldUseSupabase()) {
    const existing = await findPasswordUserByEmail(normalizedEmail);
    if (existing) throw new Error("An account already exists for this email.");

    const client = getSupabaseAdmin();
    const { data: insertedUser, error: userError } = await client
      .from("users")
      .insert({
        auth0_user_id: auth0UserId,
        email: normalizedEmail,
        name,
        password_hash: passwordHash,
        role: "member",
        account_type: "individual",
        is_admin: false,
      })
      .select("id, auth0_user_id, email, name")
      .single();
    if (userError) throw userError;

    const userId = asString((insertedUser as DbRow).id);
    const { data: organization, error: orgError } = await client
      .from("organizations")
      .insert({ name: `${name} Workspace` })
      .select("id")
      .single();
    if (orgError) throw orgError;

    const organizationId = asString((organization as DbRow).id);
    const { error: memberError } = await client
      .from("organization_members")
      .insert({ organization_id: organizationId, user_id: userId, role: "owner" });
    if (memberError) throw memberError;

    await ensureSupabaseCompanyForWorkspace(client, userId, organizationId, `${name} Workspace`);
    logEvent("info", "auth.signup.created", { userId, storage: "supabase" });
    return { id: userId, auth0UserId, email: normalizedEmail, name };
  }

  const db = await readDb();
  if (db.users.some((item) => normalizeEmail(item.email) === normalizedEmail)) {
    throw new Error("An account already exists for this email.");
  }

  const createdAt = now();
  const user: UserRecord = {
    id: id("user"),
    auth0UserId,
    email: normalizedEmail,
    name,
    organizationId: orgIdForUser({ auth0UserId }),
    companyId: orgIdForUser({ auth0UserId }),
    role: "member",
    accountType: "individual",
    isAdmin: false,
    passwordHash,
    lastLoginAt: null,
    createdAt,
    updatedAt: createdAt,
  };
  db.users.push(user);
  db.companies.push({
    id: user.companyId,
    companyName: `${name} Workspace`,
    companyType: "Other",
    trade: "",
    website: "",
    city: "",
    state: "",
    region: "",
    leadStatus: "new",
    createdAt,
    updatedAt: createdAt,
  });
  await writeDb(db);
  logEvent("info", "auth.signup.created", { userId: user.id, storage: "local" });
  return { id: user.id, auth0UserId, email: normalizedEmail, name };
}

export async function markUserLogin(user: SessionUser): Promise<void> {
  const loggedInAt = now();
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { error } = await client
      .from("users")
      .update({ last_login_at: loggedInAt, updated_at: loggedInAt })
      .eq("auth0_user_id", user.auth0UserId);
    if (error) {
      logEvent("warn", "auth.login_timestamp.failed", { userId: user.id, reason: error.message });
    }
    return;
  }

  const db = await readDb();
  const existing = db.users.find((item) => item.auth0UserId === user.auth0UserId);
  if (!existing) return;
  existing.lastLoginAt = loggedInAt;
  existing.updatedAt = loggedInAt;
  await writeDb(db);
}

export async function ensureWorkspace(user: SessionUser): Promise<Workspace> {
  if (shouldUseSupabase()) return supabaseWorkspaceForUser(user);

  const db = await readDb();
  const existing = db.users.find((item) => item.auth0UserId === user.auth0UserId);
  if (existing) return { userId: existing.id, organizationId: existing.organizationId, companyId: existing.companyId };

  const createdAt = now();
  const userRecord: UserRecord = {
    id: user.id,
    auth0UserId: user.auth0UserId,
    email: user.email,
    name: user.name,
    organizationId: orgIdForUser(user),
    companyId: orgIdForUser(user),
    role: "member",
    accountType: user.id === "demo-user" ? "demo" : "individual",
    isAdmin: false,
    lastLoginAt: null,
    createdAt,
    updatedAt: createdAt,
  };
  db.users.push(userRecord);
  db.companies.push({
    id: userRecord.companyId,
    companyName: `${user.name || user.email} Workspace`,
    companyType: "Other",
    trade: "",
    website: "",
    city: "",
    state: "",
    region: "",
    leadStatus: "new",
    createdAt,
    updatedAt: createdAt,
  });
  await writeDb(db);
  return { userId: userRecord.id, organizationId: userRecord.organizationId, companyId: userRecord.companyId };
}

export async function getUserProfile(user: SessionUser): Promise<UserProfile> {
  const workspace = await ensureWorkspace(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .select("id, auth0_user_id, email, name, company_id, role, account_type, is_admin, created_at, last_login_at")
      .eq("id", workspace.userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("User profile not found");
    const row = data as DbRow;
    return {
      id: asString(row.id),
      auth0UserId: asString(row.auth0_user_id),
      email: asString(row.email),
      name: asString(row.name, asString(row.email)),
      role: asString(row.role, "member"),
      companyId: asString(row.company_id, workspace.companyId),
      accountType: asString(row.account_type, "individual") as AccountType,
      isAdmin: asBoolean(row.is_admin),
      createdAt: asString(row.created_at, now()),
      lastLoginAt: asString(row.last_login_at) || null,
    };
  }

  const db = await readDb();
  const record = db.users.find((item) => item.id === workspace.userId || item.auth0UserId === user.auth0UserId);
  if (!record) throw new Error("User profile not found");
  return {
    id: record.id,
    auth0UserId: record.auth0UserId,
    email: record.email,
    name: record.name,
    role: record.role,
    companyId: record.companyId,
    accountType: record.accountType,
    isAdmin: record.isAdmin,
    createdAt: record.createdAt,
    lastLoginAt: record.lastLoginAt ?? null,
  };
}

export function isAdminProfile(profile: Pick<UserProfile, "isAdmin" | "role">): boolean {
  return profile.isAdmin || profile.role.trim().toLowerCase() === "admin";
}

async function assertAdminStoreAccess(user: SessionUser): Promise<UserProfile> {
  const profile = await getUserProfile(user);
  if (!isAdminProfile(profile)) {
    logEvent("warn", "admin.data_access_denied", { userId: profile.id });
    throw new Error("Admin access required");
  }
  return profile;
}

export async function listProjects(user: SessionUser): Promise<Project[]> {
  const workspace = await ensureWorkspace(user);
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from("projects")
      .select("*")
      .eq("user_id", workspace.userId)
      .eq("organization_id", workspace.organizationId)
      .order("updated_at", { ascending: false });
    if (error) throw error;

    const projects = await Promise.all(
      ((data ?? []) as DbRow[]).map((row) => supabaseProject(asString(row.id), workspace)),
    );
    logEvent("info", "project.list.loaded", { userId: workspace.userId, count: projects.filter(Boolean).length, storage: "supabase" });
    return projects.filter((project): project is Project => Boolean(project));
  }

  const db = await readDb();
  const projects = db.projects
    .filter((project) => project.userId === workspace.userId && project.organizationId === workspace.organizationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  logEvent("info", "project.list.loaded", { userId: workspace.userId, count: projects.length, storage: "local" });
  return projects;
}

export async function getProject(user: SessionUser, projectId: string): Promise<Project | null> {
  const workspace = await ensureWorkspace(user);
  if (shouldUseSupabase()) {
    const project = await supabaseProject(projectId, workspace);
    logEvent(project ? "info" : "warn", "project.load", { userId: workspace.userId, projectId, found: Boolean(project), storage: "supabase" });
    return project;
  }

  const db = await readDb();
  const project =
    db.projects.find(
      (item) =>
        item.id === projectId &&
        item.userId === workspace.userId &&
        item.organizationId === workspace.organizationId,
    ) ?? null;
  logEvent(project ? "info" : "warn", "project.load", { userId: workspace.userId, projectId, found: Boolean(project), storage: "local" });
  return project;
}

export async function createProject(
  user: SessionUser,
  input: Omit<
    Project,
    | "id"
    | "organizationId"
    | "companyId"
    | "userId"
    | "region"
    | "assetType"
    | "renovationOrNew"
    | "unitCount"
    | "grossSquareFeet"
    | "rentableSquareFeet"
    | "buildingCount"
    | "fundingType"
    | "currentPhase"
    | "documents"
    | "uploadedFiles"
    | "intakeAnswers"
    | "subcontractText"
    | "bidText"
    | "exclusionsText"
    | "notesText"
    | "status"
    | "riskScore"
    | "riskLevel"
    | "allowedForAnonymizedLearning"
    | "deleteDocumentsAfterReport"
    | "excludedFromBenchmarking"
    | "consentStatus"
    | "createdAt"
    | "updatedAt"
  >,
): Promise<Project> {
  const workspace = await ensureWorkspace(user);
  const createdAt = now();
  const project = createEmptyProject({
    ...input,
    id: id("project"),
    organizationId: workspace.organizationId,
    companyId: workspace.companyId,
    userId: workspace.userId,
    createdAt,
    updatedAt: createdAt,
  });

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from("projects")
      .insert(projectToRow(project))
      .select("*")
      .single();
    if (error) {
      logEvent("error", "project.create.failed", { userId: workspace.userId, reason: error.message, storage: "supabase" });
      throw error;
    }

    const savedProject = projectFromRow(data as DbRow);
    await addAudit(user, savedProject.id, "project.created", { projectName: savedProject.name });
    logEvent("info", "project.create.succeeded", { userId: workspace.userId, projectId: savedProject.id, storage: "supabase" });
    return savedProject;
  }

  const db = await readDb();
  db.projects.push(project);
  db.auditLogs.push(makeAudit(project, "project.created", { projectName: project.name }));
  await writeDb(db);
  logEvent("info", "project.create.succeeded", { userId: workspace.userId, projectId: project.id, storage: "local" });
  return project;
}

export async function saveProject(user: SessionUser, project: Project, action = "project.updated"): Promise<Project> {
  const workspace = await ensureWorkspace(user);
  if (project.userId !== workspace.userId || project.organizationId !== workspace.organizationId) {
    throw new Error("Project access denied");
  }

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { error } = await client
      .from("projects")
      .update(projectToRow(project))
      .eq("id", project.id)
      .eq("user_id", workspace.userId)
      .eq("organization_id", workspace.organizationId);
    if (error) throw error;
    await addAudit(user, project.id, action, {});
    return (await getProject(user, project.id)) ?? project;
  }

  const db = await readDb();
  const index = db.projects.findIndex(
    (item) => item.id === project.id && item.userId === workspace.userId && item.organizationId === workspace.organizationId,
  );
  if (index === -1) throw new Error("Project not found");

  const updated = { ...project, updatedAt: now() };
  db.projects[index] = updated;
  db.auditLogs.push(makeAudit(updated, action, {}));
  await writeDb(db);
  return updated;
}

export async function saveUploadedFile(
  user: SessionUser,
  project: Project,
  file: File,
  documentId: UploadedFile["documentId"],
): Promise<UploadedFile | null> {
  if (file.size === 0) return null;
  const workspace = await ensureWorkspace(user);
  if (project.userId !== workspace.userId || project.organizationId !== workspace.organizationId) {
    throw new Error("Project access denied");
  }

  const fileId = id("doc");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const storagePath = `${workspace.organizationId}/${project.id}/${fileId}-${safeName}`;
  const extracted = await extractUploadedFileText(file, documentId);
  const processingStatus: UploadedFile["processingStatus"] = extracted.extractionStatus === "failed" ? "failed" : "classified";

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const bucket = requireStorageBucket();
    const { error: storageError } = await client.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (storageError) throw storageError;

    const { data, error } = await client
      .from("documents")
      .insert({
        project_id: project.id,
        organization_id: workspace.organizationId,
        user_id: workspace.userId,
        company_id: workspace.companyId,
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        document_type: documentId,
        storage_path: storagePath,
        file_path: storagePath,
        file_size: file.size,
        processing_status: processingStatus,
        extracted_text: extracted.extractedText || null,
        extraction_status: extracted.extractionStatus,
        extraction_confidence: extracted.extractionStatus === "extracted" ? 0.8 : extracted.extractionStatus === "unsupported" ? 0.2 : null,
        extraction_message: extracted.extractionMessage,
        reviewed_section_count: extracted.reviewedSectionCount,
        included_in_review: extracted.includedInReview,
        document_category: extracted.documentCategory,
        backend_document_category: backendDocumentCategoryFor(documentId),
        sensitive_data_detected: false,
        allowed_for_anonymized_learning: project.allowedForAnonymizedLearning,
        delete_after_report_generation: project.deleteDocumentsAfterReport,
        excluded_from_benchmarking: project.excludedFromBenchmarking,
        consent_status: project.consentStatus,
      })
      .select("*")
      .single();
    if (error) throw error;
    logEvent("info", "upload.saved", {
      userId: workspace.userId,
      projectId: project.id,
      size: file.size,
      extractionStatus: extracted.extractionStatus,
      includedInReview: extracted.includedInReview,
      storage: "supabase",
    });
    return uploadedFilesFromRows([data as DbRow])[0];
  }

  const absolutePath = path.join(UPLOAD_DIR, storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  const uploadedFile = {
    id: fileId,
    companyId: workspace.companyId,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    documentId,
    documentCategory: extracted.documentCategory,
    backendDocumentCategory: backendDocumentCategoryFor(documentId),
    storagePath,
    filePath: storagePath,
    processingStatus,
    extractionStatus: extracted.extractionStatus,
    extractionConfidence: extracted.extractionStatus === "extracted" ? 0.8 : extracted.extractionStatus === "unsupported" ? 0.2 : null,
    extractionMessage: extracted.extractionMessage,
    extractedText: extracted.extractedText || undefined,
    reviewedSectionCount: extracted.reviewedSectionCount,
    includedInReview: extracted.includedInReview,
    sensitiveDataDetected: false,
    allowedForAnonymizedLearning: project.allowedForAnonymizedLearning,
    deleteAfterReportGeneration: project.deleteDocumentsAfterReport,
    excludedFromBenchmarking: project.excludedFromBenchmarking,
    consentStatus: project.consentStatus,
    uploadedAt: now(),
  };
  logEvent("info", "upload.saved", {
    userId: workspace.userId,
    projectId: project.id,
    size: file.size,
    extractionStatus: extracted.extractionStatus,
    includedInReview: extracted.includedInReview,
    storage: "local",
  });
  return uploadedFile;
}

export async function saveBudgetScopeImport(
  user: SessionUser,
  project: Project,
  input: SaveBudgetInput,
): Promise<SavedBudgetResult> {
  const workspace = await ensureWorkspace(user);
  if (project.userId !== workspace.userId || project.organizationId !== workspace.organizationId) {
    throw new Error("Project access denied");
  }
  if (input.lineItems.length === 0) {
    throw new Error("BudgetScope import needs at least one parsed line item.");
  }

  const createdAt = now();

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const budgetPayload = {
      ...budgetToRow({
        id: "",
        projectId: project.id,
        userId: workspace.userId,
        companyId: workspace.companyId,
        budgetName: input.budgetName,
        budgetVersion: input.budgetVersion,
        budgetType: input.budgetType,
        sourceType: input.sourceType,
        city: input.city,
        state: input.state,
        region: input.region,
        projectType: input.projectType,
        assetType: input.assetType,
        renovationOrNew: input.renovationOrNew,
        estimateDate: input.estimateDate,
        grossSquareFeet: input.grossSquareFeet,
        rentableSquareFeet: input.rentableSquareFeet,
        unitCount: input.unitCount,
        buildingCount: input.buildingCount,
        fundingType: input.fundingType,
        occupiedOrVacant: input.occupiedOrVacant,
        sourceFileId: input.sourceFileId,
        consentStatus: input.consentStatus,
        createdAt,
        updatedAt: createdAt,
      }),
      created_at: createdAt,
    };
    const { data: budgetRow, error: budgetError } = await client
      .from("budgets")
      .insert(budgetPayload)
      .select("*")
      .single();
    if (budgetError) throw budgetError;

    const budget = budgetFromRow(budgetRow as DbRow);
    const { data: versionRow, error: versionError } = await client
      .from("budget_versions")
      .insert({
        ...budgetVersionToRow({
          id: "",
          budgetId: budget.id,
          projectId: project.id,
          versionName: input.budgetVersion || "Initial import",
          versionNumber: 1,
          sourceFileId: input.sourceFileId,
          uploadedByUserId: workspace.userId,
          estimateDate: input.estimateDate,
          notes: "",
          createdAt,
        }),
        created_at: createdAt,
      })
      .select("*")
      .single();
    if (versionError) throw versionError;

    const budgetVersion = budgetVersionFromRow(versionRow as DbRow);
    const lineRows = input.lineItems.map((lineItem) =>
      budgetLineItemToRow({
        id: "",
        budgetId: budget.id,
        budgetVersionId: budgetVersion.id,
        projectId: project.id,
        sourceFileId: input.sourceFileId,
        ...lineItem,
        createdAt,
        updatedAt: createdAt,
      }),
    );
    const { data: insertedLineRows, error: lineError } = await client
      .from("budget_line_items")
      .insert(lineRows)
      .select("*");
    if (lineError) throw lineError;
    const savedLineItems = ((insertedLineRows ?? []) as DbRow[]).map(budgetLineItemFromRow);
    await queueBudgetLineItemsForReview(user, project, budget, savedLineItems);

    await addAudit(user, project.id, "budgetscope.import.saved", {
      lineItemCount: input.lineItems.length,
      sourceType: input.sourceType,
    });
    logEvent("info", "budgetscope.import.saved", {
      userId: workspace.userId,
      projectId: project.id,
      lineItemCount: input.lineItems.length,
      storage: "supabase",
    });
    return { budget, budgetVersion, lineItemCount: input.lineItems.length };
  }

  const budget: BudgetRecord = {
    id: id("budget"),
    projectId: project.id,
    userId: workspace.userId,
    companyId: workspace.companyId,
    budgetName: input.budgetName,
    budgetVersion: input.budgetVersion,
    budgetType: input.budgetType,
    sourceType: input.sourceType,
    city: input.city,
    state: input.state,
    region: input.region,
    projectType: input.projectType,
    assetType: input.assetType,
    renovationOrNew: input.renovationOrNew,
    estimateDate: input.estimateDate,
    grossSquareFeet: input.grossSquareFeet,
    rentableSquareFeet: input.rentableSquareFeet,
    unitCount: input.unitCount,
    buildingCount: input.buildingCount,
    fundingType: input.fundingType,
    occupiedOrVacant: input.occupiedOrVacant,
    sourceFileId: input.sourceFileId,
    consentStatus: input.consentStatus,
    createdAt,
    updatedAt: createdAt,
  };
  const budgetVersion: BudgetVersionRecord = {
    id: id("budget_version"),
    budgetId: budget.id,
    projectId: project.id,
    versionName: input.budgetVersion || "Initial import",
    versionNumber: 1,
    sourceFileId: input.sourceFileId,
    uploadedByUserId: workspace.userId,
    estimateDate: input.estimateDate,
    notes: "",
    createdAt,
  };
  const lineItems = input.lineItems.map((lineItem) => ({
    id: id("budget_line_item"),
    budgetId: budget.id,
    budgetVersionId: budgetVersion.id,
    projectId: project.id,
    sourceFileId: input.sourceFileId,
    ...lineItem,
    createdAt,
    updatedAt: createdAt,
  }));

  const db = await readDb();
  db.budgets.push(budget);
  db.budgetVersions.push(budgetVersion);
  db.budgetLineItems.push(...lineItems);
  db.auditLogs.push(makeAudit(project, "budgetscope.import.saved", { lineItemCount: lineItems.length, sourceType: input.sourceType }));
  await writeDb(db);
  await queueBudgetLineItemsForReview(user, project, budget, lineItems);
  logEvent("info", "budgetscope.import.saved", {
    userId: workspace.userId,
    projectId: project.id,
    lineItemCount: lineItems.length,
    storage: "local",
  });
  return { budget, budgetVersion, lineItemCount: lineItems.length };
}

export async function listProjectBudgets(user: SessionUser, projectId: string): Promise<BudgetRecord[]> {
  const project = await getProject(user, projectId);
  if (!project) return [];

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("budgets")
      .select("*")
      .eq("project_id", project.id)
      .eq("user_id", project.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbRow[]).map(budgetFromRow);
  }

  const db = await readDb();
  return db.budgets
    .filter((budget) => budget.projectId === project.id && budget.userId === project.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listComparableBudgets(user: SessionUser): Promise<BudgetRecord[]> {
  const workspace = await ensureWorkspace(user);

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("budgets")
      .select("*")
      .eq("user_id", workspace.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbRow[]).map(budgetFromRow);
  }

  const db = await readDb();
  return db.budgets
    .filter((budget) => budget.userId === workspace.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function budgetByIdForUser(user: SessionUser, budgetId: string): Promise<BudgetRecord | null> {
  const workspace = await ensureWorkspace(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("budgets")
      .select("*")
      .eq("id", budgetId)
      .eq("user_id", workspace.userId)
      .maybeSingle();
    if (error) throw error;
    return data ? budgetFromRow(data as DbRow) : null;
  }

  const db = await readDb();
  return db.budgets.find((budget) => budget.id === budgetId && budget.userId === workspace.userId) ?? null;
}

async function latestBudgetVersionForBudget(user: SessionUser, budgetId: string): Promise<BudgetVersionRecord | null> {
  const workspace = await ensureWorkspace(user);
  if (shouldUseSupabase()) {
    const budget = await budgetByIdForUser(user, budgetId);
    if (!budget) return null;
    const { data, error } = await getSupabaseAdmin()
      .from("budget_versions")
      .select("*")
      .eq("budget_id", budgetId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? budgetVersionFromRow(data as DbRow) : null;
  }

  const db = await readDb();
  const budget = db.budgets.find((item) => item.id === budgetId && item.userId === workspace.userId);
  if (!budget) return null;
  return db.budgetVersions
    .filter((version) => version.budgetId === budgetId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export async function listBudgetLineItems(user: SessionUser, budgetId: string): Promise<BudgetLineItemRecord[]> {
  const budget = await budgetByIdForUser(user, budgetId);
  if (!budget) return [];

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("budget_line_items")
      .select("*")
      .eq("budget_id", budget.id)
      .order("row_number", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as DbRow[]).map(budgetLineItemFromRow);
  }

  const db = await readDb();
  return db.budgetLineItems
    .filter((item) => item.budgetId === budget.id)
    .sort((a, b) => a.rowNumber - b.rowNumber);
}

function budgetContext(budget: BudgetRecord) {
  return {
    grossSquareFeet: budget.grossSquareFeet,
    rentableSquareFeet: budget.rentableSquareFeet,
    unitCount: budget.unitCount,
    buildingCount: budget.buildingCount,
  };
}

function metricPer(total: number | null, basis: number | null): number | null {
  if (!total || !basis || basis <= 0) return null;
  return Number((total / basis).toFixed(2));
}

function isBenchmarkConsentEligible(project: Project, budget?: BudgetRecord | null): boolean {
  return Boolean(
    project.allowedForAnonymizedLearning &&
      !project.excludedFromBenchmarking &&
      !project.deleteDocumentsAfterReport &&
      project.consentStatus === "granted" &&
      (!budget || budget.consentStatus === "granted"),
  );
}

function budgetLineItemSummary(item: BudgetLineItemRecord): string {
  const price = item.unitCost === null ? "unit cost not set" : `unit cost ${item.unitCost}`;
  const totalCost = item.totalCost === null ? "total not set" : `total ${item.totalCost}`;
  return `${item.normalizedTrade}: ${item.rawDescription || "No description"}; ${price}; ${totalCost}`;
}

async function queueBudgetLineItemsForReview(
  user: SessionUser,
  project: Project,
  budget: BudgetRecord,
  lineItems: BudgetLineItemRecord[],
): Promise<void> {
  if (!isBenchmarkConsentEligible(project, budget) || lineItems.length === 0) return;
  const createdAt = now();
  const records = lineItems.map((item) => ({
    id: id("data_review"),
    sourceType: "pricing",
    sourceTable: "budget_line_items",
    sourceRecordId: item.id,
    projectId: project.id,
    userId: project.userId,
    companyId: project.companyId,
    extractedValueSummary: budgetLineItemSummary(item),
    normalizedTrade: item.normalizedTrade,
    normalizedScopeCategory: item.normalizedScopeCategory || item.normalizedTrade,
    normalizedScopeSubcategory: item.normalizedScopeSubcategory,
    confidenceScore: item.confidenceScore,
    reviewStatus: "pending_review" as const,
    reviewedByAdminId: null,
    reviewedAt: null,
    adminNotes: "",
    reviewMetadata: {
      budgetId: budget.id,
      budgetName: budget.budgetName,
      consentStatus: budget.consentStatus,
      sourceType: budget.sourceType,
    },
    createdAt,
  }));

  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin()
      .from("data_review_queue")
      .insert(records.map(dataReviewQueueToRow));
    if (error) throw error;
    return;
  }

  const db = await readDb();
  const existingSourceIds = new Set(db.dataReviewQueue.map((item) => `${item.sourceTable}:${item.sourceRecordId}`));
  db.dataReviewQueue.push(...records.filter((item) => !existingSourceIds.has(`${item.sourceTable}:${item.sourceRecordId}`)));
  await writeDb(db);
  logEvent("info", "data_review.queue.created", {
    userId: user.id,
    projectId: project.id,
    count: records.length,
    sourceTable: "budget_line_items",
  });
}

function comparisonReportFromResults(results: BudgetComparisonResultRecord[]): BudgetComparisonReport {
  const priorTotalCost = results.reduce((sum, result) => sum + (result.priorTotalCost ?? 0), 0);
  const currentTotalCost = results.reduce((sum, result) => sum + (result.currentTotalCost ?? 0), 0);
  const percentVariance = priorTotalCost === 0 ? (currentTotalCost === 0 ? null : 100) : Number((((currentTotalCost - priorTotalCost) / Math.abs(priorTotalCost)) * 100).toFixed(2));
  const byTrade = new Map<string, BudgetComparisonResultRecord[]>();
  for (const result of results) {
    byTrade.set(result.normalizedTrade, [...(byTrade.get(result.normalizedTrade) ?? []), result]);
  }
  const tradeSummaries = Array.from(byTrade.entries()).map(([normalizedTrade, lines]) => {
    const priorTotal = Number(lines.reduce((sum, line) => sum + (line.priorTotalCost ?? 0), 0).toFixed(2));
    const currentTotal = Number(lines.reduce((sum, line) => sum + (line.currentTotalCost ?? 0), 0).toFixed(2));
    const totalCostVariance = Number((currentTotal - priorTotal).toFixed(2));
    const totalCostVariancePercent = priorTotal === 0 ? (currentTotal === 0 ? null : 100) : Number(((totalCostVariance / Math.abs(priorTotal)) * 100).toFixed(2));
    return {
      normalizedTrade,
      priorTotalCost: priorTotal,
      currentTotalCost: currentTotal,
      totalCostVariance,
      totalCostVariancePercent,
      priorCostPerGsf: lines[0]?.priorCostPerGsf ?? null,
      currentCostPerGsf: lines[0]?.currentCostPerGsf ?? null,
      priorCostPerRsf: lines[0]?.priorCostPerRsf ?? null,
      currentCostPerRsf: lines[0]?.currentCostPerRsf ?? null,
      priorCostPerUnit: lines[0]?.priorCostPerUnit ?? null,
      currentCostPerUnit: lines[0]?.currentCostPerUnit ?? null,
      priorCostPerBuilding: lines[0]?.priorCostPerBuilding ?? null,
      currentCostPerBuilding: lines[0]?.currentCostPerBuilding ?? null,
      priorShareOfTotal: priorTotalCost > 0 ? Number(((priorTotal / priorTotalCost) * 100).toFixed(2)) : null,
      currentShareOfTotal: currentTotalCost > 0 ? Number(((currentTotal / currentTotalCost) * 100).toFixed(2)) : null,
      likelyVarianceDriver: [...lines].sort((a, b) => Math.abs((b.totalCostVariance ?? 0)) - Math.abs((a.totalCostVariance ?? 0)))[0]?.reasonForVariance ?? "No line item variance.",
      riskLevel: totalCostVariancePercent !== null && Math.abs(totalCostVariancePercent) >= 25 ? "High" as const : totalCostVariancePercent !== null && Math.abs(totalCostVariancePercent) >= 10 ? "Medium" as const : totalCostVariance !== 0 ? "Low" as const : "Info" as const,
    };
  }).sort((a, b) => Math.abs(b.totalCostVariance) - Math.abs(a.totalCostVariance));
  const sorted = [...results].sort((a, b) => Math.abs((b.totalCostVariance ?? 0)) - Math.abs((a.totalCostVariance ?? 0)));
  const questions = sorted.map((line) => line.recommendedQuestion).filter((question, index, list) => question && list.indexOf(question) === index).slice(0, 8);
  return {
    executiveSummary: {
      priorTotalCost: Number(priorTotalCost.toFixed(2)),
      currentTotalCost: Number(currentTotalCost.toFixed(2)),
      totalProjectCostVariance: Number((currentTotalCost - priorTotalCost).toFixed(2)),
      totalProjectPercentVariance: percentVariance,
      priorCostPerGsf: null,
      currentCostPerGsf: null,
      priorCostPerRsf: null,
      currentCostPerRsf: null,
      priorCostPerUnit: null,
      currentCostPerUnit: null,
      priorCostPerBuilding: null,
      currentCostPerBuilding: null,
      biggestIncreases: [...results].filter((line) => (line.totalCostVariance ?? 0) > 0).sort((a, b) => (b.totalCostVariance ?? 0) - (a.totalCostVariance ?? 0)).slice(0, 5),
      biggestDecreases: [...results].filter((line) => (line.totalCostVariance ?? 0) < 0).sort((a, b) => (a.totalCostVariance ?? 0) - (b.totalCostVariance ?? 0)).slice(0, 5),
      mostImportantQuestions: questions,
    },
    tradeSummaries,
    lineResults: sorted,
    newScope: results.filter((line) => line.riskFlag === "new_current_line_item"),
    missingScope: results.filter((line) => line.riskFlag === "missing_prior_line_item"),
    changedUnits: results.filter((line) => line.riskFlag === "changed_unit_of_measure"),
    possibleDuplicates: results.filter((line) => line.riskFlag === "possible_duplicate_line_item"),
    pricingQuestions: questions,
  };
}

async function updateProjectMemoryForBudgetComparison(
  user: SessionUser,
  project: Project,
  comparison: BudgetComparisonRecord,
  report: BudgetComparisonReport,
): Promise<void> {
  const existing = (await getProjectMemory(user, project.id)) ?? (await upsertProjectMemory(user, project));
  const topQuestions = report.executiveSummary.mostImportantQuestions.slice(0, 5);
  const topTrade = report.tradeSummaries[0];
  const pricingMemory = [
    `Budget comparison: ${comparison.comparisonName}`,
    `Current total ${report.executiveSummary.currentTotalCost}`,
    `Prior total ${report.executiveSummary.priorTotalCost}`,
    `Variance ${report.executiveSummary.totalProjectCostVariance}`,
    topTrade ? `Top trade variance: ${topTrade.normalizedTrade} ${topTrade.totalCostVariance}` : "",
  ].filter(Boolean).join(" | ");
  const openQuestions = topQuestions.length > 0 ? topQuestions.join(" | ") : existing.openQuestionsSummary;
  const lastUpdatedAt = now();

  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin()
      .from("project_memory")
      .upsert(
        {
          project_id: project.id,
          project_profile_summary: existing.projectProfileSummary,
          known_scope_summary: existing.knownScopeSummary,
          pricing_memory_summary: pricingMemory,
          contract_memory_summary: existing.contractMemorySummary,
          open_questions_summary: openQuestions,
          top_risks_summary: existing.topRisksSummary,
          decisions_summary: existing.decisionsSummary,
          lessons_learned_summary: existing.lessonsLearnedSummary,
          last_updated_at: lastUpdatedAt,
        },
        { onConflict: "project_id" },
      );
    if (error) throw error;
    return;
  }

  const db = await readDb();
  const record: ProjectMemoryRecord = {
    ...existing,
    pricingMemorySummary: pricingMemory,
    openQuestionsSummary: openQuestions,
    lastUpdatedAt,
  };
  db.projectMemory = db.projectMemory.filter((item) => item.projectId !== project.id);
  db.projectMemory.push(record);
  await writeDb(db);
}

export async function saveBudgetComparison(
  user: SessionUser,
  projectId: string,
  input: {
    currentBudgetId: string;
    priorBudgetId: string;
    comparisonName: string;
    comparisonType: string;
  },
): Promise<SavedBudgetComparison> {
  const workspace = await ensureWorkspace(user);
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");
  if (project.userId !== workspace.userId || project.organizationId !== workspace.organizationId) {
    throw new Error("Project access denied");
  }
  if (input.currentBudgetId === input.priorBudgetId) {
    throw new Error("Choose two different budgets to compare.");
  }

  const [currentBudget, priorBudget] = await Promise.all([
    budgetByIdForUser(user, input.currentBudgetId),
    budgetByIdForUser(user, input.priorBudgetId),
  ]);
  if (!currentBudget || !priorBudget) throw new Error("One of the selected budgets could not be found.");

  const [currentVersion, priorVersion, currentLineItems, priorLineItems] = await Promise.all([
    latestBudgetVersionForBudget(user, currentBudget.id),
    latestBudgetVersionForBudget(user, priorBudget.id),
    listBudgetLineItems(user, currentBudget.id),
    listBudgetLineItems(user, priorBudget.id),
  ]);
  if (currentLineItems.length === 0 || priorLineItems.length === 0) {
    throw new Error("Both selected budgets need saved line items before comparison.");
  }

  const report = compareBudgets({
    currentBudgetId: currentBudget.id,
    priorBudgetId: priorBudget.id,
    currentBudgetVersionId: currentVersion?.id ?? null,
    priorBudgetVersionId: priorVersion?.id ?? null,
    currentContext: budgetContext(currentBudget),
    priorContext: budgetContext(priorBudget),
    currentLineItems,
    priorLineItems,
  });
  const createdAt = now();
  const comparison: BudgetComparisonRecord = {
    id: id("budget_comparison"),
    projectId: project.id,
    userId: workspace.userId,
    companyId: workspace.companyId,
    currentBudgetId: currentBudget.id,
    priorBudgetId: priorBudget.id,
    currentBudgetVersionId: currentVersion?.id ?? null,
    priorBudgetVersionId: priorVersion?.id ?? null,
    comparisonName: input.comparisonName || `${currentBudget.budgetName} vs ${priorBudget.budgetName}`,
    comparisonType: input.comparisonType || "budget-to-budget",
    createdAt,
    updatedAt: createdAt,
  };
  const results: BudgetComparisonResultRecord[] = report.lineResults.map((line) => ({
    id: id("budget_comparison_result"),
    budgetComparisonId: comparison.id,
    ...line,
    createdAt,
  }));

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data: comparisonRow, error: comparisonError } = await client
      .from("budget_comparisons")
      .insert({
        project_id: comparison.projectId,
        user_id: comparison.userId,
        company_id: comparison.companyId,
        current_budget_id: comparison.currentBudgetId,
        prior_budget_id: comparison.priorBudgetId,
        current_budget_version_id: comparison.currentBudgetVersionId,
        prior_budget_version_id: comparison.priorBudgetVersionId,
        comparison_name: comparison.comparisonName,
        comparison_type: comparison.comparisonType,
        created_at: comparison.createdAt,
        updated_at: comparison.updatedAt,
      })
      .select("*")
      .single();
    if (comparisonError) throw comparisonError;
    const savedComparison = budgetComparisonFromRow(comparisonRow as DbRow);
    const supabaseResults = results.map((result) => ({
      ...budgetComparisonResultToRow({ ...result, budgetComparisonId: savedComparison.id }),
      budget_comparison_id: savedComparison.id,
    }));
    const { error: resultError } = await client.from("budget_comparison_results").insert(supabaseResults);
    if (resultError) throw resultError;
    await addAudit(user, project.id, "budgetscope.comparison.generated", {
      currentBudgetId: currentBudget.id,
      priorBudgetId: priorBudget.id,
      resultCount: results.length,
    });
    await updateProjectMemoryForBudgetComparison(user, project, savedComparison, report);
    return { comparison: savedComparison, results: results.map((result) => ({ ...result, budgetComparisonId: savedComparison.id })), report };
  }

  const db = await readDb();
  db.budgetComparisons.push(comparison);
  db.budgetComparisonResults.push(...results);
  db.auditLogs.push(makeAudit(project, "budgetscope.comparison.generated", {
    currentBudgetId: currentBudget.id,
    priorBudgetId: priorBudget.id,
    resultCount: results.length,
  }));
  await writeDb(db);
  await updateProjectMemoryForBudgetComparison(user, project, comparison, report);
  return { comparison, results, report };
}

export async function listProjectBudgetComparisons(user: SessionUser, projectId: string): Promise<BudgetComparisonRecord[]> {
  const project = await getProject(user, projectId);
  if (!project) return [];

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("budget_comparisons")
      .select("*")
      .eq("project_id", project.id)
      .eq("user_id", project.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbRow[]).map(budgetComparisonFromRow);
  }

  const db = await readDb();
  return db.budgetComparisons
    .filter((comparison) => comparison.projectId === project.id && comparison.userId === project.userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBudgetComparisonReport(user: SessionUser, comparisonId: string): Promise<SavedBudgetComparison | null> {
  const workspace = await ensureWorkspace(user);

  if (shouldUseSupabase()) {
    const { data: comparisonData, error: comparisonError } = await getSupabaseAdmin()
      .from("budget_comparisons")
      .select("*")
      .eq("id", comparisonId)
      .eq("user_id", workspace.userId)
      .maybeSingle();
    if (comparisonError) throw comparisonError;
    if (!comparisonData) return null;
    const comparison = budgetComparisonFromRow(comparisonData as DbRow);
    const { data: resultData, error: resultError } = await getSupabaseAdmin()
      .from("budget_comparison_results")
      .select("*")
      .eq("budget_comparison_id", comparison.id)
      .order("created_at", { ascending: true });
    if (resultError) throw resultError;
    const results = ((resultData ?? []) as DbRow[]).map(budgetComparisonResultFromRow);
    const [currentBudget, priorBudget, currentLineItems, priorLineItems] = await Promise.all([
      budgetByIdForUser(user, comparison.currentBudgetId),
      budgetByIdForUser(user, comparison.priorBudgetId),
      listBudgetLineItems(user, comparison.currentBudgetId),
      listBudgetLineItems(user, comparison.priorBudgetId),
    ]);
    const report = currentBudget && priorBudget
      ? compareBudgets({
          currentBudgetId: currentBudget.id,
          priorBudgetId: priorBudget.id,
          currentBudgetVersionId: comparison.currentBudgetVersionId,
          priorBudgetVersionId: comparison.priorBudgetVersionId,
          currentContext: budgetContext(currentBudget),
          priorContext: budgetContext(priorBudget),
          currentLineItems,
          priorLineItems,
        })
      : comparisonReportFromResults(results);
    return { comparison, results, report };
  }

  const db = await readDb();
  const comparison = db.budgetComparisons.find((item) => item.id === comparisonId && item.userId === workspace.userId);
  if (!comparison) return null;
  const results = db.budgetComparisonResults.filter((result) => result.budgetComparisonId === comparison.id);
  const currentBudget = db.budgets.find((budget) => budget.id === comparison.currentBudgetId && budget.userId === workspace.userId);
  const priorBudget = db.budgets.find((budget) => budget.id === comparison.priorBudgetId && budget.userId === workspace.userId);
  const report = currentBudget && priorBudget
    ? compareBudgets({
        currentBudgetId: currentBudget.id,
        priorBudgetId: priorBudget.id,
        currentBudgetVersionId: comparison.currentBudgetVersionId,
        priorBudgetVersionId: comparison.priorBudgetVersionId,
        currentContext: budgetContext(currentBudget),
        priorContext: budgetContext(priorBudget),
        currentLineItems: db.budgetLineItems.filter((item) => item.budgetId === currentBudget.id),
        priorLineItems: db.budgetLineItems.filter((item) => item.budgetId === priorBudget.id),
      })
    : comparisonReportFromResults(results);
  return { comparison, results, report };
}

export async function deleteUploadedFile(user: SessionUser, projectId: string, fileId: string): Promise<void> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");
  const file = project.uploadedFiles.find((item) => item.id === fileId);

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { error } = await client
      .from("documents")
      .delete()
      .eq("id", fileId)
      .eq("project_id", projectId)
      .eq("user_id", project.userId);
    if (error) throw error;

    const bucket = storageBucket();
    if (bucket && file && !file.storagePath.startsWith("metadata-only/")) {
      await client.storage.from(bucket).remove([file.storagePath]);
    }
    await addAudit(user, projectId, "file.deleted", {});
    return;
  }

  const nextProject = {
    ...project,
    uploadedFiles: project.uploadedFiles.filter((item) => item.id !== fileId),
    documents: DOCUMENT_CATALOG.map((document) => ({
      ...document,
      available: project.uploadedFiles.some((item) => item.id !== fileId && item.documentId === document.id),
    })),
  };
  await saveProject(user, nextProject, "file.deleted");
  if (file) {
    await fs.rm(path.join(UPLOAD_DIR, file.storagePath), { force: true });
  }
}

export async function purgeProjectUploadedBinaries(user: SessionUser, projectId: string): Promise<void> {
  const project = await getProject(user, projectId);
  if (!project || project.uploadedFiles.length === 0) return;

  if (shouldUseSupabase()) {
    const bucket = storageBucket();
    if (!bucket) {
      logEvent("warn", "upload.binary_purge_skipped", { projectId, storage: "supabase" });
      return;
    }

    const paths = project.uploadedFiles
      .map((file) => file.storagePath)
      .filter((storagePath) => storagePath && !storagePath.startsWith("metadata-only/"));
    if (paths.length > 0) {
      await getSupabaseAdmin().storage.from(bucket).remove(paths);
    }
    await addAudit(user, projectId, "file.binaries.purged", { count: paths.length });
    logEvent("info", "upload.binary_purge.completed", { projectId, count: paths.length, storage: "supabase" });
    return;
  }

  await Promise.all(
    project.uploadedFiles.map((file) =>
      fs.rm(path.join(UPLOAD_DIR, file.storagePath), { force: true }),
    ),
  );
  await addAudit(user, projectId, "file.binaries.purged", { count: project.uploadedFiles.length });
  logEvent("info", "upload.binary_purge.completed", { projectId, count: project.uploadedFiles.length, storage: "local" });
}

export async function deleteProject(user: SessionUser, projectId: string): Promise<void> {
  const workspace = await ensureWorkspace(user);
  const project = await getProject(user, projectId);
  if (!project) return;

  if (shouldUseSupabase()) {
    const bucket = storageBucket();
    if (bucket && project.uploadedFiles.length > 0) {
      await getSupabaseAdmin().storage.from(bucket).remove(project.uploadedFiles.map((file) => file.storagePath));
    }
    const { error } = await getSupabaseAdmin()
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", workspace.userId)
      .eq("organization_id", workspace.organizationId);
    if (error) throw error;
    await addAudit(user, null, "project.deleted", { projectId });
    return;
  }

  const db = await readDb();
  db.projects = db.projects.filter((item) => item.id !== projectId);
  db.reviews = db.reviews.filter((item) => item.projectId !== projectId);
  db.auditLogs.push(makeAudit(project, "project.deleted", { projectName: project.name }));
  await writeDb(db);
  await fs.rm(path.join(UPLOAD_DIR, workspace.organizationId, projectId), { recursive: true, force: true });
}

export async function saveIntakeAnswers(user: SessionUser, projectId: string, answers: IntakeAnswer[]): Promise<Project> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    if (answers.length > 0) {
      const { error } = await client.from("intake_answers").upsert(
        answers.map((answer) => ({
          project_id: project.id,
          question_key: answer.questionKey,
          question_text: answer.questionText,
          answer: answer.answer,
          updated_at: now(),
        })),
        { onConflict: "project_id,question_key" },
      );
      if (error) throw error;
    }
    return saveProject(user, { ...project, intakeAnswers: answers, status: "processing" }, "intake.saved");
  }

  return saveProject(user, { ...project, intakeAnswers: answers, status: "processing" }, "intake.saved");
}

function summarizeList(items: string[], emptyState: string, limit = 5): string {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);
  if (cleanItems.length === 0) return emptyState;
  return cleanItems.slice(0, limit).join(" | ");
}

function projectMemoryFromReview(project: Project, review?: RiskReview): Omit<ProjectMemoryRecord, "id" | "lastUpdatedAt"> {
  const location = [project.city, project.state, project.region].filter(Boolean).join(", ") || "Location not set";
  const fileCategories = Array.from(
    new Set(project.uploadedFiles.map((file) => file.backendDocumentCategory ?? file.documentCategory ?? file.documentId)),
  );
  const knownScopeItems = [
    project.tradeType ? `Trade/scope: ${project.tradeType}` : "",
    project.notesText ? "User notes are present." : "",
    fileCategories.length > 0 ? `Uploaded categories: ${fileCategories.join(", ")}` : "",
  ];
  const pricingItems = [
    project.contractAmount === null ? "" : `Contract amount entered: ${project.contractAmount}`,
    ...((review?.issueLog ?? [])
      .filter((issue) => /cost|price|unit|allowance|budget|tax|freight|escalation/i.test(`${issue.issueTitle} ${issue.potentialCostImpact}`))
      .map((issue) => `${issue.issueTitle}: ${issue.potentialCostImpact}`)),
  ];
  const contractItems = [
    project.subcontractText ? "Contract/subcontract text is present." : "",
    project.bidText ? "Bid/proposal text is present." : "",
    project.exclusionsText ? "Exclusion/assumption text is present." : "",
    ...((review?.comparisons ?? []).map((comparison) => `${comparison.item}: ${comparison.conflict}`)),
  ];
  const questionItems = [
    ...((review?.questions ?? []).map((question) => question.question)),
    ...((review?.missingDocuments ?? []).map((document) => `Missing document: ${document.document}`)),
  ];
  const riskItems = (review?.issueLog ?? []).map((issue) => `${issue.riskLevel}: ${issue.issueTitle}`);
  const decisionItems = [
    project.excludedFromBenchmarking ? "Project excluded from benchmarking." : "",
    project.allowedForAnonymizedLearning ? "Project allowed for anonymized learning." : "",
    project.deleteDocumentsAfterReport ? "Source files marked for deletion after report generation." : "",
    project.status === "report-ready" ? "Risk report generated." : "",
  ];
  return {
    projectId: project.id,
    projectProfileSummary: `${project.name || "Untitled project"}; ${project.projectType}; ${location}.`,
    knownScopeSummary: summarizeList(knownScopeItems, "No scope has been established yet."),
    pricingMemorySummary: summarizeList(pricingItems, "No pricing memory extracted yet."),
    contractMemorySummary: summarizeList(contractItems, "No contract memory extracted yet."),
    openQuestionsSummary: summarizeList(questionItems, "No open questions captured yet.", 8),
    topRisksSummary: summarizeList(riskItems, "No top risks captured yet.", 8),
    decisionsSummary: summarizeList(decisionItems, "No explicit decision log stored yet."),
    lessonsLearnedSummary: "No lessons learned stored yet.",
  };
}

function projectMemoryFromRow(row: DbRow, fallbackProjectId = ""): ProjectMemoryRecord {
  return {
    id: asString(row.id),
    projectId: asString(row.project_id, fallbackProjectId),
    projectProfileSummary: asString(row.project_profile_summary),
    knownScopeSummary: asString(row.known_scope_summary),
    pricingMemorySummary: asString(row.pricing_memory_summary),
    contractMemorySummary: asString(row.contract_memory_summary),
    openQuestionsSummary: asString(row.open_questions_summary),
    topRisksSummary: asString(row.top_risks_summary),
    decisionsSummary: asString(row.decisions_summary),
    lessonsLearnedSummary: asString(row.lessons_learned_summary),
    lastUpdatedAt: asString(row.last_updated_at, now()),
  };
}

export async function getProjectMemory(user: SessionUser, projectId: string): Promise<ProjectMemoryRecord | null> {
  const project = await getProject(user, projectId);
  if (!project) return null;

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("project_memory")
      .select("*")
      .eq("project_id", project.id)
      .maybeSingle();
    if (error) throw error;
    return data ? projectMemoryFromRow(data as DbRow, project.id) : null;
  }

  const db = await readDb();
  return db.projectMemory.find((item) => item.projectId === project.id) ?? null;
}

export async function upsertProjectMemory(user: SessionUser, project: Project, review?: RiskReview): Promise<ProjectMemoryRecord> {
  const workspace = await ensureWorkspace(user);
  if (project.userId !== workspace.userId || project.organizationId !== workspace.organizationId) {
    throw new Error("Project access denied");
  }

  const lastUpdatedAt = now();
  const memoryInput = projectMemoryFromReview(project, review);

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("project_memory")
      .upsert(
        {
          project_id: project.id,
          project_profile_summary: memoryInput.projectProfileSummary,
          known_scope_summary: memoryInput.knownScopeSummary,
          pricing_memory_summary: memoryInput.pricingMemorySummary,
          contract_memory_summary: memoryInput.contractMemorySummary,
          open_questions_summary: memoryInput.openQuestionsSummary,
          top_risks_summary: memoryInput.topRisksSummary,
          decisions_summary: memoryInput.decisionsSummary,
          lessons_learned_summary: memoryInput.lessonsLearnedSummary,
          last_updated_at: lastUpdatedAt,
        },
        { onConflict: "project_id" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return projectMemoryFromRow(data as DbRow, project.id);
  }

  const db = await readDb();
  const existing = db.projectMemory.find((item) => item.projectId === project.id);
  const record: ProjectMemoryRecord = {
    id: existing?.id ?? id("memory"),
    ...memoryInput,
    lastUpdatedAt,
  };
  db.projectMemory = db.projectMemory.filter((item) => item.projectId !== project.id);
  db.projectMemory.push(record);
  await writeDb(db);
  return record;
}

export async function saveReview(
  user: SessionUser,
  project: Project,
  rawAnalysisJson: unknown,
  intelligenceGraph?: IntelligenceGraph,
  memoryReview?: RiskReview,
): Promise<StoredReview> {
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    await client.from("reviews").delete().eq("project_id", project.id).eq("user_id", project.userId);
    const payload = {
      project_id: project.id,
      organization_id: project.organizationId,
      user_id: project.userId,
      status: "report-ready",
      raw_analysis_json: rawAnalysisJson,
      overall_summary: "Structured subcontract risk review generated.",
      risk_score: project.riskScore ?? 0,
      risk_level: project.riskLevel,
      signing_recommendation:
        typeof rawAnalysisJson === "object" && rawAnalysisJson && "signingRecommendation" in rawAnalysisJson
          ? String(rawAnalysisJson.signingRecommendation)
          : "",
      intelligence_graph: intelligenceGraph,
    };
    let result = await client.from("reviews").insert(payload).select("*").single();
    if (result.error && result.error.message.includes("intelligence_graph")) {
      const fallbackPayload: Record<string, unknown> = { ...payload };
      delete fallbackPayload.intelligence_graph;
      result = await client.from("reviews").insert(fallbackPayload).select("*").single();
    }
    if (result.error) throw result.error;

    await saveProject(user, project, "report.generated");
    await upsertProjectMemory(user, project, memoryReview);
    const row = result.data as DbRow;
    return {
      id: asString(row.id),
      projectId: project.id,
      organizationId: project.organizationId,
      userId: project.userId,
      status: "report-ready",
      rawAnalysisJson,
      overallSummary: asString(row.overall_summary),
      riskScore: Number(row.risk_score ?? 0),
      riskLevel: asString(row.risk_level),
      signingRecommendation: asString(row.signing_recommendation),
      intelligenceGraph,
      createdAt: asString(row.created_at, now()),
      updatedAt: asString(row.updated_at, now()),
    };
  }

  const db = await readDb();
  const review = {
    id: id("review"),
    projectId: project.id,
    organizationId: project.organizationId,
    userId: project.userId,
    status: "report-ready" as const,
    rawAnalysisJson,
    overallSummary: "Structured subcontract risk review generated.",
    riskScore: project.riskScore ?? 0,
    riskLevel: project.riskLevel,
    signingRecommendation:
      typeof rawAnalysisJson === "object" && rawAnalysisJson && "signingRecommendation" in rawAnalysisJson
        ? String(rawAnalysisJson.signingRecommendation)
        : "",
    intelligenceGraph,
    createdAt: now(),
    updatedAt: now(),
  };
  db.reviews = db.reviews.filter((item) => item.projectId !== project.id);
  db.reviews.push(review);
  db.auditLogs.push(
    makeAudit(project, "report.generated", {
      riskScore: project.riskScore,
      riskLevel: project.riskLevel,
      intelligenceNodes: intelligenceGraph?.nodes.length ?? 0,
      intelligenceEdges: intelligenceGraph?.edges.length ?? 0,
    }),
  );
  await writeDb(db);
  await saveProject(user, project, "report.generated");
  await upsertProjectMemory(user, project, memoryReview);
  return review;
}

export async function getLatestReview(user: SessionUser, projectId: string): Promise<StoredReview | null> {
  const project = await getProject(user, projectId);
  if (!project) return null;

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("reviews")
      .select("*")
      .eq("project_id", project.id)
      .eq("user_id", project.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as DbRow;
    return {
      id: asString(row.id),
      projectId: project.id,
      organizationId: project.organizationId,
      userId: project.userId,
      status: asString(row.status, "report-ready") as ProjectStatus,
      rawAnalysisJson: row.raw_analysis_json,
      overallSummary: asString(row.overall_summary),
      riskScore: Number(row.risk_score ?? 0),
      riskLevel: asString(row.risk_level),
      signingRecommendation: asString(row.signing_recommendation),
      intelligenceGraph: row.intelligence_graph as IntelligenceGraph | undefined,
      createdAt: asString(row.created_at, now()),
      updatedAt: asString(row.updated_at, now()),
    };
  }

  const db = await readDb();
  return (
    db.reviews
      .filter((review) => review.projectId === project.id && review.userId === project.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

export async function listIntelligenceGraphs(
  user: SessionUser,
  options: { excludeProjectId?: string } = {},
): Promise<IntelligenceGraph[]> {
  const workspace = await ensureWorkspace(user);

  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("reviews")
      .select("project_id, intelligence_graph, created_at")
      .eq("user_id", workspace.userId)
      .eq("organization_id", workspace.organizationId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as DbRow[])
      .filter((row) => !options.excludeProjectId || asString(row.project_id) !== options.excludeProjectId)
      .map((row) => row.intelligence_graph as IntelligenceGraph | null)
      .filter((graph): graph is IntelligenceGraph => Boolean(graph));
  }

  const db = await readDb();
  const graphs: IntelligenceGraph[] = [];
  for (const review of db.reviews) {
    if (review.userId !== workspace.userId || review.organizationId !== workspace.organizationId) continue;
    if (options.excludeProjectId && review.projectId === options.excludeProjectId) continue;
    if (review.intelligenceGraph) graphs.push(review.intelligenceGraph);
  }
  return graphs.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export async function deleteReports(user: SessionUser, projectId: string): Promise<void> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");

  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin().from("reviews").delete().eq("project_id", projectId).eq("user_id", project.userId);
    if (error) throw error;
    await saveProject(user, { ...project, status: "questions-needed", riskScore: null, riskLevel: "" }, "report.deleted");
    return;
  }

  const db = await readDb();
  db.reviews = db.reviews.filter((review) => review.projectId !== projectId);
  db.auditLogs.push(makeAudit(project, "report.deleted", {}));
  await writeDb(db);
  await saveProject(user, { ...project, status: "questions-needed", riskScore: null, riskLevel: "" }, "report.deleted");
}

function oneWeekAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

async function supabaseCount(table: string): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

async function supabaseUserCount(filter: "active" | "new-this-week"): Promise<number> {
  let query = getSupabaseAdmin()
    .from("users")
    .select("id", { count: "exact", head: true });
  if (filter === "active") query = query.not("last_login_at", "is", null);
  if (filter === "new-this-week") query = query.gte("created_at", oneWeekAgoIso());
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function supabaseDataReviewCount(status: DataReviewStatus): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("data_review_queue")
    .select("id", { count: "exact", head: true })
    .eq("review_status", status);
  if (error) throw error;
  return count ?? 0;
}

async function supabaseFilteredCount(table: string, filters: Record<string, string>): Promise<number> {
  let query = getSupabaseAdmin()
    .from(table)
    .select("id", { count: "exact", head: true });
  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function adminUserRowFromRecord(user: UserRecord): AdminUserRow {
  return {
    id: user.id,
    auth0UserId: user.auth0UserId,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    accountType: user.accountType,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

function topCounts(values: string[], limit = 5): AdminAnalyticsItem[] {
  const counts = new Map<string, number>();
  for (const value of values.map((item) => item.trim()).filter(Boolean)) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

function moduleForUsageEvent(eventType: UsageEventType): string {
  if (eventType.startsWith("budget_")) return "BudgetScope";
  if (eventType.includes("document")) return "Document intake";
  if (eventType.includes("report") || eventType === "pdf_downloaded") return "Reports";
  if (eventType.includes("admin_data") || eventType.includes("pricing")) return "Admin intelligence";
  if (eventType.includes("feedback")) return "Feedback";
  if (eventType.includes("project")) return "Projects";
  return "Core app";
}

function localAdminAnalytics(db: Database): AdminDashboardAnalytics {
  const companyNames = new Map(db.companies.map((company) => [company.id, company.companyName]));
  const userNames = new Map(db.users.map((user) => [user.id, user.name || user.email]));
  return {
    mostActiveCompanies: topCounts(db.usageEvents.map((event) => companyNames.get(event.companyId) ?? event.companyId)),
    mostActiveUsers: topCounts(db.usageEvents.map((event) => userNames.get(event.userId) ?? event.userId)),
    mostUsedModules: topCounts(db.usageEvents.map((event) => moduleForUsageEvent(event.eventType))),
    mostCommonTrades: topCounts([...db.projects.map((project) => project.tradeType), ...db.companies.map((company) => company.trade)]),
    mostCommonProjectStates: topCounts(db.projects.map((project) => project.state)),
    mostCommonRiskCategories: topCounts(db.reviews.map((review) => review.riskLevel || "Unclassified")),
    userGrowthThisWeek: db.users.filter((item) => item.createdAt >= oneWeekAgoIso()).length,
    projectGrowthThisWeek: db.projects.filter((item) => item.createdAt >= oneWeekAgoIso()).length,
  };
}

export async function getAdminDashboardAnalytics(user: SessionUser): Promise<AdminDashboardAnalytics> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const [{ data: eventRows, error: eventError }, { data: userRows, error: userError }, { data: companyRows, error: companyError }, { data: projectRows, error: projectError }, { data: reviewRows, error: reviewError }] = await Promise.all([
      client.from("usage_events").select("user_id, company_id, event_type, created_at").order("created_at", { ascending: false }).limit(1000),
      client.from("users").select("id, email, name, created_at"),
      client.from("companies").select("id, company_name, trade"),
      client.from("projects").select("trade_type, state, created_at"),
      client.from("reviews").select("risk_level"),
    ]);
    if (eventError) throw eventError;
    if (userError) throw userError;
    if (companyError) throw companyError;
    if (projectError) throw projectError;
    if (reviewError) throw reviewError;
    const companyNames = new Map(((companyRows ?? []) as DbRow[]).map((company) => [asString(company.id), asString(company.company_name)]));
    const userNames = new Map(((userRows ?? []) as DbRow[]).map((profile) => [asString(profile.id), asString(profile.name, asString(profile.email))]));
    const events = ((eventRows ?? []) as DbRow[]).map((event) => ({
      userId: asString(event.user_id),
      companyId: asString(event.company_id),
      eventType: asString(event.event_type) as UsageEventType,
    }));
    return {
      mostActiveCompanies: topCounts(events.map((event) => companyNames.get(event.companyId) ?? event.companyId)),
      mostActiveUsers: topCounts(events.map((event) => userNames.get(event.userId) ?? event.userId)),
      mostUsedModules: topCounts(events.map((event) => moduleForUsageEvent(event.eventType))),
      mostCommonTrades: topCounts([...(projectRows ?? []).map((row) => asString((row as DbRow).trade_type)), ...(companyRows ?? []).map((row) => asString((row as DbRow).trade))]),
      mostCommonProjectStates: topCounts((projectRows ?? []).map((row) => asString((row as DbRow).state))),
      mostCommonRiskCategories: topCounts((reviewRows ?? []).map((row) => asString((row as DbRow).risk_level, "Unclassified"))),
      userGrowthThisWeek: ((userRows ?? []) as DbRow[]).filter((row) => asString(row.created_at) >= oneWeekAgoIso()).length,
      projectGrowthThisWeek: ((projectRows ?? []) as DbRow[]).filter((row) => asString(row.created_at) >= oneWeekAgoIso()).length,
    };
  }
  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "admin_analytics" });
  return localAdminAnalytics(db);
}

export async function getAdminDashboardMetrics(user: SessionUser): Promise<AdminDashboardMetrics> {
  await assertAdminStoreAccess(user);

  if (shouldUseSupabase()) {
    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      companiesAdded,
      projectsCreated,
      documentsUploaded,
      reportsGenerated,
      usageEventsCount,
      feedbackCount,
      dataReviewPending,
      dataReviewApproved,
      dataReviewRejected,
      highIntentLeads,
      budgetComparisonsGenerated,
      pricingRecordsPendingReview,
      approvedBenchmarkRecords,
    ] = await Promise.all([
      supabaseCount("users"),
      supabaseUserCount("active"),
      supabaseUserCount("new-this-week"),
      supabaseCount("companies"),
      supabaseCount("projects"),
      supabaseCount("documents"),
      supabaseCount("reviews"),
      supabaseCount("usage_events"),
      supabaseCount("feedback"),
      supabaseDataReviewCount("pending_review"),
      supabaseDataReviewCount("approved"),
      supabaseDataReviewCount("rejected"),
      supabaseFilteredCount("lead_scores", { lead_status: "High Intent" }),
      supabaseCount("budget_comparisons"),
      supabaseFilteredCount("data_review_queue", { source_type: "pricing", review_status: "pending_review" }),
      supabaseFilteredCount("pricing_benchmark_records", { review_status: "approved" }),
    ]);
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "admin_dashboard" });
    return {
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      companiesAdded,
      projectsCreated,
      documentsUploaded,
      reportsGenerated,
      usageEventsCount,
      feedbackCount,
      dataReviewPending,
      dataReviewApproved,
      dataReviewRejected,
      highIntentLeads,
      budgetComparisonsGenerated,
      pricingRecordsPendingReview,
      approvedBenchmarkRecords,
    };
  }

  const db = await readDb();
  const weekAgo = oneWeekAgoIso();
  const documentsUploaded = db.projects.reduce((count, project) => count + project.uploadedFiles.length, 0);
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "admin_dashboard" });
  return {
    totalUsers: db.users.length,
    activeUsers: db.users.filter((item) => Boolean(item.lastLoginAt)).length,
    newUsersThisWeek: db.users.filter((item) => item.createdAt >= weekAgo).length,
    companiesAdded: db.companies.length,
    projectsCreated: db.projects.length,
    documentsUploaded,
    reportsGenerated: db.reviews.length,
    usageEventsCount: db.usageEvents.length,
    feedbackCount: db.feedback.length,
    dataReviewPending: db.dataReviewQueue.filter((item) => item.reviewStatus === "pending_review").length,
    dataReviewApproved: db.dataReviewQueue.filter((item) => item.reviewStatus === "approved").length,
    dataReviewRejected: db.dataReviewQueue.filter((item) => item.reviewStatus === "rejected").length,
    highIntentLeads: db.leadScores.filter((item) => item.leadStatus === "High Intent").length,
    budgetComparisonsGenerated: db.budgetComparisons.length,
    pricingRecordsPendingReview: db.dataReviewQueue.filter((item) => item.sourceType === "pricing" && item.reviewStatus === "pending_review").length,
    approvedBenchmarkRecords: db.pricingBenchmarkRecords.filter((item) => item.reviewStatus === "approved").length,
  };
}

export async function listAdminUsers(user: SessionUser, limit = 100): Promise<AdminUserRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .select("id, auth0_user_id, email, name, company_id, role, account_type, is_admin, created_at, last_login_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "users", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      auth0UserId: asString(row.auth0_user_id),
      email: asString(row.email),
      name: asString(row.name, asString(row.email)),
      role: asString(row.role, "member"),
      companyId: asString(row.company_id),
      accountType: asString(row.account_type, "individual") as AccountType,
      isAdmin: asBoolean(row.is_admin),
      createdAt: asString(row.created_at, now()),
      lastLoginAt: asString(row.last_login_at) || null,
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "users", actionMetadata: { limit } });
  return db.users
    .map(adminUserRowFromRecord)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listAdminLeads(user: SessionUser, limit = 100): Promise<AdminLeadRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const [
      { data: scoreRows, error: scoreError },
      { data: userRows, error: userError },
      { data: companyRows, error: companyError },
      { data: eventRows, error: eventError },
      { data: projectRows, error: projectError },
    ] = await Promise.all([
      client.from("lead_scores").select("*").order("lead_score", { ascending: false }).limit(limit),
      client.from("users").select("id, email, name, company_id"),
      client.from("companies").select("id, company_name, company_type, trade, state, region"),
      client.from("usage_events").select("user_id, event_type"),
      client.from("projects").select("id, user_id"),
    ]);
    if (scoreError) throw scoreError;
    if (userError) throw userError;
    if (companyError) throw companyError;
    if (eventError) throw eventError;
    if (projectError) throw projectError;
    const users = new Map(((userRows ?? []) as DbRow[]).map((row) => [asString(row.id), row]));
    const companies = new Map(((companyRows ?? []) as DbRow[]).map((row) => [asString(row.id), row]));
    const events = ((eventRows ?? []) as DbRow[]).map((row) => ({
      userId: asString(row.user_id),
      eventType: asString(row.event_type) as UsageEventType,
    }));
    const projects = ((projectRows ?? []) as DbRow[]).map((row) => ({ userId: asString(row.user_id) }));
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "lead_scores", actionMetadata: { limit } });
    return ((scoreRows ?? []) as DbRow[]).map((score) => {
      const userRow = users.get(asString(score.user_id));
      const companyRow = companies.get(asString(score.company_id));
      const userEvents = events.filter((event) => event.userId === asString(score.user_id));
      return {
        userId: asString(score.user_id),
        userName: asString(userRow?.name, asString(userRow?.email, "Unknown user")),
        email: asString(userRow?.email),
        companyId: asString(score.company_id),
        companyName: asString(companyRow?.company_name, "Unknown company"),
        companyType: asString(companyRow?.company_type, "Other"),
        trade: asString(companyRow?.trade),
        state: asString(companyRow?.state),
        region: asString(companyRow?.region),
        leadScore: Number(score.lead_score ?? 0),
        leadStatus: asString(score.lead_status, leadStatusForScore(Number(score.lead_score ?? 0))) as LeadStatus,
        leadReason: asString(score.lead_reason),
        highIntentActions: Array.isArray(score.high_intent_actions) ? score.high_intent_actions.map(String) : [],
        lastActivityAt: asString(score.last_activity_at),
        projectsCount: projects.filter((project) => project.userId === asString(score.user_id)).length,
        documentsUploaded: userEvents.filter((event) => event.eventType === "document_uploaded").length,
        budgetComparisonsCount: userEvents.filter((event) => event.eventType === "budget_compared").length,
        reportsGeneratedCount: userEvents.filter((event) => event.eventType === "report_generated").length,
        pdfsDownloadedCount: userEvents.filter((event) => event.eventType === "pdf_downloaded").length,
        feedbackCount: userEvents.filter((event) => event.eventType === "feedback_submitted").length,
      };
    });
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "lead_scores", actionMetadata: { limit } });
  return db.leadScores
    .map((score) => localLeadRow(db, score))
    .sort((a, b) => b.leadScore - a.leadScore || b.lastActivityAt.localeCompare(a.lastActivityAt))
    .slice(0, limit);
}

export async function listAdminCompanies(user: SessionUser, limit = 100): Promise<AdminCompanyRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("companies")
      .select("id, company_name, company_type, trade, city, state, lead_status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "companies", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      companyName: asString(row.company_name),
      companyType: asString(row.company_type, "Other"),
      trade: asString(row.trade),
      city: asString(row.city),
      state: asString(row.state),
      leadStatus: asString(row.lead_status, "new"),
      createdAt: asString(row.created_at, now()),
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "companies", actionMetadata: { limit } });
  return db.companies
    .map((company) => ({
      id: company.id,
      companyName: company.companyName,
      companyType: company.companyType,
      trade: company.trade,
      city: company.city,
      state: company.state,
      leadStatus: company.leadStatus,
      createdAt: company.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listAdminProjects(user: SessionUser, limit = 100): Promise<AdminProjectRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("projects")
      .select("id, user_id, company_id, project_name, city, state, project_type, current_phase, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "projects", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      userId: asString(row.user_id),
      companyId: asString(row.company_id),
      projectName: asString(row.project_name),
      city: asString(row.city),
      state: asString(row.state),
      projectType: asString(row.project_type),
      currentPhase: asString(row.current_phase),
      status: asString(row.status),
      createdAt: asString(row.created_at, now()),
      updatedAt: asString(row.updated_at, now()),
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "projects", actionMetadata: { limit } });
  return db.projects
    .map((project) => ({
      id: project.id,
      userId: project.userId,
      companyId: project.companyId,
      projectName: project.name,
      city: project.city,
      state: project.state,
      projectType: project.projectType,
      currentPhase: project.currentPhase,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listAdminDocuments(user: SessionUser, limit = 100): Promise<AdminDocumentRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("documents")
      .select("id, project_id, user_id, company_id, file_name, file_type, file_size, backend_document_category, document_category, extraction_status, consent_status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "documents", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      projectId: asString(row.project_id),
      userId: asString(row.user_id),
      companyId: asString(row.company_id),
      fileName: asString(row.file_name),
      fileType: asString(row.file_type),
      fileSize: Number(row.file_size ?? 0),
      documentCategory: asString(row.backend_document_category, asString(row.document_category, "Unknown")),
      extractionStatus: asString(row.extraction_status, "metadata-only"),
      consentStatus: asString(row.consent_status, "not-requested"),
      uploadedAt: asString(row.created_at, now()),
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "documents", actionMetadata: { limit } });
  return db.projects
    .flatMap((project) =>
      project.uploadedFiles.map((file) => ({
        id: file.id,
        projectId: project.id,
        userId: project.userId,
        companyId: file.companyId ?? project.companyId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentCategory: file.backendDocumentCategory ?? file.documentCategory ?? "Unknown",
        extractionStatus: file.extractionStatus ?? "metadata-only",
        consentStatus: file.consentStatus ?? "not-requested",
        uploadedAt: file.uploadedAt,
      })),
    )
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, limit);
}

export async function listAdminUsageEvents(user: SessionUser, limit = 100): Promise<AdminUsageEventRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("usage_events")
      .select("id, user_id, company_id, project_id, event_type, event_metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "usage_events", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      userId: asString(row.user_id),
      companyId: asString(row.company_id),
      projectId: asString(row.project_id) || null,
      eventType: asString(row.event_type),
      eventMetadata: (row.event_metadata as Record<string, unknown>) ?? {},
      createdAt: asString(row.created_at, now()),
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "usage_events", actionMetadata: { limit } });
  return db.usageEvents
    .map((event) => ({
      id: event.id,
      userId: event.userId,
      companyId: event.companyId,
      projectId: event.projectId,
      eventType: event.eventType,
      eventMetadata: event.eventMetadata,
      createdAt: event.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listAdminFeedback(user: SessionUser, limit = 100): Promise<AdminFeedbackRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    const { data, error } = await getSupabaseAdmin()
      .from("feedback")
      .select("id, user_id, company_id, project_id, feedback_type, rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "feedback", actionMetadata: { limit } });
    return ((data ?? []) as DbRow[]).map((row) => ({
      id: asString(row.id),
      userId: asString(row.user_id),
      companyId: asString(row.company_id),
      projectId: asString(row.project_id) || null,
      feedbackType: asString(row.feedback_type),
      rating: asNumberOrNull(row.rating),
      comment: asString(row.comment),
      createdAt: asString(row.created_at, now()),
    }));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "feedback", actionMetadata: { limit } });
  return db.feedback
    .map((item) => ({
      id: item.id,
      userId: item.userId,
      companyId: item.companyId,
      projectId: item.projectId,
      feedbackType: item.feedbackType,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function matchesDataReviewFilters(item: DataReviewQueueRecord, filters: AdminDataReviewFilters): boolean {
  if (filters.sourceType && item.sourceType !== filters.sourceType) return false;
  if (filters.trade && item.normalizedTrade !== filters.trade) return false;
  if (filters.projectId && item.projectId !== filters.projectId) return false;
  if (filters.reviewStatus && filters.reviewStatus !== "all" && item.reviewStatus !== filters.reviewStatus) return false;
  if (typeof filters.minConfidence === "number" && (item.confidenceScore ?? 0) < filters.minConfidence) return false;
  return true;
}

function adminDataReviewRow(item: DataReviewQueueRecord): AdminDataReviewQueueRow {
  return {
    id: item.id,
    sourceType: item.sourceType,
    sourceTable: item.sourceTable,
    sourceRecordId: item.sourceRecordId,
    projectId: item.projectId,
    userId: item.userId,
    companyId: item.companyId,
    extractedValueSummary: item.extractedValueSummary,
    normalizedTrade: item.normalizedTrade,
    normalizedScopeCategory: item.normalizedScopeCategory,
    normalizedScopeSubcategory: item.normalizedScopeSubcategory,
    confidenceScore: item.confidenceScore,
    reviewStatus: item.reviewStatus,
    reviewedByAdminId: item.reviewedByAdminId,
    reviewedAt: item.reviewedAt,
    adminNotes: item.adminNotes,
    reviewMetadata: item.reviewMetadata,
    createdAt: item.createdAt,
  };
}

export async function listAdminDataReviewQueue(
  user: SessionUser,
  filters: AdminDataReviewFilters = {},
  limit = 100,
): Promise<AdminDataReviewQueueRow[]> {
  await assertAdminStoreAccess(user);
  if (shouldUseSupabase()) {
    let query = getSupabaseAdmin()
      .from("data_review_queue")
      .select("id, source_type, source_table, source_record_id, project_id, user_id, company_id, extracted_value_summary, normalized_trade, normalized_scope_category, normalized_scope_subcategory, confidence_score, review_status, reviewed_by_admin_id, reviewed_at, admin_notes, review_metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (filters.sourceType) query = query.eq("source_type", filters.sourceType);
    if (filters.trade) query = query.eq("normalized_trade", filters.trade);
    if (filters.projectId) query = query.eq("project_id", filters.projectId);
    if (filters.reviewStatus && filters.reviewStatus !== "all") query = query.eq("review_status", filters.reviewStatus);
    if (typeof filters.minConfidence === "number") query = query.gte("confidence_score", filters.minConfidence);
    const { data, error } = await query;
    if (error) throw error;
    await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "data_review_queue", actionMetadata: { limit, filters } });
    return ((data ?? []) as DbRow[]).map((row) => adminDataReviewRow(dataReviewQueueFromRow(row)));
  }

  const db = await readDb();
  await addAdminAuditLog(user, { actionType: "admin.viewed", targetTable: "data_review_queue", actionMetadata: { limit, filters } });
  return db.dataReviewQueue
    .filter((item) => matchesDataReviewFilters(item, filters))
    .map(adminDataReviewRow)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

async function adminSourceBudgetLineItem(
  sourceRecordId: string,
): Promise<{ lineItem: BudgetLineItemRecord; budget: BudgetRecord; project: Project } | null> {
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data: lineRow, error: lineError } = await client
      .from("budget_line_items")
      .select("*")
      .eq("id", sourceRecordId)
      .maybeSingle();
    if (lineError) throw lineError;
    if (!lineRow) return null;
    const lineItem = budgetLineItemFromRow(lineRow as DbRow);
    const { data: budgetRow, error: budgetError } = await client
      .from("budgets")
      .select("*")
      .eq("id", lineItem.budgetId)
      .maybeSingle();
    if (budgetError) throw budgetError;
    if (!budgetRow) return null;
    const budget = budgetFromRow(budgetRow as DbRow);
    const { data: projectRow, error: projectError } = await client
      .from("projects")
      .select("*")
      .eq("id", budget.projectId)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!projectRow) return null;
    return { lineItem, budget, project: projectFromRow(projectRow as DbRow) };
  }

  const db = await readDb();
  const lineItem = db.budgetLineItems.find((item) => item.id === sourceRecordId);
  if (!lineItem) return null;
  const budget = db.budgets.find((item) => item.id === lineItem.budgetId);
  if (!budget) return null;
  const project = db.projects.find((item) => item.id === budget.projectId);
  if (!project) return null;
  return { lineItem, budget, project };
}

function benchmarkRecordFromQueue(
  queueItem: DataReviewQueueRecord,
  source: { lineItem: BudgetLineItemRecord; budget: BudgetRecord; project: Project },
  adminUserId: string,
  createdAt: string,
): PricingBenchmarkRecord {
  const { lineItem, budget, project } = source;
  return {
    id: id("pricing_benchmark"),
    sourceBudgetId: budget.id,
    sourceBudgetLineItemId: lineItem.id,
    sourceProjectId: project.id,
    sourceCompanyId: project.companyId,
    trade: queueItem.normalizedTrade || lineItem.normalizedTrade,
    scopeCategory: queueItem.normalizedScopeCategory || lineItem.normalizedScopeCategory || lineItem.normalizedTrade,
    scopeSubcategory: queueItem.normalizedScopeSubcategory || lineItem.normalizedScopeSubcategory,
    description: lineItem.rawDescription,
    unitOfMeasure: lineItem.unitOfMeasure,
    unitCost: lineItem.unitCost,
    totalCost: lineItem.totalCost,
    quantity: lineItem.quantity,
    costPerGrossSf: metricPer(lineItem.totalCost, budget.grossSquareFeet),
    costPerRentableSf: metricPer(lineItem.totalCost, budget.rentableSquareFeet),
    costPerUnit: metricPer(lineItem.totalCost, budget.unitCount),
    costPerBuilding: metricPer(lineItem.totalCost, budget.buildingCount),
    city: budget.city,
    state: budget.state,
    region: budget.region,
    projectType: budget.projectType,
    assetType: budget.assetType,
    renovationOrNew: budget.renovationOrNew,
    fundingType: budget.fundingType,
    estimateDate: budget.estimateDate,
    sourceType: budget.sourceType,
    consentStatus: budget.consentStatus,
    reviewStatus: "approved",
    confidenceScore: queueItem.confidenceScore ?? lineItem.confidenceScore,
    approvedByAdminId: adminUserId,
    approvedAt: createdAt,
    createdAt,
  };
}

async function createBenchmarkRecordIfEligible(
  adminUserId: string,
  queueItem: DataReviewQueueRecord,
): Promise<PricingBenchmarkRecord | null> {
  if (queueItem.sourceTable !== "budget_line_items") return null;
  const source = await adminSourceBudgetLineItem(queueItem.sourceRecordId);
  if (!source || !isBenchmarkConsentEligible(source.project, source.budget)) return null;
  const createdAt = now();
  const record = benchmarkRecordFromQueue(queueItem, source, adminUserId, createdAt);

  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data: existing, error: existingError } = await client
      .from("pricing_benchmark_records")
      .select("*")
      .eq("source_budget_line_item_id", record.sourceBudgetLineItemId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) return pricingBenchmarkFromRow(existing as DbRow);
    const { data, error } = await client
      .from("pricing_benchmark_records")
      .insert(pricingBenchmarkToRow(record))
      .select("*")
      .single();
    if (error) throw error;
    return pricingBenchmarkFromRow(data as DbRow);
  }

  const db = await readDb();
  const existing = db.pricingBenchmarkRecords.find((item) => item.sourceBudgetLineItemId === record.sourceBudgetLineItemId);
  if (existing) return existing;
  db.pricingBenchmarkRecords.push(record);
  await writeDb(db);
  return record;
}

export async function updateAdminDataReviewItem(
  user: SessionUser,
  input: {
    id: string;
    action: "approve" | "reject" | "exclude" | "save";
    normalizedTrade?: string;
    normalizedScopeCategory?: string;
    normalizedScopeSubcategory?: string;
    adminNotes?: string;
  },
): Promise<{ item: DataReviewQueueRecord; benchmarkRecord: PricingBenchmarkRecord | null }> {
  const profile = await assertAdminStoreAccess(user);
  const reviewedAt = now();
  const nextStatus: DataReviewStatus =
    input.action === "approve" ? "approved" :
    input.action === "reject" ? "rejected" :
    input.action === "exclude" ? "excluded_from_learning" :
    "pending_review";

  let item: DataReviewQueueRecord | null = null;
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data: existing, error: existingError } = await client
      .from("data_review_queue")
      .select("*")
      .eq("id", input.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) throw new Error("Data review item not found");
    const current = dataReviewQueueFromRow(existing as DbRow);
    const updatePayload = {
      normalized_trade: input.normalizedTrade?.trim() || current.normalizedTrade,
      normalized_scope_category: input.normalizedScopeCategory?.trim() || current.normalizedScopeCategory,
      normalized_scope_subcategory: input.normalizedScopeSubcategory?.trim() ?? current.normalizedScopeSubcategory,
      review_status: nextStatus,
      reviewed_by_admin_id: profile.id,
      reviewed_at: reviewedAt,
      admin_notes: input.adminNotes?.trim() ?? current.adminNotes,
    };
    const { data, error } = await client
      .from("data_review_queue")
      .update(updatePayload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    item = dataReviewQueueFromRow(data as DbRow);
  } else {
    const db = await readDb();
    const index = db.dataReviewQueue.findIndex((record) => record.id === input.id);
    if (index === -1) throw new Error("Data review item not found");
    const current = db.dataReviewQueue[index];
    item = {
      ...current,
      normalizedTrade: input.normalizedTrade?.trim() || current.normalizedTrade,
      normalizedScopeCategory: input.normalizedScopeCategory?.trim() || current.normalizedScopeCategory,
      normalizedScopeSubcategory: input.normalizedScopeSubcategory?.trim() ?? current.normalizedScopeSubcategory,
      reviewStatus: nextStatus,
      reviewedByAdminId: profile.id,
      reviewedAt,
      adminNotes: input.adminNotes?.trim() ?? current.adminNotes,
    };
    db.dataReviewQueue[index] = item;
    await writeDb(db);
  }

  let benchmarkRecord: PricingBenchmarkRecord | null = null;
  if (input.action === "approve") {
    benchmarkRecord = await createBenchmarkRecordIfEligible(profile.id, item);
  }
  if (input.action === "reject" || input.action === "exclude") {
    await removeBenchmarkRecordForSource(item.sourceTable, item.sourceRecordId);
  }

  const eventType =
    input.action === "approve" ? "admin_data_approved" :
    input.action === "reject" ? "admin_data_rejected" :
    input.action === "exclude" ? "admin_data_excluded" :
    null;
  if (eventType) {
    await recordUsageEvent(user, {
      eventType,
      projectId: item.projectId,
      eventMetadata: {
        sourceType: item.sourceType,
        sourceTable: item.sourceTable,
        reviewStatus: item.reviewStatus,
        benchmarkCreated: Boolean(benchmarkRecord),
      },
    });
  }
  await addAdminAuditLog(user, {
    actionType: `data_review.${input.action}`,
    targetTable: "data_review_queue",
    targetRecordId: item.id,
    actionMetadata: {
      sourceType: item.sourceType,
      sourceTable: item.sourceTable,
      reviewStatus: item.reviewStatus,
      benchmarkCreated: Boolean(benchmarkRecord),
    },
  });
  return { item, benchmarkRecord };
}

async function removeBenchmarkRecordForSource(sourceTable: string, sourceRecordId: string): Promise<void> {
  if (sourceTable !== "budget_line_items") return;
  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin()
      .from("pricing_benchmark_records")
      .delete()
      .eq("source_budget_line_item_id", sourceRecordId);
    if (error) throw error;
    return;
  }
  const db = await readDb();
  db.pricingBenchmarkRecords = db.pricingBenchmarkRecords.filter((record) => record.sourceBudgetLineItemId !== sourceRecordId);
  await writeDb(db);
}

function matchesPricingFilters(record: PricingBenchmarkRecord, filters: AdminPricingFilters): boolean {
  if (filters.trade && record.trade !== filters.trade) return false;
  if (filters.scopeCategory && record.scopeCategory !== filters.scopeCategory) return false;
  if (filters.scopeSubcategory && record.scopeSubcategory !== filters.scopeSubcategory) return false;
  if (filters.city && record.city !== filters.city) return false;
  if (filters.state && record.state !== filters.state) return false;
  if (filters.region && record.region !== filters.region) return false;
  if (filters.projectType && record.projectType !== filters.projectType) return false;
  if (filters.assetType && record.assetType !== filters.assetType) return false;
  if (filters.renovationOrNew && record.renovationOrNew !== filters.renovationOrNew) return false;
  if (filters.fundingType && record.fundingType !== filters.fundingType) return false;
  if (filters.unitOfMeasure && record.unitOfMeasure !== filters.unitOfMeasure) return false;
  if (filters.reviewStatus && record.reviewStatus !== filters.reviewStatus) return false;
  if (filters.consentStatus && record.consentStatus !== filters.consentStatus) return false;
  if (filters.estimateDateFrom && (!record.estimateDate || record.estimateDate < filters.estimateDateFrom)) return false;
  if (filters.estimateDateTo && (!record.estimateDate || record.estimateDate > filters.estimateDateTo)) return false;
  return true;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2));
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function confidenceLevel(records: PricingBenchmarkRecord[]): string {
  const avg = average(records.map((record) => record.confidenceScore ?? 0).filter((value) => value > 0)) ?? 0;
  if (records.length >= 10 && avg >= 0.8) return "High";
  if (records.length >= 3 && avg >= 0.65) return "Medium";
  return "Low";
}

function aggregatePricingRecords(records: PricingBenchmarkRecord[]): AdminPricingAggregateRow[] {
  const groups = new Map<string, PricingBenchmarkRecord[]>();
  for (const record of records) {
    const key = [record.trade, record.scopeCategory, record.scopeSubcategory, record.unitOfMeasure, record.sourceType].join("::");
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return Array.from(groups.values())
    .map((items) => {
      const unitCosts = items.map((item) => item.unitCost).filter((value): value is number => typeof value === "number");
      const first = items[0];
      return {
        trade: first.trade,
        scopeCategory: first.scopeCategory,
        scopeSubcategory: first.scopeSubcategory,
        unitOfMeasure: first.unitOfMeasure,
        sourceType: first.sourceType,
        lowUnitCost: unitCosts.length > 0 ? Math.min(...unitCosts) : null,
        averageUnitCost: average(unitCosts),
        medianUnitCost: median(unitCosts),
        highUnitCost: unitCosts.length > 0 ? Math.max(...unitCosts) : null,
        recordCount: items.length,
        confidenceLevel: confidenceLevel(items),
        lastUpdatedAt: items.map((item) => item.createdAt).sort().at(-1) ?? "",
      };
    })
    .sort((a, b) => b.recordCount - a.recordCount || a.trade.localeCompare(b.trade));
}

export async function listAdminPricingBenchmarks(
  user: SessionUser,
  filters: AdminPricingFilters = {},
  limit = 500,
): Promise<AdminPricingAggregateRow[]> {
  await assertAdminStoreAccess(user);
  let records: PricingBenchmarkRecord[];
  if (shouldUseSupabase()) {
    let query = getSupabaseAdmin()
      .from("pricing_benchmark_records")
      .select("*")
      .eq("review_status", filters.reviewStatus ?? "approved")
      .eq("consent_status", filters.consentStatus ?? "granted")
      .limit(limit);
    if (filters.trade) query = query.eq("trade", filters.trade);
    if (filters.scopeCategory) query = query.eq("scope_category", filters.scopeCategory);
    if (filters.scopeSubcategory) query = query.eq("scope_subcategory", filters.scopeSubcategory);
    if (filters.city) query = query.eq("city", filters.city);
    if (filters.state) query = query.eq("state", filters.state);
    if (filters.region) query = query.eq("region", filters.region);
    if (filters.projectType) query = query.eq("project_type", filters.projectType);
    if (filters.assetType) query = query.eq("asset_type", filters.assetType);
    if (filters.renovationOrNew) query = query.eq("renovation_or_new", filters.renovationOrNew);
    if (filters.fundingType) query = query.eq("funding_type", filters.fundingType);
    if (filters.unitOfMeasure) query = query.eq("unit_of_measure", filters.unitOfMeasure);
    if (filters.estimateDateFrom) query = query.gte("estimate_date", filters.estimateDateFrom);
    if (filters.estimateDateTo) query = query.lte("estimate_date", filters.estimateDateTo);
    const { data, error } = await query;
    if (error) throw error;
    records = ((data ?? []) as DbRow[]).map(pricingBenchmarkFromRow);
  } else {
    const db = await readDb();
    records = db.pricingBenchmarkRecords
      .filter((record) => record.reviewStatus === (filters.reviewStatus ?? "approved"))
      .filter((record) => record.consentStatus === (filters.consentStatus ?? "granted"))
      .filter((record) => matchesPricingFilters(record, filters))
      .slice(0, limit);
  }

  await addAdminAuditLog(user, {
    actionType: "admin.viewed",
    targetTable: "pricing_benchmark_records",
    actionMetadata: { filters, limit },
  });
  return aggregatePricingRecords(records);
}

function leadStatusForScore(score: number): LeadStatus {
  if (score >= 70) return "High Intent";
  if (score >= 35) return "Watching";
  return "New";
}

function distinctUsageDays(events: UsageEventRecord[]): number {
  return new Set(events.map((event) => event.createdAt.slice(0, 10))).size;
}

function countEvents(events: UsageEventRecord[], eventType: UsageEventType): number {
  return events.filter((event) => event.eventType === eventType).length;
}

function addAction(actions: string[], condition: boolean, action: string): void {
  if (condition && !actions.includes(action)) actions.push(action);
}

function leadReasonFor(actions: string[], score: number): string {
  if (actions.length > 0) return actions.slice(0, 4).join("; ");
  if (score > 0) return "Early activity recorded.";
  return "No high-intent activity yet.";
}

function calculateLeadScore(input: {
  user: UserRecord;
  company?: CompanyRecord;
  projects: Project[];
  usageEvents: UsageEventRecord[];
  documentsUploaded: number;
  budgetComparisons: number;
  reportsGenerated: number;
  pdfsDownloaded: number;
  feedbackCount: number;
  benchmarkActivity: number;
}): Pick<LeadScoreRecord, "leadScore" | "leadStatus" | "leadReason" | "highIntentActions" | "lastActivityAt"> {
  const activeDays = distinctUsageDays(input.usageEvents);
  const budgetUploads = countEvents(input.usageEvents, "budget_uploaded");
  const contractReviewActivity = countEvents(input.usageEvents, "report_generated");
  const score = Math.min(100,
    input.projects.length * 8 +
    input.documentsUploaded * 4 +
    budgetUploads * 10 +
    input.budgetComparisons * 15 +
    input.reportsGenerated * 10 +
    input.pdfsDownloaded * 8 +
    input.feedbackCount * 6 +
    Math.max(0, activeDays - 1) * 8 +
    input.benchmarkActivity * 5 +
    (input.projects.length >= 2 ? 10 : 0) +
    (budgetUploads >= 2 ? 12 : 0) +
    (input.budgetComparisons >= 2 ? 12 : 0) +
    (contractReviewActivity > 0 ? 6 : 0) +
    (input.company?.companyType && input.company.companyType !== "Other" ? 4 : 0) +
    (input.company?.trade ? 4 : 0) +
    (input.company?.region ? 3 : 0),
  );
  const highIntentActions: string[] = [];
  addAction(highIntentActions, budgetUploads >= 2, "Uploaded multiple budgets");
  addAction(highIntentActions, input.budgetComparisons > 0, "Compared budgets");
  addAction(highIntentActions, input.budgetComparisons >= 2, "Used BudgetScope more than once");
  addAction(highIntentActions, input.reportsGenerated > 0, "Generated a risk report");
  addAction(highIntentActions, input.pdfsDownloaded > 0, "Downloaded a PDF report");
  addAction(highIntentActions, input.feedbackCount > 0, "Submitted feedback");
  addAction(highIntentActions, input.projects.length >= 2, "Created multiple projects");
  addAction(highIntentActions, activeDays >= 2, "Used JanusScope repeatedly over multiple days");
  addAction(highIntentActions, input.benchmarkActivity > 0, "Interacted with reviewed pricing intelligence");
  const lastActivityAt = input.usageEvents
    .map((event) => event.createdAt)
    .sort()
    .at(-1) ?? input.user.lastLoginAt ?? input.user.createdAt;

  return {
    leadScore: score,
    leadStatus: leadStatusForScore(score),
    leadReason: leadReasonFor(highIntentActions, score),
    highIntentActions,
    lastActivityAt,
  };
}

function localLeadRow(db: Database, score: LeadScoreRecord): AdminLeadRow {
  const user = db.users.find((item) => item.id === score.userId);
  const company = db.companies.find((item) => item.id === score.companyId);
  const events = db.usageEvents.filter((event) => event.userId === score.userId);
  const projects = db.projects.filter((project) => project.userId === score.userId);
  return {
    userId: score.userId,
    userName: user?.name ?? "Unknown user",
    email: user?.email ?? "",
    companyId: score.companyId,
    companyName: company?.companyName ?? "Unknown company",
    companyType: company?.companyType ?? "Other",
    trade: company?.trade ?? "",
    state: company?.state ?? "",
    region: company?.region ?? "",
    leadScore: score.leadScore,
    leadStatus: score.leadStatus,
    leadReason: score.leadReason,
    highIntentActions: score.highIntentActions,
    lastActivityAt: score.lastActivityAt,
    projectsCount: projects.length,
    documentsUploaded: countEvents(events, "document_uploaded"),
    budgetComparisonsCount: countEvents(events, "budget_compared"),
    reportsGeneratedCount: countEvents(events, "report_generated"),
    pdfsDownloadedCount: countEvents(events, "pdf_downloaded"),
    feedbackCount: countEvents(events, "feedback_submitted"),
  };
}

async function recalculateLocalLeadScore(db: Database, workspace: Workspace): Promise<void> {
  const user = db.users.find((item) => item.id === workspace.userId);
  if (!user) return;
  const company = db.companies.find((item) => item.id === workspace.companyId);
  const usageEvents = db.usageEvents.filter((event) => event.userId === workspace.userId);
  const projects = db.projects.filter((project) => project.userId === workspace.userId);
  const calculated = calculateLeadScore({
    user,
    company,
    projects,
    usageEvents,
    documentsUploaded: countEvents(usageEvents, "document_uploaded"),
    budgetComparisons: countEvents(usageEvents, "budget_compared"),
    reportsGenerated: countEvents(usageEvents, "report_generated"),
    pdfsDownloaded: countEvents(usageEvents, "pdf_downloaded"),
    feedbackCount: countEvents(usageEvents, "feedback_submitted"),
    benchmarkActivity: countEvents(usageEvents, "admin_data_approved"),
  });
  const existing = db.leadScores.find((item) => item.userId === workspace.userId && item.companyId === workspace.companyId);
  const updatedAt = now();
  const record: LeadScoreRecord = {
    id: existing?.id ?? id("lead_score"),
    userId: workspace.userId,
    companyId: workspace.companyId,
    ...calculated,
    createdAt: existing?.createdAt ?? updatedAt,
    updatedAt,
  };
  db.leadScores = db.leadScores.filter((item) => !(item.userId === workspace.userId && item.companyId === workspace.companyId));
  db.leadScores.push(record);
  const companyRecord = db.companies.find((item) => item.id === workspace.companyId);
  if (companyRecord && ["new", "watching", "high-intent"].includes(companyRecord.leadStatus)) {
    companyRecord.leadStatus = record.leadStatus === "High Intent" ? "high-intent" : record.leadStatus === "Watching" ? "watching" : "new";
    companyRecord.updatedAt = updatedAt;
  }
}

async function recalculateSupabaseLeadScore(workspace: Workspace): Promise<void> {
  const client = getSupabaseAdmin();
  const [
    { data: userRows, error: userError },
    { data: companyRows, error: companyError },
    { data: eventRows, error: eventError },
    { data: projectRows, error: projectError },
  ] = await Promise.all([
    client.from("users").select("*").eq("id", workspace.userId).limit(1),
    client.from("companies").select("*").eq("id", workspace.companyId).limit(1),
    client.from("usage_events").select("*").eq("user_id", workspace.userId),
    client.from("projects").select("*").eq("user_id", workspace.userId),
  ]);
  if (userError) throw userError;
  if (companyError) throw companyError;
  if (eventError) throw eventError;
  if (projectError) throw projectError;
  const userRow = (userRows?.[0] ?? null) as DbRow | null;
  if (!userRow) return;
  const user: UserRecord = normalizeUserRecord({
    id: asString(userRow.id),
    auth0UserId: asString(userRow.auth0_user_id),
    email: asString(userRow.email),
    name: asString(userRow.name, asString(userRow.email)),
    organizationId: workspace.companyId,
    companyId: asString(userRow.company_id, workspace.companyId),
    role: asString(userRow.role, "member"),
    accountType: asString(userRow.account_type, "individual") as AccountType,
    isAdmin: asBoolean(userRow.is_admin),
    lastLoginAt: asString(userRow.last_login_at) || null,
    createdAt: asString(userRow.created_at, now()),
    updatedAt: asString(userRow.updated_at, now()),
  });
  const companyRow = (companyRows?.[0] ?? null) as DbRow | null;
  const company = companyRow ? {
    id: asString(companyRow.id),
    companyName: asString(companyRow.company_name),
    companyType: asString(companyRow.company_type, "Other") as CompanyType,
    trade: asString(companyRow.trade),
    website: asString(companyRow.website),
    city: asString(companyRow.city),
    state: asString(companyRow.state),
    region: asString(companyRow.region),
    leadStatus: asString(companyRow.lead_status, "new"),
    createdAt: asString(companyRow.created_at, now()),
    updatedAt: asString(companyRow.updated_at, now()),
  } satisfies CompanyRecord : undefined;
  const usageEvents = ((eventRows ?? []) as DbRow[]).map((row) => ({
    id: asString(row.id),
    userId: asString(row.user_id),
    companyId: asString(row.company_id),
    projectId: asString(row.project_id) || null,
    eventType: asString(row.event_type) as UsageEventType,
    eventMetadata: (row.event_metadata as Record<string, unknown>) ?? {},
    createdAt: asString(row.created_at, now()),
  }));
  const calculated = calculateLeadScore({
    user,
    company,
    projects: ((projectRows ?? []) as DbRow[]).map((row) => projectFromRow(row)),
    usageEvents,
    documentsUploaded: countEvents(usageEvents, "document_uploaded"),
    budgetComparisons: countEvents(usageEvents, "budget_compared"),
    reportsGenerated: countEvents(usageEvents, "report_generated"),
    pdfsDownloaded: countEvents(usageEvents, "pdf_downloaded"),
    feedbackCount: countEvents(usageEvents, "feedback_submitted"),
    benchmarkActivity: countEvents(usageEvents, "admin_data_approved"),
  });
  const updatedAt = now();
  const { error } = await client.from("lead_scores").upsert(
    {
      user_id: workspace.userId,
      company_id: workspace.companyId,
      lead_score: calculated.leadScore,
      lead_status: calculated.leadStatus,
      lead_reason: calculated.leadReason,
      high_intent_actions: calculated.highIntentActions,
      last_activity_at: calculated.lastActivityAt,
      updated_at: updatedAt,
    },
    { onConflict: "user_id,company_id" },
  );
  if (error) throw error;
}

async function recalculateLeadScoreForWorkspace(workspace: Workspace, db?: Database): Promise<void> {
  if (shouldUseSupabase()) {
    await recalculateSupabaseLeadScore(workspace);
    return;
  }
  if (db) await recalculateLocalLeadScore(db, workspace);
}

function shouldRecalculateLeadScore(eventType: UsageEventType): boolean {
  return [
    "document_uploaded",
    "budget_uploaded",
    "budget_compared",
    "report_generated",
    "pdf_downloaded",
    "feedback_submitted",
    "pricing_item_extracted",
    "risk_finding_created",
    "admin_data_approved",
    "admin_data_rejected",
    "admin_data_excluded",
    "project_created",
  ].includes(eventType);
}

export async function recordUsageEvent(user: SessionUser, input: UsageEventInput): Promise<void> {
  const workspace = await ensureWorkspace(user);
  const createdAt = now();
  const projectId = input.projectId ?? null;
  const eventMetadata = sanitizeUsageEventMetadata(input.eventMetadata ?? {});

  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin().from("usage_events").insert({
      user_id: workspace.userId,
      company_id: workspace.companyId,
      project_id: projectId,
      event_type: input.eventType,
      event_metadata: eventMetadata,
      created_at: createdAt,
    });
    if (error) throw error;
    if (shouldRecalculateLeadScore(input.eventType)) {
      await recalculateLeadScoreForWorkspace(workspace);
    }
    return;
  }

  const db = await readDb();
  db.usageEvents.push({
    id: id("usage"),
    userId: workspace.userId,
    companyId: workspace.companyId,
    projectId,
    eventType: input.eventType,
    eventMetadata,
    createdAt,
  });
  if (shouldRecalculateLeadScore(input.eventType)) {
    await recalculateLeadScoreForWorkspace(workspace, db);
  }
  await writeDb(db);
}

export async function addAudit(user: SessionUser, projectId: string | null, action: string, details: Record<string, unknown>): Promise<void> {
  const project = projectId ? await getProject(user, projectId) : null;
  const workspace = await ensureWorkspace(user);

  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin().from("audit_logs").insert({
      organization_id: project?.organizationId ?? workspace.organizationId,
      user_id: project?.userId ?? workspace.userId,
      project_id: projectId,
      action,
      details,
    });
    if (error) {
      logEvent("warn", "audit.write.failed", { action, reason: error.message });
    }
    return;
  }

  const db = await readDb();
  db.auditLogs.push({
    id: id("audit"),
    organizationId: project?.organizationId ?? workspace.organizationId,
    userId: project?.userId ?? workspace.userId,
    projectId,
    action,
    details,
    createdAt: now(),
  });
  await writeDb(db);
}

export async function addAdminAuditLog(
  adminUser: SessionUser,
  input: {
    actionType: string;
    targetTable: string;
    targetRecordId?: string | null;
    actionMetadata?: Record<string, unknown>;
  },
): Promise<void> {
  const profile = await getUserProfile(adminUser);
  if (!isAdminProfile(profile)) {
    logEvent("warn", "admin.audit.blocked", { userId: profile.id, action: input.actionType });
    throw new Error("Admin access required");
  }

  const createdAt = now();
  if (shouldUseSupabase()) {
    const { error } = await getSupabaseAdmin().from("admin_audit_log").insert({
      admin_user_id: profile.id,
      action_type: input.actionType,
      target_table: input.targetTable,
      target_record_id: input.targetRecordId ?? null,
      action_metadata: input.actionMetadata ?? {},
      created_at: createdAt,
    });
    if (error) throw error;
    return;
  }

  const db = await readDb();
  db.adminAuditLog.push({
    id: id("admin_audit"),
    adminUserId: profile.id,
    actionType: input.actionType,
    targetTable: input.targetTable,
    targetRecordId: input.targetRecordId ?? null,
    actionMetadata: input.actionMetadata ?? {},
    createdAt,
  });
  await writeDb(db);
}

function makeAudit(project: Project, action: string, details: Record<string, unknown>): AuditLog {
  return {
    id: id("audit"),
    organizationId: project.organizationId,
    userId: project.userId,
    projectId: project.id,
    action,
    details,
    createdAt: now(),
  };
}

export function userFacingStoreError(error: unknown): string {
  const message = errorMessage(error);
  if (/supabase|schema|column|relation|storage/i.test(message)) {
    return "Project storage is not configured correctly. Please try again or contact support.";
  }
  return "Something went wrong saving your work. Please try again or contact support.";
}
