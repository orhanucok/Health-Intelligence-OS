# HealthCouncil Desktop Architecture

Status: initial architecture baseline  
Scope: Windows 10/11, local-first, synthetic or irreversibly de-identified data only  
Source of truth: `docs/MASTER_PLAN.md`

## 1. Architectural goals

HealthCouncil Desktop is one application in one repository. It imports Turkish health documents, builds a reviewable longitudinal record, runs deterministic analysis before model reasoning, and produces reproducible clinician-facing outputs.

The system is clinical decision support, not an autonomous doctor. Uncertainty, provenance, safety findings, and the need for clinician review remain visible at every boundary.

## 2. Monorepo boundaries

```text
apps/
  desktop/          React + TypeScript UI hosted by Tauri
crates/
  app-core/         Rust use cases, policies, and orchestration
  clinical-domain/  Rust domain types, invariants, and deterministic engines
  persistence/      SQLite repositories, migrations, event store, and job queue
  ipc-contract/     Versioned commands, events, schemas, and error envelopes
  security/         Key handling, redaction, audit, export, and deletion controls
workers/
  python/           OCR, layout, NLP, retrieval, and model-task worker
packages/
  schemas/          Generated/shared JSON Schema fixtures and compatibility tests
  ui/               Reusable presentation components; no domain authority
tests/
  fixtures/         Synthetic/de-identified inputs only
  golden/           Versioned evaluation suites
  e2e/              Packaged-desktop and crash-recovery tests
docs/
  adr/              One immutable record per accepted architecture decision
```

Dependencies point inward: UI and adapters depend on contracts; application orchestration depends on the domain; persistence implements domain-owned interfaces. The domain never imports Tauri, React, Python, SQLite, or provider SDKs. Python packages do not read the database directly. Shared schemas are contracts, not a second domain model.

## 3. Runtime responsibilities

### Tauri and React

- Render screens, review queues, provenance, progress, cancellation, and privacy previews.
- Validate interaction shape for fast feedback, but treat Rust validation as authoritative.
- Invoke allowlisted Tauri commands and subscribe to typed application events.
- Never access SQLite, secrets, raw filesystem paths, or cloud providers directly.
- Never turn model text into a fact without a Rust-domain command and required review.

### Rust

- Own application lifecycle, filesystem capabilities, authentication of local IPC, and secret access through Windows Credential Manager.
- Own domain invariants, authorization, audit events, case transitions, trust-tier changes, canonicalization decisions, snapshots, and manifests.
- Run deterministic lab, medication, temporal, and safety logic before model reasoning.
- Own transactions spanning events, projections, job state, and outbox notifications.
- Apply migrations and expose repositories; no other process writes SQLite.

### Python worker

- Perform OCR, layout analysis, Turkish clinical NLP, retrieval, passage extraction, and explicitly routed model tasks.
- Accept bounded, versioned job payloads and return proposals with confidence, provenance, tool/model versions, and diagnostics.
- Treat document contents as untrusted data, never instructions.
- Remain stateless apart from disposable caches; durable state and retry truth live in Rust/SQLite.
- Cannot create `FACT`, create `DERIVED_FACT`, suppress safety findings, transition cases, or call providers outside an assigned job.

### SQLite

- Store append-oriented clinical events, canonical entities, provenance edges, projections, snapshots, cases, evidence metadata, manifests, audit events, and durable jobs.
- Use migrations, foreign keys, WAL mode, FTS5, and an approved local-vector extension or sidecar index whose entries can be rebuilt from SQLite.
- Encrypt storage and backups using the approved local key design; never store provider secrets.
- Replace desktop PostgreSQL, Redis, Celery, and OpenSearch.

## 4. Local IPC

The React webview talks only to Tauri commands/events in-process. Rust talks to the Python worker over an authenticated, length-framed protocol on Windows named pipes; stdio is acceptable for a strictly parent-owned worker. Loopback networking is a fallback only, using a random port and per-launch session token.

IPC envelopes include `protocol_version`, `request_id`, `job_id`, `message_type`, `payload`, and `deadline`. Payloads are schema-validated at both ends. Responses are size-limited and use typed error codes. Large artifacts are exchanged through capability-scoped temporary files with hashes, not embedded without bounds.

Rust spawns and supervises the worker, limits its capabilities, rejects unsolicited messages, supports cancellation and heartbeat timeouts, and records redacted diagnostics. IPC is never exposed to the LAN. PHI and direct identifiers are excluded unless strictly required for an approved local task.

## 5. Event store and projections

Clinical history is append-only. Each event contains an event ID, patient pseudonymous ID, aggregate ID, event type/version, occurred/effective/recorded times, actor, causation and correlation IDs, source reference, payload, and integrity metadata.

Events are never edited or deleted in place; corrections append compensating or superseding events. A single SQLite transaction appends events, advances the aggregate version with optimistic concurrency, updates projections, and enqueues outbox work. Projections such as timeline, review inbox, lab trends, and medication episodes are disposable and rebuildable.

Every research or council run freezes a versioned patient-state snapshot and hash. Every generated report references an Analysis Manifest containing state and case versions, source/evidence IDs, policy/prompt/schema versions, provider/model/settings, council topology, application version, and timestamp.

## 6. Canonical observations

A canonical observation represents one real-world measurement; source assertions attach through provenance edges. Identity considers patient, normalized concept, specimen, normalized value/unit, effective-time tolerance, organization/laboratory, and source document.

Ingestion follows: preserve source assertion -> normalize deterministically -> generate candidate matches -> apply exact safe matches -> queue high-risk or fuzzy matches for review -> append the canonicalization decision. Conflicting values are never silently merged. Undo is a new decision event.

