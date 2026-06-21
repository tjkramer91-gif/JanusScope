export function PlaybookItemCard({
  title,
  category,
  description,
}: {
  title: string;
  category: string;
  description: string;
}) {
  return (
    <article className="card p-6">
      <p className="eyebrow">{category}</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-moss">{description}</p>
    </article>
  );
}
