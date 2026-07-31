# Architecture Baseline – ASA-ARCH-14.0

**Baseline ID:** ASA-ARCH-14.0  
**Title:** Traceability Layer Architecture  
**Version:** 1.0  
**Status:** Registered — Ready for Implementation  
**Category:** Traceability Layer  
**Document Type:** Architecture Baseline  
**Parent Baseline:** ASA-ARCH-13.0（Knowledge Layer）  
**Upstream:** ASA-ARCH-12.0 / ASA-ARCH-2.0（Event Layer）  
**Registry Path:** `docs/baselines/ASA-ARCH-14.0.md`

---

## 1. Registration Declaration

本書は Auto Scribe AI の **正式な Architecture Baseline（Traceability Layer）** である。

- Traceability Layer の唯一の Architecture Baseline とする
- 以降の Trace 実装仕様（ASA-IMPL-TRACE / COMMIT / PR / ISSUE / RELEASE 等）は本 Baseline を親とする
- Knowledge Layer（ASA-ARCH-13.0）および Event Layer（ASA-ARCH-12.0）と後方互換を維持する
- Trace 本体は外部 VCS / CI の可用性に依存しないローカル永続化を許容する（接続は任意）

---

## 2. Phase Architecture

```text
ASA-ARCH-12.0
Event Layer
Project / Session / Record / Search / Export

↓

ASA-ARCH-13.0
Knowledge Layer
DEC / IMP / REV / DSEARCH
Relation Layer（RecordRef）

↓

ASA-ARCH-14.0
Traceability Layer
TRACE（abstract） / COMMIT / PR / ISSUE / RELEASE
Trace ↔ Knowledge 連携

↓

ASA-ARCH-15.0
Trace Intelligence Layer
Query / Graph / Checker / Facade
```

---

## 3. Architecture Scope

| Domain | Responsibility |
|---|---|
| **Base Trace (TRACE)** | 抽象基底。共通契約・メタデータ・振る舞い。**直接インスタンス化禁止** |
| **Commit Trace (COMMIT)** | Git Commit 等のコミット証跡 |
| **Pull Request Trace (PR)** | PR / MR 証跡 |
| **Issue Trace (ISSUE)** | Issue / Ticket 証跡（Trace Layer） |
| **Release Trace (RELEASE)** | Release / Tag 証跡 |
| **TraceSourceType** | Trace 起源カテゴリ（Architecture SoT） |
| **Trace ↔ Knowledge** | RecordRef / RelationType による DEC・IMP・REV 連携 |

---

## 4. Trace Principles（TTP）

```text
TTP-001  TRACE is an abstract base model and MUST NOT be instantiated or persisted directly.
TTP-002  Persistence belongs exclusively to derived Trace models.
TTP-003  Trace records MUST be append-only.
TTP-004  Trace records MUST be immutable after creation (updates → new record + relation).
TTP-005  Trace records SHOULD link to Knowledge (DEC / IMP / REV) via RecordRef when applicable.
TTP-006  Relations MUST use the shared Relation Layer (ASA-ARCH-12.x / ASA-ARCH-13.0).
TTP-007  Trace Layer MUST remain backward compatible with Event and Knowledge Layers.
TTP-008  Trace Layer MUST NOT require GitHub/GitLab availability for core persistence.
TTP-009  Duplicate prevention MUST be enforced per derived model identity keys.
TTP-010  DSEARCH MUST be able to search Trace-derived records via the Trace abstraction.
TTP-011  Future derived models (BUILD / DEPLOY / PIPELINE / WORKFLOW) MUST extend Base Trace
         without modifying Base Trace contracts.
```

---

## 5. Base Trace vs Derived Models

### 5.1 Base Trace（Abstract）

Provides only:

* shared identity / timestamp / actor / source contracts  
* Generic Trace Repository interface  
* Generic Trace Store interface  
* common validation hooks  
* DSEARCH / Graph projection contract  

SHALL NOT:

* write files  
* allocate concrete `record_id` prefixes for “TRACE” as a stored type  
* be accepted by Runtime as a creatable `event_type=Trace` persistence target  

### 5.2 Derived Models（Initial）

| Model | Spec（planned / child） | Role |
|---|---|---|
| COMMIT | ASA-IMPL-COMMIT-1.0 | Commit evidence |
| PR | ASA-IMPL-PR-1.0 | Pull/Merge Request evidence |
| ISSUE | ASA-IMPL-ISSUE-1.0 | Issue/Ticket evidence |
| RELEASE | ASA-IMPL-RELEASE-1.0 | Release/Tag evidence |

Future（non-breaking extensions）: BUILD / DEPLOY / PIPELINE / WORKFLOW …

---

## 6. RecordRef Extension

ASA-ARCH-13.0 RecordRef を拡張する（既存値は破壊しない）：

```text
DEC | IMP | REV | ADR | ISSUE | TODO | EXT
| COMMIT | PR | RELEASE
| BUILD | DEPLOY | PIPELINE | WORKFLOW   （future）
```

Notes:

* `ISSUE` は Knowledge / Event 空間の RecordRef 型としても既存。Trace Issue は **Trace Layer の派生モデル**として同一 `record_type=ISSUE` を用い、`record_id` 体系と永続パスで区別する（詳細は ASA-IMPL-ISSUE-1.0）。
* Compact Form（`target_ref`）は同一空間内で許可（ASA-ARCH-13.0 §6.2 と同じ）。

---

## 7. TraceSourceType（Architecture SoT）

```text
GitHub
GitLab
Bitbucket
LocalGit
CI
Manual
External
```

* ActorType は **ASA-ARCH-13.0** を再利用する（Human / AI / System）
* Phase12 / Knowledge の SourceType と並存する。Trace 記録の `source` は TraceSourceType を用いる

