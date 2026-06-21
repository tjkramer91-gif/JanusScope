import { createEmptyProject } from "@/lib/catalogs";
import { INTAKE_QUESTIONS } from "@/lib/checklist";
import {
  SYNTHETIC_STORAGE_PREFIX,
  createSyntheticDemoProfile,
  syntheticDatasetApprovalNote,
} from "@/lib/synthetic-data";
import { Project } from "@/lib/types";

export function createDemoProject(): Project {
  const profile = createSyntheticDemoProfile("demo-report");
  const project = createEmptyProject({
    id: "demo-subscope-risk-review",
    organizationId: "demo-org",
    userId: "demo-user",
  });
  const availableDocuments = new Set([
    "gc-subcontract",
    "bid-proposal",
    "scope-letter",
    "exclusions-assumptions",
    "drawings",
    "specifications",
    "schedule",
    "insurance",
  ]);

  return {
    ...project,
    name: `${profile.projectName} Demo Review`,
    projectAddress: profile.projectAddress,
    city: profile.city,
    state: profile.state,
    zip: profile.zip,
    tradeType: "Electrical",
    gcName: profile.gcName,
    ownerName: profile.ownerName,
    contractAmount: profile.contractAmount,
    bidDate: profile.bidDate,
    executionDeadline: profile.executionDeadline,
    hasMasterServiceAgreement: "not-sure",
    publicOrPrivate: "private",
    prevailingWageStatus: "not-sure",
    projectType: "tenant-improvement",
    status: "report-ready",
    documents: project.documents.map((document) => ({
      ...document,
      available: availableDocuments.has(document.id),
    })),
    uploadedFiles: [
      {
        id: "demo-doc-1",
        name: "synthetic-gc-subcontract-electrical.pdf",
        size: 1_280_000,
        type: "application/pdf",
        documentId: "gc-subcontract",
        storagePath: `${SYNTHETIC_STORAGE_PREFIX}/synthetic-gc-subcontract-electrical.pdf`,
        processingStatus: "classified",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: "demo-doc-2",
        name: "synthetic-electrical-proposal.pdf",
        size: 420_000,
        type: "application/pdf",
        documentId: "bid-proposal",
        storagePath: `${SYNTHETIC_STORAGE_PREFIX}/synthetic-electrical-proposal.pdf`,
        processingStatus: "classified",
        uploadedAt: new Date().toISOString(),
      },
    ],
    intakeAnswers: INTAKE_QUESTIONS.map(([questionKey, questionText]) => ({
      questionKey,
      questionText,
      answer: ["exclusions-attached", "proposal-date", "unit-prices", "written-change-orders"].includes(questionKey)
        ? "not-sure"
        : "no",
    })),
    subcontractText:
      "Subcontractor shall furnish all labor, materials, equipment, tools, supervision, hoisting, storage, temporary power connections, testing, permits, inspections, engineering, and all work required for a complete and operational electrical system per plans and specs, including work reasonably inferable from the contract documents. The subcontract incorporates the prime contract, all drawings, specifications, and addenda by reference. Pay-if-paid is a condition precedent to payment. Subcontractor must provide written notice within 48 hours and obtain prior written authorization before extra work. No oral directives are valid. Contractor may backcharge cleanup, damage, and correction costs. Subcontractor shall defend, indemnify, and hold harmless contractor and owner and provide additional insured, primary and noncontributory coverage with waiver of subrogation. Schedule acceleration, overtime, weekend work, and additional manpower may be required at no additional compensation. Liquidated damages may be passed through. Subcontractor shall provide as-builts, closeout documents, O&M manuals, warranty documents, testing, commissioning support, and all permits required by the AHJ.",
    bidText:
      "Electrical proposal dated 05/29/2026 includes branch wiring, lighting fixtures listed in fixture schedule, panels EP-1 and EP-2, and standard working hours Monday through Friday. Proposal excludes permits, inspection fees, utility company charges, engineering, delegated design, firestopping, patching, painting, temporary power, dumpsters, lifts, hoisting, premium time, overtime, weekend work, testing by third parties, sales tax, freight escalation, and storage. Unit prices are included for additional receptacles and fixtures. Warranty is one year from substantial completion.",
    exclusionsText:
      "Exclusions: permits, testing and inspections, engineering and delegated design, patching and repair of existing conditions, temporary facilities, hoisting, dumpsters, scaffolding, lifts, sales tax, freight, storage, escalation, overtime, premium time, weekend work, firestopping, warranty beyond one year, as-builts beyond standard redlines.",
    notesText:
      `${syntheticDatasetApprovalNote(profile.seed, "Demo report package")} Estimator noted that addendum 3 was not included in the bid and the GC wants the subcontract executed before insurance exhibit review is complete.`,
    updatedAt: new Date().toISOString(),
  };
}
