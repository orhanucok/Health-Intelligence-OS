import { z } from "zod";

export const semanticClassSchema = z.enum([
  "FACT",
  "DERIVED_FACT",
  "INFERENCE",
  "HYPOTHESIS",
]);
export const trustTierSchema = z.enum([
  "verified",
  "extracted_high",
  "extracted_low",
  "uncertain",
  "conflicted",
]);

export const sourceRegionSchema = z
  .object({
    page: z.number().int().positive(),
    text: z.string().min(1),
    boundingBox: z.tuple([
      z.number().nonnegative(),
      z.number().nonnegative(),
      z.number().positive(),
      z.number().positive(),
    ]),
  })
  .strict();

export const provenanceSchema = z
  .object({
    id: z.string().min(1),
    documentId: z.string().min(1),
    sourceHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    extractorVersion: z.string().min(1),
    region: sourceRegionSchema,
  })
  .strict();

export const observationSchema = z
  .object({
    id: z.string().min(1),
    conceptCode: z.string().min(1),
    display: z.string().min(1),
    value: z.number().finite(),
    unit: z.string().min(1),
    referenceRange: z
      .object({ low: z.number().finite(), high: z.number().finite() })
      .strict(),
    effectiveAt: z.string().datetime({ offset: true }),
    specimen: z.string().min(1),
    semanticClass: semanticClassSchema,
    trustTier: trustTierSchema,
    provenance: z.array(provenanceSchema).min(1),
  })
  .strict();

export const reviewItemSchema = z
  .object({
    id: z.string().min(1),
    observation: observationSchema,
    severity: z.number().min(0).max(1),
    uncertainty: z.number().min(0).max(1),
    caseRelevance: z.number().min(0).max(1),
    criticalConflict: z.boolean(),
    status: z.enum([
      "pending",
      "confirmed",
      "corrected",
      "rejected",
      "deferred",
    ]),
    explanation: z.string().min(1),
  })
  .strict();

export const patientEventSchema = z
  .object({
    id: z.string().min(1),
    sequence: z.number().int().nonnegative(),
    type: z.enum([
      "DocumentImported",
      "FactExtracted",
      "FactVerified",
      "ObservationRecorded",
      "ReportGenerated",
    ]),
    recordedAt: z.string().datetime({ offset: true }),
    sourceId: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict();

export const patientStateSchema = z
  .object({
    syntheticPatientId: z.string().regex(/^SYN-/),
    version: z.number().int().positive(),
    observations: z.array(observationSchema),
    events: z.array(patientEventSchema),
  })
  .strict()
  .superRefine((state, context) => {
    for (const observation of state.observations) {
      if (
        observation.semanticClass === "FACT" &&
        ![
          "verified",
          "extracted_high",
          "extracted_low",
          "uncertain",
          "conflicted",
        ].includes(observation.trustTier)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid FACT trust tier",
        });
      }
    }
  });

export type SemanticClass = z.infer<typeof semanticClassSchema>;
export type TrustTier = z.infer<typeof trustTierSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type ReviewItem = z.infer<typeof reviewItemSchema>;
export type PatientEvent = z.infer<typeof patientEventSchema>;
export type PatientState = z.infer<typeof patientStateSchema>;

export const canEnterVerifiedState = (observation: Observation): boolean =>
  observation.semanticClass === "FACT" && observation.trustTier === "verified";

export const rankReviewItems = (items: readonly ReviewItem[]): ReviewItem[] =>
  [...items]
    .filter((item) => item.status === "pending")
    .sort((left, right) => {
      if (left.criticalConflict !== right.criticalConflict) {
        return left.criticalConflict ? -1 : 1;
      }
      const leftScore = left.severity * left.uncertainty * left.caseRelevance;
      const rightScore =
        right.severity * right.uncertainty * right.caseRelevance;
      return rightScore - leftScore || left.id.localeCompare(right.id);
    })
    .slice(0, 20);
