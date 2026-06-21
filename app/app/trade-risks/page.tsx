import Link from "next/link";
import { TRADE_REVIEW_MODES, TRADE_RISKS } from "@/lib/platform-content";

export default function TradeRisksPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Trade Risk Library</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">What experienced teams usually check by trade</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Use this library when the team needs a practical reminder of common misses, bad exclusions, hidden costs, coordination issues, bid breakouts, and closeout needs.
        </p>
      </div>

      <section className="card p-8 sm:p-10">
        <p className="eyebrow">Review modes</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Professional review modes, not novelty bots</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {TRADE_REVIEW_MODES.map((mode) => (
            <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-sm font-semibold text-moss" key={mode}>
              {mode}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TRADE_RISKS.map((trade) => (
          <Link className="card flex h-full flex-col p-6" href={`/app/trade-risks/${trade.slug}`} key={trade.slug}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{trade.reviewMode}</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{trade.title}</h2>
              </div>
              <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
                Trade
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-moss">{trade.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {trade.commonMisses.slice(0, 2).map((item) => (
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <span className="mt-6 text-sm font-semibold text-steel">Open trade guide</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
