import { notFound } from "next/navigation";
import { saveChecklistAction } from "@/app/app/actions";
import { ANSWER_OPTIONS, INTAKE_QUESTIONS } from "@/lib/checklist";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";

export default async function QuestionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();
  const action = saveChecklistAction.bind(null, project.id);
  const answerMap = new Map(project.intakeAnswers.map((answer) => [answer.questionKey, answer.answer]));

  return (
    <form action={action} className="mx-auto max-w-[980px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Risk intake checklist</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{project.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Answer quickly. Not sure is useful because the report will turn uncertainty into GC questions and verification items.
          </p>
        </div>
        <button className="button-primary" type="submit">Save checklist</button>
      </div>

      <section className="card divide-y divide-line overflow-hidden">
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
        <button className="button-primary" type="submit">Save checklist and continue</button>
      </div>
    </form>
  );
}
