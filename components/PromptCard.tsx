"use client";

import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import type { PromptDefinition } from "@/lib/platform-content";

export function PromptCard({ prompt }: { prompt: PromptDefinition }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{prompt.role} · {prompt.projectPhase}</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">{prompt.title}</h2>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
          {prompt.outputType}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-moss">{prompt.useCase}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[prompt.category, prompt.task, prompt.trade, prompt.riskType, prompt.experienceLevel].map((tag) => (
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase text-moss">Inputs needed</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {prompt.inputsNeeded.map((input) => (
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={input}>
              {input}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-[18px] border border-line/60 bg-paper p-4 text-sm leading-6 text-moss">
        <p className="text-xs font-semibold uppercase text-steel">Expected output</p>
        <p className="mt-2">{prompt.expectedOutput}</p>
      </div>
      <pre className="mt-5 max-h-48 overflow-auto whitespace-pre-wrap rounded-[18px] border border-line/60 bg-paper p-4 text-xs leading-5 text-ink">
        {prompt.prompt}
      </pre>
      <div className="mt-6 flex flex-wrap gap-2">
        <CopyButton value={prompt.prompt} />
        <Link className="button-secondary" href={`/app/ask?prompt=${encodeURIComponent(prompt.prompt)}`}>
          Open in Ask Janus
        </Link>
        {prompt.workflowSlug ? (
          <Link className="button-secondary" href={`/app/workflows/${prompt.workflowSlug}`}>
            Run as Workflow
          </Link>
        ) : null}
      </div>
    </article>
  );
}
