import Link from "next/link";
import { createSourceVerificationSampleProjectAction } from "@/app/app/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { SubScopeMemory } from "@/components/SubScopeMemory";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { formatCurrency } from "@/lib/format";
import { DASHBOARD_WORK_ITEMS, WORKFLOWS } from "@/lib/platform-content";
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

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">What are you trying to work on today?</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Start with a construction task, ask Janus a question, or open a saved project. Contract package review is one workflow inside the broader JanusScope workbench.
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
          ["Saved projects", projects.length],
          ["Active work", activeCount],
          ["Reports ready", reportReadyCount],
        ].map(([label, value]) => (
          <div className="card p-7" key={label}>
            <p className="text-xs font-semibold uppercase text-moss">{label}</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
            <p className="mt-2 text-sm leading-6 text-moss">Current JanusScope workspace activity.</p>
          </div>
        ))}
      </section>

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Workflows</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Pick the job to be done</h2>
          </div>
          <Link className="button-secondary" href="/app/workflows">
            View All Workflows
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_WORK_ITEMS.map(([title, body, href]) => (
            <Link className="rounded-[22px] border border-line/60 bg-paper p-5 hover:border-steel hover:bg-white" href={href} key={title}>
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">{body}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-steel">Start workflow</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-line/60 p-8 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Projects</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Saved project work</h2>
              </div>
              <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
                {uploadedCount} with documents
              </span>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-ink">No projects yet.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-moss">
                Create a project to upload documents, run the package review, and keep reports tied to the right user and project.
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
                    <th className="px-4 py-3 font-semibold">Client / GC</th>
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
                      <td className="px-4 py-4 text-moss">{project.gcName || project.ownerName || "Not set"}</td>
                      <td className="px-4 py-4 text-moss">{project.tradeType || "Not set"}</td>
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
          <p className="eyebrow">Platform coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Initial JanusScope workflows</h2>
          <p className="mt-3 text-sm leading-6 text-moss">
            The current product now starts from common construction jobs and keeps SubScope package review available as the contract review path.
          </p>
          <div className="mt-6 grid gap-3">
            {WORKFLOWS.slice(0, 7).map((workflow) => (
              <Link className="rounded-[20px] border border-line/60 bg-paper px-5 py-4 hover:bg-white" href={`/app/workflows/${workflow.slug}`} key={workflow.slug}>
                <p className="text-sm font-semibold text-ink">{workflow.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <SubScopeMemory />
    </div>
  );
}
