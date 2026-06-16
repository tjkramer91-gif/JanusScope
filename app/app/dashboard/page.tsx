import Link from "next/link";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { requireUser } from "@/lib/server/auth";
import { listProjects } from "@/lib/server/store";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await listProjects(user);

  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Project reviews</h1>
        </div>
        <Link href="/app/projects/new" className="button-primary">Create new review</Link>
      </div>

      <section className="card overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-ink">No project reviews yet.</p>
            <p className="mt-2 text-sm text-moss">Create a review to upload documents and generate a risk report.</p>
            <Link href="/app/projects/new" className="button-primary mt-5">Create new review</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">GC</th>
                  <th className="px-4 py-3 font-semibold">Trade</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Risk score</th>
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
                    <td className="px-4 py-4">{PROJECT_STATUS_LABELS[project.status]}</td>
                    <td className="px-4 py-4 text-moss">{new Date(project.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-moss">
                      {project.riskScore === null ? "Not completed" : `${project.riskScore}/100 · ${project.riskLevel}`}
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
      </section>

      <div className="rounded-[24px] border border-line/60 bg-white p-6 text-sm leading-6 text-moss shadow-sm">
        Local demo storage is scoped by signed session user and organization. In production, use the included Supabase schema and row-level security policies.
      </div>
    </div>
  );
}
