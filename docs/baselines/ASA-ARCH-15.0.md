# Architecture Baseline – ASA-ARCH-15.0

**Baseline ID:** ASA-ARCH-15.0  
**Title:** Trace Intelligence Layer  
**Version:** Final v9  
**Status:** CLOSED — Immutable Production Baseline  
**Category:** Architecture Evolution / Platform Integration  
**Document Type:** Architecture Baseline  
**Parent Baseline:** ASA-ARCH-14.0（Traceability Layer）  
**Upstream:** ASA-ARCH-13.0 / ASA-ARCH-12.0 / ASA-ARCH-2.0  
**Registry Path:** `docs/baselines/ASA-ARCH-15.0.md`  
**Deliverable Alias:** `docs/architecture/asa_arch_15_trace_intelligence_layer.md`  
**Supersedes:** Review drafts v1–v8（non-normative）  
**Closeout:** ASA-IMPL-REQ-ARCH-CLOSEOUT-15.0-001  
**Successor:** ASA-ARCH-16.0  

---

## 1. Registration Declaration

本書は Auto Scribe AI の **正式な Architecture Baseline（Trace Intelligence Layer）** である。

* Trace Intelligence Layer の唯一の Architecture Baseline とする  
* Final v9 を規範版とし、レビュー草案 v1–v8 をすべて supersede する  
* 以降の Trace Intelligence 実装（Query / Graph / Checker / Facade）は本 Baseline を親とする  
* 将来の Architecture 変更は正式な Change Request（CR）経由のみ  
* 本登録は **Architecture Baseline のみ**を確立する。具象 API・実装詳細は IMPL-REQ で定義し、本 Architecture に適合すること  

---

## 2. Purpose

ASA-ARCH-14.0 で完成した Traceability Layer（Persistence / Store / Runtime / Consumer 統合）を基盤として、  
ASA を「保存するシステム」から「理解するプラットフォーム」へ進化させる。

Trace 情報の関係性・影響範囲・整合性を自動導出できる **Trace Intelligence Layer** を構築する。

---

## 3. Phase Architecture

```text
ASA-ARCH-12.0
Event Layer

↓

ASA-ARCH-13.0
Knowledge Layer
DEC / IMP / REV / DSEARCH

↓

ASA-ARCH-14.0
Traceability Layer
TRACE（abstract） / COMMIT / PR / ISSUE / RELEASE

↓

ASA-ARCH-15.0（本 Baseline）
Trace Intelligence Layer
Trace Query Layer
Trace Graph Engine
Trace Consistency Checker
Repository Facade API
```

---

## 4. Scope

| Item | Content |
|---|---|
| New layer | Trace Query Layer |
| Modules | Trace Graph Engine, Trace Consistency Checker, Repository Facade API |
| Coverage | Traceability Layer 全体（TRACE / COMMIT / PR / ISSUE / RELEASE） |
| Goals | Store 抽象化 ＋ 関係性の自動探索 ＋ 整合性検証 ＋ 統合アクセス |

---

## 5. Core Components

### 5.1 Trace Query Layer

```text
Query SHALL compose Store results.
Query SHALL NOT contain business workflow logic.
Query APIs SHALL return immutable domain records.
Query SHALL access persistence only through Repository Facade.
Store SHALL NOT depend on Query.
```

**Return contracts**

```text
Each Query API SHALL define its return contract explicitly:
- Single-object queries SHALL return a domain record or None.
- Multi-object queries SHALL return a list of domain records (possibly empty).
- Integrity errors SHALL propagate as exceptions.
- Repository or Store exceptions SHALL be wrapped and rethrown as Query-level exceptions.
```

* Store を直接操作せず、Query が抽象化を提供する  
* Query は Store 結果を組み合わせて関係性を導出する  
* Runtime は「知りたいこと」で問い合わせる  

**Illustrative examples（non-normative signatures）**

