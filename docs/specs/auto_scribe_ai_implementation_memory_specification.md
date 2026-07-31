# ASA-IMPL-IMP-1.0 — Implementation Memory Specification

**Spec ID:** ASA-IMPL-IMP-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-13.0  
**Depends On:** ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-ARCH-12.0 / ASA-ARCH-2.0, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase13 / Knowledge Layer  
**Path:** `docs/specs/auto_scribe_ai_implementation_memory_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-13.0.md`  
**CR Applied:** ASA-CR-IMP-001 + Final Review Integration; **ASA-CR-IMP-002**（Architecture Consistency Alignment）  

---

# 1. Purpose（目的）

Implementation Memory（IMP）は、Auto Scribe AI における **実装内容（How）を永続化するレコード形式**である。

- DEC（Decision）＝「なぜ」
- IMP（Implementation）＝「どう」
- REV（Revert）＝「なぜ戻したか」

IMP は Phase14 Traceability Layer（GitHub Commit / PR / Issue）と自然に接続するための基盤となる。

---

# 2. API Endpoints

### `/record/create`
`event_type = "Implementation"` を指定することで IMP を作成する。

### `/record/get`
既存の Record API をそのまま利用。

### `/search/query`
Phase12 Search Layerで全文検索可能。  
DSEARCH（Phase13）では DEC + IMP を統合検索する。

---

# 3. IMP JSON Schema（Final）

```json
{
  "record_id": "IMP-xxxxx",
  "project_id": "PRJ-xxxxx",

  "description": "string",

  "files_changed": ["string"],

  "lines_changed": {
    "added": "number",
    "removed": "number"
  },

  "related_decision": {
    "record_type": "DEC",
    "record_id": "DEC-xxxxx"
  },

  "status": "ImplementationStatus",

  "relations": [
    {
      "type": "RelationType",
      "target": {
        "record_type": "string",
        "record_id": "string"
      }
    }
  ],

  "commit_id": "string",

  "created_by": {
    "actor": "ActorType",
    "source": "SourceType"
  },

  "timestamp": "ISO8601"
}
```

---

# 4. Required Fields（必須）

```
description
files_changed
related_decision
status
created_by.actor
created_by.source
timestamp
```

---

# 5. Optional Fields（任意）

```
lines_changed
relations
commit_id
```

---

# 6. RecordID Generation

### Prefix  
```
IMP
```

### Scope  
```
Project Scope
```

### Format  
```
IMP-00001
IMP-00002
```

---

# 7. Storage Model

```
/data/projects/{project_id}/records/IMP-xxxxx.json
```

- JSON  
- UTF-8  
- Append-only（DKM-001）

---

# 8. Runtime Behavior（Final）

### ✔ IMP 自動生成の発火条件

```
Runtime SHALL generate an IMP record
only after a successful file modification
has been confirmed.

Planning, analysis, or proposal phases
MUST NOT generate IMP records.
```

### ✔ 粒度（1操作＝1 IMP）

```
One Runtime operation
SHALL generate at most one IMP record.

Batch modifications SHALL be captured
in a single IMP record.
```

### ✔ Update禁止（DKM-002）

```
Update request
    ↓
Runtime creates a new IMP
    ↓
RelationType = supersedes
```

### ✔ AIによる実装時の属性

```
actor = AI
source = Cursor
```

---

# 9. RelationType（IMPで使用可能）

RelationType SHALL reference **ASA-ARCH-13.0**（Source of Truth）。

本仕様は独自列挙を持たない。Architecture Baseline で定義された以下を使用する：

```
implements
supersedes
reverts
related_to
derived_from
```

（ASA-CR-IMP-002）

---

# 10. Request Example（Final）

```json
{
  "event_type": "Implementation",
  "project_id": "PRJ-0001",

  "description": "watch_renderer.py のタグ生成ロジックを追加",

  "files_changed": [
    "src/runtime/watch_renderer.py",
    "src/discord/discord_bot.py"
  ],

  "lines_changed": {
    "added": 45,
    "removed": 12
  },

  "related_decision": {
    "record_type": "DEC",
    "record_id": "DEC-0012"
  },

  "status": "Completed",

  "created_by": {
    "actor": "AI",
    "source": "Cursor"
  }
}
```

---

# 11. Validation Matrix（Final / ASA-CR-IMP-002）

| Field | Required | Validation |
|-------|----------|------------|
| record_id | Runtime | `IMP-[0-9]{5}` |
| project_id | Yes | Existing Project ID |
| description | Yes | 1〜4096文字 |
| files_changed | Yes | Unique **normalized** project-relative POSIX paths; Minimum 1 item |
| related_decision | Yes | DEC that **had status = Active at IMP creation time**（DecisionStatus / ASA-ARCH-13.0） |
| status | Yes | ImplementationStatus enum（ASA-ARCH-13.0）: Planned / InProgress / Completed / Abandoned |
| created_by.actor | Yes | ActorType enum（ASA-ARCH-13.0） |
| created_by.source | Yes | SourceType enum（ASA-ARCH-13.0） |
| timestamp | Yes | ISO8601 UTC |
| lines_changed | Optional | `{added:number, removed:number}` |
| commit_id | Optional | **40 or 64 hex Git object ID** |
| relations | Optional | RecordRef + RelationType（ASA-ARCH-13.0） |

### ✔ Path Normalization Rules

```
Normalization includes:
- resolving "." and ".."
- removing leading "./"
- collapsing duplicate separators
```

---

# 12. Example（Final）

```json
{
  "record_id": "IMP-0042",
  "project_id": "PRJ-0001",

  "description": "Watch List をタグ表示へ変更",

  "files_changed": [
    "src/runtime/watch_renderer.py",
    "src/discord/discord_bot.py"
  ],

  "lines_changed": {
    "added": 45,
    "removed": 12
  },

  "related_decision": {
    "record_type": "DEC",
    "record_id": "DEC-0012"
  },

  "status": "Completed",

  "created_by": {
    "actor": "AI",
    "source": "Cursor"
  },

  "timestamp": "2026-07-22T11:22:33Z"
}
```

---

# 13. Search Layer（Final）

```
Default ordering:

1. Decision records (DEC)
2. Implementation records (IMP)
3. Revert records (REV)

Within each type,
records SHALL be ordered
by timestamp (descending),
unless otherwise specified.

Search Layer SHOULD support
filtering by record_type.
```

---

# 14. Implementation Checklist（Final）

- [x] IMP Schema の JSON Schema 化  
- [x] `/record/create` の IMP 対応  
- [x] RecordRef のバリデーション（Final）  
- [x] RelationType の参照（**ASA-ARCH-13.0 SoT / ASA-CR-IMP-002**）  
- [x] ImplementationStatus の参照（**Completed 等 / ASA-ARCH-13.0**）  
- [x] Append-only 保存  
- [x] 自動生成（Cursor / Copilot）  
- [x] DEC → IMP のリンク検証（**Active DEC at creation time**）  
- [x] Search Layer で IMP を検索可能にする  
- [x] files_changed 重複禁止（**正規化後**）  
- [x] files_changed 最低1件  
- [x] lines_changed 構造化（added/removed）  
- [x] commit_id の **40/64 hex Git object ID**  
- [x] cross-project DEC 参照禁止  
- [x] Runtime 粒度（1操作＝1 IMP）  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-IMP-1.0 |
| Parent Baseline | ASA-ARCH-13.0 |
| Sibling | ASA-IMPL-DEC-1.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-IMP-001 |
| Change Request | ASA-CR-IMP-002（Architecture Consistency Alignment） |
| Next | ASA-IMPL-REQ-IMP-001（Implementation Request） |
