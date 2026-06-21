import { redirect } from "next/navigation";

export default async function AffordableHousingAliasDetailPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  redirect(`/app/affordable-housing/${moduleSlug}`);
}
