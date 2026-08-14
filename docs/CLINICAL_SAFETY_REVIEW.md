# HealthCouncil Desktop — Clinical Safety Review v1.0

Status: independent clinical safety review, companion to `MASTER_PLAN.md`
Scope: assesses whether the planned system, as specified, is safe to progress toward
controlled beta. This is a review artifact, not a design spec — it constrains design.

## 1. Intended-use limits

The reviewed design is safe only within a bounded intended use. Any expansion below
requires a new review before release.

- Population: adults 18+, non-pregnant, reviewing their own records only.
- Language/geography: Turkish-language documents, initial Turkish care context.
- Purpose: visit preparation and personal record interpretation — not diagnosis,
  not triage, not emergency management.
- Mode: clinician-supervised validation during beta; not yet validated for
  unsupervised patient use.
- Explicitly out of scope until separately validated: pediatrics, pregnancy,
  emergency/acute presentations, DICOM/imaging, VCF/genomic data, and any
  population-specific clinical claim not covered by the above.
- A disclaimer is not a control. Intended-purpose enforcement must be technical
  (input gating, age/pregnancy screen, locale gating), not textual only.
- Every screen that presents a hypothesis, estimate, or report must be reachable
  only from within this bounded scope; there is no code path that lets an
  out-of-scope case (e.g., a pediatric record) reach council or probability output.

## 2. Trust tiers and evidentiary discipline

Four semantic classes (`FACT`, `DERIVED_FACT`, `INFERENCE`, `HYPOTHESIS`) and five
trust tiers (`verified`, `extracted_high`, `extracted_low`, `uncertain`, `conflicted`)
are the review's primary safety lever, because every downstream engine inherits them.

Review requirements:

- An AI model must never create or silently upgrade a `FACT` or `DERIVED_FACT`. This
  must be enforced at the data-write layer, not only by prompt instruction.
- `uncertain` and `conflicted` tiers must visibly propagate into any hypothesis or
  report that depends on them — a report cannot present a conclusion at higher
  confidence than its weakest required input.
- Fuzzy-matched canonical observations with high ambiguity (unit mismatch, cross-lab
  merge, low time-tolerance match) must route to human review rather than auto-merge.
- Trust-tier downgrade (e.g., `verified` → `conflicted` on new contradicting data)
  must be possible; trust tiers are not monotonic.

## 3. False-reassurance controls

False reassurance — the system implying safety when risk remains — is treated as the
single highest-priority hazard class, above raw diagnostic accuracy, because it can
delay care in a way the user cannot self-correct.

Required controls:

- Must-not-miss conditions render with equal or greater visual weight than
  benign-looking top hypotheses; layout must not let ranking-by-probability bury a
  dangerous low-probability condition.
- No percentage, model agreement score, or "no council disagreement" state may be
  interpretable as "you can skip care." This must be checked at copy-review and at
  UI-snapshot-test level, not left to prompt phrasing.
- Every case closure includes a non-suppressible visit-delay warning when any
  must-not-miss condition remains unresolved or any deterministic safety finding is
  open.
- Outcome capture must ask explicitly whether the application influenced a delay in
  seeking care, and this signal must feed the false-reassurance eval suite.
- Every report carries a one-step "report unsafe or incorrect result" action; reports
  from this action are triaged before generic feedback.
- A model may add a concern on top of a deterministic safety finding but can never
  remove, downgrade, or hide one.

## 4. Human oversight

- Deterministic safety, lab, medication, and temporal engines execute before any
  model reasoning step in every case-state path; there is no shortcut that lets a
  model output reach the user before the safety gate runs.
- The case state machine (`NEW … SAFETY_REVIEW … REPORT_READY`) does not permit a
  case to reach `REPORT_READY` while `SAFETY_REVIEW` findings are open.
- Review budget (~20 items/first session, severity × uncertainty × case-use priority)
  must not silently drop a high-severity item into "deferred" — sensitive
  calculations halt on unresolved critical conflicts rather than proceeding with a
  best guess.
- Clinician-reviewed, versioned rule sets govern the safety engine; rule changes are
  auditable and require sign-off, not ad hoc prompt edits.
- Beta requires clinician-supervised validation as a structural gate, not a
  recommendation — the product should not represent itself as validated for
  unsupervised use until that supervision period produces evidence otherwise.

## 5. Probability and estimate-type rules

