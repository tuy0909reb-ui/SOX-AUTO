# ASA-IMPL-PR-1.0 — Pull Request Implementation Specification

**Spec ID:** ASA-IMPL-PR-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Implemented)  
**Parent Baseline:** ASA-ARCH-14.0  
**Derived From:** ASA-IMPL-TRACE-1.0（Base Trace abstraction）  
**Depends On:** ASA-ARCH-14.0, ASA-IMPL-TRACE-1.0, **ASA-IMPL-COMMIT-1.0**, ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-DSEARCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase14 / Traceability Layer  
**Path:** `docs/specs/auto_scribe_ai_pr_implementation_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-14.0.md`  
**CR Applied:** **ASA-CR-PR-001**；**ASA-CR-PR-002**；**ASA-CR-PR-STORE-001**（PR Store）  
**Registration ID:** ASA-IMPL-REG-PR-001  

---

# 1. Purpose

PR は TRACE 抽象の **具象派生モデル**であり、複数 COMMIT を束ねる変更提案（Pull / Merge Request）証跡を append-only で永続化する。

```text
TRACE（abstract — not persisted）
  ├── COMMIT（ASA-IMPL-COMMIT-1.0）
  └── PR（this specification）
```

* TRACE は直接インスタンス化・永続化しない（TTP-001）
* PR は Base Trace を継承し、COMMIT 記録に依存する
* Knowledge（DEC / IMP / REV）は改変しない

---

# 2. Inheritance（Base Trace）

PR SHALL inherit ASA-IMPL-TRACE-1.0 Base Trace contracts, including:

* `record_id` / `record_type` / `project_id`
* `title` / `summary`（PR では `summary` を必須化）
* `description`（optional）
* `related_knowledge` / `relations`
* `created_by.actor`（ActorType / ASA-ARCH-13.0）
* `created_by.source`（TraceSourceType / ASA-ARCH-14.0）
* `timestamp`
* `external_ref`（optional）

`record_type` MUST be **`PR`**.  
Value `TRACE` is forbidden.

---

# 3. PR-Specific Schema

> PR inherits all Base Trace fields.  
> Below shows PR-specific fields **in addition to** inherited fields.

```json
{
  "record_id": "PR-xxxxx",
  "record_type": "PR",
  "project_id": "PRJ-xxxxx",

  "source_branch": "string",
  "target_branch": "string",

  "merge_ref": {
    "record_type": "COMMIT",
    "record_id": "CMT-xxxxx"
  },

  "related_commits": [
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

---

# 4. Required / Optional

**Required**

* record_id（Runtime: `PR-[0-9]{5}`）
* record_type = `PR`
* project_id
* summary（1〜4096）
* source_branch / target_branch（non-empty；must differ）
* related_commits（min 1；COMMIT RecordRefs；same project）
* decision_ref（existing DEC；same project）
* created_by.actor / created_by.source
* timestamp

**Optional**

* merge_ref（COMMIT RecordRef；same project；omit until merge completes）
* description
* relations / related_knowledge / external_ref / title

---

# 5. Validation Matrix（Final / ASA-CR-PR-001）

| Field / Rule | Validation |
|---|---|
| record_id | Runtime；`PR-[0-9]{5}`；canonical；unique |
| record_type | const `PR` |
| project_id | Existing Project |
| source_branch / target_branch | Non-empty；**source ≠ target** |
| related_commits | Array of COMMIT RecordRefs；**min 1**；existing；**same project** |
| merge_ref | Optional；when present → COMMIT RecordRef；existing；**same project** |
| merge integrity | When merge_ref present: related_commits linkage via `merges` / declared relations（git ancestry MAY when available） |
| decision_ref | DEC RecordRef；existing；same project |
| relations | RelationType ∈ {derived_from, supersedes, merges, related_to}（+ Architecture set as needed） |
| created_by | ActorType + TraceSourceType |
| timestamp | ISO8601 UTC |
| Immutability | Append-only；update → new PR + `supersedes` |
| Knowledge mutation | **PR SHALL NOT modify DEC / IMP / REV / COMMIT contents** |

---

# 6. Storage

```text
/data/projects/{project_id}/records/PR-xxxxx.json
```

* UTF-8 JSON  
* Append-only  
* Project-scoped sequence: `PR-00001`, …  

---

# 7. Store / Repository

### PR Store

* write-once create  
* get by record_id（project-scoped）  
* list / filter by project_id, source_branch, target_branch  
* `all_search_projections()` for DSEARCH  

### PR Repository

* create_pr(payload)  
* validate DEC / related_commits / merge_ref（same project）  
* ensure source_branch ≠ target_branch  
* reject Base TRACE persistence  
* propagate relations to Trace Graph  

---

# 8. Runtime Integration

```text
Runtime SHALL register PR only via explicit Trace capture
(Runtime / CLI / API / Connector / User Operation).

