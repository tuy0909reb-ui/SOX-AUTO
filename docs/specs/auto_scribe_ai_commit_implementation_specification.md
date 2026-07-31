# ASA-IMPL-COMMIT-1.0 — Commit Implementation Specification

**Spec ID:** ASA-IMPL-COMMIT-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-14.0  
**Derived From:** ASA-IMPL-TRACE-1.0（Base Trace abstraction）  
**Depends On:** ASA-ARCH-14.0, ASA-IMPL-TRACE-1.0, ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0, ASA-IMPL-DSEARCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase14 / Traceability Layer  
**Path:** `docs/specs/auto_scribe_ai_commit_implementation_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-14.0.md`  
**CR Applied:** **ASA-CR-COMMIT-001**（Architecture Consistency Alignment）  
**Registration ID:** ASA-IMPL-REG-COMMIT-001  

---

# 1. Purpose

COMMIT は TRACE 抽象の **具象派生モデル**であり、Git Commit 等の実装証跡を append-only で永続化する。

```text
TRACE（abstract — not persisted）
  └── COMMIT（this specification）
```

* TRACE は直接インスタンス化・永続化しない（TTP-001）
* COMMIT は Base Trace メタデータを継承し、COMMIT 固有フィールドを追加する
* Knowledge（DEC / IMP / REV）は改変しない。Trace は証跡のみを追加する

---

# 2. Inheritance（Base Trace）

COMMIT SHALL inherit ASA-IMPL-TRACE-1.0 Base Trace contracts, including:

* `record_id` / `record_type` / `project_id`
* `title` / `summary`（COMMIT では `summary` を必須化）
* `related_knowledge` / `relations`
* `created_by.actor`（ActorType / ASA-ARCH-13.0）
* `created_by.source`（TraceSourceType / ASA-ARCH-14.0）
* `timestamp`
* `external_ref`（optional）

`record_type` MUST be **`COMMIT`**.  
Value `TRACE` is forbidden.

Enums are Architecture SoT only — not redefined here.

---

# 3. COMMIT-Specific Schema

> COMMIT inherits all Base Trace fields.  
> Below shows COMMIT-specific fields **in addition to** inherited fields.

```json
{
  "record_id": "CMT-xxxxx",
  "record_type": "COMMIT",
  "project_id": "PRJ-xxxxx",

  "commit_hash": "string",
  "summary": "string",
  "description": "string",

  "files_changed": ["src/main.py"],

  "decision_ref": {
    "record_type": "DEC",
    "record_id": "DEC-xxxxx"
  },

  "relations": [
    {
      "type": "related_to",
      "target": {
        "record_type": "IMP",
        "record_id": "IMP-xxxxx"
      }
    }
  ],

  "created_by": {
    "actor": "ActorType",
    "source": "TraceSourceType"
  },

  "timestamp": "ISO8601",

  "external_ref": {
    "system": "TraceSourceType",
    "url": "string",
    "native_id": "string"
  }
}
```

---

# 4. Required / Optional

**Required**

* record_id（Runtime: `CMT-[0-9]{5}`）
* record_type = `COMMIT`
* project_id
* summary（1〜4096）
* files_changed（min 1；normalized POSIX project/repo-relative paths）
* decision_ref（existing DEC；same project）
* created_by.actor / created_by.source
* timestamp

**Optional**

* commit_hash（when present: 40 or 64 hex；unique within project_id）
* description（1〜4096）
* relations
* related_knowledge
* external_ref
* title（Base；省略時は summary を用いてよい）

---

# 5. Validation Matrix（Final / ASA-CR-COMMIT-001）

| Field / Rule | Validation |
|---|---|
| record_id | Runtime；`CMT-[0-9]{5}`；canonical identifier；unique |
| record_type | const `COMMIT` |
| project_id | Existing Project |
| commit_hash | Optional；if present → 40/64 hex **and** unique within project_id |
| summary | 1〜4096 |
| description | Optional；1〜4096 |
| files_changed | Unique normalized repo-relative POSIX paths；min 1 |
| decision_ref | RecordRef DEC；existing；**same project** |
| relations | RelationType + RecordRef（ASA-ARCH-13.0 / ASA-ARCH-14.0） |
| COMMIT → IMP/DEC/REV edge | `related_to` or `derived_from`（not `implements`） |
| created_by | ActorType + TraceSourceType |
| timestamp | ISO8601 UTC |
| Immutability | Append-only；update → new CMT + `supersedes` |
| Knowledge mutation | **COMMIT SHALL NOT modify DEC / IMP / REV records** |

### Path Normalization

```text
- resolve "." / ".."
- remove leading "./"
- collapse duplicate separators
- repository / project-relative POSIX only
```

---

# 6. Storage

```text
/data/projects/{project_id}/records/CMT-xxxxx.json
```

