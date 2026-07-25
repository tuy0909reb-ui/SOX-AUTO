# Architecture Baselines

Auto Scribe AI / Framework Architecture Baseline の索引。

| Baseline ID | Version | Status | Spec / Registry Path |
|---|---|---|---|
| ASA-ARCH-1.3 | 1.3 | Superseded | `docs/baselines/ASA-ARCH-1.3.md`（履歴） |
| **ASA-ARCH-2.0** | **2.0** | **Event Layer Design Baseline（Detailed）** | `docs/specs/auto_scribe_ai_architecture_phase12.md` |
| **ASA-ARCH-12.0** | **1.0** | **Event Layer Architecture ID** | `docs/baselines/ASA-ARCH-12.0.md`（≡ ASA-ARCH-2.0） |
| **ASA-ARCH-13.0** | **1.0** | **Knowledge Layer** | `docs/baselines/ASA-ARCH-13.0.md` |
| **ASA-ARCH-14.0** | **1.0** | **Traceability Layer** | `docs/baselines/ASA-ARCH-14.0.md` |
| **ASA-ARCH-15.0** | **Final v9** | **CLOSED — Trace Intelligence Layer（Frozen）** | `docs/baselines/ASA-ARCH-15.0.md` |
| **ASA-ARCH-16.0** | **Final 1.0** | **CLOSED — Decision→Recommendation（Frozen）** | `docs/baselines/ASA-ARCH-16.0.md` |
| **ASA-ARCH-17.0** | **Baseline 17.9** | **Open — Phase 17.1–17.9 Frozen** | `docs/baselines/ASA-ARCH-17.0.md` |
| **ASA-ARCH-18.0** | **Baseline 18.4** | **Open — Phase 18.0–18.4 Frozen** | `docs/baselines/ASA-ARCH-18.0.md` |

## Layer Stack

```text
ASA-ARCH-12.0 / ASA-ARCH-2.0  → Event Layer
ASA-ARCH-13.0                 → Knowledge Layer
ASA-ARCH-14.0                 → Traceability Layer
ASA-ARCH-15.0                 → Trace Intelligence Layer（CLOSED / Frozen）
ASA-ARCH-16.0                 → Decision / Audit / Reasoning / Recommendation（CLOSED / Frozen）
ASA-ARCH-17.0                 → Presentation / Rendering / NL / Integration / Distribution / Feedback / Reflection / Evolution / Synthesis（Phase 17.1–17.9 Frozen）
ASA-ARCH-18.0                 → Meta-Architecture / Convergence / Orchestration / Lifecycle / Governance Runtime / System Governance Integration（Phase 18.0–18.4 Frozen）
```

Current Event Layer SoT（detailed）: **ASA-ARCH-2.0**  
Current Event Layer Architecture ID: **ASA-ARCH-12.0**  
Current Knowledge Layer SoT: **ASA-ARCH-13.0**  
Current Traceability Layer SoT: **ASA-ARCH-14.0**  
Trace Intelligence Layer SoT（production / frozen）: **ASA-ARCH-15.0**  
Decision→Recommendation SoT（production / frozen）: **ASA-ARCH-16.0**  
Presentation Core SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.1**  
Rendering SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.2**  
Natural Language SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.3**  
Integration SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.4**  
Distribution SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.5**  
Feedback SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.6**  
Reflection SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.7**  
Evolution SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.8**  
Synthesis SoT（production / frozen）: **ASA-ARCH-17.0 Phase 17.9**  
Convergence SoT（production / frozen）: **ASA-ARCH-18.0 Phase 18.0**  
Orchestration SoT（production / frozen）: **ASA-ARCH-18.0 Phase 18.1**  
Lifecycle SoT（production / frozen）: **ASA-ARCH-18.0 Phase 18.2**  
Governance Runtime SoT（production / frozen）: **ASA-ARCH-18.0 Phase 18.3**  
System Governance Integration SoT（production / frozen）: **ASA-ARCH-18.0 Phase 18.4**

## Architecture Status

| Architecture | Status |
|---|---|
| ARCH-15.x | Frozen |
| ARCH-16.x | Frozen |
| ARCH-17.0 Phase 17.1 | Frozen |
| ARCH-17.0 Phase 17.2 | Frozen |
| ARCH-17.0 Phase 17.3 | Frozen |
| ARCH-17.0 Phase 17.4 | Frozen |
| ARCH-17.0 Phase 17.5 | Frozen |
| ARCH-17.0 Phase 17.6 | Frozen |
| ARCH-17.0 Phase 17.7 | Frozen |
| ARCH-17.0 Phase 17.8 | Frozen |
| ARCH-17.0 Phase 17.9 | Frozen |
| ARCH-18.0 Phase 18.0 | Frozen |
| ARCH-18.0 Phase 18.1 | Frozen |
| ARCH-18.0 Phase 18.2 | Frozen |
| ARCH-18.0 Phase 18.3 | Frozen |
| ARCH-18.0 Phase 18.4 | Frozen |

