"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardActionCard } from "@/components/DashboardActionCard";
import { RoleSelector } from "@/components/RoleSelector";
import {
  CALCULATORS,
  DASHBOARD_WORK_ITEMS,
  QUICK_TOOLS,
  ROLE_BASED_ACTIONS,
  ROLE_MODES,
  type RoleMode,
} from "@/lib/platform-content";

interface ProjectSummary {
  id: string;
  name: string;
  location: string;
  statusLabel: string;
  riskText: string;
  href: string;
}

export function DashboardWorkbench({
  counts,
  projects,
}: {
  counts: { savedProjects: number; activeWork: number; reportsReady: number };
  projects: ProjectSummary[];
}) {
  const [role, setRole] = useState<RoleMode>("estimator");
  const roleDefinition = useMemo(() => ROLE_MODES.find((item) => item.id === role) ?? ROLE_MODES[0], [role]);
  const spotlightActions = ROLE_BASED_ACTIONS[role];

  return (
    <div className="mx-auto max-w-[1280px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">What are you trying to work on today?</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Start with the construction task, not a long intake form. Switch roles to change the suggested actions, prompts, and review posture.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/projects/new" className="button-primary">
            Create Project
          </Link>
          <Link href="/app/workflows/what-am-i-missing" className="button-secondary">
            Run What Am I Missing?
          </Link>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Saved projects", counts.savedProjects],
          ["Active work", counts.activeWork],
          ["Reports ready", counts.reportsReady],
        ].map(([label, value]) => (
          <div className="card p-7" key={label}>
            <p className="text-xs font-semibold uppercase text-moss">{label}</p>
            <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
            <p className="mt-2 text-sm leading-6 text-moss">Current JanusScope workspace activity.</p>
          </div>
        ))}
      </section>

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Role-based mode</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{roleDefinition.label}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">{roleDefinition.description}</p>
          </div>
          <Link className="button-secondary" href="/app/prompts">
            Browse Prompt Library
          </Link>
        </div>
        <div className="mt-6">
          <RoleSelector roles={ROLE_MODES} value={role} onChange={setRole} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spotlightActions.map((action) => (
            <DashboardActionCard action={action} key={action.title} />
          ))}
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Quick start</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Flagship actions across the platform</h2>
          </div>
          <Link className="button-secondary" href="/app/workflows">
            View All Workflows
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_WORK_ITEMS.slice(0, 9).map((action) => (
            <DashboardActionCard action={action} key={action.title} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card p-8 sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Projects</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Current project work</h2>
            </div>
            <Link className="button-secondary" href="/app/projects">
              Open Projects
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="mt-6 rounded-[22px] border border-line/60 bg-paper p-6 text-center">
              <p className="font-semibold text-ink">No projects yet.</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-moss">
                Create a project to tie workflow outputs, uploads, reports, lessons, and future playbook items to the right job.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {projects.map((project) => (
                <Link className="rounded-[22px] border border-line/60 bg-paper p-5 hover:border-steel hover:bg-white" href={project.href} key={project.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{project.name}</p>
                      <p className="mt-1 text-sm text-moss">{project.location}</p>
                    </div>
                    <span className="rounded-full border border-line/60 bg-white px-3 py-1 text-xs font-semibold text-moss">
                      {project.statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-moss">{project.riskText}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="card p-8">
            <p className="eyebrow">Quick tools</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Small daily jobs</h2>
            <div className="mt-5 grid gap-3">
              {QUICK_TOOLS.slice(0, 5).map((tool) => (
                <Link className="rounded-[18px] border border-line/60 bg-paper px-4 py-3 hover:bg-white" href="/app/quick-tools" key={tool.slug}>
                  <p className="font-semibold text-ink">{tool.title}</p>
                  <p className="mt-1 text-sm leading-6 text-moss">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-8">
            <p className="eyebrow">Calculators</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Fast construction math</h2>
            <div className="mt-5 grid gap-3">
              {CALCULATORS.slice(0, 4).map((calculator) => (
                <Link className="rounded-[18px] border border-line/60 bg-paper px-4 py-3 hover:bg-white" href="/app/calculators" key={calculator.slug}>
                  <p className="font-semibold text-ink">{calculator.title}</p>
                  <p className="mt-1 text-sm leading-6 text-moss">{calculator.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
