import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocumentAction, updateDocumentTypeAction, uploadDocumentsAction } from "@/app/app/actions";
import { PackageUploadDropzone } from "@/components/PackageUploadDropzone";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { classificationOptions, classifyUploadedFile } from "@/lib/document-classifier";
import { formatFileSize } from "@/lib/format";
import { REVIEW_FOCUS_OPTIONS } from "@/lib/review-focus";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";

export default async function UploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ created?: string; saved?: string; uploaded?: string; error?: string }>;
}) {
  const { projectId } = await params;
  const status = await searchParams;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  const uploadAction = uploadDocumentsAction.bind(null, project.id);
  const uploadedCount = Number(status.uploaded ?? 0);
  const extractedCount = project.uploadedFiles.filter((file) => file.extractionStatus === "extracted").length;
  const includedCount = project.uploadedFiles.filter((file) => file.includedInReview).length;
  const classifiedCount = project.uploadedFiles.filter((file) => file.processingStatus === "classified").length;
  const detectedCategories = Array.from(
    new Set(project.uploadedFiles.map((file) => file.documentCategory ?? classifyUploadedFile(file).label)),
  ).filter(Boolean);

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Upload package and start review</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Upload the documents in one place. JanusScope will classify the files, infer the likely trade, and start the review automatically.
          </p>
        </div>
        <Link className="button-secondary" href={`/app/projects/${project.id}/questions`}>
          View Review Package
        </Link>
      </div>

      {status.created ? <StatusBanner tone="success">Project created. Add documents or paste review language when ready.</StatusBanner> : null}
      {status.saved ? (
        <StatusBanner tone="success">
          {uploadedCount > 0 ? `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded and saved.` : "Project notes saved."}
        </StatusBanner>
      ) : null}
      {status.error ? <StatusBanner tone="error">{status.error}</StatusBanner> : null}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Uploaded files", project.uploadedFiles.length],
          ["Classified files", classifiedCount],
          ["Text extracted", extractedCount],
          ["Included in review", includedCount],
        ].map(([label, value]) => (
          <div className="card p-6" key={label}>
            <p className="text-xs font-semibold uppercase text-moss">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Document review</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Document classification status</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
              JanusScope classifies every uploaded file. CSV files are text-extracted for source-backed review today; PDF, DOCX, XLSX, PNG, and JPG files are stored and classified while deeper parsing is expanded.
            </p>
          </div>
          <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss">
            {detectedCategories.length > 0 ? `${detectedCategories.length} document type${detectedCategories.length === 1 ? "" : "s"} detected` : "Waiting for upload"}
          </span>
        </div>
        {detectedCategories.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {detectedCategories.map((category) => (
              <span className="rounded-full border border-line/60 bg-paper px-4 py-2 text-xs font-semibold text-moss" key={category}>
                {category}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <form action={uploadAction} className="space-y-6">
        <section className="card p-8 sm:p-10">
          <PackageUploadDropzone />
        </section>

        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Review Focus</h2>
          <p className="mt-2 text-sm leading-6 text-moss">
            Choose a few focus areas, or leave Review everything selected.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {REVIEW_FOCUS_OPTIONS.map((option, index) => (
              <label className="cursor-pointer" key={option.id}>
                <input
                  className="peer sr-only"
                  type="checkbox"
                  name="reviewFocus"
                  value={option.id}
                  defaultChecked={index === 0}
                />
                <span className="inline-flex rounded-full border border-line/70 bg-paper px-4 py-2 text-sm font-semibold text-moss transition peer-checked:border-steel peer-checked:bg-[#eaf3ff] peer-checked:text-steel">
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          <label className="mt-8 block">
            <span className="field-label">Anything specific you want JanusScope to look for?</span>
            <textarea
              className="field min-h-32"
              name="reviewNotes"
              placeholder="Check if this bid misses anything from the scope. Review for hidden contract risk. Compare the sub bid against the owner scope. Focus on windows, permits, and code requirements. Tell me the biggest cost exposure before we issue the subcontract."
            />
          </label>
          <label className="mt-5 flex items-start gap-3 rounded-[22px] border border-line/60 bg-paper p-5 text-sm text-moss">
            <input type="checkbox" name="deleteDocumentsAfterReport" defaultChecked={project.deleteDocumentsAfterReport} className="mt-1 h-4 w-4 accent-steel" />
            <span>Delete uploaded source files after report generation. JanusScope keeps the project record, extracted review text, and generated report metadata.</span>
          </label>
        </section>

        <div className="flex justify-end">
          <PendingSubmitButton className="button-primary" pendingLabel="Saving and starting review...">
            Save Uploads and Start Review
          </PendingSubmitButton>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Uploaded documents</h2>
          <p className="mt-1 text-sm text-moss">Documents are tied to user, organization, project, storage path, extraction status, and review inclusion.</p>
        </div>
        {project.uploadedFiles.length === 0 ? (
          <p className="p-8 text-sm text-moss">No documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1160px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Classification</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Extraction</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Uploaded</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {project.uploadedFiles.map((file) => {
                  const updateAction = updateDocumentTypeAction.bind(null, project.id, file.id);
                  const deleteAction = deleteDocumentAction.bind(null, project.id, file.id);
                  const classification = classifyUploadedFile(file);
                  return (
                    <tr key={file.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{file.name}</p>
                        <p className="text-xs text-moss">{file.type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateAction} className="flex gap-2">
                          <select className="field min-w-56 py-2" name="documentType" defaultValue={file.documentId}>
                            {classificationOptions().map((document) => (
                              <option value={document.id} key={document.id}>{document.label}</option>
                            ))}
                          </select>
                          <button className="button-secondary py-2" type="submit">Confirm</button>
                        </form>
                        <p className="mt-2 text-xs font-semibold text-moss">
                          {classification.label} · {classification.confidence} confidence · {classification.status}
                        </p>
                      </td>
                      <td className="px-4 py-4 capitalize text-moss">{file.processingStatus}</td>
                      <td className="px-4 py-4 text-moss">
                        <p className="font-semibold capitalize text-ink">{file.extractionStatus ?? "metadata-only"}</p>
                        <p className="mt-1 max-w-xs text-xs leading-5">{file.includedInReview ? `${file.reviewedSectionCount ?? 0} rows included` : file.extractionMessage ?? "No extracted text included"}</p>
                      </td>
                      <td className="px-4 py-4 text-moss">{formatFileSize(file.size)}</td>
                      <td className="px-4 py-4 text-moss">{new Date(file.uploadedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <form action={deleteAction}>
                          <button className="text-sm font-semibold text-brick" type="submit">Delete file</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
