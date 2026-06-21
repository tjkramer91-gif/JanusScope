import Link from "next/link";
import { SECURITY_CONTROLS } from "@/lib/subscope-content";

const DETAILS = [
  ["Private project documents", "Customer documents belong to the customer workspace and should not be public."],
  ["Organization-based access", "The current structure scopes projects by user and organization. Role-based permissions can be layered in later."],
  ["Deletion and retention", "Project deletion, report deletion, and document deletion paths are first-class product controls."],
  ["Model-use boundary", "No customer data should be used to train outside models unless the customer explicitly allows it."],
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-semibold text-ink">JanusScope</Link>
          <Link href="/auth/login?returnTo=/app/dashboard" className="button-secondary">Open JanusScope</Link>
        </div>
      </header>
      <section className="mx-auto max-w-[1080px] px-5 py-20 lg:py-24">
        <p className="eyebrow">Security and data controls</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-ink">
          Built around private construction documents and clear customer controls.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-moss">
          JanusScope is a construction risk and workflow assistant. It is not a lawyer replacement, and security controls should stay visible because contracts, bids, drawings, and pricing are sensitive.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SECURITY_CONTROLS.map((point) => (
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
