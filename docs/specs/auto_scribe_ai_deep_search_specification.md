# ASA-IMPL-DSEARCH-1.0 — Deep Search Specification

**Spec ID:** ASA-IMPL-DSEARCH-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-13.0  
**Depends On:** ASA-ARCH-13.0, ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0, ASA-IMPL-REV-1.0, ASA-ARCH-12.0 / ASA-ARCH-2.0, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0  
**Category:** Implementation Specification  
**Layer:** Phase13 / Knowledge Layer  
**Path:** `docs/specs/auto_scribe_ai_deep_search_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-13.0.md`  
**CR Applied:** **ASA-CR-DSEARCH-001**（Architecture Consistency Alignment）  
**Registration ID:** ASA-IMPL-REG-DSEARCH-001  
**Also known as:** Decision Search（歴史的別名 / ASA-ARCH-13.0 旧称）  

---

# 1. Purpose

DSEARCH は、Auto Scribe AI の Knowledge Layer における  
**DEC（Why）・IMP（How）・REV（Why Reverted）を横断検索する統合検索レイヤー（Deep Search）**である。

Phase12 Search（ASA-IMPL-SRCH-1.0 / `/search/query`）を基盤とし、Knowledge 専用の Deep Search API を追加する（DKM-004）。既存 `/search/query` の意味は変更しない。

---

# 2. API Endpoints

### `/search/deep`

全文検索＋ランキング＋フィルタ＋Graph抽出（結果に relations を含めてよい）。

### `/search/deep/related`

RecordRef を入力として関連レコードを返す。

### `/search/deep/graph`

DEC / IMP / REV の関係グラフを返す。

---

# 3. Input Schema

```json
{
  "query": "string",
  "filters": {
    "record_types": ["DEC", "IMP", "REV"],
    "project_id": "PRJ-xxxxx",

    "decision_status": ["Proposed", "Active", "Superseded", "Reverted", "Archived"],
    "implementation_status": ["Planned", "InProgress", "Completed", "Abandoned"]
  },
  "ranking": {
    "mode": "Relevance | Chronological | RelationStrength | Composite"
  },
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

### Notes

- `record_types` omitted → **DEC・IMP・REV 全種**
- `query` MUST be 1〜4096 Unicode characters
- empty query SHALL be rejected
- `decision_status` / `implementation_status` は **ASA-ARCH-13.0** の enum のみ（ASA-CR-DSEARCH-001）
- Enums は本仕様で独自定義しない

---

# 4. Query Validation

```text
query MUST satisfy:
- length 1〜4096
- Unicode allowed
- empty string SHALL be rejected
```

---

# 5. Output Schema

```json
{
  "results": [
    {
      "record_type": "DEC | IMP | REV",
      "record_id": "string",
      "score": "number",
      "summary": "string",
      "highlight": "string",
      "relations": [
        {
          "type": "RelationType",
          "target": {
            "record_type": "string",
            "record_id": "string"
          }
        }
      ]
    }
  ],
  "meta": {
    "query_time_ms": "number",
    "total_results": "number",
    "limit": "number",
    "offset": "number"
  }
}
```

### Notes

- `score` は正規化 **0.0〜1.0**
- **highlight** は任意項目である。検索スニペットを生成できない場合は省略してよい（MAY be omitted）

---

# 6. Ranking Model

### 6.1 Relevance（デフォルト）

- TF-IDF / embedding（実装定義；同一入力に対し決定的であること）
- summary / description / reason / files_changed 等の検索可能フィールド
- highlight 抽出（可能な場合）

### 6.2 Chronological

- timestamp DESC
- DEC → IMP → REV の順序維持（ASA-IMPL-IMP-1.0 / ASA-IMPL-REV-1.0 と整合）

### 6.3 RelationStrength（deterministic weights）

```text
implements       = 1.0
reverts          = 0.8
supersedes       = 0.6
related_to       = 0.4
derived_from     = 0.3
```

RelationType は **ASA-ARCH-13.0** 準拠（`reverts` = REV → DEC and/or REV → IMP / ASA-CR-REV-001）。

### 6.4 Composite Ranking

```text
Composite ranking SHALL be implementation-defined,
but MUST be deterministic for identical inputs.

