import { SeverityBadge } from "@/components/SeverityBadge";
import { RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import { RiskFlag } from "@/lib/types";

export function RiskFlagTable({ flags }: { flags: RiskFlag[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Risk flags</h2>
        <p className="mt-1 text-sm text-moss">Issues that should be clarified, revised, priced, or reviewed before signing.</p>
      </div>
      <div className="divide-y divide-line">
        {flags.map((flag) => (
          <article className="grid gap-5 p-6 sm:p-8 xl:grid-cols-[180px_1fr_1fr]" key={flag.id}>
            <div>
              <SeverityBadge severity={flag.severity} />
              <p className="mt-3 text-xs font-semibold uppercase text-moss">
                {RISK_CATEGORY_LABELS[flag.category]}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-ink">{flag.issue}</h3>
              <p className="mt-2 text-sm leading-6 text-moss">{flag.whyItMatters}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase text-moss">What to verify</p>
                <p className="mt-1 text-sm leading-6 text-ink">{flag.whatToVerify}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-moss">Suggested next action</p>
                <p className="mt-1 text-sm leading-6 text-steel">{flag.suggestedAction}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
