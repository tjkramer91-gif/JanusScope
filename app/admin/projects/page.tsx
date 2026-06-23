import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminProjects } from "@/lib/server/store";

export default async function AdminProjectsPage() {
  const user = await requireUser();
  const rows = await listAdminProjects(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Projects"
        description="Recent projects across the platform with status and basic project metadata."
      />
      <AdminTable
        columns={["Project", "Status", "Type", "Phase", "Location", "User", "Company", "Updated"]}
        emptyMessage="No projects found."
        rows={rows.map((item) => [
          item.projectName,
          item.status,
          item.projectType || "Not set",
          item.currentPhase || "Not set",
          [item.city, item.state].filter(Boolean).join(", ") || "Not set",
          item.userId,
          item.companyId || "Not set",
          formatAdminDate(item.updatedAt),
        ])}
      />
    </AdminSection>
  );
}
