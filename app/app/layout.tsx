import Link from "next/link";
import { ReactNode } from "react";
import { PLATFORM_NAVIGATION_GROUPS } from "@/lib/platform-content";
import { requireUser } from "@/lib/server/auth";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/app/dashboard" className="text-left">
            <div className="text-lg font-bold text-ink">JanusScope</div>
            <div className="text-[11px] font-medium uppercase text-steel">Construction AI workbench</div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-moss sm:inline">{user.email}</span>
            <Link href="/auth/logout" prefetch={false} className="button-secondary">Log out</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[245px_1fr]">
        <aside className="border-b border-line/45 bg-white/70 px-5 py-4 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
          <div className="space-y-6">
            {PLATFORM_NAVIGATION_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-3 hidden text-[11px] font-semibold uppercase tracking-wide text-moss lg:block">
                  {group.title}
                </p>
                <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label={`${group.title} navigation`}>
                  {group.items.map(([href, label]) => (
                    <Link
                      href={href}
                      className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-moss hover:bg-paper hover:text-ink"
                      key={href}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
            <Link
              href="/app/projects/new"
              className="inline-flex whitespace-nowrap rounded-full bg-steel px-4 py-2 text-sm font-semibold text-white hover:bg-steelDark"
            >
              Create Project
            </Link>
          </div>
          <p className="mt-6 hidden border-t border-line/50 pt-5 text-xs leading-5 text-moss lg:block">
            JanusScope helps construction teams find the miss before it costs money. It organizes questions, risks, document conflicts, and practical next steps.
          </p>
        </aside>
        <main className="min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
