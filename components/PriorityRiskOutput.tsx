import { SeverityBadge } from "@/components/SeverityBadge";
import type { PrioritizedReport, PriorityFinding } from "@/lib/prioritized-report";
import type { RiskReview } from "@/lib/types";

function confidenceClass(confidence: PriorityFinding["confidence"]): string {
  if (confidence === "High") return "border-[#c7dfcf] bg-[#f1fbf4] text-[#24633a]";
  if (confidence === "Medium") return "border-[#e8d7a6] bg-[#fff8e6] text-[#7a5700]";
  return "border-line/70 bg-paper text-moss";
}

function confidenceScore(confidence: PriorityFinding["confidence"]): number {
  if (confidence === "High") return 86;
  if (confidence === "Medium") return 64;
  return 42;
}

function reportConfidenceScore(report: PrioritizedReport): number {
  const findings = report.topRisks.length > 0 ? report.topRisks : [...report.biggestCostMisses, ...report.contractTraps];
  if (findings.length === 0) return confidenceScore(report.detectedTrade.confidence);
  const total = findings.reduce((sum, finding) => sum + confidenceScore(finding.confidence), 0);
  return Math.round(total / findings.length);
}

function impactTags(finding: PriorityFinding): string[] {
  const text = `${finding.title} ${finding.whyItMatters} ${finding.impact} ${finding.recommendedAction}`.toLowerCase();
  const tags = [
    [/cost|price|pricing|budget|allowance|fee|tax|freight|unpriced|money|spread/, "Cost"],
    [/schedule|delay|deadline|acceleration|sequence|lead time|mobilization|inspection/, "Schedule"],
    [/quality|warranty|finish|product|submittal|workmanship|rework/, "Quality"],
    [/safety|life-safety|fire|egress|alarm|sprinkler|hazard|osha/, "Safety"],
  ] as const;
  const matched = tags.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  return matched.length > 0 ? matched : ["Cost"];
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
            <div className="mt-3 flex flex-wrap gap-2">
              {impactTags(finding).map((tag) => (
                <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss" key={tag}>
                  {tag} impact
                </span>
              ))}
            </div>
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

export function PriorityRiskOutput({ report, review }: { report: PrioritizedReport; review: RiskReview }) {
  const highScheduleItems = review.scheduleTerms.filter((item) => item.risk === "high" || item.risk === "critical").length;
  const metrics = [
    ["Risk score", `${review.score}/100`, review.riskLevel],
    ["Confidence", `${reportConfidenceScore(report)}/100`, `${report.detectedTrade.trade} detected with ${report.detectedTrade.confidence.toLowerCase()} confidence`],
    ["Missing scope", `${review.hiddenScopeFlags.length}`, "Hidden or unclear scope items"],
    ["Contract conflicts", `${review.comparisons.length}`, "Bid, proposal, and contract alignment checks"],
    ["Schedule exposure", `${highScheduleItems}`, "High-priority schedule terms"],
  ];

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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Risk score dashboard</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Project health indicators</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
              Fast readout for the issues most likely to create cost, schedule, quality, safety, or dispute exposure.
            </p>
          </div>
          <SeverityBadge severity={report.overallRisk} />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {metrics.map(([label, value, helper]) => (
            <div className="rounded-[20px] border border-line/60 bg-paper p-5" key={label}>
              <p className="text-xs font-semibold uppercase text-moss">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
              <p className="mt-2 text-xs leading-5 text-moss">{helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Top 10 risks</h2>
        <FindingList findings={report.topRisks} />
      </section>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Top 10 missing scope items</h2>
        {review.hiddenScopeFlags.length === 0 ? (
          <p className="mt-4 text-sm text-moss">No hidden scope flags are visible from the current package.</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {review.hiddenScopeFlags.slice(0, 10).map((flag) => (
              <article className="rounded-[18px] border border-line/60 bg-paper p-5" key={flag.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">{flag.obligation}</h3>
                    <p className="mt-2 text-sm leading-6 text-moss">{flag.whyItMatters}</p>
                  </div>
                  <SeverityBadge severity={flag.severity} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{flag.questionToAsk}</p>
                <p className="mt-2 text-xs leading-5 text-moss">Potential impact: {flag.potentialCostImpact}</p>
              </article>
            ))}
          </div>
        )}
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
