import { SeverityBadge } from "@/components/SeverityBadge";
import { PROJECT_TYPE_LABELS, RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import { formatCurrency } from "@/lib/format";
import { Project, RiskCategory, RiskReview } from "@/lib/types";

export function RiskSummary({ project, review }: { project: Project; review: RiskReview }) {
  const details = [
    ["Project address", project.projectAddress || "Not provided"],
    ["Trade", project.tradeType || "Not provided"],
    ["GC", project.gcName || "Not provided"],
    ["Owner", project.ownerName || "Not provided"],
    ["Contract amount", formatCurrency(project.contractAmount)],
    ["Bid date", project.bidDate || "Not provided"],
    ["Execution deadline", project.executionDeadline || "Not provided"],
    ["Project type", PROJECT_TYPE_LABELS[project.projectType]],
  ];

  const topIssues = review.flags.slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="grid lg:grid-cols-[290px_1fr]">
          <div className="border-b border-line/50 bg-paper p-8 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase text-moss">Overall risk score</p>
            <div className="mt-5 flex items-end gap-3 text-ink">
              <span className="text-6xl font-semibold">{review.score}</span>
              <span className="pb-2 text-lg text-moss">/ 100</span>
            </div>
            <SeverityBadge severity={review.overallRating} className="mt-5" />
            <p className="mt-5 text-sm font-semibold text-ink">{review.riskLevel}</p>
          </div>
          <div className="p-8 sm:p-10">
            <p className="eyebrow">Executive summary</p>
            <h2 className="mt-2 text-3xl font-semibold">{project.name || "Untitled review"}</h2>
            <div className="mt-6 rounded-[24px] border border-line/60 bg-paper p-5">
              <p className="text-xs font-semibold uppercase text-moss">Recommended action</p>
              <p className="mt-2 text-lg font-semibold text-ink">{review.finalRecommendation}</p>
            </div>
            <div className="mt-5 grid gap-px overflow-hidden rounded-[24px] border border-line/60 bg-line/70 sm:grid-cols-2 xl:grid-cols-4">
              {details.map(([label, value]) => (
                <div className="bg-white p-4" key={label}>
                  <p className="text-[11px] font-semibold uppercase text-moss">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="card p-8 sm:p-10">
          <h3 className="section-title">Biggest issues before signing</h3>
          {topIssues.length === 0 ? (
            <p className="mt-4 text-sm text-moss">No rule-based risk flags found in the pasted text.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {topIssues.map((flag, index) => (
                <li className="flex gap-3" key={flag.id}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-semibold text-steel">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{flag.issue}</p>
                      <SeverityBadge severity={flag.severity} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-moss">{flag.whyItMatters}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card p-8 sm:p-10">
          <h3 className="section-title">Review counts</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["Contract vs bid conflicts", review.comparisons.length],
              ["Hidden scope flags", review.hiddenScopeFlags.length],
              ["Missing documents", review.missingDocuments.length],
              ["Clarification questions", review.questions.length],
              ["Issue log items", review.issueLog.length],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between rounded-[20px] border border-line/60 bg-paper px-5 py-4" key={label}>
                <span className="text-sm font-medium text-moss">{label}</span>
                <span className="text-lg font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-8 sm:p-10">
        <div className="mb-5">
          <h3 className="section-title">Category ratings</h3>
          <p className="mt-1 text-sm text-moss">Higher-priority categories deserve cleanup before execution.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(review.categoryRatings).map(([category, rating]) => (
            <div className="flex items-center justify-between rounded-[20px] border border-line/60 bg-white px-5 py-4 shadow-sm" key={category}>
              <span className="text-sm font-medium text-ink">
                {RISK_CATEGORY_LABELS[category as RiskCategory]}
              </span>
              <SeverityBadge severity={rating} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
