import Link from "next/link";
import { SubScopeMemory } from "@/components/SubScopeMemory";
import {
  DOCUMENT_UPLOAD_AREAS,
  HOW_IT_WORKS_STEPS,
  RISK_OUTPUT_AREAS,
  SUBSCOPE_REVIEW_AREAS,
} from "@/lib/subscope-content";

const PROJECT_FIELDS = [
  "Project name",
  "GC if known",
  "Trade/scope if known",
  "Contract amount",
  "Project location",
  "Project notes",
];

const MOCK_FLAGS = [
  ["High-risk clause", "Prime contract flow-down applies even though prime terms are not attached."],
  ["Hidden scope", "Coordination, patching, and incidental work appear broader than the proposal."],
  ["Missing exclusion", "Proposal excludes permits, but subcontract assigns permit responsibility."],
  ["Clarification question", "Confirm which addenda and drawing revisions are included in the final scope."],
];

export default function SubScopePage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="font-semibold text-ink">
            JanusScope
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/" className="hidden rounded-full px-4 py-2 text-moss hover:bg-paper hover:text-ink sm:inline-flex">
              Platform
            </Link>
            <Link href="/auth/login?returnTo=/app/dashboard" className="button-primary px-5 py-2.5">
              Open JanusScope
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">SubScope</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-ink md:text-6xl">
              A contract and scope review workspace for subcontractors.
            </h1>
            <p className="mt-6 text-lg leading-8 text-moss">
              Build a review package, compare GC contract language against your bid, identify hidden scope, and generate questions before signing. SubScope is a risk review assistant, not legal advice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="button-primary" href="/auth/login?returnTo=/app/projects/new">
                Create Project
              </Link>
              <Link className="button-secondary" href="/sample-report">
                View Sample Report
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <div className="rounded-[24px] border border-line/60 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-steel">Dashboard shell</p>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">Subcontract review pipeline</h2>
                </div>
                <span className="rounded-full bg-[#eaf3ff] px-4 py-2 text-xs font-semibold text-steel">
                  Demo data
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Projects", "12"],
                  ["Open risks", "38"],
                  ["Top risks", "5"],
                ].map(([label, value]) => (
                  <div className="rounded-[22px] border border-line/60 bg-paper p-5" key={label}>
                    <p className="text-xs font-semibold uppercase text-moss">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {MOCK_FLAGS.map(([label, body]) => (
                  <div className="rounded-[20px] border border-line/60 bg-paper p-4" key={label}>
                    <p className="text-xs font-semibold uppercase text-moss">{label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-ink">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <p className="eyebrow">Core workflow</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-ink">From project facts to a report-style risk output.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {HOW_IT_WORKS_STEPS.map(([title, body], index) => (
              <article className="rounded-[26px] border border-line/60 bg-paper p-6" key={title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-steel shadow-sm">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-moss">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="card p-8">
            <p className="eyebrow">Step 1</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Create project</h2>
            <p className="mt-3 text-sm leading-6 text-moss">
              Capture only the facts needed to anchor the review.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PROJECT_FIELDS.map((field) => (
              <div className="rounded-[22px] border border-line/60 bg-white p-5 text-sm font-semibold text-ink shadow-sm" key={field}>
                {field}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="card p-8">
            <p className="eyebrow">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Upload documents</h2>
            <p className="mt-3 text-sm leading-6 text-moss">
              Upload the whole package in one place. JanusScope classifies the documents and starts the review.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {DOCUMENT_UPLOAD_AREAS.map((area) => (
              <div className="rounded-[22px] border border-line/60 bg-white p-5 text-sm font-semibold text-ink shadow-sm" key={area}>
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Step 3</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Review package comparison</h2>
            <p className="mt-4 text-sm leading-6 text-moss">
              SubScope is shaped around the comparisons subcontractors naturally make before signing.
            </p>
          </div>
          <div className="grid gap-3">
            {SUBSCOPE_REVIEW_AREAS.map((area) => (
              <div className="flex items-center justify-between rounded-[22px] border border-line/60 bg-paper p-5" key={area}>
                <span className="text-sm font-semibold text-ink">{area}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-moss shadow-sm">Review</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="card p-8 sm:p-10">
          <p className="eyebrow">Step 4</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Risk output</h2>
          <p className="mt-4 text-sm leading-6 text-moss">
            The report is built for internal review, GC clarification, and attorney follow-up when needed.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {RISK_OUTPUT_AREAS.map((area) => (
              <div className="rounded-[20px] border border-line/60 bg-paper p-4 text-sm font-semibold text-ink" key={area}>
                {area}
              </div>
            ))}
          </div>
        </div>
        <SubScopeMemory compact />
      </section>
    </main>
  );
}
