import { AdminPageHeader, AdminSection } from "@/app/admin/_components/AdminUi";

export default function AdminSettingsPage() {
  return (
    <AdminSection>
      <AdminPageHeader
        title="Admin settings"
        description="Placeholder for future admin configuration. Phase 2 only establishes the protected route foundation."
      />
      <div className="rounded-[18px] border border-line/70 bg-white p-6 text-sm leading-6 text-moss shadow-sm">
        Advanced settings are intentionally not built in this phase. Add configuration controls only after the admin data model and approval workflow are stable.
      </div>
    </AdminSection>
  );
}
