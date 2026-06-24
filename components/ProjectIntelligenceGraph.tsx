import { SeverityBadge } from "@/components/SeverityBadge";
import { IntelligenceGraph, IntelligenceNode } from "@/lib/types";

const NODE_TYPE_LABELS: Record<IntelligenceNode["type"], string> = {
  project: "Project",
  gc: "GC",
  trade: "Trade",
  "risk-category": "Risk category",
  issue: "Issue",
  document: "Document",
  question: "Question",
};

const CONFIDENCE_LABELS: Record<IntelligenceGraph["signals"][number]["confidence"], string> = {
  observed: "Observed",
  emerging: "Emerging",
  supported: "Supported",
};

export function ProjectIntelligenceGraph({ graph }: { graph: IntelligenceGraph }) {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const visibleNodes = graph.nodes
    .filter((node) => node.type !== "question" && node.type !== "project")
    .slice(0, 10);
  const visibleEdges = graph.edges.slice(0, 8);

  return (
    <section className="card p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Project Brain</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Graph-shaped memory from this review</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            SubScope saves the review as connected project facts, risk categories, issue patterns, missing documents, and GC questions. This is a working memory layer, not a public pricing source.
          </p>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
          {graph.nodes.length} nodes / {graph.edges.length} links
        </span>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h3 className="text-sm font-semibold uppercase text-moss">Memory signals</h3>
          <div className="mt-4 grid gap-3">
            {graph.signals.map((signal) => (
              <article className="rounded-[22px] border border-line/60 bg-paper p-5" key={signal.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={signal.severity} />
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-moss shadow-sm">
                    {CONFIDENCE_LABELS[signal.confidence]} / {signal.evidenceCount} evidence item{signal.evidenceCount === 1 ? "" : "s"}
                  </span>
                </div>
                <h4 className="mt-3 font-semibold text-ink">{signal.title}</h4>
                <p className="mt-2 text-sm leading-6 text-moss">{signal.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold uppercase text-moss">Tracked nodes</h3>
            <div className="mt-4 grid gap-2">
              {visibleNodes.map((node) => (
                <div className="rounded-[20px] border border-line/60 bg-white p-4 shadow-sm" key={node.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{node.label}</p>
                    <span className="rounded-full bg-paper px-3 py-1 text-[11px] font-semibold uppercase text-moss">
                      {NODE_TYPE_LABELS[node.type]}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-moss">{node.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase text-moss">Recent links</h3>
            <div className="mt-4 grid gap-2">
              {visibleEdges.map((edge) => {
                const from = nodeById.get(edge.from)?.label ?? "Unknown";
                const to = nodeById.get(edge.to)?.label ?? "Unknown";
                return (
                  <div className="rounded-[20px] border border-line/60 bg-paper p-4" key={edge.id}>
                    <p className="text-xs font-semibold uppercase text-moss">{edge.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-ink">
                      {from} to {to}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
