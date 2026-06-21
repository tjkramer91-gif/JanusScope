"use client";

import { useState } from "react";

export function OutputTransformButtons({ actions }: { actions: readonly string[] | string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-[20px] border border-line/60 bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Transform output</p>
          <p className="mt-1 text-xs leading-5 text-moss">
            These buttons shape how the output should be rewritten or packaged next.
          </p>
        </div>
        {selected ? (
          <span className="rounded-full border border-line/60 bg-white px-3 py-1 text-xs font-semibold text-moss">
            Selected: {selected}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => setSelected(action)}
            className={
              selected === action
                ? "rounded-full bg-steel px-4 py-2 text-sm font-semibold text-white"
                : "rounded-full border border-line/60 bg-white px-4 py-2 text-sm font-semibold text-moss hover:border-steel hover:text-steel"
            }
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}
