# Framework Navigation

**Version:** 1.1  
**Status:** Approved  
**Scope:** AI編集秘書 Framework 全体構造 / Phase・Hub・文書案内

---

## 1. Purpose

本書は、AI編集秘書 Framework の **全体構造・Phase 間の流れ・Hub の役割・主要文書の案内** を提供する。

Architecture Review Recommendation #4 に基づき、  
**Adoption（Phase10）および Research（Phase9）から Phase11 への逆リンク補強**を行い、  
Framework 全体のライフサイクルを一望できるようにする。

---

## 2. Framework Overview（正式名称反映済）

```text
Phase1  Foundation
Phase2  Requirements
Phase3  Design
Phase4  Implementation
Phase5  Integration
Phase6  Operational Foundation
Phase7  Operational Governance
Phase8  AI Governance / Knowledge Operations
Phase9  Research Governance
Phase10 Production Adoption Framework
Phase11 Operational Lifecycle
Phase12 Auto Scribe AI（Runtime Recording Service / Event Layer）
Phase13 Knowledge Memory Architecture（DEC / IMP / REV / DSEARCH）
Phase14 Traceability Layer（TRACE / COMMIT / PR / ISSUE / RELEASE）
Phase15 Trace Intelligence Layer（Query / Graph / Checker / Facade）
```

Phase1（Foundation / Conceptual Origin）の文書位置付け:  
`docs/phase1_documentation_positioning.md`（Spec 対象外 / Foundation Docs のみ）

主要アーキテクチャ判断の正本:  
`docs/architecture_decision_record.md`（ADR Version 1.1 / Approved）

境界の横断索引:  
`docs/boundary_catalog.md`（Boundary Catalog Version 1.1 / Approved）

文書スタイルの正本:  
`docs/documentation_style_guide.md`（Documentation Style Guide Version 1.1 / Approved）

文書レビュー・承認プロセスの正本:  
`docs/documentation_review_process.md`（Documentation Review Process Version 1.1 / Approved）

公式用語辞書:  
`docs/glossary.md`（Glossary Version 1.1 / Approved）

レビュー確認項目:  
`docs/documentation_review_checklist.md`（Documentation Review Checklist Version 1.0 / Approved）

全文書索引:  
`docs/documentation_index.md`（Documentation Index Version 1.1 / Approved）

標準テンプレート集:  
`docs/template_library.md`（Template Library Version 1.1 / Approved）

Documentation Architecture 監査証跡:  
`docs/governance_self_review.md`（Governance Self Review Version 1.1 / Approved / Integrity Verified）

Documentation Governance 保守計画:  
`docs/governance_maintenance_plan.md`（Governance Maintenance Plan Version 1.1 / Approved Candidate）

Phase12 Runtime Architecture Baseline:  
`docs/specs/auto_scribe_ai_architecture_phase12.md`（**ASA-ARCH-2.0** / Design Baseline）  
Event Layer Architecture ID: **ASA-ARCH-12.0**（`docs/baselines/ASA-ARCH-12.0.md` ≡ ASA-ARCH-2.0）  
Registry: `docs/baselines/ASA-ARCH-2.0.md` / History: `docs/baselines/ASA-ARCH-1.3.md`

### Phase12 Implementation Specifications

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-REC-1.1 | Record JSON Schema | Ready for Coding | `docs/specs/auto_scribe_ai_record_json_schema.md` |
| ASA-IMPL-API-1.0 | Runtime API Specification | Ready for Coding | `docs/specs/auto_scribe_ai_runtime_api_specification.md` |
| ASA-IMPL-STOR-1.0 | Storage Specification | Ready for Coding | `docs/specs/auto_scribe_ai_storage_specification.md` |
| ASA-IMPL-CAP-1.0 | Auto Capture Rule Specification | Ready for Coding | `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` |
| ASA-IMPL-SRCH-1.0 | Search Specification | Ready for Coding | `docs/specs/auto_scribe_ai_search_specification.md` |
| ASA-IMPL-EXP-1.0 | Export Specification | Ready for Coding | `docs/specs/auto_scribe_ai_export_specification.md` |

### Phase13 Knowledge Memory Architecture Baseline

`docs/baselines/ASA-ARCH-13.0.md`（**ASA-ARCH-13.0** / Knowledge Layer / Registered — Ready for Implementation）  
Parent: **ASA-ARCH-12.0**（Event Layer）

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-DEC-1.0 | Decision Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_decision_memory_specification.md` |
| ASA-IMPL-IMP-1.0 | Implementation Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_implementation_memory_specification.md` |
| ASA-IMPL-REV-1.0 | Revert Memory Specification | Ready for Coding | `docs/specs/auto_scribe_ai_revert_memory_specification.md` |
| ASA-IMPL-DSEARCH-1.0 | Deep Search Specification | Ready for Coding | `docs/specs/auto_scribe_ai_deep_search_specification.md` |

### Phase14 Traceability Layer Architecture Baseline

`docs/baselines/ASA-ARCH-14.0.md`（**ASA-ARCH-14.0** / Traceability Layer / Registered — Ready for Implementation）  
Parent: **ASA-ARCH-13.0**（Knowledge Layer）

**Traceability Flow（SoT / ASA-ARCH-14.0 §7.3）:**

```text
DEC → ISSUE → COMMIT（one or more） → PR → RELEASE
```

| Spec ID | Title | Status | Path |
|---|---|---|---|
| ASA-IMPL-TRACE-1.0 | Traceability Specification（Base Trace） | Ready for Coding | `docs/specs/auto_scribe_ai_traceability_specification.md` |
| ASA-IMPL-COMMIT-1.0 | Commit Implementation Specification | Ready for Coding | `docs/specs/auto_scribe_ai_commit_implementation_specification.md` |
| ASA-IMPL-PR-1.0 | Pull Request Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_pr_implementation_specification.md` |
| ASA-IMPL-ISSUE-1.0 | Issue Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_issue_implementation_specification.md` |
| ASA-IMPL-RELEASE-1.0 | Release Implementation Specification | Implemented | `docs/specs/auto_scribe_ai_release_implementation_specification.md` |

