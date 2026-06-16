import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProjectAction, deleteReportsAction } from "@/app/app/actions";
import { ContractComparisonTable } from "@/components/ContractComparisonTable";
import { ExclusionCheckTable } from "@/components/ExclusionCheckTable";
import { HiddenScopeTable } from "@/components/HiddenScopeTable";
import { IssueLogTable } from "@/components/IssueLogTable";
import { MissingDocuments } from "@/components/MissingDocuments";
import { RecommendedRevisions } from "@/components/RecommendedRevisions";
import { ReportNotesGrid } from "@/components/ReportNotesGrid";
import { RiskSummary } from "@/components/RiskSummary";
import { SeverityBadge } from "@/components/SeverityBadge";
import { generateRiskReview } from "@/lib/risk-engine";
import { addAudit, getLatestReview, getProject } from "@/lib/server/store";
import { requireUser } from "@/lib/server/auth";

export default async function ReportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  const review = generateRiskReview(project);
  await getLatestReview(user, project.id);
  await addAudit(user, project.id, "report.viewed", {});
  const deleteReports = deleteReportsAction.bind(null, project.id);
  const deleteProject = deleteProjectAction.bind(null, project.id);

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="eyebrow">Risk report</p>
            <SeverityBadge severity={review.overallRating} />
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{project.name}</h1>
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
            <h2 className="section-title">Download center</h2>
            <p className="mt-1 text-sm leading-6 text-moss">
              Downloads are generated from the current web report. Production storage should use signed URLs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="button-primary" href={`/auth/login?mfa=1&returnTo=/app/projects/${project.id}/report/pdf`}>
              Download PDF Risk Report
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
      <IssueLogTable issues={review.issueLog} />
    </div>
  );
}
