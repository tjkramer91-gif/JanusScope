import Link from "next/link";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/store";

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await listProjects(user);

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Saved construction projects</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Projects hold uploaded files, generated reviews, reports, risk registers, and future workflow history.
          </p>
        </div>
        <Link className="button-primary" href="/app/projects/new">
          Create Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <section className="card p-10 text-center">
          <p className="font-semibold text-ink">No projects yet.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-moss">
            Create a project to test the end-to-end upload, review, and report flow.
          </p>
          <Link className="button-primary mt-5" href="/app/projects/new">
            Create Project
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.map((project) => (
            <article className="card p-6" key={project.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{PROJECT_STATUS_LABELS[project.status]}</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">{project.name}</h2>
                  <p className="mt-2 text-sm text-moss">
                    {[project.city, project.state].filter(Boolean).join(", ") || project.projectAddress || "Location not set"}
                  </p>
                </div>
                <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
                  {project.uploadedFiles.length} file{project.uploadedFiles.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[18px] border border-line/60 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase text-moss">Client / GC</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{project.gcName || project.ownerName || "Not set"}</p>
                </div>
                <div className="rounded-[18px] border border-line/60 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase text-moss">Trade</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{project.tradeType || "Not set"}</p>
                </div>
                <div className="rounded-[18px] border border-line/60 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase text-moss">Amount</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(project.contractAmount)}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link className="button-primary" href={`/app/projects/${project.id}`}>
                  Open Project
                </Link>
                <Link className="button-secondary" href={`/app/projects/${project.id}/upload`}>
                  Upload Documents
                </Link>
                <Link className="button-secondary" href={`/app/projects/${project.id}/report`}>
                  Open Report
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
