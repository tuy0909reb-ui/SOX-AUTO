# Auto Scribe AI — Export Specification

**Spec ID:** ASA-IMPL-EXP-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Depends On:** ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0, ASA-IMPL-CAP-1.0  
**Category:** Implementation Specification  
**Document Type:** Implementation Specification (Export Layer)  
**Path:** `docs/specs/auto_scribe_ai_export_specification.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Record Schema:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Runtime API:** `docs/specs/auto_scribe_ai_runtime_api_specification.md`  
**Storage Spec:** `docs/specs/auto_scribe_ai_storage_specification.md`  
**Search Spec:** `docs/specs/auto_scribe_ai_search_specification.md`  
**Capture Spec:** `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。  
依存: **ASA-IMPL-REC-1.1** / **ASA-IMPL-API-1.0** / **ASA-IMPL-STOR-1.0** / **ASA-IMPL-SRCH-1.0** / **ASA-IMPL-CAP-1.0**。

---

# Ⅰ. Overview

Export Specification は、Auto Scribe AI の **出力生成（Export Layer）** の実装仕様である。

Architecture Baseline の以下の領域を実装レベルへ落とし込む：

- Daily Log  
- Session Summary  
- Project Export  
- Snapshot Export  
- Export Format  
- Export Pipeline  
- Export Constraints  

Export は Search に依存するため、  
ASA-IMPL-SRCH-1.0 が完成した今が正しい作成タイミングである。

---

# Ⅱ. Export Principles

```
EXP-001  Export MUST NOT mutate storage.
EXP-002  Export MUST use Search Specification for data retrieval.
EXP-003  Export MUST operate only on normalized records.
EXP-004  Export MUST support multiple output formats.
EXP-005  Export MUST preserve Project → Session → Record hierarchy.
EXP-006  Export MUST support daily, session, and project scopes.
EXP-007  Export MUST support snapshot summaries.
EXP-008  Export MUST be deterministic.
EXP-009  Export MUST NOT depend on Capture Logic.
```

---

# Ⅲ. Export Types（実装レベル）

```
Daily Log Export
Session Summary Export
Project Export
Snapshot Export
```

---

# Ⅳ. Export Formats

Version 1.0 では以下の3形式をサポートする。

```
Markdown (.md)
JSON (.json)
Plain Text (.txt)
```

### Format Rules

```
FMT-001  Markdown MUST be human-readable.
FMT-002  JSON MUST be machine-readable and schema-consistent.
FMT-003  Plain Text MUST be minimal and compact.
FMT-004  All formats MUST include metadata (project/session/timestamp).
```

---

# Ⅴ. Export Pipeline（実装レベル）

```
Input (scope)
↓
Search Query
↓
Record Retrieval
↓
Record Grouping
↓
Record Formatting
↓
Output Generation
↓
Return to Runtime API (/export/*)
```

---

# Ⅵ. Daily Log Export

### Scope  
1日分の記録をまとめる。

### Search Query  
```
timestamp BETWEEN start_of_day AND end_of_day
project_id = X (optional)
```

### Structure (Markdown)

```
# Daily Log — 2026-07-21

## Decisions
- DEC-00023: Auto Scribe AI Architecture Baseline approved.

## TODO
- TODO-00012: Implement Storage Specification.

## Issues
- ISS-00003: Search ranking inconsistency.

## Ideas
- IDEA-00011: Multi-AI pipeline optimization.

## Summary
Total Records: 17
```

### Rules

```
DL-001  Records MUST be grouped by event_type.
DL-002  Records MUST be sorted by timestamp DESC.
DL-003  Summary MUST include counts per event_type.
```

---

# Ⅶ. Session Summary Export

### Scope  
1セッション分の記録をまとめる。

### Search Query  
```
session_id = SES-xxxx
```

### Structure (Markdown)

```
# Session Summary — SES-20260721-NIGHT

## Overview
Project: Phase12 Development
Start: 2026-07-21T19:00:00Z
End:   2026-07-21T21:00:00Z

## Key Decisions
- DEC-00023: Architecture Baseline approved.

## TODO
- TODO-00012: Implement Storage Specification.

## Issues
- ISS-00003: Search ranking inconsistency.

## Statistics
Total Records: 12
Decisions: 3
TODO: 4
Issues: 1
Ideas: 2
```

### Rules

```
SS-001  Summary MUST include session metadata.
SS-002  Summary MUST include statistics.
SS-003  Summary MUST include grouped records.
SS-004  Summary MUST be generated automatically on /session/stop.
```

---

# Ⅷ. Project Export

### Scope  
プロジェクト全体の記録をまとめる。

### Search Query  
```
project_id = PRJ-xxxx
```

### Structure (Markdown)

```
# Project Export — Phase12 Development

## Decisions
- DEC-00023: Architecture Baseline approved.
- DEC-00041: JSON Schema finalized.

## TODO
- TODO-00012: Implement Storage Specification.
- TODO-00033: Write Search Specification.

## Issues
- ISS-00003: Search ranking inconsistency.

## ADR Candidates
- ADR-00005: Append-only Storage Model.

## Summary
Total Records: 87
```

### Rules

```
PE-001  Records MUST be grouped by event_type.
PE-002  Records MUST be sorted by timestamp ASC.
PE-003  Summary MUST include total counts.
```

---

# Ⅸ. Snapshot Export

Snapshot は集計情報のみを返す。

### Structure (JSON)

```json
{
  "Decision": 12,
  "TODO": 23,
  "Issue": 4,
  "Idea": 18,
  "Pending": 7
}
```

### Rules

```
SNAP-001  Snapshot MUST use Search Specification.
SNAP-002  Snapshot MUST NOT include full records.
SNAP-003  Snapshot MUST support project_id or session_id.
```

---

# Ⅹ. Export Constraints

```
EXPC-001  Export MUST NOT mutate storage.
EXPC-002  Export MUST use Search Specification for all retrieval.
EXPC-003  Export MUST support Markdown, JSON, and Plain Text.
EXPC-004  Export MUST preserve hierarchy.
EXPC-005  Export MUST be deterministic.
EXPC-006  Export MUST support daily, session, and project scopes.
EXPC-007  Export MUST support snapshot summaries.
```

---

# Ⅺ. Status

**ASA-IMPL-EXP-1.0 — Registered — Ready for Coding**

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-EXP-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Depends On | ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0, ASA-IMPL-CAP-1.0 |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
