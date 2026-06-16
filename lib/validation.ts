import { z } from "zod";

export const optionalMoneySchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : Number(value)))
  .pipe(z.number().nonnegative().nullable());

export const projectInputSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  projectAddress: z.string().trim().min(1, "Project address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  zip: z.string().trim().min(3, "ZIP is required"),
  tradeType: z.string().trim().min(1, "Trade type is required"),
  gcName: z.string().trim().min(1, "GC name is required"),
  ownerName: z.string().trim().optional().default(""),
  contractAmount: optionalMoneySchema,
  bidDate: z.string().trim().optional().default(""),
  executionDeadline: z.string().trim().optional().default(""),
  projectType: z.enum([
    "multifamily",
    "affordable-housing",
    "commercial",
    "tenant-improvement",
    "civil",
    "industrial",
    "public-works",
    "other",
  ]),
  hasMasterServiceAgreement: z.enum(["yes", "no", "not-sure"]),
  publicOrPrivate: z.enum(["public", "private", "not-sure"]),
  prevailingWageStatus: z.enum(["yes", "no", "not-sure"]),
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
