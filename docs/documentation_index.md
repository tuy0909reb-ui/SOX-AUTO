# Documentation Index（全文書索引）

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework / Documentation Navigation / Governance / Traceability

---

## 1. Purpose

本書は、AI編集秘書 Framework に含まれる **全公式文書の索引（Index）** を提供する。

目的：

- 文書探索性の向上
- Category / Phase / Owner / Status の一望
- Documentation Architecture の俯瞰
- Traceability の強化
- Governance / Operations / ADR への参照統一

---

## 2. Index Structure

各文書は以下の属性を持つ：

- Path
- Title
- Category
- Phase
- Owner
- Status
- Primary SoT
- Related Documents

---

## 3. Foundation Documents

| Path | Title | Category | Phase | Owner | Status | SoT | Related |
|---|---|---|---|---|---|---|---|
| `docs/phase1_documentation_positioning.md` | Phase1 Documentation Positioning | Foundation | 1 | Primary Owner | Approved | Yes | boundary_catalog / ownership_policy |

---

## 4. Architecture Governance Documents

| Path | Title | Category | Phase | Owner | Status | SoT | Related |
|---|---|---|---|---|---|---|---|
| `docs/architecture_decision_record.md` | Architecture Decision Record | Governance / ADR | All | Primary Owner | Approved | Yes | boundary_catalog / decision_gate_catalog |
| `docs/document_ownership_policy.md` | Document Ownership Policy | Governance | All | Primary Owner | Approved | Yes | boundary_catalog / style_guide |
| `docs/boundary_catalog.md` | Boundary Catalog | Governance | All | Primary Owner | Approved | Yes | ownership_policy / adr |
| `docs/decision_gate_catalog.md` | Decision Gate Catalog | Governance | All | Primary Owner | Approved | Yes | adr / review_process |

---

## 5. Documentation Governance Documents

