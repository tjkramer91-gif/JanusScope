import { TemplateCard } from "@/components/TemplateCard";
import { TEMPLATES } from "@/lib/platform-content";

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div>
        <p className="eyebrow">Templates</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Reusable construction templates</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Copy checklists, matrices, forms, trackers, and report structures for scope review, buyout, housing due diligence, field issues, and requirement verification.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => (
          <TemplateCard template={template} key={template.id} />
        ))}
      </div>
    </div>
  );
}
