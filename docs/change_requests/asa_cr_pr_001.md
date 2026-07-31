# Change Request — ASA-CR-PR-001

**CR ID:** ASA-CR-PR-001  
**Title:** Architecture Consistency Alignment（Pull Request Trace）  
**Target:** ASA-IMPL-PR-1.0 — Pull Request Implementation Specification  
**Parent Architecture:** ASA-ARCH-14.0 — Traceability Layer  
**Depends On:** ASA-IMPL-TRACE-1.0, ASA-IMPL-COMMIT-1.0  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-PR-1.0（草案）と ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-IMPL-COMMIT-1.0 の不整合を解消する。

---

## Inconsistencies Found

| Item | Draft | SoT |
|---|---|---|
| Graph RelationType `merges` | 使用 | ASA-ARCH-14.0 §8 に **未定義**（新規は Architecture CR 必須） |
| `merge_ref.record_type` | `CMT` | RecordRef type = **`COMMIT`**；id = `CMT-[0-9]{5}` |
| `related_commits` | bare id strings | COMMIT **RecordRef** 配列に正規化 |
| `record_id` | 未明示 | ASA-IMPL-TRACE-1.0: **`PR-[0-9]{5}`** |

---

## Changes Applied

### 1. RelationType extension（ASA-ARCH-14.0）

Add Trace-layer relation:

```text
merges : PR → COMMIT
```

Existing ARCH-13 set remains: implements / supersedes / reverts / related_to / derived_from.  
PR Graph MAY use: `derived_from`, `supersedes`, `merges`, `related_to`.

### 2. merge_ref

```json
{
  "record_type": "COMMIT",
  "record_id": "CMT-xxxxx"
}
```

Optional until merge completes. When present: same-project existing COMMIT.

### 3. related_commits

Array of COMMIT RecordRefs；min 1；same project；existing CMT records.

### 4. record_id

```text
PR-[0-9]{5}
```

### 5. merge ancestry rule（clarified）

Runtime SHALL validate:

* all `related_commits` exist in the same project  
* when `merge_ref` present: target COMMIT exists in the same project  
* `merge_ref` SHOULD be linked to each related commit via `merges` / `related_to` / `derived_from` edges（or equivalent declared relations）  

Full git ancestry walk is optional when external git metadata is unavailable（TTP-008）.

---

## Updated Documents

* `docs/baselines/ASA-ARCH-14.0.md`
* `docs/specs/auto_scribe_ai_pr_implementation_specification.md`
* `docs/change_requests/asa_cr_pr_001.md`（本ファイル）

---

## Result

```text
CR Status: Applied
ASA-IMPL-PR-1.0 is consistent with
ASA-ARCH-14.0, ASA-IMPL-TRACE-1.0, ASA-IMPL-COMMIT-1.0.
Ready for: ASA-IMPL-REQ-PR-001
```
