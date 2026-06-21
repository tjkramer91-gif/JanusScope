import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProjectAction, deleteReportsAction } from "@/app/app/actions";
import { ContractComparisonTable } from "@/components/ContractComparisonTable";
import { ExclusionCheckTable } from "@/components/ExclusionCheckTable";
import { HiddenScopeTable } from "@/components/HiddenScopeTable";
import { IssueLogTable } from "@/components/IssueLogTable";
import { MissingDocuments } from "@/components/MissingDocuments";
import { PriorityRiskOutput } from "@/components/PriorityRiskOutput";
import { ProjectIntelligenceGraph } from "@/components/ProjectIntelligenceGraph";
import { RecommendedRevisions } from "@/components/RecommendedRevisions";
import { ReportNotesGrid } from "@/components/ReportNotesGrid";
import { RiskSummary } from "@/components/RiskSummary";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SourceVerificationReport } from "@/components/SourceVerificationReport";
import { buildProjectIntelligenceGraph } from "@/lib/intelligence-graph";
import { buildPrioritizedReport } from "@/lib/prioritized-report";
import { generateRiskReview } from "@/lib/risk-engine";
import { addAudit, getProject, listIntelligenceGraphs } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";
import { buildSourceVerification } from "@/lib/source-verification";
import { RISK_OUTPUT_AREAS } from "@/lib/subscope-content";
import { detectTradeScope } from "@/lib/trade-detector";
import { buildTradeSpecificReview } from "@/lib/trade-review";

