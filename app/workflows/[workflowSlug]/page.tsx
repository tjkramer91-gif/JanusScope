import { redirect } from "next/navigation";

export default async function WorkflowAliasPage({
  params,
}: {
  params: Promise<{ workflowSlug: string }>;
}) {
  const { workflowSlug } = await params;
  redirect(`/app/workflows/${workflowSlug}`);
}
