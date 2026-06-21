import { MSA_STATUS_LABELS, PROJECT_TYPE_LABELS, PUBLIC_PRIVATE_LABELS, YES_NO_NOT_SURE_LABELS } from "@/lib/catalogs";
import { createProjectAction } from "@/app/app/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <form action={createProjectAction} className="mx-auto max-w-[1120px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Project setup</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Create JanusScope project</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-moss">
            Add the basic project context for document review, workflow outputs, reports, and project memory. If you do not know the trade yet, JanusScope will infer it from the package.
          </p>
        </div>
        <PendingSubmitButton className="button-primary" pendingLabel="Creating project...">
          Create Project
        </PendingSubmitButton>
      </div>

      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}

      <section className="card p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="section-title">Project basics</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            These fields anchor the review package, report header, and signing deadline reminders.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <label className="md:col-span-2">
            <span className="field-label">Project name</span>
            <input className="field" name="name" required placeholder="Mesa Apartments Phase 2" />
          </label>
          <label>
            <span className="field-label">GC name</span>
            <input className="field" name="gcName" placeholder="General contractor, if known" />
          </label>
          <label>
            <span className="field-label">Trade/scope if known</span>
            <input className="field" name="tradeType" placeholder="Electrical, windows, roofing..." />
          </label>
          <label>
            <span className="field-label">Contract amount</span>
            <input className="field" name="contractAmount" min="0" step="100" type="number" placeholder="1250000" />
          </label>
          <label>
            <span className="field-label">Bid date</span>
            <input className="field" name="bidDate" type="date" />
          </label>
          <label>
            <span className="field-label">Contract execution deadline</span>
            <input className="field" name="executionDeadline" type="date" />
          </label>
          <label className="md:col-span-2">
            <span className="field-label">Project location</span>
            <input className="field" name="projectAddress" required placeholder="Street address or project site" />
          </label>
          <label>
            <span className="field-label">City</span>
            <input className="field" name="city" required />
          </label>
          <label>
            <span className="field-label">State</span>
            <input className="field" name="state" required />
          </label>
          <label>
            <span className="field-label">ZIP</span>
            <input className="field" name="zip" />
          </label>
          <label>
            <span className="field-label">Owner name</span>
            <input className="field" name="ownerName" placeholder="Optional" />
          </label>
          <label className="md:col-span-2 xl:col-span-4">
            <span className="field-label">Basic project notes</span>
            <textarea className="field min-h-24" name="projectNotes" placeholder="Anything already known about the package, scope, deadline, or concern." />
          </label>
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <div className="mb-8">
          <h2 className="section-title">Optional review context</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Keep this light for now. These values help frame wage, MSA, and project-type risk without adding another setup step.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="field-label">Project type</span>
            <select className="field" name="projectType" defaultValue="commercial">
              {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Master service agreement</span>
            <select className="field" name="hasMasterServiceAgreement" defaultValue="not-sure">
              {Object.entries(MSA_STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Public or private work</span>
            <select className="field" name="publicOrPrivate" defaultValue="not-sure">
              {Object.entries(PUBLIC_PRIVATE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="field-label">Prevailing wage involved</span>
            <select className="field" name="prevailingWageStatus" defaultValue="not-sure">
              {Object.entries(YES_NO_NOT_SURE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <PendingSubmitButton className="button-primary" pendingLabel="Creating project...">
          Create Project and Upload Documents
        </PendingSubmitButton>
      </div>
    </form>
  );
}
