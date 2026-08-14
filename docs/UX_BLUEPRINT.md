# HealthCouncil Desktop — UX & Information Architecture Blueprint v1.0

Status: authoritative UX blueprint  
Target: Windows 10/11 (Tauri + React)  
Design targets: IEC 62366-1 applicability review and WCAG 2.1 AA accessibility; conformance is not claimed until independently verified.

## 1. Windows Information Architecture & Layout Shell

HealthCouncil Desktop uses a 3-pane responsive desktop shell optimized for 1280×800 to 4K displays:
- **Top Window Bar**: Custom drag region, profile switcher, offline/privacy status indicator, system notifications, minimize/maximize/close.
- **Left Navigation Rail (Collapsible / 64px–240px)**:
  - *Inbox & Intake*: Health Inbox (with unreviewed badges), Documents Import (`Ctrl+O`).
  - *Records & History*: Health Passport, Timeline (`Ctrl+T`), Labs & Trends (`Ctrl+L`), Medications.
  - *Clinical Reasoning*: Cases & Consultations (`Ctrl+N`), Research & Evidence, Council (`Ctrl+K`), Differential.
  - *Synthesis & Output*: Reports (`Ctrl+P`), Doctor Compare & Outcomes.
  - *System & Trust*: Connections & Models, Privacy & Audit Log, Settings (`Ctrl+,`).
- **Main Workspace (Center Canvas)**: Contextual active view, split-pane support (e.g., PDF viewer alongside fact review or timeline).
- **Inspector / Provenance Drawer (Right Pane / 360px–480px, toggled via `Ctrl+I`)**: Contextual metadata, "Why is this here?" deep provenance graph, audit timestamps, and citation entailment inspector.

## 2. End-to-End Synthetic Workflow: Document-to-Report

### Step 1: Health Inbox & Synthetic Document Ingestion
- **Dropzone & Scan**: Drag-and-drop Turkish lab reports, epikriz (discharge), prescriptions, or synthetic test suites.
- **Immediate Local Triage**: Local OCR and PII parser isolate direct identifiers; deterministic safety pre-check scans for immediate panic values.
- **Triage Card**: Displays document type, extraction confidence, file hash, and queues items into the Review Inbox.

### Step 2: Risk-Based Review Inbox & Review Budget
- **Budget Enforcement**: Hard cap of $\le 20$ review prompts per session to eliminate user cognitive fatigue.
- **Priority Scoring**: Ranked by `Clinical Severity × Extraction Uncertainty × Case Relevance`.
- **Review Card**: Side-by-side snippet preview (highlighted PDF box vs extracted field). Actions: *Confirm*, *Edit Value*, *Reject*, or *Safe Batch Confirm* (for internally consistent standard panels).
- **Conflict Handling**: Unresolved conflicting observations block sensitive downstream calculations and show a clear amber flag.

### Step 3: Longitudinal Timeline & Canonical Observations
- **Unified Event History**: Append-only chronological stream of observations, medication episodes, and symptom onsets.
- **Canonical Merging**: Multi-source matching (e.g. lab PDF + discharge note) creates one observation with multiple provenance edges.
- **Delta & Baseline Alerts**: Deterministic lab engine flags significant shifts (slope, absolute change, personal baseline deviation) without LLM guesswork.

### Step 4: Case Initiation & Safety Gate
- **Complaint Intake**: Structured onset, chief symptom, and timeline linking.
- **Pre-Model Safety Gate**: Deterministic rules evaluate red flags (e.g., chest pain + dyspnea) before invoking any AI. Emergency guidance renders prominently.
- **Adaptive Questions**: 1–3 high-value questions targeted at separating top hypotheses. Each question displays: *"Why is this asked?"* and *"Decision impact"*.

### Step 5: Privacy Preview & Outbound Dispatch
- **Pre-Flight Modal**: Explicit field-level diff showing exact tokenized payload before any cloud model call.
- **Data Redaction**: Direct identifiers removed; raw PDFs stay local. Zero data retention request toggled.
- **Provider Status**: Visual badges show connection type (`api_key`, `official_oauth`, `local_endpoint`, `unavailable`).

### Step 6: Auto Council & Measured Disagreement Progress
- **Mode Selector**: Quick (<20s, ~$0.05), Balanced (<2m, ~$0.50), Deep (<8m, ~$3.00) with live cost/latency counters.
- **Live Progress Stage Stepper**:
  1. *Local Prep*: Snapshot hash frozen.
  2. *Evidence Retrieval*: PubMed / guideline queries and citation checks.
  3. *Council Deliberation*: Streaming cards for Agent A (e.g. GPT-5.6) and Agent B (e.g. Claude Code).
  4. *Disagreement Detector*: Computes hypothesis overlap. Disagreement triggers Agent C (Adversarial Judge).
- **Controls**: Pause, Cancel (rolls back cleanly), or Resume from durable SQLite checkpoint.