Each assertion carries a semantic class (`FACT`, `DERIVED_FACT`, `INFERENCE`, or `HYPOTHESIS`) and trust tier (`verified`, `extracted_high`, `extracted_low`, `uncertain`, or `conflicted`). Models may propose only inferences or hypotheses. Deterministic derived facts record formula version and input observation IDs; reported values remain unchanged.

## 7. Durable jobs

SQLite is the job-system authority. A job records type/version, sanitized input reference, priority, state, attempts, lease owner/expiry, checkpoint, progress, cancellation request, output references, and structured failure.

Workers claim jobs through Rust using leases. Handlers are idempotent; retries use bounded backoff and never duplicate domain events. Long jobs checkpoint resumable stages. Cancellation is cooperative, durable, and visible to the UI. After a crash, expired leases return to the queue and completed outputs are reconciled by idempotency key.

Job classes include import, OCR/extraction, normalization, projection rebuild, deterministic analysis, research, provider call, council stage, evidence verification, and report rendering. Clinical safety work has explicit precedence and cannot be bypassed by a later model job.

## 8. Provider adapters

Provider integrations implement a Rust-owned interface for capability discovery, request preparation, execution, streaming, cancellation, usage, and normalized errors. Supported connection modes are `api_key`, `official_oauth`, `official_cli`, `local_endpoint`, and `unavailable`.

Every cloud request is created from an allowlisted task schema and stopped at a field-level privacy preview before transmission. User approval binds to the displayed payload hash, provider, purpose, and retention/settings summary. Direct identifiers, raw documents, and unrelated facts remain local by default.

Adapters use only official flows. Consumer subscriptions are not treated as API authorization; cookie copying and reverse-engineered login are prohibited. Secrets remain in Windows Credential Manager. Provider responses are untrusted proposals, schema-validated and provenance-tagged before domain use. Tests use fake adapters and synthetic fixtures.

## 9. Trust boundaries

1. **User and imported files -> local app:** PDFs, images, metadata, and document text are untrusted; enforce type, size, parser isolation, and prompt-injection controls.
2. **React webview -> privileged Rust core:** commands are allowlisted, authenticated by process context, schema-validated, and authorized against current state.
3. **Rust core -> Python worker:** the worker is less trusted, receives least-necessary data, cannot access secrets or durable storage, and returns proposals only.
4. **Local app -> cloud/provider:** explicit privacy preview and user approval precede egress; responses cannot override deterministic safety or facts.
5. **Application -> local persistence:** only Rust repositories write; encryption keys are separated from clinical data and recovery is tested.
6. **Identity -> clinical data:** identity mapping is separately protected; logs, analytics, crash reports, prompts, and fixtures contain no PHI by default.
7. **Build/update -> installed app:** releases require signed installers/updaters, dependency audit, SBOM, and reproducible verification evidence.

## 10. Architecture decisions (ADR index)

- **ADR-001:** One monorepo and one capability-gated desktop product; rejected separate product variants.
- **ADR-002:** Tauri + React UI with Rust as the privileged security and domain authority.
- **ADR-003:** Python is an isolated, replaceable task worker; rejected Python database ownership.
- **ADR-004:** SQLite-family local persistence with append-only events and durable jobs; rejected desktop server infrastructure.
- **ADR-005:** Named-pipe or parent-owned stdio IPC with versioned schemas; authenticated loopback is fallback only.
- **ADR-006:** Event sourcing for clinical changes plus rebuildable projections and immutable analysis snapshots.
- **ADR-007:** Canonical observations separate real-world identity from multiple source assertions and provenance.
- **ADR-008:** Deterministic safety/lab/medication/temporal engines precede and constrain model reasoning.
- **ADR-009:** Provider-neutral adapters, official authentication only, and payload-bound privacy preview before egress.
- **ADR-010:** Semantic class and trust tier are independent; models cannot create or mutate facts.
- **ADR-011:** Version every externally durable contract, rule set, formula, prompt, policy, and manifest component.
- **ADR-012:** Synthetic or irreversibly de-identified data only until regulatory, privacy, security, and clinical gates permit expansion.

Detailed ADR files must record context, decision, alternatives, consequences, owner, date, and verification impact. Accepted ADRs are superseded, not rewritten.

## 11. First vertical slice

Deliver one executable path using synthetic Turkish lab documents:

1. Import a PDF/image into a local case and append `DocumentImported`.
2. Run the Python extraction contract through a durable job; preserve raw assertions and append `FactExtracted` proposals.
3. Show a risk-ranked review inbox with provenance and safe batch confirmation.
4. Confirm or correct facts through Rust commands, producing `FactVerified` and canonical observation decisions.
5. Project the verified patient profile, timeline, and one normalized lab trend.
6. Freeze a patient snapshot and generate a clinician report preview with source traceability and manifest.
7. Demonstrate cancellation, restart recovery, projection rebuild, conflict review, and no-PHI logging.

Acceptance requires contract tests across Rust/Python, migration and replay tests, golden extraction fixtures, deterministic trend tests, packaged Windows end-to-end coverage, and proof that unverified/model output cannot become a fact.

## 12. Non-goals for the first slice

- Diagnosis, treatment recommendations, medication changes, emergency management, or autonomous clinical decisions.
- Cloud model calls, deep research, evidence synthesis, Auto Council, disease percentages, or adaptive clinical chat.
- Pediatric, pregnancy, DICOM, VCF, institutional, or multi-user workflows.
- Comprehensive medication interactions, RCV calculations, treatment, nutrition, simulation, or outcome calibration.
- Cross-device sync, shared server infrastructure, telemetry containing clinical data, or production-scale datasets.
- Unsupported account authentication, browser-session reuse, Reddit, pirated or license-unknown corpora, and alternative-medicine content.
- Perfect generalized OCR or automatic merging of ambiguous/conflicting observations.
