import { SeverityBadge } from "@/components/SeverityBadge";
import { ExclusionCheck } from "@/lib/types";

export function ExclusionCheckTable({ checks }: { checks: ExclusionCheck[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Exclusions and assumptions check</h2>
        <p className="mt-1 text-sm text-moss">Items excluded in the bid that should be preserved in the subcontract.</p>
      </div>
      {checks.length === 0 ? (
        <p className="p-8 text-sm text-moss">No bid exclusions were detected from the pasted bid or exclusions text.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm">
            <thead className="bg-paper/70 text-xs uppercase text-moss">
              <tr>
                <th className="px-4 py-3 font-semibold">Exclusion in bid</th>
                <th className="px-4 py-3 font-semibold">Found in bid?</th>
                <th className="px-4 py-3 font-semibold">Contract preserves it?</th>
                <th className="px-4 py-3 font-semibold">Contract contradicts it?</th>
                <th className="px-4 py-3 font-semibold">Required action</th>
                <th className="px-4 py-3 font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {checks.map((check) => (
                <tr className="transition hover:bg-paper/60" key={check.id}>
                  <td className="px-4 py-4 font-semibold capitalize text-ink">{check.exclusion}</td>
                  <td className="px-4 py-4 capitalize text-moss">{check.foundInBid}</td>
                  <td className="px-4 py-4 capitalize text-moss">{check.contractPreservesIt}</td>
                  <td className="px-4 py-4 capitalize text-moss">{check.contradictedByContract}</td>
                  <td className="px-4 py-4 leading-6 text-steel">{check.requiredAction}</td>
                  <td className="px-4 py-4"><SeverityBadge severity={check.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
