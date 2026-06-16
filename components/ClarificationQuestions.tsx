import { SeverityBadge } from "@/components/SeverityBadge";
import { ClarificationQuestion, QuestionGroup } from "@/lib/types";

const GROUPS: QuestionGroup[] = [
  "GC / Contract Admin",
  "Estimating Team",
  "Project Manager",
  "Insurance / Broker",
  "Attorney",
  "AHJ / Local Authority",
  "Internal Decision",
];

export function ClarificationQuestions({ questions }: { questions: ClarificationQuestion[] }) {
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const groupQuestions = questions.filter((question) => question.group === group);
        if (groupQuestions.length === 0) return null;
        return (
          <section className="card p-8 sm:p-10" key={group}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="section-title">{group}</h2>
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss">
                {groupQuestions.length} question{groupQuestions.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-5 divide-y divide-line/60 border-y border-line/60">
              {groupQuestions.map((question, index) => (
                <div className="flex gap-4 py-5" key={question.id}>
                  <span className="text-sm font-semibold text-moss">{String(index + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-6 text-ink">{question.question}</p>
                  </div>
                  <SeverityBadge severity={question.priority} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
