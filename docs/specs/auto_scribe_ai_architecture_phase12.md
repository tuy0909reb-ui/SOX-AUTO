# Phase12 – Auto Scribe AI

**Version:** 2.0  
**Baseline ID:** ASA-ARCH-2.0  
**Status:** Design Baseline  
**Supersedes:** ASA-ARCH-1.3  
**Approved:** Pending Human Approval  
**Next Phase:** Implementation Specification  
**Category:** Runtime / Operation  
**Document Type:** Architecture Specification (Final)  
**Path:** `docs/specs/auto_scribe_ai_architecture_phase12.md`

**Definition:** Auto Scribe AI is a **recording service composed of modular runtime components**.

**Implementation Policy:** Design Freeze. Architecture-impacting changes require Change Request. Runtime details are added as subordinate specifications.

---

# Ⅰ. Architecture Overview

Auto Scribe AI は、開発プロジェクトの「記憶」を構築するための **自動書記サービス（Recording Service）** である。  
本仕様は、Auto Scribe AI の **Runtime Architecture** を定義し、モデル差し替え・複数AI構成・キャラクター変更に依存しない基盤を提供する。

---

## 1. Scope

### Included

- Development conversations
- Decisions
- TODO
- Issues
- ADR candidates
- Ideas
- Questions
- Protocol changes
- Review results
- Meeting logs
- Session summaries

### Excluded

- Human approval
- Production changes
- External system operations
- Source code
- Implementation logic
- Private or unrelated conversations

---

## 2. Pipeline Architecture

```text
Conversation
↓
Capture
↓
Normalize
↓
Classify
↓
Verify
↓
Store
↓
Summarize
↓
Search
↓
Export
```

---

## 3. Recording Lifecycle

```text
Idle
↓
Recording
↓
Paused
↓
Recording
↓
Stopped
↓
Archived
```

---

## 4. Project Model

```text
Project
 ├ Project ID
 ├ Project Name
 ├ Created
 ├ Status
 └ Description
      ↓
      Session
           ↓
           Record
```

---

## 5. Session Model

```text
Session ID
開始時刻
終了時刻
参加者
対象プロジェクト
Session Summary
```

---

## 6. Session Policy

```text
SP-001  Default: Session starts in Idle.
SP-002  If Recording Enabled = true, session auto-starts in Recording.
SP-003  Temporary Pause only affects current session.
SP-004  Recording Enabled persists across sessions until disabled.
SP-005  Recording Stop disables Recording Enabled.
```

---

## 7. Recording Policy

```text
Message
↓
Event
↓
Record
```

---

## 8. Correction Policy

```text
Record
↓
Revision 1
↓
Revision 2
↓
Current
```

または

```text
DEC-00023
Status: Corrected
Superseded by: DEC-00031
```

---

## 9. Retention Policy

```text
日次ログ確定タイミング
アーカイブ条件
削除条件
修正履歴の扱い
```

---

## 10. Presentation Layer（Character Layer）

```text
Defined separately.
No effect on runtime logic.
```

---

# Ⅱ. Data Model

---

## 1. Record Structure

```text
Record ID
Record Version
Session ID
Project ID
Timestamp
Source
Event Type
Priority
Status
Confidence
Content
Metadata
```

---

## 2. Event Taxonomy

```text
Decision
Discussion
Question
Idea
Issue
TODO
ADR Candidate
Review
Meeting
Announcement
```

---

## 3. Taxonomy Version

```text
Taxonomy Version: 1.0
```

---

## 4. Priority

```text
Critical
High
Medium
Low
```

---

## 5. Status

```text
Pending
Open
Closed
Archived
Corrected
Superseded
```

---

## 6. Event State Machine

```text
Pending
  ↓
Open
  ↓
Closed
  ↓
Archived
```

修正時：

```text
Open
  ↓
Corrected
```

---

## 7. Confidence

```text
High
Medium
Low
```

---

## 8. Metadata

```text
Date
Project
Tags
Participants
Related ADR
Related Protocol
Confidence
Status
Source
Taxonomy Version
```

---

# Ⅲ. Runtime Logic

---

## 1. Capture

会話からイベント候補を抽出。

---

## 2. Normalize

- 日時フォーマット統一
- タグの正規化
- 表記ゆれ補正
- 重複候補の整理
- プロジェクト名の統一
- 参加者名の統一

---

## 3. Classify

分類辞書に基づいて分類。

---

## 4. Verify

- 抽出結果の整合確認
- 重複確認
- Confidence付与
- 記録単位の妥当性確認
- Human確認待ち
- 記録ポリシーとの整合性チェック

---

## 5. Auto Capture Threshold

```text
Decision
Confidence >= High → 自動記録
Confidence = Medium → Candidate
Confidence = Low → Idea
```

---

## 6. Human Confirmation Rule

```text
High → 即記録
Medium → 候補
Low → Idea
```

