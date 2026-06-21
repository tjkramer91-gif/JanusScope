"use client";

import { useMemo, useState } from "react";
import { PromptCard } from "@/components/PromptCard";
import type { PromptDefinition } from "@/lib/platform-content";

export function PromptLibrary({ prompts }: { prompts: PromptDefinition[] }) {
  const [query, setQuery] = useState("");
  const categories = ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.category)))];
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const matchesCategory = category === "All" || prompt.category === category;
      const matchesQuery =
        !normalized ||
        [prompt.title, prompt.useCase, prompt.prompt, prompt.category, prompt.bestUsedBy.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, prompts, query]);

  return (
    <div className="space-y-6">
      <section className="card p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label>
            <span className="field-label">Search prompts</span>
            <input
              className="field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Contract, RFI, budget, handoff, clarification..."
            />
          </label>
          <label>
            <span className="field-label">Category</span>
            <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((prompt) => <PromptCard prompt={prompt} key={prompt.id} />)}
      </div>
      {filtered.length === 0 ? (
        <section className="card p-8 text-center">
          <p className="font-semibold text-ink">No prompts match that search.</p>
          <p className="mt-2 text-sm text-moss">Try a task like RFI, scope, budget, or change order.</p>
        </section>
      ) : null}
    </div>
  );
}
