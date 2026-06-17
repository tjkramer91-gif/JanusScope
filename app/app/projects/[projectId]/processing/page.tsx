import { redirect } from "next/navigation";

export default async function ProcessingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/app/projects/${projectId}/questions`);
}
