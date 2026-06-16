export function RecommendedRevisions({ revisions }: { revisions: string[] }) {
  return (
    <section className="card p-8 sm:p-10">
      <h2 className="section-title">Recommended contract revisions</h2>
      <p className="mt-1 text-sm text-moss">Plain-language edits to request before signing.</p>
      <ol className="mt-5 space-y-3">
        {revisions.map((revision, index) => (
          <li className="flex gap-3 rounded-[22px] border border-line/60 bg-paper p-5" key={revision}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-steel">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-ink">{revision}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
