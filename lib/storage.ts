import { createEmptyProject, DOCUMENT_CATALOG } from "@/lib/catalogs";
import { Project } from "@/lib/types";

const STORAGE_KEY = "subscope.projects.v1";

function normalizeProject(value: Partial<Project>): Project {
  const empty = createEmptyProject();
  const documents = DOCUMENT_CATALOG.map((document) => {
    const saved = value.documents?.find((item) => item.id === document.id);
    return { ...document, available: Boolean(saved?.available) };
  });

  return {
    ...empty,
    ...value,
    documents,
    uploadedFiles: value.uploadedFiles ?? [],
  };
}

export function loadSavedProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Partial<Project>[]).map(normalizeProject) : [];
  } catch {
    return [];
  }
}

export function saveProject(project: Project): Project[] {
  const projects = loadSavedProjects();
  const saved = { ...project, updatedAt: new Date().toISOString() };
  const next = [saved, ...projects.filter((item) => item.id !== saved.id)].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteSavedProject(projectId: string): Project[] {
  const next = loadSavedProjects().filter((project) => project.id !== projectId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
