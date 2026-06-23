import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminLeads } from "@/lib/server/store";

export default async function AdminLeadsPage() {
  const user = await requireUser();
  const leads = await listAdminLeads(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Lead intelligence"
        description="Admin-only view of high-intent users and companies based on JanusScope usage, uploads, BudgetScope activity, reports, exports, and feedback."
      />
      <AdminTable
        columns={[
          "User",
          "Email",
          "Company",
          "Type",
          "Trade",
          "State / Region",
          "Score",
          "Status",
          "Reason",
          "Actions",
          "Last activity",
          "Projects",
          "Uploads",
          "Budget comparisons",
          "Reports",
          "PDFs",
          "Feedback",
        ]}
        emptyMessage="No lead scores recorded yet."
        rows={leads.map((lead) => [
          lead.userName,
          lead.email,
          lead.companyName,
          lead.companyType,
          lead.trade || "N/A",
          [lead.state, lead.region].filter(Boolean).join(" / ") || "N/A",
          lead.leadScore.toLocaleString(),
          lead.leadStatus,
          lead.leadReason,
          lead.highIntentActions.length > 0 ? lead.highIntentActions.join("; ") : "No high-intent actions yet",
          formatAdminDate(lead.lastActivityAt),
          lead.projectsCount.toLocaleString(),
          lead.documentsUploaded.toLocaleString(),
          lead.budgetComparisonsCount.toLocaleString(),
          lead.reportsGeneratedCount.toLocaleString(),
          lead.pdfsDownloadedCount.toLocaleString(),
          lead.feedbackCount.toLocaleString(),
        ])}
      />
    </AdminSection>
  );
}
