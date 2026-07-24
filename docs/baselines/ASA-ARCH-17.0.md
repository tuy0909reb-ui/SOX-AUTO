# Architecture Baseline – ASA-ARCH-17.0

**Baseline ID:** ASA-ARCH-17.0  
**Title:** Presentation Layer（successor to Decision→Recommendation）  
**Version:** Draft 1.5（Phase 17.1–17.9 Frozen; Architecture 18.0 Open）  
**Status:** Open — Active Draft（Phase 17.1–17.9 Frozen; Architecture 18.0 Open）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-16.0（Decision / Audit / Reasoning / Recommendation — CLOSED / Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-17.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_17_0.md`  

**Freeze（17.1）:** ASA-IMPL-REQ-ARCH-FREEZE-17.1-001  
**Acceptance（17.1）:** ASA-VERIFY-ARCH-17.1-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.2）:** ASA-IMPL-REQ-ARCH-FREEZE-17.2-001  
**Acceptance（17.2）:** ASA-VERIFY-ARCH-17.2-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.3）:** ASA-IMPL-REQ-ARCH-FREEZE-17.3-001  
**Acceptance（17.3）:** ASA-VERIFY-ARCH-17.3-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.4）:** ASA-IMPL-REQ-ARCH-FREEZE-17.4-001  
**Acceptance（17.4）:** ASA-VERIFY-ARCH-17.4-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.5）:** ASA-IMPL-REQ-ARCH-FREEZE-17.5-001  
**Acceptance（17.5）:** ASA-VERIFY-ARCH-17.5-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.6）:** ASA-IMPL-REQ-ARCH-FREEZE-17.6-001  
**Acceptance（17.6）:** ASA-VERIFY-ARCH-17.6-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.7）:** ASA-IMPL-REQ-ARCH-FREEZE-17.7-001  
**Acceptance（17.7）:** ASA-VERIFY-ARCH-17.7-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.8）:** ASA-IMPL-REQ-ARCH-FREEZE-17.8-001  
**Acceptance（17.8）:** ASA-VERIFY-ARCH-17.8-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.9）:** ASA-IMPL-REQ-ARCH-FREEZE-17.9-001  
**Acceptance（17.9）:** ASA-VERIFY-ARCH-17.9-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  

---

## 1. Registration Declaration

本書は **ASA-ARCH-16.0 完了後**の次期 Architecture Baseline である。

* Based on Architecture 16.0（immutable frozen baseline）  
* Architecture 17.0 SHALL NOT modify Architecture 16.0 or 15.0  
* **Phase 17.1 Presentation Core is Frozen / Accepted（Baseline 17.1）**  
* **Phase 17.2 Rendering is Frozen / Accepted（Baseline 17.2）**  
* **Phase 17.3 Natural Language is Frozen / Accepted（Baseline 17.3）**  
* **Phase 17.4 Integration is Frozen / Accepted（Baseline 17.4）**  
* **Phase 17.5 Distribution is Frozen / Accepted（Baseline 17.5）**  
* **Phase 17.6 Feedback / Improvement Mechanism is Frozen / Accepted（Baseline 17.6）**  
* **Phase 17.7 Reflection / Continuous Improvement Cycle is Frozen / Accepted（Baseline 17.7）**  
* **Phase 17.8 Evolution / Optimization Mechanism is Frozen / Accepted（Baseline 17.8）**  
* **Phase 17.9 Synthesis / Consolidation Mechanism is Frozen / Accepted（Baseline 17.9）**  

---

## 2. Previous Baseline Reference

| Field | Value |
|---|---|
| Previous | **ASA-ARCH-16.0** — Decision / Audit / Reasoning / Recommendation |
| Previous status | CLOSED — Frozen Baseline |
| Freeze tag | `arch-16.0-final` |
| Normative path | `docs/baselines/ASA-ARCH-16.0.md` |

ASA-ARCH-16.0 で完了した範囲（参照のみ・変更禁止）:

* Phase 16.1 Decision Engine  
* Phase 16.2 Audit Layer  
* Phase 16.3 Trace Reasoning  
* Phase 16.4 Recommendation  

---

## 3. Change Summary

```text
Architecture 17.0 adds Presentation, Rendering, Natural Language, Integration,
Distribution, Feedback, Reflection, Evolution, and Synthesis downstream of frozen RecommendationReport.
Presentation / Rendering / NL explain Recommendation output without inference.
Integration orchestrates the three layers into an IntegratedReport.
Distribution transmits IntegratedReport to registered interfaces only.
Feedback evaluates DistributedOutput + audit_log + UserFeedback and proposes improvements.
Reflection evaluates ImprovementReport + Governance + HistoricalMetrics for continuous improvement.
Evolution evaluates ReflectionSummary + HistoricalMetrics + Governance for optimization / evolution.
Synthesis consolidates EvolutionPlan + Governance + HistoricalMetrics into SynthesisReport.
```

| Area | Change | Status |
|---|---|---|
| Phase 17.1 Presentation Core | Deterministic RecommendationReport → PresentationModel / PresentationReport | **Frozen / Accepted** |
| Phase 17.2 Rendering | PresentationData → RenderedView（MARKDOWN / HTML / CLI） | **Frozen / Accepted** |
| Phase 17.3 Natural Language | RenderedView → NaturalLanguageReport（explain only） | **Frozen / Accepted** |
| Phase 17.4 Integration | RecommendationReport → IntegratedReport（orchestrator） | **Frozen / Accepted** |
| Phase 17.5 Distribution | IntegratedReport → DistributedOutput（transmit only） | **Frozen / Accepted** |
| Phase 17.6 Feedback | DistributedOutput + audit_log + UserFeedback → ImprovementReport | **Frozen / Accepted** |
| Phase 17.7 Reflection | ImprovementReport + Governance + HistoricalMetrics → ReflectionSummary | **Frozen / Accepted** |
| Phase 17.8 Evolution | ReflectionSummary + HistoricalMetrics + Governance → EvolutionPlan | **Frozen / Accepted** |
| Phase 17.9 Synthesis | EvolutionPlan + Governance + HistoricalMetrics → SynthesisReport | **Frozen / Accepted** |

---

## 4. Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 1 | ASA-IMPL-REQ-PRESENTATION-001 Final v2.2 — Presentation Core | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.1-001 — Phase 17.1 Freeze | **Implemented** |
| 2 | ASA-IMPL-REQ-RENDERING-001 Final v1 — Rendering | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.2-001 — Phase 17.2 Freeze | **Implemented** |
| 3 | ASA-IMPL-REQ-NATURAL-LANGUAGE-001 Final v1.3 — Natural Language | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.3-001 — Phase 17.3 Freeze | **Implemented** |
| 4 | ASA-IMPL-REQ-INTEGRATION-001 Final v1.2 — Integration | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.4-001 — Phase 17.4 Freeze | **Implemented** |
| 5 | ASA-IMPL-REQ-DISTRIBUTION-001 Final v1.2 — Distribution | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.5-001 — Phase 17.5 Freeze | **Implemented** |
| 6 | ASA-IMPL-REQ-FEEDBACK-001 Final v1.1 — Feedback | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.6-001 — Phase 17.6 Freeze | **Implemented** |
| 7 | ASA-IMPL-REQ-REFLECTION-001 Final v1.1 — Reflection | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.7-001 — Phase 17.7 Freeze | **Implemented** |
| 8 | ASA-IMPL-REQ-EVOLUTION-001 Final v1.1 — Evolution | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.8-001 — Phase 17.8 Freeze | **Implemented** |
| 9 | ASA-IMPL-REQ-SYNTHESIS-001 Final v1.1 — Synthesis | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.9-001 — Phase 17.9 Freeze | **Implemented** |

---

## 5. Phase 17.1 — Presentation Core

**Status:** Frozen / Accepted  
**Baseline:** 17.1 Frozen  
**Git tag:** `arch-17.1-freeze`  

**Normative spec:** `auto-scribe-ai/impl/presentation_spec.md`  

**Public input:** frozen `RecommendationReport` only  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/presentation_spec.md` |
| Engine | `auto-scribe-ai/src/presentation/presentation_engine.py` |
| Model | `auto-scribe-ai/src/presentation/presentation_model.py` |
| Report | `auto-scribe-ai/src/presentation/presentation_report.py` |
| Exceptions | `auto-scribe-ai/src/presentation/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_presentation.py` |
| Integration tests | `auto-scribe-ai/tests/test_presentation_integration.py` |