| Path | Title | Category | Phase | Owner | Status | SoT | Related |
|---|---|---|---|---|---|---|---|
| `docs/documentation_style_guide.md` | Documentation Style Guide | Documentation Governance | All | Primary Owner | Approved | Yes | glossary / review_process |
| `docs/documentation_review_process.md` | Documentation Review Process | Documentation Governance | All | Primary Owner | Approved | Yes | style_guide / checklist |
| `docs/documentation_review_checklist.md` | Documentation Review Checklist | Documentation Governance | All | Primary Owner | Approved | Yes | review_process / glossary |
| `docs/glossary.md` | Glossary | Documentation Governance | All | Primary Owner | Approved | Yes | style_guide / boundary_catalog |
| `docs/template_library.md` | Template Library | Documentation Governance | All | Primary Owner | Approved | Yes | style_guide / review_process / checklist |
| `docs/governance_self_review.md` | Governance Self Review | Documentation Governance / Evidence | All | Primary Owner | Approved | Yes | checklist / index / completion_report |
| `docs/governance_maintenance_plan.md` | Governance Maintenance Plan | Governance / Lifecycle | All | Primary Owner | Approved Candidate | Yes | review_process / index / self_review / operations |
| `docs/reports/monthly_governance_review_202607.md` | Monthly Governance Review 2026-07 | Evidence / Governance Review | All | Primary Owner | Approved Candidate | Yes | maintenance_plan / index / self_review / operations |
| `docs/reports/documentation_architecture_production_adoption_readiness.md` | Documentation Architecture Production Adoption Readiness | Evidence / Production Readiness | All | Primary Owner | Approved Candidate | Yes | maintenance_plan / completion_report / index / self_review |
| `docs/reports/phase10_phase11_connection_validation.md` | Phase10 → Phase11 Connection Validation | Evidence / Lifecycle / Governance | 10→11 | Primary Owner | Approved Candidate | Yes | readiness_report / completion_report / maintenance_plan / index / operations |
| `docs/specs/auto_scribe_ai_architecture_phase12.md` | Phase12 Auto Scribe AI Architecture | Specification / Runtime | 12 | Primary Owner | Design Baseline | Yes | ASA-ARCH-2.0 / baselines |
| `docs/specs/auto_scribe_ai_record_json_schema.md` | Auto Scribe AI — Record JSON Schema | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-REC-1.1 / ASA-ARCH-2.0 / ASA-CR-REC-001 |
| `docs/specs/auto_scribe_ai_runtime_api_specification.md` | Auto Scribe AI — Runtime API Specification | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-API-1.0 / ASA-ARCH-2.0 / ASA-IMPL-REC-1.1 |
| `docs/specs/auto_scribe_ai_storage_specification.md` | Auto Scribe AI — Storage Specification | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-STOR-1.0 / ASA-ARCH-2.0 / ASA-IMPL-REC-1.1 / ASA-IMPL-API-1.0 |
| `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` | Auto Scribe AI — Auto Capture Rule Specification | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-CAP-1.0 / ASA-ARCH-2.0 / ASA-IMPL-REC-1.1 / ASA-IMPL-API-1.0 / ASA-IMPL-STOR-1.0 |
| `docs/specs/auto_scribe_ai_search_specification.md` | Auto Scribe AI — Search Specification | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-SRCH-1.0 / ASA-ARCH-2.0 / ASA-IMPL-REC-1.1 / ASA-IMPL-API-1.0 / ASA-IMPL-STOR-1.0 |
| `docs/specs/auto_scribe_ai_export_specification.md` | Auto Scribe AI — Export Specification | Implementation Specification | 12 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-EXP-1.0 / ASA-ARCH-2.0 / ASA-IMPL-REC-1.1 / ASA-IMPL-API-1.0 / ASA-IMPL-STOR-1.0 / ASA-IMPL-SRCH-1.0 / ASA-IMPL-CAP-1.0 |
| `docs/specs/auto_scribe_ai_decision_memory_specification.md` | Auto Scribe AI — Decision Memory Specification | Implementation Specification | 13 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-DEC-1.0 / ASA-ARCH-13.0 |
| `docs/specs/auto_scribe_ai_implementation_memory_specification.md` | Auto Scribe AI — Implementation Memory Specification | Implementation Specification | 13 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-IMP-1.0 / ASA-ARCH-13.0 / ASA-IMPL-DEC-1.0 |
| `docs/specs/auto_scribe_ai_revert_memory_specification.md` | Auto Scribe AI — Revert Memory Specification | Implementation Specification | 13 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-REV-1.0 / ASA-ARCH-13.0 / ASA-CR-REV-001 |
| `docs/specs/auto_scribe_ai_deep_search_specification.md` | Auto Scribe AI — Deep Search Specification | Implementation Specification | 13 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-DSEARCH-1.0 / ASA-ARCH-13.0 / ASA-CR-DSEARCH-001 |
| `docs/specs/auto_scribe_ai_traceability_specification.md` | Auto Scribe AI — Traceability Specification | Implementation Specification | 14 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-TRACE-1.0 / ASA-ARCH-14.0 |
| `docs/specs/auto_scribe_ai_commit_implementation_specification.md` | Auto Scribe AI — Commit Implementation Specification | Implementation Specification | 14 | Primary Owner | Ready for Coding | Yes | ASA-IMPL-COMMIT-1.0 / ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-CR-COMMIT-001 |
| `docs/specs/auto_scribe_ai_pr_implementation_specification.md` | Auto Scribe AI — Pull Request Implementation Specification | Implementation Specification | 14 | Primary Owner | Implemented | Yes | ASA-IMPL-PR-1.0 / ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-IMPL-COMMIT-1.0 / ASA-CR-PR-001 / ASA-CR-PR-002 / ASA-CR-PR-STORE-001 |
| `docs/specs/auto_scribe_ai_issue_implementation_specification.md` | Auto Scribe AI — Issue Implementation Specification | Implementation Specification | 14 | Primary Owner | Implemented | Yes | ASA-IMPL-ISSUE-1.0 / ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-IMPL-COMMIT-1.0 / ASA-IMPL-PR-1.0 / ASA-CR-ISSUE-001 / ASA-IMPL-REQ-ISSUE-001 |
| `docs/specs/auto_scribe_ai_release_implementation_specification.md` | Auto Scribe AI — Release Implementation Specification | Implementation Specification | 14 | Primary Owner | Implemented | Yes | ASA-IMPL-RELEASE-1.0 / ASA-ARCH-14.0 / ASA-IMPL-TRACE-1.0 / ASA-CHK-REL-001 / ASA-IMPL-REQ-RELEASE-001 |
| `docs/specs/README.md` | Specifications Index | Spec Index | All | Primary Owner | Approved | Yes | ASA-ARCH-13.0 / ASA-ARCH-14.0 / ASA-ARCH-15.0 / Phase12-15 specs |
| `docs/baselines/ASA-ARCH-2.0.md` | Architecture Baseline ASA-ARCH-2.0 | Baseline Registry | 12 | Primary Owner | Design Baseline | Yes | auto_scribe_ai_architecture_phase12 / ASA-ARCH-12.0 |
| `docs/baselines/ASA-ARCH-12.0.md` | Architecture Baseline ASA-ARCH-12.0（Event Layer） | Baseline Registry | 12 | Primary Owner | Architecture Baseline | Yes | ASA-ARCH-2.0 / ASA-ARCH-13.0 |
| `docs/baselines/ASA-ARCH-13.0.md` | Architecture Baseline ASA-ARCH-13.0（Knowledge Memory） | Baseline Registry | 13 | Primary Owner | Ready for Implementation | Yes | ASA-ARCH-12.0 / DKM / RecordRef |
| `docs/baselines/ASA-ARCH-14.0.md` | Architecture Baseline ASA-ARCH-14.0（Traceability Layer） | Baseline Registry | 14 | Primary Owner | Ready for Implementation | Yes | ASA-ARCH-13.0 / TRACE / TTP / Traceability Flow DEC→ISSUE→COMMIT→PR→RELEASE |
| `docs/baselines/ASA-ARCH-15.0.md` | Architecture Baseline ASA-ARCH-15.0（Trace Intelligence Layer） | Baseline Registry | 15 | Primary Owner | Registered — Architecture Baseline | Yes | ASA-ARCH-14.0 / Query / Graph / Checker / Facade / Final v9 |
| `docs/architecture/asa_arch_15_trace_intelligence_layer.md` | ASA-ARCH-15.0 Deliverable Alias | Architecture Alias | 15 | Primary Owner | Registered | No（points to baseline） | ASA-ARCH-15.0 |
| `docs/baselines/ASA-ARCH-1.3.md` | Architecture Baseline ASA-ARCH-1.3 | Baseline History | 12 | Primary Owner | Superseded | No | ASA-ARCH-2.0 |
| `docs/baselines/README.md` | Architecture Baselines Index | Baseline Index | All | Primary Owner | Approved | Yes | ASA-ARCH-2.0 / ASA-ARCH-12.0 / ASA-ARCH-13.0 / ASA-ARCH-14.0 / ASA-ARCH-15.0 |

