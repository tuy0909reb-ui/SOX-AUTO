# Specifications Index

Auto Scribe AI / Knowledge Memory の仕様索引。

## Architecture Baselines

| Baseline ID | Title | Status | Path |
|---|---|---|---|
| ASA-ARCH-2.0 | Event Layer Design Baseline（Detailed） | Design Baseline | `../baselines/ASA-ARCH-2.0.md` |
| ASA-ARCH-12.0 | Event Layer Architecture ID | Registered | `../baselines/ASA-ARCH-12.0.md` |
| ASA-ARCH-13.0 | Knowledge Memory Architecture | Ready for Implementation | `../baselines/ASA-ARCH-13.0.md` |
| **ASA-ARCH-14.0** | Traceability Layer Architecture | Ready for Implementation | `../baselines/ASA-ARCH-14.0.md` |
| **ASA-ARCH-15.0** | Trace Intelligence Layer Architecture | Registered — Architecture Baseline（Final v9） | `../baselines/ASA-ARCH-15.0.md` |

**Phase14 Traceability Flow（SoT）:** `DEC → ISSUE → COMMIT（≥1） → PR → RELEASE`（ASA-ARCH-14.0 §7.3 / ASA-CR-PR-002）  
**Phase15:** Query → Facade → Store；Graph / Checker → Query（ASA-ARCH-15.0）

## Phase12 — Event Layer Implementation Specs

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REC-1.1 | Record JSON Schema | Ready for Coding | `auto_scribe_ai_record_json_schema.md` |
| ASA-IMPL-API-1.0 | Runtime API Specification | Ready for Coding | `auto_scribe_ai_runtime_api_specification.md` |
| ASA-IMPL-STOR-1.0 | Storage Specification | Ready for Coding | `auto_scribe_ai_storage_specification.md` |
| ASA-IMPL-CAP-1.0 | Auto Capture Rule Specification | Ready for Coding | `auto_scribe_ai_auto_capture_rule_specification.md` |
| ASA-IMPL-SRCH-1.0 | Search Specification | Ready for Coding | `auto_scribe_ai_search_specification.md` |
| ASA-IMPL-EXP-1.0 | Export Specification | Ready for Coding | `auto_scribe_ai_export_specification.md` |

## Phase13 — Knowledge Layer Implementation Specs

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-DEC-1.0 | Decision Memory Specification | Registered — Ready for Coding | `auto_scribe_ai_decision_memory_specification.md` |
| ASA-IMPL-IMP-1.0 | Implementation Memory Specification | Registered — Ready for Coding | `auto_scribe_ai_implementation_memory_specification.md` |
| ASA-IMPL-REV-1.0 | Revert Memory Specification | Registered — Ready for Coding | `auto_scribe_ai_revert_memory_specification.md` |
| ASA-IMPL-DSEARCH-1.0 | Deep Search Specification | Registered — Ready for Coding | `auto_scribe_ai_deep_search_specification.md` |

## Phase14 — Traceability Layer Implementation Specs

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-TRACE-1.0 | Traceability Specification（Base Trace） | Registered — Ready for Coding | `auto_scribe_ai_traceability_specification.md` |
| **ASA-IMPL-COMMIT-1.0** | Commit Implementation Specification | Registered — Ready for Coding | `auto_scribe_ai_commit_implementation_specification.md` |
| **ASA-IMPL-PR-1.0** | Pull Request Implementation Specification | Registered — Implemented | `auto_scribe_ai_pr_implementation_specification.md` |
| **ASA-IMPL-ISSUE-1.0** | Issue Implementation Specification | Registered — Implemented | `auto_scribe_ai_issue_implementation_specification.md` |
| **ASA-IMPL-RELEASE-1.0** | Release Implementation Specification | Registered — Implemented | `auto_scribe_ai_release_implementation_specification.md` |

## Change Requests

| CR ID | Status | Path |
|---|---|---|
| ASA-CR-REC-001 | Applied | `asa_cr_rec_001.md` |
| ASA-CR-DEC-001 | Applied | `asa_cr_dec_001.md` |
| ASA-CR-IMP-002 | Applied | `../change_requests/asa_cr_imp_002.md` |
| ASA-CR-REV-001 | Applied | `../change_requests/asa_cr_rev_001.md` |
| ASA-CR-DSEARCH-001 | Applied | `../change_requests/asa_cr_dsearch_001.md` |
| ASA-CR-COMMIT-001 | Applied | `../change_requests/asa_cr_commit_001.md` |
| ASA-IMPL-REQ-COMMIT-001 | Issued — Implemented | `../change_requests/asa_impl_req_commit_001.md` |
| **ASA-CR-PR-001** | **Applied** | `../change_requests/asa_cr_pr_001.md` |
| **ASA-CR-PR-002** | **Applied** | `../change_requests/asa_cr_pr_002.md` |
| **ASA-CR-PR-STORE-001** | **Applied — Implemented / Verified** | `../change_requests/asa_cr_pr_store_001.md` |
| **ASA-CR-ISSUE-001** | **Applied** | `../change_requests/asa_cr_issue_001.md` |
| **ASA-IMPL-REQ-ISSUE-001** | **Issued — Implemented** | `../change_requests/asa_impl_req_issue_001.md` |
| **ASA-CR-REL-001** | **Applied** | `../change_requests/asa_cr_rel_001.md` |
| **ASA-CHK-REL-001** | **PASS**（re-check after ASA-CR-PR-002） | `../change_requests/asa_chk_rel_001.md` |
| **ASA-IMPL-REQ-RELEASE-001** | **Issued — Implemented** | `../change_requests/asa_impl_req_release_001.md` |
| **ASA-IMPL-REQ-TRACE-QUERY-001** | **Issued — Implemented** | `../change_requests/asa_impl_req_trace_query_001.md` |
| **ASA-IMPL-REQ-TRACE-GRAPH-001** | **Issued — Implemented** | `../change_requests/asa_impl_req_trace_graph_001.md` |
| **ASA-IMPL-REQ-TRACE-CHECKER-001** | **Issued — Implemented（Acceptance Revision）** | `../change_requests/asa_impl_req_trace_checker_001.md` |
