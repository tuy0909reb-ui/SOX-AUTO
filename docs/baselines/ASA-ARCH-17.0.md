# Architecture Baseline – ASA-ARCH-17.0

**Baseline ID:** ASA-ARCH-17.0  
**Title:** Presentation Layer（successor to Decision→Recommendation）  
**Version:** Draft 0.3（Phase 17.1 Frozen; Phase 17.2 Frozen）  
**Status:** Open — Active Draft（Phase 17.1–17.2 Frozen; Phase 17.3 Open）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-16.0（Decision / Audit / Reasoning / Recommendation — CLOSED / Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-17.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_17_0.md`  

**Freeze（17.1）:** ASA-IMPL-REQ-ARCH-FREEZE-17.1-001  
**Acceptance（17.1）:** ASA-VERIFY-ARCH-17.1-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze（17.2）:** ASA-IMPL-REQ-ARCH-FREEZE-17.2-001  
**Acceptance（17.2）:** ASA-VERIFY-ARCH-17.2-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  

---

## 1. Registration Declaration

本書は **ASA-ARCH-16.0 完了後**の次期 Architecture Baseline である。

* Based on Architecture 16.0（immutable frozen baseline）  
* Architecture 17.0 SHALL NOT modify Architecture 16.0 or 15.0  
* **Phase 17.1 Presentation Core is Frozen / Accepted（Baseline 17.1）**  
* **Phase 17.2 Rendering is Frozen / Accepted（Baseline 17.2）**  
* Phase 17.3+ remains Open  

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
Architecture 17.0 adds Presentation and Rendering downstream of frozen RecommendationReport.
Presentation transforms Recommendation output into presentation-ready structured data.
Rendering formats PresentationData into RenderedView（MARKDOWN / HTML / CLI）.
Neither layer reasons, recommends, or generates natural language.
```

| Area | Change | Status |
|---|---|---|
| Phase 17.1 Presentation Core | Deterministic RecommendationReport → PresentationModel / PresentationReport | **Frozen / Accepted** |
| Phase 17.2 Rendering | PresentationData → RenderedView（MARKDOWN / HTML / CLI） | **Frozen / Accepted** |
| Phase 17.3+ Natural language | NL generation over presentation / rendering structures | **Open** |

---

## 4. Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 1 | ASA-IMPL-REQ-PRESENTATION-001 Final v2.2 — Presentation Core | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.1-001 — Phase 17.1 Freeze | **Implemented** |
| 2 | ASA-IMPL-REQ-RENDERING-001 Final v1 — Rendering | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.2-001 — Phase 17.2 Freeze | **Implemented** |
| — | Natural language（17.3+） | Open / Not issued |

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
Rendering → Presentation → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Rendering consumes **PresentationData** only.  
Presentation consumes **only** the frozen Recommendation public interface.  
Architecture 15.0 and 16.0 source and baselines remain unchanged.

---

## 8. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft（17.3+） |
| Spec version | Draft 0.3 |
| Phase 17.1 | **Frozen / Accepted（Baseline 17.1）** |
| Phase 17.2 | **Frozen / Accepted（Baseline 17.2）** |
| Phase 17.3 | **Open** |
| Based on | ASA-ARCH-16.0 Final（CLOSED / Frozen） |
| Production SoT for Decision→Recommendation | **ASA-ARCH-16.0（frozen）** |
| Production SoT for Presentation Core | **ASA-ARCH-17.0 Phase 17.1（Frozen）** |
| Production SoT for Rendering | **ASA-ARCH-17.0 Phase 17.2（Frozen）** |
| Phase 17.1 Git tag | `arch-17.1-freeze` |
| Phase 17.2 Git tag | `arch-17.2-freeze` |

---

## 9. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-17.0** for Phase 17.3+ draft updates（Phase 17.1–17.2 frozen） |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` or `ASA-ARCH-16.0.md` |
| Upstream | RecommendationReport / PresentationData / Rendering contracts remain Final / frozen |
| Phase 17.1 | Immutable after `arch-17.1-freeze` |
| Phase 17.2 | Immutable after `arch-17.2-freeze` |
