# Architecture Baseline – ASA-ARCH-13.0

**Baseline ID:** ASA-ARCH-13.0  
**Title:** Knowledge Memory Architecture  
**Version:** 1.0  
**Status:** Registered — Ready for Implementation  
**Category:** Knowledge Layer  
**Document Type:** Architecture Baseline  
**Parent Baseline:** ASA-ARCH-12.0（Event Layer）  
**Parent Equivalence:** ASA-ARCH-2.0（Phase12 detailed Design Baseline）  
**Next Planned:** —（Traceability Layer は ASA-ARCH-14.0 として登録済み）  
**Registry Path:** `docs/baselines/ASA-ARCH-13.0.md`

---

## 1. Registration Declaration

本書は Auto Scribe AI / Decision Knowledge Memory の **正式な Architecture Baseline（Knowledge Layer）** である。

- Knowledge Layer の唯一の Architecture Baseline とする
- 以降の Knowledge 実装仕様（ASA-IMPL-DEC / IMP / REV / DSEARCH）は本 Baseline を親とする
- Design Freeze：アーキテクチャ影響変更は Change Request 経由のみ
- Phase12 Event Layer（ASA-ARCH-12.0 / ASA-ARCH-2.0）と後方互換を維持する（DKM-008）

---

## 2. Phase Architecture

```text
ASA-ARCH-12.0
Event Layer
Project / Session / Record / Search / Export

↓

ASA-ARCH-13.0
Knowledge Layer（本 Baseline）
DEC / IMP / REV / DSEARCH
Relation Layer（RecordRef）
DKM Principles

↓

ASA-ARCH-14.0
Traceability Layer
TRACE（abstract） / COMMIT / PR / ISSUE / RELEASE
```

---

## 3. Architecture Scope

| Domain | Responsibility |
|---|---|
| **Decision Memory (DEC)** | 意思決定そのものを記録する |
| **Implementation Memory (IMP)** | 決定に対する実装・実行を記録する |
| **Revert Memory (REV)** | Implementation および／または Decision 影響の撤回・巻き戻しを記録する |
| **Decision Search (DSEARCH)** | Knowledge 横断 Deep Search（DEC / IMP / REV；正式名 Deep Search） |
| **Knowledge Layer** | DEC / IMP / REV を束ねるレイヤー境界 |
| **RecordRef Model** | 型付き参照モデル（Phase12 Relation と整合） |
| **DKM Principles** | Knowledge Layer の不変原則 |
| **DecisionStatus** | Decision の状態空間 |
| **ImplementationStatus** | Implementation の状態空間 |
| **RelationType** | Knowledge 間の関係種別 |
| **ActorType / SourceType** | 行為者・起源の分類 |

---

## 4. DKM Principles（確定）

```
DKM-001  Knowledge records MUST be append-only.
DKM-002  Decision, Implementation, and Revert records MUST be immutable after creation.
DKM-003  Updates MUST create new records rather than overwrite existing ones.
DKM-004  Knowledge records MUST be searchable through the Search Layer.
DKM-005  Every Implementation SHOULD reference at least one Decision.
DKM-006  Every Revert MUST reference the affected Decision.
DKM-007  Relations MUST use the shared Relation Layer defined in ASA-ARCH-12.x.
DKM-008  Architecture MUST remain backward compatible with Phase12 Event Records.
DKM-009  Knowledge records MUST NOT depend on GitHub availability (Phase14 optional).
DKM-010  Knowledge records SHOULD be human-readable and AI-readable.
```

---

## 5. DEC / IMP / REV Responsibilities

### 5.1 Decision Memory（DEC）

* 何を決めたか（Decision）を記録する
* Event Layer の Decision イベントと整合可能（DKM-008）
* 状態は DecisionStatus で表現する
* 更新は上書き禁止。新 DEC 記録 + Relation（例: supersedes）で表現する（DKM-001〜003）

### 5.2 Implementation Memory（IMP）

* 決定をどう実装したか（Implementation）を記録する
* 少なくとも 1 つの DEC を参照することが推奨される（DKM-005）
* 状態は ImplementationStatus で表現する

### 5.3 Revert Memory（REV）

* Implementation の明示的な取り消し、および／または Decision 影響の撤回・無効化・巻き戻しを記録する（ASA-CR-REV-001）
* 影響を受ける DEC を必ず参照する（DKM-006）
* Implementation を取り消す場合は対象 IMP を RecordRef で参照する（詳細は ASA-IMPL-REV-1.0）
* Revert は元 DEC / IMP を改変しない（append-only / immutable）

### 5.4 Separation Rules

* DEC に実装詳細を混在させない
* IMP に撤回理由の正本を持たせない（正本は REV）
* REV に新規決定内容の正本を持たせない（正本は DEC）

---

## 6. RecordRef Model（Baseline定義）

Phase14 以降の外部参照拡張を見据え、単純な ID 文字列参照ではなく **RecordRef** を採用する。

### 6.1 Canonical Form

```json
{
  "record_type": "DEC | IMP | REV | ADR | ISSUE | TODO | EXT",
  "record_id": "DEC-00012"
}
```

### 6.2 Compact Form（許可）

```json
"target_ref": "DEC-00012"
```

Compact Form は同一 Knowledge / Event 空間内の短縮記法とする。  
外部・異種システム参照では Canonical Form を必須とする。

