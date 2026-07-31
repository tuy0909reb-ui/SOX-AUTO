# Auto Scribe AI — Storage Specification

**Spec ID:** ASA-IMPL-STOR-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Depends On:** ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0  
**Category:** Implementation Specification  
**Document Type:** Implementation Specification (Storage Layer)  
**Path:** `docs/specs/auto_scribe_ai_storage_specification.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Record Schema:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Runtime API:** `docs/specs/auto_scribe_ai_runtime_api_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。  
依存: **ASA-IMPL-REC-1.1** / **ASA-IMPL-API-1.0**。

Downstream（Depends On this storage）:

- ASA-IMPL-CAP-1.0 — Auto Capture Rule Specification
- ASA-IMPL-SRCH-1.0 — Search Specification
- ASA-IMPL-EXP-1.0 — Export Specification

---

# Ⅰ. Overview

本仕様書は、Auto Scribe AI の **永続化層（Storage Layer）** を定義する。  
Architecture Baseline の以下の要件を実装レベルに落とし込む：

- Append-only Storage  
- Record Revision Model  
- Project → Session → Record の階層構造  
- Index / Cache / Relation Mapping  
- Event State Machine の永続化  
- Search の高速化  
- Multi-AI Source 対応  

---

# Ⅱ. Storage Principles

```
STP-001  Storage is append-only. No in-place updates.
STP-002  Every revision creates a new immutable entry.
STP-003  All stored records MUST validate against ASA-IMPL-REC-1.1.
STP-004  Storage MUST preserve Project → Session → Record hierarchy.
STP-005  Index MUST be updated after every write.
STP-006  Cache MUST be updated after every write.
STP-007  Relation Mapping MUST be maintained (ADR / TODO / Issue).
STP-008  Event State Machine MUST be enforced at storage time.
STP-009  Storage MUST support multi-source ingestion.
```

---

# Ⅲ. Storage Model

Auto Scribe AI の永続化は以下の 4 層で構成される。

```
Append-only Repository
Index Layer
Cache Layer
Relation Mapping Layer
```

---

# Ⅳ. Data Structures

## 1. Append-only Repository（AOR）

### Format  
**Record JSON Schema（ASA-IMPL-REC-1.1）** をそのまま保存する。

### Storage Unit  
```
RecordEntry {
    record_id
    record_version
    project_id
    session_id
    timestamp
    source
    event_type
    priority
    status
    confidence
    content
    metadata
}
```

### Behavior  
- 新規作成 → 新規エントリ  
- Revision → 新規エントリ（record_version が増える）  
- Correction → 新規エントリ（status = Corrected）  
- Supersede → 新規エントリ（status = Superseded）

### 禁止事項  
- 上書き禁止  
- 削除禁止  
- 改変禁止  

---

## 2. Index Layer

Index は検索の高速化のために構築される。

### Index Fields  
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
```

### Index Structure  
```
Index {
    key: field_name
    value: list of record_ids
}
```

### Update Rules  
```
IDX-001  Every write MUST update all relevant indexes.
IDX-002  Index updates MUST be atomic.
IDX-003  Index MUST support multi-field queries.
IDX-004  Index MUST support prefix search for record_id.
```

---

## 3. Cache Layer

Cache は最新の状態を高速に取得するためのレイヤ。

### Cache Types  
```
LatestRecordCache
SessionSummaryCache
ProjectSnapshotCache
SearchResultCache
```

### Update Rules  
```
CACHE-001  LatestRecordCache MUST store the highest record_version.
CACHE-002  SessionSummaryCache MUST update on /session/stop.
CACHE-003  ProjectSnapshotCache MUST update on new record.
CACHE-004  SearchResultCache MUST invalidate on new record.
```

---

## 4. Relation Mapping Layer

Record 間の関係を保持する。

### Relation Types  
```
Related ADR
Related TODO
Related Issue
Related Record
```

### Structure  
```
RelationMap {
    record_id: {
        adr: [record_id],
        todo: [record_id],
        issue: [record_id],
        related: [record_id]
    }
}
```

### Update Rules  
```
REL-001  Relation MUST be updated after every write.
REL-002  Relation MUST be symmetric when applicable.
REL-003  Relation MUST support multi-hop traversal.
```

---

# Ⅴ. Storage Operations

Runtime API の各操作は Storage に以下の処理を行う。

---

## 1. Operation: Create Record

```
Input: Record JSON Schema
↓
Validate
↓
Append to AOR
↓
Update Index
↓
Update Cache
↓
Update Relation Mapping
↓
Return record_id
```

---

## 2. Operation: Revise Record

```
Input: record_id + new record_version
↓
Validate
↓
Append new revision to AOR
↓
Update Index
↓
Update Cache (latest version)
↓
Update Relation Mapping
↓
Return previous_version
```

---

## 3. Operation: Session Stop

```
Generate Session Summary
↓
Append summary record to AOR
↓
Update Index
↓
Update Cache (SessionSummaryCache)
↓
Archive Session
```

---

# Ⅵ. Event State Machine Enforcement

Storage は Event State Machine を強制する。

```
Pending → Open → Closed → Archived
Open → Corrected
```

### Rules  
```
ESM-001  Illegal transitions MUST be rejected.
ESM-002  Superseded MUST only occur via Revision.
ESM-003  Archived MUST be immutable.
```

---

# Ⅶ. Storage Constraints

```
STC-001  Storage MUST be append-only.
STC-002  All entries MUST be immutable.
STC-003  Index MUST be consistent with AOR.
STC-004  Cache MUST reflect latest state.
STC-005  Relation Mapping MUST be complete.
STC-006  Event State Machine MUST be enforced.
STC-007  Storage MUST support multi-source ingestion.
STC-008  Storage MUST support Project → Session → Record hierarchy.
```

---

# Ⅷ. Status

**ASA-IMPL-STOR-1.0 — Registered — Ready for Coding**

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-STOR-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Depends On | ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0 |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
