import Link from "next/link";
import type { DashboardAction } from "@/lib/platform-content";

export function DashboardActionCard({ action }: { action: DashboardAction }) {
  return (
    <Link className="card flex h-full flex-col p-5" href={action.href}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-ink">{action.title}</h3>
        {action.tag ? (
          <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-[11px] font-semibold uppercase text-steel">
            {action.tag}
          </span>
        ) : null}
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-moss">{action.description}</p>
      <span className="mt-4 text-sm font-semibold text-steel">Open</span>
    </Link>
  );
}
