# Auto Scribe AI — Auto Capture Rule Specification

**Spec ID:** ASA-IMPL-CAP-1.0  
**Version:** 1.0  
**Status:** Implementation Specification (Ready for Coding)  
**Parent Baseline:** ASA-ARCH-2.0  
**Depends On:** ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0  
**Change Request (Record ID mapping):** ASA-CR-REC-001  

**Category:** Implementation Specification  
**Document Type:** Implementation Specification (Capture Logic)  
**Path:** `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md`  
**Parent Spec:** `docs/specs/auto_scribe_ai_architecture_phase12.md`  
**Record Schema:** `docs/specs/auto_scribe_ai_record_json_schema.md`  
**Runtime API:** `docs/specs/auto_scribe_ai_runtime_api_specification.md`  
**Storage Spec:** `docs/specs/auto_scribe_ai_storage_specification.md`  
**Baseline Registry:** `docs/baselines/ASA-ARCH-2.0.md`

本仕様は Architecture Baseline **ASA-ARCH-2.0** の子仕様であり、同 Baseline の治理規則を継承する。  
依存: **ASA-IMPL-REC-1.1** / **ASA-IMPL-API-1.0** / **ASA-IMPL-STOR-1.0**。

Downstream（Depends On this capture）:

- ASA-IMPL-EXP-1.0 — Export Specification

---

# Ⅰ. Overview

Auto Capture Rule Specification は、Auto Scribe AI の **イベント抽出・分類・記録判断ロジック**を定義する。

Architecture Baseline の以下の領域を実装レベルへ落とし込む：

- Capture  
- Normalize  
- Classify  
- Verify  
- Trigger Rules  
- Quality Policy  
- Confidence Threshold  
- Event State Machine（入力側）  

Auto Capture は **Runtime の入力側ロジック**であり、  
Record JSON Schema と Storage Spec に直接依存する。

---

# Ⅱ. Capture Principles

```
CAP-001  Capture MUST NOT interrupt conversation.
CAP-002  Capture MUST operate only when Recording State = Recording.
CAP-003  Capture MUST detect event candidates from raw text.
CAP-004  Capture MUST normalize all extracted fields.
CAP-005  Capture MUST classify event type using taxonomy.
CAP-006  Capture MUST assign confidence score.
CAP-007  Capture MUST apply Trigger Rules.
CAP-008  Capture MUST produce a Record JSON Schema object.
CAP-009  Capture MUST NOT store directly; storage is handled by API/Storage layer.
```

---

# Ⅲ. Capture Pipeline（実装レベル）

Architecture Baselineの抽象パイプラインを、実装可能な形に落とす。

```
Raw Message
↓
Event Detection
↓
Normalization
↓
Classification
↓
Confidence Scoring
↓
Trigger Evaluation
↓
Record Construction (JSON Schema)
↓
Return to Runtime API (/record/create)
```

---

# Ⅳ. Event Detection

## 1. Detection Targets

Auto Capture は以下のイベントを検出する：