## Child Implementation Specs（ASA-ARCH-2.0 / ASA-ARCH-12.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| **ASA-IMPL-REC-1.1** | Record JSON Schema | Ready for Coding | `docs/specs/auto_scribe_ai_record_json_schema.md` |
| **ASA-IMPL-API-1.0** | Runtime API Specification | Ready for Coding | `docs/specs/auto_scribe_ai_runtime_api_specification.md` |
| **ASA-IMPL-STOR-1.0** | Storage Specification | Ready for Coding | `docs/specs/auto_scribe_ai_storage_specification.md` |
| **ASA-IMPL-CAP-1.0** | Auto Capture Rule Specification | Ready for Coding | `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` |
| **ASA-IMPL-SRCH-1.0** | Search Specification | Ready for Coding | `docs/specs/auto_scribe_ai_search_specification.md` |
| **ASA-IMPL-EXP-1.0** | Export Specification | Ready for Coding | `docs/specs/auto_scribe_ai_export_specification.md` |

## Child Implementation Specs（ASA-ARCH-13.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| **ASA-IMPL-DEC-1.0** | Decision Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_decision_memory_specification.md` |
| **ASA-IMPL-IMP-1.0** | Implementation Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_implementation_memory_specification.md` |
| **ASA-IMPL-REV-1.0** | Revert Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_revert_memory_specification.md` |
| **ASA-IMPL-DSEARCH-1.0** | Deep Search Specification | Ready for Coding | `docs/specs/auto_scribe_ai_deep_search_specification.md` |

## Child Implementation Specs（ASA-ARCH-14.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| **ASA-IMPL-TRACE-1.0** | Traceability Specification（Base Trace） | Ready for Coding | `docs/specs/auto_scribe_ai_traceability_specification.md` |
| **ASA-IMPL-COMMIT-1.0** | Commit Implementation Specification | Ready for Coding | `docs/specs/auto_scribe_ai_commit_implementation_specification.md` |
| **ASA-IMPL-PR-1.0** | Pull Request Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_pr_implementation_specification.md` |
| **ASA-IMPL-ISSUE-1.0** | Issue Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_issue_implementation_specification.md` |
| **ASA-IMPL-RELEASE-1.0** | Release Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_release_implementation_specification.md` |

## Child Implementation Specs（ASA-ARCH-15.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REQ-TRACE-QUERY-001 | Trace Query Layer Implementation Request | Issued — Implemented | `docs/change_requests/asa_impl_req_trace_query_001.md` / `auto-scribe-ai/impl/trace_query_spec.md` |
| ASA-IMPL-REQ-TRACE-GRAPH-001 | Trace Graph Engine Implementation Request | Issued — Implemented | `docs/change_requests/asa_impl_req_trace_graph_001.md` / `auto-scribe-ai/impl/trace_graph_spec.md` |
| ASA-IMPL-REQ-TRACE-CHECKER-001 | Trace Consistency Checker Implementation Request | Issued — Implemented（Acceptance Revision） | `docs/change_requests/asa_impl_req_trace_checker_001.md` / `auto-scribe-ai/impl/trace_checker_spec.md` |
| ASA-IMPL-REQ-REPOSITORY-FACADE-001 | Repository Facade Implementation Request | Issued — Implemented（Final v3） | `docs/change_requests/asa_impl_req_repository_facade_001.md` / `auto-scribe-ai/impl/repository_facade_spec.md` |
| ASA-IMPL-REQ-ARCH-CLOSEOUT-15.0-001 | Architecture 15.0 Closeout & Baseline Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-15.0-final` |

