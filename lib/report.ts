import { RISK_CATEGORY_LABELS } from "@/lib/catalogs";
import { formatCurrency, severityLabel } from "@/lib/format";
import { IssueLogItem, Project, RiskReview } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildTextReport(project: Project, review: RiskReview): string {
  const lines = [
    "SUBSCOPE RISK REVIEW",
    "",
    `Project: ${project.name || "Unnamed project"}`,
    `Address: ${project.projectAddress || "Not provided"}`,
    `Trade: ${project.tradeType || "Not provided"}`,
    `GC: ${project.gcName || "Not provided"}`,
    `Owner: ${project.ownerName || "Not provided"}`,
    `Contract amount: ${formatCurrency(project.contractAmount)}`,
    `Bid date: ${project.bidDate || "Not provided"}`,
    `Execution deadline: ${project.executionDeadline || "Not provided"}`,
    `Overall risk: ${review.riskLevel} (${review.score}/100)`,
    `Final signing recommendation: ${review.finalRecommendation}`,
    "",
    "CATEGORY RATINGS",
    ...Object.entries(review.categoryRatings).map(
      ([category, rating]) => `${RISK_CATEGORY_LABELS[category as keyof typeof RISK_CATEGORY_LABELS]}: ${severityLabel(rating)}`,
    ),
    "",
    "CONTRACT VS BID COMPARISON",
    ...review.comparisons.flatMap((item, index) => [
      `${index + 1}. [${severityLabel(item.riskLevel)}] ${item.item}`,
      `   Bid position: ${item.bidPosition}`,
      `   Contract position: ${item.contractPosition}`,
      `   Conflict: ${item.conflict}`,
      `   Recommended clarification: ${item.recommendedClarification}`,
    ]),
    "",
    "HIDDEN SCOPE FLAGS",
    ...review.hiddenScopeFlags.flatMap((flag, index) => [
      `${index + 1}. [${severityLabel(flag.severity)}] ${flag.obligation}`,
      `   Language: ${flag.contractLanguage}`,
      `   Why it matters: ${flag.whyItMatters}`,
      `   Cost impact: ${flag.potentialCostImpact}`,
      `   Question to ask: ${flag.questionToAsk}`,
    ]),
    "",
    "RISK FLAGS",
    ...review.flags.flatMap((flag, index) => [
      `${index + 1}. [${severityLabel(flag.severity)}] ${flag.issue}`,
      `   Why it matters: ${flag.whyItMatters}`,
      `   Verify: ${flag.whatToVerify}`,
      `   Next action: ${flag.suggestedAction}`,
    ]),
    "",
    "MISSING DOCUMENTS",
    ...review.missingDocuments.map((document, index) => `${index + 1}. ${document.document}: ${document.reason}`),
    "",
    "QUESTIONS TO ASK BEFORE SIGNING",
    ...review.questions.map((question, index) => `${index + 1}. ${question.group}: ${question.question}`),
    "",
    "RECOMMENDED CONTRACT REVISIONS",
    ...review.recommendedRevisions.map((revision, index) => `${index + 1}. ${revision}`),
    "",
    "ASSUMPTIONS",
    ...review.assumptions.map((assumption, index) => `${index + 1}. ${assumption.statement} (${assumption.basis})`),
    "",
    "SubScope Risk Review is a pre-execution risk screen, not legal advice.",
  ];

  return lines.join("\n");
}

