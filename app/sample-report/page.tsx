import Link from "next/link";
import { ContractComparisonTable } from "@/components/ContractComparisonTable";
import { HiddenScopeTable } from "@/components/HiddenScopeTable";
import { RecommendedRevisions } from "@/components/RecommendedRevisions";
import { RiskSummary } from "@/components/RiskSummary";
import { createDemoProject } from "@/lib/demo-project";
import { generateRiskReview } from "@/lib/risk-engine";

export default function SampleReportPage() {
  const project = createDemoProject();
  const review = generateRiskReview(project);

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line/45 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4">
          <Link href="/" className="font-bold text-ink">SubScope Risk Review</Link>
          <Link href="/auth/login?returnTo=/app/projects/new" className="button-primary">Start Contract Review</Link>
        </div>
      </header>
      <div className="mx-auto max-w-[1220px] space-y-8 px-5 py-10">
        <div>
          <p className="eyebrow">Sample report</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Demo subcontract risk report</h1>
        </div>
        <RiskSummary project={project} review={review} />
        <ContractComparisonTable comparisons={review.comparisons} />
        <HiddenScopeTable flags={review.hiddenScopeFlags} />
        <RecommendedRevisions revisions={review.recommendedRevisions} />
      </div>
    </main>
  );
}
