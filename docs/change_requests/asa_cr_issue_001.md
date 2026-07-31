# Change Request — ASA-CR-ISSUE-001

**CR ID:** ASA-CR-ISSUE-001  
**Title:** Architecture Consistency Alignment（Issue Trace）  
**Target:** ASA-IMPL-ISSUE-1.0 — Issue Implementation Specification  
**Parent Architecture:** ASA-ARCH-14.0 — Traceability Layer  
**Depends On:** ASA-IMPL-TRACE-1.0, ASA-IMPL-COMMIT-1.0, ASA-IMPL-PR-1.0  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-ISSUE-1.0（草案）と ASA-ARCH-14.0 / TRACE / COMMIT / PR の不整合を解消する。

---

## Inconsistencies Found

| Item | Draft | SoT / Resolution |
|---|---|---|
| SeverityEnum / StatusEnum | 「Architecture Enum」参照 | ASA-ARCH-14.0 に **未定義** → TraceIssueSeverity / TraceIssueStatus を追加 |
| `related_commit[].record_type` | `CMT` | RecordRef type = **`COMMIT`**；id = `CMT-[0-9]{5}` |
| ISSUE → PR uses `merges` | 草案 | `merges` は **PR → COMMIT**（ASA-CR-PR-001）→ ISSUE→PR は **`related_to`** |
| Status mutation | Trace Event（未定義型） | TTP-004: **新 ISSUE + supersedes**（append-only） |
| `record_id` | 未明示 | ASA-IMPL-TRACE-1.0: **`ISSUE-[0-9]{5}`** |

---

## Changes Applied

### 1. Architecture enums（ASA-ARCH-14.0）

**TraceIssueSeverity**

```text
Critical
High
Medium
Low
```

**TraceIssueStatus**

```text
Open
InProgress
Resolved
Closed
```

### 2. RecordRef alignment

```json
"related_commit": [
  { "record_type": "COMMIT", "record_id": "CMT-xxxxx" }
]
```

`related_pr` remains `{ "record_type": "PR", "record_id": "PR-xxxxx" }`.

### 3. Graph RelationTypes

| Edge | RelationType |
|---|---|
| ISSUE → COMMIT（fix） | `related_to` |
| COMMIT → ISSUE（origin） | `derived_from` |
| ISSUE → PR（resolution linkage） | `related_to` |
| ISSUE → DEC | `related_to` / `derived_from` |
| ISSUE update chain | `supersedes` |

`merges` remains **PR → COMMIT only**.

### 4. Status transitions（append-only）

```text
Status change
  ↓
new ISSUE record (new ISSUE-xxxxx)
  ↓
RelationType = supersedes
  ↓
created_by.actor / created_by.source recorded on the new record
```

Runtime MAY suggest Closed when linked PR is merged；Human/System confirmation still creates a new ISSUE via supersedes.

### 5. decision_ref

Optional（informational ISSUE may omit）. When present: existing DEC；same project.

---

## Updated Documents

* `docs/baselines/ASA-ARCH-14.0.md`
* `docs/specs/auto_scribe_ai_issue_implementation_specification.md`
* `docs/change_requests/asa_cr_issue_001.md`（本ファイル）

---

## Result

```text
CR Status: Applied
ASA-IMPL-ISSUE-1.0 is consistent with
ASA-ARCH-14.0, TRACE, COMMIT, PR.
Ready for: ASA-IMPL-REQ-ISSUE-001
```