- Every disease percentage must declare estimate type (A: AI research estimate,
  B: limited deterministic Bayes, C: outcome-calibrated) at the point of display —
  no bare percentage is permitted.
- Type A is explicitly uncalibrated and must show evidence strength, supporting and
  contradicting facts, missing information, and model agreement as separate,
  non-collapsed fields.
- Type B runs only against a manually curated, versioned prevalence/LR dataset for
  the relevant population; no LLM-extracted likelihood ratio is accepted as input.
  Capped at three clinically reviewed, plausibly independent findings, with
  assumption sensitivity shown.
- Type C requires sufficient clinician-confirmed outcomes plus independent
  calibration evaluation before it may be enabled; it cannot be turned on by
  configuration alone ahead of that evidence.
- Model agreement across council members is not, and must not be displayed as,
  disease probability. Risk priority (must-not-miss weighting) is a separate axis
  from probability and must not be collapsed into one score.
- Percentages are not forced to sum to 100%, and "none/other" remains a valid,
  visible outcome — forcing normalization would misstate genuine uncertainty.

## 6. Evidence and citation integrity

- Models may cite only evidence-store source IDs already verified through the
  pipeline (existence check, entailment check, license check). A fabricated DOI,
  PMID, or URL is a release-blocking defect, not a quality bug.
- Claim-to-passage entailment failures must block that claim from appearing in a
  report, not just lower its confidence label.
- Source licensing (PMC eligibility, guideline licensing, DDI source licensing) is a
  hazard-relevant control, not only a legal one — an unlicensed source cannot be
  silently substituted with lower-quality open content without a visible limitation
  statement.

## 7. Privacy as a safety control

Privacy failures are treated as safety hazards, not only compliance issues, because
leaked clinical data or prompt-injected document content can produce unsafe outputs
or expose the patient.

- Document text is untrusted data and must never be interpolated as system
  instruction; prompt-injection isolation must be tested with adversarial fixtures,
  not assumed from prompt structure.
- No PHI in logs, crash reports, analytics, fixtures, or default prompts.
- Before any cloud request, a field-level preview must show exactly what leaves the
  device; the UI must not overstate provider-side retention guarantees it cannot
  verify.
- DPAPI-wrapped master key with mandatory exportable recovery key, encrypted
  backups, and a tested restore drill are release-blocking, since an unrecoverable
  local store is itself a patient-safety failure (loss of longitudinal history).

## 8. Hazard log and required verification tests

Every high-severity hazard in the living hazard log must map to both an implemented
control and a reproducible automated test before it can be closed. Minimum test
classes this review requires before beta:

- Red-flag safety suite: known must-not-miss presentations must never be dropped by
  extraction, deduplication, or ranking.
- False-reassurance suite: adversarial cases designed to check whether UI layout or
  copy could be read as "no action needed" when a must-not-miss risk is open.
- Citation existence and entailment suites: fabricated or unsupported citations must
  be caught pre-release, not by end-user report.
- Privacy-leakage suite: PHI must not appear in logs, prompts, or cross-provider
  payloads under fuzzed and adversarial document inputs.
- Crash-recovery suite: an interrupted case, sync, or research run must resume
  without silently discarding a `FACT`, `DERIVED_FACT`, or safety finding.
- Trust-tier propagation tests: an `uncertain`/`conflicted` input must be traceable
  to a visibly downgraded confidence at every downstream surface it reaches.

## 9. Release blockers

The following are hard blockers on any release beyond internal/synthetic testing,
independent of feature completeness elsewhere:

1. Intended-use/regulatory classification assessment not completed for the target
   market.
2. Any path where a case reaches model reasoning before the deterministic safety
   gate.
3. Any severe false-reassurance finding open in the hazard log.
4. Any fabricated or unverified citation reachable in a generated report.
5. Any percentage displayed without estimate type (A/B/C) and required supporting
   fields.
6. Type C estimates enabled without the required outcome volume and calibration
   evaluation.
7. Recovery-key/backup restore drill not passing, or PHI found in logs/prompts/
   fixtures.
8. Out-of-scope populations (pediatric, pregnancy, emergency, DICOM/VCF) reachable
   through any UI or API path.
9. Council or probability surfaces enabled ahead of the corresponding roadmap gate
   (Section 28/30 of `MASTER_PLAN.md`) without an equivalent safety sign-off.

This review should be re-run whenever the safety engine rule set, trust-tier model,
council topology, or intended-use scope changes materially.
