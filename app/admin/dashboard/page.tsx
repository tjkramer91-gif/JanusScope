import { AdminPageHeader, AdminTable, MetricCard } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { getAdminDashboardAnalytics, getAdminDashboardMetrics } from "@/lib/server/store";

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const [metrics, analytics] = await Promise.all([
    getAdminDashboardMetrics(user),
    getAdminDashboardAnalytics(user),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin dashboard"
        description="Basic operational counts for users, companies, projects, uploaded documents, usage events, feedback, and data review queue activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total users" value={metrics.totalUsers} />
        <MetricCard label="Active users" value={metrics.activeUsers} note="Users with a recorded login timestamp." />
        <MetricCard label="New users this week" value={metrics.newUsersThisWeek} />
        <MetricCard label="Companies added" value={metrics.companiesAdded} />
        <MetricCard label="Projects created" value={metrics.projectsCreated} />
        <MetricCard label="Documents uploaded" value={metrics.documentsUploaded} />
        <MetricCard label="Reports generated" value={metrics.reportsGenerated} />
        <MetricCard label="Usage events" value={metrics.usageEventsCount} />
        <MetricCard label="Feedback" value={metrics.feedbackCount} />
        <MetricCard label="Review pending" value={metrics.dataReviewPending} />
        <MetricCard label="Review approved" value={metrics.dataReviewApproved} />
        <MetricCard label="Review rejected" value={metrics.dataReviewRejected} />
        <MetricCard label="High-intent leads" value={metrics.highIntentLeads} />
        <MetricCard label="Budget comparisons" value={metrics.budgetComparisonsGenerated} />
        <MetricCard label="Pricing pending review" value={metrics.pricingRecordsPendingReview} />
        <MetricCard label="Approved benchmarks" value={metrics.approvedBenchmarkRecords} />
        <MetricCard label="User growth" value={analytics.userGrowthThisWeek} note="New users this week." />
        <MetricCard label="Project growth" value={analytics.projectGrowthThisWeek} note="New projects this week." />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminTable
          columns={["Company", "Events"]}
          emptyMessage="No company usage yet."
          rows={analytics.mostActiveCompanies.map((item) => [item.label, item.value.toLocaleString()])}
        />
        <AdminTable
          columns={["User", "Events"]}
          emptyMessage="No user usage yet."
          rows={analytics.mostActiveUsers.map((item) => [item.label, item.value.toLocaleString()])}
        />
        <AdminTable
          columns={["Module", "Events"]}
          emptyMessage="No module usage yet."
          rows={analytics.mostUsedModules.map((item) => [item.label, item.value.toLocaleString()])}
        />
        <AdminTable
          columns={["Trade", "Count"]}
          emptyMessage="No trade data yet."
          rows={analytics.mostCommonTrades.map((item) => [item.label, item.value.toLocaleString()])}
        />
        <AdminTable
          columns={["Project state", "Count"]}
          emptyMessage="No project state data yet."
          rows={analytics.mostCommonProjectStates.map((item) => [item.label, item.value.toLocaleString()])}
        />
        <AdminTable
          columns={["Risk category", "Count"]}
          emptyMessage="No risk category data yet."
          rows={analytics.mostCommonRiskCategories.map((item) => [item.label, item.value.toLocaleString()])}
        />
      </div>
    </div>
  );
}
