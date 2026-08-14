# HealthCouncil Desktop — Master Plan v3.0

Status: authoritative project plan  
Product shape: one application, one repository, capability-gated delivery  
Initial platform: Windows 10/11  
Initial data policy: synthetic or irreversibly de-identified test data only

## 1. Product outcome

HealthCouncil Desktop is a local-first Windows application that:

1. imports Turkish health documents;
2. extracts and deduplicates clinical facts;
3. asks the user to review only the most important uncertain facts;
4. maintains an immutable patient event history and versioned patient state;
5. analyzes laboratory and medication changes with deterministic code;
6. performs a safety review before clinical reasoning;
7. asks adaptive follow-up questions;
8. retrieves licensed and traceable medical evidence;
9. escalates difficult cases to a structured multi-model council;
10. produces transparent disease estimates, must-not-miss risks, and clinician-ready reports;
11. captures outcomes and clinician feedback for evaluation.

The product must never present itself as an autonomous doctor or as a replacement for clinical care.

## 2. Decisions that are fixed

- One unified product and codebase; no separate “product one/product two.”
- Disease percentages remain, but estimate type and calibration status are mandatory.
- ChatGPT, Claude, Gemini, and other account cards remain in the UI.
- Unsupported consumer-subscription authentication remains visibly unavailable until an official provider flow exists.
- Official API keys, official OAuth, official CLI integration where explicitly permitted, and local endpoints are supported.
- No browser-cookie copying, session theft, or unofficial reverse-engineered login.
- No alternative-medicine module.
- No Reddit ingestion.
- No pirated books or license-unknown bulk corpus.
- The council is an escalation mechanism, not the default path for every question.
- Deterministic safety, lab, medication, and temporal engines run before model reasoning.
- Desktop storage uses SQLite-family local storage, not PostgreSQL/OpenSearch/Redis.

## 3. Intended-use gate

Before public clinical release, the team must complete a market-specific medical-device-software assessment. A disclaimer does not decide product classification; intended purpose and actual patient-specific behavior do.

The first controlled beta is limited to:

- adults aged 18 or older;
- non-pregnant users;
- the user's own records;
- Turkish documents;
- visit preparation and personal record interpretation;
- clinician-supervised validation.

Pediatric, pregnancy, emergency management, DICOM, VCF, and population-specific clinical claims stay disabled until separately validated.

## 4. Safety and quality system

Applicability must be assessed for:

- ISO 14971 risk management;
- IEC 62304 software lifecycle;
- IEC 62366-1 usability engineering;
- ISO 13485 quality management;
- IEC 81001-5-1 health software security;
- ISO/IEC 27001 information security.

The hazard log is a living artifact. Every high-severity hazard must map to an implemented control and a reproducible verification test.

## 5. End-to-end architecture

```text
DOCUMENTS / USER INPUT
        ↓
LOCAL EXTRACTION + OCR
        ↓
ENTITY RESOLUTION + DEDUPLICATION
        ↓
RISK-BASED HUMAN REVIEW
        ↓
VERIFIED PATIENT STATE
        ↓
PATIENT EVENT STORE + IMMUTABLE SNAPSHOT
        ↓
DETERMINISTIC LAB / MEDICATION / SAFETY / TEMPORAL ENGINES
        ↓
CASE STATE
        ↓
SAFETY GATE
        ↓
ADAPTIVE QUESTIONS
        ↓
HYPOTHESIS ENGINE
        ↓
TASK ROUTER
        ↓
DEEP RESEARCH + EVIDENCE STORE
        ↓
CITATION EXISTENCE + ENTAILMENT + LICENSE CHECK
        ↓
PATIENT KNOWLEDGE PACK
        ↓
MEASURED-DISAGREEMENT AUTO COUNCIL
        ↓
DIFFERENTIAL MATRIX + MUST-NOT-MISS + PROBABILITY ESTIMATES
        ↓
CLINICAL REPORT
        ↓
OUTCOME CAPTURE + DOCTOR COMPARE + EVAL DATASET
```

## 6. Patient data semantics

Every assertion has both a semantic class and a trust tier.

Semantic classes:

- `FACT`: directly supported by a source document or verified user entry.
- `DERIVED_FACT`: calculated by versioned deterministic code.
- `INFERENCE`: an AI interpretation.
- `HYPOTHESIS`: an unconfirmed possible explanation.

Trust tiers:

- `verified`
- `extracted_high`
- `extracted_low`
- `uncertain`
- `conflicted`

