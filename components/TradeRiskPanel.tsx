import Link from "next/link";
import type { TradeRiskDefinition } from "@/lib/platform-content";

export function TradeRiskPanel({ trade }: { trade: TradeRiskDefinition }) {
  const sections = [
    ["Common missed scope", trade.commonMisses],
    ["Common bad exclusions", trade.badExclusions],
    ["Common hidden costs", trade.hiddenCosts],
    ["Common coordination issues", trade.coordinationIssues],
    ["Common questions to ask", trade.questions],
    ["Common change order triggers", trade.changeOrderTriggers],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{trade.reviewMode}</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{trade.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-moss">{trade.summary}</p>
          </div>
          <Link className="button-secondary" href="/app/workflows/trade-scope-builder">
            Use In Workflow
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map(([title, items]) => (
          <section className="card p-6" key={title}>
            <h2 className="section-title">{title}</h2>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-moss">
              {items.map((item) => (
                <li className="rounded-[18px] border border-line/60 bg-paper px-4 py-3" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="card p-6">
          <h2 className="section-title">Bid form breakouts</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {trade.bidFormBreakouts.map((item) => (
              <span className="rounded-full border border-line/60 bg-paper px-3 py-2 text-xs font-semibold text-moss" key={item}>
                {item}
              </span>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="section-title">Alternates and allowances</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-moss">
            <div>
              <p className="text-xs font-semibold uppercase text-steel">Alternates</p>
              <ul className="mt-2 grid gap-2">
                {trade.alternates.map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-steel">Allowances</p>
              <ul className="mt-2 grid gap-2">
                {trade.allowances.map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="section-title">Inspection and closeout</h2>
          <div className="mt-4 space-y-4 text-sm leading-6 text-moss">
            <div>
              <p className="text-xs font-semibold uppercase text-steel">Inspection concerns</p>
              <ul className="mt-2 grid gap-2">
                {trade.inspectionConcerns.map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-steel">Closeout items</p>
              <ul className="mt-2 grid gap-2">
                {trade.closeoutItems.map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Suggested prompts, templates, and checklist</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-steel">Prompts</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-moss">
              {trade.suggestedPrompts.map((item) => (
                <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-steel">Templates</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-moss">
              {trade.suggestedTemplates.map((item) => (
                <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-steel">Checklist</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-moss">
              {trade.suggestedChecklist.map((item) => (
                <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-2" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
