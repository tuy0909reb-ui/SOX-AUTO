# Change Request — ASA-CR-PR-STORE-001

**CR ID:** ASA-CR-PR-STORE-001  
**Title:** Trace Layer 永続化統一 — PR Store 追加実装  
**Target:** ASA-ARCH-14.0 / ASA-IMPL-PR-1.0  
**Classification:** リファクタリング（構造統一）  
**Status:** Applied — Implemented / **Verified**  

---

## Purpose

PR のみ欠落していた Store 層を追加し、TRACE / COMMIT / PR / ISSUE / RELEASE の永続化構造を統一する。  
Architecture 14.0 の設計・モデル・データ構造は変更しない。

---

## Verification Status

```text
Implementation : COMPLETE
Verification   : COMPLETE
```

Verification tests（`tests/test_pr_store.py`）:

* `test_latest_pr_raises_on_supersedes_loop` — `latest_pr()` public API cycle → `PrStoreIntegrityError`
* `test_latest_pr_isolated_and_multiple_terminals` — multiple terminals → `PrStoreIntegrityError`
* `test_find_by_commit_full_priority_order` — Merged→Open→Superseded + newest-first within group
* `test_newest_first_record_id_tiebreak` — equal `created_at` → `record_id` tiebreak

---

## Deliverables

* `storage/pr_store.py`（+ `models/pr.py` / `schemas/pr_schema.json`）  
* Store APIs: create_pr / load_pr / latest_pr / find_by_* / list_pr  
* Helpers: is_merged / contains_commit  
* ISSUE / RELEASE / DSEARCH / Graph consumers → pr_store only  
* Direct `PR-*.json` filesystem traversal removed  
* Tests: `tests/test_pr_store.py` + RELEASE/ISSUE integration updates  

---

## Design Rules（Summary）

* Store: persistence integrity only（schema / id uniqueness / supersedes integrity）  
* Runtime: workflow / business validation  
* Derived PRStatus for queries: Open / Merged / Superseded（merge_ref + supersedes tip）  
* COMMIT inclusion（RELEASE）: merged PR ∧ `contains_commit(pr, c)` on `related_commits`  

---

## Result

```text
CR Status: Applied — Implemented
Persistence layer: TRACE / COMMIT / PR / ISSUE / RELEASE（5 Store）
```
