import { describe, expect, it } from "vitest";
import {
  canEnterVerifiedState,
  observationSchema,
  rankReviewItems,
  type Observation,
  type ReviewItem,
} from "../src";

const observation: Observation = {
  id: "obs-ferritin-01",
  conceptCode: "LOINC:2276-4",
  display: "Ferritin",
  value: 18,
  unit: "ng/mL",
  referenceRange: { low: 13, high: 150 },
  effectiveAt: "2026-02-10T08:00:00+03:00",
  specimen: "serum",
  semanticClass: "FACT",
  trustTier: "extracted_low",
  provenance: [
    {
      id: "prov-01",
      documentId: "doc-01",
      sourceHash: `sha256:${"a".repeat(64)}`,
      extractorVersion: "synthetic-worker/0.1.0",
      region: {
        page: 1,
        text: "Ferritin 18 ng/mL",
        boundingBox: [0.1, 0.2, 0.4, 0.05],
      },
    },
  ],
};

describe("strict contracts", () => {
  it("requires provenance and rejects unknown fields", () => {
    expect(observationSchema.safeParse(observation).success).toBe(true);
    expect(
      observationSchema.safeParse({ ...observation, provenance: [] }).success,
    ).toBe(false);
    expect(
      observationSchema.safeParse({ ...observation, diagnosis: "unsupported" })
        .success,
    ).toBe(false);
  });

  it("allows only reviewed facts into verified state", () => {
    expect(canEnterVerifiedState(observation)).toBe(false);
    expect(
      canEnterVerifiedState({ ...observation, trustTier: "verified" }),
    ).toBe(true);
    expect(
      canEnterVerifiedState({
        ...observation,
        semanticClass: "INFERENCE",
        trustTier: "verified",
      }),
    ).toBe(false);
  });

  it("caps deterministically ranked review items at twenty", () => {
    const items: ReviewItem[] = Array.from({ length: 27 }, (_, index) => ({
      id: `review-${index.toString().padStart(2, "0")}`,
      observation: { ...observation, id: `obs-${index}` },
      severity: (index + 1) / 27,
      uncertainty: 1,
      caseRelevance: 1,
      criticalConflict: false,
      status: "pending",
      explanation: "Synthetic priority input",
    }));
    const ranked = rankReviewItems(items);
    expect(ranked).toHaveLength(20);
    expect(ranked[0]?.id).toBe("review-26");
  });

  it("keeps critical conflicts ahead of the review budget", () => {
    const items: ReviewItem[] = Array.from({ length: 21 }, (_, index) => ({
      id: `review-${index.toString().padStart(2, "0")}`,
      observation: { ...observation, id: `obs-${index}` },
      severity: index === 20 ? 0 : 1,
      uncertainty: index === 20 ? 0 : 1,
      caseRelevance: index === 20 ? 0 : 1,
      criticalConflict: index === 20,
      status: "pending",
      explanation: "Synthetic priority input",
    }));

    const ranked = rankReviewItems(items);
    expect(ranked).toHaveLength(20);
    expect(ranked[0]?.id).toBe("review-20");
  });
});
