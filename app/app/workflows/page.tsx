import { WorkflowCard } from "@/components/WorkflowCard";
import { WORKFLOWS } from "@/lib/platform-content";

export default function WorkflowsPage() {
  const categories = Array.from(new Set(WORKFLOWS.map((workflow) => workflow.category)));

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div>
        <p className="eyebrow">Workflows</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Guided construction workflows</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Start from the job you need done. Each workflow accepts pasted context, optional file references, and produces a copyable construction deliverable with a clearer next action.
        </p>
      </div>
      {categories.map((category) => (
        <section className="space-y-4" key={category}>
          <div>
            <p className="eyebrow">{category}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{category} workflows</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {WORKFLOWS.filter((workflow) => workflow.category === category).map((workflow) => (
              <WorkflowCard workflow={workflow} key={workflow.slug} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
