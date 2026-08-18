//! Disk-backed append-only vault that puts `clinical-core` in charge of the
//! record. Events are journalled one JSON object per line so the log stays
//! append-only on disk as well as in memory.

use std::fs::{self, File, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::sync::{Mutex, MutexGuard};

use clinical_core::{
    EventStore, LabPoint, LabTrend, PatientEvent, ReviewItem, TrendError, calculate_lab_trend,
    prioritized_review,
};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultStatus {
    pub path: String,
    pub event_count: usize,
    pub intact: bool,
}

#[derive(Debug)]
pub struct Vault {
    path: PathBuf,
    store: EventStore,
    skipped_lines: usize,
}

impl Vault {
    fn load(path: PathBuf) -> Result<Self, String> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }

        let mut store = EventStore::default();
        let mut skipped_lines = 0usize;

        if path.exists() {
            let file = File::open(&path).map_err(|error| error.to_string())?;
            for line in BufReader::new(file).lines() {
                let line = line.map_err(|error| error.to_string())?;
                if line.trim().is_empty() {
                    continue;
                }
                match serde_json::from_str::<PatientEvent>(&line) {
                    // Replaying in file order reproduces the original sequence
                    // numbers, and the store still rejects duplicate ids.
                    Ok(event) => {
                        if store.append(event).is_err() {
                            skipped_lines += 1;
                        }
                    }
                    Err(_) => skipped_lines += 1,
                }
            }
        }

        Ok(Self {
            path,
            store,
            skipped_lines,
        })
    }

    fn status(&self) -> VaultStatus {
        VaultStatus {
            path: self.path.display().to_string(),
            event_count: self.store.events().len(),
            intact: self.skipped_lines == 0,
        }
    }

    fn append(&mut self, mut event: PatientEvent) -> Result<PatientEvent, String> {
        // Reject duplicates before touching the file: a rejected append must
        // never leave a line behind in an append-only journal.
        if self
            .store
            .events()
            .iter()
            .any(|known| known.event_id == event.event_id)
        {
            return Err("duplicate_event_id".to_owned());
        }

        event.sequence = self.store.events().len() as u64;
        let line = serde_json::to_string(&event).map_err(|error| error.to_string())?;

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .map_err(|error| error.to_string())?;
        writeln!(file, "{line}").map_err(|error| error.to_string())?;
        file.sync_all().map_err(|error| error.to_string())?;

        // Only after the journal is durable does the in-memory projection move.
        self.store
            .append(event)
            .map(|stored| stored.clone())
            .map_err(|_| "duplicate_event_id".to_owned())
    }

    fn events(&self) -> Vec<PatientEvent> {
        self.store.events().to_vec()
    }
}

#[derive(Debug)]
pub struct VaultState {
    inner: Mutex<Vault>,
}

impl VaultState {
    pub fn load(path: PathBuf) -> Result<Self, String> {
        Ok(Self {
            inner: Mutex::new(Vault::load(path)?),
        })
    }
}

fn lock(state: &VaultState) -> Result<MutexGuard<'_, Vault>, String> {
    state
        .inner
        .lock()
        .map_err(|_| "vault_lock_poisoned".to_owned())
}

#[tauri::command]
pub fn vault_status(state: tauri::State<'_, VaultState>) -> Result<VaultStatus, String> {
    Ok(lock(&state)?.status())
}

#[tauri::command]
pub fn vault_append_event(
    state: tauri::State<'_, VaultState>,
    event: PatientEvent,
) -> Result<PatientEvent, String> {
    lock(&state)?.append(event)
}

#[tauri::command]
pub fn vault_list_events(state: tauri::State<'_, VaultState>) -> Result<Vec<PatientEvent>, String> {
    Ok(lock(&state)?.events())
}

/// Fail-closed by contract: every refusal reason reaches the UI as a code so
/// the screen can say *why* a trend was withheld instead of showing a number.
#[tauri::command]
pub fn vault_lab_trend(points: Vec<LabPoint>) -> Result<LabTrend, String> {
    calculate_lab_trend(&points).map_err(|error| {
        match error {
            TrendError::NoPoints => "no_points",
            TrendError::NonFiniteValue => "non_finite_value",
            TrendError::IncompatibleSeries => "incompatible_series",
            TrendError::UnverifiedInput => "unverified_input",
        }
        .to_owned()
    })
}

#[tauri::command]
pub fn vault_prioritized_review(items: Vec<ReviewItem>) -> Vec<ReviewItem> {
    prioritized_review(items)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(id: &str) -> PatientEvent {
        PatientEvent {
            sequence: 0,
            event_id: id.to_owned(),
            event_type: "document.imported".to_owned(),
            source_id: "SYN-LAB-2026-02".to_owned(),
            recorded_at: "2026-02-01T09:00:00Z".to_owned(),
        }
    }

    fn temp_path(name: &str) -> PathBuf {
        let mut directory = std::env::temp_dir();
        directory.push(format!("healthcouncil-vault-test-{name}"));
        let _ = fs::remove_dir_all(&directory);
        directory.push("events.jsonl");
        directory
    }

    #[test]
    fn appends_survive_a_reload() {
        let path = temp_path("reload");
        let mut vault = Vault::load(path.clone()).expect("vault loads");
        vault.append(event("evt-1")).expect("first append");
        vault.append(event("evt-2")).expect("second append");

        let reloaded = Vault::load(path).expect("vault reloads");
        let events = reloaded.events();
        assert_eq!(events.len(), 2);
        assert_eq!(events[0].event_id, "evt-1");
        assert_eq!(events[0].sequence, 0);
        assert_eq!(events[1].sequence, 1);
    }

    #[test]
    fn duplicate_event_id_is_rejected_without_writing() {
        let path = temp_path("duplicate");
        let mut vault = Vault::load(path.clone()).expect("vault loads");
        vault.append(event("evt-1")).expect("first append");
        assert_eq!(
            vault.append(event("evt-1")),
            Err("duplicate_event_id".to_owned())
        );

        let reloaded = Vault::load(path).expect("vault reloads");
        assert_eq!(reloaded.events().len(), 1);
    }

    #[test]
    fn a_corrupt_line_is_skipped_and_flagged() {
        let path = temp_path("corrupt");
        let mut vault = Vault::load(path.clone()).expect("vault loads");
        vault.append(event("evt-1")).expect("first append");
        let mut file = OpenOptions::new()
            .append(true)
            .open(&path)
            .expect("journal opens");
        writeln!(file, "not json at all").expect("corrupt line written");
        drop(file);

        let reloaded = Vault::load(path).expect("vault reloads");
        assert_eq!(reloaded.events().len(), 1);
        assert!(!reloaded.status().intact);
    }

    #[test]
    fn trend_refuses_unverified_input() {
        let points = vec![LabPoint {
            observation_id: "obs-1".to_owned(),
            concept_code: "LOINC:2276-4".to_owned(),
            unit: "ng/mL".to_owned(),
            specimen: "serum".to_owned(),
            trust_tier: clinical_core::TrustTier::Conflicted,
            day: 1,
            value: 18.0,
        }];
        assert_eq!(vault_lab_trend(points), Err("unverified_input".to_owned()));
    }
}