### 6.3 Relation + RecordRef

Phase12 Relation Layer と組み合わせる：

```json
{
  "type": "supersedes",
  "target": {
    "record_type": "DEC",
    "record_id": "DEC-00007"
  }
}
```

DKM-007：Relations MUST use the shared Relation Layer defined in ASA-ARCH-12.x。

---

## 7. DecisionStatus

Decision の状態空間（Architecture 定義 / **Source of Truth**）。  
実装仕様・Runtime・JSON Schema は本 enum を参照する（ASA-CR-DEC-001）。

```
Proposed
Active
Superseded
Reverted
Archived
```

### Rules

* 状態変更は記録の上書きではなく、新記録または Relation で表現する（DKM-002 / DKM-003）
* `Superseded` は後続 DEC への Relation（例: supersedes）と併用する
* `Reverted` は REV 記録の存在と整合する（DKM-006）

---

## 8. ImplementationStatus

Implementation の状態空間（Architecture 定義）。実装スキーマは ASA-IMPL-IMP-1.0 で確定する。

```
Planned
InProgress
Completed
Abandoned
```

---

## 9. RelationType

Knowledge Layer で用いる関係種別（Architecture 定義）。Phase12 Relation Mapping を拡張利用する。

```
implements
supersedes
reverts
related_to
derived_from
```

* `implements` : IMP → DEC
* `supersedes` : DEC → DEC（および同種記録の更新連鎖）
* `reverts` : REV → DEC **and/or** REV → IMP（ASA-CR-REV-001）
  * DKM-006: REV は常に影響 DEC を参照する（`related_decision`）
  * IMP 取り消し時は `reverts` の対象にその IMP を含めてよい
  * REV → REV の `reverts` は禁止（実装仕様で検証）
* `related_to` : 一般関連
* `derived_from` : 派生元参照

---

## 10. ActorType / SourceType

ActorType / SourceType は Architecture 定義 / **Source of Truth**（ASA-CR-DEC-001）。  
実装仕様の Request Example・Runtime Validation・JSON Schema は本 enum のみを使用する。

### ActorType

```
Human
AI
System
```

### SourceType

```
Manual
ChatGPT
Cursor
Claude
External
GitHub
```

* `GitHub` は Phase14 Traceability 連携用。Knowledge 本体は GitHub 非依存（DKM-009）
* Phase12 `source` enum との後方互換を維持する（DKM-008）

---

## 11. Deep Search（DSEARCH）

* Knowledge 記録は Search Layer 経由で検索可能でなければならない（DKM-004）
* Phase12 Search（ASA-IMPL-SRCH-1.0）を基盤とし、DEC / IMP / REV を横断する **Deep Search** を定義する（ASA-CR-DSEARCH-001）
* 詳細契約は ASA-IMPL-DSEARCH-1.0（Deep Search Specification）で定義する
* 歴史的別名: Decision Search

---

## 12. Backward Compatibility（Phase12）

* Event Records（ASA-IMPL-REC-1.1）を破壊しない
* Relation Layer（ASA-IMPL-STOR-1.0）を共有する
* Knowledge 記録は Event Layer の上に載る追加レイヤーであり、Event SoT を置換しない
* 既存 API（ASA-IMPL-API-1.0）の意味を変更しない（拡張は子仕様で定義）

---

## 13. Next Implementation Specifications

| Spec ID | Title | Status |
|---|---|---|
| **ASA-IMPL-DEC-1.0** | Decision Memory Specification | Ready for Coding → `docs/specs/auto_scribe_ai_decision_memory_specification.md` |
| **ASA-IMPL-IMP-1.0** | Implementation Memory Specification | Ready for Coding → `docs/specs/auto_scribe_ai_implementation_memory_specification.md` |
| **ASA-IMPL-REV-1.0** | Revert Memory Specification | Ready for Coding → `docs/specs/auto_scribe_ai_revert_memory_specification.md` |
| **ASA-IMPL-DSEARCH-1.0** | Deep Search Specification | Ready for Coding → `docs/specs/auto_scribe_ai_deep_search_specification.md` |

Parent Baseline for all of the above: **ASA-ARCH-13.0**

---

## 14. Boundary Note

Knowledge Memory Architecture:

* Records decisions, implementations, and reverts as append-only knowledge
* Does **not** perform Human Approval by itself
* Does **not** require GitHub / external systems for core Knowledge (DKM-009)
* Does **not** replace Phase12 Event Layer
* Character Layer has no effect on Knowledge runtime logic

---

## 15. Status

```text
Registered — Ready for Implementation

ASA-ARCH-13.0 is the current Knowledge Layer Architecture Baseline.
DKM Principles are finalized.
RecordRef is adopted.
DEC / IMP / REV responsibilities are separated.
Ready for child implementation specifications.
```

---

# Registration

| Item | Value |
|---|---|
| Architecture ID | ASA-ARCH-13.0 |
| Title | Knowledge Memory Architecture |
| Version | 1.0 |
| Parent Baseline | ASA-ARCH-12.0 |
| Parent Equivalence | ASA-ARCH-2.0 |
| Status | Registered — Ready for Implementation |
| Governance | Child of Event Layer; parent of DEC/IMP/REV/DSEARCH specs |
