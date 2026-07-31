# ASA-IMPL-REQ-TRACE-CHECKER-001 — Trace Consistency Checker Implementation Request

**Request ID:** ASA-IMPL-REQ-TRACE-CHECKER-001  
**Version:** Final v2（Acceptance Revision）  
**Status:** Issued — Implemented  
**Classification:** Implementation Request / Trace Intelligence Layer Phase 15.0  
**Parent Architecture:** ASA-ARCH-15.0（Final v9）  
**Depends On:** ASA-IMPL-REQ-TRACE-QUERY-001（Closed）, ASA-IMPL-REQ-TRACE-GRAPH-001（Closed）  

---

## Purpose

Query Layer と Graph Engine の出力整合性を検証し、Trace Intelligence Layer の一貫性を保証する。  
Consistency Checker は監査コンポーネントであり、検出のみ行い Repository を変更しない。

---

## Implementation Contracts

### ① Consistency Rule Set（Report — not Exception）

Checker SHALL verify and **report**（not raise）the following structural findings:

* Each GraphNode corresponds to a valid Query record  
* Each GraphEdge represents a valid Query relation  
* Cross-project edges  
* Missing Query records referenced by Graph  
* Duplicate nodes or edges  

```text
Duplicate nodes  → composite key (id, project_id)
Duplicate edges  → composite key (source_id, target_id, relation_type)
Same id + different project_id SHALL NOT be treated as a duplicate node.
```

Structural findings SHALL appear in `report_inconsistency()` with:

* `type`: `integrity` | `validation`  
* `severity`: `error`（only; `warning` is out of scope for this IMPL-REQ）  

### ② Exception Contract（Input / Graph / Query only）

```text
Input Error        → CheckerValidationError
Cross-project API binding / Query-index foreign project record → CheckerIntegrityError
Graph Failure      → CheckerGraphError(cause=GraphError)
Query Failure（Checker が Query を直接呼び出した評価経路）→ CheckerQueryError(cause=QueryError)
```

Graph 境界:

```text
When Graph raises GraphQueryError（Query failure inside Graph）:
  CheckerGraphError
    cause = GraphQueryError
      cause = QueryError
```

Checker SHALL treat Graph as its persistence-facing boundary for snapshot load.  
Structural Rule violations SHALL NOT raise typed Rule exceptions.

### ③ Checker API

* `validate_trace() → bool`  
* `report_inconsistency() → list`  
* `reset_evaluation()` — clear cached evaluation（next API call re-evaluates）  

```text
validate_trace() returns True  iff the current evaluation has zero findings.
validate_trace() returns False iff the current evaluation has one or more findings.
```

**Single-evaluation guarantee**

```text
One evaluation result SHALL back both validate_trace() and report_inconsistency()
until reset_evaluation()（or a new Checker instance）.

Therefore:
  validate_trace() is True  ⇔  report_inconsistency() == []
  validate_trace() is False ⇔  len(report_inconsistency()) >= 1
```

### ④ Report Schema

```json
{
  "severity": "error",
  "type": "validation | integrity",
  "entity": "node | edge",
  "entity_id": "stable identifier for sorting",
  "rule": "rule_name",
  "message": "description of violation"
}
```

Sort: Severity（error only）→ Rule → Entity ID（`entity_id` field）.

Aligns with ASA-ARCH-15.0 Consistency Report schema（extended with `rule` / `entity_id` by this IMPL-REQ）.

### ⑤ Return Contract

| API | Success | No Match | Error |
|---|---|---|---|
| `validate_trace()` | Bool | False | Exception（Input/Graph/Query only） |
| `report_inconsistency()` | List | [] | Exception（Input/Graph/Query only） |

---

## Deliverables（auto-scribe-ai）

| Kind | Path |
|---|---|
| Implementation Spec | `impl/trace_checker_spec.md` |
| Source | `src/checker/trace_consistency_checker.py` |
| Unit Tests | `tests/test_trace_checker.py` |
| Integration Tests | `tests/test_trace_checker_integration.py` |

---

## Status

```text
Issued — Implemented（Acceptance Revision）
Verification: unit + integration tests
```
