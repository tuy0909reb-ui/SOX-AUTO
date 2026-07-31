# ASA-IMPL-TRACE-1.0 — Traceability Specification

**Spec ID:** ASA-IMPL-TRACE-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-14.0  
**Depends On:** ASA-ARCH-14.0, ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0, ASA-IMPL-REV-1.0, ASA-IMPL-DSEARCH-1.0, ASA-ARCH-12.0 / ASA-ARCH-2.0, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase14 / Traceability Layer  
**Path:** `docs/specs/auto_scribe_ai_traceability_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-14.0.md`  
**Registration ID:** ASA-IMPL-REG-TRACE-001  
**Change Request:** None（初回整合登録；ASA-ARCH-14.0 と同時確立）  

---

# 1. Purpose

ASA-IMPL-TRACE-1.0 は Traceability Layer における **Base Trace Layer（抽象基底）** の実装契約である。

```text
TRACE（abstract）
  ├── COMMIT
  ├── PR
  ├── ISSUE
  └── RELEASE
       （future: BUILD / DEPLOY / PIPELINE / WORKFLOW）
```

* TRACE は **抽象モデル**であり、**直接インスタンス化・永続化してはならない**（TTP-001 / TTP-002）
* 永続化責務は派生モデルが独占する
* Base Trace は共有契約・メタデータ・共通振る舞い・Repository/Store インタフェースのみを定義する
* 派生モデル追加時は Derived セクション／子仕様を追記するだけでよく、Base Trace 契約を変更しない（TTP-011）

---

# 2. Design Rules（Normative）

```text
1. TRACE SHALL NOT be constructed as a concrete persisted record.
2. Runtime / API MUST reject attempts to create event_type="Trace"
   as a standalone storage target (unless remapped to a derived model).
3. Derived models inherit Base Trace fields and MAY add domain fields.
4. Append-only + immutable after create（TTP-003 / TTP-004）.
5. Duplicate prevention keys are defined per derived model.
6. DSEARCH integrates Trace-derived records through the Trace abstraction（TTP-010）.
7. Graph integrates Trace ↔ Knowledge edges via RecordRef + RelationType.
```

Enums:

* ActorType → **ASA-ARCH-13.0**
* TraceSourceType → **ASA-ARCH-14.0**
* RelationType → **ASA-ARCH-13.0**
* RecordRef types → **ASA-ARCH-13.0 + ASA-ARCH-14.0 extensions**

本仕様で独自 enum を定義しない。

---

# 3. Base Trace Abstraction（Logical Schema）

抽象フィールド（派生が継承）。**ファイルに TRACE-xxxxx としては保存しない。**

```json
{
  "record_id": "string",
  "record_type": "COMMIT | PR | ISSUE | RELEASE | …",
  "project_id": "PRJ-xxxxx",

  "title": "string",
  "summary": "string",

  "related_knowledge": [
    {
      "record_type": "DEC | IMP | REV",
      "record_id": "string"
    }
  ],

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

### Notes

| Field | Required on Base | Notes |
|---|---|---|
| record_id | Yes（派生採番） | 派生プレフィックス（CMT / PR / ISSUE / REL 等） |
| record_type | Yes | 派生の具象型。値 `TRACE` は禁止 |
| project_id | Yes | Existing Project |
| title / summary | 派生が決定 | Base は存在を契約 |
| related_knowledge | Optional | Knowledge RecordRef 配列 |
| relations | Optional | RelationType + RecordRef |
| created_by | Yes | ActorType + TraceSourceType |
| timestamp | Yes | ISO8601 UTC |
| external_ref | Optional | 外部システム参照（重複防止キーに利用可） |

---

# 4. Generic Trace Repository Interface

```text
TraceRepository
  create_derived(payload) → { record_id, stored, record_type }
  get(record_id, record_type?, project_id?) → record | None
  list_by_project(project_id, record_types?) → [record]
  assert_not_duplicate(derived_key) → void
  project_scope_next_id(project_id, prefix) → record_id
```

Requirements:

* Append-only  
* Cross-project RecordRef 参照は禁止（Knowledge と同様）  
* Base TRACE create は **MUST reject**  

---

# 5. Generic Trace Store Interface

```text
TraceStore[TDerived]
  path_for(project_id, record_id) → Path
  create(record) → record   # write-once UTF-8 JSON
  get(record_id, project_id?) → record | None
  all_items() → [record]
  all_search_projections() → [projection]
