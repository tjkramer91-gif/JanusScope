import type { ReactNode } from "react";
import { buildProjectBrain } from "@/lib/project-brain";
import type { ProjectMemoryRecord } from "@/lib/server/store";
import type { Project, RiskReview } from "@/lib/types";

function EmptyState({ children }: { children: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-line/80 bg-paper p-5 text-sm leading-6 text-moss">
      {children}
    </div>
  );
}

function SectionShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-line/70 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase text-moss">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  const normalized = severity.toLowerCase();
  const className =
    normalized === "critical"
      ? "border-brick/40 bg-[#fff0ef] text-brick"
      : normalized === "high"
        ? "border-[#f0b36a] bg-[#fff7ed] text-[#9a5200]"
        : normalized === "medium"
          ? "border-[#e6c86f] bg-[#fffbe8] text-[#756000]"
          : normalized === "low"
            ? "border-[#9dc9a3] bg-[#f0fff4] text-[#25603a]"
            : "border-line bg-paper text-moss";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${className}`}>
      {severity}
    </span>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "Not updated yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function ProjectBrainPanel({
  project,
  memory,
  review,
}: {
  project: Project;
  memory: ProjectMemoryRecord | null;
  review: RiskReview;
}) {
  const brain = buildProjectBrain(project, memory, review);

  return (
    <section className="card p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Project Brain</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">What JanusScope knows about this project</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            A working memory of scope, questions, risks, pricing, contract terms, decisions, and lessons learned for this project.
          </p>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
          Updated {formatDate(brain.lastUpdatedAt)}
        </span>
      </div>

      <div className="mt-8 grid gap-5">
        <SectionShell title="Project Profile">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {brain.profile.map((item) => (
              <div className="rounded-[16px] border border-line/60 bg-paper p-4" key={item.label}>
                <p className="text-xs font-semibold uppercase text-moss">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionShell title="Known Scope">
            {brain.knownScope.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-moss">
                {brain.knownScope.map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState>Upload documents or add notes so JanusScope can capture known scope.</EmptyState>
            )}
          </SectionShell>

          <SectionShell title="Open Questions">
            {brain.openQuestions.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-moss">
                {brain.openQuestions.slice(0, 10).map((item) => (
                  <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <EmptyState>No unresolved questions yet. Upload the package or generate a review to populate this section.</EmptyState>
            )}
          </SectionShell>
        </div>

        <SectionShell title="Top Risks">
          {brain.topRisks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-paper/70 text-xs uppercase text-moss">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Severity</th>
                    <th className="px-4 py-3 font-semibold">Risk type</th>
                    <th className="px-4 py-3 font-semibold">Issue</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Recommended action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {brain.topRisks.map((risk) => (
                    <tr key={`${risk.type}-${risk.title}`}>
                      <td className="px-4 py-4"><SeverityPill severity={risk.severity} /></td>
                      <td className="px-4 py-4 text-moss">{risk.type}</td>
                      <td className="px-4 py-4 font-semibold text-ink">{risk.title}</td>
                      <td className="px-4 py-4 text-moss">{risk.source}</td>
                      <td className="px-4 py-4 text-moss">{risk.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No risks have been generated yet.</EmptyState>
          )}
        </SectionShell>

        <SectionShell title="Pricing Memory">
          {brain.pricingMemory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-[1080px] w-full text-left text-sm">
                <thead className="bg-paper/70 text-xs uppercase text-moss">
                  <tr>
                    {["Trade", "Scope item", "Qty", "UOM", "Unit cost", "Total", "Cost/SF", "Cost/unit", "Source", "Confidence", "Status"].map((label) => (
                      <th className="px-4 py-3 font-semibold" key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {brain.pricingMemory.map((item) => (
                    <tr key={`${item.scopeItem}-${item.sourceDocument}`}>
                      <td className="px-4 py-4 text-moss">{item.trade}</td>
                      <td className="px-4 py-4 font-semibold text-ink">{item.scopeItem}</td>
                      <td className="px-4 py-4 text-moss">{item.quantity}</td>
                      <td className="px-4 py-4 text-moss">{item.unitOfMeasure}</td>
                      <td className="px-4 py-4 text-moss">{item.unitCost}</td>
                      <td className="px-4 py-4 text-moss">{item.totalCost}</td>
                      <td className="px-4 py-4 text-moss">{item.costPerSf}</td>
                      <td className="px-4 py-4 text-moss">{item.costPerUnit}</td>
                      <td className="px-4 py-4 text-moss">{item.sourceDocument}</td>
                      <td className="px-4 py-4 text-moss">{item.confidenceScore}</td>
                      <td className="px-4 py-4 text-moss">{item.reviewStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>No pricing has been extracted yet. Add a budget, bid, proposal, or scope with pricing.</EmptyState>
          )}
        </SectionShell>

        <SectionShell title="Contract Memory">
          <div className="grid gap-3 md:grid-cols-2">
            {brain.contractMemory.map((item) => (
              <div className="rounded-[16px] border border-line/60 bg-paper p-4" key={item.label}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <span className="rounded-full border border-line/60 bg-white px-2 py-1 text-[11px] font-semibold uppercase text-moss">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-moss">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionShell>

        <div className="grid gap-5 lg:grid-cols-2">
          <SectionShell title="Decisions">
            <ul className="space-y-2 text-sm leading-6 text-moss">
              {brain.decisions.map((item) => (
                <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={item}>{item}</li>
              ))}
            </ul>
          </SectionShell>

          <SectionShell title="Lessons Learned">
            <ul className="space-y-2 text-sm leading-6 text-moss">
              {brain.lessonsLearned.map((item) => (
                <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={item}>{item}</li>
              ))}
            </ul>
          </SectionShell>
        </div>
      </div>
    </section>
  );
}
