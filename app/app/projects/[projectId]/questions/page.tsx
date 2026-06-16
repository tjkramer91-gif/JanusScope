import { notFound } from "next/navigation";
import { saveChecklistAction } from "@/app/app/actions";
import { ANSWER_OPTIONS, INTAKE_QUESTIONS } from "@/lib/checklist";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";
import { SUBSCOPE_REVIEW_AREAS } from "@/lib/subscope-content";

export default async function QuestionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();
  const action = saveChecklistAction.bind(null, project.id);
  const answerMap = new Map(project.intakeAnswers.map((answer) => [answer.questionKey, answer.answer]));

  return (
    <form action={action} className="mx-auto max-w-[1180px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 3</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Review package</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Check the document set before generating a report. Not sure is useful because SubScope turns uncertainty into GC questions and verification items.
          </p>
        </div>
        <button className="button-primary" type="submit">Continue to Risk Output</button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="card p-8 sm:p-10">
          <p className="eyebrow">Comparison dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{project.name}</h2>
          <p className="mt-3 text-sm leading-6 text-moss">
            SubScope compares contract language, bid assumptions, document coverage, and signing risks. This is a construction risk review, not legal advice.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              ["Uploaded files", project.uploadedFiles.length],
              ["Pasted contract characters", project.subcontractText.length],
              ["Pasted bid characters", project.bidText.length],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-[20px] border border-line/60 bg-paper px-5 py-4" key={label}>
                <span className="text-sm font-semibold text-moss">{label}</span>
                <span className="text-lg font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {SUBSCOPE_REVIEW_AREAS.map((area) => (
            <div className="rounded-[22px] border border-line/60 bg-white p-5 shadow-sm" key={area}>
              <p className="text-sm font-semibold text-ink">{area}</p>
              <p className="mt-2 text-xs leading-5 text-moss">Included in the review package mockup.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card divide-y divide-line overflow-hidden">
        <div className="p-8 sm:p-10">
          <h2 className="section-title">Subcontractor assumptions checklist</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Use this to document what was priced, excluded, or unknown before the report generates questions and suggested comments.
          </p>
        </div>
        {INTAKE_QUESTIONS.map(([key, question], index) => (
          <div className="grid gap-4 p-6 md:grid-cols-[1fr_240px] md:items-center" key={key}>
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-semibold text-steel">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-6 text-ink">{question}</p>
            </div>
            <select className="field" name={key} defaultValue={answerMap.get(key) ?? "not-sure"}>
              {ANSWER_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button className="button-primary" type="submit">Save Review Package and Generate Output</button>
      </div>
    </form>
  );
}
