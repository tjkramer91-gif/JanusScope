import { Assumption } from "@/lib/types";

export function AssumptionsList({ assumptions }: { assumptions: Assumption[] }) {
  return (
    <section className="card p-8 sm:p-10">
      <h2 className="section-title">Review assumptions</h2>
      <p className="mt-1 text-sm text-moss">These statements show where the available basis is incomplete.</p>
      {assumptions.length === 0 ? (
        <p className="mt-6 text-sm text-moss">No additional assumptions were generated.</p>
      ) : (
        <ol className="mt-6 space-y-4">
          {assumptions.map((assumption, index) => (
            <li className="flex gap-4" key={assumption.id}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] text-xs font-semibold text-steel">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{assumption.statement}</p>
                <p className="mt-1 text-sm leading-6 text-moss">Basis: {assumption.basis}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
