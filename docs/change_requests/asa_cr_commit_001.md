# Change Request — ASA-CR-COMMIT-001

**CR ID:** ASA-CR-COMMIT-001  
**Title:** Architecture Consistency Alignment（Commit Trace）  
**Target:** ASA-IMPL-COMMIT-1.0 — Commit Implementation Specification  
**Parent Architecture:** ASA-ARCH-14.0 — Traceability Layer  
**Depends On:** ASA-IMPL-TRACE-1.0  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-COMMIT-1.0（草案）と ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 の不整合を解消する。

---

## Inconsistencies Found

| Item | Draft | SoT |
|---|---|---|
| `record_id` prefix | `COMMIT-xxxxx` | ASA-IMPL-TRACE-1.0: **`CMT-[0-9]{5}`** |
| COMMIT → IMP RelationType | `implements` | ASA-ARCH-14.0 §8: **`related_to` / `derived_from`**（`implements` は IMP → DEC） |
| Inherited metadata | `trace_status` 等 | Base Trace: **`created_by.actor` / `created_by.source`（TraceSourceType）** — `trace_status` 未定義 |

---

## Changes Applied

### 1. record_id

```text
CMT-[0-9]{5}
```

`record_id` remains the canonical identifier. `commit_hash` optional; unique within `project_id` when present.

### 2. RelationType（COMMIT → Knowledge）

* COMMIT → IMP / DEC / REV: **`related_to`** or **`derived_from`**
* `decision_ref`（DEC RecordRef）は必須の直接リンク
* `implements` は Knowledge の IMP → DEC 用として維持（COMMIT では使用しない）

### 3. Inherited Base Trace fields

Inherit ASA-IMPL-TRACE-1.0 Base fields（`created_by`, `timestamp`, `related_knowledge`/`relations`, `external_ref`, …）.  
Do **not** introduce `trace_status` in COMMIT without a Base Trace / Architecture definition.

### 4. commit_hash format（when present）

Align with IMP `commit_id` practice: **40 or 64 hex** Git object ID.

---

## Updated Documents

* `docs/specs/auto_scribe_ai_commit_implementation_specification.md`
* `docs/change_requests/asa_cr_commit_001.md`（本ファイル）

---

## Result

```text
CR Status: Applied
ASA-IMPL-COMMIT-1.0 is consistent with
ASA-ARCH-14.0 and ASA-IMPL-TRACE-1.0.
Ready for: ASA-IMPL-REQ-COMMIT-001
```
