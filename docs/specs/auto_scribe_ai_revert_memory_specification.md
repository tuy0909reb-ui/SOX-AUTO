# ASA-IMPL-REV-1.0 — Revert Memory Specification

**Spec ID:** ASA-IMPL-REV-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-13.0  
**Depends On:** ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0, ASA-ARCH-12.0 / ASA-ARCH-2.0, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase13 / Knowledge Layer  
**Path:** `docs/specs/auto_scribe_ai_revert_memory_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-13.0.md`  
**CR Applied:** **ASA-CR-REV-001**（Architecture Consistency Alignment）  
**Registration ID:** ASA-IMPL-REG-REV-001  

---

# 1. Purpose（目的）

Revert Memory（REV）は、Auto Scribe AI における **撤回・巻き戻し（Why undo）を永続化するレコード形式**である。

- **description:** 何を戻したか（対象の変更内容の概要）
- **reason:** なぜ戻したか（Revert の理由）

```text
DEC（Decision）＝「なぜ」
IMP（Implementation）＝「どう」
REV（Revert）＝「なぜ戻したか」
```

REV は既存の Implementation（IMP）を明示的に取り消した事実と理由を記録し、影響を受ける Decision（DEC）を必ず参照する（DKM-006）。

REV は Phase14 Traceability Layer とも自然に接続可能な Knowledge 記録である（本体は GitHub 非依存 / DKM-009）。

---

# 2. API Endpoints

### `/record/create`

`event_type = "Revert"` を指定することで REV を作成する。

### `/record/get`

既存の Record API をそのまま利用。

### `/search/query`

Phase12 Search Layer で全文検索可能。  
Default ordering: DEC → IMP → REV（各 type 内は timestamp DESC）。  
`record_type` フィルタ対応（DEC / IMP / REV）。

---

# 3. REV JSON Schema（Final）

```json
{
  "record_id": "REV-xxxxx",
  "project_id": "PRJ-xxxxx",

  "description": "string",

  "reverted_implementation": {
    "record_type": "IMP",
    "record_id": "IMP-xxxxx"
  },

  "reason": "string",

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

  "created_by": {
    "actor": "ActorType",
    "source": "SourceType"
  },

  "timestamp": "ISO8601"
}
```

### Field notes

| Field | Notes |
|---|---|
| `reverted_implementation` | **RecordRef（IMP）** — same project; existing IMP |
| `related_decision` | **RecordRef（DEC）** — DecisionStatus = **Active** at REV creation（ASA-ARCH-13.0） |
| `status` | **ImplementationStatus** を流用（Planned / InProgress / Completed / Abandoned） |
| `created_by.actor` | ActorType（ASA-ARCH-13.0） |
| `created_by.source` | SourceType（ASA-ARCH-13.0） |
| `relations[].type` | RelationType（ASA-ARCH-13.0 / ASA-CR-REV-001） |

Enums は **ASA-ARCH-13.0 を Source of Truth** とし、本仕様で独自定義しない。

---

# 4. Required / Optional

**Required**

- description  
- reverted_implementation  
- reason  
- related_decision  
- status  
- created_by.actor  
- created_by.source  
- timestamp  

**Optional**

- relations  

**Runtime-assigned**

- record_id（`REV-[0-9]{5}` / Project Scope）  
- timestamp（省略時は Runtime が ISO8601 UTC を付与してよい）  

---

# 5. Storage

```text
/data/projects/{project_id}/records/REV-xxxxx.json
```

- UTF-8 JSON  
- Append-only（DKM-001）  
- Project-scoped sequence: `REV-00001`, `REV-00002`, …  

---

# 6. Runtime Behavior（Final）

### ✔ 発火条件

```text
Runtime SHALL create a REV record only after
an existing IMP record has been explicitly reverted

by Runtime, CLI, API, or User Operation.
```

### ✔ DEC 整合（DKM-006）

```text
related_decision MUST reference
a DEC RecordRef whose DecisionStatus
was Active at the time the REV record was created.

Cross-project DEC reference is forbidden.
```

### ✔ IMP 整合