**Contracts（summary）:**

* Deterministic Model / Report / presentation_data  
* Ordering preserved（Recommendation set and presentation_data.actions）  
* Lossless field mapping  
* Pure transformation（no recompute / aggregate / reorder）  
* Renderer-independent presentation_data（no HTML / Markdown / UI）  
* Snapshot evaluation; no Presentation cache  
* Exception hierarchy with cause chaining  

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.1-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.1-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.1 Frozen** |

### 5.2 Freeze Notes — NB-1（Non-blocking）

| Field | Value |
|---|---|
| ID | NB-1 |
| Topic | Packaging dependency |
| Detail | `FrozenEvidence` imported as shared type utility from `decision.decision_result` |
| Classification | **Non-blocking** |
| Follow-up | Future Packaging Cleanup |
| Architecture impact | None |
| Implementation change required | No |

No contract violations. No blocking issues.

### 5.3 Phase 17.1 Freeze Rule

```text
Architecture 17.1 Presentation Core SHALL be immutable.
Future Presentation Core contract changes SHALL NOT mutate Phase 17.1
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.2+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 6. Phase 17.2 — Rendering

**Status:** Frozen / Accepted  
**Baseline:** 17.2 Frozen  
**Git tag:** `arch-17.2-freeze`  

**Normative spec:** `auto-scribe-ai/impl/rendering_spec.md`  

**Public input:** `PresentationData` only（plus referential `presentation_id` metadata）  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/rendering_spec.md` |
| Engine | `auto-scribe-ai/src/rendering/rendering_engine.py` |
| Model | `auto-scribe-ai/src/rendering/rendering_model.py` |
| Report | `auto-scribe-ai/src/rendering/rendering_report.py` |
| Templates | `auto-scribe-ai/src/rendering/templates/` |
| Exceptions | `auto-scribe-ai/src/rendering/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_rendering.py` |
| Integration tests | `auto-scribe-ai/tests/test_rendering_integration.py` |

