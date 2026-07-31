# ASA-IMPL-DEC-1.0 — Decision Memory Implementation Specification

**Spec ID:** ASA-IMPL-DEC-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-13.0  
**Depends On:** ASA-ARCH-13.0, ASA-ARCH-12.0 / ASA-ARCH-2.0, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase13 / Knowledge Layer  
**Path:** `docs/specs/auto_scribe_ai_decision_memory_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-13.0.md`

---

# 1. Purpose（目的）

Decision Memory（DEC）は、Auto Scribe AI における **設計判断（Why）を永続化するレコード形式**である。  
Phase12 の Event Layer を拡張し、判断理由・背景・代替案・影響範囲・関係性を保存する。

---

# 2. API Endpoints（DEC用）

### ✔ `/record/create`  
`event_type = "Decision"` を指定することで DEC を作成する。

---

# 3. Request Example

```http
POST /record/create
Content-Type: application/json
```

```json
{
  "event_type": "Decision",
  "project_id": "PRJ-0001",

  "title": "Watch List UI redesign",
  "reason": "一覧性向上を目的",
  "decision": "タグ表示を正式採用",

  "status": "Active",

  "created_by": {
    "actor": "AI",
    "source": "Cursor"
  }
}
```

> **Enum Source of Truth (ASA-CR-DEC-001):**  
> - `status` → DecisionStatus（ASA-ARCH-13.0）: Proposed / Active / Superseded / Reverted / Archived  
> - `created_by.actor` → ActorType（ASA-ARCH-13.0）: Human / AI / System  
> - `created_by.source` → SourceType（ASA-ARCH-13.0）: Manual / ChatGPT / Cursor / Claude / External / GitHub  
> Request Example は上記正式 enum のみを使用する。

---

# 4. DEC JSON Schema（Implementation版）

※ `status` と `RelationType` は **Architecture Baseline（ASA-ARCH-13.0）で定義された enum を参照**。

```json
{
  "record_id": "DEC-xxxxx",
  "project_id": "PRJ-xxxxx",

  "title": "string",
  "reason": "string",

  "before": "string",
  "after": "string",

  "decision": "string",

  "alternatives": ["string"],
  "affected": ["string"],

  "status": "DecisionStatus",

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

---

# 5. Validation Rules（検証ルール）

### ✔ 必須項目
```
title
reason
decision
status
created_by.actor
created_by.source
timestamp
```

### ✔ 任意項目
```
before
after
alternatives
affected
relations
```

---

# 6. RecordID採番ルール

### ✔ 採番方式  
```
Project Scope（プロジェクト単位）
```

### ✔ 例  
```
PRJ-0001 → DEC-00001, DEC-00002, DEC-00003
PRJ-0002 → DEC-00001, DEC-00002
```

### ✔ 理由  
- Phase12 の Record と同じ採番方式  
- プロジェクト内での追跡が容易  
- Traceability Layer（Phase14）での紐付けが自然

---

# 7. Storage Model（保存形式）

```
/data/projects/{project_id}/records/DEC-xxxxx.json
```

- JSON  
- UTF-8  
- Append-only（DKM-001）

---

# 8. Runtime Behavior（DKM-003 の反映）

### ✔ DEC は不変（immutable）  
更新要求が来た場合：

```
Update request
    ↓
Runtime が新しい DEC を生成
    ↓
RelationType = supersedes を付与
```

### ✔ 例  
```
DEC-0012 supersedes DEC-0005
```

---

# 9. RelationType（DECで使用可能）

Architecture Baseline の RelationType を参照。

---

# 10. Error Handling

### 400 Bad Request  
- 必須項目不足  
- status が不正  
- RelationType が不正  
- created_by が不正

### 409 Conflict  
- record_id 重複  
- 不変レコードへの更新要求

---

# 11. Example（Watch List UI変更）

（Request Example §3 を参照）

---

# 12. Implementation Checklist

- [x] DEC Schema の JSON Schema 化  
- [x] `/record/create` の DEC 対応  
- [x] RecordRef のバリデーション  
- [x] RelationType の外部参照  
- [x] Status enum の外部参照  
- [x] Append-only 保存  
- [x] 自動生成（Cursor / Copilot）  
- [x] DKM-003 の Runtime Behavior 明文化  
- [x] Request Example の追加  
- [x] RecordID採番ルールの明確化  

---

# 13. Validation Matrix

| Field | Required | Validation Rule |
|---|---|---|
| **record_id** | Runtime | `DEC-[0-9]{5}`（Project Scope連番） |
| **project_id** | Yes | 既存の Project ID であること |
| **title** | Yes | 空文字列不可（非空文字列） |
| **reason** | Yes | 空文字列不可 |
| **decision** | Yes | 空文字列不可 |
| **status** | Yes | `DecisionStatus` enum（ASA-ARCH-13.0） |
| **created_by.actor** | Yes | `ActorType` enum（ASA-ARCH-13.0） |
| **created_by.source** | Yes | `SourceType` enum（ASA-ARCH-13.0） |
| **timestamp** | Yes | ISO8601 UTC（Runtimeが自動付与） |
| **before** | Optional | string |
| **after** | Optional | string |
| **alternatives** | Optional | array of string |
| **affected** | Optional | array of string |
| **relations** | Optional | RecordRef + RelationType validation |
| **relations.type** | Optional | `RelationType` enum（ASA-ARCH-13.0） |
| **relations.target.record_type** | Optional | `DEC \| IMP \| REV \| ADR \| ISSUE \| TODO \| EXT` |
| **relations.target.record_id** | Optional | `^[A-Z]{3,4}-[0-9]{5}$` |

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-DEC-1.0 |
| Parent Baseline | ASA-ARCH-13.0 |
| Status | Registered — Ready for Coding |
| Request ID | ASA-IMPL-REQ-DEC-001 |
| Change Request | ASA-CR-DEC-001（Request Example enum sync） |
