# Change Request — ASA-CR-REV-001

**CR ID:** ASA-CR-REV-001  
**Title:** Architecture Consistency Alignment（Revert Memory）  
**Target:** ASA-IMPL-REV-1.0 — Revert Memory Specification  
**Parent Architecture:** ASA-ARCH-13.0 — Knowledge Architecture  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-REV-1.0（草案）と ASA-ARCH-13.0 の RelationType / REV 責務記述の不整合を解消する。  

Architecture Baseline を Source of Truth としつつ、§5.4（「IMP に撤回理由の正本を持たせない（正本は REV）」）と整合するよう、`reverts` の対象と REV 責務を明確化する。

本CRは Knowledge Layer の意味を拡張解釈するものではなく、既存 DKM / Separation Rules と整合させるための修正である。

---

## Inconsistency Found

| Item | ASA-ARCH-13.0（before） | ASA-IMPL-REV-1.0 Draft |
|---|---|---|
| RelationType `reverts` | REV → **DEC** only | MUST target **IMP** |
| REV purpose | 決定の撤回・巻き戻し | 既存 **IMP** を取り消した事実と理由 |
| Separation (§5.4) | IMP 撤回理由の正本は REV | （草案と一致） |

---

## Changes Applied

### 1. RelationType `reverts`（ASA-ARCH-13.0 §9）

| Before | After |
|---|---|
| `reverts` : REV → DEC | `reverts` : REV → DEC **and/or** REV → IMP |

Rules:

* DKM-006: REV MUST reference the affected Decision via required field `related_decision`（RecordRef DEC; Active at creation）
* When an Implementation is undone, RelationType=`reverts` MUST target that IMP（and `reverted_implementation` MUST match）
* REV → REV with `reverts` SHALL be rejected

### 2. REV Responsibilities（ASA-ARCH-13.0 §5.3）

Clarify that REV records:

* withdrawal / rollback of a Decision impact path, **and/or**
* explicit revert of an Implementation（How の取り消し）

while keeping DKM-006（related DEC required） and append-only / immutable.

### 3. Glossary

| Term | After |
|---|---|
| Revert Memory (REV) | Implementation および／または Decision 影響の撤回・巻き戻しを記録する |

### 4. ASA-IMPL-REV-1.0

草案を上記整合のうえ **Registered — Ready for Coding** として登録。  
Enums（DecisionStatus / ImplementationStatus / ActorType / SourceType / RelationType / RecordRef）は ASA-ARCH-13.0 を参照し、独自定義しない。

---

## Updated Documents

* `docs/baselines/ASA-ARCH-13.0.md`
* `docs/specs/auto_scribe_ai_revert_memory_specification.md`
* `docs/change_requests/asa_cr_rev_001.md`（本ファイル）

---

## Result

```text
CR Status: Applied
Implementation Specification is now fully consistent
with Architecture Baseline (ASA-ARCH-13.0).
Ready for: ASA-IMPL-REQ-REV-001
```
