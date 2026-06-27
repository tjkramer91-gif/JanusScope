"use client";

export function PromptFilterPanel({
  query,
  onQueryChange,
  fields,
  values,
  onValueChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  fields: { key: string; label: string; options: string[] }[];
  values: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}) {
  return (
    <section className="card p-6 sm:p-8">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <label className="xl:col-span-2">
          <span className="field-label">Search prompts</span>
          <input
            className="field"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Scope gap, owner memo, RFI, due diligence..."
          />
        </label>
        {fields.map((field) => (
          <label key={field.key}>
            <span className="field-label">{field.label}</span>
            <select className="field" value={values[field.key] ?? "All"} onChange={(event) => onValueChange(field.key, event.target.value)}>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
