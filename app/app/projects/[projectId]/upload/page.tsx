import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocumentAction, updateDocumentTypeAction, uploadDocumentsAction } from "@/app/app/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { StatusBanner } from "@/components/StatusBanner";
import { DOCUMENT_CATALOG } from "@/lib/catalogs";
import { formatFileSize } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";
import { DOCUMENT_UPLOAD_AREAS } from "@/lib/subscope-content";

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

  return (
    <div className="mx-auto max-w-[1220px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Upload SubScope documents</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Add the package you received from the GC and the documents you used to price the work. CSV uploads are text-extracted for source-backed review; PDF, Word, Excel, PNG, and JPG uploads are stored and tracked until deeper parsing is added.
          </p>
        </div>
        <Link className="button-secondary" href={`/app/projects/${project.id}/questions`}>
          Skip to Review Package
        </Link>
      </div>

      {status.created ? <StatusBanner tone="success">Project created. Add documents or paste review language when ready.</StatusBanner> : null}
      {status.saved ? (
        <StatusBanner tone="success">
          {uploadedCount > 0 ? `${uploadedCount} document${uploadedCount === 1 ? "" : "s"} uploaded and saved.` : "Project notes saved."}
        </StatusBanner>
      ) : null}
      {status.error ? <StatusBanner tone="error">{status.error}</StatusBanner> : null}

      <form action={uploadAction} className="space-y-6">
        <section className="card p-8 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h2 className="section-title">Document areas</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
                Use the matching area when you have it. Filename classification helps organize the document list after upload.
              </p>
            </div>
            <label className="min-w-64">
              <span className="field-label">Fallback document type</span>
              <select className="field" name="documentType" defaultValue="other">
                <option value="other">Auto-classify or Other</option>
                {DOCUMENT_CATALOG.map((document) => (
                  <option value={document.id} key={document.id}>{document.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {DOCUMENT_UPLOAD_AREAS.map((area) => (
              <label className="rounded-[24px] border border-line/60 bg-paper p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-card" key={area}>
                <span className="block text-sm font-semibold text-ink">{area}</span>
                <span className="mt-2 block text-xs leading-5 text-moss">PDF, Word, Excel, CSV, PNG, or JPG file.</span>
                <input
                  className="mt-4 block w-full text-xs text-moss file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-ink file:shadow-sm"
                  type="file"
                  name="files"
                  accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
                  multiple
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Key language for this review</h2>
          <p className="mt-2 text-sm leading-6 text-moss">
            Paste any key language that is not available in readable uploads. The report separates pasted context from uploaded source evidence.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <label>
              <span className="field-label">GC subcontract language</span>
              <textarea className="field min-h-[280px]" name="subcontractText" defaultValue={project.subcontractText} placeholder="Payment, flow-down, indemnity, change order, schedule, LD, warranty, retainage, and scope clauses..." />
            </label>
            <label>
              <span className="field-label">Subcontractor bid/proposal language</span>
              <textarea className="field min-h-[280px]" name="bidText" defaultValue={project.bidText} placeholder="Proposal scope, inclusions, alternates, unit prices, assumptions, and bid date..." />
            </label>
            <label>
              <span className="field-label">Qualifications and exclusions</span>
              <textarea className="field min-h-[280px]" name="exclusionsText" defaultValue={project.exclusionsText} placeholder="Exclusions, clarifications, owner/GC furnished items, permit assumptions, schedule assumptions..." />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="field-label">Other supporting notes</span>
            <textarea className="field min-h-24" name="notesText" defaultValue={project.notesText} placeholder="Addenda received, verbal assumptions, drawing/spec concerns, GC conversations, or open questions." />
          </label>
          <label className="mt-5 flex items-start gap-3 rounded-[22px] border border-line/60 bg-paper p-5 text-sm text-moss">
            <input type="checkbox" name="deleteDocumentsAfterReport" defaultChecked={project.deleteDocumentsAfterReport} className="mt-1 h-4 w-4 accent-steel" />
            <span>Delete uploaded documents after report generation. This is a data-control placeholder for the MVP workflow.</span>
          </label>
        </section>

        <div className="flex justify-end">
          <PendingSubmitButton className="button-primary" pendingLabel="Saving upload...">
            Save Uploads and Notes
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
                  <th className="px-4 py-3 font-semibold">Document type</th>
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
                  return (
                    <tr key={file.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{file.name}</p>
                        <p className="text-xs text-moss">{file.type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <form action={updateAction} className="flex gap-2">
                          <select className="field min-w-56 py-2" name="documentType" defaultValue={file.documentId}>
                            {DOCUMENT_CATALOG.map((document) => (
                              <option value={document.id} key={document.id}>{document.label}</option>
                            ))}
                          </select>
                          <button className="button-secondary py-2" type="submit">Save</button>
                        </form>
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