---

## 7.1 TraceIssueSeverity / TraceIssueStatus（ASA-CR-ISSUE-001）

Issue Trace の状態空間（Architecture SoT）。

### TraceIssueSeverity

```text
Critical
High
Medium
Low
```

### TraceIssueStatus

```text
Open
InProgress
Resolved
Closed
```

Status 変更は記録の上書きではなく、新 ISSUE + `supersedes` で表現する（TTP-003 / TTP-004）。

---

## 7.2 ReleaseStatus（ASA-CR-REL-001）

Release Trace の状態空間（Architecture SoT）。

### ReleaseStatus

```text
Planned
Released
Deprecated
```

Status 変更は記録の上書きではなく、新 RELEASE + `supersedes` で表現する（TTP-003 / TTP-004）。詳細は ASA-IMPL-RELEASE-1.0。

---

## 7.3 Traceability Flow（Architecture SoT / ASA-CR-PR-002）

Traceability Layer の端到端フローは次の一意定義に従う。  
派生実装仕様（COMMIT / PR / ISSUE / RELEASE）および Navigation 文書は本フローと矛盾してはならない。

```text
DEC
 ↓
ISSUE
 ↓
COMMIT（one or more）
 ↓
PR
 ↓
RELEASE
```

* DEC は Knowledge Layer（ASA-ARCH-13.0）  
* ISSUE / COMMIT / PR / RELEASE は Trace 派生モデル（本 Baseline）  
* PR は 1 件以上の COMMIT を束ね、実装証跡を RELEASE へつなぐ  
* 個別エッジの RelationType は §8 に従う  

---

## 8. RelationType

Knowledge RelationType（ASA-ARCH-13.0）を再利用する：

```text
implements
supersedes
reverts
related_to
derived_from
```

Trace Layer 拡張（ASA-CR-PR-001）：

```text
merges
```

* `implements` : IMP → DEC  
* `supersedes` : 同種記録の更新連鎖（DEC / IMP / REV / COMMIT / PR / ISSUE 等）  
* `reverts` : REV → DEC and/or REV → IMP（ASA-CR-REV-001）  
* `related_to` : 一般関連（ISSUE → COMMIT / ISSUE → PR を含む）  
* `derived_from` : 派生元参照（COMMIT → ISSUE 等）  
* `merges` : **PR → COMMIT**（merge commit / included commits）— ISSUE→PR には用いない  

Typical Trace edges:

* COMMIT / PR `related_to` または `derived_from` → IMP / DEC / REV  
* PR `merges` → COMMIT（merge_ref / related_commits）  
* ISSUE `related_to` → COMMIT / PR；COMMIT `derived_from` → ISSUE  
* ISSUE status update → 新 ISSUE + `supersedes`  
* RELEASE `related_to` → COMMIT / PR  

これ以外の RelationType 追加は Architecture CR 経由のみ。

---

## 9. Storage / Project Scope

```text
/data/projects/{project_id}/records/{DERIVED}-{xxxxx}.json
```

* Project-scoped numbering  
* UTF-8 JSON  
* Append-only  
* Base TRACE 用の永続ファイルは存在しない  

---

## 10. Runtime / Search / Graph

* Runtime は派生モデル作成時のみ Trace を生成する（重複禁止キーは派生仕様で定義）
* DSEARCH（ASA-IMPL-DSEARCH-1.0）は Trace 抽象経由で派生レコードを検索対象に含められること（TTP-010）
* Graph API は Trace ↔ Knowledge の edges を表現できること
* `/search/query`（Phase12）の意味は変更しない

---

## 11. Child Implementation Specifications

| Spec ID | Title | Status |
|---|---|---|
| **ASA-IMPL-TRACE-1.0** | Traceability Specification（Base Trace Layer） | Ready for Coding → `docs/specs/auto_scribe_ai_traceability_specification.md` |
| **ASA-IMPL-COMMIT-1.0** | Commit Implementation Specification | Ready for Coding → `docs/specs/auto_scribe_ai_commit_implementation_specification.md` |
| **ASA-IMPL-PR-1.0** | Pull Request Implementation Specification | Implemented → `docs/specs/auto_scribe_ai_pr_implementation_specification.md` |
| **ASA-IMPL-ISSUE-1.0** | Issue Implementation Specification | Implemented → `docs/specs/auto_scribe_ai_issue_implementation_specification.md` |
| **ASA-IMPL-RELEASE-1.0** | Release Implementation Specification | Implemented → `docs/specs/auto_scribe_ai_release_implementation_specification.md` |

Parent Baseline for all of the above: **ASA-ARCH-14.0**

**Successor Architecture:** **ASA-ARCH-15.0**（Trace Intelligence Layer）— Query / Graph / Checker / Facade

---

## 12. Boundary Note

Traceability Layer:

* Records external/process evidence as append-only Trace-derived knowledge  
* Does **not** replace Knowledge Memory（DEC / IMP / REV）  
* Does **not** replace Event Layer records  
* Does **not** require live GitHub for core storage（TTP-008）  
* Does **not** instantiate Base TRACE  

---

## 13. Status

```text
Registered — Ready for Implementation

ASA-ARCH-14.0 is the Traceability Layer Architecture Baseline.
TRACE abstraction and derived model tree are defined.
Child Trace Intelligence Architecture: ASA-ARCH-15.0.
```

---

# Registration

| Item | Value |
|---|---|
| Architecture ID | ASA-ARCH-14.0 |
| Title | Traceability Layer Architecture |
| Version | 1.0 |
| Parent Baseline | ASA-ARCH-13.0 |
| Status | Registered — Ready for Implementation |
| Governance | Parent of TRACE / COMMIT / PR / ISSUE / RELEASE specs |
