import { z } from "zod";

const optionalTextSchema = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string().trim(),
);

export const optionalMoneySchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string()
      .transform((value) => (value === "" ? null : Number(value)))
      .pipe(z.number().nonnegative().nullable()),
  );

const projectTypeSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value : "commercial"),
  z.enum([
    "multifamily",
    "commercial",
    "tenant-improvement",
    "civil",
    "industrial",
    "public-works",
    "other",
  ]),
);

const msaStatusSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value : "not-sure"),
  z.enum(["yes", "no", "not-sure"]),
);

const publicPrivateSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value : "not-sure"),
  z.enum(["public", "private", "not-sure"]),
);

const prevailingWageSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value : "not-sure"),
  z.enum(["yes", "no", "not-sure"]),
);

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  projectAddress: optionalTextSchema,
  city: optionalTextSchema,
  state: optionalTextSchema,
  zip: optionalTextSchema,
  tradeType: optionalTextSchema,
  gcName: optionalTextSchema,
  ownerName: optionalTextSchema,
  projectNotes: optionalTextSchema,
  contractAmount: optionalMoneySchema,
  bidDate: optionalTextSchema,
  executionDeadline: optionalTextSchema,
  projectType: projectTypeSchema,
  hasMasterServiceAgreement: msaStatusSchema,
  publicOrPrivate: publicPrivateSchema,
  prevailingWageStatus: prevailingWageSchema,
});

export const uploadTextSchema = z.object({
  documentType: z.string().trim().optional().default("other"),
  subcontractText: z.string().default(""),
  bidText: z.string().default(""),
  exclusionsText: z.string().default(""),
  notesText: z.string().default(""),
  deleteDocumentsAfterReport: z.boolean().default(false),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
