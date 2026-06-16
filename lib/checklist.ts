import { AnswerOption } from "@/lib/types";

export const ANSWER_OPTIONS: Array<{ value: AnswerOption; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure" },
  { value: "not-applicable", label: "Not applicable" },
];

export const INTAKE_QUESTIONS = [
  ["permits", "Did your bid include permits?"],
  ["plan-review-fees", "Did your bid include plan review fees?"],
  ["inspections-testing", "Did your bid include inspections or third-party testing?"],
  ["engineering", "Did your bid include engineering or delegated design?"],
  ["firestopping", "Did your bid include firestopping?"],
  ["patching-existing", "Did your bid include patching or repair of existing conditions?"],
  ["blocking-backing", "Did your bid include blocking, backing, or in-wall supports?"],
  ["temporary-facilities", "Did your bid include temporary power, water, dumpsters, toilets, fencing, storage, scaffolding, lifts, or hoisting?"],
  ["premium-time", "Did your bid include overtime, weekend work, shift work, or premium time?"],
  ["acceleration", "Did your bid include acceleration or resequencing?"],
  ["material-escalation", "Did your bid include material escalation?"],
  ["tax-freight-storage", "Did your bid include sales tax, freight, delivery, storage, or handling?"],
  ["closeout", "Did your bid include closeout documents, attic stock, O&M manuals, or as-builts?"],
  ["extended-warranty", "Did your bid include warranty beyond one year?"],
  ["exclusions-attached", "Are your exclusions attached to the subcontract?"],
  ["proposal-date", "Does the subcontract reference your correct proposal date and revision?"],
  ["unit-prices", "Are your unit prices included in the subcontract?"],
  ["alternates", "Are your alternates clearly accepted or rejected?"],
  ["allowances", "Are allowances clearly listed?"],
  ["bond-required", "Are you required to provide a bond?"],
  ["liquidated-damages", "Are you exposed to liquidated damages?"],
  ["conditional-payment", "Does the subcontract include pay-if-paid or pay-when-paid language?"],
  ["written-change-orders", "Are change orders required in writing before work starts?"],
  ["verbal-directives", "Are verbal directives excluded unless confirmed in writing?"],
] as const;

export type IntakeQuestionKey = (typeof INTAKE_QUESTIONS)[number][0];
