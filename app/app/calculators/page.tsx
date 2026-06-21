import { CalculatorCard } from "@/components/CalculatorCard";
import { CALCULATORS } from "@/lib/platform-content";

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-8">
      <div>
        <p className="eyebrow">Calculators</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Practical construction calculators</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Use these for quick cost, contingency, burn, markup, retainage, and occupied-rehab math.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {CALCULATORS.map((calculator) => (
          <CalculatorCard calculator={calculator} key={calculator.slug} />
        ))}
      </div>
    </div>
  );
}