```python
trace_query.related_release(commit_id)
trace_query.related_issue(pr_id)
trace_query.latest_release(project_id)
trace_query.release_history(project_id)
```

### 5.2 Trace Graph Engine

```text
Graph SHALL access persistence only through Query Layer.
Graph SHALL be generated from Query results.
Graph SHALL NOT persist graph state.
Graph SHALL be reconstructed from Query results when invoked.
```

* DSEARCH と Graph モジュールを統合する方向性  
* ノード例: Decision → Commit → PR → Issue → Release  
* エッジ: RelationType（Phase14 / ASA-ARCH-14.0）  
* 機能: 関係性探索 / 影響範囲解析 / 可視化出力  

**Illustrative examples（non-normative）**

```python
graph.neighbors(entity_id)
graph.path(from_id, to_id)
graph.impact(entity_id)
```

### 5.3 Trace Consistency Checker

```text
Checker SHALL NOT modify repository state.
Checker SHALL detect inconsistencies and emit a Consistency Report.
Structural Rule findings SHALL be reported (not raised as Rule exceptions).
Exceptions are reserved for Input / Graph / Query failures.
Consistency Report SHALL follow:
{ "severity": "error", "type": "...", "entity": "...", "rule": "...", "message": "..." }
（IMPL-REQ MAY extend with entity_id for deterministic ordering.）
severity SHALL be "error" for ASA-IMPL-REQ-TRACE-CHECKER-001
（warning reserved for a future IMPL-REQ / CR）.
```

* 検査対象例: 孤立 PR / 循環参照 / 到達不能 Commit / 未 Release Issue / Decision 欠落  
* 実行: CI pipeline または定期検査  
* 出力: Integrity Report（JSON）；推奨として JSON ファイル ＋ stdout  
* 権限: 検出のみ。修復は行わない  
* 配置（実装）: `auto-scribe-ai/src/checker/trace_consistency_checker.py`  
* 規範 IMPL-REQ: ASA-IMPL-REQ-TRACE-CHECKER-001（Final v2 — Acceptance Revision）  
* 依存: Checker → Graph → Query → Facade → Store  
* Graph 境界での Query 失敗: `CheckerGraphError(cause=GraphQueryError(cause=QueryError))`  

### 5.4 Repository Facade API

```text
Facade SHALL abstract Store layer.
Facade SHALL dispatch requests to Store implementations.
Facade SHALL NOT compose cross-entity relationships.
Runtime SHALL NOT access Store directly.
Runtime SHALL access persistence through Query Layer.
Query SHALL access persistence only through Repository Facade.
The concrete Repository Facade API surface
SHALL be defined by the corresponding Implementation Request.
Architecture defines responsibilities, not concrete method signatures.
```

* 配置: Runtime → Query → Facade → Store  
* Facade は Store の入口であり、Query のような結合処理は行わない  
* CRUD / typed / dispatcher 等の API 形状は IMPL-REQ 側で定義  

**Illustrative examples（non-normative）**

```python
repository.query(...)
repository.create(...)
repository.update(...)
```

---

## 6. Dependency Rules

```text
Runtime
 ├─ Query
 ├─ Graph
 └─ Checker (optional)

Query
 ↓
Facade
 ↓
Store

Graph
 ↓
Query

Checker
 ↓
Query (read-only)
```

* Graph は Query を利用し、Query は Facade 経由で Store へアクセスする  
* Runtime は Query / Graph / Checker を利用するが、Store へ直接アクセスしない  

---

## 7. Naming Conventions

```text
related_*   → 関連取得
latest_*    → 最新取得
history_*   → 履歴取得
find_*      → 条件検索
```

---

## 8. Expected Outcomes

* Trace 情報を「保存」から「理解」へ進化  
* Runtime 複雑性の削減  
* Trace Graph による関係性解析  
* Consistency Checker による自動品質保証  
* Repository Facade による永続化抽象化  

---