* UTF-8 JSON  
* Append-only  
* Project-scoped sequence: `CMT-00001`, …  

Duplicate prevention key（when `commit_hash` present）:

```text
(project_id, commit_hash) → unique
```

When `commit_hash` omitted, uniqueness is by `record_id` only；connectors SHOULD supply `external_ref.native_id` when available（TTP-009）.

---

# 7. Store / Repository

### COMMIT Store

* write-once create  
* get by record_id（project-scoped key）  
* lookup by `(project_id, commit_hash)` when hash present  
* `all_search_projections()` for DSEARCH  

### COMMIT Repository

* create_commit(payload)  
* validate decision_ref existence + same project  
* validate path normalization + commit_hash uniqueness  
* reject Base TRACE persistence  
* propagate relations to shared Relation / Trace Graph layer  

---

# 8. Runtime Integration

```text
Runtime SHALL register COMMIT only via explicit Trace capture
(Runtime / CLI / API / Connector / User Operation).

Runtime SHALL:
- allocate CMT-xxxxx
- validate DEC exists in the same project
- normalize files_changed
- enforce commit_hash uniqueness when provided
- write append-only JSON
- update index / relation / DSEARCH projections transactionally with create

Runtime MUST NOT:
- instantiate TRACE
- mutate DEC / IMP / REV
```

Update:

```text
Update request
  ↓
new COMMIT record
  ↓
RelationType = supersedes
```

---

# 9. DSEARCH Integration

COMMIT participates as a Trace-derived document（TTP-010）:

```text
record_type = COMMIT
```

Filters SHALL support at least:

* `project_id`
* `record_id`
* `commit_hash`（when indexed / present）

TRACE itself SHALL NOT appear as a persisted search hit（only derived models）.

---

# 10. Trace Graph Integration

```text
Graph node type: COMMIT

Edges:
- decision_ref → DEC（implied related_to / explicit relation）
- relations[] using related_to | derived_from | supersedes | reverts
  （reverts only when targeting allowed Knowledge / Trace ids per RelationType rules）

Graph SHALL expose bidirectional traversal
(DSEARCH depth / visited / cycle rules apply).
```

COMMIT is an **implementation evidence node** in Trace Graph.  
It does not replace IMP； it evidences linkage to Knowledge.

---

# 11. Example（Final）

```json
{
  "record_id": "CMT-00042",
  "record_type": "COMMIT",
  "project_id": "PRJ-0001",

  "commit_hash": "abcdefghijklmnopqrstuvwxyz0123456789abcd",
  "summary": "Apply tag list renderer",
  "description": "Implements Watch List tag display",

  "files_changed": [
    "src/runtime/watch_renderer.py"
  ],

  "decision_ref": {
    "record_type": "DEC",
    "record_id": "DEC-00015"
  },

  "relations": [
    {
      "type": "related_to",
      "target": {
        "record_type": "IMP",
        "record_id": "IMP-00042"
      }
    }
  ],

  "created_by": {
    "actor": "AI",
    "source": "GitHub"
  },

  "timestamp": "2026-07-22T15:00:00Z",

  "external_ref": {
    "system": "GitHub",
    "url": "https://github.com/org/repo/commit/abcdefghijklmnopqrstuvwxyz0123456789abcd",
    "native_id": "abcdefghijklmnopqrstuvwxyz0123456789abcd"
  }
}
```

---

# 12. Implementation Checklist

### Base Layer

- [x] Inherit Base Trace abstraction  
- [x] Validate decision_ref（DEC linkage；same project）  
- [x] Ensure project_id consistency  

### COMMIT Model

- [x] Schema（`CMT-[0-9]{5}`, commit_hash, files_changed, decision_ref）  
- [x] commit_hash optional；unique within project when present  
- [x] record_id canonical  
- [x] files_changed POSIX normalization  
- [x] RelationType alignment（related_to / derived_from）  

### Store / Repository

- [x] COMMIT Store  
- [x] COMMIT Repository  
- [x] Search by project_id / commit_hash / record_id  
- [x] Trace Graph relation mapping  

### Runtime

- [x] Runtime COMMIT registration  
- [x] DEC existence + same-project validation  
- [x] Duplicate prevention  
- [x] Relation propagation  

### Search / Graph / Tests

- [x] DSEARCH integration + filters  
- [x] Graph node COMMIT + bidirectional traversal  
- [x] Model / Store / Graph / DSEARCH tests  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-COMMIT-1.0 |
| Title | Commit Implementation Specification |
| Parent Baseline | ASA-ARCH-14.0 |
| Derived From | ASA-IMPL-TRACE-1.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-COMMIT-001 |
| Change Request | ASA-CR-COMMIT-001 |
| Next | ASA-IMPL-PR-1.0（Pull Request Implementation Specification） |