**Contracts（summary）:**

* Deterministic RenderedView / RenderingModel / RenderingReport  
* Formats: MARKDOWN / HTML / CLI（extensible）  
* Templates format only — no sort / filter / group / merge / split  
* Ordering and field integrity preserved across formats  
* RenderedView owned by RenderingModel; Report does not duplicate it  
* Snapshot evaluation; no Rendering cache  
* Exception hierarchy with cause chaining  

Phase 17.1 Presentation contracts remain Frozen and unmodified.

### 6.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.2-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.2-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.2 Frozen** |

### 6.2 Freeze Notes — NB-1（Non-blocking）

| Field | Value |
|---|---|
| ID | NB-1 |
| Topic | Rendering identity metadata |
| Detail | `RenderingEngine.render` requires `presentation_id` keyword metadata for rendering identity / `presentation_reference_id` |
| Classification | **Non-blocking** |
| Follow-up | Future API cleanup candidate only |
| Architecture impact | None — no architecture modification required |
| Implementation change required | No |

No contract violations. No blocking issues. Rendering baseline fixed.

### 6.3 Phase 17.2 Freeze Rule

```text
Architecture 17.2 Rendering SHALL be immutable.
Future Rendering contract changes SHALL NOT mutate Phase 17.2
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.3+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 7. Dependency Inheritance

```text
Synthesis → Evolution → Reflection → Feedback → Distribution → Integration → NaturalLanguage → Rendering → Presentation
  → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Synthesis consumes **EvolutionPlan**, **GovernanceReviewModel**, and **HistoricalMetricsModel** only.  
Evolution consumes **ReflectionSummary**, **HistoricalMetricsModel**, and **GovernanceReviewModel** only.  
Reflection consumes **ImprovementReport**, **GovernanceReviewModel**, and **HistoricalMetricsModel** only.  
Feedback consumes **DistributedOutput**, **DistributionModel.audit_log**, and **UserFeedbackModel** only.  
Distribution consumes **IntegratedReport** only.  
Integration consumes **RecommendationReport** only and orchestrates frozen 17.1–17.3 engines.  
Architecture 15.0 and 16.0 source and baselines remain unchanged.  
Phase 17.1–17.9 remain Frozen and unmodified.

---

## 8. Phase 17.3 — Natural Language