Default weights:
Relevance         = 0.7
RelationStrength  = 0.3
```

---

# 7. Graph API

### 7.1 Output Schema

```json
{
  "nodes": [
    {
      "record_type": "DEC | IMP | REV",
      "record_id": "string"
    }
  ],
  "edges": [
    {
      "type": "RelationType",
      "source": "record_id",
      "target": "record_id"
    }
  ]
}
```

### 7.2 `/search/deep/related` Input（最小）

```json
{
  "target": {
    "record_type": "DEC | IMP | REV",
    "record_id": "string"
  },
  "project_id": "PRJ-xxxxx",
  "depth": 1
}
```

`depth` 省略時は 1。Graph と同じ max_depth / cycle 防止規則を適用する。

### 7.3 Depth Rules

```text
default_depth = 3
max_depth = 10

visited nodes SHALL NOT be revisited.
cycles SHALL be prevented.
```

### 7.4 Future Work

```text
Graph pagination MAY be supported in future versions
to handle large-scale projects.
```

---

# 8. Runtime Integration

```text
Index updates SHALL be transactional
with DEC/IMP/REV creation.

Pagination SHALL operate on a consistent snapshot
for a single search request.
```

Phase12 `/search/query` は継続利用可能。DSEARCH は Knowledge 専用 Deep Search を追加する（既存 API の意味変更禁止 / ASA-ARCH-13.0 §12）。

---

# 9. Validation Matrix

| Field | Validation |
|---|---|
| query | 1〜4096 Unicode；empty 禁止 |
| record_types | omitted = all（DEC / IMP / REV） |
| decision_status | DecisionStatus enum（ASA-ARCH-13.0） |
| implementation_status | ImplementationStatus enum（ASA-ARCH-13.0） |
| ranking.mode | Relevance \| Chronological \| RelationStrength \| Composite |
| pagination.limit | 1〜500（default 50） |
| pagination.offset | ≥0（default 0） |
| project_id | Existing Project ID（指定時） |
| RelationType（results / graph） | ASA-ARCH-13.0 enum |

---

# 10. Example

```json
POST /search/deep
{
  "query": "タグ表示 ロジック",
  "filters": {
    "record_types": ["IMP", "REV"],
    "project_id": "PRJ-0001",
    "implementation_status": ["Completed"]
  },
  "ranking": {
    "mode": "Composite"
  },
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

---

# 11. Implementation Checklist

- [x] Input Schema（status分離 / pagination / DecisionStatus SoT）  
- [x] Output Schema（score正規化 / highlight optional / results+meta）  
- [x] Ranking Model（deterministic / composite）  
- [x] Graph API（nodes/edges / depth / cycle防止 / future pagination）  
- [x] `/search/deep/related`（RecordRef 入力）  
- [x] Runtime index transactional with DEC/IMP/REV create  
- [x] Snapshot pagination  
- [x] Phase12 Search Layer との共存（`/search/query` 非破壊）  
- [x] Tests（Graph / Ranking / Filters / Pagination / Cycle防止 / Validation）  

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-DSEARCH-1.0 |
| Title | Deep Search Specification |
| Parent Baseline | ASA-ARCH-13.0 |
| Siblings | ASA-IMPL-DEC-1.0, ASA-IMPL-IMP-1.0, ASA-IMPL-REV-1.0 |
| Status | Registered — Ready for Coding |
| Registration ID | ASA-IMPL-REG-DSEARCH-001 |
| Change Request | ASA-CR-DSEARCH-001（Architecture Consistency Alignment） |
| Next | ASA-IMPL-REQ-DSEARCH-001（Implementation Request） |
