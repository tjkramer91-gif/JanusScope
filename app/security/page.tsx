import Link from "next/link";

const POINTS = [
  "Documents are private to the user account.",
  "Files are stored securely and are not public.",
  "Users can delete uploaded documents, generated reports, or full projects.",
  "Reports are generated for the user's review.",
  "SubScope does not replace an attorney.",
  "SubScope helps identify issues to review before signing.",
  "Production deployments should use Supabase row-level security and signed URLs for temporary downloads.",
  "MFA can be required through Auth0 and step-up login hooks are included for uploads, reports, downloads, and deletion.",
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-bold text-ink">SubScope Risk Review</Link>
          <Link href="/auth/login?returnTo=/app/dashboard" className="button-secondary">Log in</Link>
        </div>
      </header>
      <section className="mx-auto max-w-[1000px] px-5 py-24">
        <p className="eyebrow">Security and document privacy</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Private by default, built for pre-signing review.</h1>
        <div className="mt-10 grid gap-4">
          {POINTS.map((point) => (
            <div className="rounded-[24px] border border-line/60 bg-white p-5 text-sm leading-6 text-moss shadow-sm" key={point}>
              {point}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
