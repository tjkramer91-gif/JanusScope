import { PROJECT_TYPE_LABELS } from "@/lib/catalogs";
import { createProjectAction } from "@/app/app/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { createSyntheticDemoProfile } from "@/lib/synthetic-data";

const SETUP_STEPS = ["Create Project", "Upload Documents", "AI Classifies Documents", "Review Findings", "Export Report"];

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const placeholder = createSyntheticDemoProfile("project-form-placeholder");

  return (
    <form action={createProjectAction} className="mx-auto max-w-[1120px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 1</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Start a construction review</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">
            Name the package, add any context you already know, then upload the documents. JanusScope can infer trade and document type from the package.
          </p>
        </div>
        <PendingSubmitButton className="button-primary" pendingLabel="Creating project...">
          Continue to Upload
        </PendingSubmitButton>
      </div>

      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

      <section className="grid gap-3 md:grid-cols-5">
        {SETUP_STEPS.map((step, index) => (
          <div className={`rounded-[20px] border p-4 ${index === 0 ? "border-steel bg-[#eaf3ff]" : "border-line/60 bg-white"}`} key={step}>
            <p className="text-xs font-semibold uppercase text-moss">Step {index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{step}</p>
          </div>
        ))}
      </section>

      <section className="card p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="section-title">Just enough context to start</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Only the project name is required. The rest helps JanusScope frame the review and can be updated later.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <label>
            <span className="field-label">Project name</span>
            <input className="field" name="name" required placeholder={placeholder.projectName} />
          </label>
          <label>
            <span className="field-label">Project type</span>
            <select className="field" name="projectType" defaultValue="commercial">
              {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Trade or scope if known</span>
            <input className="field" name="tradeType" placeholder="Electrical, windows, roofing, mixed package..." />
          </label>
          <label>
            <span className="field-label">Location if useful</span>
            <input className="field" name="projectAddress" placeholder={placeholder.projectAddress} />
          </label>
          <label className="md:col-span-2">
            <span className="field-label">Known concern or review goal</span>
            <textarea className="field min-h-28" name="projectNotes" placeholder="Upload the package and show me what can hurt me. Focus on missing scope, bid vs contract conflicts, allowances, exclusions, and schedule exposure." />
          </label>
        </div>
      </section>

      <details className="card p-8 sm:p-10">
        <summary className="cursor-pointer text-xl font-semibold text-ink">
          Add optional report details
        </summary>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Use these if you already know them. They are not required to start the document review.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="field-label">GC name</span>
            <input className="field" name="gcName" placeholder="General contractor, if known" />
          </label>
          <label>
            <span className="field-label">Owner name</span>
            <input className="field" name="ownerName" placeholder="Optional" />
          </label>
          <label>
            <span className="field-label">Contract amount</span>
            <input className="field" name="contractAmount" min="0" step="100" type="number" placeholder="Optional" />
          </label>
          <label>
            <span className="field-label">Bid or deadline date</span>
            <input className="field" name="executionDeadline" type="date" />
          </label>
          <label>
            <span className="field-label">City</span>
            <input className="field" name="city" placeholder={placeholder.city} />
          </label>
          <label>
            <span className="field-label">State</span>
            <input className="field" name="state" placeholder={placeholder.state} />
          </label>
          <label>
            <span className="field-label">ZIP</span>
            <input className="field" name="zip" placeholder={placeholder.zip} />
          </label>
        </div>
      </details>

      <div className="flex justify-end">
        <PendingSubmitButton className="button-primary" pendingLabel="Creating project...">
          Create Project and Upload Documents
        </PendingSubmitButton>
      </div>
    </form>
  );
}