export default async function ReportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  const review = generateRiskReview(project);
  const sourceVerification = buildSourceVerification(project);
  const detectedTrade = detectTradeScope(project);
  const tradeFindings = buildTradeSpecificReview(project, detectedTrade);
  const priorityReport = buildPrioritizedReport({ review, sourceVerification, detectedTrade, tradeFindings });
  const intelligenceHistory = await listIntelligenceGraphs(user, { excludeProjectId: project.id });
  const intelligenceGraph = buildProjectIntelligenceGraph(project, review, intelligenceHistory);
  await addAudit(user, project.id, "report.viewed", {});
  const deleteReports = deleteReportsAction.bind(null, project.id);
  const deleteProject = deleteProjectAction.bind(null, project.id);

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="eyebrow">Step 4</p>
            <SeverityBadge severity={review.overallRating} />
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-ink">JanusScope risk output</h1>
          <p className="mt-2 text-sm text-moss">
            Generated {new Date(review.generatedAt).toLocaleString()} · {review.issueLog.length} open issue log items
          </p>
        </div>
        <Link className="button-secondary" href={`/auth/login?mfa=1&returnTo=/app/projects/${project.id}/report`}>
          MFA before report
        </Link>
      </div>

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
          <h2 className="section-title">Report actions</h2>
          <p className="mt-1 text-sm leading-6 text-moss">
              Export and delete controls are part of the product direction. The PDF action is a placeholder-style export for the current web report.
          </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="button-primary" href={`/auth/login?mfa=1&returnTo=/app/projects/${project.id}/report/pdf`}>
              Export to PDF Placeholder
            </Link>
            <Link className="button-secondary" href={`/auth/login?mfa=1&returnTo=/app/projects/${project.id}/report/csv`}>
              Download CSV Issue Log
            </Link>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line/60 pt-6">
          <form action={deleteReports}>
            <button className="button-secondary" type="submit">Delete generated reports</button>
          </form>
          <form action={deleteProject}>
            <button className="inline-flex items-center justify-center rounded-full border border-[#efc0bc] bg-white px-5 py-3 text-sm font-semibold text-brick shadow-sm hover:-translate-y-0.5 hover:shadow-card" type="submit">
              Delete full project
            </button>
          </form>
        </div>
      </section>

      <RiskSummary project={project} review={review} />
      <PriorityRiskOutput report={priorityReport} />

      <details className="border-t border-line/70 pt-6">
        <summary className="cursor-pointer rounded-[18px] border border-line/60 bg-paper px-5 py-4 text-lg font-semibold text-ink">
          Expand for full detail, source audit, and export tables
        </summary>
        <div className="mt-8 space-y-8">
      <SourceVerificationReport report={sourceVerification} />
      <ProjectIntelligenceGraph graph={intelligenceGraph} />

      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Risk output includes</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Report-style review for pre-signing questions</h2>
          </div>
          <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
            Not legal advice
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {RISK_OUTPUT_AREAS.map((area) => (
            <div className="rounded-[20px] border border-line/60 bg-paper p-4 text-sm font-semibold text-ink" key={area}>
              {area}
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Top 10 issues before signing</h2>
          <p className="mt-1 text-sm text-moss">The highest-signal items to clean up with the GC before execution.</p>
        </div>
        <div className="divide-y divide-line">
          {review.issueLog.slice(0, 10).map((issue) => (
            <article className="grid gap-4 p-6 md:grid-cols-[180px_1fr_1fr]" key={issue.id}>
              <div>
                <SeverityBadge severity={issue.riskLevel} />
                <p className="mt-3 text-xs font-semibold uppercase text-moss">{issue.category}</p>
              </div>
              <div>
                <h3 className="font-semibold text-ink">{issue.issueTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-moss">{issue.whyItMatters}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-moss">Recommended action</p>
                <p className="mt-1 text-sm leading-6 text-steel">{issue.recommendedClarification}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContractComparisonTable comparisons={review.comparisons} />
      <HiddenScopeTable flags={review.hiddenScopeFlags} />
      <ExclusionCheckTable checks={review.exclusionChecks} />
      <ReportNotesGrid title="Payment terms review" description="Pay-if-paid, pay-when-paid, retainage, lien waivers, stored materials, withholding, backcharges, and setoff." notes={review.paymentTerms} />
      <ReportNotesGrid title="Change order and notice review" description="Written authorization, notice deadlines, waiver language, verbal directives, and pricing documentation." notes={review.changeOrderTerms} />
      <ReportNotesGrid title="Schedule and delay review" description="Milestones, LDs, acceleration, premium time, no damages for delay, manpower, coordination, and resequencing." notes={review.scheduleTerms} />
      <ReportNotesGrid title="Insurance, indemnity, and bonding review" description="Additional insured, primary and noncontributory, waiver of subrogation, broad indemnity, duty to defend, bonding, and safety." notes={review.insuranceTerms} />
      <ReportNotesGrid title="Local requirements scan" description="Verification checklist for licensing, permits, inspections, fire marshal, utilities, right-of-way, wage, tax, environmental, occupied-building, and AHJ items." notes={review.localRequirements} />
      <MissingDocuments documents={review.missingDocuments} />
      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Questions to send GC before signing</h2>
        <ol className="mt-5 space-y-3">
          {review.questions.map((question, index) => (
            <li className="flex gap-3 rounded-[22px] border border-line/60 bg-paper p-5" key={question.id}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-steel">{index + 1}</span>
              <p className="text-sm leading-6 text-ink">{question.question}</p>
            </li>
          ))}
        </ol>
      </section>
      <RecommendedRevisions revisions={review.recommendedRevisions} />
      <section className="card p-8 sm:p-10">
        <h2 className="section-title">Suggested qualifications and exclusions</h2>
        <p className="mt-2 text-sm leading-6 text-moss">
          Use these as drafting prompts for your proposal qualifications or GC clarification log. Have counsel review contract language before signing.
        </p>
        <div className="mt-5 grid gap-3">
          {review.recommendedRevisions.slice(0, 5).map((revision) => (
            <div className="rounded-[22px] border border-line/60 bg-paper p-5 text-sm leading-6 text-ink" key={revision}>
              {revision}
            </div>
          ))}
        </div>
      </section>
      <IssueLogTable issues={review.issueLog} />
        </div>
      </details>
    </div>
  );
}
