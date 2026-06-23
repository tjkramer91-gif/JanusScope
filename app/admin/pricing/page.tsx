import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { listAdminPricingBenchmarks, type AdminPricingFilters } from "@/lib/server/store";

function stringParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function filtersFromSearch(searchParams: Record<string, string | string[] | undefined>): AdminPricingFilters {
  return {
    trade: stringParam(searchParams.trade),
    scopeCategory: stringParam(searchParams.scopeCategory),
    scopeSubcategory: stringParam(searchParams.scopeSubcategory),
    city: stringParam(searchParams.city),
    state: stringParam(searchParams.state),
    region: stringParam(searchParams.region),
    projectType: stringParam(searchParams.projectType),
    assetType: stringParam(searchParams.assetType),
    renovationOrNew: stringParam(searchParams.renovationOrNew),
    fundingType: stringParam(searchParams.fundingType),
    estimateDateFrom: stringParam(searchParams.estimateDateFrom),
    estimateDateTo: stringParam(searchParams.estimateDateTo),
    unitOfMeasure: stringParam(searchParams.unitOfMeasure),
    reviewStatus: (stringParam(searchParams.reviewStatus) || "approved") as AdminPricingFilters["reviewStatus"],
    consentStatus: (stringParam(searchParams.consentStatus) || "granted") as AdminPricingFilters["consentStatus"],
  };
}

function money(value: number | null): string {
  return value === null ? "N/A" : formatCurrency(value);
}

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const filters = filtersFromSearch(params);
  const rows = await listAdminPricingBenchmarks(user, filters);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Pricing benchmarks"
        description="Admin-only aggregate view of approved, consented BudgetScope pricing records. Source project and company identifiers are intentionally hidden in this view."
      />

      <form className="grid gap-4 rounded-[18px] border border-line/70 bg-white p-5 shadow-sm md:grid-cols-4">
        {[
          ["trade", "Trade"],
          ["scopeCategory", "Scope category"],
          ["scopeSubcategory", "Scope subcategory"],
          ["city", "City"],
          ["state", "State"],
          ["region", "Region"],
          ["projectType", "Project type"],
          ["assetType", "Asset type"],
          ["renovationOrNew", "Renovation/new"],
          ["fundingType", "Funding type"],
          ["unitOfMeasure", "Unit"],
        ].map(([name, label]) => (
          <label className="block" key={name}>
            <span className="field-label">{label}</span>
            <input className="field" name={name} defaultValue={stringParam(params[name])} />
          </label>
        ))}
        <label className="block">
          <span className="field-label">Estimate date from</span>
          <input className="field" name="estimateDateFrom" type="date" defaultValue={filters.estimateDateFrom ?? ""} />
        </label>
        <label className="block">
          <span className="field-label">Estimate date to</span>
          <input className="field" name="estimateDateTo" type="date" defaultValue={filters.estimateDateTo ?? ""} />
        </label>
        <label className="block">
          <span className="field-label">Review status</span>
          <select className="field" name="reviewStatus" defaultValue={filters.reviewStatus ?? "approved"}>
            <option value="approved">Approved</option>
            <option value="pending_review">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="excluded_from_learning">Excluded</option>
          </select>
        </label>
        <label className="block">
          <span className="field-label">Consent status</span>
          <select className="field" name="consentStatus" defaultValue={filters.consentStatus ?? "granted"}>
            <option value="granted">Granted</option>
            <option value="not-requested">Not requested</option>
            <option value="declined">Declined</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
        <div className="md:col-span-4 flex justify-end">
          <button className="button-secondary" type="submit">Apply Filters</button>
        </div>
      </form>

      <AdminTable
        columns={["Trade", "Category", "Subcategory", "Unit", "Low", "Average", "Median", "High", "Records", "Confidence", "Source", "Last updated"]}
        emptyMessage="No approved benchmark records match these filters."
        rows={rows.map((item) => [
          item.trade,
          item.scopeCategory || "N/A",
          item.scopeSubcategory || "N/A",
          item.unitOfMeasure || "N/A",
          money(item.lowUnitCost),
          money(item.averageUnitCost),
          money(item.medianUnitCost),
          money(item.highUnitCost),
          item.recordCount.toLocaleString(),
          item.confidenceLevel,
          item.sourceType,
          formatAdminDate(item.lastUpdatedAt),
        ])}
      />
    </AdminSection>
  );
}
