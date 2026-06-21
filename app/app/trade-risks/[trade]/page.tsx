import { notFound } from "next/navigation";
import { TradeRiskPanel } from "@/components/TradeRiskPanel";
import { getTradeRisk, TRADE_RISKS } from "@/lib/platform-content";

export function generateStaticParams() {
  return TRADE_RISKS.map((trade) => ({ trade: trade.slug }));
}

export default async function TradeRiskDetailPage({
  params,
}: {
  params: Promise<{ trade: string }>;
}) {
  const { trade } = await params;
  const tradeRisk = getTradeRisk(trade);
  if (!tradeRisk) notFound();

  return <TradeRiskPanel trade={tradeRisk} />;
}