```text
reverted_implementation MUST reference
an existing IMP RecordRef
in the same project.

Cross-project IMP reference is forbidden.
```

### ✔ Append-only / Supersedes（DKM-002 / DKM-003）

```text
Update request
    ↓
Runtime creates a new REV
    ↓
RelationType = supersedes
```

REV は更新不可。上書き禁止。

---

# 7. RelationType constraints（ASA-CR-REV-001）

REV で使用可能な RelationType は **ASA-ARCH-13.0** 準拠：

```text
implements
supersedes
reverts
related_to
derived_from
```

### `reverts` 制約（Final）

```text
RelationType = reverts
MAY target DEC and/or IMP.

When documenting an Implementation undo:
  - reverted_implementation MUST be set (IMP RecordRef)
  - RelationType = reverts targeting that IMP is RECOMMENDED
    (target.record_id MUST match reverted_implementation.record_id)

related_decision (DEC, Active) remains REQUIRED (DKM-006).

REV → REV with RelationType = reverts
SHALL be rejected.
```

---

# 8. Validation Matrix（Final / ASA-CR-REV-001）

| Field | Required | Validation |
|---|---|---|
| record_id | Runtime | `REV-[0-9]{5}` |
| project_id | Yes | Existing Project ID |
| description | Yes | 1〜4096文字 |
| reverted_implementation | Yes | RecordRef; Existing IMP in **same project** |
| reason | Yes | 1〜4096文字 |
| related_decision | Yes | RecordRef; DEC **Active** at creation time; **same project** |
| status | Yes | ImplementationStatus enum（ASA-ARCH-13.0） |
| created_by.actor | Yes | ActorType enum（ASA-ARCH-13.0） |
| created_by.source | Yes | SourceType enum（ASA-ARCH-13.0） |
| timestamp | Yes | ISO8601 UTC |
| relations | Optional | RecordRef + RelationType（上記 `reverts` 制約に従う） |

---

# 9. Search Layer（Final）

```text
Default ordering:

1. Decision records (DEC)
2. Implementation records (IMP)
3. Revert records (REV)

Within each type,
records SHALL be ordered
by timestamp (descending),
unless otherwise specified.

Search Layer SHOULD support
filtering by record_type
(e.g., DEC / IMP / REV).
```

---

# 10. Example（Final）

```json
{
  "record_id": "REV-0003",
  "project_id": "PRJ-0001",

  "description": "Watch List タグ表示ロジックを撤回",

  "reverted_implementation": {
    "record_type": "IMP",
    "record_id": "IMP-0042"
  },

  "reason": "ユーザー要件変更によりタグ表示が不要になった",

  "related_decision": {
    "record_type": "DEC",
    "record_id": "DEC-0015"
  },

  "status": "Completed",

  "relations": [
    {
      "type": "reverts",
      "target": {
        "record_type": "IMP",
        "record_id": "IMP-0042"
      }
    }
  ],

  "created_by": {
    "actor": "AI",
    "source": "Cursor"
  },

  "timestamp": "2026-07-22T12:34:56Z"
}
```

---

# 11. Implementation Checklist

- [x] REV JSON Schema定義（RecordRef / ImplementationStatus流用）  
- [x] `/record/create` で `event_type=Revert` を受け付け  
- [x] RecordRef validation（DEC Active / IMP exists / same project）  
- [x] Runtime trigger（Runtime/CLI/API/User Operation）  
- [x] RelationType制約（`reverts` → DEC and/or IMP; REV→REV 禁止）  
- [x] Append-only / supersedes対応  
- [x] Search indexへのREV統合 + `record_type`フィルタ  
- [x] Project-scoped `REV-xxxxx` 採番  
- [x] Cross-project DEC / IMP 参照禁止  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-REV-1.0 |
| Parent Baseline | ASA-ARCH-13.0 |
| Siblings | ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-REV-001 |
| Registration Request | ASA-REG-REQ-REV-001 |
| Change Request | ASA-CR-REV-001（Architecture Consistency Alignment） |
| Next | ASA-IMPL-REQ-REV-001（Implementation Request） |
