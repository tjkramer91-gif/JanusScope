import Link from "next/link";
import { FAKE_SAMPLE_DATA_TRUST_NOTE } from "@/lib/content-safety";
import { SYNTHETIC_DATA_GOVERNANCE_PROMISES } from "@/lib/synthetic-data";

const TRUST_ITEMS = [
  "What users can upload",
  "User responsibility for authorization",
  "How files are stored",
  "How users can delete files",
  "How users can delete projects",
  "Whether uploaded documents are used for training",
  "Retention basics",
  "Synthetic sample data policy",
  "Sensitive information warning",
  "Share-Safe Mode explanation",
];

const DETAILS = [
  ["Private project documents", "Construction contracts, budgets, reports, proposals, and internal notes are sensitive. Teams should treat storage, sharing, and retention controls as first-class product concerns."],
  ["Authorization matters", "Users are responsible for ensuring they have authorization to upload and review the project material they use inside JanusScope."],
  ["Deletion and retention", "Uploaded files, reports, and projects should remain user-controlled actions. Production retention behavior should be documented clearly before confidential rollout."],
  ["Model-use boundary", "Customer project material should not be used for training outside models unless the customer explicitly authorizes it."],
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-semibold text-ink">
            JanusScope
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/trust" className="button-secondary">
              Trust Page
            </Link>
            <Link href="/auth/login?returnTo=/app/dashboard" className="button-primary">
              Open JanusScope
            </Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[1080px] px-5 py-20 lg:py-24">
        <p className="eyebrow">Data Governance & Privacy</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-ink">
          Data Governance & Privacy for synthetic demos and sensitive project reviews.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-moss">
          {FAKE_SAMPLE_DATA_TRUST_NOTE} JanusScope is a second set of eyes for construction risk, not a substitute for legal counsel, licensed design professionals, code officials, or professional judgment.
        </p>

        <div className="mt-10 grid gap-4">
          {SYNTHETIC_DATA_GOVERNANCE_PROMISES.map((point) => (
            <div className="rounded-[24px] border border-line/60 bg-white p-5 text-sm font-semibold leading-6 text-ink shadow-sm" key={point}>
              {point}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TRUST_ITEMS.map((point) => (
            <div className="rounded-[24px] border border-line/60 bg-white p-5 text-sm font-semibold leading-6 text-ink shadow-sm" key={point}>
              {point}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {DETAILS.map(([title, body]) => (
            <article className="card p-8" key={title}>
              <h2 className="text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-moss">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
