import Link from "next/link";

const FEATURES = [
  ["Contract vs Bid Comparison", "See where the subcontract does not match what you priced."],
  ["Hidden Scope Flags", "Catch vague language that can turn into unpaid work."],
  ["Exclusion Protection", "Verify your assumptions, clarifications, and exclusions are actually preserved."],
  ["Payment and Change Order Risk", "Find notice traps, pay-if-paid language, backcharge exposure, and waiver issues."],
  ["Local Requirement Checklist", "Generate permits, inspections, licensing, wage, and AHJ items to verify."],
  ["PDF Risk Report", "Download a clean report with issues, GC questions, and suggested revisions."],
];

const COMMON_ISSUES = [
  "Permits excluded in the bid but assigned in the subcontract",
  "Pay-if-paid or pay-when-paid language",
  "Acceleration at no additional compensation",
  "Prime contract flow-down terms not provided",
  "Proposal and exclusions not incorporated",
  "Broad indemnity or duty to defend",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="font-bold text-ink">
            SubScope Risk Review
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link href="/security" className="text-moss hover:text-ink">
              Security
            </Link>
            <Link href="/auth/login?returnTo=/app/dashboard" className="button-secondary">
              Log in
            </Link>
          </nav>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-[1200px] px-5 py-24 lg:px-8 lg:py-32">
          <p className="eyebrow">We compare what the GC wants you to sign against what you actually priced.</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
            Review your subcontract before you sign it.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-moss">
            Upload your subcontract, bid, exclusions, drawings, specs, and project documents. Get a clear risk report showing hidden scope, conflicting language, missing exclusions, and contract terms that could cost you money.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="button-primary px-5 py-3" href="/auth/login?returnTo=/app/projects/new">
              Start Contract Review
            </Link>
            <Link className="button-secondary px-5 py-3" href="/sample-report">
              View Sample Report
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(([title, body]) => (
            <article className="card p-8" key={title}>
              <h2 className="font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-moss">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line/45 bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">Common issues it catches</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Plain-English flags before execution</h2>
          </div>
          <ul className="grid gap-3">
            {COMMON_ISSUES.map((issue) => (
              <li className="rounded-[22px] border border-line/60 bg-paper px-5 py-4 text-sm font-medium text-ink shadow-sm" key={issue}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-5 px-5 py-20 lg:grid-cols-3 lg:px-8 lg:py-24">
        {["Low", "Moderate", "High", "Severe"].map((level) => (
          <div className="card p-8" key={level}>
            <p className="text-sm font-semibold text-ink">{level} risk</p>
            <p className="mt-2 text-sm leading-6 text-moss">
              Scope, payment, schedule, change order, backcharge, insurance, indemnity, AHJ, labor, design, warranty, flow-down, ambiguity, missing document, conflict, and financial exposure categories.
            </p>
          </div>
        ))}
      </section>

      <section className="border-t border-line/45 bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5 px-5 py-16 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Ready to check the subcontract?</h2>
            <p className="mt-2 text-sm leading-6 text-moss">
              Documents are private to your account, and you can delete uploads or projects when you are done.
            </p>
          </div>
          <Link className="button-primary px-5 py-3" href="/auth/login?returnTo=/app/projects/new">
            Start Contract Review
          </Link>
        </div>
      </section>
    </main>
  );
}
