import { redirect } from "next/navigation";

export default async function TradeRiskAliasDetailPage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade } = await params;
  redirect(`/app/trade-risks/${trade}`);
}
