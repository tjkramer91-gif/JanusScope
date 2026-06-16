import { SeverityBadge } from "@/components/SeverityBadge";
import { MissingDocument } from "@/lib/types";

export function MissingDocuments({ documents }: { documents: MissingDocument[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line/60 p-8 sm:p-10">
        <h2 className="section-title">Missing information</h2>
        <p className="mt-1 text-sm text-moss">Documents that should be reviewed before signing or treated as open assumptions.</p>
      </div>
      {documents.length === 0 ? (
        <p className="p-8 text-sm text-moss">No rule-based missing documents identified.</p>
      ) : (
        <div className="divide-y divide-line">
          {documents.map((document) => (
            <div className="grid gap-3 p-6 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:p-8" key={document.document}>
              <p className="font-semibold text-ink">{document.document}</p>
              <p className="text-sm leading-6 text-moss">{document.reason}</p>
              <SeverityBadge severity={document.priority} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
