# Architecture Baseline – ASA-ARCH-17.0

**Baseline ID:** ASA-ARCH-17.0  
**Title:** （TBD — Presentation / successor to Decision→Recommendation）  
**Version:** Draft 0.1  
**Status:** Open — Placeholder Baseline  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-16.0（Decision / Audit / Reasoning / Recommendation — CLOSED / Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-17.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_17_0.md`  

---

## 1. Registration Declaration

本書は **ASA-ARCH-16.0 完了後**の次期 Architecture Baseline の初期プレースホルダである。

* Based on Architecture 16.0（immutable frozen baseline）  
* Architecture 17.0 SHALL NOT modify Architecture 16.0 or 15.0  
* Draft 0.1 は構造枠のみ — 本番規範としては未確定  

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

## 3. Change Summary（Placeholder）

```text
TBD — document deltas from ASA-ARCH-16.0 here when scope is approved.
```

| Area | Planned change | Status |
|---|---|---|
| Presentation / NL | Natural language presentation over Recommendation | Not defined |

---

## 4. Roadmap（Placeholder）

```text
TBD — child IMPL-REQ / CR roadmap for Architecture 17.0.
```

| Order | Request / Spec | Status |
|---|---|---|
| — | （placeholder） | Not issued |

---

## 5. Dependency Inheritance

Until Architecture 17.0 is formally scoped, Decision→Recommendation dependencies remain as defined by **frozen ASA-ARCH-16.0**:

```text
Recommendation → Reasoning → Audit → Decision → Checker → Graph → Query → Facade → Store
```

---

## 6. Status

| Field | Value |
|---|---|
| Registration | Open — Placeholder |
| Spec version | Draft 0.1 |
| Based on | ASA-ARCH-16.0 Final（CLOSED / Frozen） |
| Production SoT for Decision→Recommendation | **ASA-ARCH-16.0（frozen）** until 17.0 is Registered |

---

## 7. Governance

| Role | Rule |
|---|---|
| SoT | Not yet — Decision→Recommendation production SoT remains ASA-ARCH-16.0 |
| Editable baseline | **ASA-ARCH-17.0 only**（among active drafts） |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` or `ASA-ARCH-16.0.md` |
