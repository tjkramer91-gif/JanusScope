"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildRiskAnalysisJson } from "@/lib/analysis";
import { classifyFileName, DOCUMENT_CATALOG } from "@/lib/catalogs";
import { INTAKE_QUESTIONS } from "@/lib/checklist";
import { documentCategoryFor } from "@/lib/document-extraction";
import { buildProjectIntelligenceGraph } from "@/lib/intelligence-graph";
import { generateRiskReview } from "@/lib/risk-engine";
import { requireUser, type SessionUser } from "@/lib/server/auth";
import { errorMessage, logEvent } from "@/lib/server/logger";
import { reviewFocusLabels } from "@/lib/review-focus";
import {
  createProject,
  deleteProject,
  deleteReports,
  deleteUploadedFile,
  getProject,
  listIntelligenceGraphs,
  saveIntakeAnswers,
  saveProject,
  saveReview,
  saveUploadedFile,
  userFacingStoreError,
} from "@/lib/server/store";
import {
  SOURCE_VERIFICATION_SAMPLE_DOCUMENTS,
  sourceVerificationSampleProjectInput,
  sourceVerificationSampleTextFields,
} from "@/lib/source-verification-sample";
import { DocumentId, IntakeAnswer, Project } from "@/lib/types";
import { validateUploadFile } from "@/lib/upload-validation";
import { projectInputSchema } from "@/lib/validation";

function asDocumentId(value: FormDataEntryValue | null, fallback: DocumentId = "other"): DocumentId {
  const id = typeof value === "string" ? value : fallback;
  return DOCUMENT_CATALOG.some((document) => document.id === id) ? (id as DocumentId) : fallback;
}

function syncDocumentAvailability(project: Project): Project["documents"] {
  const uploadedTypes = new Set(project.uploadedFiles.map((file) => file.documentId));
  return DOCUMENT_CATALOG.map((document) => ({
    ...document,
    available: project.documents.some((item) => item.id === document.id && item.available) || uploadedTypes.has(document.id),
  }));
}

function firstValidationMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Check the required fields and try again.";
}

function encodedMessage(message: string): string {
  return encodeURIComponent(message);
}

async function generateAndSaveReview(user: SessionUser, project: Project): Promise<Project> {
  const processingProject = await saveProject(user, { ...project, status: "processing" }, "review.processing");
  const review = generateRiskReview(processingProject);
  const completedProject = {
    ...processingProject,
    status: "report-ready" as const,
    riskScore: review.score,
    riskLevel: review.riskLevel,
  };
  const analysisJson = buildRiskAnalysisJson(completedProject, review);
  const intelligenceHistory = await listIntelligenceGraphs(user, { excludeProjectId: completedProject.id });
  const intelligenceGraph = buildProjectIntelligenceGraph(completedProject, review, intelligenceHistory);
  await saveReview(user, completedProject, analysisJson, intelligenceGraph);
  return completedProject;
}

function uploadReviewNotes(project: Project, formData: FormData): string {
  const focusLabels = reviewFocusLabels(formData.getAll("reviewFocus").map(String));
  const reviewNotes = String(formData.get("reviewNotes") ?? formData.get("notesText") ?? "").trim();
  const preservedProjectNotes =
    project.notesText && !project.notesText.includes("Review focus:") && !project.notesText.includes("User notes:")
      ? project.notesText.trim()
      : "";

  return [
    preservedProjectNotes,
    `Review focus: ${focusLabels.length > 0 ? focusLabels.join(", ") : "Review everything"}`,
    reviewNotes ? `User notes: ${reviewNotes}` : "",
  ].filter(Boolean).join("\n\n");
}

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const input = projectInputSchema.safeParse({
    name: formData.get("name"),
    projectAddress: formData.get("projectAddress"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    tradeType: formData.get("tradeType"),
    gcName: formData.get("gcName"),
    ownerName: formData.get("ownerName"),
    contractAmount: formData.get("contractAmount"),
    bidDate: formData.get("bidDate"),
    executionDeadline: formData.get("executionDeadline"),
    projectType: formData.get("projectType"),
    hasMasterServiceAgreement: formData.get("hasMasterServiceAgreement"),
    publicOrPrivate: formData.get("publicOrPrivate"),
    prevailingWageStatus: formData.get("prevailingWageStatus"),
    projectNotes: formData.get("projectNotes"),
  });

  if (!input.success) {
    const message = firstValidationMessage(input.error);
    logEvent("warn", "project.create.validation_failed", { userId: user.id, reason: message });
    redirect(`/app/projects/new?error=${encodedMessage(message)}`);
  }

  let project: Project;
  try {
    const { projectNotes, ...projectInput } = input.data;
    project = await createProject(user, projectInput);
    if (projectNotes) {
      project = await saveProject(user, { ...project, notesText: projectNotes }, "project.notes.saved");
    }
  } catch (error) {
    logEvent("error", "project.create.action_failed", { userId: user.id, reason: errorMessage(error) });
    redirect(`/app/projects/new?error=${encodedMessage(userFacingStoreError(error))}`);
  }

  redirect(`/app/projects/${project.id}/upload?created=1`);
}

