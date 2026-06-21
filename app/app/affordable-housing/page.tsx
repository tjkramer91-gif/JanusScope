import Link from "next/link";
import { AFFORDABLE_HOUSING_MODULES } from "@/lib/platform-content";

export default function AffordableHousingPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Affordable Housing</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Built for occupied rehab, NSPIRE, PCNA, and funding-driven scope questions</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          This lane focuses on affordable housing renovations, due diligence, occupied work, immediate needs, lender questions, and requirement issue spotting.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        {AFFORDABLE_HOUSING_MODULES.map((module) => (
          <Link className="card flex h-full flex-col p-6" href={`/app/affordable-housing/${module.slug}`} key={module.slug}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Housing module</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{module.title}</h2>
              </div>
              <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
                Module
              </span>
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-moss">{module.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {module.outputs.slice(0, 2).map((item) => (
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <span className="mt-6 text-sm font-semibold text-steel">Open module</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
