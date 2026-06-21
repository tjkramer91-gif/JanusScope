"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { OutputTransformButtons } from "@/components/OutputTransformButtons";
import { TRANSFORM_ACTIONS } from "@/lib/platform-content";
import { scrubShareSafeText } from "@/lib/share-safe";

export function OutputPanel({
  title,
  description,
  content,
}: {
  title: string;
  description?: string;
  content: string;
}) {
  const [shareSafe, setShareSafe] = useState(false);
  const displayedContent = useMemo(() => shareSafe ? scrubShareSafeText(content) : content, [content, shareSafe]);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line/60 p-6 sm:p-8">
        <div>
          <h2 className="section-title">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">{description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            aria-pressed={shareSafe}
            className={shareSafe ? "button-primary" : "button-secondary"}
            type="button"
            onClick={() => setShareSafe((current) => !current)}
          >
            Share-Safe Mode
          </button>
          <CopyButton value={displayedContent} />
          <button className="button-secondary" type="button" onClick={() => typeof window !== "undefined" && window.print()}>
            Print / PDF
          </button>
        </div>
      </div>
      <div className="border-b border-line/60 p-6 sm:p-8">
        <OutputTransformButtons actions={TRANSFORM_ACTIONS} />
      </div>
      {shareSafe ? (
        <div className="border-b border-line/60 bg-paper px-6 py-3 text-xs font-semibold text-moss sm:px-8">
          Share-Safe Mode replaces common addresses, emails, phone numbers, company names, and dollar amounts before copy or print.
        </div>
      ) : null}
      <pre className="whitespace-pre-wrap p-6 text-sm leading-6 text-ink sm:p-8">{displayedContent}</pre>
    </section>
  );
}
