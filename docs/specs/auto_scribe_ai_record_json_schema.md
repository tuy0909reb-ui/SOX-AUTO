# Auto Scribe AI — Record JSON Schema

**Spec ID:** ASA-IMPL-REC-1.1  
**Version:** 1.1  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Supersedes:** ASA-IMPL-REC-1.0  
**Change Request:** ASA-CR-REC-001  
**Category:** Implementation Specification  
**Path:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

**Purpose:**  
Auto Scribe AI のすべての記録データ（Record）を統一形式で保存・検索・転送するための JSON Schema を定義する。

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。

Downstream（Depends On this schema）:

- ASA-IMPL-API-1.0 — Runtime API Specification
- ASA-IMPL-STOR-1.0 — Storage Specification
- ASA-IMPL-CAP-1.0 — Auto Capture Rule Specification
- ASA-IMPL-SRCH-1.0 — Search Specification
- ASA-IMPL-EXP-1.0 — Export Specification

---

# Change History

| Version | Spec ID | Change | Compatibility |
|---|---|---|---|
| 1.0 | ASA-IMPL-REC-1.0 | Initial Record JSON Schema | — |
| **1.1** | **ASA-IMPL-REC-1.1** | ASA-CR-REC-001: `record_id` prefix に DISC / MEET / ANN を追加（Event Taxonomy 整合） | Backward Compatible |

---

# 修正方針（確定反映）

### `additionalProperties` の方針

- トップレベル：**厳格（false）**
- `metadata`：**拡張許可（true）**

### `record_id` に pattern を追加

### `record_version` に pattern を追加

### `taxonomy_version` に pattern を追加

### 将来拡張を見据えた `content` の構造化余地を確保

（現状は string のまま、Phase13で object に拡張可能）

### `confidence_score` の追加余地を確保

（現状は追加しないが、将来の Phase13 で導入可能）

### ASA-CR-REC-001（Version 1.1）

Event Taxonomy と `record_id` Prefix を 1 対 1 対応に揃える。既存 Prefix はすべて有効のまま。

| Event Type | Record Prefix |
|---|---|
| Decision | DEC |
| Discussion | DISC |
| Question | QST |
| Idea | IDEA |
| Issue | ISS |
| TODO | TODO |
| ADR Candidate | ADR |
| Review | REV |
| Meeting | MEET |
| Announcement | ANN |

---

# Record JSON Schema — Version 1.1（確定版）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Auto Scribe AI - Record Schema",
  "description": "Unified record format for Auto Scribe AI (ASA-ARCH-2.0 / ASA-IMPL-REC-1.1)",
  "type": "object",
  "additionalProperties": false,

  "properties": {
    "record_id": {
      "type": "string",
      "description": "Unique identifier (e.g., DEC-00023, DISC-00001)",
      "pattern": "^(DEC|ISS|TODO|ADR|REV|QST|IDEA|DISC|MEET|ANN)-[0-9]{5}$"
    },

    "record_version": {
      "type": "string",
      "description": "Version of the record (e.g., v1, v2)",
      "pattern": "^v[0-9]+$"
    },

    "project_id": {
      "type": "string",
      "description": "Parent project identifier"
    },

    "session_id": {
      "type": "string",
      "description": "Parent session identifier"
    },

    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },

    "source": {
      "type": "string",
      "enum": ["ChatGPT", "Cursor", "Claude", "Manual", "External"],
      "description": "Origin of the record"
    },

    "event_type": {
      "type": "string",
      "enum": [
        "Decision",
        "Discussion",
        "Question",
        "Idea",
        "Issue",
        "TODO",
        "ADR Candidate",
        "Review",
        "Meeting",
        "Announcement"
      ],
      "description": "Event taxonomy type"
    },

    "priority": {
      "type": "string",
      "enum": ["Critical", "High", "Medium", "Low"],
      "description": "Priority level"
    },

    "status": {
      "type": "string",
      "enum": [
        "Pending",
        "Open",
        "Closed",
        "Archived",
        "Corrected",
        "Superseded"
      ],
      "description": "State of the record"
    },

    "confidence": {
      "type": "string",
      "enum": ["High", "Medium", "Low"],
      "description": "Confidence level"
    },

    "content": {
      "type": "string",
      "description": "Main text content of the record"
    },

    "metadata": {
      "type": "object",
      "description": "Additional metadata",
      "additionalProperties": true,

      "properties": {
        "date": { "type": "string", "format": "date" },
        "project": { "type": "string" },

        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },

        "participants": {
          "type": "array",
          "items": { "type": "string" }
        },

        "related_adr": {
          "type": "array",
          "items": { "type": "string" }
        },

        "related_protocol": {
          "type": "array",
          "items": { "type": "string" }
        },

        "taxonomy_version": {
          "type": "string",
          "description": "Version of taxonomy (e.g., 1.0)",
          "pattern": "^[0-9]+\\.[0-9]+$"
        }
      },

      "required": ["date", "project"]
    }
  },

  "required": [
    "record_id",
    "record_version",
    "project_id",
    "session_id",
    "timestamp",
    "source",
    "event_type",
    "status",
    "content"
  ]
}
```

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-REC-1.1 |
| Supersedes | ASA-IMPL-REC-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Change Request | ASA-CR-REC-001 |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
