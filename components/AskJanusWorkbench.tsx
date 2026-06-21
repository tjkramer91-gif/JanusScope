"use client";

import { FormEvent, useMemo, useState } from "react";
import { OutputPanel } from "@/components/OutputPanel";
import { ASK_JANUS_STARTERS } from "@/lib/platform-content";

function buildAskOutput(prompt: string, context: string, files: string[]): string {
  const hasContext = context.trim().length > 0;
  const hasPrompt = prompt.trim().length > 0;

  return [
    "Ask Janus construction response",
    "",
    "1. Direct Read",
    hasPrompt
      ? `You asked: ${prompt.trim()}`
      : "Add a construction question, contract clause, scope issue, field condition, budget concern, or email task.",
    hasContext
      ? "The response should be based on the pasted project information, not outside assumptions."
      : "No project context was pasted yet, so this output is a response framework rather than a project-specific answer.",
    "",
    "2. Highest Risk Items To Check First",
    "- Scope ownership: confirm who is responsible for labor, materials, coordination, temporary protection, permits, testing, and cleanup.",
    "- Contract conflict: check whether the contract, scope exhibit, bid, drawings, specs, and addenda say different things.",
    "- Notice and timing: verify deadlines for RFI, change order, claim notice, pricing, schedule impact, and written authorization.",
    "- Cost exposure: identify work that is vague, excluded, assumed, allowance-based, or missing backup.",
    "",
    "3. Facts vs Unknowns",
    hasContext ? "- Facts provided by user are in the pasted context below." : "- No facts have been provided yet.",
    ...files.map((file) => `- File referenced: ${file}`),
    "- Unknowns should be confirmed before relying on the output.",
    "",
    "4. Useful Next Questions",
    "- What source document controls this issue?",
    "- Was this included in the original bid or proposal?",
    "- Was it excluded, qualified, or assumed?",
    "- Who directed the work or requested the change?",
    "- What answer is needed before pricing, signing, building, or issuing direction?",
    "",
    "5. Draft Communication Shape",
    "Subject: Clarification needed on scope and responsibility",
    "",
    "Please confirm the items below so the team can align scope, pricing, schedule, and responsibility before proceeding.",
    "",
    "1. Please confirm the controlling document and section.",
    "2. Please confirm whether this work is included, excluded, or requires separate direction.",
    "3. Please confirm any cost or schedule impact process before work proceeds.",
    "",
    "6. Verification Note",
    "Based on the information provided. Confirm source documents, dates, authority, and contract requirements before relying on this.",
  ].join("\n");
}

export function AskJanusWorkbench({ initialPrompt = "" }: { initialPrompt?: string }) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [context, setContext] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasOutput, setHasOutput] = useState(Boolean(initialPrompt));
  const output = useMemo(() => buildAskOutput(prompt, context, files), [context, files, prompt]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    window.setTimeout(() => {
      setHasOutput(true);
      setIsRunning(false);
    }, 450);
  }

  return (
    <div className="space-y-8">
      <section className="card p-6 sm:p-8">
        <p className="eyebrow">Suggested prompts</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ASK_JANUS_STARTERS.map((starter) => (
            <button
              className="rounded-full border border-line/60 bg-paper px-4 py-2 text-sm font-semibold text-moss hover:border-steel hover:text-steel"
              type="button"
              key={starter}
              onClick={() => {
                setPrompt(starter);
                setHasOutput(false);
              }}
            >
              {starter}
            </button>
          ))}
        </div>
      </section>

      <form className="space-y-6" onSubmit={submit}>
        <section className="card p-8 sm:p-10">
          <label className="block">
            <span className="field-label">What do you want JanusScope to help with?</span>
            <input
              className="field"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Review this scope, draft an RFI, compare this proposal, write a clarification email..."
            />
          </label>
          <label className="mt-6 block">
            <span className="field-label">Paste contract, scope, budget, RFI, field, or email context</span>
            <textarea
              className="field min-h-56"
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Paste the construction language or facts here. JanusScope will separate knowns, unknowns, risk, and next questions."
            />
          </label>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line/60 bg-paper p-5">
            <div>
              <p className="font-semibold text-ink">Optional file references</p>
              <p className="mt-1 text-sm leading-6 text-moss">
                This Ask Janus MVP tracks selected file names. Use project upload when documents need to be saved.
              </p>
            </div>
            <label className="button-secondary cursor-pointer" htmlFor="ask-files">
              Choose Files
            </label>
            <input
              id="ask-files"
              className="sr-only"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
              onChange={(event) => setFiles(event.currentTarget.files ? Array.from(event.currentTarget.files).map((file) => file.name) : [])}
            />
          </div>
          {files.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2 text-sm text-moss">
              {files.map((file) => (
                <li className="rounded-full border border-line/60 bg-paper px-4 py-2" key={file}>{file}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="flex justify-end">
          <button className="button-primary" type="submit" disabled={isRunning}>
            {isRunning ? "Reviewing..." : "Ask Janus"}
          </button>
        </div>
      </form>

      {hasOutput ? (
        <OutputPanel
          title="JanusScope response draft"
          description="Use this as a structured starting point. Confirm the source documents before relying on it."
          content={output}
        />
      ) : null}
    </div>
  );
}