An AI model cannot create or mutate a `FACT` or `DERIVED_FACT`. It can propose an inference or hypothesis that points to supporting facts.

## 7. Review-budget policy

Uploading many documents must not create hundreds of mandatory clicks.

- First-session review target: at most about 20 items.
- Priority: clinical severity × extraction uncertainty × likely case use.
- Support safe batch confirmation for internally consistent reports.
- Defer low-value review until a case needs the fact.
- Stop sensitive calculation when a critical conflict remains unresolved.
- An unverified possible red flag may produce a conservative “verify now” warning, not a definitive clinical conclusion.

## 8. Canonical observations and provenance

One real-world observation can have many sources. A ferritin result repeated in a lab PDF, discharge note, and manual entry is one canonical observation with three provenance edges.

Canonical matching considers:

- patient;
- normalized concept code;
- specimen;
- value and unit;
- effective time and tolerance;
- laboratory or organization;
- source document.

Conflicting values are not silently merged. High-risk fuzzy matches require review.

Medication identity uses ingredient, strength, form, route, brand aliases, and time-bounded medication episodes. Condition identity uses coded and free-text concept mapping.

## 9. Event store and reproducibility

Clinical history is append-oriented. Example event types:

```text
DocumentImported
FactExtracted
FactVerified
ObservationRecorded
MedicationStarted
MedicationDoseChanged
SymptomStarted
DiagnosisReported
CaseOpened
SafetyFindingRaised
ReportGenerated
OutcomeRecorded
```

Every research/council run freezes a patient-state snapshot. Every report stores an Analysis Manifest containing:

- patient-state version and hash;
- case-state version;
- research snapshot;
- source IDs;
- policy, prompt, and schema versions;
- provider/model/settings;
- council topology;
- application version and timestamp.

## 10. Deterministic Lab Intelligence

Code, not an LLM, performs:

- unit normalization;
- lab-specific reference-interval handling;
- demographic/specimen context checks;
- absolute and percentage change;
- slope and trend;
- personal-baseline comparison;
- delta checks;
- versioned derived calculations.

Reported and derived values are never overwritten. A derived value records its formula version and inputs.

Reference Change Value support may be enabled only from a legally usable, reviewed dataset. License restrictions are a release dependency.

## 11. Medication Intelligence

- Turkish brand to ingredient mapping.
- Ingredient to ATC/RxNorm mapping where licensed and appropriate.
- Strength, form, route, start/end, indication, and adherence.
- Duplicate ingredient detection.
- Medication/symptom/lab temporal analysis.
- Drug-interaction claims only from a licensed and validated DDI source.
- A visible limitation statement when comprehensive DDI coverage is unavailable.

## 12. Temporal Engine

The engine answers structured questions such as:

- What changed after a medication started?
- What happened before a symptom began?
- Is this a new measurement or a duplicated report?
- What new data changes the previous case conclusion?

## 13. Case state machine

```text
NEW
→ DATA_COLLECTION
→ SAFETY_REVIEW
→ QUESTIONS_REQUIRED
→ READY_FOR_RESEARCH
→ RESEARCHING
→ EVIDENCE_READY
→ COUNCIL_RUNNING
→ NEEDS_MORE_INFO
→ REPORT_READY
→ FOLLOW_UP
→ CLOSED
```

Transitions have explicit guards, durable jobs, checkpoints, cancellation behavior, and recovery behavior.

## 14. Safety Engine and false reassurance

Clinician-reviewed versioned rules run before model reasoning. A model may add a concern but cannot suppress a deterministic safety finding.

The product treats false reassurance as a first-class hazard:

- benign-looking hypotheses and must-not-miss conditions share visual weight;
- a percentage never means that clinical care is unnecessary;
- case closure includes a clear visit-delay warning;
- outcome capture asks whether the application delayed care;
- every report has an unsafe/incorrect-result reporting action;
- severe false-reassurance findings block release progression.

## 15. Adaptive questions

Question selection uses safety priority, missing critical facts, hypothesis separation value, expected information gain, and user burden. Every question records why it was asked and which decision it can change.

## 16. Evidence pipeline

Approved sources include official health authorities, licensed guidelines, PubMed metadata, license-eligible PMC content, ClinicalTrials.gov, official medicine labels, and other reviewed APIs.

The pipeline performs:

