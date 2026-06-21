import { LessonLearnedForm } from "@/components/LessonLearnedForm";

const SAMPLE_LESSONS = [
  {
    title: "Electrical panel scope carried without drywall patching",
    trade: "Electrical",
    phase: "Buyout",
    summary: "Proposal covered panel replacement but missed drywall removal and patching around new gear in occupied units.",
  },
  {
    title: "Occupied flooring package missed furniture moving",
    trade: "Flooring",
    phase: "Bidding",
    summary: "Scope assumed empty units. Field reality required crew time for resident furniture and repeat visits.",
  },
  {
    title: "PCNA immediate needs not matched in GC budget",
    trade: "General",
    phase: "Due diligence",
    summary: "Capital needs report called out urgent envelope repairs that were only partially covered in pricing.",
  },
];

export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Lessons Learned</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Turn misses into reusable team judgment</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Capture what happened, why it mattered, and what checklist item the team should carry next time.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {SAMPLE_LESSONS.map((lesson) => (
          <article className="card p-6" key={lesson.title}>
            <p className="eyebrow">{lesson.trade} · {lesson.phase}</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">{lesson.title}</h2>
            <p className="mt-3 text-sm leading-6 text-moss">{lesson.summary}</p>
          </article>
        ))}
      </div>

      <LessonLearnedForm />
    </div>
  );
}
