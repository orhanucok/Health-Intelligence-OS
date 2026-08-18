/**
 * Bridge to the Rust vault. Every call degrades to a declared "unavailable"
 * result outside the Tauri shell (browser dev server, jsdom tests) so the UI
 * can say the record is not durable instead of pretending that it is.
 */

export type PatientEvent = {
  sequence: number;
  eventId: string;
  eventType: string;
  sourceId: string;
  recordedAt: string;
};

export type VaultStatus = {
  path: string;
  eventCount: number;
  intact: boolean;
};

export type TrendRefusal =
  | "no_points"
  | "non_finite_value"
  | "incompatible_series"
  | "unverified_input";

export type LabPoint = {
  observationId: string;
  conceptCode: string;
  unit: string;
  specimen: string;
  trustTier:
    | "verified"
    | "extracted_high"
    | "extracted_low"
    | "uncertain"
    | "conflicted";
  day: number;
  value: number;
};

export type LabTrend = {
  formulaVersion: string;
  inputObservationIds: string[];
  baseline: number;
  latest: number;
  absoluteChange: number;
  percentageChange: number | null;
  slopePerDay: number | null;
};

export type VaultResult<T> =
  | { state: "ok"; value: T }
  | { state: "unavailable" }
  | { state: "refused"; reason: string };

/** Why a trend was withheld, in the user's language. Never a number. */
export const TREND_REFUSAL_COPY: Record<TrendRefusal, string> = {
  no_points: "Bu ölçüm için doğrulanmış sonuç bulunmuyor.",
  non_finite_value: "Sonuç değerleri geçersiz; trend hesaplanmadı.",
  incompatible_series:
    "Sonuçlar farklı birim veya örnek türünden geliyor; trend hesaplanmadı.",
  unverified_input:
    "Sonuçlardan en az biri doğrulanmamış veya çelişkili; trend hesaplanmadı.",
};

export function isTauriAvailable(): boolean {
  return (
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in (window as object)
  );
}

async function call<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<VaultResult<T>> {
  if (!isTauriAvailable()) return { state: "unavailable" };
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return { state: "ok", value: await invoke<T>(command, args) };
  } catch (error) {
    return {
      state: "refused",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function readVaultStatus(): Promise<VaultResult<VaultStatus>> {
  return call<VaultStatus>("vault_status");
}

export function listVaultEvents(): Promise<VaultResult<PatientEvent[]>> {
  return call<PatientEvent[]>("vault_list_events");
}

export function appendVaultEvent(
  event: Omit<PatientEvent, "sequence">,
): Promise<VaultResult<PatientEvent>> {
  return call<PatientEvent>("vault_append_event", {
    event: { ...event, sequence: 0 },
  });
}

export function calculateLabTrend(
  points: LabPoint[],
): Promise<VaultResult<LabTrend>> {
  return call<LabTrend>("vault_lab_trend", { points });
}

/** Stable id so re-importing the same file never duplicates the journal. */
export function documentImportEventId(fingerprint: string): string {
  return `document.imported:${fingerprint}`;
}
