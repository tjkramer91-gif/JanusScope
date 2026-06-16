import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DOCUMENT_CATALOG, createEmptyProject } from "@/lib/catalogs";
import { IntakeAnswer, Project, ProjectStatus, UploadedFile } from "@/lib/types";
import { SessionUser } from "@/lib/server/auth";

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
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: UserRecord[];
  projects: Project[];
  reviews: StoredReview[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "subscope-db.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

async function readDb(): Promise<Database> {
  await ensureDataDir();
  try {
    const value = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(value) as Database;
  } catch {
    return { users: [], projects: [], reviews: [], auditLogs: [] };
  }
}

async function writeDb(db: Database): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function orgIdForUser(user: SessionUser): string {
  return `org_${crypto.createHash("sha256").update(user.auth0UserId).digest("hex").slice(0, 16)}`;
}

export async function ensureWorkspace(user: SessionUser): Promise<{ userId: string; organizationId: string }> {
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
  const db = await readDb();
  return db.projects
    .filter((project) => project.userId === workspace.userId && project.organizationId === workspace.organizationId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(user: SessionUser, projectId: string): Promise<Project | null> {
  const workspace = await ensureWorkspace(user);
  const db = await readDb();
  return (
    db.projects.find(
      (project) =>
        project.id === projectId &&
        project.userId === workspace.userId &&
        project.organizationId === workspace.organizationId,
    ) ?? null
  );
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
  const db = await readDb();
  db.projects.push(project);
  db.auditLogs.push(makeAudit(project, "project.created", { projectName: project.name }));
  await writeDb(db);
  return project;
}

export async function saveProject(user: SessionUser, project: Project, action = "project.updated"): Promise<Project> {
  const workspace = await ensureWorkspace(user);
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
  const storagePath = path.join(workspace.organizationId, project.id, `${fileId}-${safeName}`);
  const absolutePath = path.join(UPLOAD_DIR, storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    id: fileId,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    documentId,
    storagePath,
    processingStatus: "classified",
    uploadedAt: now(),
  };
}

export async function deleteUploadedFile(user: SessionUser, projectId: string, fileId: string): Promise<void> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");
  const file = project.uploadedFiles.find((item) => item.id === fileId);
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

export async function deleteProject(user: SessionUser, projectId: string): Promise<void> {
  const workspace = await ensureWorkspace(user);
  const db = await readDb();
  const project = db.projects.find(
    (item) => item.id === projectId && item.userId === workspace.userId && item.organizationId === workspace.organizationId,
  );
  if (!project) return;

  db.projects = db.projects.filter((item) => item.id !== projectId);
  db.reviews = db.reviews.filter((item) => item.projectId !== projectId);
  db.auditLogs.push(makeAudit(project, "project.deleted", { projectName: project.name }));
  await writeDb(db);
  await fs.rm(path.join(UPLOAD_DIR, workspace.organizationId, projectId), { recursive: true, force: true });
}

export async function saveIntakeAnswers(user: SessionUser, projectId: string, answers: IntakeAnswer[]): Promise<Project> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");
  return saveProject(user, { ...project, intakeAnswers: answers, status: "processing" }, "intake.saved");
}

export async function saveReview(user: SessionUser, project: Project, rawAnalysisJson: unknown): Promise<StoredReview> {
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
    createdAt: now(),
    updatedAt: now(),
  };
  db.reviews = db.reviews.filter((item) => item.projectId !== project.id);
  db.reviews.push(review);
  db.auditLogs.push(makeAudit(project, "report.generated", { riskScore: project.riskScore, riskLevel: project.riskLevel }));
  await writeDb(db);
  await saveProject(user, project, "report.generated");
  return review;
}

export async function getLatestReview(user: SessionUser, projectId: string): Promise<StoredReview | null> {
  const project = await getProject(user, projectId);
  if (!project) return null;
  const db = await readDb();
  return (
    db.reviews
      .filter((review) => review.projectId === project.id && review.userId === project.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

export async function deleteReports(user: SessionUser, projectId: string): Promise<void> {
  const project = await getProject(user, projectId);
  if (!project) throw new Error("Project not found");
  const db = await readDb();
  db.reviews = db.reviews.filter((review) => review.projectId !== projectId);
  db.auditLogs.push(makeAudit(project, "report.deleted", {}));
  await writeDb(db);
  await saveProject(user, { ...project, status: "questions-needed", riskScore: null, riskLevel: "" }, "report.deleted");
}

export async function addAudit(user: SessionUser, projectId: string | null, action: string, details: Record<string, unknown>): Promise<void> {
  const project = projectId ? await getProject(user, projectId) : null;
  const workspace = await ensureWorkspace(user);
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