---

## 6. Operational / Lifecycle Documents

| Path | Title | Category | Phase | Owner | Status | SoT | Related |
|---|---|---|---|---|---|---|---|
| `docs/operations.md` | Operations / Lifecycle | Operational | 11 | Primary Owner | Approved | Yes | completion_report / governance |
| `docs/reports/operational_lifecycle_completion_report.md` | Phase11 Completion Report | Evidence | 11 | Primary Owner | Approved | Yes | operations / governance_self_review / documentation_index |

---

## 7. Navigation / Traceability Documents

| Path | Title | Category | Phase | Owner | Status | SoT | Related |
|---|---|---|---|---|---|---|---|
| `docs/framework_navigation.md` | Framework Navigation | Navigation | All | Primary Owner | Approved | Yes | index / governance |
| `docs/governance.md` | Governance Hub | Navigation / Governance | All | Primary Owner | Approved | Yes | boundary_catalog / operations |
| `docs/documentation_index.md` | Documentation Index（本書） | Navigation | All | Primary Owner | Approved | Yes | navigation / glossary |

---

## 8. Index Maintenance Rules

Index は以下のタイミングで更新する：

- 新規文書登録時
- Status変更時
- Owner変更時
- Category変更時
- Phase変更時
- Navigation更新時

Index は **Primary SoT（正本）** として扱う。

---

## 9. Status

```text
Approved

This Documentation Index provides a complete,
structured overview of all documents in the
AI編集秘書 Framework, enabling efficient
navigation, governance, and traceability.
```

---

## 10. Spec & Operational Hub Index（Additive Section）

本 Index の §3〜7 は Documentation Architecture / Governance 層の正本一覧である。  
Phase2〜11 の個別 Spec・Operational 子文書は、以下の Hub / Spec ディレクトリを入口とする（Primary 定義を上書きしない）。

