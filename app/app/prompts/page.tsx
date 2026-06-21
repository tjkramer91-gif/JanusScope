import { PromptLibrary } from "@/components/PromptLibrary";
import { PROMPTS } from "@/lib/platform-content";

export default function PromptsPage() {
  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div>
        <p className="eyebrow">Prompt Library</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Role-based prompts that fit the construction task.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Filter by role, task, project phase, trade, risk type, output type, and experience level. Prompts are written to separate facts from assumptions and prioritize the biggest miss first.
        </p>
      </div>
      <PromptLibrary prompts={PROMPTS} />
    </div>
  );
}