Runtime SHALL:
- allocate PR-xxxxx
- validate DEC exists in the same project
- validate every related_commits COMMIT exists in the same project
- validate merge_ref (when present) exists in the same project
- ensure source_branch != target_branch
- write append-only JSON
- update index / relation / DSEARCH projections with create

Runtime MUST NOT:
- instantiate TRACE
- mutate DEC / IMP / REV / COMMIT records
```

Update:

```text
Update request
  ↓
new PR record
  ↓
RelationType = supersedes
```

---

# 9. DSEARCH Integration

PR participates as Trace-derived（TTP-010）:

```text
record_type = PR
```

Filters SHALL support at least:

* `project_id`
* `record_id`
* `source_branch`
* `target_branch`

TRACE itself SHALL NOT appear as a persisted search hit.

---

# 10. Trace Graph Integration

```text
Graph node type: PR

Relation types (ASA-CR-PR-001):
- derived_from
- supersedes
- merges          （PR → COMMIT）
- related_to      （e.g. → DEC）

Graph SHALL expose bidirectional traversal
(DSEARCH depth / visited / cycle rules apply).
```

Typical workflow:

```text
DEC
 ↓
ISSUE
 ↓
COMMIT
 ↓
PR
 ↓
RELEASE
```

PR aggregates one or more COMMIT records and provides implementation evidence linking implementation to RELEASE.

（SoT: ASA-ARCH-14.0 Traceability Flow / ASA-CR-PR-002）

---

# 11. Example（Final）

```json
{
  "record_id": "PR-00012",
  "record_type": "PR",
  "project_id": "PRJ-0001",

  "summary": "Tag list renderer PR",
  "description": "Bundles commits for Watch List tag display",

  "source_branch": "feature/tag-list",
  "target_branch": "main",

  "merge_ref": {
    "record_type": "COMMIT",
    "record_id": "CMT-00050"
  },

  "related_commits": [
    { "record_type": "COMMIT", "record_id": "CMT-00042" },
    { "record_type": "COMMIT", "record_id": "CMT-00043" }
  ],

  "decision_ref": {
    "record_type": "DEC",
    "record_id": "DEC-00015"
  },

  "relations": [
    {
      "type": "merges",
      "target": { "record_type": "COMMIT", "record_id": "CMT-00050" }
    },
    {
      "type": "related_to",
      "target": { "record_type": "DEC", "record_id": "DEC-00015" }
    }
  ],

  "created_by": {
    "actor": "Human",
    "source": "GitHub"
  },

  "timestamp": "2026-07-22T16:00:00Z"
}
```

---

# 12. Implementation Checklist

### Base Layer

- [ ] Inherit Base Trace abstraction  
- [ ] Validate decision_ref（DEC linkage；same project）  
- [ ] Ensure project_id consistency  

### PR Model

- [ ] Schema（`PR-[0-9]{5}`, branches, merge_ref, related_commits）  
- [ ] source_branch ≠ target_branch  
- [ ] related_commits min 1；same-project COMMIT RecordRefs  
- [ ] merge_ref optional COMMIT RecordRef  
- [ ] RelationType: derived_from / supersedes / merges / related_to  

### Store / Repository / Runtime

- [ ] PR Store / Repository  
- [ ] Search by project_id / record_id / source_branch / target_branch  
- [ ] Runtime registration + validations  
- [ ] Duplicate prevention；relation propagation  

### Search / Graph / Tests

- [ ] DSEARCH integration + filters  
- [ ] Graph node PR + bidirectional traversal  
- [ ] Model / Store / Graph / DSEARCH tests  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-PR-1.0 |
| Title | Pull Request Implementation Specification |
| Parent Baseline | ASA-ARCH-14.0 |
| Derived From | ASA-IMPL-TRACE-1.0 |
| Depends On | ASA-IMPL-COMMIT-1.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-PR-001 |
| Change Request | ASA-CR-PR-001 / ASA-CR-PR-002 |
| Next | ASA-IMPL-ISSUE-1.0 Registered → ASA-IMPL-RELEASE-1.0 |