| Hub / Path | Phase | 役割 |
|---|---|---|
| `docs/specs/` | 2〜12 | Approved Specification / Design Baseline 正本群 |
| `docs/baselines/` | 12+ | Architecture Baseline Registry（Event: ASA-ARCH-12.0/2.0 · Knowledge: ASA-ARCH-13.0 · Traceability: ASA-ARCH-14.0 · Trace Intelligence: ASA-ARCH-15.0） |
| `docs/research_governance.md` | 9 | Research Hub |
| `docs/production_adoption_governance.md` | 10 | Adoption Hub |
| `docs/operational_lifecycle_governance.md` | 11-0 | Lifecycle Hub |
| `docs/lifecycle_maintenance.md` | 11-1 | Maintenance Hub |
| `docs/operational_health_management.md` | 11-2 | Health Hub |
| `docs/operational_incident_recovery.md` | 11-3 | Incident & Recovery Hub |
| `docs/operational_knowledge_evolution.md` | 11-4 | Knowledge Evolution Hub |
| `docs/reports/` | 6〜11 | Completion / Evidence Reports |
| `docs/specs/auto_scribe_ai_architecture_phase12.md` | 12 | Auto Scribe AI Runtime Architecture（ASA-ARCH-2.0 / ASA-ARCH-12.0） |
| `docs/baselines/ASA-ARCH-12.0.md` | 12 | Event Layer Architecture ID |
| `docs/baselines/ASA-ARCH-13.0.md` | 13 | Knowledge Memory Architecture（ASA-ARCH-13.0） |
| `docs/baselines/ASA-ARCH-14.0.md` | 14 | Traceability Layer Architecture（ASA-ARCH-14.0） |
| `docs/baselines/ASA-ARCH-15.0.md` | 15 | Trace Intelligence Layer Architecture（ASA-ARCH-15.0） |
| `docs/architecture/asa_arch_15_trace_intelligence_layer.md` | 15 | ASA-ARCH-15.0 Deliverable Alias |
| `docs/specs/auto_scribe_ai_record_json_schema.md` | 12 | Record JSON Schema（ASA-IMPL-REC-1.1） |
| `docs/specs/auto_scribe_ai_runtime_api_specification.md` | 12 | Runtime API Specification（ASA-IMPL-API-1.0） |
| `docs/specs/auto_scribe_ai_storage_specification.md` | 12 | Storage Specification（ASA-IMPL-STOR-1.0） |
| `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` | 12 | Auto Capture Rule Specification（ASA-IMPL-CAP-1.0） |
| `docs/specs/auto_scribe_ai_search_specification.md` | 12 | Search Specification（ASA-IMPL-SRCH-1.0） |
| `docs/specs/auto_scribe_ai_export_specification.md` | 12 | Export Specification（ASA-IMPL-EXP-1.0） |
| `docs/specs/auto_scribe_ai_decision_memory_specification.md` | 13 | Decision Memory Specification（ASA-IMPL-DEC-1.0） |
| `docs/specs/auto_scribe_ai_implementation_memory_specification.md` | 13 | Implementation Memory Specification（ASA-IMPL-IMP-1.0） |
| `docs/specs/auto_scribe_ai_revert_memory_specification.md` | 13 | Revert Memory Specification（ASA-IMPL-REV-1.0） |
| `docs/specs/auto_scribe_ai_deep_search_specification.md` | 13 | Deep Search Specification（ASA-IMPL-DSEARCH-1.0） |
| `docs/specs/auto_scribe_ai_traceability_specification.md` | 14 | Traceability Specification（ASA-IMPL-TRACE-1.0） |
| `docs/specs/auto_scribe_ai_commit_implementation_specification.md` | 14 | Commit Implementation Specification（ASA-IMPL-COMMIT-1.0） |
| `docs/specs/auto_scribe_ai_pr_implementation_specification.md` | 14 | Pull Request Implementation Specification（ASA-IMPL-PR-1.0） |
| `docs/specs/auto_scribe_ai_issue_implementation_specification.md` | 14 | Issue Implementation Specification（ASA-IMPL-ISSUE-1.0） |
| `docs/specs/auto_scribe_ai_release_implementation_specification.md` | 14 | Release Implementation Specification（ASA-IMPL-RELEASE-1.0） |
| `docs/specs/README.md` | All | Specifications Index |

詳細導線: `docs/framework_navigation.md` / `docs/operations.md` / `docs/governance.md`
