import type {
  Observation,
  PatientEvent,
  ReviewItem,
} from "@health-intelligence/contracts";

const sourceHash = `sha256:${"a".repeat(64)}`;

export const observations: Observation[] = [
  {
    id: "obs-ferritin-2025",
    conceptCode: "LOINC:2276-4",
    display: "Ferritin",
    value: 31,
    unit: "ng/mL",
    referenceRange: { low: 13, high: 150 },
    effectiveAt: "2025-10-14T09:15:00+03:00",
    specimen: "serum",
    semanticClass: "FACT",
    trustTier: "verified",
    provenance: [
      {
        id: "prov-ferritin-old",
        documentId: "SYN-LAB-2025-10",
        sourceHash,
        extractorVersion: "synthetic-worker/0.1.0",
        region: {
          page: 1,
          text: "Ferritin 31 ng/mL (13–150)",
          boundingBox: [0.12, 0.31, 0.55, 0.05],
        },
      },
    ],
  },
  {
    id: "obs-ferritin-2026",
    conceptCode: "LOINC:2276-4",
    display: "Ferritin",
    value: 18,
    unit: "ng/mL",
    referenceRange: { low: 13, high: 150 },
    effectiveAt: "2026-02-10T08:00:00+03:00",
    specimen: "serum",
    semanticClass: "FACT",
    trustTier: "verified",
    provenance: [
      {
        id: "prov-ferritin-new-lab",
        documentId: "SYN-LAB-2026-02",
        sourceHash,
        extractorVersion: "synthetic-worker/0.1.0",
        region: {
          page: 1,
          text: "Ferritin 18 ng/mL (13–150)",
          boundingBox: [0.12, 0.42, 0.55, 0.05],
        },
      },
      {
        id: "prov-ferritin-new-summary",
        documentId: "SYN-SUMMARY-2026-02",
        sourceHash: `sha256:${"b".repeat(64)}`,
        extractorVersion: "synthetic-worker/0.1.0",
        region: {
          page: 1,
          text: "Ferritin sonucu: 18 ng/mL",
          boundingBox: [0.16, 0.24, 0.48, 0.04],
        },
      },
    ],
  },
  {
    id: "obs-hgb-2026",
    conceptCode: "LOINC:718-7",
    display: "Hemoglobin",
    value: 12.6,
    unit: "g/dL",
    referenceRange: { low: 12, high: 16 },
    effectiveAt: "2026-02-10T08:00:00+03:00",
    specimen: "whole-blood",
    semanticClass: "FACT",
    trustTier: "extracted_high",
    provenance: [
      {
        id: "prov-hgb",
        documentId: "SYN-LAB-2026-02",
        sourceHash,
        extractorVersion: "synthetic-worker/0.1.0",
        region: {
          page: 1,
          text: "Hemoglobin 12,6 g/dL (12–16)",
          boundingBox: [0.12, 0.51, 0.55, 0.05],
        },
      },
    ],
  },
  {
    id: "obs-crp-conflict",
    conceptCode: "LOINC:1988-5",
    display: "CRP",
    value: 7.2,
    unit: "mg/L",
    referenceRange: { low: 0, high: 5 },
    effectiveAt: "2026-02-10T08:00:00+03:00",
    specimen: "serum",
    semanticClass: "FACT",
    trustTier: "conflicted",
    provenance: [
      {
        id: "prov-crp-conflict",
        documentId: "SYN-LAB-2026-02",
        sourceHash,
        extractorVersion: "synthetic-worker/0.1.0",
        region: {
          page: 1,
          text: "CRP 7,2 mg/L (0–5) — yinelenen özette 1,2 görünüyor",
          boundingBox: [0.12, 0.62, 0.66, 0.05],
        },
      },
    ],
  },
];

export const reviewItems: ReviewItem[] = observations
  .filter((observation) => observation.trustTier !== "verified")
  .map((observation, index) => ({
    id: `review-${index + 1}`,
    observation,
    severity: observation.trustTier === "conflicted" ? 0.92 : 0.5,
    uncertainty: observation.trustTier === "conflicted" ? 0.95 : 0.35,
    caseRelevance: 0.86,
    criticalConflict: observation.trustTier === "conflicted",
    status: "pending",
    explanation:
      observation.trustTier === "conflicted"
        ? "Çelişkili kaynak; hassas hesaplama doğrulanana kadar durur."
        : "Yüksek güvenli çıkarım, insan onayı olmadan doğrulanmış duruma geçmez.",
  }));

export const events: PatientEvent[] = [
  {
    id: "evt-document",
    sequence: 0,
    type: "DocumentImported",
    recordedAt: "2026-02-10T08:02:00+03:00",
    sourceId: "SYN-LAB-2026-02",
    summary: "Sentetik Türkçe laboratuvar belgesi içe aktarıldı",
  },
  {
    id: "evt-extracted",
    sequence: 1,
    type: "FactExtracted",
    recordedAt: "2026-02-10T08:02:02+03:00",
    sourceId: "SYN-LAB-2026-02",
    summary: "Yerel worker dört laboratuvar önerisi üretti",
  },
  {
    id: "evt-verified",
    sequence: 2,
    type: "FactVerified",
    recordedAt: "2026-02-10T08:05:00+03:00",
    sourceId: "obs-ferritin-2026",
    summary: "Ferritin kaydı insan incelemesiyle doğrulandı",
  },
];
