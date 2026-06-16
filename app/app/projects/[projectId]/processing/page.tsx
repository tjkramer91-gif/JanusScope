import { notFound } from "next/navigation";
import { runReviewAction } from "@/app/app/actions";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";

const STEPS = [
  "Uploading documents",
  "Extracting text",
  "Classifying documents",
  "Comparing contract to bid",
  "Checking exclusions",
  "Generating risk report",
  "Creating PDF",
  "Creating CSV issue log",
];

export default async function ProcessingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();
  const action = runReviewAction.bind(null, project.id);

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <div>
        <p className="eyebrow">Processing</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Ready to generate the risk report</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Background jobs can replace this step later. For the MVP, the server action runs the deterministic review and saves structured JSON for the report.
        </p>
      </div>

      <section className="card divide-y divide-line overflow-hidden">
        {STEPS.map((step, index) => (
          <div className="flex items-center gap-4 p-6" key={step}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-semibold text-steel">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-ink">{step}</p>
              <p className="mt-1 text-sm text-moss">Prepared for this review.</p>
            </div>
          </div>
        ))}
      </section>

      <form action={action} className="flex justify-end">
        <button className="button-primary" type="submit">Run review</button>
      </form>
    </div>
  );
}
