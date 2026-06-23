import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminUsers } from "@/lib/server/store";

export default async function AdminUsersPage() {
  const user = await requireUser();
  const rows = await listAdminUsers(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Users"
        description="Recent user records with admin flags, account type, company association, and login visibility."
      />
      <AdminTable
        columns={["Email", "Name", "Role", "Admin", "Account", "Company", "Created", "Last login"]}
        emptyMessage="No users found."
        rows={rows.map((item) => [
          item.email,
          item.name,
          item.role,
          item.isAdmin ? "Yes" : "No",
          item.accountType,
          item.companyId || "Not set",
          formatAdminDate(item.createdAt),
          formatAdminDate(item.lastLoginAt),
        ])}
      />
    </AdminSection>
  );
}
