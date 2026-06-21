import { CopyButton } from "@/components/CopyButton";
import type { TemplateDefinition } from "@/lib/platform-content";

function templateText(template: TemplateDefinition): string {
  return [
    template.title,
    "",
    template.description,
    "",
    "Sections:",
    ...template.sections.map((section) => `- ${section}`),
  ].join("\n");
}

export function TemplateCard({ template }: { template: TemplateDefinition }) {
  const value = templateText(template);

  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{template.category}</p>
          <h2 className="mt-3 text-xl font-semibold text-ink">{template.title}</h2>
        </div>
        <span className="rounded-full border border-line/60 bg-paper px-3 py-1 text-xs font-semibold text-moss">
          {template.type}
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-6 text-moss">{template.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[template.role, template.trade].map((item) => (
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-moss" key={item}>
            {item}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-2">
        {template.sections.slice(0, 5).map((section) => (
          <div className="rounded-[16px] border border-line/60 bg-paper px-4 py-2 text-sm font-semibold text-ink" key={section}>
            {section}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <CopyButton value={value} label="Copy Template" />
      </div>
    </article>
  );
}
