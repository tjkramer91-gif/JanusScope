import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminCompanies } from "@/lib/server/store";

export default async function AdminCompaniesPage() {
  const user = await requireUser();
  const rows = await listAdminCompanies(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Companies"
        description="Basic company records used for account grouping, lead visibility, and future admin review workflows."
      />
      <AdminTable
        columns={["Company", "Type", "Trade", "City", "State", "Lead status", "Created"]}
        emptyMessage="No companies found."
        rows={rows.map((item) => [
          item.companyName,
          item.companyType,
          item.trade || "Not set",
          item.city || "Not set",
          item.state || "Not set",
          item.leadStatus,
          formatAdminDate(item.createdAt),
        ])}
      />
    </AdminSection>
  );
}
