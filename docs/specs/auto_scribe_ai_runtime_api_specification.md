# Auto Scribe AI — Runtime API Specification（修正版）

**Spec ID:** ASA-IMPL-API-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Depends on:** ASA-IMPL-REC-1.1  
**Category:** Implementation Specification  
**Path:** `docs/specs/auto_scribe_ai_runtime_api_specification.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Record Schema:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。  
Record 入出力は **ASA-IMPL-REC-1.1** に準拠する。

Downstream（Depends On this API）:

- ASA-IMPL-STOR-1.0 — Storage Specification
- ASA-IMPL-CAP-1.0 — Auto Capture Rule Specification
- ASA-IMPL-SRCH-1.0 — Search Specification
- ASA-IMPL-EXP-1.0 — Export Specification

---

# Ⅰ. Overview

Auto Scribe AI Runtime の API 契約（Contract）を定義する。  
Architecture Baseline の Pipeline / Session Policy / Trigger Rules / Quality Policy を実装レベルへ落とし込む。

---

# Ⅱ. API Principles

```
AP-001  Append-only storage（書き換え禁止）
AP-002  Record JSON Schema を厳密に適用
AP-003  Recording State を尊重（Session Policy）
AP-004  Trigger Rules を内部適用
AP-005  Event State Machine を強制
AP-006  Project → Session → Record の階層構造を維持
```

---

# Ⅲ. Error Model（新規追加）

### Error Response（共通）

```json
{
  "error_code": "NOT_FOUND",
  "message": "Record not found",
  "details": {}
}
```

### Error Codes

```
NOT_FOUND
INVALID_REQUEST
CONFLICT
INTERNAL_ERROR
```

---

# Ⅳ. API Endpoints（修正版）

```
/project/create
/project/{project_id}
/project/list

/session/start
/session/stop
/session/{session_id}
session/list?project_id=...

/record/create
/record/revise
/record/{record_id}
record/list?session_id=...

/search/query

/export/daily
/export/session
/export/project
```

---

# Ⅴ. API Specifications（修正版）

---

# 1. **Project API**

## **1.1 POST /project/create**

### Request
```json
{
  "project_name": "Phase12 Development",
  "description": "Auto Scribe AI Runtime Architecture",
  "created_by": "Tsuyoshi"
}
```

### Response
```json
{
  "project_id": "PRJ-00012",
  "status": "Created"
}
```

---

## **1.2 GET /project/{project_id}**

### Response
```json
{
  "project_id": "PRJ-00012",
  "project_name": "Phase12 Development",
  "created": "2026-07-21T12:00:00Z",
  "status": "Active",
  "description": "Auto Scribe AI Runtime Architecture"
}
```

---

## **1.3 GET /project/list**

---

# 2. **Session API**

## **2.1 POST /session/start**

### Request
```json
{
  "project_id": "PRJ-00012",
  "started_by": "Tsuyoshi"
}
```

### Response
```json
{
  "session_id": "SES-20260721-NIGHT",
  "state": "Recording"
}
```

---

## **2.2 POST /session/stop**

### Response
```json
{
  "session_id": "SES-20260721-NIGHT",
  "state": "Stopped",
  "summary_generated": true,
  "daily_log_generated": true,
  "archived": true
}
```

---

## **2.3 GET /session/{session_id}**

---

## **2.4 GET /session/list?project_id=PRJ-00012**

---

# 3. **Record API**

Record JSON Schema を入出力として利用。

---

## **3.1 POST /record/create**

### Request  
Record JSON Schema に準拠。

### Response
```json
{
  "record_id": "DEC-00023",
  "stored": true
}
```

---

## **3.2 POST /record/revise**（修正版）

Correction Policy に基づき Revision を追加する。

### Request
```json
{
  "record_id": "DEC-00023",
  "record_version": "v2",
  "status": "Corrected",
  "content": "Corrected decision text."
}
```

### Response
```json
{
  "record_id": "DEC-00023",
  "revision_added": true,
  "previous_version": "v1"
}
```

---

## **3.3 GET /record/{record_id}**

---

## **3.4 GET /record/list?session_id=SES-20260721-NIGHT**

---

# 4. **Search API**

## **POST /search/query**

### Request
```json
{
  "query": "Decision",
  "filters": {
    "project_id": "PRJ-00012",
    "event_type": "Decision",
    "status": "Open"
  },
  "sort": "recent"
}
```

### Response  
Record JSON Schema の配列。

---

# 5. **Export API**

## **/export/daily**  
## **/export/session**  
## **/export/project**

---

# Ⅵ. API Constraints（Architecture Baseline準拠）

```
AC-API-001  All API inputs must validate against ASA-IMPL-REC-1.1.
AC-API-002  All writes must be append-only.
AC-API-003  Search must operate on normalized data only.
AC-API-004  Trigger Rules must be applied internally.
AC-API-005  Event State Machine must be enforced.
AC-API-006  Recording State must be respected.
```

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-API-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Depends On | ASA-IMPL-REC-1.1 |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
