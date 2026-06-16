"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buildRiskAnalysisJson } from "@/lib/analysis";
import { classifyFileName, DOCUMENT_CATALOG } from "@/lib/catalogs";
import { INTAKE_QUESTIONS } from "@/lib/checklist";
import { generateRiskReview } from "@/lib/risk-engine";
import { requireUser } from "@/lib/server/auth";
import {
  createProject,
  deleteProject,
  deleteReports,
  deleteUploadedFile,
  getProject,
  saveIntakeAnswers,
  saveProject,
  saveReview,
  saveUploadedFile,
} from "@/lib/server/store";
import { DocumentId, IntakeAnswer, Project } from "@/lib/types";
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

export async function createProjectAction(formData: FormData) {
  const user = await requireUser();
  const input = projectInputSchema.parse({
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
  });

  const project = await createProject(user, input);
  redirect(`/app/projects/${project.id}/upload`);
}

export async function uploadDocumentsAction(projectId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");

  const batchDocumentType = asDocumentId(formData.get("documentType"));
  const files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
  const uploaded = [];
  for (const file of files) {
    const documentType = batchDocumentType === "other" ? classifyFileName(file.name) : batchDocumentType;
    const saved = await saveUploadedFile(user, project, file, documentType);
    if (saved) uploaded.push(saved);
  }

  const nextProject: Project = {
    ...project,
    status: uploaded.length > 0 ? "documents-uploaded" : project.status,
    uploadedFiles: [...project.uploadedFiles, ...uploaded],
    subcontractText: String(formData.get("subcontractText") ?? project.subcontractText),
    bidText: String(formData.get("bidText") ?? project.bidText),
    exclusionsText: String(formData.get("exclusionsText") ?? project.exclusionsText),
    notesText: String(formData.get("notesText") ?? project.notesText),
    deleteDocumentsAfterReport: formData.get("deleteDocumentsAfterReport") === "on",
  };
  nextProject.documents = syncDocumentAvailability(nextProject);
  await saveProject(user, nextProject, uploaded.length > 0 ? "file.uploaded" : "project.updated");

  revalidatePath(`/app/projects/${projectId}/upload`);
  redirect(`/app/projects/${projectId}/questions`);
}

export async function updateDocumentTypeAction(projectId: string, fileId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");
  const documentId = asDocumentId(formData.get("documentType"));
  const nextProject = {
    ...project,
    uploadedFiles: project.uploadedFiles.map((file) => (file.id === fileId ? { ...file, documentId } : file)),
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

  const processingProject = await saveProject(user, { ...project, status: "processing" }, "review.processing");
  const review = generateRiskReview(processingProject);
  const completedProject = {
    ...processingProject,
    status: "report-ready" as const,
    riskScore: review.score,
    riskLevel: review.riskLevel,
  };
  const analysisJson = buildRiskAnalysisJson(completedProject, review);
  await saveReview(user, completedProject, analysisJson);

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
