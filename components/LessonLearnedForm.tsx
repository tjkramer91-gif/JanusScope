"use client";

import { FormEvent, useState } from "react";

const FIELDS = [
  ["project", "Project"],
  ["trade", "Trade"],
  ["phase", "Project phase"],
  ["missedScope", "Missed scope"],
  ["whatHappened", "What happened"],
  ["cause", "Cause"],
  ["costImpact", "Cost impact"],
  ["scheduleImpact", "Schedule impact"],
  ["prevention", "How to prevent next time"],
  ["checklistItem", "Checklist item to add"],
] as const;

export function LessonLearnedForm() {
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <section className="card p-8 sm:p-10">
      <div>
        <p className="eyebrow">Add lesson</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Capture the miss while it is still useful</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          This MVP stores the structure in the UI so teams can standardize what they want to remember next time.
        </p>
      </div>
      <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={submit}>
        {FIELDS.map(([key, label], index) => (
          <label className={index > 2 ? "md:col-span-2" : ""} key={key}>
            <span className="field-label">{label}</span>
            {index > 2 ? (
              <textarea
                className="field min-h-28"
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
              />
            ) : (
              <input
                className="field"
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
              />
            )}
          </label>
        ))}
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          {saved ? <p className="text-sm font-semibold text-steel">Lesson saved in this workspace draft.</p> : <span />}
          <button className="button-primary" type="submit">
            Save Lesson
          </button>
        </div>
      </form>
    </section>
  );
}
