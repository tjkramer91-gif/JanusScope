import { notFound } from "next/navigation";
import { AFFORDABLE_HOUSING_MODULES } from "@/lib/platform-content";

export function generateStaticParams() {
  return AFFORDABLE_HOUSING_MODULES.map((module) => ({ moduleSlug: module.slug }));
}

export default async function AffordableHousingModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const moduleItem = AFFORDABLE_HOUSING_MODULES.find((item) => item.slug === moduleSlug);
  if (!moduleItem) notFound();

  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div>
        <p className="eyebrow">Affordable Housing module</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{moduleItem.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">{moduleItem.description}</p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="card p-8">
          <h2 className="section-title">Inputs</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-moss">
            {moduleItem.inputs.map((item) => (
              <li className="rounded-[18px] border border-line/60 bg-paper px-4 py-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>
        <article className="card p-8">
          <h2 className="section-title">Outputs</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-moss">
            {moduleItem.outputs.map((item) => (
              <li className="rounded-[18px] border border-line/60 bg-paper px-4 py-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
