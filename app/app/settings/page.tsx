export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Workspace settings</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Basic controls for beta data handling, account access, and future subscription settings.
        </p>
      </div>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Data handling note</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-moss">
          Your project documents may contain sensitive information. JanusScope is designed to help review and organize construction information. Do not upload documents you are not authorized to review. During beta, confirm storage and retention settings before using JanusScope for confidential projects.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Delete uploaded documents", "Delete project", "Export project", "User-controlled retention", "Admin data deletion", "Clear file storage paths"].map((control) => (
            <div className="rounded-[18px] border border-line/60 bg-paper p-4 text-sm font-semibold text-ink" key={control}>
              {control}
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Subscription structure</h2>
        <p className="mt-3 text-sm leading-6 text-moss">
          Billing is not connected yet. These tiers are placeholders so pricing and Stripe can be added without reshaping the product.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Free", "Limited prompt library, limited Ask Janus usage, basic templates."],
            ["Pro", "Full prompt library, guided workflows, file uploads, saved projects, report exports."],
            ["Team", "Shared projects, company templates, team workflow history, admin controls."],
            ["Consulting", "Request a custom review or workflow setup."],
          ].map(([tier, body]) => (
            <div className="rounded-[20px] border border-line/60 bg-paper p-5" key={tier}>
              <p className="font-semibold text-ink">{tier}</p>
              <p className="mt-2 text-sm leading-6 text-moss">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