## 9. Planned Deliverables（Implementation — not part of this registration）

| Item | Planned Path |
|---|---|
| Architecture Spec（本 Baseline） | `docs/baselines/ASA-ARCH-15.0.md` |
| Deliverable alias | `docs/architecture/asa_arch_15_trace_intelligence_layer.md` |
| Query Layer | `auto-scribe-ai/src/query/trace_query.py`（IMPL-REQ） |
| Graph Engine | `auto-scribe-ai/src/graph/trace_graph_engine.py`（IMPL-REQ） |
| Consistency Checker | `auto-scribe-ai/src/checker/trace_consistency_checker.py`（IMPL-REQ） |
| Repository Facade | `auto-scribe-ai/src/repository/repository_facade.py`（Formal Facade） |
| Tests | `tests/test_trace_*.py`, `tests/test_repository_facade*.py` |

---

## 10. Child Implementation Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 1 | **ASA-IMPL-REQ-TRACE-QUERY-001** | Issued — Implemented（Closed） |
| 2 | **ASA-IMPL-REQ-TRACE-GRAPH-001** | Issued — Implemented（Closed） |
| 3 | **ASA-IMPL-REQ-TRACE-CHECKER-001** | Issued — Implemented（Final v2 — Acceptance Revision） |
| 4 | **ASA-IMPL-REQ-REPOSITORY-FACADE-001** | Issued — Implemented（Final v3） |

Recommended implementation order: **Query → Graph → Checker → Facade**  
（Architecture § Next Steps — Formal Facade is now the sole Store access point）

---

## 11. Boundary Note

Trace Intelligence Layer:

* **Does** add query / graph / consistency / facade abstractions over Traceability persistence  
* **Does not** replace ASA-ARCH-14.0 Trace models or Store semantics  
* **Does not** define concrete method signatures（IMPL-REQ の責務）  
* **Does not** authorize Runtime → Store 直接アクセス  

---

## 12. Status

| Field | Value |
|---|---|
| Registration | **Registered — Architecture Baseline（ASA-ARCH-15.0）** |
| Spec version | **Final v9** |
| Drafts v1–v8 | Superseded |
| Architecture | **15.0 Final** |
| Implementation | **COMPLETE** |
| Verification | **COMPLETE** |
| Status | **CLOSED** |
| Successor | ASA-ARCH-16.0 |
| Git tag | `arch-15.0-final` |

---

## 13. Baseline Freeze

```text
Architecture 15.0 SHALL be immutable.
Future architectural modifications SHALL NOT be applied to Architecture 15.0.
Future architecture changes SHALL begin from Architecture 16.0.
```

* 本 Baseline は **凍結（Frozen）** された本番 Architecture 基準である  
* 規範内容の改訂・追記・削除は禁止する（誤記訂正を含む意味変更も不可）  
* 必要な進化は **ASA-ARCH-16.0** 以降の新 Baseline で行う  
* Closeout 規範: ASA-IMPL-REQ-ARCH-CLOSEOUT-15.0-001  

---

## 14. Completion（Final）

```text
Architecture : 15.0 Final
Implementation : COMPLETE
Verification : COMPLETE
Status : CLOSED
```

| Child | Result |
|---|---|
| Trace Query Layer | Closed |
| Trace Graph Engine | Closed |
| Trace Consistency Checker | Closed |
| Repository Facade | Closed |

Architecture Completion Review（2026-07-23）: **CLOSEABLE** — Architecture COMPLETE.

---

## 15. Governance

| Role | Rule |
|---|---|
| SoT（historical） | 本 Baseline は Trace Intelligence Layer の完了済み・凍結 SoT |
| Changes | **Prohibited on 15.0** — evolve via ASA-ARCH-16.0 + formal CR |
| Parent | ASA-ARCH-14.0 remains Traceability persistence SoT |
| Implementation | Existing Trace Intelligence implementations conform to this frozen Architecture |
