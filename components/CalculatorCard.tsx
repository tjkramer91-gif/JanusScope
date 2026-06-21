"use client";

import { useMemo, useState } from "react";
import type { CalculatorDefinition } from "@/lib/platform-content";

function parseNumber(value: string): number {
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function CalculatorCard({ calculator }: { calculator: CalculatorDefinition }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(calculator.inputs.map((input) => [input, ""])),
  );

  const preview = useMemo(() => {
    const numbers = calculator.inputs.map((input) => parseNumber(values[input] ?? ""));
    if (calculator.slug === "cost-sf" || calculator.slug === "cost-unit") {
      return numbers[1] ? numbers[0] / numbers[1] : 0;
    }
    if (calculator.slug === "contingency" || calculator.slug === "markup") {
      return numbers[0] * (numbers[1] / 100);
    }
    if (calculator.slug === "burn") {
      return numbers[0] * numbers[1];
    }
    if (calculator.slug === "retainage") {
      return (numbers[0] * (numbers[1] / 100)) * (numbers[2] / 100);
    }
    if (calculator.slug === "escalation") {
      return numbers[0] * (numbers[1] / 100) * (numbers[2] / 12);
    }
    if (calculator.slug === "rent-loss") {
      return numbers[0] * numbers[1] * (numbers[2] / 30);
    }
    return 0;
  }, [calculator.inputs, calculator.slug, values]);

  return (
    <article className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Calculator</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{calculator.title}</h2>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
          Quick math
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-moss">{calculator.description}</p>
      <div className="mt-5 grid gap-4">
        {calculator.inputs.map((input) => (
          <label key={input}>
            <span className="field-label">{input}</span>
            <input
              className="field"
              inputMode="decimal"
              value={values[input] ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, [input]: event.target.value }))}
              placeholder={input}
            />
          </label>
        ))}
      </div>
      <div className="mt-6 rounded-[18px] border border-line/60 bg-paper p-4">
        <p className="text-xs font-semibold uppercase text-steel">Formula</p>
        <p className="mt-2 text-sm leading-6 text-moss">{calculator.formulaHint}</p>
        <p className="mt-4 text-2xl font-semibold text-ink">{Number.isFinite(preview) ? preview.toFixed(2) : "0.00"}</p>
      </div>
    </article>
  );
}
