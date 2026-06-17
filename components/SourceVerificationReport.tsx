import type {
  DocumentComparisonMatrixRow,
  EvidenceConfidence,
  SourceRiskLevel,
  SourceVerificationReport as SourceVerificationReportData,
} from "@/lib/source-verification";

function toneClass(value: SourceRiskLevel | EvidenceConfidence): string {
  if (value === "High") return "border-[#efc0bc] bg-[#fff0ee] text-[#9f241a]";
  if (value === "Medium") return "border-[#e8d7a6] bg-[#fff8e6] text-[#7a5700]";
  return "border-line/70 bg-paper text-moss";
}

function compactDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function statusClass(status: DocumentComparisonMatrixRow["status"]): string {
  if (status === "Conflict found") return "border-[#efc0bc] bg-[#fff0ee] text-[#9f241a]";
  if (status === "Aligned") return "border-[#c7dfcf] bg-[#f1fbf4] text-[#24633a]";
  return "border-line/70 bg-paper text-moss";
}

function Pill({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${className}`}>{children}</span>;
}

export function SourceVerificationReport({ report }: { report: SourceVerificationReportData }) {
  return (
    <section className="space-y-6">
      <section className="card p-8 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Source verification</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Verification summary</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-moss">{report.summary.conclusion}</p>
          </div>
          <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
            Generated {compactDate(report.generatedAt)}
          </span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Documents reviewed", report.summary.documentsReviewed],
            ["Unable to extract", report.summary.documentsUnableToExtract],
            ["Findings", report.summary.sourceBackedFindings],
            ["Comparisons", report.summary.comparisonsRun],
            ["External sources", report.summary.externalSourcesChecked],
            ["Unable to verify", report.summary.missingVerificationItems],
          ].map(([label, value]) => (
            <div className="rounded-[18px] border border-line/60 bg-paper p-4" key={label}>
              <p className="text-xs font-semibold uppercase text-moss">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Uploaded Documents Reviewed</h2>
          <p className="mt-1 text-sm text-moss">Every uploaded file is listed, including files that were not readable as source evidence.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left text-sm">
            <thead className="bg-paper/70 text-xs uppercase text-moss">
              <tr>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Extraction</th>
                <th className="px-4 py-3 font-semibold">Reviewed</th>
                <th className="px-4 py-3 font-semibold">Included</th>
                <th className="px-4 py-3 font-semibold">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.documentAudit.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-moss" colSpan={6}>No documents have been uploaded for review.</td>
                </tr>
              ) : (
                report.documentAudit.map((document) => (
                  <tr key={document.fileName}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink">{document.fileName}</p>
                      <p className="text-xs text-moss">{document.fileType}</p>
                    </td>
                    <td className="px-4 py-4 text-moss">{document.category}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold capitalize text-ink">{document.extractionStatus}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-moss">{document.extractionMessage}</p>
                    </td>
                    <td className="px-4 py-4 text-moss">{document.reviewedScope}</td>
                    <td className="px-4 py-4 text-moss">{document.includedInFinalReview ? "Yes" : "No"}</td>
                    <td className="px-4 py-4 text-moss">{compactDate(document.uploadDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Source-Backed Findings</h2>
          <p className="mt-1 text-sm text-moss">Each finding cites the source document, row, extracted value, confidence, and next action.</p>
        </div>
        <div className="divide-y divide-line">
          {report.findings.length === 0 ? (
            <p className="p-8 text-sm text-moss">No source-backed findings were produced from extracted uploads.</p>
          ) : (
            report.findings.map((finding) => (
              <article className="grid gap-5 p-6 lg:grid-cols-[220px_1fr]" key={finding.id}>
                <div className="space-y-3">
                  <Pill className={toneClass(finding.risk)}>{finding.risk} risk</Pill>
                  <Pill className={toneClass(finding.confidence)}>{finding.confidence} confidence</Pill>
                  <p className="text-xs font-semibold uppercase text-moss">{finding.category}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{finding.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-moss">{finding.explanation}</p>
                  <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Source document</dt>
                      <dd className="mt-1 text-ink">{finding.sourceDocument}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Source location</dt>
                      <dd className="mt-1 text-ink break-words">{finding.sourceLocation}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-xs font-semibold uppercase text-moss">Extracted text or value</dt>
                      <dd className="mt-1 whitespace-pre-wrap rounded-[18px] border border-line/60 bg-paper p-4 text-ink">{finding.extractedText}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Impact</dt>
                      <dd className="mt-1 text-ink">{finding.costOrScheduleImpact}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Action</dt>
                      <dd className="mt-1 text-ink">{finding.recommendedAction}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Confidence reason</dt>
                      <dd className="mt-1 text-ink">{finding.confidenceReason}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-moss">Follow-up question</dt>
                      <dd className="mt-1 text-ink">{finding.followUpQuestion}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Document Comparison Matrix</h2>
          <p className="mt-1 text-sm text-moss">Budget, bid, scope, and contract positions are compared only when readable evidence exists.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left text-sm">
            <thead className="bg-paper/70 text-xs uppercase text-moss">
              <tr>
                <th className="px-4 py-3 font-semibold">Comparison</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Sources</th>
                <th className="px-4 py-3 font-semibold">Finding</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {report.comparisonMatrix.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 font-semibold text-ink">{row.comparison}</td>
                  <td className="px-4 py-4"><Pill className={statusClass(row.status)}>{row.status}</Pill></td>
                  <td className="px-4 py-4 text-moss">
                    <p>{row.leftSource}</p>
                    <p className="mt-1">{row.rightSource}</p>
                  </td>
                  <td className="px-4 py-4 text-ink">{row.finding}</td>
                  <td className="px-4 py-4"><Pill className={toneClass(row.confidence)}>{row.confidence}</Pill></td>
                  <td className="px-4 py-4 text-moss">{row.requiredAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="border-b border-line/60 p-8 sm:p-10">
            <h2 className="section-title">External Sources Checked</h2>
            <p className="mt-1 text-sm text-moss">Official AHJ sources are prioritized when the project location is recognized.</p>
          </div>
          <div className="divide-y divide-line">
            {report.externalSourcesChecked.length === 0 ? (
              <p className="p-8 text-sm text-moss">No external source was claimed for this project location.</p>
            ) : (
              report.externalSourcesChecked.map((source) => (
                <article className="p-6" key={source.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink">{source.sourceTitle}</h3>
                    <Pill className={toneClass(source.confidence)}>{source.confidence}</Pill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-moss">{source.factChecked}</p>
                  <p className="mt-3 text-xs font-semibold uppercase text-moss">{source.publisher} · {source.sourceType} · accessed {source.dateAccessed}</p>
                  <a className="mt-3 inline-flex text-sm font-semibold text-steel underline" href={source.url} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-line/60 p-8 sm:p-10">
            <h2 className="section-title">Contract Requirement Review</h2>
            <p className="mt-1 text-sm text-moss">Contract requirements are shown with the exact uploaded row that triggered them.</p>
          </div>
          <div className="divide-y divide-line">
            {report.contractRequirementReview.length === 0 ? (
              <p className="p-8 text-sm text-moss">No readable contract requirement rows were extracted.</p>
            ) : (
              report.contractRequirementReview.map((item) => (
                <article className="p-6" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-semibold text-ink">{item.requirement}</h3>
                    <div className="flex gap-2">
                      <Pill className={toneClass(item.risk)}>{item.risk}</Pill>
                      <Pill className={toneClass(item.confidence)}>{item.confidence}</Pill>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-moss">{item.explanation}</p>
                  <p className="mt-3 text-xs font-semibold uppercase text-moss">{item.sourceDocument} · {item.sourceLocation}</p>
                  <p className="mt-3 rounded-[18px] border border-line/60 bg-paper p-4 text-sm text-ink">{item.extractedText}</p>
                  <p className="mt-3 text-sm font-semibold text-ink">{item.action}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Missing Information / Unable to Verify</h2>
          <p className="mt-1 text-sm text-moss">Items here are intentionally not resolved by inference.</p>
        </div>
        <div className="divide-y divide-line">
          {report.missingInformation.map((item) => (
            <article className="grid gap-4 p-6 md:grid-cols-[220px_1fr_1fr]" key={item.id}>
              <div>
                <p className="font-semibold text-ink">{item.item}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-moss">Needed: {item.neededDocument}</p>
              </div>
              <p className="text-sm leading-6 text-moss">{item.reason}</p>
              <p className="text-sm leading-6 text-ink">{item.confidenceReason}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
