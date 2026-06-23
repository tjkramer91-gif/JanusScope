"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DOCUMENT_CATALOG } from "@/lib/catalogs";
import { parseBudgetCsv, type BudgetColumnMapping, type BudgetSourceType, type OccupiedOrVacant } from "@/lib/budgetscope";
import { requireUser } from "@/lib/server/auth";
import { errorMessage, logEvent } from "@/lib/server/logger";
import { getProject, saveBudgetComparison, saveBudgetScopeImport, saveProject, saveUploadedFile, userFacingStoreError } from "@/lib/server/store";
import { trackUsageEvent } from "@/lib/server/usage";
import type { ConsentStatus, Project } from "@/lib/types";

function encodedMessage(message: string): string {
  return encodeURIComponent(message);
}

function formString(formData: FormData, key: string, fallback = ""): string {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function formNumber(formData: FormData, key: string): number | null {
  const value = formString(formData, key);
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function sourceType(value: string): BudgetSourceType {
  if (["budget", "bid", "estimate", "actual", "allowance", "conceptual"].includes(value)) return value as BudgetSourceType;
  return "budget";
}

function occupiedOrVacant(value: string): OccupiedOrVacant {
  if (["occupied", "vacant", "mixed", "unknown"].includes(value)) return value as OccupiedOrVacant;
  return "unknown";
}

function consentStatus(value: string): ConsentStatus {
  if (["not-requested", "granted", "declined", "revoked"].includes(value)) return value as ConsentStatus;
  return "not-requested";
}

function syncDocumentAvailability(project: Project): Project["documents"] {
  const uploadedTypes = new Set(project.uploadedFiles.map((file) => file.documentId));
  return DOCUMENT_CATALOG.map((document) => ({
    ...document,
    available: project.documents.some((item) => item.id === document.id && item.available) || uploadedTypes.has(document.id),
  }));
}

function budgetMappingFromForm(formData: FormData): BudgetColumnMapping {
  return {
    costCode: formString(formData, "map_costCode"),
    csiDivision: formString(formData, "map_csiDivision"),
    trade: formString(formData, "map_trade"),
    description: formString(formData, "map_description"),
    quantity: formString(formData, "map_quantity"),
    unitOfMeasure: formString(formData, "map_unitOfMeasure"),
    unitCost: formString(formData, "map_unitCost"),
    totalCost: formString(formData, "map_totalCost"),
    notes: formString(formData, "map_notes"),
    exclusions: formString(formData, "map_exclusions"),
    alternates: formString(formData, "map_alternates"),
    allowanceFlag: formString(formData, "map_allowanceFlag"),
  };
}

function validateCsvFile(file: File | null): string | null {
  if (!file || file.size <= 0) return "Upload a CSV budget file before importing.";
  const name = file.name.toLowerCase();
  const allowedType = !file.type || ["text/csv", "application/csv", "application/vnd.ms-excel"].includes(file.type);
  if (!name.endsWith(".csv") || !allowedType) {
    return "BudgetScope Phase 4 supports CSV files only. Export your budget to CSV and try again.";
  }
  if (file.size > 10 * 1024 * 1024) return "Budget CSV files must be 10 MB or smaller.";
  return null;
}

export async function importBudgetScopeAction(projectId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");

  const fileValue = formData.get("budgetFile");
  const file = fileValue instanceof File ? fileValue : null;
  const validationMessage = validateCsvFile(file);
  if (validationMessage) {
    redirect(`/app/projects/${projectId}/budgetscope?error=${encodedMessage(validationMessage)}`);
  }

  let savedRows = 0;
  try {
    const csv = await file!.text();
    const parsed = parseBudgetCsv(csv, budgetMappingFromForm(formData));
    const savedFile = await saveUploadedFile(user, project, file!, "budget");
    const projectWithFile = savedFile
      ? {
          ...project,
          status: "documents-uploaded" as const,
          uploadedFiles: [...project.uploadedFiles, savedFile],
        }
      : project;
    projectWithFile.documents = syncDocumentAvailability(projectWithFile);
    const savedProject = await saveProject(user, projectWithFile, savedFile ? "budget.file.uploaded" : "budgetscope.metadata.saved");
    const selectedSourceType = sourceType(formString(formData, "sourceType", "budget"));
    const result = await saveBudgetScopeImport(user, savedProject, {
      budgetName: formString(formData, "budgetName", `${project.name} Budget`),
      budgetVersion: formString(formData, "budgetVersion", "Initial import"),
      budgetType: formString(formData, "budgetType", selectedSourceType),
      sourceType: selectedSourceType,
      city: formString(formData, "city", project.city),
      state: formString(formData, "state", project.state),
      region: formString(formData, "region", project.region),
      projectType: formString(formData, "projectType", project.projectType),
      assetType: formString(formData, "assetType", project.assetType),
      renovationOrNew: formString(formData, "renovationOrNew", project.renovationOrNew) as Project["renovationOrNew"],
      estimateDate: formString(formData, "estimateDate") || null,
      grossSquareFeet: formNumber(formData, "grossSquareFeet") ?? project.grossSquareFeet,
      rentableSquareFeet: formNumber(formData, "rentableSquareFeet") ?? project.rentableSquareFeet,
      unitCount: formNumber(formData, "unitCount") ?? project.unitCount,
      buildingCount: formNumber(formData, "buildingCount") ?? project.buildingCount,
      fundingType: formString(formData, "fundingType", project.fundingType),
      occupiedOrVacant: occupiedOrVacant(formString(formData, "occupiedOrVacant", "unknown")),
      sourceFileId: savedFile?.id ?? null,
      consentStatus: consentStatus(formString(formData, "consentStatus", project.consentStatus)),
      lineItems: parsed.lineItems,
    });

    await trackUsageEvent(user, "budget_uploaded", {
      projectId,
      eventMetadata: {
        sourceType: selectedSourceType,
        lineItemCount: result.lineItemCount,
        fileType: file!.type || "text/csv",
      },
    });
    await trackUsageEvent(user, "budget_column_mapped", {
      projectId,
      eventMetadata: {
        mappedColumnCount: Object.values(parsed.mapping).filter(Boolean).length,
        lineItemCount: result.lineItemCount,
      },
    });
    logEvent("info", "budgetscope.import.completed", {
      userId: user.id,
      projectId,
      lineItemCount: result.lineItemCount,
    });
    savedRows = result.lineItemCount;
  } catch (error) {
    const message = error instanceof Error && /budget csv|map at least|usable budget|header row/i.test(error.message)
      ? error.message
      : userFacingStoreError(error);
    logEvent("error", "budgetscope.import.failed", { userId: user.id, projectId, reason: errorMessage(error) });
    redirect(`/app/projects/${projectId}/budgetscope?error=${encodedMessage(message)}`);
  }

  revalidatePath(`/app/projects/${projectId}`);
  revalidatePath(`/app/projects/${projectId}/budgetscope`);
  redirect(`/app/projects/${projectId}/budgetscope?saved=1&rows=${savedRows}`);
}

export async function compareBudgetsAction(projectId: string, formData: FormData) {
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) redirect("/app/dashboard");

  const currentBudgetId = formString(formData, "currentBudgetId");
  const priorBudgetId = formString(formData, "priorBudgetId");
  if (!currentBudgetId || !priorBudgetId) {
    redirect(`/app/projects/${projectId}/budgetscope?error=${encodedMessage("Choose a current budget and a prior budget before comparing.")}`);
  }
  if (currentBudgetId === priorBudgetId) {
    redirect(`/app/projects/${projectId}/budgetscope?error=${encodedMessage("Choose two different budgets to compare.")}`);
  }

  let comparisonId = "";
  try {
    const result = await saveBudgetComparison(user, project.id, {
      currentBudgetId,
      priorBudgetId,
      comparisonName: formString(formData, "comparisonName", "Budget comparison"),
      comparisonType: formString(formData, "comparisonType", "budget-to-budget"),
    });
    await trackUsageEvent(user, "budget_compared", {
      projectId,
      eventMetadata: {
        comparisonType: result.comparison.comparisonType,
        resultCount: result.results.length,
      },
    });
    await trackUsageEvent(user, "budget_report_generated", {
      projectId,
      eventMetadata: {
        comparisonType: result.comparison.comparisonType,
        totalVariance: result.report.executiveSummary.totalProjectCostVariance,
        percentVariance: result.report.executiveSummary.totalProjectPercentVariance,
      },
    });
    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath(`/app/projects/${projectId}/budgetscope`);
    comparisonId = result.comparison.id;
  } catch (error) {
    const message = error instanceof Error && /budget|compare|different|line item/i.test(error.message)
      ? error.message
      : userFacingStoreError(error);
    logEvent("error", "budgetscope.compare.failed", { userId: user.id, projectId, reason: errorMessage(error) });
    redirect(`/app/projects/${projectId}/budgetscope?error=${encodedMessage(message)}`);
  }

  redirect(`/app/projects/${projectId}/budgetscope?comparison=${comparisonId}`);
}
