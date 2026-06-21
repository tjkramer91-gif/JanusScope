import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECT_STATUS_LABELS } from "@/lib/catalogs";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Project workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{project.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Open documents, review output, project facts, and next workflow steps for this construction project.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="button-primary" href={`/app/projects/${project.id}/upload`}>
            Upload Documents
          </Link>
          <Link className="button-secondary" href={`/app/projects/${project.id}/report`}>
            Open Report
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Status", PROJECT_STATUS_LABELS[project.status]],
          ["Files", `${project.uploadedFiles.length}`],
          ["Risk", project.riskScore === null ? "Pending" : `${project.riskScore}/100`],
          ["Amount", formatCurrency(project.contractAmount)],
        ].map(([label, value]) => (
          <div className="card p-6" key={label}>
            <p className="text-xs font-semibold uppercase text-moss">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="card p-8 sm:p-10">
        <p className="eyebrow">Project facts</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Client / GC", project.gcName || project.ownerName || "Not set"],
            ["Trade / scope", project.tradeType || "Not set"],
            ["Location", [project.projectAddress, project.city, project.state, project.zip].filter(Boolean).join(", ") || "Not set"],
            ["Project type", project.projectType],
            ["Bid date", project.bidDate || "Not set"],
            ["Execution deadline", project.executionDeadline || "Not set"],
          ].map(([label, value]) => (
            <div className="rounded-[18px] border border-line/60 bg-paper p-5" key={label}>
              <p className="text-xs font-semibold uppercase text-moss">{label}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <p className="eyebrow">Next steps</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Upload package", `/app/projects/${project.id}/upload`],
            ["Review questions", `/app/projects/${project.id}/questions`],
            ["Open report", `/app/projects/${project.id}/report`],
            ["Run another workflow", "/app/workflows"],
          ].map(([label, href]) => (
            <Link className="rounded-[18px] border border-line/60 bg-paper p-5 text-sm font-semibold text-ink hover:bg-white" href={href} key={label}>
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
