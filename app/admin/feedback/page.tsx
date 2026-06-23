import { AdminPageHeader, AdminSection, AdminTable, formatAdminDate } from "@/app/admin/_components/AdminUi";
import { requireUser } from "@/lib/server/auth";
import { listAdminFeedback } from "@/lib/server/store";

export default async function AdminFeedbackPage() {
  const user = await requireUser();
  const rows = await listAdminFeedback(user);

  return (
    <AdminSection>
      <AdminPageHeader
        title="Feedback"
        description="Recent feedback records tied to users, companies, projects, and generated outputs where available."
      />
      <AdminTable
        columns={["Type", "Rating", "Comment", "Project", "User", "Company", "Created"]}
        emptyMessage="No feedback found."
        rows={rows.map((item) => [
          item.feedbackType,
          item.rating === null ? "Not rated" : item.rating,
          item.comment || "No comment",
          item.projectId || "None",
          item.userId,
          item.companyId,
          formatAdminDate(item.createdAt),
        ])}
      />
    </AdminSection>
  );
}
