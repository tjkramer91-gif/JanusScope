import { FAKE_SAMPLE_DATA_TRUST_NOTE } from "@/lib/content-safety";

const TRUST_SECTIONS = [
  ["What users can upload", "Contracts, scopes, proposals, budgets, RFIs, reports, notes, and related construction documents that they are authorized to review."],
  ["User responsibility for authorization", "Users are responsible for ensuring they have permission to upload, review, and share any project material used inside JanusScope."],
  ["How files are stored", "The current MVP keeps project files and review outputs associated to the user and project. Production storage should use private buckets and controlled retention."],
  ["How users can delete files", "Uploaded files, reports, and whole projects should remain user-controlled actions inside the product."],
  ["Training and model use", "Customer project material should not be used for training outside models unless the customer explicitly authorizes it."],
  ["Retention basics", "Retention and deletion behavior should be documented clearly before confidential production use."],
  ["Fictional sample data policy", "All JanusScope defaults, demos, templates, and examples should use fictional project names, companies, addresses, and people."],
  ["Share-Safe Mode", "Before exporting or sharing, users can scrub names, addresses, companies, project names, pricing, and contact details with placeholders."],
];

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      <div>
        <p className="eyebrow">Trust / Data Handling</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Plain-language guidance for handling project information</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          {FAKE_SAMPLE_DATA_TRUST_NOTE}
        </p>
      </div>

      <section className="card p-8 sm:p-10">
        <p className="text-sm leading-6 text-moss">
          JanusScope examples use fictional project names, companies, addresses, people, and sample data. Users are responsible for ensuring they have authorization to upload and review any project documents they use inside the platform.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {TRUST_SECTIONS.map(([title, body]) => (
          <article className="card p-6" key={title}>
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-moss">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
