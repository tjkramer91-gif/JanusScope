import { AskJanusWorkbench } from "@/components/AskJanusWorkbench";

export default async function AskJanusPage({
  searchParams,
}: {
  searchParams?: Promise<{ prompt?: string }>;
}) {
  const params = await searchParams;
  const initialPrompt = params?.prompt ?? "";

  return (
    <div className="mx-auto max-w-[1120px] space-y-8">
      <div>
        <p className="eyebrow">Ask Janus</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Construction-specific help, not generic chat.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
          Paste a clause, scope note, field issue, budget concern, or email task. JanusScope will organize the answer around risk, assumptions, missing information, and useful next steps.
        </p>
      </div>
      <AskJanusWorkbench initialPrompt={initialPrompt} />
    </div>
  );
}