```
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

## 2. Detection Rules（実装ロジック）

### Decision  
- 「決定」「採用」「方針」「〜とする」  
- 明確な意思決定を含む文

### TODO  
- 「やる」「対応する」「後で」「〜を実施」  
- 行動を示す文

### Issue  
- 「問題」「バグ」「懸念」「阻害要因」  
- 課題を示す文

### Question  
- 「なぜ」「どうする」「どう思う」  
- 質問文

### Idea  
- 「案」「提案」「思いついた」  
- 新しいアイデア

### ADR Candidate  
- 設計判断  
- 技術選択  
- 方式比較

### Review  
- 評価  
- フィードバック  
- コメント

### Meeting  
- 会議開始  
- 議題  
- 議事録対象

### Announcement  
- 連絡  
- 通知  
- 情報共有

---

# Ⅴ. Normalization Rules

Normalization は Record JSON Schema に適合させるための処理。

```
NRM-001  Timestamp MUST be ISO 8601.
NRM-002  Tags MUST be lowercase and deduplicated.
NRM-003  Participants MUST be normalized names.
NRM-004  Project name MUST map to project_id.
NRM-005  Session MUST map to session_id.
NRM-006  Event type MUST map to taxonomy.
NRM-007  Status MUST start as Pending or Open.
NRM-008  Confidence MUST be High / Medium / Low.
```

---

# Ⅵ. Classification Rules

分類は Event Detection の結果を taxonomy にマッピングする。

```
CLS-001  Classification MUST use taxonomy version 1.0.
CLS-002  Classification MUST be deterministic.
CLS-003  Classification MUST produce exactly one event_type.
CLS-004  Classification MUST NOT produce multi-type events.
```

---

# Ⅶ. Confidence Scoring

Confidence はイベント抽出の確度を示す。

```
High    → 明確なイベント（決定、TODO、Issue）
Medium  → 文脈依存のイベント（Idea、Review）
Low     → 弱い示唆（曖昧な提案、雑談）
```

### Confidence Score（内部値）
内部的には 0.0〜1.0 のスコアを持つ。

```
High    = 0.80〜1.00
Medium  = 0.50〜0.79
Low     = 0.00〜0.49
```

Record JSON Schema では **High / Medium / Low のみ保存**する。

---

# Ⅷ. Trigger Rules（実装レベル）

Architecture Baselineの Trigger Rules を実装可能な形にする。

```
TR-001  IF event_type = Decision AND confidence = High → Record
TR-002  IF event_type = TODO → Record
TR-003  IF event_type = Issue → Record
TR-004  IF user explicitly requests → Record
TR-005  IF session ends → Generate Session Summary
```

### Medium Confidence の扱い

```
Medium → Candidate（Record JSON Schema を生成するが、status = Pending）
```

### Low Confidence の扱い

```
Low → Idea（status = Pending, priority = Low）
```

---

# Ⅸ. Quality Policy（実装レベル）

```
QP-001  Duplicate records MUST be merged.
QP-002  Incomplete records MUST remain Pending.
QP-003  Low confidence records MUST be stored as Ideas.
QP-004  Every Decision MUST include evidence (content).
QP-005  Normalization MUST be applied before record construction.
```

---

# Ⅹ. Record Construction

Trigger Rulesが「Recordすべき」と判断した場合、  
Record JSON Schema を構築する。

### Required Fields（JSON Schema準拠）

```
record_id
record_version
project_id
session_id
timestamp
source
event_type
status
content
```

### Auto-generated Fields

```
record_id        → prefix mapping below (ASA-IMPL-REC-1.1 / ASA-CR-REC-001)
record_version   → v1
timestamp        → now()
source           → ChatGPT / Cursor / Claude / Manual
status           → Open or Pending
confidence       → High / Medium / Low
metadata         → normalized fields
```

### Record ID Prefix Mapping（ASA-CR-REC-001）

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

```
Discussion → DISC-xxxxx
Meeting → MEET-xxxxx
Announcement → ANN-xxxxx
```

---

# Ⅺ. Event State Machine（入力側）

Capture は Event State Machine の初期状態を決定する。

```
Decision → Open
TODO → Open
Issue → Open
Idea → Pending
Question → Pending
Review → Pending
Announcement → Open
Meeting → Open
ADR Candidate → Open
```

---

# Ⅻ. Capture Constraints

```
CAPC-001  Capture MUST NOT store records directly.
CAPC-002  Capture MUST return JSON Schema to Runtime API.
CAPC-003  Capture MUST respect Recording State.
CAPC-004  Capture MUST enforce Trigger Rules.
CAPC-005  Capture MUST enforce Quality Policy.
CAPC-006  Capture MUST enforce Event State Machine.
CAPC-007  Capture MUST produce deterministic output.
```

---

# ⅩⅢ. Status

**ASA-IMPL-CAP-1.0 — Registered — Ready for Coding**

---

# Registration

| Item | Value |
|---|---|
| Spec ID | ASA-IMPL-CAP-1.0 |
| Parent Baseline | ASA-ARCH-2.0 |
| Depends On | ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0 |
| Change Request | ASA-CR-REC-001 (Record ID Prefix Mapping) |
| Status | Registered — Ready for Coding |
| Governance | Inherits ASA-ARCH-2.0 |
