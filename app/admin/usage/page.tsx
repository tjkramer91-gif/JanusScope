import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate, formatCompactJson } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminUsageEvents } from "@/lib/server/store";

export default async function AdminUsagePage() {
  const user = await requireUser();
  const rows = await listAdminUsageEvents(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Usage events"
        description="Recent usage events. Metadata is scrubbed before storage and should not contain raw document text."
      />
      <AdminTable
        columns={["Event", "Project", "User", "Company", "Metadata", "Created"]}
        emptyMessage="No usage events found."
        rows={rows.map((item) => [
          item.eventType,
          item.projectId || "None",
          item.userId,
          item.companyId,
          formatCompactJson(item.eventMetadata),
          formatAdminDate(item.createdAt),
        ])}
      />
    </AdminSection>
  );
}