**Status:** Frozen / Accepted  
**Baseline:** 17.3 Frozen  
**Git tag:** `arch-17.3-freeze`  

**Normative spec:** `auto-scribe-ai/impl/natural_language_spec.md`  

**Public input:** `RenderedView` only（plus referential `rendering_id` metadata）  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/natural_language_spec.md` |
| Engine | `auto-scribe-ai/src/natural_language/natural_language_engine.py` |
| Prompt Builder | `auto-scribe-ai/src/natural_language/prompt_builder.py` |
| Model | `auto-scribe-ai/src/natural_language/natural_language_model.py` |
| Report | `auto-scribe-ai/src/natural_language/natural_language_report.py` |
| Templates | `auto-scribe-ai/src/natural_language/templates/` |
| Exceptions | `auto-scribe-ai/src/natural_language/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_natural_language.py` |
| Integration tests | `auto-scribe-ai/tests/test_natural_language_integration.py` |

**Contracts（summary）:**

* Deterministic PromptBuilder + NaturalLanguageReport under deterministic backends  
* Explain only — no infer / evaluate / recommend / fabricate  
* Output validation against RenderedView（facts / ordering / hallucination prevention）  
* Backend abstraction（Mock / GPT / Claude / Gemini）  
* generated_text owned by NaturalLanguageModel; Report does not duplicate it  
* Snapshot evaluation; no NL cache  

### 8.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.3-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.3-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.3 Frozen** |

### 8.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | `rendering_id` keyword metadata | Required for `nl_id` / `rendering_reference_id` derivation | Future API cleanup candidate |
| NB-2 | Hallucination validator scope | Current: field completeness, ordering, identifier integrity, URL novelty. Future: optional allow-list validation | Non-blocking |

No contract violations. No blocking issues. Natural Language baseline fixed.  
No production behavior changes during freeze.

### 8.3 Phase 17.3 Freeze Rule

```text
Architecture 17.3 Natural Language SHALL be immutable.
Future Natural Language contract changes SHALL NOT mutate Phase 17.3
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.4+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 9. Phase 17.4 — Integration

**Status:** Frozen / Accepted  
**Baseline:** 17.4 Frozen  
**Git tag:** `arch-17.4-freeze`  
**Freeze Date:** 2026-07-24  

**Normative spec:** `auto-scribe-ai/impl/integration_spec.md`  

**Public input:** `RecommendationReport` only  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/integration_spec.md` |
| Engine | `auto-scribe-ai/src/integration/integration_engine.py` |
| Model | `auto-scribe-ai/src/integration/integration_model.py` |
| Report | `auto-scribe-ai/src/integration/integration_report.py` |
| Exceptions | `auto-scribe-ai/src/integration/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_integration.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_integration_pipeline.py` |

**Contracts（summary）:**

* Orchestrator only — Presentation → Rendering → NL exactly once each  
* Deterministic IntegratedReport under timestamp injection  
* Owns embedded Presentation / Rendering / NL models  
* Machine-readable validation_summary  
* Referential + cross-layer integrity checks  
* Snapshot evaluation; no Integration cache  

Phase 17.1–17.3 contracts remain Frozen and unmodified.

### 9.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.4-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.4-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.4 Frozen** |
| Freeze Date | **2026-07-24** |

### 9.2 Freeze Notes — NB-1（Non-blocking）

| Field | Value |
|---|---|
| ID | NB-1 |
| Topic | Fixed integrate() formatting defaults |
| Detail | `IntegrationEngine.integrate()` currently fixes `render_format=MARKDOWN`, `tone_profile=NEUTRAL`, `template_version=1.0`（and prompt_template_version=1.0） |
| Purpose | Preserves determinism |
| Follow-up | Future API expansion may expose these as optional parameters |
| Architecture impact | None — no architecture change required |
| Classification | **Non-blocking** |

### 9.3 Phase 17.4 Freeze Rule

```text
Architecture 17.4 Integration SHALL be immutable.
Future Integration contract changes SHALL NOT mutate Phase 17.4
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.5+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 10. Phase 17.5 — Distribution

**Status:** Frozen / Accepted  
**Baseline:** 17.5 Frozen  
**Git tag:** `arch-17.5-freeze`  
**Freeze Date:** 2026-07-25  

**Normative spec:** `auto-scribe-ai/impl/distribution_spec.md`  

