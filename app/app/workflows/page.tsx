import { WorkflowCard } from "@/components/WorkflowCard";
import { WORKFLOWS } from "@/lib/platform-content";

export default function WorkflowsPage() {
  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div>
        <p className="eyebrow">Workflows</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Guided construction workflows</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Start from the job you need done. Each workflow accepts pasted context, optional file references, and produces a copyable construction deliverable.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {WORKFLOWS.map((workflow) => (
          <WorkflowCard workflow={workflow} key={workflow.slug} />
        ))}
      </div>
    </div>
  );
}
