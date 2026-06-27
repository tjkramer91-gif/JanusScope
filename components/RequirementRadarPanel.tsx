"use client";

import { FormEvent, useMemo, useState } from "react";
import { OUTPUT_AUDIENCES, REQUIREMENT_BUCKETS, type RequirementBucketDefinition } from "@/lib/platform-content";

function buildRequirementOutput(buckets: RequirementBucketDefinition[], values: Record<string, string>) {
  const selectedAudience = values.audience || "Internal team";
  const locationLine = [values.location, values.projectType, values.scopeOfWork].filter(Boolean).join(" | ");

  return [
    "Requirement Radar review",
    "",
    "This is a requirement issue-spotting tool, not a final compliance determination. Confirm applicability with the AHJ, owner, lender, funding agency, architect, engineer, or qualified professional before relying on it.",
    "",
    "Project context",
    locationLine || "No project context provided yet.",
    "",
    `Output audience: ${selectedAudience}`,
    "",
    "Likely requirement buckets to verify",
    ...buckets.map((bucket) => `- ${bucket.title}: ${bucket.summary}`),
    "",
    "Questions to ask next",
    ...buckets.flatMap((bucket) => bucket.questions.slice(0, 2).map((question) => `- ${question}`)),
    "",
    "Documents to request",
    ...buckets.flatMap((bucket) => bucket.documents.slice(0, 2).map((document) => `- ${document}`)),
    "",
    "Who to verify with",
    ...Array.from(new Set(buckets.flatMap((bucket) => bucket.verifyWith))).map((party) => `- ${party}`),
  ].join("\n");
}

export function RequirementRadarPanel() {
  const [values, setValues] = useState<Record<string, string>>({
    location: "",
    projectType: "",
    buildingType: "",
    occupancy: "",
    buildingAge: "",
    scopeOfWork: "",
    fundingType: "",
    audience: OUTPUT_AUDIENCES[0],
  });
  const [hasOutput, setHasOutput] = useState(false);

  const recommendedBuckets = useMemo(() => {
    const lower = Object.values(values).join(" ").toLowerCase();
    return REQUIREMENT_BUCKETS.filter((bucket) => {
      if (bucket.id === "resident") {
        return /(occupied|unit|resident|tenant|relocation|access)/.test(lower);
      }
      if (bucket.id === "federal" || bucket.id === "workforce") {
        return /(federal|grant|loan|davis|bacon|prevailing|wage|mbe|wbe)/.test(lower);
      }
      return true;
    });
  }, [values]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasOutput(true);
  }

  return (
    <div className="space-y-8">
      <section className="card p-8 sm:p-10">
        <div className="mb-6">
          <p className="eyebrow">Requirement Radar</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Issue-spot likely verification buckets</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Use project type, scope, occupancy, and funding context to identify what likely needs outside confirmation.
          </p>
        </div>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
          {[
            ["location", "Project location"],
            ["projectType", "Project type"],
            ["buildingType", "Building type"],
            ["occupancy", "Occupancy"],
            ["buildingAge", "Building age"],
            ["fundingType", "Funding type"],
          ].map(([key, label]) => (
            <label key={key}>
              <span className="field-label">{label}</span>
              <input
                className="field"
                value={values[key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
                placeholder={label}
              />
            </label>
          ))}
          <label className="md:col-span-2">
            <span className="field-label">Scope of work</span>
            <textarea
              className="field min-h-32"
              value={values.scopeOfWork ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, scopeOfWork: event.target.value }))}
              placeholder="Describe the renovation, new construction, occupied work, systems affected, and known concerns."
            />
          </label>
          <label>
            <span className="field-label">Output audience</span>
            <select className="field" value={values.audience} onChange={(event) => setValues((current) => ({ ...current, audience: event.target.value }))}>
              {OUTPUT_AUDIENCES.map((audience) => (
                <option key={audience} value={audience}>
                  {audience}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="button-primary w-full" type="submit">
              Run Requirement Radar
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {recommendedBuckets.map((bucket) => (
          <article className="card p-6" key={bucket.id}>
            <p className="eyebrow">{bucket.title}</p>
            <p className="mt-3 text-sm leading-6 text-moss">{bucket.summary}</p>
            <div className="mt-4 grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-steel">Questions</p>
                <ul className="mt-2 grid gap-2 text-sm leading-6 text-moss">
                  {bucket.questions.map((question) => (
                    <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={question}>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-steel">Verify with</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {bucket.verifyWith.map((party) => (
                    <span className="rounded-full border border-line/60 bg-paper px-3 py-2 text-xs font-semibold text-moss" key={party}>
                      {party}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {hasOutput ? (
        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Draft requirement review</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink">
            {buildRequirementOutput(recommendedBuckets, values)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