**Public input:** `IntegratedReport` only  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/distribution_spec.md` |
| Engine | `auto-scribe-ai/src/distribution/distribution_engine.py` |
| Model | `auto-scribe-ai/src/distribution/distribution_model.py` |
| Output | `auto-scribe-ai/src/distribution/distributed_output.py` |
| Exceptions | `auto-scribe-ai/src/distribution/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_distribution.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_distribution_pipeline.py` |

**Contracts（summary）:**

* Transmit only — UI / API / Export binding  
* Canonical JSON + SHA-256 pre/post verification  
* Access policy enforcement（DistributionAccessError）  
* No automatic retry（RETRY_PENDING）  
* Machine-readable audit_log  
* Owns integration_reference_id only（no IntegrationModel embedding）  

Phase 17.1–17.4 contracts remain Frozen and unmodified.

### 10.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.5-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.5-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.5 Frozen** |
| Freeze Date | **2026-07-25** |

### 10.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | `distribution_id` uniqueness scope | Uniqueness is scoped to `integration_id`（same ID across UI / API / Export for one report） | Non-blocking |
| NB-2 | Access denial audit channel | Access denial raises `DistributionAccessError` prior to model creation（no returned `audit_log`） | Non-blocking |
| NB-3 | `FAILURE` delivery status | `delivery_status` enum includes `FAILURE`; engine emits `SUCCESS` / `RETRY_PENDING`（`FAILURE` reserved） | Non-blocking |
| NB-4 | Nested-reference `to_dict()` | `DistributedOutput.to_dict()` follows existing nested-reference pattern（identifier echo） | Non-blocking |
| NB-5 | Change Summary narrative | Architecture Change Summary narrative requires future documentation update | Non-blocking |

No contract violations. No blocking issues. Distribution baseline fixed.  
No production behavior changes during freeze.

### 10.3 Phase 17.5 Freeze Rule

```text
Architecture 17.5 Distribution SHALL be immutable.
Future Distribution contract changes SHALL NOT mutate Phase 17.5
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.6+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 11. Phase 17.6 — Feedback / Improvement Mechanism

**Status:** Frozen / Accepted  
**Baseline:** 17.6 Frozen  
**Git tag:** `arch-17.6-freeze`  
**Freeze Date:** 2026-07-25  

**Normative spec:** `auto-scribe-ai/impl/feedback_spec.md`  

**Public input:** `DistributedOutput` + `DistributionModel.audit_log` + `UserFeedbackModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/feedback_spec.md` |
| Engine | `auto-scribe-ai/src/feedback/feedback_engine.py` |
| Model | `auto-scribe-ai/src/feedback/feedback_model.py` |
| Suggestion | `auto-scribe-ai/src/feedback/improvement_suggestion_model.py` |
| Review | `auto-scribe-ai/src/feedback/governance_review_model.py` |
| Report | `auto-scribe-ai/src/feedback/improvement_report.py` |
| Exceptions | `auto-scribe-ai/src/feedback/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_feedback.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_feedback_pipeline.py` |

**Contracts（summary）:**

* Evaluate and propose only — no DistributedOutput mutation / regeneration  
* Deterministic ImprovementReport under versioned evaluation configuration  
* FeedbackModel owns metrics / suggestions / traceability_map  
* GovernanceReviewModel separate（PENDING / APPROVED / REJECTED）  
* Snapshot evaluation; no Feedback cache  

Phase 17.1–17.5 contracts remain Frozen and unmodified.

### 11.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.6-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.6-001 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.6 Frozen** |
| Freeze Date | **2026-07-25** |

### 11.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `feedback_id` / `user_feedback_id` derived solely from `distribution_id`; uniqueness per Distribution. Future multi-feedback may require identifier expansion | Non-blocking |
| NB-2 | Unused config weights | Evaluation configuration contains unused weighting / threshold parameters; reserved for future deterministic scoring | Non-blocking |
| NB-3 | Nested-reference `to_dict()` | `ImprovementReport.to_dict()` repeats referential identifiers at top level and nested FeedbackModel | Non-blocking |
| NB-4 | Error separation | `FeedbackIntegrityError` vs `FeedbackValidationError` intentionally represent different architectural responsibilities | Non-blocking |
| NB-5 | Registry sync | Baseline registry documentation synchronized so Phase 17.6 is Frozen | Non-blocking |

