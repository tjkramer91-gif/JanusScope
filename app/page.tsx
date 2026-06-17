import Link from "next/link";
import {
  COMING_SOON_PRODUCTS,
  HOW_IT_WORKS_STEPS,
  PROBLEM_POINTS,
  SECURITY_CONTROLS,
  SUBSCOPE_REVIEW_AREAS,
} from "@/lib/subscope-content";

const PREVIEW_ROWS = [
  ["Bid exclusions", "Subcontract assigns permits and inspections"],
  ["Drawings vs specs", "Spec section adds delegated design language"],
  ["Schedule", "Acceleration rights without clear compensation"],
  ["Payment", "Strict notice and conditional payment language"],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line/45 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="font-semibold tracking-tight text-ink">
            JanusScope
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/subscope" className="hidden rounded-full px-4 py-2 text-moss hover:bg-paper hover:text-ink sm:inline-flex">
              SubScope
            </Link>
            <Link href="#security" className="hidden rounded-full px-4 py-2 text-moss hover:bg-paper hover:text-ink sm:inline-flex">
              Security
            </Link>
            <Link href="/auth/login?returnTo=/app/projects/new" className="button-primary px-5 py-2.5">
              Try SubScope
            </Link>
          </nav>
        </div>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Construction scope risk review</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-ink md:text-6xl">
              JanusScope helps construction teams find scope risk before it costs them money.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-moss">
              A document review and project intelligence platform built for construction. Start with SubScope: review GC contracts, compare them against your bid, find hidden scope, and generate clarification questions before you sign.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="button-primary px-6 py-3" href="/auth/login?returnTo=/app/projects/new">
                Try SubScope
              </Link>
              <Link className="button-secondary px-6 py-3" href="#how-it-works">
                See How It Works
              </Link>
            </div>
            <p className="mt-5 max-w-2xl text-xs leading-5 text-moss">
              SubScope is not legal advice and does not replace your attorney. It helps subcontractors organize contract risk, questions, conflicts, and missing items before execution.
            </p>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="rounded-[24px] border border-line/60 bg-paper p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-steel">SubScope preview</p>
                  <h2 className="mt-1 text-xl font-semibold text-ink">Pre-signing review package</h2>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brick shadow-sm">
                  High risk
                </span>
              </div>
              <div className="mt-5 grid gap-3">
                {PREVIEW_ROWS.map(([label, finding]) => (
                  <div className="rounded-[20px] border border-line/60 bg-white p-4 shadow-sm" key={label}>
                    <p className="text-xs font-semibold uppercase text-moss">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{finding}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[20px] bg-ink p-5 text-white">
                <p className="text-xs font-semibold uppercase text-white/65">Generated questions</p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Confirm whether proposal exclusions are incorporated, whether addendum 03 changes the scope, and whether notice deadlines override standard change order procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/45 bg-white" id="problem">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Problem</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Subcontractors lose money when small contract details turn into broad obligations.</h2>
            <p className="mt-4 text-sm leading-6 text-moss">
              SubScope is focused on the practical review work that happens before signing: compare what the GC wants signed against what was priced, excluded, clarified, and assumed.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROBLEM_POINTS.map((point) => (
              <div className="rounded-[22px] border border-line/60 bg-paper px-5 py-4 text-sm font-semibold leading-6 text-ink" key={point}>
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24" id="subscope">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">SubScope product preview</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">A focused workflow for subcontractor contract and scope review.</h2>
          </div>
          <Link className="button-secondary" href="/subscope">
            View SubScope
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {SUBSCOPE_REVIEW_AREAS.slice(0, 8).map((area) => (
            <article className="card p-6" key={area}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf3ff] text-sm font-semibold text-steel">
                {area.slice(0, 1)}
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{area}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">Flag conflicts, missing backup, and questions that should be resolved before execution.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line/45 bg-white" id="how-it-works">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-ink">A faster path from package upload to prioritized risk output.</h2>
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

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24" id="security">
        <div>
          <p className="eyebrow">Security and data controls</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">Designed around private project documents and controlled access.</h2>
          <p className="mt-4 text-sm leading-6 text-moss">
            The product direction is private by default: documents belong to the customer workspace, controls stay visible, and deletion/export paths are first-class.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECURITY_CONTROLS.map((control) => (
            <div className="rounded-[22px] border border-line/60 bg-white p-5 text-sm font-semibold leading-6 text-ink shadow-sm" key={control}>
              {control}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto max-w-[1180px] px-5 py-20 lg:px-8 lg:py-24">
          <p className="eyebrow">Coming soon</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">JanusScope will expand beyond SubScope later.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {COMING_SOON_PRODUCTS.map((product) => (
              <article className="card p-8" key={product.name}>
                <p className="text-xs font-semibold uppercase text-steel">{product.audience}</p>
                <h3 className="mt-3 text-2xl font-semibold text-ink">{product.name}</h3>
                <p className="mt-3 text-sm leading-6 text-moss">{product.body}</p>
                <span className="mt-6 inline-flex rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
                  Coming soon
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6 rounded-[32px] border border-line/60 bg-ink p-8 text-white shadow-card sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase text-white/60">Start with SubScope</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">Review the subcontract before it becomes your cost problem.</h2>
          </div>
          <Link className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card" href="/auth/login?returnTo=/app/projects/new">
            Try SubScope
          </Link>
        </div>
      </section>
    </main>
  );
}
