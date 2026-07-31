# Auto Scribe AI — Search Specification

**Spec ID:** ASA-IMPL-SRCH-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Depends On:** ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0  
**Category:** Implementation Specification  
**Document Type:** Implementation Specification (Search Engine)  
**Path:** `docs/specs/auto_scribe_ai_search_specification.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Record Schema:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Runtime API:** `docs/specs/auto_scribe_ai_runtime_api_specification.md`  
**Storage Spec:** `docs/specs/auto_scribe_ai_storage_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。  
依存: **ASA-IMPL-REC-1.1** / **ASA-IMPL-API-1.0** / **ASA-IMPL-STOR-1.0**。

Downstream（Depends On this search）:

- ASA-IMPL-EXP-1.0 — Export Specification

---

Architecture Baseline の以下の領域を実装レベルへ落とし込む：

- Search Axes  
- Relations  
- Timeline  
- Snapshot  
- Export 前処理  
- Index / Cache / Relation Mapping の利用方法  

Search は Storage に依存するため、  
ASA-IMPL-STOR-1.0 が完成した今が正しい作成タイミングである。

---

# Ⅱ. Search Principles

```
SRCH-001  Search MUST operate only on normalized data.
SRCH-002  Search MUST use Index Layer for primary lookup.
SRCH-003  Search MUST use Cache Layer for recent queries.
SRCH-004  Search MUST use Relation Mapping for related records.
SRCH-005  Search MUST support multi-axis filtering.
SRCH-006  Search MUST support ranking and sorting.
SRCH-007  Search MUST return Record JSON Schema objects.
SRCH-008  Search MUST NOT mutate storage.
SRCH-009  Search MUST support timeline queries.
SRCH-010  Search MUST support snapshot queries.
```

---

# Ⅲ. Search Axes（実装レベル）

Architecture Baselineの検索軸を実装可能な形にする。

```
record_id
record_version
project_id
session_id
event_type
priority
status
confidence
timestamp
tags
participants
taxonomy_version
source
```

### Multi-axis Query  
複数軸を AND 条件で組み合わせる。

例：

```
event_type = Decision
status = Open
project_id = PRJ-00012
```

---

# Ⅳ. Query Model

Runtime API `/search/query` の Request を実装レベルで定義する。

### Query Structure

```json
{
  "query": "Decision",
  "filters": {
    "project_id": "PRJ-00012",
    "event_type": "Decision",
    "status": "Open",
    "tags": ["architecture"]
  },
  "sort": "recent",
  "limit": 100,
  "offset": 0
}
```

### Query Rules

```
QRY-001  query は全文検索（content）に適用される。
QRY-002  filters は Index Layer に適用される。
QRY-003  sort は timestamp に適用される。
QRY-004  limit / offset はオプション（Version1.0では必須ではない）。
QRY-005  filters は AND 条件で結合される。
QRY-006  query と filters は両方適用される。
```

---

# Ⅴ. Ranking Model

検索結果の並び順を定義する。

### Ranking Options

```
recent       → timestamp DESC
oldest       → timestamp ASC
priority     → Critical > High > Medium > Low
confidence   → High > Medium > Low
event_type   → taxonomy順
```

### Default Ranking

```
recent
```

---

# Ⅵ. Search Pipeline（実装レベル）

```
Input Query
↓
Parse Query
↓
Index Lookup（filters）
↓
Full-text Search（query）
↓
Merge Results
↓
Apply Ranking
↓
Apply Limit / Offset
↓
Return Record JSON Schema list
```

---

# Ⅶ. Index Lookup

Index Layer（ASA-IMPL-STOR-1.0）を利用する。

### Lookup Rules

```
IDX-LOOK-001  filters が指定された場合、Index Layer を使用する。
IDX-LOOK-002  複数フィールドは AND 条件で結合する。
IDX-LOOK-003  record_id は prefix search を許可する。
IDX-LOOK-004  tags は OR 条件を許可する（Version1.0では ANDでも可）。
```

---

# Ⅷ. Full-text Search

全文検索は content に対して行う。

### Rules

```
FTS-001  query が空の場合、全文検索はスキップ。
FTS-002  query は content に対して部分一致検索。
FTS-003  query は case-insensitive。
FTS-004  query は normalized content に適用。
```

---

# Ⅸ. Relation Search

Relation Mapping Layer を利用する。

### Relation Types

```
related_adr
related_todo
related_issue
related_record
```

### Rules

```
REL-SEARCH-001  relation:true が指定された場合、RelationMap を参照。
REL-SEARCH-002  multi-hop traversal を許可（Version1.0では1-hop）。
REL-SEARCH-003  relation 結果は重複排除。
```

---

# Ⅹ. Timeline Search

Timeline は timestamp に基づく時系列検索。

### Rules

```
TIME-001  start_date / end_date を指定可能。
TIME-002  timestamp BETWEEN start_date AND end_date。
TIME-003  timeline は event_type に依存しない。
```

---

# Ⅺ. Snapshot Search

Snapshot は集計情報を返す。

### Snapshot Structure

```json
{
  "Decision": 5,
  "TODO": 3,
  "Issue": 1,
  "Pending": 2
}
```

### Rules

```
SNAP-001  snapshot は project_id または session_id を必須とする。
SNAP-002  snapshot は Index Layer を使用する。
SNAP-003  snapshot は Record JSON Schema を返さない（集計のみ）。
```

---

# Ⅻ. Search Constraints

```
SRCHC-001  Search MUST NOT mutate storage.
SRCHC-002  Search MUST use normalized data only.
SRCHC-003  Search MUST use Index Layer for filters.
SRCHC-004  Search MUST use Cache Layer when available.
SRCHC-005  Search MUST support timeline and snapshot queries.
SRCHC-006  Search MUST return Record JSON Schema objects.
SRCHC-007  Search MUST support multi-axis filtering.
SRCHC-008  Search MUST support ranking.
```

---

# ⅩⅢ. Status

**ASA-IMPL-SRCH-1.0 — Registered — Ready for Coding**

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-SRCH-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Depends On | ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0 |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
