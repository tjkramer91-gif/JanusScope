import { SeverityBadge } from "@/components/SeverityBadge";
import { ReportNote } from "@/lib/types";

export function ReportNotesGrid({ title, description, notes }: { title: string; description: string; notes: ReportNote[] }) {
  return (
    <section className="card p-8 sm:p-10">
      <div className="mb-5">
        <h2 className="section-title">{title}</h2>
        <p className="mt-1 text-sm text-moss">{description}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {notes.map((note) => (
          <div className="rounded-[22px] border border-line/60 bg-white p-5 shadow-sm" key={note.label}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-ink">{note.label}</p>
              <SeverityBadge severity={note.risk} />
            </div>
            <p className="mt-3 text-sm leading-6 text-moss">{note.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