export async function createSourceVerificationSampleProjectAction() {
  const user = await requireUser();
  let projectId = "";

  try {
    const project = await createProject(user, sourceVerificationSampleProjectInput());
    const uploaded = [];

    for (const document of SOURCE_VERIFICATION_SAMPLE_DOCUMENTS) {
      const file = new File([document.content], document.name, { type: document.type });
      const saved = await saveUploadedFile(user, project, file, document.documentId);
      if (saved) uploaded.push(saved);
    }

    const reviewProject: Project = {
      ...project,
      ...sourceVerificationSampleTextFields(),
      uploadedFiles: uploaded,
      status: "documents-uploaded",
      deleteDocumentsAfterReport: false,
    };
    reviewProject.documents = syncDocumentAvailability(reviewProject);

    const completedProject = await generateAndSaveReview(user, reviewProject);

    projectId = completedProject.id;
    logEvent("info", "verification_sample.created", {
      userId: user.id,
      projectId,
      uploadedCount: uploaded.length,
    });
  } catch (error) {
    logEvent("error", "verification_sample.create_failed", { userId: user.id, reason: errorMessage(error) });
    redirect(`/app/dashboard?error=${encodedMessage(userFacingStoreError(error))}`);
  }

  revalidatePath("/app/dashboard");
  redirect(`/app/projects/${projectId}/report?sample=1`);
}

export async function uploadDocumentsAction(projectId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");

  const batchDocumentType = asDocumentId(formData.get("documentType"));
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  const firstInvalidFile = files
    .map((file) => ({ file, message: validateUploadFile(file) }))
    .find((item) => item.message);

  if (firstInvalidFile?.message) {
    logEvent("warn", "upload.validation_failed", {
      userId: user.id,
      projectId,
      fileName: firstInvalidFile.file.name,
      reason: firstInvalidFile.message,
    });
    redirect(`/app/projects/${projectId}/upload?error=${encodedMessage(firstInvalidFile.message)}`);
  }

  const uploaded = [];
  try {
    for (const file of files) {
      const documentType = batchDocumentType === "other" ? classifyFileName(file.name) : batchDocumentType;
      const saved = await saveUploadedFile(user, project, file, documentType);
      if (saved) uploaded.push(saved);
    }
  } catch (error) {
    logEvent("error", "upload.save_failed", { userId: user.id, projectId, reason: errorMessage(error) });
    redirect(`/app/projects/${projectId}/upload?error=${encodedMessage(userFacingStoreError(error))}`);
  }

  const nextProject: Project = {
    ...project,
    status: uploaded.length > 0 ? "documents-uploaded" : project.status,
    uploadedFiles: [...project.uploadedFiles, ...uploaded],
    subcontractText: String(formData.get("subcontractText") ?? project.subcontractText),
    bidText: String(formData.get("bidText") ?? project.bidText),
    exclusionsText: String(formData.get("exclusionsText") ?? project.exclusionsText),
    notesText: uploadReviewNotes(project, formData),
    deleteDocumentsAfterReport: formData.get("deleteDocumentsAfterReport") === "on",
  };
  nextProject.documents = syncDocumentAvailability(nextProject);
  let completedProject: Project;
  try {
    const savedProject = await saveProject(user, nextProject, uploaded.length > 0 ? "file.uploaded" : "project.updated");
    completedProject = await generateAndSaveReview(user, savedProject);
  } catch (error) {
    logEvent("error", "upload.project_update_failed", { userId: user.id, projectId, reason: errorMessage(error) });
    redirect(`/app/projects/${projectId}/upload?error=${encodedMessage(userFacingStoreError(error))}`);
  }

  revalidatePath(`/app/projects/${projectId}/upload`);
  revalidatePath(`/app/projects/${projectId}/questions`);
  revalidatePath(`/app/projects/${projectId}/report`);
  logEvent("info", "upload.review_started", { userId: user.id, projectId, uploadedCount: uploaded.length });
  redirect(`/app/projects/${completedProject.id}/questions?started=1&uploaded=${uploaded.length}`);
}

export async function updateDocumentTypeAction(projectId: string, fileId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");
  const documentId = asDocumentId(formData.get("documentType"));
  const nextProject = {
    ...project,
    uploadedFiles: project.uploadedFiles.map((file) =>
      file.id === fileId ? { ...file, documentId, documentCategory: documentCategoryFor(documentId, file.name) } : file,
    ),
  };
  nextProject.documents = syncDocumentAvailability(nextProject);
  await saveProject(user, nextProject, "file.classified");
  revalidatePath(`/app/projects/${projectId}/upload`);
}

export async function deleteDocumentAction(projectId: string, fileId: string) {
  const user = await requireUser();
  await deleteUploadedFile(user, projectId, fileId);
  revalidatePath(`/app/projects/${projectId}/upload`);
  revalidatePath(`/app/projects/${projectId}/report`);
}

export async function saveChecklistAction(projectId: string, formData: FormData) {
  const user = await requireUser();
  const answers: IntakeAnswer[] = INTAKE_QUESTIONS.map(([questionKey, questionText]) => ({
    questionKey,
    questionText,
    answer: (formData.get(questionKey) || "not-sure") as IntakeAnswer["answer"],
  }));

  await saveIntakeAnswers(user, projectId, answers);
  redirect(`/app/projects/${projectId}/processing`);
}

export async function runReviewAction(projectId: string) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");

  const completedProject = await generateAndSaveReview(user, project);

  if (completedProject.deleteDocumentsAfterReport) {
    for (const file of completedProject.uploadedFiles) {
      await deleteUploadedFile(user, completedProject.id, file.id);
    }
  }

  redirect(`/app/projects/${projectId}/report`);
}

export async function deleteReportsAction(projectId: string) {
  const user = await requireUser();
  await deleteReports(user, projectId);
  revalidatePath(`/app/projects/${projectId}/report`);
  redirect(`/app/projects/${projectId}/questions`);
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();
  await deleteProject(user, projectId);
  redirect("/app/dashboard");
}
