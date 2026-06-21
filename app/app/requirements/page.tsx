import { RequirementRadarPanel } from "@/components/RequirementRadarPanel";
import { REQUIREMENT_BUCKETS } from "@/lib/platform-content";

export default function RequirementsPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Requirement Radar</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Requirement issue spotting for construction projects</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          JanusScope identifies likely requirement buckets and the questions the team should verify. It should not be treated as final code, legal, or funding compliance.
        </p>
      </div>

      <RequirementRadarPanel />

      <section className="card p-8 sm:p-10">
        <p className="eyebrow">Requirement buckets</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Common areas that deserve verification</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {REQUIREMENT_BUCKETS.map((bucket) => (
            <article className="rounded-[22px] border border-line/60 bg-paper p-6" key={bucket.id}>
              <h3 className="text-lg font-semibold text-ink">{bucket.title}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">{bucket.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