### Phase15 Trace Intelligence Layer Architecture Baseline

`docs/baselines/ASA-ARCH-15.0.md`（**ASA-ARCH-15.0** / Trace Intelligence Layer / Registered — Architecture Baseline / Final v9）  
Parent: **ASA-ARCH-14.0**（Traceability Layer）  
Alias: `docs/architecture/asa_arch_15_trace_intelligence_layer.md`

| Component | Role | Status |
|---|---|---|
| Trace Query Layer | Compose Store results via Facade | Pending IMPL-REQ |
| Trace Graph Engine | Reconstruct graph from Query | Pending IMPL-REQ |
| Trace Consistency Checker | Read-only integrity reports | Pending IMPL-REQ |
| Repository Facade API | Store dispatch / no cross-entity compose | Pending IMPL-REQ |

**Next:** ASA-IMPL-REQ-TRACE-QUERY-001

---

## 3. Lifecycle Flow（正方向）

```text
Research Governance（Phase9）
    ↓ Candidate / Validated
Production Adoption Framework（Phase10）
    ↓ Adopt
Production Runtime
    ↓
Lifecycle（Phase11-0）
    ↓
Maintenance（Phase11-1）
    ↓
Health（Phase11-2）
    ↓
Incident & Recovery（Phase11-3）
    ↓
Knowledge Evolution（Phase11-4）
    ↓
Lifecycle（Phase11-0）
```

---

## 4. Reverse Links（逆リンク補強：レビュー反映済）

### 4.1 Research → Adoption（逆リンク）

Research Governance（Phase9）は、Framework の改善候補を生成するフェーズであり、  
その成果は **必ず Production Adoption Framework（Phase10）へ逆リンクされる**。

```text
Research Output:
- Validated Research
- Candidate Improvement
- Optimization Proposal

Reverse Link:
Research → Future Adoption（Phase10）
```

**位置付け：**

| Research成果 | Adoptionでの扱い |
|---|---|
| Validated | Adoption候補として審査 |
| Candidate | 改善案として評価 |
| Proposal | 採用可否判断へ進む |

---

### 4.2 Adoption → Lifecycle（逆リンク）

Production Adoption Framework（Phase10）は Production への入口であり、  
採用されたものは **必ず Phase11 の Lifecycle（11-0）へ逆リンクされる**。

```text
Adopted → Production Runtime → Lifecycle（Phase11-0）
```

**位置付け：**

| Adoption結果 | 次工程 |
|---|---|
| Adopt | Production → Lifecycle |
| Revise | Researchへ戻る |
| Reject | Researchへ戻る（改善案化） |

---

## 5. Hub Navigation（主要Hub案内）

### 5.1 Research Hub（Phase9）

| 要素 | 内容 |
|---|---|
| 目的 | 新規知識・改善案の生成 |
| 出力 | Validated / Candidate / Proposal |
| 逆リンク | Future Adoption（Phase10） |
| 文書 | `research_hub.md` / `research_validation.md` |

実装上の Hub 正本: `research_governance.md`（`research_hub.md` は案内名）

---

### 5.2 Adoption Hub（Phase10）

| 要素 | 内容 |
|---|---|
| 目的 | 採用可否判断 |
| Gate | Adoption Decision Gate |
| 出力 | Adopt / Revise / Reject |
| 逆リンク | Lifecycle（Phase11-0） |
| 文書 | `production_adoption_governance.md` |

Adoption Decision Gate の Catalog 索引: `decision_gate_catalog.md`

---

### 5.3 Operational Lifecycle Hub（Phase11）

| Phase | Hub | 役割 |
|---|---|---|
| 11-0 | Lifecycle | 運用継続判断 |
| 11-1 | Maintenance | 定常保守 |
| 11-2 | Health | 健全性評価 |
| 11-3 | Incident & Recovery | 障害対応・復旧 |
| 11-4 | Knowledge Evolution | 知識公開 |

Hub 正本:

* `operational_lifecycle_governance.md`
* `lifecycle_maintenance.md`
* `operational_health_management.md`
* `operational_incident_recovery.md`
* `operational_knowledge_evolution.md`

---

## 6. Document Map（主要文書案内）

| 領域 | 文書 |
|---|---|
| Adoption | `production_adoption_governance.md` / `adoption_decision_gate.md` |
| Research | `research_hub.md` / `research_validation.md` |
| Lifecycle | `operational_lifecycle_governance.md` |
| Maintenance | `maintenance_decision_gate.md` |
| Health | `health_decision_gate.md` |
| Recovery | `recovery_decision_gate.md` |
| Knowledge | `knowledge_decision_gate.md` |

パス解決（運用）:

| 案内名 | 実装パス |
|---|---|
| `research_hub.md` | `research_governance.md` |
| `adoption_decision_gate.md` | `decision_gate_catalog.md`（§3.1）/ `production_adoption_governance.md` |

---

## 7. Integration Points（統合ポイント）

```text
Research → Adoption（逆リンク）
Adoption → Lifecycle（逆リンク）
Lifecycle → Maintenance
Maintenance → Health
Health → Incident or Continue
Recovery → Knowledge
Knowledge → Lifecycle（閉ループ）
```

---

## 8. Status

```text
Approved

This navigation document provides a unified
map of the AI編集秘書 Framework, including
reverse links between Research, Adoption,
and Operational Lifecycle.
```
