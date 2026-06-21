import Link from "next/link";
import { createSourceVerificationSampleProjectAction } from "@/app/app/actions";
import { DashboardWorkbench } from "@/components/DashboardWorkbench";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { SubScopeMemory } from "@/components/SubScopeMemory";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { requireUser } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/store";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const status = await searchParams;
  const user = await requireUser();
  const projects = await listProjects(user);
  const reportReadyCount = projects.filter((project) => project.status === "report-ready").length;
  const uploadedCount = projects.filter((project) => project.uploadedFiles.length > 0).length;
  const activeCount = projects.filter((project) => project.status !== "report-ready").length;
  const projectSummaries = projects.map((project) => ({
    id: project.id,
    name: project.name,
    location: `${project.city}, ${project.state}`,
    statusLabel: PROJECT_STATUS_LABELS[project.status],
    riskText: project.riskScore === null ? "Pending review and project setup." : `Risk ${project.riskScore}/100 · ${project.riskLevel}`,
    href: project.status === "report-ready" ? `/app/projects/${project.id}/report` : `/app/projects/${project.id}/upload`,
  }));

  return (
    <div className="space-y-8">
      {status?.error ? <StatusBanner tone="error">{status.error}</StatusBanner> : null}
      <div className="flex flex-wrap justify-end gap-2">
        <form action={createSourceVerificationSampleProjectAction}>
          <PendingSubmitButton className="button-secondary" pendingLabel="Creating sample...">
            Create Source-Backed Sample
          </PendingSubmitButton>
        </form>
        <Link href="/app/projects/new" className="button-primary">
          Create Project
        </Link>
      </div>
      <DashboardWorkbench
        counts={{ savedProjects: projects.length, activeWork: activeCount, reportsReady: reportReadyCount }}
        projects={projectSummaries}
      />
      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Testing</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Source-backed demo project</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
              Use the sample project to exercise upload, review, report, and source-verification flow without bringing in real project material.
            </p>
          </div>
          <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
            {uploadedCount} project{uploadedCount === 1 ? "" : "s"} with documents
          </span>
        </div>
        <div className="mt-6">
          <SubScopeMemory />
        </div>
      </section>
    </div>
  );
}
