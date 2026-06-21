import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getCache } from "@vercel/functions";
import { DOCUMENT_CATALOG, createEmptyProject } from "@/lib/catalogs";
import { extractUploadedFileText } from "@/lib/document-extraction";
import { errorMessage, logEvent } from "@/lib/server/logger";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/server/supabase";
import type { SessionUser } from "@/lib/server/auth";
import {
  DocumentId,
  IntakeAnswer,
  IntelligenceGraph,
  Project,
  ProjectStatus,
  UploadedFile,
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
  passwordHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: UserRecord[];
  projects: Project[];
  reviews: StoredReview[];
  auditLogs: AuditLog[];
}

export interface PasswordUser {
  id: string;
  auth0UserId: string;
  email: string;
  name: string;
  passwordHash: string | null;
}

type DbRow = Record<string, unknown>;

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
  return { users: [], projects: [], reviews: [], auditLogs: [] };
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
      return cached ? (cached as Database) : emptyDb();
    } catch (error) {
      logEvent("warn", "runtime_cache.read_failed", { reason: errorMessage(error) });
    }
  }

  await ensureDataDir();
  try {
    const value = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(value) as Database;
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
    name: asString(row.file_name),
    size: Number(row.file_size ?? 0),
    type: asString(row.file_type, "application/octet-stream"),
    documentId: asString(row.document_type, "other") as DocumentId,
    documentCategory: optionalString(row.document_category) as UploadedFile["documentCategory"],
    storagePath: asString(row.storage_path),
    processingStatus: asString(row.processing_status, "classified") as UploadedFile["processingStatus"],
    extractionStatus: asString(row.extraction_status, row.extracted_text ? "extracted" : "metadata-only") as UploadedFile["extractionStatus"],
    extractionMessage: optionalString(row.extraction_message),
    extractedText: optionalString(row.extracted_text),
    reviewedSectionCount: optionalNumber(row.reviewed_section_count),
    includedInReview: typeof row.included_in_review === "boolean" ? row.included_in_review : Boolean(row.extracted_text),
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
    userId: asString(row.user_id),
    name: asString(row.project_name),
    projectAddress: asString(row.project_address),
    city: asString(row.city),
    state: asString(row.state),
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
    status: asString(row.status, "draft") as ProjectStatus,
    riskScore: asNumberOrNull(row.risk_score),
    riskLevel: asString(row.risk_level),
    deleteDocumentsAfterReport: asBoolean(row.delete_documents_after_report),
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
    project_name: project.name,
    project_address: project.projectAddress,
    city: project.city,
    state: project.state,
    zip: project.zip,
    trade_type: project.tradeType,
    gc_name: project.gcName,
    owner_name: project.ownerName,
    contract_amount: project.contractAmount,
    bid_date: dateOrNull(project.bidDate),
    execution_deadline: dateOrNull(project.executionDeadline),
    project_type: project.projectType,
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
    delete_documents_after_report: project.deleteDocumentsAfterReport,
    updated_at: now(),
  };
}

async function supabaseProject(projectId: string, workspace: { userId: string; organizationId: string }): Promise<Project | null> {
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

async function supabaseWorkspaceForUser(user: SessionUser): Promise<{ userId: string; organizationId: string }> {
  const client = getSupabaseAdmin();
  const { data: userRow, error: userError } = await client
    .from("users")
    .select("id, auth0_user_id, email, name")
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
      })
      .select("id, auth0_user_id, email, name")
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
    return { userId, organizationId: asString((membership as DbRow).organization_id) };
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

  return { userId, organizationId };
}

export async function findPasswordUserByEmail(email: string): Promise<PasswordUser | null> {
  const normalizedEmail = normalizeEmail(email);
  if (shouldUseSupabase()) {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from("users")
      .select("id, auth0_user_id, email, name, password_hash")
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
    passwordHash,
    createdAt,
    updatedAt: createdAt,
  };
  db.users.push(user);
  await writeDb(db);
  logEvent("info", "auth.signup.created", { userId: user.id, storage: "local" });
  return { id: user.id, auth0UserId, email: normalizedEmail, name };
}

export async function ensureWorkspace(user: SessionUser): Promise<{ userId: string; organizationId: string }> {
  if (shouldUseSupabase()) return supabaseWorkspaceForUser(user);

  const db = await readDb();
  const existing = db.users.find((item) => item.auth0UserId === user.auth0UserId);
  if (existing) return { userId: existing.id, organizationId: existing.organizationId };

  const createdAt = now();
  const userRecord: UserRecord = {
    id: user.id,
    auth0UserId: user.auth0UserId,
    email: user.email,
    name: user.name,
    organizationId: orgIdForUser(user),
    createdAt,
    updatedAt: createdAt,
  };
  db.users.push(userRecord);
  await writeDb(db);
  return { userId: userRecord.id, organizationId: userRecord.organizationId };
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
    | "userId"
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
    | "deleteDocumentsAfterReport"
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
        file_name: file.name,
        file_type: file.type || "application/octet-stream",
        document_type: documentId,
        storage_path: storagePath,
        file_size: file.size,
        processing_status: processingStatus,
        extracted_text: extracted.extractedText || null,
        extraction_status: extracted.extractionStatus,
        extraction_message: extracted.extractionMessage,
        reviewed_section_count: extracted.reviewedSectionCount,
        included_in_review: extracted.includedInReview,
        document_category: extracted.documentCategory,
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
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    documentId,
    documentCategory: extracted.documentCategory,
    storagePath,
    processingStatus,
    extractionStatus: extracted.extractionStatus,
    extractionMessage: extracted.extractionMessage,
    extractedText: extracted.extractedText || undefined,
    reviewedSectionCount: extracted.reviewedSectionCount,
    includedInReview: extracted.includedInReview,
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

export async function saveReview(
  user: SessionUser,
  project: Project,
  rawAnalysisJson: unknown,
  intelligenceGraph?: IntelligenceGraph,
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
