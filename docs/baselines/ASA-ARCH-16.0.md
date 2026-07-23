# Architecture Baseline – ASA-ARCH-16.0

**Baseline ID:** ASA-ARCH-16.0  
**Title:** （TBD — successor to Trace Intelligence Layer）  
**Version:** Draft 0.1  
**Status:** Open — Placeholder Baseline  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-15.0（Trace Intelligence Layer — CLOSED / Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-16.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_16_0.md`  

---

## 1. Registration Declaration

本書は **ASA-ARCH-15.0 完了後**の次期 Architecture Baseline の初期プレースホルダである。

* Based on Architecture 15.0（immutable production baseline）  
* Architecture 16.0 SHALL NOT modify Architecture 15.0  
* 規範内容は今後の正式 CR / Architecture Review で確定する  
* Draft 0.1 は構造枠のみを提供し、本番規範としては未確定  

---

## 2. Previous Baseline Reference

| Field | Value |
|---|---|
| Previous | **ASA-ARCH-15.0** — Trace Intelligence Layer |
| Previous status | CLOSED — Immutable Production Baseline |
| Freeze tag | `arch-15.0-final` |
| Normative path | `docs/baselines/ASA-ARCH-15.0.md` |

ASA-ARCH-15.0 で完了した範囲（参照のみ・変更禁止）:

* Trace Query Layer  
* Trace Graph Engine  
* Trace Consistency Checker  
* Repository Facade  

---

## 3. Change Summary（Placeholder）

```text
TBD — document deltas from ASA-ARCH-15.0 here when scope is approved.
```

| Area | Planned change | Status |
|---|---|---|
| （placeholder） | — | Not defined |

---

## 4. Roadmap（Placeholder）

```text
TBD — child IMPL-REQ / CR roadmap for Architecture 16.0.
```

| Order | Request / Spec | Status |
|---|---|---|
| — | （placeholder） | Not issued |

---

## 5. Dependency Inheritance

Until Architecture 16.0 is formally scoped, runtime Trace Intelligence dependencies remain as defined by **frozen ASA-ARCH-15.0**:

```text
Checker → Graph → Query → Repository Facade → Store
```

---

## 6. Status

| Field | Value |
|---|---|
| Registration | Open — Placeholder |
| Spec version | Draft 0.1 |
| Based on | ASA-ARCH-15.0 Final（CLOSED） |
| Production SoT for Trace Intelligence | **ASA-ARCH-15.0（frozen）** until 16.0 is Registered |

---

## 7. Governance

| Role | Rule |
|---|---|
| SoT | Not yet — Trace Intelligence production SoT remains ASA-ARCH-15.0 |
| Changes | Formal CR required before elevating Draft → Registered |
| Constraint | MUST NOT mutate `docs/baselines/ASA-ARCH-15.0.md` |