1. question decomposition and query-tree construction;
2. metadata retrieval;
3. license and source-policy checks;
4. deduplication and quality ranking;
5. relevant-passage extraction;
6. claim creation;
7. citation existence verification;
8. claim-to-passage entailment verification;
9. freshness, correction, and retraction checks;
10. versioned Patient Knowledge Pack generation.

Models may cite only evidence-store source IDs. Fabricated DOI, PMID, or URL output is a release-blocking defect.

## 17. Provenance-first UX

Every important conclusion exposes “Why is this here?” and traces:

```text
Conclusion
→ Synthesis
→ Hypothesis
→ Patient fact
→ Evidence claim
→ Source passage
→ DOI / PMID / URL
```

## 18. Task and model routing

Task routing precedes model selection.

- OCR, PII detection, arithmetic, safety rules, and unit conversion: local/deterministic.
- Query generation and paper screening: low-cost model.
- Evidence synthesis and complex differential: strong model.
- Final judge: independent strong model.
- Simple health explanation: one model, no council.

Nimbalyst development orchestration:

- GPT-5.6 Luna for narrow implementation and repetitive work.
- GPT-5.6 Sol for architecture, hard logic, and critical review.
- Claude Code for independent architecture/clinical safety review.
- Gemini 3.7 Flash through Antigravity for high-volume scanning, UX alternatives, and cross-checking.

## 19. Auto Council

Auto Council starts with two independent provider families when available. Structured outputs are compared using:

- top-hypothesis overlap;
- must-not-miss differences;
- deterministic-safety contradictions;
- evidence-quality differences;
- next-step disagreement.

Measured disagreement triggers a third agent and adversarial disconfirmation. Persistent material disagreement may trigger rare-condition/missing-diagnosis escalation.

The default council is capped at three agents until evaluation proves additional agents add meaningful safety value. Custom mode may expose up to five with explicit cost and latency.

## 20. Disease percentages

Percentages stay but must carry an estimate type.

### Type A — AI research estimate

Visible as an uncalibrated model estimate with evidence strength, supporting facts, contradicting facts, missing information, and model agreement shown separately.

### Type B — limited deterministic Bayes

Runs only when a manually curated, versioned row set contains the full prevalence/LR chain for the relevant population. No LLM-extracted LR is accepted. Use at most three clinically reviewed, plausibly independent findings and show sensitivity to assumptions.

### Type C — outcome-calibrated estimate

Enabled only after sufficient clinician-confirmed outcomes and independent calibration evaluation.

Rules:

- model agreement is not disease probability;
- risk priority is separate from probability;
- probabilities are not forced to total 100%;
- “none/other” remains possible;
- low-probability must-not-miss conditions can rank high by risk;
- percentage hierarchy is secondary to condition, risk, evidence, and next action.

## 21. Treatment, nutrition, and simulation

These remain in the unified project but are feature-gated until the evidence and safety pipeline passes release gates.

- Treatment Intelligence compares evidence, contraindications, monitoring, and clinician questions. It does not prescribe, stop medication, or change dose.
- Nutrition is evidence-based and excludes alternative-medicine claims.
- What-if is explicitly counterfactual and cannot be presented as a diagnosis.

## 22. Outcome learning

Capture clinician diagnosis, ordered tests, treatment, symptom course, care delay, and unsafe-result feedback. Doctor Compare is framed as outcome analysis, never as “AI versus doctor.” Any cross-user evaluation dataset is separate, opt-in, and de-identified.

## 23. Provider connections and privacy preview

Connection modes:

```text
api_key
official_oauth
official_cli
local_endpoint
unavailable
```

ChatGPT subscription and OpenAI Platform API are separate surfaces. The same principle applies to other providers: do not assume a consumer subscription authorizes a third-party application.

Before any cloud request, a provider-specific field-level preview shows exactly what will be sent. Raw documents stay local by default. Direct identifiers and unrelated facts are excluded. Where supported, provider-side storage is disabled, but the UI must not overstate retention guarantees.

## 24. Privacy and security

- Local-first processing and encrypted local storage.
- Windows Credential Manager for provider secrets.
- DPAPI-wrapped master key plus mandatory exportable recovery key.
- Encrypted backups and tested restore drills.
- Identity and clinical data separation.
- No PHI in logs, crash reports, analytics, fixtures, or prompts by default.
- Prompt-injection isolation: document text is untrusted data, never system instruction.
- Authenticated local IPC using named pipes/stdio where practical; otherwise loopback random port and session token.
- Signed installer/updater, dependency audit, SBOM, audit events, export, and deletion.

