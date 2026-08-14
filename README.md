# HealthCouncil Desktop

HealthCouncil Desktop is a Windows-first, local-first personal clinical intelligence workspace under staged development. The current executable is a synthetic-data vertical slice for review queues, provenance, verified-state projection, immutable event concepts, and deterministic laboratory trend safeguards.

This repository is not an autonomous doctor. Development uses synthetic data only. Diagnosis, treatment, medication, emergency, pregnancy, pediatric, and other high-risk behavior must remain behind the release gates documented in `docs/MASTER_PLAN.md`.

## Current executable scope

Implemented and tested in `0.1.0`:

- React + Tauri unified Windows product shell covering the full Turkish HealthCouncil v3.0 information architecture;
- capped review queue where critical conflicts are always ranked first;
- provenance drawer with keyboard focus, Escape close, and focus restoration;
- Rust append-only event-store primitive, trust gate, conflict preservation, and fail-closed lab trends;
- local Python fixture extractor that rejects unknown fields, direct-identifier markers, unsupported locales/sources, and mismatched units;
- offline MSI and NSIS packaging with the WebView2 runtime included.

Not implemented in this slice: real document upload/OCR, persistent patient storage, provider/API connections, evidence retrieval, medication reasoning, multi-model council, diagnosis percentages, treatment advice, or emergency triage. UI actions that are not persisted are visibly labelled as simulations or disabled.

## Build and verify

```powershell
npm install
npm run setup:python
npm run verify
cd apps/desktop
..\..\node_modules\.bin\tauri.cmd build
```

Generated Windows packages are written under `target/release/bundle/` and are intentionally excluded from Git.

## Orchestration

The workspace is opened in Nimbalyst at:

```text
C:\Users\Ghost\Documents\Health-Intelligence-OS
```

The orchestration policy is in `AGENTS.md` and `.codex/agents/`:

- GPT-5.6 Luna: narrow, mechanical implementation work.
- GPT-5.6 Sol: architecture, complex implementation, and independent review.
- Claude Code: independent architecture and safety review.
- Gemini 3.7 Flash through Nimbalyst Antigravity: high-volume research and cross-checking.

## Workspace

```text
apps/desktop                 Tauri + React Windows application
crates/clinical-core         Deterministic clinical domain engine
services/clinical-worker     Local OCR/NLP/research worker
packages/contracts           JSON Schema and TypeScript contracts
packages/provider-adapters   Cloud and local model adapters
docs                         Product, safety, privacy, and architecture records
evals                        Synthetic golden sets and release-gate evaluations
```

See `docs/MASTER_PLAN.md` for the authoritative product and delivery plan.
