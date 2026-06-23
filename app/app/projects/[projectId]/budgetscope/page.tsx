import Link from "next/link";
import { notFound } from "next/navigation";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { requireUser } from "@/lib/server/auth";
import { formatCurrency } from "@/lib/format";
import { getBudgetComparisonReport, getProject, listComparableBudgets, listProjectBudgetComparisons, listProjectBudgets } from "@/lib/server/store";
import { compareBudgetsAction, importBudgetScopeAction } from "./actions";

const PROJECT_TYPES = [
  ["multifamily", "Multifamily"],
  ["affordable-housing", "Affordable housing"],
  ["commercial", "Commercial"],
  ["tenant-improvement", "Tenant improvement"],
  ["civil", "Civil"],
  ["industrial", "Industrial"],
  ["public-works", "Public works"],
  ["other", "Other"],
];

const RENOVATION_OPTIONS = [
  ["renovation", "Renovation"],
  ["new-construction", "New construction"],
  ["mixed", "Mixed"],
  ["unknown", "Unknown"],
];

const SOURCE_TYPES = [
  ["budget", "Budget"],
  ["bid", "Bid"],
  ["estimate", "Estimate"],
  ["actual", "Actual"],
  ["allowance", "Allowance"],
  ["conceptual", "Conceptual"],
];

const OCCUPANCY_OPTIONS = [
  ["unknown", "Unknown"],
  ["occupied", "Occupied"],
  ["vacant", "Vacant"],
  ["mixed", "Mixed"],
];

const CONSENT_OPTIONS = [
  ["not-requested", "Not requested"],
  ["granted", "Granted"],
  ["declined", "Declined"],
  ["revoked", "Revoked"],
];

const COLUMN_FIELDS = [
  ["map_costCode", "Cost code", "Cost Code"],
  ["map_csiDivision", "CSI division", "CSI Division"],
  ["map_trade", "Trade", "Trade"],
  ["map_description", "Description", "Description"],
  ["map_quantity", "Quantity", "Qty"],
  ["map_unitOfMeasure", "Unit of measure", "UOM"],
  ["map_unitCost", "Unit cost", "Unit Cost"],
  ["map_totalCost", "Total cost", "Total Cost"],
  ["map_notes", "Notes", "Notes"],
  ["map_exclusions", "Exclusions", "Exclusions"],
  ["map_alternates", "Alternates", "Alternates"],
  ["map_allowanceFlag", "Allowance flag", "Allowance"],
];

function numberDefault(value: number | null): string {
  return value === null ? "" : String(value);
}

function money(value: number | null | undefined): string {
  return value === null || value === undefined ? "N/A" : formatCurrency(value);
}

function percent(value: number | null | undefined): string {
  return value === null || value === undefined ? "N/A" : `${value}%`;
}

function plainNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? "N/A" : String(value);
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input className="field" name={name} type={type} defaultValue={defaultValue} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[][];
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <select className="field" name={name} defaultValue={defaultValue}>
        {options.map(([value, labelText]) => (
          <option value={value} key={value}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

export default async function BudgetScopePage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ saved?: string; rows?: string; error?: string; comparison?: string }>;
}) {
  const { projectId } = await params;
  const status = await searchParams;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();
  const [budgets, comparableBudgets, comparisons, selectedComparison] = await Promise.all([
    listProjectBudgets(user, project.id),
    listComparableBudgets(user),
    listProjectBudgetComparisons(user, project.id),
    status.comparison ? getBudgetComparisonReport(user, status.comparison) : Promise.resolve(null),
  ]);
  const action = importBudgetScopeAction.bind(null, project.id);
  const compareAction = compareBudgetsAction.bind(null, project.id);
  const currentDefault = budgets[0]?.id ?? comparableBudgets[0]?.id ?? "";
  const priorDefault = comparableBudgets.find((budget) => budget.id !== currentDefault)?.id ?? "";

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">BudgetScope</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Import a project budget</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Upload a CSV budget, confirm the project metadata, map columns, and save line items for later BudgetScope review.
          </p>
        </div>
        <Link className="button-secondary" href={`/app/projects/${project.id}`}>
          Back to Project
        </Link>
      </div>

      {status.saved ? (
        <StatusBanner tone="success">
          {`Budget imported. ${status.rows ?? "0"} line item${status.rows === "1" ? "" : "s"} saved to this project.`}
        </StatusBanner>
      ) : null}
      {status.error ? <StatusBanner tone="error">{status.error}</StatusBanner> : null}

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Compare budgets</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Budget variance engine</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
              Select a current budget and compare it against a prior uploaded budget, prior version, or another stored JanusScope project budget.
            </p>
          </div>
          <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
            {comparableBudgets.length} stored budget{comparableBudgets.length === 1 ? "" : "s"}
          </span>
        </div>
        <form action={compareAction} className="mt-6 grid gap-5 md:grid-cols-4">
          <Field label="Comparison name" name="comparisonName" defaultValue="Budget variance review" />
          <SelectField
            label="Comparison type"
            name="comparisonType"
            defaultValue="budget-to-budget"
            options={[
              ["budget-to-budget", "Budget to budget"],
              ["version-to-version", "Version to version"],
              ["project-to-project", "Project to project"],
            ]}
          />
          <label className="block">
            <span className="field-label">Current budget</span>
            <select className="field" name="currentBudgetId" defaultValue={currentDefault} required>
              <option value="">Select current budget</option>
              {comparableBudgets.map((budget) => (
                <option value={budget.id} key={budget.id}>
                  {budget.budgetName} · {budget.budgetVersion || "Initial"} · {budget.city || "No city"}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">Prior budget</span>
            <select className="field" name="priorBudgetId" defaultValue={priorDefault} required>
              <option value="">Select prior budget</option>
              {comparableBudgets.map((budget) => (
                <option value={budget.id} key={budget.id}>
                  {budget.budgetName} · {budget.budgetVersion || "Initial"} · {budget.city || "No city"}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-4 flex justify-end">
            <PendingSubmitButton className="button-primary" pendingLabel="Comparing budgets...">
              Generate Comparison
            </PendingSubmitButton>
          </div>
        </form>
        {comparableBudgets.length < 2 ? (
          <p className="mt-4 rounded-[18px] border border-line/60 bg-paper p-4 text-sm text-moss">
            Import at least two budgets before running a BudgetScope comparison.
          </p>
        ) : null}
      </section>

      {selectedComparison ? (
        <section className="space-y-6">
          <div className="card p-8 sm:p-10">
            <p className="eyebrow">Budget comparison report</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">{selectedComparison.comparison.comparisonName}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                ["Current total", money(selectedComparison.report.executiveSummary.currentTotalCost)],
                ["Prior total", money(selectedComparison.report.executiveSummary.priorTotalCost)],
                ["Variance", money(selectedComparison.report.executiveSummary.totalProjectCostVariance)],
                ["Percent variance", percent(selectedComparison.report.executiveSummary.totalProjectPercentVariance)],
                ["Current cost/GSF", money(selectedComparison.report.executiveSummary.currentCostPerGsf)],
                ["Prior cost/GSF", money(selectedComparison.report.executiveSummary.priorCostPerGsf)],
                ["Current cost/unit", money(selectedComparison.report.executiveSummary.currentCostPerUnit)],
                ["Prior cost/unit", money(selectedComparison.report.executiveSummary.priorCostPerUnit)],
              ].map(([label, value]) => (
                <div className="rounded-[18px] border border-line/60 bg-paper p-5" key={label}>
                  <p className="text-xs font-semibold uppercase text-moss">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-ink">Biggest increases</h3>
                <ul className="mt-3 space-y-2 text-sm text-moss">
                  {selectedComparison.report.executiveSummary.biggestIncreases.length === 0 ? <li>No increases detected.</li> : null}
                  {selectedComparison.report.executiveSummary.biggestIncreases.map((line) => (
                    <li key={`${line.currentLineItemId ?? line.priorLineItemId}-increase`}>
                      <span className="font-semibold text-ink">{line.normalizedTrade}</span>: {line.currentDescription || line.priorDescription} · {money(line.totalCostVariance)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Biggest decreases</h3>
                <ul className="mt-3 space-y-2 text-sm text-moss">
                  {selectedComparison.report.executiveSummary.biggestDecreases.length === 0 ? <li>No decreases detected.</li> : null}
                  {selectedComparison.report.executiveSummary.biggestDecreases.map((line) => (
                    <li key={`${line.currentLineItemId ?? line.priorLineItemId}-decrease`}>
                      <span className="font-semibold text-ink">{line.normalizedTrade}</span>: {line.currentDescription || line.priorDescription} · {money(line.totalCostVariance)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-line/60 p-8 sm:p-10">
              <p className="eyebrow">Trade summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Variance by trade</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1120px] w-full text-left text-sm">
                <thead className="bg-paper/70 text-xs uppercase text-moss">
                  <tr>
                    {["Trade", "Prior total", "Current total", "Variance", "%", "Prior cost/SF", "Current cost/SF", "Prior cost/unit", "Current cost/unit", "Driver", "Risk"].map((heading) => (
                      <th className="px-4 py-3 font-semibold" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {selectedComparison.report.tradeSummaries.map((trade) => (
                    <tr key={trade.normalizedTrade}>
                      <td className="px-4 py-4 font-semibold text-ink">{trade.normalizedTrade}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.priorTotalCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.currentTotalCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.totalCostVariance)}</td>
                      <td className="px-4 py-4 text-moss">{percent(trade.totalCostVariancePercent)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.priorCostPerGsf)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.currentCostPerGsf)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.priorCostPerUnit)}</td>
                      <td className="px-4 py-4 text-moss">{money(trade.currentCostPerUnit)}</td>
                      <td className="px-4 py-4 text-moss">{trade.likelyVarianceDriver}</td>
                      <td className="px-4 py-4 font-semibold text-ink">{trade.riskLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-line/60 p-8 sm:p-10">
              <p className="eyebrow">Line item variance</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Compared budget line items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1440px] w-full text-left text-sm">
                <thead className="bg-paper/70 text-xs uppercase text-moss">
                  <tr>
                    {["Trade", "Prior description", "Current description", "Prior qty", "Current qty", "Prior unit", "Current unit", "Prior unit cost", "Current unit cost", "Prior total", "Current total", "Variance", "%", "Flag", "Question"].map((heading) => (
                      <th className="px-4 py-3 font-semibold" key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {selectedComparison.report.lineResults.map((line) => (
                    <tr key={`${line.priorLineItemId ?? "none"}-${line.currentLineItemId ?? "none"}`}>
                      <td className="px-4 py-4 font-semibold text-ink">{line.normalizedTrade}</td>
                      <td className="px-4 py-4 text-moss">{line.priorDescription || "Not in prior"}</td>
                      <td className="px-4 py-4 text-moss">{line.currentDescription || "Not in current"}</td>
                      <td className="px-4 py-4 text-moss">{plainNumber(line.priorQuantity)}</td>
                      <td className="px-4 py-4 text-moss">{plainNumber(line.currentQuantity)}</td>
                      <td className="px-4 py-4 text-moss">{line.priorUnitOfMeasure || "N/A"}</td>
                      <td className="px-4 py-4 text-moss">{line.currentUnitOfMeasure || "N/A"}</td>
                      <td className="px-4 py-4 text-moss">{money(line.priorUnitCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(line.currentUnitCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(line.priorTotalCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(line.currentTotalCost)}</td>
                      <td className="px-4 py-4 text-moss">{money(line.totalCostVariance)}</td>
                      <td className="px-4 py-4 text-moss">{percent(line.totalCostVariancePercent)}</td>
                      <td className="px-4 py-4 text-moss">{line.riskFlag || "review"}</td>
                      <td className="px-4 py-4 text-moss">{line.recommendedQuestion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card p-8 sm:p-10">
              <p className="eyebrow">Missing / new scope</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Items to verify</h2>
              <div className="mt-5 space-y-4 text-sm text-moss">
                <div>
                  <h3 className="font-semibold text-ink">New in current</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedComparison.report.newScope.length === 0 ? <li>No new scope flagged.</li> : null}
                    {selectedComparison.report.newScope.map((line) => <li key={`${line.currentLineItemId}-new`}>{line.normalizedTrade}: {line.currentDescription}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Missing from current</h3>
                  <ul className="mt-2 space-y-2">
                    {selectedComparison.report.missingScope.length === 0 ? <li>No missing prior scope flagged.</li> : null}
                    {selectedComparison.report.missingScope.map((line) => <li key={`${line.priorLineItemId}-missing`}>{line.normalizedTrade}: {line.priorDescription}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-ink">Changed units / possible duplicates</h3>
                  <ul className="mt-2 space-y-2">
                    {[...selectedComparison.report.changedUnits, ...selectedComparison.report.possibleDuplicates].length === 0 ? <li>No changed units or duplicates flagged.</li> : null}
                    {[...selectedComparison.report.changedUnits, ...selectedComparison.report.possibleDuplicates].map((line) => <li key={`${line.priorLineItemId}-${line.currentLineItemId}-unit`}>{line.currentDescription || line.priorDescription}</li>)}
                  </ul>
                </div>
              </div>
            </section>
            <section className="card p-8 sm:p-10">
              <p className="eyebrow">Pricing questions</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Most important questions</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-moss">
                {selectedComparison.report.pricingQuestions.length === 0 ? <li>No pricing questions generated.</li> : null}
                {selectedComparison.report.pricingQuestions.map((question) => (
                  <li className="rounded-[18px] border border-line/60 bg-paper p-4" key={question}>{question}</li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      ) : null}

      <form action={action} className="space-y-6">
        <section className="card p-8 sm:p-10">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Project name" name="projectName" defaultValue={project.name} />
            <Field label="City" name="city" defaultValue={project.city} />
            <Field label="State" name="state" defaultValue={project.state} />
            <Field label="Region" name="region" defaultValue={project.region} />
            <SelectField label="Project type" name="projectType" defaultValue={project.projectType} options={PROJECT_TYPES} />
            <Field label="Asset type" name="assetType" defaultValue={project.assetType} />
            <SelectField label="Renovation or new construction" name="renovationOrNew" defaultValue={project.renovationOrNew} options={RENOVATION_OPTIONS} />
            <Field label="Estimate date" name="estimateDate" type="date" />
            <Field label="Gross square feet" name="grossSquareFeet" type="number" defaultValue={numberDefault(project.grossSquareFeet)} />
            <Field label="Rentable square feet" name="rentableSquareFeet" type="number" defaultValue={numberDefault(project.rentableSquareFeet)} />
            <Field label="Unit count" name="unitCount" type="number" defaultValue={numberDefault(project.unitCount)} />
            <Field label="Building count" name="buildingCount" type="number" defaultValue={numberDefault(project.buildingCount)} />
            <Field label="Funding type" name="fundingType" defaultValue={project.fundingType} />
            <SelectField label="Occupied or vacant" name="occupiedOrVacant" defaultValue="unknown" options={OCCUPANCY_OPTIONS} />
            <SelectField label="Consent status" name="consentStatus" defaultValue={project.consentStatus} options={CONSENT_OPTIONS} />
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Budget name" name="budgetName" defaultValue={`${project.name} Budget`} />
            <Field label="Budget version" name="budgetVersion" defaultValue="Initial import" />
            <SelectField label="Source type" name="sourceType" defaultValue="budget" options={SOURCE_TYPES} />
            <Field label="Budget type" name="budgetType" defaultValue="budget" />
            <label className="block md:col-span-2">
              <span className="field-label">Budget CSV</span>
              <input className="field" name="budgetFile" type="file" accept=".csv,text/csv" required />
              <span className="mt-2 block text-xs leading-5 text-moss">
                CSV is the supported BudgetScope file type in this phase. Excel and PDF parsing can be added later without changing the saved table structure.
              </span>
            </label>
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Column mapping</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Map budget columns</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
                Leave a field blank to let BudgetScope auto-detect it. Enter the exact CSV header when your budget uses custom column names.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {COLUMN_FIELDS.map(([name, label, placeholder]) => (
              <label className="block" key={name}>
                <span className="field-label">{label}</span>
                <input className="field" name={name} placeholder={placeholder} />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <PendingSubmitButton className="button-primary" pendingLabel="Parsing and saving budget...">
            Save Budget Line Items
          </PendingSubmitButton>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <p className="eyebrow">Saved budgets</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Budget imports for this project</h2>
        </div>
        {budgets.length === 0 ? (
          <p className="p-8 text-sm text-moss">No BudgetScope imports have been saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Version</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Estimate date</th>
                  <th className="px-4 py-3 font-semibold">Imported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {budgets.map((budget) => (
                  <tr key={budget.id}>
                    <td className="px-4 py-4 font-semibold text-ink">{budget.budgetName}</td>
                    <td className="px-4 py-4 text-moss">{budget.budgetVersion || "Initial import"}</td>
                    <td className="px-4 py-4 text-moss">{budget.sourceType}</td>
                    <td className="px-4 py-4 text-moss">{[budget.city, budget.state].filter(Boolean).join(", ") || "Not set"}</td>
                    <td className="px-4 py-4 text-moss">{budget.estimateDate || "Not set"}</td>
                    <td className="px-4 py-4 text-moss">{new Date(budget.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <p className="eyebrow">Comparison history</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Saved BudgetScope reports</h2>
        </div>
        {comparisons.length === 0 ? (
          <p className="p-8 text-sm text-moss">No budget comparisons have been generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">Comparison</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comparisons.map((comparison) => (
                  <tr key={comparison.id}>
                    <td className="px-4 py-4 font-semibold text-ink">{comparison.comparisonName}</td>
                    <td className="px-4 py-4 text-moss">{comparison.comparisonType}</td>
                    <td className="px-4 py-4 text-moss">{new Date(comparison.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                      <Link className="text-sm font-semibold text-steel" href={`/app/projects/${project.id}/budgetscope?comparison=${comparison.id}`}>
                        View report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
