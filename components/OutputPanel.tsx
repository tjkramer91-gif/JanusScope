"use client";

import { CopyButton } from "@/components/CopyButton";

export function OutputPanel({
  title,
  description,
  content,
}: {
  title: string;
  description?: string;
  content: string;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 p-6 sm:p-8">
        <div>
          <h2 className="section-title">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton value={content} />
          <button className="button-secondary" type="button" onClick={() => typeof window !== "undefined" && window.print()}>
            Print / PDF
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap p-6 text-sm leading-6 text-ink sm:p-8">{content}</pre>
    </section>
  );
}
