import { SeverityBadge } from "@/components/SeverityBadge";
import { HiddenScopeFlag } from "@/lib/types";

export function HiddenScopeTable({ flags }: { flags: HiddenScopeFlag[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Hidden scope flags</h2>
        <p className="mt-1 text-sm text-moss">Broad words that can turn unpriced work into subcontractor responsibility.</p>
      </div>
      {flags.length === 0 ? (
        <p className="p-8 text-sm text-moss">No hidden-scope trigger phrases were found in the pasted subcontract text.</p>
      ) : (
        <div className="divide-y divide-line">
          {flags.map((flag) => (
            <article className="grid gap-5 p-6 sm:p-8 xl:grid-cols-[1fr_1fr_1fr_auto]" key={flag.id}>
              <div>
                <p className="text-xs font-semibold uppercase text-moss">Hidden or vague obligation</p>
                <h3 className="mt-1 font-semibold text-ink">{flag.obligation}</h3>
                <p className="mt-2 text-sm leading-6 text-moss">Language: &quot;{flag.contractLanguage}&quot;</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-moss">Why it matters</p>
                <p className="mt-1 text-sm leading-6 text-ink">{flag.whyItMatters}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-moss">Question to ask GC</p>
                <p className="mt-1 text-sm leading-6 text-steel">{flag.questionToAsk}</p>
              </div>
              <div>
                <SeverityBadge severity={flag.severity} />
                <p className="mt-3 text-xs text-moss">Cost impact: {flag.potentialCostImpact}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
