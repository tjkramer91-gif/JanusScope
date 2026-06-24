import { AdminPageHeader, AdminSection, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminDataReviewQueue, type AdminDataReviewFilters } from "@/lib/server/store";
import { updateDataReviewItemAction } from "./actions";

function stringParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function filtersFromSearch(searchParams: Record<string, string | string[] | undefined>): AdminDataReviewFilters {
  const minConfidence = Number(stringParam(searchParams.minConfidence));
  return {
    sourceType: stringParam(searchParams.sourceType),
    trade: stringParam(searchParams.trade),
    projectId: stringParam(searchParams.projectId),
    minConfidence: Number.isFinite(minConfidence) ? minConfidence : null,
    reviewStatus: (stringParam(searchParams.reviewStatus) || "pending_review") as AdminDataReviewFilters["reviewStatus"],
  };
}

export default async function AdminDataReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const filters = filtersFromSearch(params);
  const rows = await listAdminDataReviewQueue(user, filters);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Data review queue"
        description="Review extracted budget, scope, and risk records before they become eligible for consented internal comparison use."
      />

      <form className="grid gap-4 rounded-[18px] border border-line/70 bg-white p-5 shadow-sm md:grid-cols-5">
        <label className="block">
          <span className="field-label">Source type</span>
          <input className="field" name="sourceType" defaultValue={filters.sourceType ?? ""} placeholder="pricing" />
        </label>
        <label className="block">
          <span className="field-label">Trade</span>
          <input className="field" name="trade" defaultValue={filters.trade ?? ""} placeholder="Electrical" />
        </label>
        <label className="block">
          <span className="field-label">Project ID</span>
          <input className="field" name="projectId" defaultValue={filters.projectId ?? ""} />
        </label>
        <label className="block">
          <span className="field-label">Min confidence</span>
          <input className="field" name="minConfidence" type="number" step="0.01" min="0" max="1" defaultValue={filters.minConfidence ?? ""} />
        </label>
        <label className="block">
          <span className="field-label">Status</span>
          <select className="field" name="reviewStatus" defaultValue={filters.reviewStatus ?? "pending_review"}>
            <option value="pending_review">Pending</option>
            <option value="raw">Raw</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="excluded_from_learning">Excluded</option>
            <option value="all">All</option>
          </select>
        </label>
        <div className="md:col-span-5 flex justify-end">
          <button className="button-secondary" type="submit">Apply Filters</button>
        </div>
      </form>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-[18px] border border-line/70 bg-white p-8 text-center text-sm text-moss shadow-sm">
            No data review items match these filters.
          </div>
        ) : null}
        {rows.map((item) => (
          <form action={updateDataReviewItemAction} className="rounded-[18px] border border-line/70 bg-white p-5 shadow-sm" key={item.id}>
            <input type="hidden" name="id" value={item.id} />
            <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss">{item.reviewStatus}</span>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss">{item.sourceType}</span>
                  <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss">{item.sourceTable}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-ink">{item.extractedValueSummary || "No summary"}</p>
                <dl className="mt-3 grid gap-2 text-xs text-moss sm:grid-cols-2">
                  <div><dt className="font-semibold text-ink">Confidence</dt><dd>{item.confidenceScore === null ? "Not set" : `${Math.round(item.confidenceScore * 100)}%`}</dd></div>
                  <div><dt className="font-semibold text-ink">Project</dt><dd>{item.projectId ?? "None"}</dd></div>
                  <div><dt className="font-semibold text-ink">Created</dt><dd>{formatAdminDate(item.createdAt)}</dd></div>
                  <div><dt className="font-semibold text-ink">Reviewed</dt><dd>{formatAdminDate(item.reviewedAt)}</dd></div>
                </dl>
              </div>
              <div className="grid gap-3">
                <label className="block">
                  <span className="field-label">Normalized trade</span>
                  <input className="field" name="normalizedTrade" defaultValue={item.normalizedTrade} />
                </label>
                <label className="block">
                  <span className="field-label">Scope category</span>
                  <input className="field" name="normalizedScopeCategory" defaultValue={item.normalizedScopeCategory} />
                </label>
                <label className="block">
                  <span className="field-label">Scope subcategory</span>
                  <input className="field" name="normalizedScopeSubcategory" defaultValue={item.normalizedScopeSubcategory} />
                </label>
              </div>
              <div className="grid gap-3">
                <label className="block">
                  <span className="field-label">Admin notes</span>
                  <textarea className="field min-h-28" name="adminNotes" defaultValue={item.adminNotes} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="button-secondary" name="reviewAction" value="save" type="submit">Save Edits</button>
                  <button className="button-primary" name="reviewAction" value="approve" type="submit">Approve</button>
                  <button className="button-secondary" name="reviewAction" value="reject" type="submit">Reject</button>
                  <button className="rounded-full border border-line/70 px-4 py-2 text-sm font-semibold text-brick" name="reviewAction" value="exclude" type="submit">
                    Exclude
                  </button>
                </div>
              </div>
            </div>
          </form>
        ))}
      </div>
    </AdminSection>
  );
}