No contract violations. No blocking issues. Feedback baseline fixed.  
No production behavior changes during freeze.

### 11.3 Phase 17.6 Freeze Rule

```text
Architecture 17.6 Feedback SHALL be immutable.
Future Feedback contract changes SHALL NOT mutate Phase 17.6
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.7+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 12. Phase 17.7 — Reflection / Continuous Improvement Cycle

**Status:** Frozen / Accepted  
**Baseline:** 17.7 Frozen  
**Git tag:** `arch-17.7-freeze`  
**Freeze Date:** 2026-07-25  

**Normative spec:** `auto-scribe-ai/impl/reflection_spec.md`  

**Public input:** `ImprovementReport` + `GovernanceReviewModel` + `HistoricalMetricsModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/reflection_spec.md` |
| Engine | `auto-scribe-ai/src/reflection/reflection_engine.py` |
| Model | `auto-scribe-ai/src/reflection/reflection_model.py` |
| Historical Metrics | `auto-scribe-ai/src/reflection/historical_metrics_model.py` |
| Recommendation | `auto-scribe-ai/src/reflection/continuous_recommendation_model.py` |
| Summary | `auto-scribe-ai/src/reflection/reflection_summary.py` |
| Exceptions | `auto-scribe-ai/src/reflection/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_reflection.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_reflection_pipeline.py` |

**Contracts（summary）:**

* Evaluate improvement effectiveness — no upstream mutation  
* Deterministic ReflectionSummary under versioned evaluation configuration  
* ReflectionModel owns results / findings / recommendations / traceability_map  
* ReflectionSummary references ReflectionModel only（no field duplication）  
* GovernanceReviewModel remains external（no status updates by Reflection）  
* Snapshot evaluation; no Reflection cache  

Phase 17.1–17.6 contracts remain Frozen and unmodified.

### 12.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.7-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.7-001 |
| Implementation | ASA-IMPL-REQ-REFLECTION-001 Final v1.1 |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.7 Frozen** |
| Freeze Date | **2026-07-25** |

### 12.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `reflection_id` derived solely from `feedback_id`; uniqueness per Feedback evaluation | Non-blocking |
| NB-2 | Unused thresholds | Evaluation configuration requires thresholds unused by scoring; reserved for future deterministic enhancements | Non-blocking |
| NB-3 | Synthetic evaluation_result_id | Traceability `evaluation_result_id` is deterministic synthetic reference; no separate persisted EvaluationResult model | Non-blocking |
| NB-4 | Error separation | `ReflectionIntegrityError` vs `ReflectionValidationError` intentionally represent different responsibilities | Non-blocking |
| NB-5 | Governance intake | Frozen GovernanceReviewModel has no ReflectionSummary intake API; Reflection outputs summary only; governance remains external | Non-blocking |
| NB-6 | Registry sync | Baseline registry documentation synchronized so Phase 17.7 is Frozen | Non-blocking |

No contract violations. No blocking issues. Reflection baseline fixed.  
No production behavior changes during freeze.

### 12.3 Phase 17.7 Freeze Rule

```text
Architecture 17.7 Reflection SHALL be immutable.
Future Reflection contract changes SHALL NOT mutate Phase 17.7
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.8+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 13. Phase 17.8 — Evolution / Optimization Mechanism

**Status:** Frozen / Accepted  
**Baseline:** 17.8 Frozen  
**Git tag:** `arch-17.8-freeze`  
**Freeze Date:** 2026-07-25  

**Normative spec:** `auto-scribe-ai/impl/evolution_spec.md`  

**Public input:** `ReflectionSummary` + `HistoricalMetricsModel` + `GovernanceReviewModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/evolution_spec.md` |
| Engine | `auto-scribe-ai/src/evolution/evolution_engine.py` |
| Model | `auto-scribe-ai/src/evolution/evolution_model.py` |
| Plan | `auto-scribe-ai/src/evolution/evolution_plan.py` |
| Proposal | `auto-scribe-ai/src/evolution/evolution_proposal_model.py` |
| Exceptions | `auto-scribe-ai/src/evolution/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_evolution.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_evolution_pipeline.py` |

**Contracts（summary）:**

