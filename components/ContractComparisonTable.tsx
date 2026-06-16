import { SeverityBadge } from "@/components/SeverityBadge";
import { ContractComparison } from "@/lib/types";

export function ContractComparisonTable({ comparisons }: { comparisons: ContractComparison[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Contract vs bid comparison</h2>
        <p className="mt-1 text-sm text-moss">Direct mismatches between excluded or limited bid items and subcontract obligations.</p>
      </div>
      {comparisons.length === 0 ? (
        <p className="p-8 text-sm text-moss">No direct contract-vs-bid conflicts were found in the pasted text.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="bg-paper/70 text-xs uppercase text-moss">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Bid position</th>
                <th className="px-4 py-3 font-semibold">Contract position</th>
                <th className="px-4 py-3 font-semibold">Conflict</th>
                <th className="px-4 py-3 font-semibold">Risk</th>
                <th className="px-4 py-3 font-semibold">Recommended clarification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {comparisons.map((comparison) => (
                <tr className="transition hover:bg-paper/60" key={comparison.id}>
                  <td className="px-4 py-4 font-semibold text-ink">{comparison.item}</td>
                  <td className="px-4 py-4 leading-6 text-moss">{comparison.bidPosition}</td>
                  <td className="px-4 py-4 leading-6 text-moss">{comparison.contractPosition}</td>
                  <td className="px-4 py-4 leading-6 text-ink">{comparison.conflict}</td>
                  <td className="px-4 py-4"><SeverityBadge severity={comparison.riskLevel} /></td>
                  <td className="px-4 py-4 leading-6 text-steel">{comparison.recommendedClarification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
