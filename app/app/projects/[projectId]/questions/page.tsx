import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoReportRedirect } from "@/components/AutoReportRedirect";
import { classifyUploadedFile, classificationCounts } from "@/lib/document-classifier";
import { extractReviewFocus } from "@/lib/review-focus";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";
import { detectTradeScope } from "@/lib/trade-detector";
import { buildTradeSpecificReview, tradeModuleStatus } from "@/lib/trade-review";

export default async function ReviewPackagePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  const detectedTrade = detectTradeScope(project);
  const tradeFindings = buildTradeSpecificReview(project, detectedTrade);
  const counts = classificationCounts(project);
  const uncertainFiles = project.uploadedFiles.filter((file) => classifyUploadedFile(file).status === "Needs confirmation");
  const reportHref = `/app/projects/${project.id}/report`;

  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 3</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Review package</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            JanusScope classified the upload package, detected the likely trade, and prepared the risk output.
          </p>
        </div>
        <Link className="button-secondary" href={`/app/projects/${project.id}/upload`}>
          Adjust Uploads
        </Link>
      </div>

      <section className="card p-8 sm:p-10">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Files reviewed", project.uploadedFiles.length],
            ["Classified", counts.classified],
            ["Needs confirmation", counts.needsConfirmation],
            ["Trade findings", tradeFindings.length],
          ].map(([label, value]) => (
            <div className="rounded-[18px] border border-line/60 bg-paper p-5" key={label}>
              <p className="text-xs font-semibold uppercase text-moss">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-[20px] border border-line/60 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-moss">Review focus</p>
          <p className="mt-2 text-sm font-semibold text-ink">{extractReviewFocus(project.notesText)}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-8 sm:p-10">
          <p className="eyebrow">Trade routing</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{detectedTrade.trade}</h2>
          <p className="mt-2 text-sm font-semibold text-moss">{detectedTrade.confidence} confidence · {tradeModuleStatus(detectedTrade.trade)}</p>
          <ul className="mt-5 space-y-2 text-sm leading-6 text-moss">
            {detectedTrade.evidence.map((item) => (
              <li className="rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card p-8 sm:p-10">
          <p className="eyebrow">Review progress</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">
            {project.status === "report-ready" ? "Risk output generated" : "Review queued"}
          </h2>
          <div className="mt-5 space-y-3">
            {[
              "Documents classified",
              "Trade/scope detected",
              "General contract and scope checks applied",
              "Relevant trade module applied when available",
              "Top risks prioritized for report",
            ].map((step) => (
              <div className="flex items-center gap-3 rounded-[16px] border border-line/60 bg-paper px-4 py-3" key={step}>
                <span className="h-2.5 w-2.5 rounded-full bg-steel" />
                <p className="text-sm font-semibold text-ink">{step}</p>
              </div>
            ))}
          </div>
          {project.status === "report-ready" ? (
            <div className="mt-6">
              <AutoReportRedirect href={reportHref} />
              <Link className="button-primary mt-4" href={reportHref}>
                Open Risk Output
              </Link>
            </div>
          ) : (
            <Link className="button-primary mt-6" href={`/app/projects/${project.id}/upload`}>
              Upload Documents
            </Link>
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Classified documents</h2>
          <p className="mt-1 text-sm text-moss">Confirm anything marked Needs confirmation on the upload page.</p>
        </div>
        {project.uploadedFiles.length === 0 ? (
          <p className="p-8 text-sm text-moss">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Classification</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Extraction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {project.uploadedFiles.map((file) => {
                  const classification = classifyUploadedFile(file);
                  return (
                    <tr key={file.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{file.name}</p>
                        <p className="text-xs text-moss">{file.type}</p>
                      </td>
                      <td className="px-4 py-4 text-moss">{classification.label}</td>
                      <td className="px-4 py-4 text-moss">{classification.confidence}</td>
                      <td className="px-4 py-4 text-moss">{classification.status}</td>
                      <td className="px-4 py-4 text-moss">{file.extractionStatus ?? "metadata-only"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {uncertainFiles.length > 0 ? (
        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Missing or uncertain information</h2>
          <div className="mt-5 grid gap-3">
            {uncertainFiles.map((file) => (
              <div className="rounded-[18px] border border-line/60 bg-paper p-5" key={file.id}>
                <p className="font-semibold text-ink">{file.name}</p>
                <p className="mt-1 text-sm text-moss">Needs confirmation. Change the classification on the upload page if this file is important to the review.</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
