import Link from "next/link";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { requireUser } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/store";

export default async function ReportsPage() {
  const user = await requireUser();
  const projects = await listProjects(user);
  const readyReports = projects.filter((project) => project.status === "report-ready");

  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div>
        <p className="eyebrow">Reports / Exports</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Generated project reports</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Reports distinguish user-provided information, JanusScope observations, verification items, and items that need professional review.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {["Contract review report", "Scope gap report", "Budget risk report", "RFI or change narrative"].map((type) => (
          <div className="card p-5" key={type}>
            <p className="text-sm font-semibold text-ink">{type}</p>
            <p className="mt-2 text-xs leading-5 text-moss">Structured export support</p>
          </div>
        ))}
      </section>

      {readyReports.length === 0 ? (
        <section className="card p-10 text-center">
          <p className="font-semibold text-ink">No reports are ready yet.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-moss">
            Upload documents to a project and run the review to generate the first report.
          </p>
          <Link className="button-primary mt-5" href="/app/projects">
            Open Projects
          </Link>
        </section>
      ) : (
        <div className="grid gap-5">
          {readyReports.map((project) => (
            <article className="card flex flex-wrap items-center justify-between gap-4 p-6" key={project.id}>
              <div>
                <p className="eyebrow">{PROJECT_STATUS_LABELS[project.status]}</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{project.name}</h2>
                <p className="mt-2 text-sm text-moss">
                  Risk: {project.riskScore ?? "Pending"}{project.riskScore === null ? "" : `/100 · ${project.riskLevel}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link className="button-primary" href={`/app/projects/${project.id}/report`}>
                  Open Report
                </Link>
                <Link className="button-secondary" href={`/app/projects/${project.id}/report/pdf`}>
                  PDF Placeholder
                </Link>
                <Link className="button-secondary" href={`/app/projects/${project.id}/report/csv`}>
                  CSV Issue Log
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
