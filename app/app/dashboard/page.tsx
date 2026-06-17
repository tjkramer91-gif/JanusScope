import Link from "next/link";
import { createSourceVerificationSampleProjectAction } from "@/app/app/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { SubScopeMemory } from "@/components/SubScopeMemory";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/store";
import { SUBSCOPE_REVIEW_AREAS } from "@/lib/subscope-content";

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
  const openRiskCount = projects.reduce((count, project) => count + (project.riskScore ? Math.max(1, Math.round(project.riskScore / 20)) : 0), 0);

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">SubScope dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Contract and scope review workspace</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Track subcontract reviews, compare GC terms against your bid, and keep questions visible before execution.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={createSourceVerificationSampleProjectAction}>
            <PendingSubmitButton className="button-secondary" pendingLabel="Creating sample...">
              Create Source-Backed Sample
            </PendingSubmitButton>
          </form>
          <Link href="/app/projects/new" className="button-primary">
            Create Project
          </Link>
        </div>
      </div>

      {status?.error ? <StatusBanner tone="error">{status.error}</StatusBanner> : null}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Active reviews", projects.length],
          ["Packages with documents", uploadedCount],
          ["Reports ready", reportReadyCount],
        ].map(([label, value]) => (
          <div className="card p-7" key={label}>
            <p className="text-xs font-semibold uppercase text-moss">{label}</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
            <p className="mt-2 text-sm leading-6 text-moss">SubScope project data in this workspace.</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-line/60 p-8 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Projects</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">SubScope reviews</h2>
              </div>
              <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
                {openRiskCount} tracked risk signals
              </span>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-ink">No SubScope projects yet.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-moss">
                Create a project to upload documents, compare scope and contract language, and generate a report-style risk output.
              </p>
              <Link href="/app/projects/new" className="button-primary mt-5">
                Create Project
              </Link>
              <form action={createSourceVerificationSampleProjectAction} className="mt-3">
                <PendingSubmitButton className="button-secondary" pendingLabel="Creating sample...">
                  Create Source-Backed Sample
                </PendingSubmitButton>
              </form>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-paper/70 text-xs uppercase text-moss">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">GC</th>
                    <th className="px-4 py-3 font-semibold">Trade</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {projects.map((project) => (
                    <tr className="transition hover:bg-paper/60" key={project.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{project.name}</p>
                        <p className="text-xs text-moss">{project.city}, {project.state}</p>
                      </td>
                      <td className="px-4 py-4 text-moss">{project.gcName}</td>
                      <td className="px-4 py-4 text-moss">{project.tradeType}</td>
                      <td className="px-4 py-4 text-moss">{formatCurrency(project.contractAmount)}</td>
                      <td className="px-4 py-4">{PROJECT_STATUS_LABELS[project.status]}</td>
                      <td className="px-4 py-4 text-moss">
                        {project.riskScore === null ? "Pending review" : `${project.riskScore}/100 · ${project.riskLevel}`}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          className="button-secondary"
                          href={project.status === "report-ready" ? `/app/projects/${project.id}/report` : `/app/projects/${project.id}/upload`}
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="card p-8 sm:p-10">
          <p className="eyebrow">Review package</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Comparison coverage</h2>
          <p className="mt-3 text-sm leading-6 text-moss">
            SubScope is focused on the checks subcontractors need before signing. These are not legal conclusions.
          </p>
          <div className="mt-6 grid gap-3">
            {SUBSCOPE_REVIEW_AREAS.slice(0, 7).map((area) => (
              <div className="rounded-[20px] border border-line/60 bg-paper px-5 py-4" key={area}>
                <p className="text-sm font-semibold text-ink">{area}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <SubScopeMemory />
    </div>
  );
}
