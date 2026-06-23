import Link from "next/link";
import type { ReactNode } from "react";

export const ADMIN_NAV_ITEMS = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/leads", "Leads"],
  ["/admin/users", "Users"],
  ["/admin/companies", "Companies"],
  ["/admin/projects", "Projects"],
  ["/admin/documents", "Documents"],
  ["/admin/usage", "Usage"],
  ["/admin/data-review", "Data Review"],
  ["/admin/pricing", "Pricing"],
  ["/admin/feedback", "Feedback"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-line/60 pb-6">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-moss">{description}</p>
    </div>
  );
}

export function MetricCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-[18px] border border-line/70 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-moss">{label}</p>
      <div className="mt-3 text-3xl font-semibold text-ink">{value.toLocaleString()}</div>
      {note ? <p className="mt-2 text-xs text-moss">{note}</p> : null}
    </div>
  );
}

export function AdminTable({
  columns,
  rows,
  emptyMessage,
}: {
  columns: string[];
  rows: ReactNode[][];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line/70 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line/70 text-left text-sm">
          <thead className="bg-paper">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-moss">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${rowIndex}-${cellIndex}`} className="max-w-[320px] truncate px-4 py-3 text-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-moss" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminSection({ children }: { children: ReactNode }) {
  return <section className="space-y-5">{children}</section>;
}

export function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-steel hover:text-steelDark">
      {children}
    </Link>
  );
}

export function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatCompactJson(value: Record<string, unknown>): string {
  const entries = Object.entries(value);
  if (entries.length === 0) return "{}";
  return entries
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join(", ");
}
