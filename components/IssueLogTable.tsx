import { SeverityBadge } from "@/components/SeverityBadge";
import { RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import { IssueLogItem } from "@/lib/types";

export function IssueLogTable({ issues }: { issues: IssueLogItem[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Exportable issue log</h2>
        <p className="mt-1 text-sm text-moss">Use this as a pre-signing cleanup tracker with the GC and your internal team.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full text-left text-sm">
          <thead className="bg-paper/70 text-xs uppercase text-moss">
            <tr>
              <th className="px-4 py-3 font-semibold">Issue ID</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Issue</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Why it matters</th>
              <th className="px-4 py-3 font-semibold">Recommended clarification</th>
              <th className="px-4 py-3 font-semibold">Suggested revision</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {issues.map((issue) => (
              <tr className="transition hover:bg-paper/60" key={issue.id}>
                <td className="px-4 py-4 font-semibold text-ink">{issue.id}</td>
                <td className="px-4 py-4 text-moss">{RISK_CATEGORY_LABELS[issue.category]}</td>
                <td className="px-4 py-4 text-moss">{issue.documentSource}</td>
                <td className="px-4 py-4 leading-6 text-ink">{issue.issueTitle}</td>
                <td className="px-4 py-4"><SeverityBadge severity={issue.riskLevel} /></td>
                <td className="px-4 py-4 leading-6 text-moss">{issue.whyItMatters}</td>
                <td className="px-4 py-4 leading-6 text-steel">{issue.recommendedClarification}</td>
                <td className="px-4 py-4 leading-6 text-moss">{issue.suggestedRevision}</td>
                <td className="px-4 py-4 text-moss">{issue.status}</td>
                <td className="px-4 py-4 text-moss">{issue.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
