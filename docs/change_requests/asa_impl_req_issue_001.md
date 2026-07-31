# ASA-IMPL-REQ-ISSUE-001 — Implementation Request: Issue Trace

**Request ID:** ASA-IMPL-REQ-ISSUE-001  
**Request Type:** Implementation Request（IMPL-REQ）  
**Status:** Issued — Implemented  
**Target Specification:** ASA-IMPL-ISSUE-1.0 — Issue Implementation Specification  
**Parent Architecture:** ASA-ARCH-14.0 — Traceability Layer  
**Derived From:** ASA-IMPL-TRACE-1.0  
**Depends On:** ASA-IMPL-COMMIT-1.0, ASA-IMPL-PR-1.0  
**CR Applied:** ASA-CR-ISSUE-001  

---

## Objective

Implement the ISSUE derived Trace model (`ISSUE-[0-9]{5}`) in accordance with ASA-IMPL-ISSUE-1.0.

---

## Scope of Work

* Base Trace abstraction inheritance（TRACE not persisted）
* ISSUE Schema / Model / Store / Repository
* Runtime registration（`event_type = "Issue"` Trace path）
* Status transition via new ISSUE + `supersedes`
* DSEARCH + Trace Graph integration
* Validation + tests
* Update ASA-IMPL-ISSUE-1.0 implementation checklist

---

## Constraints

* TRACE SHALL NOT be instantiated or persisted
* ISSUE SHALL NOT modify DEC / IMP / REV / COMMIT / PR models
* Append-only / immutable（status change → new ISSUE + supersedes）
* Conform to ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-IMPL-ISSUE-1.0 / ASA-CR-ISSUE-001
* No new RelationTypes；ISSUE→PR uses `related_to`（not `merges`）

---

## Next After Completion

ASA-IMPL-RELEASE-1.0 — Release Implementation Specification
