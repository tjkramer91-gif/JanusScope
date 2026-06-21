import { QUICK_TOOLS } from "@/lib/platform-content";

export default function QuickToolsPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Quick Tools</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Small daily construction writing jobs</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          These are the lighter-weight tools for cleaning up communication, naming issues, and packaging day-to-day project work.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {QUICK_TOOLS.map((tool) => (
          <article className="card p-6" key={tool.slug}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Quick tool</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{tool.title}</h2>
              </div>
              <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
                {tool.output}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-moss">{tool.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
