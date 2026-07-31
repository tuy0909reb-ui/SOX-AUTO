# Change Request — ASA-CR-DSEARCH-001

**CR ID:** ASA-CR-DSEARCH-001  
**Title:** Architecture Consistency Alignment（Deep Search）  
**Target:** ASA-IMPL-DSEARCH-1.0 — Deep Search Specification  
**Parent Architecture:** ASA-ARCH-13.0 — Knowledge Architecture  
**CR Type:** Consistency Change Request  
**Status:** Applied  

---

## Purpose

ASA-IMPL-DSEARCH-1.0（草案）と ASA-ARCH-13.0 の DecisionStatus / DSEARCH 名称の不整合を解消する。  
Architecture Baseline を Source of Truth とし、Deep Search 実装仕様を完全準拠させる。

---

## Inconsistencies Found

| Item | Draft | ASA-ARCH-13.0 |
|---|---|---|
| `filters.decision_status` | `Active`, **Deprecated**, **Replaced** | DecisionStatus: Proposed / Active / **Superseded** / Reverted / Archived |
| Spec title / glossary | Deep Search | Decision Search (DSEARCH) |

---

## Changes Applied

### 1. DecisionStatus Alignment（Input Schema / Validation Matrix）

| Before（Draft） | After（ASA-ARCH-13.0） |
|---|---|
| Deprecated | （削除） |
| Replaced | （削除） |
| — | Proposed / Active / Superseded / Reverted / Archived |

`decision_status` filter values MUST be DecisionStatus enum only.

### 2. Naming Alignment（ASA-ARCH-13.0 §11 + Glossary）

| Before | After |
|---|---|
| Decision Search (DSEARCH) | **Deep Search (DSEARCH)** — DEC / IMP / REV 横断検索 |
| Decision Search Specification（Pending） | Deep Search Specification → Registered |

「Decision Search」は歴史的別名として残してよいが、正式タイトルは **Deep Search** とする。

### 3. RelationType / ImplementationStatus

草案は ASA-ARCH-13.0 の RelationType / ImplementationStatus を参照しており、追加修正不要。

---

## Updated Documents

* `docs/baselines/ASA-ARCH-13.0.md`
* `docs/specs/auto_scribe_ai_deep_search_specification.md`
* `docs/change_requests/asa_cr_dsearch_001.md`（本ファイル）

---

## Result

```text
CR Status: Applied
Implementation Specification is now fully consistent
with Architecture Baseline (ASA-ARCH-13.0).
Ready for: ASA-IMPL-REQ-DSEARCH-001
```