## Child Implementation Specs（ASA-ARCH-16.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REQ-DECISION-ENGINE-001 | Decision Engine Implementation Request | Issued — Implemented（Final v2） | `docs/change_requests/asa_impl_req_decision_engine_001.md` / `auto-scribe-ai/impl/decision_engine_spec.md` |
| ASA-IMPL-REQ-AUDIT-LAYER-001 | Audit Layer Implementation Request | Issued — Implemented（Final v1） | `docs/change_requests/asa_impl_req_audit_layer_001.md` / `auto-scribe-ai/impl/audit_layer_spec.md` |
| ASA-IMPL-REQ-TRACE-REASONING-001 | Trace Reasoning Implementation Request | Issued — Implemented（Final v1） | `docs/change_requests/asa_impl_req_trace_reasoning_001.md` / `auto-scribe-ai/impl/trace_reasoning_spec.md` |
| ASA-IMPL-REQ-RECOMMENDATION-001 | Recommendation Engine Implementation Request | Issued — Implemented（Final v1） | `docs/change_requests/asa_impl_req_recommendation_001.md` / `auto-scribe-ai/impl/recommendation_spec.md` |
| ASA-IMPL-REQ-ARCH-CLOSEOUT-16.0-001 | Architecture 16.0 Closeout & Baseline Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-16.0-final` |

## Child Implementation Specs（ASA-ARCH-17.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REQ-PRESENTATION-001 | Presentation Core Implementation Request | Issued — Implemented（Final v2.2） / Phase 17.1 Frozen | `auto-scribe-ai/impl/presentation_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.1-001 | Architecture 17.1 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.1-freeze` |
| ASA-IMPL-REQ-RENDERING-001 | Rendering Implementation Request | Issued — Implemented（Final v1） / Phase 17.2 Frozen | `auto-scribe-ai/impl/rendering_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.2-001 | Architecture 17.2 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.2-freeze` |
| ASA-IMPL-REQ-NATURAL-LANGUAGE-001 | Natural Language Implementation Request | Issued — Implemented（Final v1.3） / Phase 17.3 Frozen | `auto-scribe-ai/impl/natural_language_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.3-001 | Architecture 17.3 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.3-freeze` |
| ASA-IMPL-REQ-INTEGRATION-001 | Integration Implementation Request | Issued — Implemented（Final v1.2） / Phase 17.4 Frozen | `auto-scribe-ai/impl/integration_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.4-001 | Architecture 17.4 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.4-freeze` |
| ASA-IMPL-REQ-DISTRIBUTION-001 | Distribution Implementation Request | Issued — Implemented（Final v1.2） / Phase 17.5 Frozen | `auto-scribe-ai/impl/distribution_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.5-001 | Architecture 17.5 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.5-freeze` |
| ASA-IMPL-REQ-FEEDBACK-001 | Feedback Implementation Request | Issued — Implemented（Final v1.1） / Phase 17.6 Frozen | `auto-scribe-ai/impl/feedback_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.6-001 | Architecture 17.6 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.6-freeze` |
| ASA-IMPL-REQ-REFLECTION-001 | Reflection Implementation Request | Issued — Implemented（Final v1.1） / Phase 17.7 Frozen | `auto-scribe-ai/impl/reflection_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.7-001 | Architecture 17.7 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.7-freeze` |
| ASA-IMPL-REQ-EVOLUTION-001 | Evolution Implementation Request | Issued — Implemented（Final v1.1） / Phase 17.8 Frozen | `auto-scribe-ai/impl/evolution_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.8-001 | Architecture 17.8 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.8-freeze` |
| ASA-IMPL-REQ-SYNTHESIS-001 | Synthesis Implementation Request | Issued — Implemented（Final v1.1） / Phase 17.9 Frozen | `auto-scribe-ai/impl/synthesis_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-17.9-001 | Architecture 17.9 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-17.9-freeze` |

## Child Implementation Specs（ASA-ARCH-18.0）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REQ-CONVERGENCE-001 | Convergence / Meta-Architecture Implementation Request | Issued — Implemented（Final v1.1） / Phase 18.0 Frozen | `auto-scribe-ai/impl/convergence_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-18.0-001 | Architecture 18.0 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-18.0-freeze` |
| ASA-IMPL-REQ-ORCHESTRATION-001 | Runtime Orchestration Implementation Request | Issued — Implemented（Final v1.1） / Phase 18.1 Frozen | `auto-scribe-ai/impl/orchestration_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-18.1-001 | Architecture 18.1 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-18.1-freeze` |
| ASA-IMPL-REQ-LIFECYCLE-001 | Lifecycle Control Implementation Request | Issued — Implemented（Final v1.0） / Phase 18.2 Frozen | `auto-scribe-ai/impl/lifecycle_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-18.2-001 | Architecture 18.2 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-18.2-freeze` |
| ASA-IMPL-REQ-GOVERNANCE-RUNTIME-001 | Governance Runtime Implementation Request | Issued — Implemented（Draft 0.1） / Phase 18.3 Frozen | `auto-scribe-ai/impl/governance_runtime_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-18.3-001 | Architecture 18.3 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-18.3-freeze` |
| ASA-IMPL-REQ-SYSTEM-GOVERNANCE-INTEGRATION-001 | System Governance Integration Implementation Request | Issued — Implemented（Draft 0.2） / Phase 18.4 Frozen | `auto-scribe-ai/impl/system_governance_integration_spec.md` |
| ASA-IMPL-REQ-ARCH-FREEZE-18.4-001 | Architecture 18.4 Freeze | Issued — Implemented | `CHANGELOG.md` / tag `arch-18.4-freeze` |
