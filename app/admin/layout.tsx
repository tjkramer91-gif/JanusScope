import Link from "next/link";
import type { ReactNode } from "react";
import { ADMIN_NAV_ITEMS } from "@/app/admin/_components/AdminUi";
import { requireAdminUser } from "@/lib/server/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminUser();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/60 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/admin/dashboard" className="text-left">
            <div className="text-lg font-bold text-ink">JanusScope Admin</div>
            <div className="text-[11px] font-medium uppercase text-steel">Operational visibility</div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-moss sm:inline">{admin.email}</span>
            <Link href="/app/dashboard" className="button-secondary">
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[245px_1fr]">
        <aside className="border-b border-line/60 bg-white/75 px-5 py-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <p className="mb-3 hidden text-[11px] font-semibold uppercase tracking-wide text-moss lg:block">
            Admin
          </p>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Admin navigation">
            {ADMIN_NAV_ITEMS.map(([href, label]) => (
              <Link
                href={href}
                className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-moss hover:bg-paper hover:text-ink"
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 hidden border-t border-line/50 pt-5 text-xs leading-5 text-moss lg:block">
            Admin pages are protected by a server-side role check. Normal users should not receive admin data.
          </p>
        </aside>
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