export function buildIssueLogCsv(issues: IssueLogItem[]): string {
  const headers = [
    "Issue ID",
    "Category",
    "Risk Level",
    "Document Source",
    "Contract Section",
    "Bid Reference",
    "Issue Description",
    "Why It Matters",
    "Recommended Clarification",
    "Suggested Revision",
    "Status",
    "Owner",
    "Date Resolved",
  ];
  const rows = issues.map((issue) => [
    issue.id,
    RISK_CATEGORY_LABELS[issue.category],
    severityLabel(issue.riskLevel),
    issue.documentSource,
    issue.contractSection,
    issue.bidReference,
    issue.issueDescription,
    issue.whyItMatters,
    issue.recommendedClarification,
    issue.suggestedRevision,
    issue.status,
    issue.owner,
    issue.dateResolved,
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function buildHtmlReport(project: Project, review: RiskReview): string {
  const renderList = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const renderRows = review.issueLog
    .map(
      (issue) => `
        <tr>
          <td>${escapeHtml(issue.id)}</td>
          <td>${escapeHtml(RISK_CATEGORY_LABELS[issue.category])}</td>
          <td>${escapeHtml(severityLabel(issue.riskLevel))}</td>
          <td>${escapeHtml(issue.issueDescription)}</td>
          <td>${escapeHtml(issue.recommendedClarification)}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(project.name || "SubScope Risk Review")}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1f2328; margin: 32px; line-height: 1.45; }
    @page { margin: 0.65in; @bottom-center { content: "Page " counter(page) " of " counter(pages); } }
    h1, h2 { margin-bottom: 8px; }
    h1 { font-size: 30px; }
    h2 { margin-top: 28px; page-break-after: avoid; }
    .score { border: 1px solid #d9dee5; padding: 16px; margin: 20px 0; }
    .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 24px; }
    .cover { min-height: 82vh; display: flex; flex-direction: column; justify-content: center; border-bottom: 4px solid #315f7d; page-break-after: always; }
    .risk { font-size: 54px; font-weight: 700; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #d9dee5; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f7f9; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <section class="cover">
    <p>Generated ${escapeHtml(new Date(review.generatedAt).toLocaleDateString("en-US"))}</p>
    <h1>SubScope Risk Review</h1>
    <p>${escapeHtml(project.name || "Unnamed project")}</p>
    <p class="risk">${review.score}/100</p>
    <p><strong>${escapeHtml(review.riskLevel)}</strong></p>
    <p>${escapeHtml(review.finalRecommendation)}</p>
  </section>
  <h1>SubScope Risk Review</h1>
  <div class="meta">
    <div><strong>Project:</strong> ${escapeHtml(project.name || "Unnamed project")}</div>
    <div><strong>Address:</strong> ${escapeHtml(project.projectAddress || "Not provided")}</div>
    <div><strong>Trade:</strong> ${escapeHtml(project.tradeType || "Not provided")}</div>
    <div><strong>GC:</strong> ${escapeHtml(project.gcName || "Not provided")}</div>
    <div><strong>Owner:</strong> ${escapeHtml(project.ownerName || "Not provided")}</div>
    <div><strong>Contract amount:</strong> ${escapeHtml(formatCurrency(project.contractAmount))}</div>
  </div>
  <div class="score">
    <h2>Executive Summary</h2>
    <p><strong>Risk score:</strong> ${review.score}/100 (${escapeHtml(review.riskLevel)})</p>
    <p><strong>Final signing recommendation:</strong> ${escapeHtml(review.finalRecommendation)}</p>
  </div>
  <h2>Biggest Issues Before Signing</h2>
  <ol>${renderList(review.flags.slice(0, 8).map((flag) => `${severityLabel(flag.severity)}: ${flag.issue} - ${flag.suggestedAction}`))}</ol>
  <h2>Contract vs Bid Comparison</h2>
  <ol>${renderList(review.comparisons.map((item) => `${item.item}: ${item.conflict} Recommended: ${item.recommendedClarification}`))}</ol>
  <h2>Hidden Scope Flags</h2>
  <ol>${renderList(review.hiddenScopeFlags.map((flag) => `${flag.obligation}: ${flag.questionToAsk}`))}</ol>
  <h2>Payment Risk</h2>
  <ol>${renderList(review.paymentTerms.map((item) => `${item.label}: ${item.value}`))}</ol>
  <h2>Change Order Risk</h2>
  <ol>${renderList(review.changeOrderTerms.map((item) => `${item.label}: ${item.value}`))}</ol>
  <h2>Schedule Risk</h2>
  <ol>${renderList(review.scheduleTerms.map((item) => `${item.label}: ${item.value}`))}</ol>
  <h2>Insurance Risk</h2>
  <ol>${renderList(review.insuranceTerms.map((item) => `${item.label}: ${item.value}`))}</ol>
  <h2>Local Requirement Checklist</h2>
  <ol>${renderList(review.localRequirements.map((item) => `${item.label}: ${item.value}`))}</ol>
  <h2>Questions to Ask Before Signing</h2>
  <ol>${renderList(review.questions.map((question) => `${question.group}: ${question.question}`))}</ol>
  <h2>Recommended Contract Revisions</h2>
  <ol>${renderList(review.recommendedRevisions)}</ol>
  <h2>Issue Log</h2>
  <table>
    <thead><tr><th>ID</th><th>Category</th><th>Risk</th><th>Description</th><th>Recommended clarification</th></tr></thead>
    <tbody>${renderRows}</tbody>
  </table>
  <p><small>SubScope Risk Review is a pre-execution risk screen, not legal advice.</small></p>
</body>
</html>`;
}

export function downloadFile(filename: string, contents: string, type: string): void {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function printHtmlReport(project: Project, review: RiskReview): void {
  const popup = window.open("", "_blank", "width=900,height=1000");
  if (!popup) return;
  popup.document.open();
  popup.document.write(buildHtmlReport(project, review));
  popup.document.close();
  popup.focus();
  popup.print();
}
