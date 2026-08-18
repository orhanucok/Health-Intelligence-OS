#![forbid(unsafe_code)]

use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::BTreeSet;

pub const REVIEW_BUDGET: usize = 20;
pub const TREND_FORMULA_VERSION: &str = "lab-linear-v1";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SemanticClass {
    Fact,
    DerivedFact,
    Inference,
    Hypothesis,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TrustTier {
    Verified,
    ExtractedHigh,
    ExtractedLow,
    Uncertain,
    Conflicted,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProvenanceEdge {
    pub id: String,
    pub document_id: String,
    pub source_hash: String,
    pub page: u32,
    pub source_text: String,
    pub extractor_version: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CanonicalObservation {
    pub id: String,
    pub concept_code: String,
    pub value: f64,
    pub unit: String,
    pub effective_day: i64,
    pub specimen: String,
    pub semantic_class: SemanticClass,
    pub trust_tier: TrustTier,
    pub provenance: Vec<ProvenanceEdge>,
}

impl CanonicalObservation {
    pub fn can_project_to_verified_state(&self) -> bool {
        self.semantic_class == SemanticClass::Fact && self.trust_tier == TrustTier::Verified
    }

    pub fn attach_duplicate_source(
        &mut self,
        candidate: &CanonicalObservation,
    ) -> Result<(), CanonicalizationError> {
        if self.concept_code != candidate.concept_code
            || self.value != candidate.value
            || self.unit != candidate.unit
            || self.effective_day != candidate.effective_day
            || self.specimen != candidate.specimen
        {
            return Err(CanonicalizationError::ConflictRequiresReview);
        }
        let known: BTreeSet<_> = self.provenance.iter().map(|edge| edge.id.clone()).collect();
        self.provenance.extend(
            candidate
                .provenance
                .iter()
                .filter(|edge| !known.contains(&edge.id))
                .cloned(),
        );
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CanonicalizationError {
    ConflictRequiresReview,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewPriority {
    pub severity: f64,
    pub uncertainty: f64,
    pub case_relevance: f64,
}

impl ReviewPriority {
    pub fn score(self) -> f64 {
        self.severity.clamp(0.0, 1.0)
            * self.uncertainty.clamp(0.0, 1.0)
            * self.case_relevance.clamp(0.0, 1.0)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewItem {
    pub id: String,
    pub priority: ReviewPriority,
    pub critical_conflict: bool,
}

pub fn prioritized_review(mut items: Vec<ReviewItem>) -> Vec<ReviewItem> {
    items.sort_by(|left, right| {
        right
            .critical_conflict
            .cmp(&left.critical_conflict)
            .then_with(|| {
                right
                    .priority
                    .score()
                    .partial_cmp(&left.priority.score())
                    .unwrap_or(Ordering::Equal)
            })
            .then_with(|| left.id.cmp(&right.id))
    });
    items.truncate(REVIEW_BUDGET);
    items
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatientEvent {
    pub sequence: u64,
    pub event_id: String,
    pub event_type: String,
    pub source_id: String,
    pub recorded_at: String,
}

#[derive(Debug, Default)]
pub struct EventStore {
    events: Vec<PatientEvent>,
}

impl EventStore {
    pub fn append(&mut self, mut event: PatientEvent) -> Result<&PatientEvent, EventStoreError> {
        if self
            .events
            .iter()
            .any(|known| known.event_id == event.event_id)
        {
            return Err(EventStoreError::DuplicateEventId);
        }
        event.sequence = self.events.len() as u64;
        self.events.push(event);
        Ok(self.events.last().expect("event was appended"))
    }

    pub fn events(&self) -> &[PatientEvent] {
        &self.events
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EventStoreError {
    DuplicateEventId,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabPoint {
    pub observation_id: String,
    pub concept_code: String,
    pub unit: String,
    pub specimen: String,
    pub trust_tier: TrustTier,
    pub day: i64,
    pub value: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabTrend {
    pub formula_version: String,
    pub input_observation_ids: Vec<String>,
    pub baseline: f64,
    pub latest: f64,
    pub absolute_change: f64,
    pub percentage_change: Option<f64>,
    pub slope_per_day: Option<f64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TrendError {
    NoPoints,
    NonFiniteValue,
    IncompatibleSeries,
    UnverifiedInput,
}

pub fn calculate_lab_trend(points: &[LabPoint]) -> Result<LabTrend, TrendError> {
    if points.is_empty() {
        return Err(TrendError::NoPoints);
    }
    if points.iter().any(|point| !point.value.is_finite()) {
        return Err(TrendError::NonFiniteValue);
    }
    if points
        .iter()
        .any(|point| point.trust_tier != TrustTier::Verified)
    {
        return Err(TrendError::UnverifiedInput);
    }
    let series = &points[0];
    if points.iter().any(|point| {
        point.concept_code != series.concept_code
            || point.unit != series.unit
            || point.specimen != series.specimen
    }) {
        return Err(TrendError::IncompatibleSeries);
    }
    let mut ordered = points.to_vec();
    ordered.sort_by_key(|point| (point.day, point.observation_id.clone()));
    let first = &ordered[0];
    let last = &ordered[ordered.len() - 1];
    let absolute_change = last.value - first.value;
    let percentage_change = if first.value == 0.0 {
        None
    } else {
        Some(absolute_change / first.value * 100.0)
    };
    let elapsed = last.day - first.day;
    let slope_per_day = (elapsed != 0).then_some(absolute_change / elapsed as f64);
    Ok(LabTrend {
        formula_version: TREND_FORMULA_VERSION.to_owned(),
        input_observation_ids: ordered
            .iter()
            .map(|point| point.observation_id.clone())
            .collect(),
        baseline: first.value,
        latest: last.value,
        absolute_change,
        percentage_change,
        slope_per_day,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn provenance(id: &str) -> ProvenanceEdge {
        ProvenanceEdge {
            id: id.to_owned(),
            document_id: format!("doc-{id}"),
            source_hash: format!("sha256:{}", "a".repeat(64)),
            page: 1,
            source_text: "Sentetik Ferritin 18 ng/mL".to_owned(),
            extractor_version: "synthetic-worker/0.1.0".to_owned(),
        }
    }

    fn observation(value: f64, trust_tier: TrustTier) -> CanonicalObservation {
        CanonicalObservation {
            id: "obs-ferritin".to_owned(),
            concept_code: "LOINC:2276-4".to_owned(),
            value,
            unit: "ng/mL".to_owned(),
            effective_day: 20_000,
            specimen: "serum".to_owned(),
            semantic_class: SemanticClass::Fact,
            trust_tier,
            provenance: vec![provenance("one")],
        }
    }

    #[test]
    fn trust_policy_requires_verified_fact() {
        assert!(!observation(18.0, TrustTier::ExtractedHigh).can_project_to_verified_state());
        assert!(observation(18.0, TrustTier::Verified).can_project_to_verified_state());
        let mut inferred = observation(18.0, TrustTier::Verified);
        inferred.semantic_class = SemanticClass::Inference;
        assert!(!inferred.can_project_to_verified_state());
    }

    #[test]
    fn canonical_observations_keep_duplicate_provenance() {
        let mut canonical = observation(18.0, TrustTier::Verified);
        let mut duplicate = observation(18.0, TrustTier::ExtractedHigh);
        duplicate.provenance = vec![provenance("two")];
        canonical.attach_duplicate_source(&duplicate).unwrap();
        assert_eq!(canonical.provenance.len(), 2);
    }

    #[test]
    fn conflicting_observations_are_not_silently_merged() {
        let mut canonical = observation(18.0, TrustTier::Verified);
        let conflicting = observation(28.0, TrustTier::Conflicted);
        assert_eq!(
            canonical.attach_duplicate_source(&conflicting),
            Err(CanonicalizationError::ConflictRequiresReview)
        );
        assert_eq!(canonical.provenance.len(), 1);
    }

    #[test]
    fn review_priority_is_deterministic_and_capped() {
        let items = (0..27)
            .map(|index| ReviewItem {
                id: format!("review-{index:02}"),
                priority: ReviewPriority {
                    severity: (index + 1) as f64 / 27.0,
                    uncertainty: 1.0,
                    case_relevance: 1.0,
                },
                critical_conflict: false,
            })
            .collect();
        let ranked = prioritized_review(items);
        assert_eq!(ranked.len(), REVIEW_BUDGET);
        assert_eq!(ranked[0].id, "review-26");
    }

    #[test]
    fn critical_conflicts_are_never_pushed_out_of_the_review_budget() {
        let mut items: Vec<_> = (0..REVIEW_BUDGET)
            .map(|index| ReviewItem {
                id: format!("routine-{index:02}"),
                priority: ReviewPriority {
                    severity: 1.0,
                    uncertainty: 1.0,
                    case_relevance: 1.0,
                },
                critical_conflict: false,
            })
            .collect();
        items.push(ReviewItem {
            id: "critical-low-score".to_owned(),
            priority: ReviewPriority {
                severity: 0.0,
                uncertainty: 0.0,
                case_relevance: 0.0,
            },
            critical_conflict: true,
        });

        let ranked = prioritized_review(items);
        assert_eq!(ranked.len(), REVIEW_BUDGET);
        assert_eq!(ranked[0].id, "critical-low-score");
    }

    #[test]
    fn event_store_is_append_only_and_rejects_duplicate_ids() {
        let mut store = EventStore::default();
        let event = PatientEvent {
            sequence: 99,
            event_id: "evt-01".to_owned(),
            event_type: "DocumentImported".to_owned(),
            source_id: "doc-01".to_owned(),
            recorded_at: "2026-02-10T08:00:00+03:00".to_owned(),
        };
        assert_eq!(store.append(event.clone()).unwrap().sequence, 0);
        assert_eq!(store.append(event), Err(EventStoreError::DuplicateEventId));
        assert_eq!(store.events().len(), 1);
    }

    #[test]
    fn lab_trend_is_deterministic_and_preserves_inputs() {
        let points = vec![
            LabPoint {
                observation_id: "obs-new".to_owned(),
                concept_code: "LOINC:2276-4".to_owned(),
                unit: "ng/mL".to_owned(),
                specimen: "serum".to_owned(),
                trust_tier: TrustTier::Verified,
                day: 30,
                value: 30.0,
            },
            LabPoint {
                observation_id: "obs-old".to_owned(),
                concept_code: "LOINC:2276-4".to_owned(),
                unit: "ng/mL".to_owned(),
                specimen: "serum".to_owned(),
                trust_tier: TrustTier::Verified,
                day: 10,
                value: 20.0,
            },
        ];
        let trend = calculate_lab_trend(&points).unwrap();
        assert_eq!(trend.formula_version, "lab-linear-v1");
        assert_eq!(trend.input_observation_ids, ["obs-old", "obs-new"]);
        assert_eq!(trend.absolute_change, 10.0);
        assert_eq!(trend.percentage_change, Some(50.0));
        assert_eq!(trend.slope_per_day, Some(0.5));
        assert_eq!(points[0].value, 30.0);
    }

    #[test]
    fn lab_trend_fails_closed_for_unverified_or_incompatible_inputs() {
        let verified = LabPoint {
            observation_id: "obs-one".to_owned(),
            concept_code: "LOINC:2276-4".to_owned(),
            unit: "ng/mL".to_owned(),
            specimen: "serum".to_owned(),
            trust_tier: TrustTier::Verified,
            day: 10,
            value: 20.0,
        };
        let mut incompatible = verified.clone();
        incompatible.observation_id = "obs-two".to_owned();
        incompatible.unit = "ug/L".to_owned();
        assert_eq!(
            calculate_lab_trend(&[verified.clone(), incompatible]),
            Err(TrendError::IncompatibleSeries)
        );

        let mut unverified = verified.clone();
        unverified.trust_tier = TrustTier::Conflicted;
        assert_eq!(
            calculate_lab_trend(&[verified, unverified]),
            Err(TrendError::UnverifiedInput)
        );
    }
}
