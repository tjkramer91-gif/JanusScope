import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkflowInputForm } from "@/components/WorkflowInputForm";
import { getWorkflow, WORKFLOWS } from "@/lib/platform-content";

export function generateStaticParams() {
  return WORKFLOWS.map((workflow) => ({ workflowSlug: workflow.slug }));
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ workflowSlug: string }>;
}) {
  const { workflowSlug } = await params;
  const workflow = getWorkflow(workflowSlug);
  if (!workflow) notFound();

  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Workflow</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{workflow.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">{workflow.purpose}</p>
        </div>
        <Link className="button-secondary" href="/app/workflows">
          All Workflows
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card p-6 md:col-span-1">
          <p className="eyebrow">Best used by</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workflow.bestFor.map((role) => (
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={role}>
                {role}
              </span>
            ))}
          </div>
        </div>
        <div className="card p-6 md:col-span-2">
          <p className="eyebrow">Output format</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {workflow.outputSections.map((section) => (
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={section}>
                {section}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WorkflowInputForm workflow={workflow} />
    </div>
  );
}