```

Storage path:

```text
/data/projects/{project_id}/records/{record_id}.json
```

Base TRACE Store の具象実装は存在してはならない。派生 Store のみ。

---

# 6. Derived Trace Models（Initial Set）

詳細スキーマは各子仕様で確定する。本仕様は継承関係と責務境界のみを固定する。

| Derived | Spec | Prefix（予定） | Persistence |
|---|---|---|---|
| COMMIT | ASA-IMPL-COMMIT-1.0 | `CMT-[0-9]{5}` | COMMIT Store / Repository |
| PR | ASA-IMPL-PR-1.0 | `PR-[0-9]{5}` | PR Store / Repository |
| ISSUE | ASA-IMPL-ISSUE-1.0 | `ISSUE-[0-9]{5}` | ISSUE Store / Repository |
| RELEASE | ASA-IMPL-RELEASE-1.0 | `REL-[0-9]{5}` | RELEASE Store / Repository |

Each derived model SHALL:

1. Inherit Base Trace fields  
2. Define domain-specific required fields  
3. Define duplicate-prevention identity key（例: `external_ref.native_id` + `system`）  
4. Emit DSEARCH / Graph projections conforming to Trace abstraction  
5. Remain append-only / immutable  

Future models（BUILD / DEPLOY / PIPELINE / WORKFLOW）SHALL follow the same rules without Base Trace changes.

---

# 7. Runtime Integration

```text
Runtime MAY create Trace-derived records only when
an explicit Trace capture operation occurs
(Runtime / CLI / API / User / Connector).

Runtime MUST NOT persist Base TRACE.

Duplicate prevention:
  If derived identity key already exists in the same project,
  Runtime SHALL reject or return the existing record_id
  (behavior fixed per derived spec; default = reject CONFLICT).
```

Update:

```text
Update request
  ↓
new derived Trace record
  ↓
RelationType = supersedes
```

---

# 8. DSEARCH Integration

ASA-IMPL-DSEARCH-1.0 を拡張可能にする：

```text
record_types MAY include Trace-derived types:
  COMMIT | PR | ISSUE | RELEASE | …

Deep Search SHALL treat Trace-derived documents
through a common Trace projection:
  record_type, record_id, summary, search_text,
  relations, status?, timestamp, project_id
```

* empty query 規則は DSEARCH 本体に従う  
* Chronological 既定の Knowledge 順序（DEC→IMP→REV）の後に Trace 派生を配置してよい（実装定義・決定的）  

---

# 9. Graph Integration

```text
Graph nodes MAY include Trace-derived records.
Edges use RelationType + source/target record_id.

Depth / cycle / visited-node rules
follow ASA-IMPL-DSEARCH-1.0 §7.
```

---

# 10. Validation Matrix（Base）

| Field / Rule | Validation |
|---|---|
| Instantiation of TRACE | Forbidden |
| record_type = TRACE | Forbidden |
| project_id | Existing Project |
| created_by.actor | ActorType（ASA-ARCH-13.0） |
| created_by.source | TraceSourceType（ASA-ARCH-14.0） |
| relations | RelationType + RecordRef |
| related_knowledge | DEC / IMP / REV RecordRef；same project |
| Persistence path | Derived record_id only |
| Duplicate | Derived identity key；project scoped |

---

# 11. Example（Conceptual — COMMIT inherits Base）

```json
{
  "record_id": "CMT-00042",
  "record_type": "COMMIT",
  "project_id": "PRJ-0001",
  "title": "Apply tag list renderer",
  "summary": "Implements Watch List tag display",
  "related_knowledge": [
    { "record_type": "IMP", "record_id": "IMP-0042" }
  ],
  "relations": [
    {
      "type": "related_to",
      "target": { "record_type": "IMP", "record_id": "IMP-0042" }
    }
  ],
  "created_by": {
    "actor": "AI",
    "source": "GitHub"
  },
  "timestamp": "2026-07-22T15:00:00Z",
  "external_ref": {
    "system": "GitHub",
    "url": "https://github.com/org/repo/commit/abc",
    "native_id": "abcdefghijklmnopqrstuvwxyz0123456789abcd"
  }
}
```

（COMMIT 固有フィールドは ASA-IMPL-COMMIT-1.0 で追加）

---

# 12. Implementation Checklist

### Base Trace Layer

- [ ] Base Trace abstraction  
- [ ] Generic Trace Repository interface  
- [ ] Generic Trace Store interface  

### Derived Trace Models

- [ ] COMMIT Store / Repository（ASA-IMPL-COMMIT-1.0）  
- [ ] PR Store / Repository（ASA-IMPL-PR-1.0）  
- [x] ISSUE Store / Repository（ASA-IMPL-ISSUE-1.0）  
- [x] RELEASE Store / Repository（ASA-IMPL-RELEASE-1.0）  

### Runtime

- [ ] Runtime Trace integration  
- [ ] Duplicate prevention  

### Search / Graph

- [ ] DSEARCH integration（Trace abstraction）  
- [ ] Graph integration  

### Tests

- [ ] Trace abstraction rejection（no direct TRACE persist）  
- [ ] Relation  
- [ ] Graph  
- [ ] Search  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-TRACE-1.0 |
| Title | Traceability Specification（Base Trace Layer） |
| Parent Baseline | ASA-ARCH-14.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-TRACE-001 |
| Next | ASA-IMPL-COMMIT-1.0（Commit Record Specification） |
