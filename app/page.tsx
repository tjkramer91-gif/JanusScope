import Link from "next/link";
import { FAKE_SAMPLE_DATA_TRUST_NOTE, KNOWLEDGE_PRESERVATION_BULLETS } from "@/lib/content-safety";
import { HOW_JANUS_WORKS, LANDING_HELP_AREAS, USER_TYPES, WORKFLOWS } from "@/lib/platform-content";

const PROMISE_LINES = ["Better questions.", "Cleaner scopes.", "Fewer expensive surprises."];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line/45 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="font-semibold tracking-tight text-ink">
            JanusScope
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="#workflows" className="hidden rounded-full px-4 py-2 text-moss hover:bg-paper hover:text-ink sm:inline-flex">
              Workflows
            </Link>
            <Link href="#consulting" className="hidden rounded-full px-4 py-2 text-moss hover:bg-paper hover:text-ink sm:inline-flex">
              Consulting
            </Link>
            <Link href="/auth/login?returnTo=/app/dashboard" className="button-primary px-5 py-2.5">
              Start Reviewing
            </Link>
          </nav>
        </div>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">JanusScope</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-ink md:text-6xl">
              AI construction help for scope, contracts, bids, RFIs, change orders, budgets, and project risk.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-moss">
              Find the miss before it costs you. JanusScope helps construction teams review documents, ask better questions, create cleaner project communication, and catch risk hiding in unclear scope, bad assumptions, and rushed decisions.
            </p>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-ink">
              Construction experience is getting harder to replace. JanusScope helps teams keep the judgment moving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="button-primary px-6 py-3" href="/auth/login?returnTo=/app/dashboard">
                Start Reviewing
              </Link>
              <Link className="button-secondary px-6 py-3" href="#workflows">
                View Workflows
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-5 text-moss">
              JanusScope helps with practical construction risk and communication. It does not replace legal counsel, estimators, project managers, supers, or professional judgment.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <p className="eyebrow">Workbench preview</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">What can hurt this project?</h2>
            <div className="mt-6 grid gap-3">
              {[
                ["Scope ownership", "Who owns demo, patching, coordination, permits, testing, and cleanup?"],
                ["Bid vs contract", "What did we price, exclude, assume, or miss?"],
                ["Field issue", "Is this an RFI, change order, clarification, or internal risk item?"],
                ["Budget exposure", "Which line items need backup before buyout or owner review?"],
              ].map(([label, body]) => (
                <div className="rounded-[20px] border border-line/60 bg-paper p-5" key={label}>
                  <p className="text-xs font-semibold uppercase text-moss">{label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-ink">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[22px] bg-ink p-5 text-white">
              <p className="text-xs font-semibold uppercase text-white/65">Main promise</p>
              <div className="mt-3 grid gap-2">
                {PROMISE_LINES.map((line) => (
                  <p className="text-lg font-semibold" key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Institutional knowledge</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Construction knowledge is leaving the industry.</h2>
            <p className="mt-4 text-sm leading-6 text-moss">
              Experienced estimators, project managers, superintendents, and preconstruction leaders are retiring, changing roles, or leaving the industry faster than companies can replace them. JanusScope helps teams preserve practical construction judgment by turning common review habits into guided AI workflows, prompts, templates, and checklists.
            </p>
            <p className="mt-4 text-sm font-semibold leading-6 text-ink">
              Built for the gray areas where scope, contracts, budgets, bids, RFIs, change orders, and field realities do not line up cleanly.
            </p>
          </div>
          <div className="grid gap-3">
            {KNOWLEDGE_PRESERVATION_BULLETS.map((bullet) => (
              <div className="rounded-[20px] border border-line/60 bg-paper p-5 text-sm font-semibold leading-6 text-ink" key={bullet}>
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">What JanusScope helps with</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">A construction workbench for the gray areas.</h2>
            <p className="mt-4 text-sm leading-6 text-moss">
              Use it when the team needs a clearer question, a cleaner scope, a better record, or a faster first pass before the issue gets expensive.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {LANDING_HELP_AREAS.map((area) => (
              <div className="rounded-[20px] border border-line/60 bg-paper px-5 py-4 text-sm font-semibold leading-6 text-ink" key={area}>
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow">Who it helps</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Built for construction teams, not generic office work.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USER_TYPES.map((userType) => (
            <div className="rounded-[20px] border border-line/60 bg-white p-5 text-sm font-semibold text-ink shadow-sm" key={userType}>
              {userType}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-ink">Pick the work, add the facts, generate something useful.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {HOW_JANUS_WORKS.map(([title, body], index) => (
              <article className="rounded-[22px] border border-line/60 bg-paper p-6" key={title}>
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

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24" id="workflows">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Workflows</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Start with the construction task, not a long intake form.</h2>
          </div>
          <Link className="button-secondary" href="/auth/login?returnTo=/app/workflows">
            Open Workflows
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {WORKFLOWS.map((workflow) => (
            <article className="rounded-[20px] border border-line/60 bg-white p-5 shadow-sm" key={workflow.slug}>
              <p className="text-xs font-semibold uppercase text-steel">{workflow.shortTitle}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink">{workflow.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line/45 bg-white" id="consulting">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 px-5 py-20 lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Consulting</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Need a second set of eyes?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-moss">
              Request a JanusScope review for contract language, scope gaps, bid packages, budget risk, change order support, or preconstruction handoff.
            </p>
          </div>
          <Link className="button-primary" href="/auth/login?returnTo=/app/consulting">
            Request Review
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] px-5 py-10 text-xs leading-5 text-moss lg:px-8">
        {FAKE_SAMPLE_DATA_TRUST_NOTE} Your project documents may contain sensitive information. Do not upload documents you are not authorized to review. During beta, confirm storage and retention settings before using JanusScope for confidential projects.
      </footer>
    </main>
  );
}
