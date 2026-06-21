"use client";

import { useMemo, useState } from "react";
import { PromptCard } from "@/components/PromptCard";
import { PromptFilterPanel } from "@/components/PromptFilterPanel";
import type { PromptDefinition } from "@/lib/platform-content";

export function PromptLibrary({ prompts }: { prompts: PromptDefinition[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "All",
    role: "All",
    projectPhase: "All",
    trade: "All",
    riskType: "All",
    outputType: "All",
    experienceLevel: "All",
  });

  const filterFields = [
    { key: "category", label: "Task", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.category)))] },
    { key: "role", label: "Role", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.role)))] },
    { key: "projectPhase", label: "Project phase", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.projectPhase)))] },
    { key: "trade", label: "Trade", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.trade)))] },
    { key: "riskType", label: "Risk type", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.riskType)))] },
    { key: "outputType", label: "Output type", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.outputType)))] },
    { key: "experienceLevel", label: "Experience level", options: ["All", ...Array.from(new Set(prompts.map((prompt) => prompt.experienceLevel)))] },
  ];

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return prompts.filter((prompt) => {
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "All") return true;
        return String(prompt[key as keyof PromptDefinition]) === value;
      });
      const matchesQuery =
        !normalized ||
        [
          prompt.title,
          prompt.useCase,
          prompt.prompt,
          prompt.category,
          prompt.role,
          prompt.task,
          prompt.trade,
          prompt.riskType,
          prompt.outputType,
          prompt.expectedOutput,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesFilters && matchesQuery;
    });
  }, [filters, prompts, query]);

  return (
    <div className="space-y-6">
      <PromptFilterPanel
        query={query}
        onQueryChange={setQuery}
        fields={filterFields}
        values={filters}
        onValueChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((prompt) => <PromptCard prompt={prompt} key={prompt.id} />)}
      </div>
      {filtered.length === 0 ? (
        <section className="card p-8 text-center">
          <p className="font-semibold text-ink">No prompts match that filter set.</p>
          <p className="mt-2 text-sm text-moss">Try a broader role, trade, or output type.</p>
        </section>
      ) : null}
    </div>
  );
}