---

## 7. Store

```text
ST-001  Store record in append-only repository.
ST-002  Update index for all searchable fields.
ST-003  Update search cache for fast retrieval.
ST-004  Ensure normalization before indexing.
ST-005  Trigger relation mapping (ADR / TODO / Issue).
```

---

## 8. Error Handling

```text
Capture失敗
↓
Retry
↓
Failure Log
↓
Human確認
```

---

## 9. Summarize

- Daily Development Log
- Weekly Summary
- Monthly Summary
- Session Summary
- Snapshot

---

# Ⅳ. Trigger Rules

## Precondition

```text
TR-PRE-001  
Trigger Rules are evaluated ONLY when Recording State = Recording.

TR-PRE-002  
IF Recording State != Recording  
Ignore Capture and skip Trigger evaluation.
```

## Rules

```text
TR-001  Decision detected → Record
TR-002  TODO detected → Record
TR-003  Issue detected → Record
TR-004  User explicitly requests recording → Record
TR-005  Session ends → Generate Session Summary + Record
```

---

# Ⅴ. Record Quality Policy

```text
QP-001  Duplicate records are merged.
QP-002  Incomplete records remain Pending.
QP-003  Low confidence records are stored as Ideas.
QP-004  Every Decision must have evidence.
QP-005  Records must be normalized before storage.
```

---

# Ⅵ. Interaction Rules

```text
IR-001  Do not interrupt conversations.
IR-002  Record silently by default.
IR-003  Ask only when required.
IR-004  Never force summaries.
IR-005  Avoid generating unsolicited suggestions.
```

---

# Ⅶ. Session Close Procedure

```text
Recording Stop
↓
Generate Session Summary
↓
Generate Daily Log
↓
Archive
↓
Ready
```

---

# Ⅷ. Search & Export

## Search Axes

```text
Decision
Date
Tag
ADR
Issue
Protocol
Keyword
Confidence
Status
Record ID
Session ID
Project ID
Priority
Source
```

## Relations

```text
Related Records
Related ADR
Related TODO
Related Issue
```

## Export Formats

```text
Markdown
JSON
CSV
HTML
```

## Timeline

時系列で記録を表示。

## Snapshot

```text
Decision 5
TODO 3
Issue 1
Pending 2
```

---

# Ⅸ. Functional Requirements（FR）

```text
FR-001  System shall capture conversations.
FR-002  System shall normalize captured events.
FR-003  System shall classify events based on taxonomy.
FR-004  System shall verify extracted records.
FR-005  System shall store records with metadata.
FR-006  System shall support manual correction.
FR-007  System shall maintain revision history.
FR-008  System shall generate daily/weekly/monthly summaries.
FR-009  System shall support search by all metadata fields.
FR-010  System shall export records in multiple formats.
FR-011  System shall apply Trigger Rules consistently.
FR-012  System shall enforce Record Quality Policy.
FR-013  System shall follow Interaction Rules.
FR-014  System shall execute Session Close Procedure.
FR-015  System shall maintain Project hierarchy.
FR-016  System shall enforce Event State Machine transitions.
```

---

# Ⅹ. Non-Functional Requirements（NFR）

```text
NFR-001  Search operations shall complete within 3 seconds.
NFR-002  Export operations shall complete within 10 seconds.
NFR-003  Daily Summary generation shall complete within 5 seconds.
NFR-004  Traceability shall be 100%.
NFR-005  Record storage shall be append-only.
NFR-006  System shall preserve all historical revisions.
NFR-007  System shall support multi-source ingestion.
NFR-008  System shall maintain consistent taxonomy usage.
NFR-009  Index updates shall complete within 2 seconds.
```

---

# Ⅺ. Architecture Constraints（AC）

```text
AC-001  Character Layer must not affect runtime logic.
AC-002  Correction Policy must preserve history.
AC-003  Store must be append-only.
AC-004  Event Taxonomy must be stable and versioned.
AC-005  Recording Mode must follow Session Policy.
AC-006  Runtime components must be modular and replaceable.
AC-007  Search must operate on normalized data only.
AC-008  Trigger Rules must be deterministic.
AC-009  Event State Machine must be strictly enforced.
```

---

# Ⅻ. Future Extensions（FE）

```text
FE-001  Voice Recording
FE-002  Image Capture
FE-003  Code Diff Capture
FE-004  Git Integration
FE-005  Issue Tracker Integration
FE-006  Multi-AI Pipeline
FE-007  Timeline Visualization UI
```

---

# ⅩⅢ. Baseline Registration

| Item | Value |
|---|---|
| Baseline ID | ASA-ARCH-2.0 |
| Design Freeze | Yes（Change Request 必須） |
| Runtime SoT | 本仕様が唯一の Runtime Architecture Baseline |
| Next Specs | Runtime API / Record JSON Schema / Storage / Search / Auto Capture Rule |

---
