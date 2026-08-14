# HealthCouncil Desktop

HealthCouncil Desktop is a Windows-first, local-first personal clinical intelligence workspace. It imports Turkish health documents, builds a versioned and reviewable patient state, analyzes longitudinal lab and medication data with deterministic engines, retrieves licensed medical evidence, and can escalate complex cases to a structured multi-model council.

This repository is not an autonomous doctor. Development uses synthetic data only. Diagnosis, treatment, medication, emergency, pregnancy, pediatric, and other high-risk behavior must remain behind the release gates documented in `docs/MASTER_PLAN.md`.

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

## Planned workspace

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

