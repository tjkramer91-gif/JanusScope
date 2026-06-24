import { SUBSCOPE_MEMORY_ITEMS } from "@/lib/subscope-content";

export function SubScopeMemory({ compact = false }: { compact?: boolean }) {
  return (
    <section className="card p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">JanusScope Memory</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Static placeholder for Project Brain</h2>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
          Planned
        </span>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-moss">
        This area will eventually remember patterns across GCs, trades, scopes, clarification responses, change order issues, bid notes, and lessons learned. For now it uses sample data only.
      </p>
      <div className={`mt-6 grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {SUBSCOPE_MEMORY_ITEMS.map(([title, body]) => (
          <div className="rounded-[22px] border border-line/60 bg-paper p-5" key={title}>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-moss">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
