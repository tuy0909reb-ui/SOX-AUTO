# Architecture Baseline – ASA-ARCH-17.0

**Baseline ID:** ASA-ARCH-17.0  
**Title:** Presentation Layer（successor to Decision→Recommendation）  
**Version:** Draft 0.2（Phase 17.1 Frozen）  
**Status:** Open — Active Draft（Phase 17.1 Frozen; Phase 17.2+ Open）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-16.0（Decision / Audit / Reasoning / Recommendation — CLOSED / Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-17.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_17_0.md`  

**Freeze:** ASA-IMPL-REQ-ARCH-FREEZE-17.1-001  
**Acceptance:** ASA-VERIFY-ARCH-17.1-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  

---

## 1. Registration Declaration

本書は **ASA-ARCH-16.0 完了後**の次期 Architecture Baseline である。

* Based on Architecture 16.0（immutable frozen baseline）  
* Architecture 17.0 SHALL NOT modify Architecture 16.0 or 15.0  
* **Phase 17.1 Presentation Core is Frozen / Accepted（Baseline 17.1）**  
* Phase 17.2+ remains Open  

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
Architecture 17.0 adds Presentation downstream of frozen RecommendationReport.
Presentation transforms Recommendation output into presentation-ready structured data.
Presentation does not reason, recommend, render, or generate natural language.
```

| Area | Change | Status |
|---|---|---|
| Phase 17.1 Presentation Core | Deterministic RecommendationReport → PresentationModel / PresentationReport | **Frozen / Accepted** |
| Phase 17.2+ Rendering | UI / format rendering over presentation_data | **Open** |
| Phase 17.3+ Natural language | NL generation over presentation structures | Not started |

---

## 4. Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 1 | ASA-IMPL-REQ-PRESENTATION-001 Final v2.2 — Presentation Core | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-17.1-001 — Phase 17.1 Freeze | **Implemented** |
| — | Rendering / NL（17.2+ / 17.3+） | Open / Not issued |

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

## 6. Dependency Inheritance

```text
Presentation → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Presentation consumes **only** the frozen Recommendation public interface.  
Architecture 15.0 and 16.0 source and baselines remain unchanged.

---

## 7. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft（17.2+） |
| Spec version | Draft 0.2 |
| Phase 17.1 | **Frozen / Accepted（Baseline 17.1）** |
| Phase 17.2 | **Open** |
| Based on | ASA-ARCH-16.0 Final（CLOSED / Frozen） |
| Production SoT for Decision→Recommendation | **ASA-ARCH-16.0（frozen）** |
| Production SoT for Presentation Core | **ASA-ARCH-17.0 Phase 17.1（Frozen）** |
| Git tag | `arch-17.1-freeze` |

---

## 8. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-17.0** for Phase 17.2+ only（Phase 17.1 frozen） |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` or `ASA-ARCH-16.0.md` |
| Upstream | RecommendationReport public contract remains Final / frozen |
| Phase 17.1 | Immutable after `arch-17.1-freeze` |
