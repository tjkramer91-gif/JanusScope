import { redirect } from "next/navigation";

export default async function ProjectAliasPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/app/projects/${projectId}`);
}