## 25. Desktop architecture

- Tauri + React + TypeScript UI.
- Rust desktop/security/domain core.
- Python worker for OCR/NLP/research tasks.
- SQLite with migrations, FTS5, and local vector search.
- SQLite-backed durable job queue and checkpoints.
- No desktop PostgreSQL, Redis, Celery, or OpenSearch.
- Local OpenAI-compatible model endpoints supported.

## 26. Core screens

- Onboarding
- Health Inbox
- Documents
- Review Inbox
- Health Passport
- Timeline
- Labs
- Medications
- Cases and Chat
- Research
- Evidence
- Council
- Differential and Probabilities
- Treatment
- Nutrition
- Simulation
- Reports
- Outcomes and Doctor Compare
- Connections
- Privacy and Audit

## 27. Evaluation suites

Separate versioned golden sets:

- lab OCR;
- medication extraction;
- allergy extraction;
- timeline reconstruction;
- entity resolution;
- adaptive questions;
- evidence retrieval;
- citation existence;
- citation entailment;
- differential reasoning;
- red-flag safety;
- false reassurance;
- model regression;
- privacy leakage;
- crash recovery.

## 28. Release gates

1. Intended-use/regulatory gate.
2. Critical data extraction and deduplication gate.
3. Safety and false-reassurance gate.
4. Evidence/citation/license gate.
5. Probability-labeling and calibration gate.
6. Privacy/security/recovery gate.
7. Desktop reliability gate.
8. Model/prompt/policy/schema regression gate.

## 29. Latency and cost budgets

Initial engineering targets, not price promises:

| Mode | Target cost | Target latency |
|---|---:|---:|
| Quick | < $0.05 | < 20 s |
| Balanced | < $0.50 | < 2 min |
| Deep | < $3.00 | < 8 min |

Research progress, evidence cards, council stages, estimated cost, cancellation, and resume must stream to the UI.

## 30. Delivery roadmap

### Weeks 1–4 — product foundations

Intended use, target population, hazard log, data dictionary, trust policy, entity-resolution rules, source-license registry, architecture decisions, and evaluation plan.

### Weeks 5–8 — executable vertical slice

Windows app, PDF/image import, Turkish lab extraction contract, review flow, patient profile, timeline, lab trend, and clinician PDF/report preview.

### Weeks 9–14 — data and security foundation

Layout-aware OCR pipeline, canonical observations, review budget, encryption, recovery key, durable jobs, and prompt-injection defenses.

### Weeks 15–20 — longitudinal intelligence

Event store, snapshots, Health Inbox, lab and medication intelligence, temporal reasoning, and “what changed?”

### Weeks 21–26 — safe case workflow

Case state machine, deterministic safety, adaptive questions, simple chat, privacy preview, clinician summary, outcome capture, and hazard reporting.

### Weeks 27–30 — Closed Beta A

Same application with only validated archive/intelligence capabilities visible. Begin real-world extraction evaluation and outcome capture early.

### Weeks 31–38 — research/evidence

Source adapters, query tree, license enforcement, evidence store, citation verification, and provenance graph.

### Weeks 39–46 — hypotheses and council

Hypothesis engine, task/model router, structured agent outputs, measured disagreement, disconfirming agent, judge, and Analysis Manifest.

### Weeks 47–54 — probabilities and safety UX

Type A estimate, differential matrix, must-not-miss, “what would change my mind?”, agreement matrix, and false-reassurance evaluations.

### Weeks 55–62 — advanced modules

Limited Type B Bayes, licensed RCV if available, treatment, nutrition, what-if, Doctor Compare, and follow-up automation.

### Weeks 63–68 — providers and hardening

Official API/local integrations, conditional official account auth, model regression gates, security testing, installer, and signed updater.

### Weeks 69–76 — Closed Beta B

Enable validated research, council, percentage, and advanced report capabilities in the same application.

### Post-beta

Outcome-calibrated Type C, market-specific regulatory work, carefully validated scope expansion, DICOM/VCF, and institutional integrations.

## 31. Immediate implementation order

1. Persist project policies, architecture records, hazard log, and schemas.
2. Establish the monorepo, deterministic Rust core, React desktop UI, and tests.
3. Implement synthetic document-to-review-to-timeline vertical slice.
4. Add event store, canonical observations, lab trends, and report snapshot.
5. Add safety rules and case state machine before any clinical model output.
6. Add provider adapters only behind privacy preview and synthetic fixtures.

