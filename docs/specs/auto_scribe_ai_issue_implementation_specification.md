# ASA-IMPL-ISSUE-1.0 — Issue Implementation Specification

**Spec ID:** ASA-IMPL-ISSUE-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Implemented)  
**Parent Baseline:** ASA-ARCH-14.0  
**Derived From:** ASA-IMPL-TRACE-1.0（Base Trace abstraction）  
**Depends On:** ASA-ARCH-14.0, ASA-IMPL-TRACE-1.0, **ASA-IMPL-COMMIT-1.0**, **ASA-IMPL-PR-1.0**, ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-DSEARCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase14 / Traceability Layer  
**Path:** `docs/specs/auto_scribe_ai_issue_implementation_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-14.0.md`  
**CR Applied:** **ASA-CR-ISSUE-001**（Architecture Consistency Alignment）  
**Registration ID:** ASA-IMPL-REG-ISSUE-001  

---

# 1. Purpose

ISSUE は TRACE 抽象の **具象派生モデル**であり、DEC に基づく課題・不具合・改善要求を append-only で永続化する。

```text
TRACE（abstract — not persisted）
  ├── COMMIT（ASA-IMPL-COMMIT-1.0）
  ├── PR（ASA-IMPL-PR-1.0）
  └── ISSUE（this specification）
```

* TRACE は直接インスタンス化・永続化しない（TTP-001）
* ISSUE は Base Trace を継承し、COMMIT / PR 記録に依存する
* Knowledge（DEC / IMP / REV）は改変しない（ISSUE SHALL NOT modify DEC）

---

# 2. Inheritance（Base Trace）

ISSUE SHALL inherit ASA-IMPL-TRACE-1.0 Base Trace contracts, including:

* `record_id` / `record_type` / `project_id`
* `title` / `summary`（ISSUE では `summary` を必須化）
* `description`（optional）
* `related_knowledge` / `relations`
* `created_by.actor`（ActorType / ASA-ARCH-13.0）
* `created_by.source`（TraceSourceType / ASA-ARCH-14.0）
* `timestamp`
* `external_ref`（optional）

`record_type` MUST be **`ISSUE`**.  
Value `TRACE` is forbidden.

---

# 3. ISSUE-Specific Schema

> ISSUE inherits all Base Trace fields.  
> Below shows ISSUE-specific fields **in addition to** inherited fields.

```json
{
  "record_id": "ISSUE-xxxxx",
  "record_type": "ISSUE",
  "project_id": "PRJ-xxxxx",

  "severity": "TraceIssueSeverity",
  "status": "TraceIssueStatus",

  "related_pr": [
    {
      "record_type": "PR",
      "record_id": "PR-xxxxx"
    }
  ],

  "related_commit": [
    {
      "record_type": "COMMIT",
      "record_id": "CMT-xxxxx"
    }
  ],

  "decision_ref": {
    "record_type": "DEC",
    "record_id": "DEC-xxxxx"
  },

  "created_by": {
    "actor": "ActorType",
    "source": "TraceSourceType"
  },

  "timestamp": "ISO8601"
}
```

*Inherited fields such as `summary`, `description`, `relations` are defined by Base Trace and omitted here for brevity.*

---

# 4. Required / Optional

**Required**

* record_id（Runtime: `ISSUE-[0-9]{5}`）
* record_type = `ISSUE`
* project_id
* summary（1〜4096）
* severity（TraceIssueSeverity）
* status（TraceIssueStatus）
* created_by.actor / created_by.source
* timestamp

**Optional**

* related_pr（PR RecordRef[]；same project；empty allowed if informational）
* related_commit（COMMIT RecordRef[]；same project；empty allowed if informational）
* decision_ref（DEC RecordRef；same project；omit when not derived from DEC）
* description
* relations / related_knowledge / external_ref / title

---

# 5. Validation Matrix（Final / ASA-CR-ISSUE-001）

| Field / Rule | Validation |
|---|---|
| record_id | Runtime；`ISSUE-[0-9]{5}`；canonical；unique within project |
| record_type | Must be `ISSUE` |
| project_id | Must match parent architecture / store scope |
| severity | TraceIssueSeverity（Critical / High / Medium / Low） |
| status | TraceIssueStatus（Open / InProgress / Resolved / Closed） |
| related_pr | Each ref: existing PR；same project；no duplicates |
| related_commit | Each ref: `record_type=COMMIT`；existing CMT；same project；no duplicates |
| decision_ref | When present: existing DEC；same project |
| related_pr / related_commit | MAY be empty（informational ISSUE） |
| decision_ref | MAY be omitted |
| Base Trace fields | Per ASA-IMPL-TRACE-1.0 |

---

# 6. Enums（Architecture SoT）

## TraceIssueSeverity

```text
Critical
High
Medium
Low
```

## TraceIssueStatus

```text
Open
InProgress
Resolved
Closed
```

---

# 7. Runtime Behavior

## 7.1 Registration

* Runtime SHALL register ISSUE only as a derived Trace model（never as abstract TRACE）
* Runtime SHALL allocate `ISSUE-[0-9]{5}` project-scoped
* Runtime SHALL reject duplicate `record_id`
* Runtime SHALL validate `decision_ref` existence when provided
* Runtime SHALL validate all `related_pr` / `related_commit` exist within the same project
* Runtime SHALL reject duplicate entries within `related_pr`
* Runtime SHALL reject duplicate entries within `related_commit`
* Runtime SHALL reject `related_commit[].record_type` other than `COMMIT`

