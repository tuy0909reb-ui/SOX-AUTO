# Architecture Baseline – ASA-ARCH-17.0

**Baseline ID:** ASA-ARCH-17.0  
**Title:** Presentation Layer（successor to Decision→Recommendation）  
**Version:** Baseline 17.4（Draft 0.5 content; Phase 17.1–17.4 Frozen）  
**Status:** Open — Active Draft（Phase 17.1–17.4 Frozen; Phase 17.5 Open）  
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

---

## 1. Registration Declaration

本書は **ASA-ARCH-16.0 完了後**の次期 Architecture Baseline である。

* Based on Architecture 16.0（immutable frozen baseline）  
* Architecture 17.0 SHALL NOT modify Architecture 16.0 or 15.0  
* **Phase 17.1 Presentation Core is Frozen / Accepted（Baseline 17.1）**  
* **Phase 17.2 Rendering is Frozen / Accepted（Baseline 17.2）**  
* **Phase 17.3 Natural Language is Frozen / Accepted（Baseline 17.3）**  
* **Phase 17.4 Integration is Frozen / Accepted（Baseline 17.4）**  
* Phase 17.5 remains Open  

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
Architecture 17.0 adds Presentation, Rendering, Natural Language, and Integration
downstream of frozen RecommendationReport.
Presentation / Rendering / NL explain Recommendation output without inference.
Integration orchestrates the three layers into an IntegratedReport.
```

| Area | Change | Status |
|---|---|---|
| Phase 17.1 Presentation Core | Deterministic RecommendationReport → PresentationModel / PresentationReport | **Frozen / Accepted** |
| Phase 17.2 Rendering | PresentationData → RenderedView（MARKDOWN / HTML / CLI） | **Frozen / Accepted** |
| Phase 17.3 Natural Language | RenderedView → NaturalLanguageReport（explain only） | **Frozen / Accepted** |
| Phase 17.4 Integration | RecommendationReport → IntegratedReport（orchestrator） | **Frozen / Accepted** |
| Phase 17.5 | （Open） | **Open** |

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
| — | Phase 17.5 | Open / Not issued |

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
Integration → NaturalLanguage → Rendering → Presentation → Recommendation
  → Reasoning → Audit → Decision → Checker → Graph → Query → Facade → Store
```

Integration consumes **RecommendationReport** only and orchestrates frozen 17.1–17.3 engines.  
Natural Language consumes **RenderedView** only.  
Rendering consumes **PresentationData** only.  
Presentation consumes **only** the frozen Recommendation public interface.  
Architecture 15.0 and 16.0 source and baselines remain unchanged.  
Phase 17.1–17.3 remain Frozen and unmodified.

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

## 10. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft（17.5+） |
| Spec version | Baseline 17.4（Draft 0.5 lineage） |
| Phase 17.1 | **Frozen / Accepted（Baseline 17.1）** |
| Phase 17.2 | **Frozen / Accepted（Baseline 17.2）** |
| Phase 17.3 | **Frozen / Accepted（Baseline 17.3）** |
| Phase 17.4 | **Frozen / Accepted（Baseline 17.4）** |
| Phase 17.5 | **Open** |
| Based on | ASA-ARCH-16.0 Final（CLOSED / Frozen） |
| Production SoT for Decision→Recommendation | **ASA-ARCH-16.0（frozen）** |
| Production SoT for Presentation Core | **ASA-ARCH-17.0 Phase 17.1（Frozen）** |
| Production SoT for Rendering | **ASA-ARCH-17.0 Phase 17.2（Frozen）** |
| Production SoT for Natural Language | **ASA-ARCH-17.0 Phase 17.3（Frozen）** |
| Production SoT for Integration | **ASA-ARCH-17.0 Phase 17.4（Frozen）** |
| Phase 17.1 Git tag | `arch-17.1-freeze` |
| Phase 17.2 Git tag | `arch-17.2-freeze` |
| Phase 17.3 Git tag | `arch-17.3-freeze` |
| Phase 17.4 Git tag | `arch-17.4-freeze` |

---

## 11. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-17.0** for Phase 17.5+ draft updates（Phase 17.1–17.4 frozen） |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` or `ASA-ARCH-16.0.md` |
| Upstream | Recommendation / Presentation / Rendering / NL / Integration contracts remain Final / frozen |
| Phase 17.1 | Immutable after `arch-17.1-freeze` |
| Phase 17.2 | Immutable after `arch-17.2-freeze` |
| Phase 17.3 | Immutable after `arch-17.3-freeze` |
| Phase 17.4 | Immutable after `arch-17.4-freeze` |