* Evaluate optimization / evolution only — no upstream mutation  
* Deterministic EvolutionPlan under versioned evaluation configuration  
* EvolutionModel owns optimization_results / evolution_parameters / proposals / traceability_map  
* EvolutionPlan references EvolutionModel only（no field duplication）  
* GovernanceReviewModel remains external（no status updates by Evolution）  
* Snapshot evaluation; no Evolution cache  

Phase 17.1–17.7 contracts remain Frozen and unmodified.

### 13.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.8-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.8-001 |
| Implementation | ASA-IMPL-REQ-EVOLUTION-001 Final v1.1 |
| Architecture Version | ASA-ARCH-17.0 Draft 1.2（at acceptance） / Draft 1.3（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.8 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–17.8 Frozen; Phase 17.9 Open |

### 13.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `evolution_id` uniqueness is per `reflection_id` | Non-blocking |
| NB-2 | Unused thresholds | Threshold configuration reserved for future deterministic extensions | Non-blocking |
| NB-3 | Aggregate optimization_result_id | `optimization_result_id` is an aggregate / synthetic reference | Non-blocking |
| NB-4 | Error separation | `EvolutionIntegrityError` / `EvolutionValidationError` responsibility split confirmed | Non-blocking |
| NB-5 | Governance read-only | `GovernanceReviewModel` remains read-only | Non-blocking |
| NB-6 | Plan ownership | `EvolutionPlan` references `EvolutionModel` only | Non-blocking |
| NB-7 | Registry sync | Baseline registry synchronized during freeze | Non-blocking |

No contract violations. No blocking issues. Evolution baseline fixed.  
No production behavior changes during freeze.

### 13.3 Phase 17.8 Freeze Rule

