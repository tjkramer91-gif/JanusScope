import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocumentAction, updateDocumentTypeAction, uploadDocumentsAction } from "@/app/app/actions";
import { DOCUMENT_CATALOG } from "@/lib/catalogs";
import { formatFileSize } from "@/lib/format";
import { requireUser } from "@/lib/server/auth";
import { getProject } from "@/lib/server/store";

export default async function UploadPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await requireUser();
  const project = await getProject(user, projectId);
  if (!project) notFound();

  const uploadAction = uploadDocumentsAction.bind(null, project.id);

  return (
    <div className="mx-auto max-w-[1180px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Document upload</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{project.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-moss">
            Upload subcontract, bid, exclusions, and supporting documents. Paste key text for the MVP comparison while document parsing is structured for future background jobs.
          </p>
        </div>
        <Link className="button-secondary" href={`/auth/login?mfa=1&returnTo=/app/projects/${project.id}/upload`}>
          MFA before upload
        </Link>
      </div>

      <form action={uploadAction} className="space-y-6">
        <section className="card p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
            <label>
              <span className="field-label">Upload documents</span>
              <input
                className="field"
                type="file"
                name="files"
                multiple
                accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"
              />
            </label>
            <label>
              <span className="field-label">Document type for this batch</span>
              <select className="field" name="documentType" defaultValue="other">
                <option value="other">Auto-classify or Other</option>
                {DOCUMENT_CATALOG.map((document) => (
                  <option value={document.id} key={document.id}>{document.label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card p-8 sm:p-10">
          <h2 className="section-title">Paste extracted text or key clauses</h2>
          <p className="mt-1 text-sm leading-6 text-moss">
            Server-side PDF, DOCX, XLSX, and OCR parsing can feed these fields later. For the MVP, paste the contract and bid language you need reviewed.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <label>
              <span className="field-label">GC subcontract text</span>
              <textarea className="field min-h-[280px]" name="subcontractText" defaultValue={project.subcontractText} />
            </label>
            <label>
              <span className="field-label">Bid or proposal text</span>
              <textarea className="field min-h-[280px]" name="bidText" defaultValue={project.bidText} />
            </label>
            <label>
              <span className="field-label">Assumptions and exclusions</span>
              <textarea className="field min-h-[280px]" name="exclusionsText" defaultValue={project.exclusionsText} />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="field-label">Other notes</span>
            <textarea className="field min-h-24" name="notesText" defaultValue={project.notesText} />
          </label>
          <label className="mt-5 flex items-start gap-3 rounded-[22px] border border-line/60 bg-paper p-5 text-sm text-moss">
            <input type="checkbox" name="deleteDocumentsAfterReport" defaultChecked={project.deleteDocumentsAfterReport} className="mt-1 h-4 w-4 accent-steel" />
            <span>Delete uploaded documents after report generation.</span>
          </label>
        </section>

        <div className="flex justify-end">
          <button className="button-primary" type="submit">Save and continue to checklist</button>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="border-b border-line/60 p-8 sm:p-10">
          <h2 className="section-title">Uploaded documents</h2>
          <p className="mt-1 text-sm text-moss">Every document is tied to user ID, organization ID, project ID, storage path, and processing status.</p>
        </div>
        {project.uploadedFiles.length === 0 ? (
          <p className="p-8 text-sm text-moss">No documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="bg-paper/70 text-xs uppercase text-moss">
                <tr>
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Document type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
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
