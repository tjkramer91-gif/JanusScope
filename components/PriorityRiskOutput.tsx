import { SeverityBadge } from "@/components/SeverityBadge";
import type { PrioritizedReport, PriorityFinding } from "@/lib/prioritized-report";

function confidenceClass(confidence: PriorityFinding["confidence"]): string {
  if (confidence === "High") return "border-[#c7dfcf] bg-[#f1fbf4] text-[#24633a]";
  if (confidence === "Medium") return "border-[#e8d7a6] bg-[#fff8e6] text-[#7a5700]";
  return "border-line/70 bg-paper text-moss";
}

function FindingList({ findings }: { findings: PriorityFinding[] }) {
  if (findings.length === 0) return <p className="text-sm text-moss">No findings in this group yet.</p>;

  return (
    <div className="divide-y divide-line">
      {findings.map((finding) => (
        <article className="grid gap-4 py-5 md:grid-cols-[170px_1fr]" key={finding.id}>
          <div className="space-y-2">
            <SeverityBadge severity={finding.riskLevel} />
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${confidenceClass(finding.confidence)}`}>
              {finding.confidence} confidence
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-ink">{finding.title}</h3>
            <p className="mt-2 text-sm leading-6 text-moss">{finding.whyItMatters}</p>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase text-moss">Evidence</dt>
                <dd className="mt-1 text-ink">{finding.evidence}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-moss">Impact</dt>
                <dd className="mt-1 text-ink">{finding.impact}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-moss">Action</dt>
                <dd className="mt-1 text-ink">{finding.recommendedAction}</dd>
              </div>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PriorityRiskOutput({ report }: { report: PrioritizedReport }) {
  return (
    <section className="space-y-6">
      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Executive risk summary</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Biggest misses first</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-moss">
              Default view is prioritized by severity, likely cost exposure, contract traps, missing information, and the detected trade.
            </p>
          </div>
          <div className="space-y-2 text-right">
            <SeverityBadge severity={report.overallRisk} />
            <p className="text-xs font-semibold uppercase text-moss">{report.detectedTrade.trade} · {report.detectedTrade.confidence} confidence</p>
          </div>
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Top 5 risks</h2>
        <FindingList findings={report.topRisks} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Biggest potential cost misses</h2>
          <FindingList findings={report.biggestCostMisses} />
        </section>

        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Contract / scope traps</h2>
          <FindingList findings={report.contractTraps} />
        </section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Missing information</h2>
          <div className="mt-5 space-y-3">
            {report.missingInformation.map((item) => (
              <div className="rounded-[18px] border border-line/60 bg-paper p-5" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.item}</p>
                  <SeverityBadge severity={item.riskLevel} />
                </div>
                <p className="mt-2 text-sm leading-6 text-moss">{item.whyItMatters}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{item.action}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Questions to ask before proceeding</h2>
          <ol className="mt-5 space-y-3">
            {report.questionsToAsk.map((question, index) => (
              <li className="flex gap-3 rounded-[18px] border border-line/60 bg-paper p-4" key={question}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-steel">{index + 1}</span>
                <p className="text-sm leading-6 text-ink">{question}</p>
              </li>
            ))}
          </ol>
        </section>
      </section>
    </section>
  );
}
