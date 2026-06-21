"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { OutputPanel } from "@/components/OutputPanel";
import type { WorkflowDefinition } from "@/lib/platform-content";

function buildWorkflowOutput(
  workflow: WorkflowDefinition,
  values: Record<string, string>,
  roleMode: string,
  audience: string,
  projectPhase: string,
): string {
  const filledInputs = Object.entries(values)
    .filter(([, value]) => value.trim().length > 0)
    .map(([label, value]) => `- ${label}: ${value.trim()}`);
  const missingInputs = workflow.inputLabels.filter((label) => !values[label]?.trim());

  return [
    `${workflow.title}`,
    "",
    "1. Executive Summary",
    `Based on the information provided, this ${workflow.shortTitle.toLowerCase()} should focus first on scope ownership, unclear responsibility, missing backup, and decisions that could create cost or schedule exposure.`,
    `Primary review role: ${roleMode}`,
    `Project phase: ${projectPhase}`,
    `Output audience: ${audience}`,
    "",
    "2. Highest Risk Items",
    ...workflow.reviewFocus.slice(0, 6).map((item) => `- ${item}: needs verification against the source documents before relying on the output.`),
    "",
    "3. Known Information Provided",
    ...(filledInputs.length > 0 ? filledInputs : ["- No project facts were entered yet. Add contract, scope, budget, field, or communication details before using this output externally."]),
    "",
    "4. Missing Information",
    ...(missingInputs.length > 0 ? missingInputs.slice(0, 10).map((label) => `- ${label}`) : ["- No obvious missing input from this workflow form. Still verify source documents."]),
    "",
    "5. Clarification Questions",
    "- Who owns the disputed or unclear scope item?",
    "- What document controls if the bid, contract, drawings, specs, addenda, budget, or owner report conflict?",
    "- What exclusions, assumptions, allowances, alternates, or qualifications need to be preserved in writing?",
    "- What deadline applies for notice, pricing, response, field direction, or owner communication?",
    "",
    "6. Recommended Next Actions",
    ...workflow.nextActions.map((action) => `- ${action}`),
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
  const [isRunning, setIsRunning] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [roleMode, setRoleMode] = useState(workflow.bestFor[0] ?? "");
  const [audience, setAudience] = useState(workflow.audiences[0] ?? "");
  const [projectPhase, setProjectPhase] = useState(workflow.projectPhases[0] ?? "");

  const output = useMemo(
    () => buildWorkflowOutput(workflow, values, roleMode, audience, projectPhase),
    [audience, projectPhase, roleMode, values, workflow],
  );

  function runWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRunning(true);
    window.setTimeout(() => {
      setHasOutput(true);
      setIsRunning(false);
    }, 450);
  }

  function clearForm() {
    setValues(Object.fromEntries(workflow.inputLabels.map((label) => [label, ""])));
    setHasOutput(false);
    setRoleMode(workflow.bestFor[0] ?? "");
    setAudience(workflow.audiences[0] ?? "");
    setProjectPhase(workflow.projectPhases[0] ?? "");
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
          <div className="mb-6 grid gap-5 md:grid-cols-3">
            <label>
              <span className="field-label">Role mode</span>
              <select className="field" value={roleMode} onChange={(event) => setRoleMode(event.target.value)}>
                {workflow.bestFor.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Project phase</span>
              <select className="field" value={projectPhase} onChange={(event) => setProjectPhase(event.target.value)}>
                {workflow.projectPhases.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Output audience</span>
              <select className="field" value={audience} onChange={(event) => setAudience(event.target.value)}>
                {workflow.audiences.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
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
              <p className="eyebrow">Document-backed review</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Use project upload for files</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">
                Workflow pages are for fast pasted-context drafts. For drag-and-drop files, auto-classification, source-backed comparison, and saved reports, start from a project.
              </p>
            </div>
            <Link className="button-secondary" href="/app/projects/new">
              Start Project Review
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button className="button-secondary" type="button" onClick={clearForm}>
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
