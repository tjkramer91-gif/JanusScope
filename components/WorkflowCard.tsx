import Link from "next/link";
import type { WorkflowDefinition } from "@/lib/platform-content";

export function WorkflowCard({ workflow }: { workflow: WorkflowDefinition }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{workflow.category}</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">{workflow.title}</h2>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
          Workflow
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-moss">{workflow.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {workflow.bestFor.slice(0, 2).map((section) => (
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={section}>
            {section}
          </span>
        ))}
      </div>
      <Link className="button-primary mt-6" href={`/app/workflows/${workflow.slug}`}>
        {workflow.cta}
      </Link>
    </article>
  );
}