### Step 7: Differential Matrix & Calibrated Probabilities
- **Probability Hierarchy**: Risk priority and must-not-miss conditions always display above percentage estimates.
- **Labeling Standard**:
  - `Type A`: AI Research Estimate (Uncalibrated; requires evidence strength & model agreement split).
  - `Type B`: Limited Deterministic Bayes (Prevalence/LR chain with sensitivity intervals).
  - `Type C`: Outcome-Calibrated (Beta-gated; clinician validated).
- **Anti-False Reassurance**: Unforced sums (probabilities do not sum to 100%; "Other/Unknown" always explicit). Clear banner: *"Estimates do not eliminate need for physical clinical evaluation."*

### Step 8: Clinician-Ready Report & Analysis Manifest
- **Export Formats**: Clinician Summary PDF (1-page dense), Comprehensive Patient Dossier, JSON Manifest.
- **Analysis Manifest Stamp**: Cryptographic hash of patient snapshot, case state, prompt versions, model IDs, and retrieval timestamps.

## 3. Trust Labels & Semantic Classification

Every UI tag, card, and observation badge renders strict semantic and trust tokens:

| Semantic Class | UI Badge Style | Definition & Constraints |
|---|---|---|
| `FACT` | Solid Slate Badge | Directly from source document or patient confirmation. Immutable by AI. |
| `DERIVED_FACT` | Solid Cyan Badge | Calculated by versioned deterministic code (e.g., eGFR, delta change). |
| `INFERENCE` | Outlined Indigo | AI synthesis from verified facts. Always links to supporting citations. |
| `HYPOTHESIS` | Dashed Violet | Proposed differential condition subject to testing. |

| Trust Tier | UI Icon / Color | Meaning |
|---|---|---|
| `verified` | Green Checkmark | Confirmed by user or clinician review. |
| `extracted_high` | Blue Shield | High-confidence deterministic/OCR extraction. |
| `extracted_low` | Yellow Warning Triangle | Low extraction confidence; queued for review budget. |
| `uncertain` | Amber Question Mark | Incomplete or ambiguous data. |
| `conflicted` | Red Crossed Shields | Discrepant values across documents; requires explicit resolution. |

## 4. Deep Provenance: "Why Is This Here?" Drawer

Clicking any differential item, lab alert, or hypothesis opens the Provenance Drawer displaying the complete 6-level audit chain:
1. **Conclusion**: The specific finding or recommendation shown on screen.
2. **Synthesis**: Council consensus or single-model summary statement.
3. **Hypothesis**: The underlying clinical rationale.
4. **Patient Fact**: Pointers to canonical observations and timeline timestamps.
5. **Evidence Claim**: Extracted claim with entailment verification score.
6. **Source Passage**: Exact licensed text snippet with active DOI / PMID / URL link.

## 5. Must-Not-Miss Safety System

- **Visual Weight**: Must-Not-Miss (MNM) lethal/critical conditions (e.g., pulmonary embolism, aortic dissection) are pinned to the top of the differential regardless of low statistical probability.
- **Exploration Triggers**: Red-tinted warning card detailing *"What would rule this out?"* and suggested urgent diagnostic tests.
- **Delay-of-Care Warning**: Prominent notice before closing any case or generating a visit prep summary.

## 6. Accessibility & Windows Experience (WCAG 2.1 AA)

- **Keyboard First**: Full keyboard navigation across all workflows; Tab index preservation; global shortcuts (`Ctrl+1..9` tab switching, `Escape` to close modals/drawers).
- **Screen Reader Support**: ARIA landmarks (`banner`, `navigation`, `main`, `complementary`), live regions (`aria-live="polite"` for council streaming, `aria-live="assertive"` for emergency red flags).
- **High Contrast & Scaling**: Supports Windows High Contrast mode, 100%–200% OS DPI scaling, 4.5:1 minimum text contrast ratio, no color-only information encoding.
- **Focus Management**: Focus trap inside modal dialogues (e.g., Privacy Preview); auto-focus restore upon drawer closure.

## 7. State Handling: Empty, Loading, and Error States

- **Empty States**:
  - *Inbox Empty*: Friendly illustration with "Drag health files here" + Synthetic demo dataset loader button.
  - *Timeline Empty*: "No clinical events recorded yet. Import records to build your longitudinal passport."
  - *Cases Empty*: "Start a new consultation or explore past simulated cases."
- **Loading & Streaming States**:
  - *Skeleton Screens*: Shimmer placeholders matching layout geometry for tables and cards (no layout jump).
  - *Council Streaming*: Real-time stage chips, token throughput indicator, and elapsed budget progress bar.
- **Error & Recovery States**:
  - *OCR / Parse Failure*: Non-blocking card error; permits manual field entry and retains raw file preview.
  - *Provider Outage / Rate Limit*: Graceful fallback to secondary configured provider or local offline model with visible amber alert.
  - *Corrupt Local State*: Automatic rollback to latest valid SQLite snapshot and prompt to decrypt with recovery key.
