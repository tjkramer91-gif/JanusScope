"use client";

import { FormEvent, useMemo, useState } from "react";
import { OutputPanel } from "@/components/OutputPanel";
import type { WorkflowDefinition } from "@/lib/platform-content";

function buildWorkflowOutput(workflow: WorkflowDefinition, values: Record<string, string>, fileNames: string[]): string {
  const filledInputs = Object.entries(values)
    .filter(([, value]) => value.trim().length > 0)
    .map(([label, value]) => `- ${label}: ${value.trim()}`);
  const missingInputs = workflow.inputLabels.filter((label) => !values[label]?.trim());

  return [
    `${workflow.title}`,
    "",
    "1. Executive Summary",
    `Based on the information provided, this ${workflow.shortTitle.toLowerCase()} should focus first on scope ownership, unclear responsibility, missing backup, and decisions that could create cost or schedule exposure.`,
    "",
    "2. Highest Risk Items",
    ...workflow.reviewFocus.slice(0, 5).map((item) => `- ${item}: needs verification against the source documents before relying on the output.`),
    "",
    "3. Known Information Provided",
    ...(filledInputs.length > 0 ? filledInputs : ["- No project facts were entered yet. Add contract, scope, budget, field, or communication details before using this output externally."]),
    ...(fileNames.length > 0 ? ["", "Files referenced in this draft:", ...fileNames.map((name) => `- ${name}`)] : []),
    "",
    "4. Missing Information",
    ...(missingInputs.length > 0 ? missingInputs.slice(0, 8).map((label) => `- ${label}`) : ["- No obvious missing input from this workflow form. Still verify source documents."]),
    "",
    "5. Clarification Questions",
    "- Who owns the disputed or unclear scope item?",
    "- What document controls if the bid, contract, drawings, specs, or addenda conflict?",
    "- What exclusions, assumptions, allowances, alternates, or qualifications need to be preserved in writing?",
    "- What deadline applies for notice, pricing, response, or field direction?",
    "",
    "6. Recommended Next Actions",
    "- Confirm source documents and dates before sending this externally.",
    "- Convert the highest risk items into a clarification log or RFI if an answer is needed.",
    "- Save the final output under a project when the document package needs a report history.",
    "",
    "7. Draft Deliverable",
    `Subject: ${workflow.shortTitle} clarification`,
    "",
    "Please confirm the items below so we can align scope, pricing, responsibility, and schedule before the issue creates cost exposure.",
    "",
    workflow.outputSections.map((section, index) => `${index + 1}. ${section}`).join("\n"),
    "",
    "8. Verification Notes",
    "This draft is based only on the information entered here. It is not a legal conclusion, pricing certainty, or substitute for source-document review.",
  ].join("\n");
}

export function WorkflowInputForm({ workflow }: { workflow: WorkflowDefinition }) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(workflow.inputLabels.map((label) => [label, ""])),
  );
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);

  const output = useMemo(() => buildWorkflowOutput(workflow, values, fileNames), [fileNames, values, workflow]);

  function runWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    window.setTimeout(() => {
      setHasOutput(true);
      setIsRunning(false);
    }, 450);
  }

  return (
    <div className="space-y-8">
      <form className="space-y-6" onSubmit={runWorkflow}>
        <section className="card p-8 sm:p-10">
          <div className="mb-8">
            <p className="eyebrow">Workflow inputs</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Paste what you know</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
              Use the fields that matter. Leave unknowns blank and JanusScope will flag them as missing information.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {workflow.inputLabels.map((label, index) => (
              <label className={index > 2 ? "md:col-span-2" : ""} key={label}>
                <span className="field-label">{label}</span>
                {index > 2 ? (
                  <textarea
                    className="field min-h-28"
                    value={values[label] ?? ""}
                    onChange={(event) => setValues((current) => ({ ...current, [label]: event.target.value }))}
                    placeholder={`Paste ${label.toLowerCase()} here`}
                  />
                ) : (
                  <input
                    className="field"
                    value={values[label] ?? ""}
                    onChange={(event) => setValues((current) => ({ ...current, [label]: event.target.value }))}
                    placeholder={label}
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Optional files</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Attach reference files to this draft</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">
                This workflow draft tracks file names only. To save documents against a project, use the project upload flow.
              </p>
            </div>
            <label className="button-secondary cursor-pointer" htmlFor="workflow-files">
              Choose Files
            </label>
          </div>
          <input
            id="workflow-files"
            className="sr-only"
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
            onChange={(event) => setFileNames(event.currentTarget.files ? Array.from(event.currentTarget.files).map((file) => file.name) : [])}
          />
          {fileNames.length > 0 ? (
            <ul className="mt-5 grid gap-2 text-sm text-moss sm:grid-cols-2">
              {fileNames.map((name) => (
                <li className="truncate rounded-full border border-line/60 bg-paper px-4 py-2" key={name}>{name}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button className="button-secondary" type="button" onClick={() => {
            setValues(Object.fromEntries(workflow.inputLabels.map((label) => [label, ""])));
            setFileNames([]);
            setHasOutput(false);
          }}>
            Clear
          </button>
          <button className="button-primary" type="submit" disabled={isRunning}>
            {isRunning ? "Running workflow..." : workflow.cta}
          </button>
        </div>
      </form>

      {hasOutput ? (
        <OutputPanel
          title={`${workflow.shortTitle} output`}
          description="Copy this into a project note, email, report draft, or external review workflow."
          content={output}
        />
      ) : null}
    </div>
  );
}
