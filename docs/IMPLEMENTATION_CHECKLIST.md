# Health Intelligence OS — Implementation Checklist (Weeks 1–30)

This checklist turns the first 30 weeks of [`MASTER_PLAN.md`](MASTER_PLAN.md#30-delivery-roadmap) into dependency-ordered, reviewable work. All development and verification data must be synthetic or irreversibly de-identified. The product is clinician-supervised decision support, not an autonomous doctor.

## How to use this checklist

- Complete items top-to-bottom within each week; do not start a dependent item until its predecessor is accepted.
- Every item needs a passing command, an artifact or test result, and an owner review.
- Release-gate links refer to [`MASTER_PLAN.md` §28](MASTER_PLAN.md#28-release-gates): [G1 intended-use](MASTER_PLAN.md#28-release-gates), [G2 extraction/deduplication](MASTER_PLAN.md#28-release-gates), [G3 safety](MASTER_PLAN.md#28-release-gates), [G4 evidence](MASTER_PLAN.md#28-release-gates), [G5 probability](MASTER_PLAN.md#28-release-gates), [G6 privacy/security](MASTER_PLAN.md#28-release-gates), [G7 reliability](MASTER_PLAN.md#28-release-gates), [G8 regression](MASTER_PLAN.md#28-release-gates).
- Example commands assume PowerShell from the repository root; adapt only to the repository's actual scripts without introducing real patient data.

## Weeks 1–4 — Product foundations

### Week 1 — Scope and intended use

- [ ] Record intended use, adult/non-pregnant Turkish beta scope, clinician-supervision requirement, and disabled populations in an architecture record. **Accept:** reviewer signs the scope; emergency, pediatric, pregnancy, DICOM, and VCF behavior is explicitly disabled. **Command:** `Get-Content docs/architecture/intended-use.md` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Create a synthetic-data policy and fixture README. **Accept:** fixtures contain no names, IDs, addresses, phones, or full birth dates; policy rejects real patient files. **Command:** `rg -n "synthetic|de-identified|PHI|patient" docs tests` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Define the first release capability flags. **Accept:** unsupported modules cannot be reached through UI or API. **Command:** `npm test -- --runInBand` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 2 — Hazards and policies

- [ ] Seed the living hazard log, including false reassurance, unresolved conflicts, prompt injection, and care delay. **Accept:** each high-severity hazard has owner, control, and planned verification test. **Command:** `Get-Content docs/risk/hazard-log.md` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Define trust tiers and semantic classes in a versioned policy. **Accept:** models cannot create or mutate `FACT` or `DERIVED_FACT`; tests cover all tiers. **Command:** `cargo test trust_policy` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add a clinical-output wording policy. **Accept:** every warning states uncertainty and required human review; no treatment or diagnosis is presented as final. **Command:** `rg -n "autonomous doctor|definitive diagnosis|stop medication" docs src tests` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)

### Week 3 — Schemas and provenance

- [ ] Define schemas for documents, assertions, provenance edges, observations, review decisions, and patient profile. **Accept:** schemas validate valid synthetic fixtures and reject missing source/trust metadata. **Command:** `npm run schema:test` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Define stable IDs, timestamps, versions, and hash fields. **Accept:** repeated ingestion of the same synthetic source is deterministic. **Command:** `cargo test ids_and_hashes` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add an evidence/source-license registry schema, without importing content. **Accept:** each source record can express license status, provenance, freshness, and rejection reason. **Command:** `npm run schema:test -- source-registry` **Gates:** [G4](MASTER_PLAN.md#28-release-gates)

### Week 4 — Architecture and evaluation plan

- [ ] Record the Tauri/React/TypeScript, Rust, Python, SQLite, and durable-job boundaries. **Accept:** no PostgreSQL, Redis, Celery, or OpenSearch dependency is introduced. **Command:** `rg -n "postgres|redis|celery|opensearch" package.json Cargo.toml pyproject.toml src` **Gates:** [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Create evaluation-suite manifests for OCR, extraction, deduplication, timeline, privacy, safety, recovery, and regression. **Accept:** every suite has synthetic input, expected output, and version. **Command:** `npm run eval:validate` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Approve the dependency map for the next 26 weeks. **Accept:** each later item links to an accepted artifact or test from this checklist. **Command:** `npm run docs:check` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

## Weeks 5–8 — Executable vertical slice

### Week 5 — Windows shell and local storage

- [ ] Bootstrap the Windows Tauri shell and React route shell. **Accept:** app starts offline and displays only enabled synthetic-data screens. **Command:** `npm run build && cargo test` **Gates:** [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add SQLite migrations for documents, assertions, review items, and profiles. **Accept:** clean install and migration upgrade both pass on a temporary test database. **Command:** `npm run db:migrate:test` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add a synthetic fixture loader. **Accept:** loader refuses files marked as real or containing direct-identifier fields. **Command:** `npm run fixtures:check` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)

### Week 6 — Import and extraction contract

- [ ] Implement PDF/image import with local file metadata and immutable source hash. **Accept:** supported synthetic PDF and image fixtures import; unsupported types fail safely. **Command:** `npm run test:import` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Define the Turkish lab extraction contract for analyte, value, unit, reference interval, specimen, and effective time. **Accept:** contract tests reject incomplete or ambiguous values. **Command:** `pytest -q tests/extraction_contract` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Persist extraction provenance and uncertainty. **Accept:** every extracted assertion points to source coordinates and a trust tier. **Command:** `cargo test extraction_provenance` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 7 — Review and patient profile

- [ ] Build risk-ranked review inbox with synthetic assertions. **Accept:** critical uncertainty is first; low-value items are deferrable; target is at most about 20 first-session items. **Command:** `npm run test:review-budget` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Implement verify, reject, edit, and conflict states. **Accept:** each action is auditable and cannot silently merge conflicting values. **Command:** `cargo test review_state` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Add the synthetic patient profile and Health Inbox shell. **Accept:** only verified or clearly labeled uncertain facts appear; no diagnosis is inferred. **Command:** `npm run test:profile-ui` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)

### Week 8 — Timeline and report preview

- [ ] Build the initial timeline from verified synthetic facts. **Accept:** dates, source links, and uncertainty are visible and stable after reload. **Command:** `npm run test:timeline` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add deterministic lab trend calculations with formula/version/input provenance. **Accept:** reported values remain unchanged and derived values are reproducible. **Command:** `cargo test lab_trend` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Render a clinician PDF/report preview from a frozen synthetic snapshot. **Accept:** report labels uncertainty, cites source facts, and includes human-review language. **Command:** `npm run report:verify` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

## Weeks 9–14 — Data and security foundation

### Week 9 — Layout-aware OCR

- [ ] Add layout blocks, tables, coordinates, and OCR confidence to the extraction pipeline. **Accept:** Turkish synthetic lab fixtures retain reading order and coordinate provenance. **Command:** `pytest -q tests/ocr_layout` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Add OCR confidence thresholds and manual-review fallback. **Accept:** low-confidence critical fields cannot become verified automatically. **Command:** `cargo test ocr_thresholds` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add OCR golden-set regression. **Accept:** baseline metrics and approved error cases are versioned. **Command:** `npm run eval:ocr` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 10 — Canonical observations

- [ ] Implement canonical observation keys and provenance edges. **Accept:** repeated synthetic ferritin reports resolve to one observation with multiple sources. **Command:** `cargo test canonical_observations` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Implement conflict preservation and high-risk fuzzy-match review. **Accept:** conflicting values remain separate and block sensitive calculations. **Command:** `npm run test:dedup-conflicts` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add entity-resolution golden cases for analytes, units, and organizations. **Accept:** expected matches/non-matches are reproducible on synthetic fixtures. **Command:** `npm run eval:entity-resolution` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 11 — Review budget and calculation stops

- [ ] Implement severity × uncertainty × case-use prioritization. **Accept:** ranking is deterministic and explains each item's priority. **Command:** `cargo test review_priority` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add safe batch confirmation for internally consistent synthetic reports. **Accept:** batch confirmation records the rule and leaves conflicts unconfirmed. **Command:** `npm run test:batch-review` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Enforce unresolved-critical-conflict calculation stop. **Accept:** UI shows “verify now” and produces no definitive conclusion. **Command:** `cargo test critical_conflict_stop` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)

### Week 12 — Encryption and secrets

- [ ] Encrypt local clinical storage and backups using the approved key design. **Accept:** a database opened without the key is unreadable; synthetic round-trip succeeds. **Command:** `cargo test encryption_roundtrip` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Store provider secrets through Windows Credential Manager/DPAPI boundary. **Accept:** secrets are absent from source, fixtures, logs, and plain SQLite fields. **Command:** `rg -n "api[_-]?key|secret|token" src tests docs` **Gates:** [G6](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Generate and validate a mandatory exportable recovery key flow. **Accept:** recovery restores a synthetic database and wrong keys fail closed. **Command:** `npm run test:recovery-key` **Gates:** [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 13 — Durable jobs and recovery

- [ ] Add SQLite-backed durable jobs with checkpoints, cancellation, retry, and resume. **Accept:** interrupted synthetic import resumes without duplicate events. **Command:** `cargo test durable_jobs` **Gates:** [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add crash-recovery integration tests. **Accept:** restart preserves job state and never reports a partial report as complete. **Command:** `npm run test:crash-recovery` **Gates:** [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Stream progress, cancellation, and estimated cost placeholders without real provider calls. **Accept:** UI remains usable during a synthetic long job. **Command:** `npm run test:job-progress` **Gates:** [G7](MASTER_PLAN.md#28-release-gates)

### Week 14 — Prompt-injection and privacy defenses

- [ ] Mark imported document text as untrusted data at every model boundary. **Accept:** synthetic prompt-injection fixtures cannot alter system policy or tool permissions. **Command:** `pytest -q tests/prompt_injection` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Add log/crash/analytics redaction tests. **Accept:** no direct identifiers or raw document text appear in generated telemetry. **Command:** `npm run test:privacy-redaction` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Complete the data/security foundation review. **Accept:** hazard controls, recovery drill, and regression results are attached to the release record. **Command:** `npm run release:check -- foundation` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

## Weeks 15–20 — Longitudinal intelligence

### Week 15 — Event store

- [ ] Implement append-oriented clinical event types from the master plan. **Accept:** events are immutable, ordered, versioned, and linked to source/snapshot IDs. **Command:** `cargo test event_store` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add event replay to reconstruct synthetic patient state. **Accept:** replayed state equals the expected fixture state byte-for-byte. **Command:** `cargo test event_replay` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Add audit events for review and report actions. **Accept:** actor, timestamp, action, and object version are queryable. **Command:** `npm run test:audit-events` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)

### Week 16 — Snapshots and manifests

- [ ] Freeze immutable patient-state snapshots for each case run. **Accept:** later edits do not change an existing synthetic snapshot hash. **Command:** `cargo test patient_snapshots` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add case-state versioning and snapshot references. **Accept:** every state transition records the preceding and resulting versions. **Command:** `cargo test case_versions` **Gates:** [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Implement the Analysis Manifest schema, even before research providers exist. **Accept:** manifest captures policy, prompt, schema, app versions and synthetic timestamp. **Command:** `npm run schema:test -- analysis-manifest` **Gates:** [G4](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 17 — Medication intelligence

- [ ] Define Turkish brand-to-ingredient normalization with licensed-source placeholders only. **Accept:** synthetic aliases resolve to ingredient/strength/form/route; unknowns remain uncertain. **Command:** `pytest -q tests/medication_identity` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G4](MASTER_PLAN.md#28-release-gates)
- [ ] Detect duplicate ingredients and time-bounded medication episodes. **Accept:** overlapping synthetic episodes are surfaced with provenance and no automatic treatment instruction. **Command:** `cargo test medication_episodes` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add medication golden-set evaluation. **Accept:** extraction, identity, and temporal cases have versioned pass/fail results. **Command:** `npm run eval:medications` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 18 — Lab intelligence

- [ ] Implement unit normalization and lab-specific reference intervals. **Accept:** derived values retain formula version, inputs, specimen, and lab context. **Command:** `cargo test lab_normalization` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Implement absolute/percentage change, slope, baseline, and delta checks. **Accept:** calculations match hand-checked synthetic fixtures and never overwrite reported values. **Command:** `cargo test lab_calculations` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Gate Reference Change Value behind reviewed/licensed data. **Accept:** unavailable or unreviewed data disables the feature visibly. **Command:** `npm run test:rcv-gate` **Gates:** [G4](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)

### Week 19 — Health Inbox and temporal reasoning

- [ ] Build Health Inbox cards for new, changed, conflicting, and review-needed facts. **Accept:** cards link to source, event, and required user action. **Command:** `npm run test:health-inbox` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Implement structured temporal queries: before, after, new, duplicate, and changed-conclusion inputs. **Accept:** synthetic queries return explainable event IDs, not free-form guesses. **Command:** `cargo test temporal_engine` **Gates:** [G2](MASTER_PLAN.md#28-release-gates)
- [ ] Add “what changed?” report section. **Accept:** section distinguishes observed change from interpretation and shows uncertainty. **Command:** `npm run report:verify -- what-changed` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 20 — Longitudinal integration gate

- [ ] Connect event store, snapshots, labs, medications, temporal engine, and report preview. **Accept:** one synthetic case completes end-to-end with reproducible manifest. **Command:** `npm run e2e -- longitudinal-synthetic` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Add longitudinal privacy and conflict regression suite. **Accept:** no hidden merge, calculation, or data leak occurs in adversarial synthetic fixtures. **Command:** `npm run eval:longitudinal` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Obtain architecture-owner acceptance for the first longitudinal slice. **Accept:** all Week 15–19 checkboxes and hazard controls are linked in the release record. **Command:** `npm run release:check -- longitudinal` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

## Weeks 21–26 — Safe case workflow

### Week 21 — Case state machine

- [ ] Implement the documented case states and guarded transitions. **Accept:** invalid transitions fail closed and every transition is durable. **Command:** `cargo test case_state_machine` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add checkpoint, cancellation, retry, and recovery behavior per transition. **Accept:** synthetic interruption resumes at the last safe checkpoint. **Command:** `npm run test:case-recovery` **Gates:** [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Keep research/council states unavailable until their later release gates pass. **Accept:** capability flags prevent premature entry. **Command:** `npm run test:capability-gates` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G4](MASTER_PLAN.md#28-release-gates)

### Week 22 — Deterministic safety engine

- [ ] Implement clinician-reviewed, versioned synthetic red-flag rules before reasoning. **Accept:** rule outputs include rule version, evidence inputs, urgency wording, and human-review requirement. **Command:** `cargo test safety_rules` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Prevent model/UI layers from suppressing deterministic findings. **Accept:** suppression attempts in synthetic fixtures fail tests. **Command:** `pytest -q tests/safety_non_suppression` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Add false-reassurance hazard tests. **Accept:** benign-looking synthetic cases retain must-not-miss visibility and visit-delay warning. **Command:** `npm run eval:false-reassurance` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)

### Week 23 — Adaptive questions

- [ ] Define question schema with safety priority, missing fact, separation value, and burden. **Accept:** every question records why it was asked and which decision can change. **Command:** `npm run schema:test -- questions` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Implement deterministic question ranking on synthetic cases. **Accept:** safety-critical missing facts outrank convenience questions. **Command:** `cargo test adaptive_questions` **Gates:** [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add answer provenance and case re-evaluation. **Accept:** new synthetic answers create events and can move a case only through guarded transitions. **Command:** `npm run test:question-answer-flow` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 24 — Simple chat and privacy preview

- [ ] Add simple, non-council chat over verified synthetic facts only. **Accept:** responses distinguish facts, inferences, and hypotheses and never issue autonomous treatment decisions. **Command:** `npm run test:simple-chat` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Implement provider-specific field-level privacy preview before any cloud-request boundary. **Accept:** preview lists exact synthetic fields, exclusions, destination, and retention setting. **Command:** `npm run test:privacy-preview` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Block unsupported provider authentication modes visibly. **Accept:** no cookie copying, session theft, or unofficial login path exists in code or UI. **Command:** `rg -n "cookie|session theft|reverse.engineer|consumer subscription" src docs tests` **Gates:** [G6](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

### Week 25 — Clinician summary and outcomes

- [ ] Generate a clinician-ready synthetic summary with provenance, uncertainty, safety findings, and open questions. **Accept:** summary is clearly not a diagnosis or prescription and is reproducible from a snapshot. **Command:** `npm run report:verify -- clinician-summary` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Add outcome capture for diagnosis, tests, treatment, symptoms, care delay, and unsafe-result feedback. **Accept:** fields are optional, auditable, and do not claim “AI versus doctor.” **Command:** `npm run test:outcomes` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Add unsafe/incorrect-result reporting action to every report. **Accept:** report action creates a durable hazard-linked event using synthetic data. **Command:** `cargo test unsafe_result_reporting` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 26 — Safe workflow gate

- [ ] Run the complete synthetic case workflow from import through summary and outcome capture. **Accept:** safety review precedes any model-facing step; all outputs are traceable. **Command:** `npm run e2e -- safe-case-synthetic` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Run privacy, recovery, prompt-injection, and false-reassurance regressions together. **Accept:** zero release-blocking failures; results are archived by version. **Command:** `npm run release:check -- safe-workflow` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Obtain clinician-safety review for Closed Beta A scope. **Accept:** reviewer confirms only validated archive/intelligence capabilities are enabled. **Command:** `npm run capability:export -- beta-a` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)

## Weeks 27–30 — Closed Beta A

### Week 27 — Beta packaging and scope lock

- [ ] Produce a Windows beta build with capability flags locked to validated archive/intelligence features. **Accept:** disabled research, council, probability, and advanced modules are unreachable. **Command:** `npm run build:beta-a` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Add onboarding consent, scope, limitation, and clinician-supervision copy. **Accept:** user must acknowledge scope before importing a synthetic record. **Command:** `npm run test:onboarding` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates)
- [ ] Verify installer, migration, encrypted backup, and recovery-key flows. **Accept:** clean install/upgrade/restore passes on a disposable synthetic profile. **Command:** `npm run beta:install-recovery` **Gates:** [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)

### Week 28 — Evaluation harness and archive validation

- [ ] Run real-world-shaped but synthetic/irreversibly de-identified Turkish extraction cases. **Accept:** every error is categorized, reproducible, and routed to review; no patient-identifying fixture is accepted. **Command:** `npm run eval:beta-a-extraction` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Validate archive, timeline, lab, medication, and report outputs against golden results. **Accept:** baseline results are signed and no unreviewed metric is presented as clinical performance. **Command:** `npm run eval:beta-a-intelligence` **Gates:** [G2](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Record usability issues without collecting raw health content. **Accept:** feedback schema stores synthetic case IDs and redacted interaction metadata only. **Command:** `npm run test:feedback-redaction` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)

### Week 29 — Reliability and safety rehearsal

- [ ] Execute crash, cancellation, backup-restore, and offline-mode drills. **Accept:** no data loss, duplicate event, false completion, or unsafe state transition occurs. **Command:** `npm run eval:beta-a-reliability` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates)
- [ ] Re-run safety, false-reassurance, prompt-injection, and privacy leakage suites. **Accept:** all high-severity hazards have passing control tests or block release. **Command:** `npm run eval:beta-a-safety` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Review all beta artifacts, manifests, logs, and reports for synthetic-only compliance. **Accept:** no direct identifier or real patient data is present in the release bundle. **Command:** `npm run compliance:synthetic-only` **Gates:** [G6](MASTER_PLAN.md#28-release-gates)

### Week 30 — Closed Beta A release gate

- [ ] Assemble the beta release dossier: intended use, hazard log, test results, known limitations, rollback plan, and capability manifest. **Accept:** every enabled capability maps to an accepted checklist item and release gate. **Command:** `npm run release:dossier -- beta-a` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)
- [ ] Obtain independent clinical-safety and engineering sign-off. **Accept:** unresolved high-severity hazards, privacy failures, and critical extraction defects block promotion. **Command:** `npm run release:signoff -- beta-a` **Gates:** [G1](MASTER_PLAN.md#28-release-gates), [G2](MASTER_PLAN.md#28-release-gates), [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates)
- [ ] Publish the Closed Beta A build and start early extraction/outcome capture with synthetic or irreversibly de-identified data only. **Accept:** post-release monitoring, unsafe-result reporting, rollback, and data-deletion procedures are tested and linked. **Command:** `npm run release:verify -- beta-a` **Gates:** [G3](MASTER_PLAN.md#28-release-gates), [G6](MASTER_PLAN.md#28-release-gates), [G7](MASTER_PLAN.md#28-release-gates), [G8](MASTER_PLAN.md#28-release-gates)