## 7.2 Status transitions（append-only）

ISSUE records are append-only. Status changes MUST NOT mutate an existing ISSUE file.

```text
Status change requested
  ↓
new ISSUE record (new ISSUE-xxxxx, new status)
  ↓
RelationType = supersedes → previous ISSUE
  ↓
created_by.actor / created_by.source recorded on the new record
```

* Runtime SHALL create a new ISSUE + `supersedes` for every status transition
* Runtime SHALL record actor and source on each superseding ISSUE
* Runtime MAY suggest transition to `Closed` based on linked PR merge state
* Suggestion is advisory only；confirmed transition still creates a new ISSUE via supersedes

## 7.3 Relation propagation

Runtime SHALL propagate Graph edges per §8 when ISSUE is created or superseded.

---

# 8. Graph

| Node | Type |
|---|---|
| ISSUE | Trace derived node |

| Edge | RelationType |
|---|---|
| ISSUE → COMMIT（fix linkage） | `related_to` |
| COMMIT → ISSUE（origin of fix） | `derived_from` |
| ISSUE → PR（resolution linkage） | `related_to` |
| ISSUE → DEC | `related_to` / `derived_from` |
| ISSUE (new) → ISSUE (old) | `supersedes` |

* `merges` remains **PR → COMMIT only**（ASA-CR-PR-001 / ASA-CR-ISSUE-001）
* Graph SHALL expose bidirectional traversal
* Allowed RelationTypes for ISSUE edges: `derived_from`, `related_to`, `supersedes`（and Knowledge edges as needed）

---

# 9. Search（DSEARCH）

* DSEARCH SHALL include ISSUE derived records（not abstract TRACE）
* Filters SHALL support at least:

```text
project_id
record_id
severity
status
decision_ref
```

---

# 10. Storage

```text
/data/projects/{project_id}/records/ISSUE-{xxxxx}.json
```

* UTF-8 JSON  
* Append-only  
* Project-scoped counters  

---

# 11. Design Notes

* ISSUE は TRACE の派生モデルであり、COMMIT／PR 仕様に依存する
* Base Trace から共通メタデータ（source, actor, summary, description）を継承する
* `record_id` は常に正本識別子（`ISSUE-[0-9]{5}`）
* Event Layer `ISS-*` と Trace ISSUE `ISSUE-*` は識別子体系で区別する（ASA-ARCH-14.0）
* Integration path: DEC → ISSUE → COMMIT → PR → RELEASE（ASA-ARCH-14.0 Traceability Flow）
* ISSUE SHALL NOT modify DEC records；Knowledge remains immutable

---

# 12. Implementation Checklist

### Base Layer

- [x] Inherit Base Trace abstraction
- [x] Validate decision_ref（DEC linkage）when present
- [x] Ensure project_id consistency with parent architecture

### ISSUE Model

- [x] record_id follows `ISSUE-[0-9]{5}`
- [x] severity uses TraceIssueSeverity
- [x] status uses TraceIssueStatus
- [x] related_pr references existing PR in same project
- [x] related_commit references existing COMMIT in same project（type=`COMMIT`）
- [x] related_pr / related_commit reject duplicates
- [x] related_pr / related_commit MAY be empty
- [x] decision_ref MAY be omitted
- [x] record_id remains canonical identifier

### Runtime

- [x] Runtime ISSUE registration
- [x] Validate DEC existence when decision_ref present
- [x] Validate related_pr / related_commit same-project existence
- [x] Reject duplicate related_pr / related_commit refs
- [x] Status transition → new ISSUE + supersedes
- [x] Record actor/source on each superseding ISSUE
- [ ] MAY suggest Closed based on linked PR merge state
- [x] Duplicate prevention（record_id uniqueness）
- [x] Relation propagation to Trace Graph

### Validation

- [x] record_id uniqueness
- [x] project consistency
- [x] decision existence（when present）
- [x] related_pr integrity
- [x] related_commit integrity
- [x] duplicate reference detection
- [x] severity validity
- [x] status validity

### Graph

- [x] Graph node type: ISSUE
- [x] ISSUE → COMMIT: related_to
- [ ] COMMIT → ISSUE: derived_from（COMMIT-owned edge；ISSUE does not mutate COMMIT）
- [x] ISSUE → PR: related_to
- [x] Status chain: supersedes
- [x] Bidirectional traversal

### Search

- [x] DSEARCH integration for ISSUE
- [x] Filter by project_id, record_id, severity, status, decision_ref

---

# 13. Out of Scope

* ISSUE ticket sync UI beyond Trace persistence
* Automatic ISSUE close without supersedes record
* Using `merges` for ISSUE → PR
* Mutating DEC / IMP / REV from ISSUE Runtime
* RELEASE model（ASA-IMPL-RELEASE-1.0）

---

# 14. Completion Status

| Item | Status |
|---|---|
| Spec registration | Complete |
| CR Applied | ASA-CR-ISSUE-001 |
| IMPL-REQ | ASA-IMPL-REQ-ISSUE-001 — Issued — Implemented |
| Architecture alignment | ASA-ARCH-14.0 + TRACE + COMMIT + PR |
| Coding | Implemented |
| Next | ASA-IMPL-RELEASE-1.0（Release Implementation Specification） |