```text
Architecture 17.8 Evolution SHALL be immutable.
Future Evolution contract changes SHALL NOT mutate Phase 17.8
except through Change Requests that supersede via a later Architecture 17.x phase.
Phase 17.9+ evolution SHALL begin as Open work on ASA-ARCH-17.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 14. Phase 17.9 — Synthesis / Consolidation Mechanism

**Status:** Frozen / Accepted  
**Baseline:** 17.9 Frozen  
**Git tag:** `arch-17.9-freeze`  
**Freeze Date:** 2026-07-25  

**Normative spec:** `auto-scribe-ai/impl/synthesis_spec.md`  

**Public input:** `EvolutionPlan` + `GovernanceReviewModel` + `HistoricalMetricsModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/synthesis_spec.md` |
| Engine | `auto-scribe-ai/src/synthesis/synthesis_engine.py` |
| Model | `auto-scribe-ai/src/synthesis/synthesis_model.py` |
| Recommendation | `auto-scribe-ai/src/synthesis/synthesis_recommendation_model.py` |
| Exceptions | `auto-scribe-ai/src/synthesis/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_synthesis.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_synthesis_pipeline.py` |

**Contracts（summary）:**

* Consolidate evolution proposals only — no upstream mutation  
* Deterministic SynthesisReport under versioned evaluation configuration  
* SynthesisModel owns consolidation_results / findings / recommendations / traceability_map  
* SynthesisReport references SynthesisModel only（no field duplication）  
* GovernanceReviewModel remains external（no status updates by Synthesis）  
* Snapshot evaluation; no Synthesis cache  
* `evaluation_window` read-only from HistoricalMetricsModel  

Phase 17.1–17.8 contracts remain Frozen and unmodified.

### 14.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-17.9-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-17.9-001 |
| Implementation | ASA-IMPL-REQ-SYNTHESIS-001 Final v1.1 |
| Architecture Version | ASA-ARCH-17.0 Draft 1.4（at acceptance） / Draft 1.5（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **17.9 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–17.9 Frozen; Architecture 18.0 Open |

### 14.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `synthesis_id` uniqueness is per `evolution_id` / evaluation set | Non-blocking |
| NB-2 | Unused thresholds | Threshold configuration reserved for future deterministic extensions | Non-blocking |
| NB-3 | Synthetic consolidation_result_id | `consolidation_result_id` is a synthetic deterministic reference | Non-blocking |
| NB-4 | Error separation | `SynthesisIntegrityError` / `SynthesisValidationError` responsibility split confirmed | Non-blocking |
| NB-5 | Governance read-only | `GovernanceReviewModel` remains read-only | Non-blocking |
| NB-6 | Report ownership | `SynthesisReport` references `SynthesisModel` only | Non-blocking |
| NB-7 | Registry sync | Baseline registry synchronized during freeze | Non-blocking |

No contract violations. No blocking issues. Synthesis baseline fixed.  
No production behavior changes during freeze.

### 14.3 Phase 17.9 Freeze Rule

```text
Architecture 17.9 Synthesis SHALL be immutable.
Future Synthesis contract changes SHALL NOT mutate Phase 17.9
except through Change Requests that supersede via a later Architecture baseline.
Architecture 18.0+ evolution SHALL begin as Open work.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 15. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft |
| Spec version | Draft 1.5 |
| Phase 17.1 | **Frozen / Accepted（Baseline 17.1）** |
| Phase 17.2 | **Frozen / Accepted（Baseline 17.2）** |
| Phase 17.3 | **Frozen / Accepted（Baseline 17.3）** |
| Phase 17.4 | **Frozen / Accepted（Baseline 17.4）** |
| Phase 17.5 | **Frozen / Accepted（Baseline 17.5）** |
| Phase 17.6 | **Frozen / Accepted（Baseline 17.6）** |
| Phase 17.7 | **Frozen / Accepted（Baseline 17.7）** |
| Phase 17.8 | **Frozen / Accepted（Baseline 17.8）** |
| Phase 17.9 | **Frozen / Accepted（Baseline 17.9）** |
| Next Architecture | **ASA-ARCH-18.0（Open）** |
| Based on | ASA-ARCH-16.0 Final（CLOSED / Frozen） |
| Production SoT for Decision→Recommendation | **ASA-ARCH-16.0（frozen）** |
| Production SoT for Presentation Core | **ASA-ARCH-17.0 Phase 17.1（Frozen）** |
| Production SoT for Rendering | **ASA-ARCH-17.0 Phase 17.2（Frozen）** |
| Production SoT for Natural Language | **ASA-ARCH-17.0 Phase 17.3（Frozen）** |
| Production SoT for Integration | **ASA-ARCH-17.0 Phase 17.4（Frozen）** |
| Production SoT for Distribution | **ASA-ARCH-17.0 Phase 17.5（Frozen）** |
| Production SoT for Feedback | **ASA-ARCH-17.0 Phase 17.6（Frozen）** |
| Production SoT for Reflection | **ASA-ARCH-17.0 Phase 17.7（Frozen）** |
| Production SoT for Evolution | **ASA-ARCH-17.0 Phase 17.8（Frozen）** |
| Production SoT for Synthesis | **ASA-ARCH-17.0 Phase 17.9（Frozen）** |
| Phase 17.1 Git tag | `arch-17.1-freeze` |
| Phase 17.2 Git tag | `arch-17.2-freeze` |
| Phase 17.3 Git tag | `arch-17.3-freeze` |
| Phase 17.4 Git tag | `arch-17.4-freeze` |
| Phase 17.5 Git tag | `arch-17.5-freeze` |
| Phase 17.6 Git tag | `arch-17.6-freeze` |
| Phase 17.7 Git tag | `arch-17.7-freeze` |
| Phase 17.8 Git tag | `arch-17.8-freeze` |
| Phase 17.9 Git tag | `arch-17.9-freeze` |

---

## 16. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-18.0** for next Architecture Open work（Phase 17.1–17.9 frozen） |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` or `ASA-ARCH-16.0.md` |
| Upstream | Recommendation / Presentation / Rendering / NL / Integration / Distribution / Feedback / Reflection / Evolution / Synthesis contracts remain Final / frozen |
| Phase 17.1 | Immutable after `arch-17.1-freeze` |
| Phase 17.2 | Immutable after `arch-17.2-freeze` |
| Phase 17.3 | Immutable after `arch-17.3-freeze` |
| Phase 17.4 | Immutable after `arch-17.4-freeze` |
| Phase 17.5 | Immutable after `arch-17.5-freeze` |
| Phase 17.6 | Immutable after `arch-17.6-freeze` |
| Phase 17.7 | Immutable after `arch-17.7-freeze` |
| Phase 17.8 | Immutable after `arch-17.8-freeze` |
| Phase 17.9 | Immutable after `arch-17.9-freeze` |
