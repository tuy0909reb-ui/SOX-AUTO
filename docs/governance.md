# Operational Governance（Phase7-0）

仕様: `docs/specs/operational_governance_phase7_0.md`  
変更管理: `docs/change_management.md`  
リスク管理: `docs/risk_management.md`  
運用ハブ: `docs/operations.md`

本ドキュメントは運用ルール・責務・境界の定義のみを担う。  
CI/CD・Deployment・Monitoring の実装変更、技術実装方式の決定、アーキテクチャ変更判断、`tools/secretary/` 変更は行わない。

---

## 1. Responsibility Definition（責務定義）

| 領域 | 主担当 Phase / 文書 | 責務 | 担当外（重複回避） |
|---|---|---|---|
| Monitoring | Phase6-2 / `operations.md` | Workflow 状態確認・ログ確認手順・既存通知経路の把握 | Metrics 設計の詳細、自動化実装 |
| Incident Response | Phase6-3-A / `incident_response.md` | Severity・初動・Rollback **判断**・Incident 記録 | Rollback **実行**、観測設計、自動復旧 |
| Observability | Phase6-3-B / `observability.md` | Health Check / Metrics / Alert条件 / Dashboard **要求の定義** | 収集基盤導入、通知システム追加 |
| Automation | Phase6-3-C / `automation.md` | 定型収集・レポート・Runbook 補助 | 自動復旧、自動 Rollback、Deploy 実行 |
| Change Management | Phase7-0 / `change_management.md` | 変更起案〜承認〜適用〜確認の標準フロー | 変更の自動適用、技術方式の決定 |
| Governance | Phase7-0 / 本ドキュメント | 責務・方針・境界の維持 | 技術実装判断、アーキテクチャ変更判断 |
| Reliability | Phase7-1 / `reliability.md` / `slo.md` / `review_process.md` | SLI/SLO/Review/Trend/改善サイクルの管理定義 | 収集基盤実装、自動復旧、SLA契約管理 |
| Security | Phase7-2 / `security.md` 他 | Secrets/Dependency/Review/Audit/Security Incident 境界 | 自動 Patch、Secret 自動更新、技術実装判断 |
| Advanced Automation | Phase7-3 / `advanced_automation.md` 他 | Policy/Risk/Approval/Audit 付き判断支援・制約実行 | 自律運用、AI最終判断、無承認実行、定型収集の代替 |
| AI Operations Governance | Phase8-0 / `ai_governance.md` 他 | AI利用ルール・境界・検証・監査・AIリスク・Compliance境界 | モデル導入、AI最終判断、AI単独実行 |
| AI Decision Support | Phase8-1 / `ai_decision_support.md` 他 | 分析・候補提示・Evidence検証・Human Review接続 | AI最終判断、自動Deploy、Evidenceなし採用 |
| Knowledge Operations | Phase8-2 / `knowledge_management.md` 他 | Knowledge管理・Trust/Version・Runbook連携 | AIによる正式更新、DraftのAI利用、Secrets保存 |
| Intelligent Automation Support | Phase8-3 / `intelligent_automation.md` 他 | AI支援Automation接続・Policy評価支援・Trace | AI承認/直接実行、自律運用、Phase7-3実行の代替 |
| Research Governance | Phase9-0 / `research_governance.md` 他 | Research Principles / Scope / Classification / Experiment Governance / Risk Mgmt による隔離研究の統制 | Production 直接変更、無承認採用、Research Audit 削除 |
| AI Agent Collaboration Research | Phase9-1 / `ai_agent_collaboration.md` 他 | Agent Collaboration（責務分離 / 協調方式 / 境界 / 安全性）に基づく研究統制 | Agent実装、Production変更、Agent自律運用の実行、無承認採用 |
| Policy as Code Research | Phase9-2 / `policy_as_code_research.md` 他 | Policy宣言・Validation・Version/Lifecycle・Conflict・Complianceの研究 | 本番Policy適用、AIによるPolicy自動変更、Production制御 |
| Autonomous Operations Research | Phase9-3 / `autonomous_operations_research.md` | 自律運用候補の安全性研究（Sandbox / Human Override） | Production Autonomous、Policy自動更新、Human Approval省略 |
| Predictive AIOps Research | Phase9-4 / `predictive_aiops_research.md` 他 | 予測モデル・予兆検知・Drift・Lifecycleの研究 | 予測による本番自動判断/復旧、Policy更新、Human Review省略 |
| Production Adoption Governance | Phase10-0 / `production_adoption_governance.md` 他 | Validated/CandidateのProduction採用統制・段階導入・監査・廃止 | AI承認、未検証採用、無承認Rollback、研究の直接本番適用 |
| Controlled Production Adoption | Phase10-1 / `controlled_production_adoption.md` 他 | 統制導入・Change Window・Rollout・Acceptance・Rollback・Stabilization | AI承認、無承認Rollback、Freeze中導入、未Ready導入 |
| Operational Validation | Phase10-2 / `operational_validation.md` 他 | KPI/Reliability/Security/AI/Automation検証・Decision Gate・Knowledge Feedback | ValidationによるProduction自動変更、AI最終判断、無承認Rollback |
| Operational Feedback Integration | Phase10-3 / `operational_feedback_integration.md` 他 | Feedback・Lessons・Knowledge統合・Improvement管理・Research接続 | FeedbackによるProduction直接変更、AI承認、Knowledge自動更新 |
| Future Operational Optimization | Phase10-4 / `future_operational_optimization.md` 他 | 将来最適化計画・Prioritization・Decision Gate・Research接続 | Autonomous Change、AI Optimization決定、Production自動最適化 |
| Operational Lifecycle Governance | Phase11-0 / `operational_lifecycle_governance.md` 他 | Production採用後のLifecycle・Version・Deprecation・Retirement・Archive統制 | Lifecycle自動決定、AI最終判断、無承認Retirement、Archive削除 |
| Lifecycle Maintenance | Phase11-1 / `lifecycle_maintenance.md` 他 | Production Capabilityの維持・Planning/Execution/Verification・Approval Levels | Maintenance自動決定、AI承認、未承認実行、自己変更Automation |
| Operational Health Management | Phase11-2 / `operational_health_management.md` 他 | 健全性監視・評価・可視化・Alert・Decision Gate・Recovery調整 | HealthによるProduction自動変更、AI最終判断、Recovery自動実行 |
| Operational Incident & Recovery | Phase11-3 / `operational_incident_recovery.md` 他 | Incident検知〜復旧・Escalation・RCA・Lessons・Recovery Decision Gate | 自動復旧、無承認Rollback、AI Escalation/Recovery承認 |
| Operational Knowledge Evolution | Phase11-4 / `operational_knowledge_evolution.md` 他 | 運用知見の体系化・Validation・Repository・Reuse・次サイクルGovernance還元 | Knowledge自動Publish、AI Approval、Policy/Production自動変更 |
| Quality Assurance | Phase5 / E2E・pytest・CI 仕様 | テスト・Quality Gate・CI 成否の品質確認 | 運用ルール策定、Deploy 実行 |
| Deployment | Phase6-1 / `deployment.md` | Release 成果物の staging/production 反映・Rollback **実行** | 障害 Severity 判定、品質ゲート設計 |

共通禁止（全領域）:

* `tools/secretary/` の本番ロジック変更を Governance / 運用 Runbook の代替にしない
* Secrets 値の文書・通知・ログへの記載
* 未承認の運用変更の適用

---

## 2. Operational Policy（運用ルール）

| ルール | 内容 | 例外 |
|---|---|---|
| 障害対応 | `incident_response.md` の固定初動順を守る | なし（順序変更禁止） |
| 通知 | 既存 GitHub Actions 失敗通知 / UI を一次経路とする。Secrets を含めない | 新規チャネル追加は Change Management 経由（実装は別 Phase） |
| ログ | Actions / 取得可能アプリログのみ。Secret 値禁止 | 「未取得」は未取得と記録（補正しない） |
| 変更管理 | `change_management.md` に従い承認必須 | 緊急変更は同文書の緊急フローのみ |
| 自動化と人間 | Automation は情報提供のみ。判断は人間 | 自動復旧・自動 Rollback 禁止 |
| 境界 | Phase5/6/7 の責務表に従う | Governance が技術実装を決めない |

---

## 3. Boundary Control（境界管理）

```text
Phase5  品質保証（Test / Coverage / Release 品質前提）
   │
Phase6  運用基盤（Deploy / Secrets / Monitor / Incident / Observability / Automation）
   │
Phase7-0  Governance（ルール・責務・変更・リスク）← 技術実装判断を行わない
```

| 境界 | Governance が行うこと | Governance が行わないこと |
|---|---|---|
| Phase5 | 品質フロー変更時の影響確認・承認要否の参照 | pytest / Coverage / CI Workflow の実装変更 |
| Phase6 | 運用文書・運用設定変更の承認境界維持 | Deploy 方式・Monitoring 実装・Automation 追加の実装決定 |
| Phase6-3-C | 自動化が判断を代替していないことの確認 | 自動復旧・条件付き高度自動化の導入判断（将来 Phase） |
| 技術 / アーキテクチャ | 境界逸脱の差し戻し | 実装方式・アーキテクチャ変更の決定 |

境界逸脱時: 差し戻し（未承認扱い）。補正して適用しない。

---

## 4. エラー方針（Governance）

| 状態 | 扱い |
|---|---|
| ルール不整合 | 文書修正（Change Management 経由） |
| 境界逸脱 | 差し戻し |
| 変更管理不備 | 未承認扱い |
| リスク評価不足 | 再評価（`risk_management.md`） |

---

## 5. 関連文書

| 文書 | 内容 |
|---|---|
| `docs/change_management.md` | 変更フロー・承認・緊急変更 |
| `docs/risk_management.md` | リスク分類・評価・受容基準 |
| `docs/operations.md` | 日常運用 Runbook |
| `docs/automation.md` | 運用 Automation |
| `docs/observability.md` | 観測設計 |
| `docs/incident_response.md` | 障害対応 |
| `docs/security.md` | Security 責務・Review・Incident 境界 |
| `docs/secrets_policy.md` | Secrets 管理方針 |
| `docs/dependency_management.md` | 依存・脆弱性管理 |
| `docs/audit_preparation.md` | 監査準備 |
| `docs/advanced_automation.md` | Controlled Automation Framework |
| `docs/automation_policy.md` | Policy / Approval Workflow |
| `docs/automation_audit.md` | Automation Audit Trail |
| `docs/ai_governance.md` | AI 利用ルール・Human-in-the-loop |
| `docs/ai_audit.md` | AI 利用履歴（AIA-） |
| `docs/ai_risk_management.md` | AI 利用リスク |
| `docs/ai_compliance.md` | AI Compliance 境界 |
| `docs/ai_decision_support.md` | AI 分析・判断支援フロー |
| `docs/ai_recommendation_policy.md` | 候補提示・Confidence |
| `docs/ai_validation.md` | Evidence Based Validation |
| `docs/knowledge_management.md` | Knowledge Repository |
| `docs/knowledge_source_policy.md` | AI 参照可/不可ソース |
| `docs/knowledge_trust_level.md` | Trust Level |
| `docs/knowledge_versioning.md` | Knowledge Version / CHG |
| `docs/knowledge_validation.md` | Knowledge Validation 状態 |
| `docs/knowledge_lifecycle.md` | Lifecycle |
| `docs/runbook_integration.md` | Incident ↔ Runbook |
| `docs/intelligent_automation.md` | AI 支援 Automation 統合 |
| `docs/automation_workflow_policy.md` | AI→Approval→Execution Workflow |
| `docs/automation_execution_audit.md` | Execution Trace |
| `docs/automation_improvement.md` | Improvement Loop |
| `docs/research_governance.md` | Research Governance（原則 / Scope / Classification / Experiment Governance / Risk Mgmt） |
| `docs/research_validation.md` | Research Validation（評価項目 / Validation Flow） |
| `docs/research_artifact_management.md` | Research Artifacts 管理（Version/Owner/Status/Traceability/Audit Connection） |
| `docs/research_transition.md` | Research Transition（Exit Criteria / Future Adoption=Phase10候補） |
| `docs/ai_agent_collaboration.md` | AI Agent Collaboration（Phase9-1） |
| `docs/agent_responsibility_model.md` | Agent Responsibility Model（責務分離 / 境界 / 相互作用 / 非対象） |
| `docs/agent_collaboration_patterns.md` | Agent Collaboration Patterns（Sequential/Parallel/Hierarchical/Coordinator） |
| `docs/agent_boundary.md` | Agent Boundary（Permission/Data/Execution/Governance/Risk） |
| `docs/agent_research_validation.md` | Agent Research Validation（Flow / Criteria / Governance適合） |
| `docs/agent_risk_management.md` | Agent Risk Management（Runaway/Boundary/Autonomy/Leak等） |
| `docs/agent_artifact_management.md` | Agent Artifact Management（Artifacts / Version / Traceability / Audit） |
| `docs/agent_transition.md` | Agent Transition（Exit Criteria / Future Adoption=Phase10候補） |
| `docs/policy_as_code_research.md` | Policy as Code Research（Phase9-2） |
| `docs/policy_model.md` | Policy Model |
| `docs/policy_representation.md` | Policy Representation |
| `docs/policy_validation.md` | Policy Validation |
| `docs/policy_version_management.md` | Policy Version Management |
| `docs/policy_testing.md` | Policy Testing（研究用途） |
| `docs/policy_lifecycle.md` | Policy Lifecycle |
| `docs/policy_conflict_resolution.md` | Policy Conflict Resolution |
| `docs/policy_compliance.md` | Policy Compliance Integration |
| `docs/policy_transition.md` | Policy Transition（Phase9-3 / Phase10候補） |
| `docs/autonomous_operations_research.md` | Autonomous Operations Research（Phase9-3） |
| `docs/predictive_aiops_research.md` | Predictive AIOps Research（Phase9-4） |
| `docs/prediction_model.md` | Prediction Model |
| `docs/prediction_sources.md` | Prediction Sources |
| `docs/prediction_validation.md` | Prediction Validation |
| `docs/prediction_confidence.md` | Prediction Confidence |
| `docs/prediction_drift.md` | Prediction Drift Research |
| `docs/prediction_lifecycle.md` | Prediction Lifecycle |
| `docs/prediction_explainability.md` | Prediction Explainability |
| `docs/prediction_consumption_boundary.md` | Prediction Consumption Boundary |
| `docs/prediction_transition.md` | Prediction Transition（Phase10候補） |
| `docs/production_adoption_governance.md` | Production Adoption Governance（Phase10-0） |
| `docs/adoption_lifecycle.md` | Adoption Lifecycle |
| `docs/adoption_review.md` | Adoption Review |
| `docs/adoption_audit.md` | Adoption Audit |
| `docs/adoption_traceability.md` | Adoption Traceability（Research→Production） |
| `docs/adoption_deployment_strategy.md` | Adoption Deployment Strategy |
| `docs/post_adoption_review.md` | Post-Adoption Review |
| `docs/adoption_exit_criteria.md` | Adoption Exit Criteria |
| `docs/controlled_production_adoption.md` | Controlled Production Adoption（Phase10-1） |
| `docs/deployment_planning.md` | Deployment Planning |
| `docs/change_window_management.md` | Change Window Management |
| `docs/deployment_strategy.md` | Deployment Strategy |
| `docs/pre_deployment_review.md` | Pre-Deployment Review |
| `docs/adoption_readiness_checklist.md` | Adoption Readiness Checklist |
| `docs/controlled_rollout.md` | Controlled Rollout |
| `docs/operational_acceptance.md` | Operational Acceptance |
| `docs/adoption_monitoring.md` | Adoption Monitoring |
| `docs/rollback_execution.md` | Rollback Execution（Human Approval必須） |
| `docs/deployment_traceability.md` | Deployment Traceability |
| `docs/production_stabilization.md` | Production Stabilization |
| `docs/production_record.md` | Production Record |
| `docs/operational_validation.md` | Operational Validation（Phase10-2） |
| `docs/validation_kpi.md` | KPI Validation |
| `docs/validation_reliability.md` | Reliability Validation |
| `docs/validation_performance.md` | Performance Validation |
| `docs/validation_security.md` | Security Validation |
| `docs/validation_ai_capability.md` | AI Capability Validation |
| `docs/validation_automation.md` | Automation Validation |
| `docs/validation_drift_detection.md` | Drift Detection |
| `docs/validation_frequency.md` | Validation Frequency |
| `docs/validation_decision_gate.md` | Validation Decision Gate |
| `docs/operational_knowledge_feedback.md` | Operational Knowledge Feedback |
| `docs/validation_traceability.md` | Validation Traceability |
| `docs/validation_maturity.md` | Validation Maturity |
| `docs/operational_feedback_integration.md` | Operational Feedback Integration（Phase10-3） |
| `docs/feedback_lifecycle.md` | Feedback Lifecycle |
| `docs/feedback_sources.md` | Feedback Sources |
| `docs/feedback_classification.md` | Feedback Classification |
| `docs/lessons_learned.md` | Lessons Learned |
| `docs/knowledge_integration.md` | Knowledge Integration |
| `docs/improvement_management.md` | Improvement Management |
| `docs/improvement_decision_gate.md` | Improvement Decision Gate |
| `docs/feedback_priority.md` | Feedback Priority |
| `docs/continuous_improvement.md` | Continuous Improvement |
| `docs/feedback_traceability.md` | Feedback Traceability |
| `docs/operational_maturity.md` | Operational Maturity |
| `docs/research_feedback_interface.md` | Research Feedback Interface |
| `docs/future_operational_optimization.md` | Future Operational Optimization（Phase10-4） |
| `docs/optimization_lifecycle.md` | Optimization Lifecycle |
| `docs/optimization_candidate_management.md` | Optimization Candidate Management |
| `docs/optimization_review.md` | Optimization Review |
| `docs/optimization_metrics.md` | Optimization Metrics |
| `docs/optimization_prioritization.md` | Optimization Prioritization |
| `docs/optimization_decision_gate.md` | Optimization Decision Gate |
| `docs/optimization_risk_management.md` | Optimization Risk Management |
| `docs/future_capability_planning.md` | Future Capability Planning |
| `docs/operational_excellence_model.md` | Operational Excellence Model |
| `docs/optimization_knowledge_feedback.md` | Optimization Knowledge Feedback |
| `docs/optimization_traceability.md` | Optimization Traceability |
| `docs/phase9_research_interface.md` | Phase9 Research Interface |
| `docs/reports/operational_maturity_completion_report.md` | Phase6〜8 運用成熟化完了証跡 |
| `docs/reports/research_completion_report.md` | Phase9 Advanced Research 完了証跡 |
| `docs/reports/production_adoption_completion_report.md` | Phase10 Production Adoption 完了証跡 |
| `docs/reports/operational_lifecycle_completion_report.md` | Phase11 Documentation Architecture 完了証跡（Version 2.0 / Approved） |
| `docs/document_ownership_policy.md` | Document Ownership Policy（Primary SoT / Secondary / Additive） |
| `docs/decision_gate_catalog.md` | Decision Gate Catalog（Phase10〜Phase11） |
| `docs/framework_navigation.md` | Framework Navigation（Research / Adoption / Lifecycle 逆リンク） |
| `docs/phase1_documentation_positioning.md` | Phase1 Documentation Positioning（Foundation / Spec対象外） |
| `docs/architecture_decision_record.md` | Architecture Decision Record（主要設計判断の正本） |
| `docs/boundary_catalog.md` | Boundary Catalog（Human / AI / Automation / Production / Documentation） |
| `docs/documentation_style_guide.md` | Documentation Style Guide（表記・構造・Status・Versioning） |
| `docs/documentation_review_process.md` | Documentation Review Process（作成・レビュー・承認・廃止） |
| `docs/glossary.md` | Glossary（公式用語辞書） |
| `docs/documentation_review_checklist.md` | Documentation Review Checklist（レビュー確認項目） |
| `docs/documentation_index.md` | Documentation Index（全文書索引） |
| `docs/template_library.md` | Template Library（Spec / ADR / Governance / Report） |
| `docs/governance_self_review.md` | Governance Self Review（Documentation Architecture 監査） |
| `docs/governance_maintenance_plan.md` | Governance Maintenance Plan（Documentation Governance 保守） |
| `docs/reports/monthly_governance_review_202607.md` | Monthly Governance Review 2026-07（初回 Routine Review） |
| `docs/reports/documentation_architecture_production_adoption_readiness.md` | Documentation Architecture Production Adoption Readiness |
| `docs/reports/phase10_phase11_connection_validation.md` | Phase10 → Phase11 Connection Validation |
| `docs/specs/auto_scribe_ai_architecture_phase12.md` | Phase12 Auto Scribe AI Architecture（ASA-ARCH-2.0） |
| `docs/specs/auto_scribe_ai_record_json_schema.md` | Phase12 Record JSON Schema（ASA-IMPL-REC-1.1） |
| `docs/specs/auto_scribe_ai_runtime_api_specification.md` | Phase12 Runtime API Specification（ASA-IMPL-API-1.0） |
| `docs/specs/auto_scribe_ai_storage_specification.md` | Phase12 Storage Specification（ASA-IMPL-STOR-1.0） |
| `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md` | Phase12 Auto Capture Rule Specification（ASA-IMPL-CAP-1.0） |
| `docs/specs/auto_scribe_ai_search_specification.md` | Phase12 Search Specification（ASA-IMPL-SRCH-1.0） |
| `docs/specs/auto_scribe_ai_export_specification.md` | Phase12 Export Specification（ASA-IMPL-EXP-1.0） |
| `docs/specs/auto_scribe_ai_decision_memory_specification.md` | Phase13 Decision Memory Specification（ASA-IMPL-DEC-1.0） |
| `docs/specs/auto_scribe_ai_implementation_memory_specification.md` | Phase13 Implementation Memory Specification（ASA-IMPL-IMP-1.0） |
| `docs/specs/auto_scribe_ai_revert_memory_specification.md` | Phase13 Revert Memory Specification（ASA-IMPL-REV-1.0） |
| `docs/specs/auto_scribe_ai_deep_search_specification.md` | Phase13 Deep Search Specification（ASA-IMPL-DSEARCH-1.0） |
| `docs/specs/auto_scribe_ai_traceability_specification.md` | Phase14 Traceability Specification（ASA-IMPL-TRACE-1.0） |
| `docs/specs/auto_scribe_ai_commit_implementation_specification.md` | Phase14 Commit Implementation Specification（ASA-IMPL-COMMIT-1.0） |
| `docs/specs/auto_scribe_ai_pr_implementation_specification.md` | Phase14 Pull Request Implementation Specification（ASA-IMPL-PR-1.0） |
| `docs/specs/auto_scribe_ai_issue_implementation_specification.md` | Phase14 Issue Implementation Specification（ASA-IMPL-ISSUE-1.0） |
| `docs/specs/auto_scribe_ai_release_implementation_specification.md` | Phase14 Release Implementation Specification（ASA-IMPL-RELEASE-1.0） |
| `docs/specs/README.md` | Specifications Index（Phase12 / Phase13 / Phase14） |
| `docs/baselines/ASA-ARCH-2.0.md` | Architecture Baseline Registry（Event Layer Detailed / ≡ ASA-ARCH-12.0） |
| `docs/baselines/ASA-ARCH-12.0.md` | Architecture Baseline ASA-ARCH-12.0（Event Layer） |
| `docs/baselines/ASA-ARCH-13.0.md` | Architecture Baseline ASA-ARCH-13.0（Knowledge Memory） |
| `docs/baselines/ASA-ARCH-14.0.md` | Architecture Baseline ASA-ARCH-14.0（Traceability Layer） |
| `docs/baselines/ASA-ARCH-15.0.md` | Architecture Baseline ASA-ARCH-15.0（Trace Intelligence Layer） |
| `docs/architecture/asa_arch_15_trace_intelligence_layer.md` | ASA-ARCH-15.0 Deliverable Alias |
| `docs/operational_lifecycle_governance.md` | Operational Lifecycle Governance（Phase11-0） |
| `docs/lifecycle_model.md` | Lifecycle Model |
| `docs/lifecycle_states.md` | Lifecycle States |
| `docs/lifecycle_trigger.md` | Lifecycle Trigger |
| `docs/lifecycle_review.md` | Lifecycle Review |
| `docs/lifecycle_ownership.md` | Lifecycle Ownership |
| `docs/version_governance.md` | Version Governance |
| `docs/deprecation_governance.md` | Deprecation Governance |
| `docs/retirement_governance.md` | Retirement Governance |
| `docs/archive_governance.md` | Archive Governance |
| `docs/lifecycle_audit.md` | Lifecycle Audit |
| `docs/lifecycle_traceability.md` | Lifecycle Traceability |
| `docs/lifecycle_maturity.md` | Lifecycle Maturity |
| `docs/end_of_life_policy.md` | End-of-Life Policy |
| `docs/lifecycle_decision_gate.md` | Lifecycle Decision Gate |
| `docs/lifecycle_metrics.md` | Lifecycle Metrics |
| `docs/dependency_review.md` | Dependency Review |
| `docs/lifecycle_risk_classification.md` | Lifecycle Risk Classification |
| `docs/lifecycle_maintenance.md` | Lifecycle Maintenance（Phase11-1） |
| `docs/maintenance_lifecycle.md` | Maintenance Lifecycle |
| `docs/maintenance_types.md` | Maintenance Types |
| `docs/maintenance_frequency.md` | Maintenance Frequency |
| `docs/maintenance_trigger.md` | Maintenance Trigger |
| `docs/maintenance_scheduling_policy.md` | Maintenance Scheduling Policy |
| `docs/maintenance_planning.md` | Maintenance Planning |
| `docs/maintenance_window.md` | Maintenance Window |
| `docs/maintenance_review.md` | Maintenance Review |
| `docs/maintenance_approval_levels.md` | Maintenance Approval Levels |
| `docs/maintenance_readiness_checklist.md` | Maintenance Readiness Checklist |
| `docs/maintenance_dependency_coordination.md` | Maintenance Dependency Coordination |
| `docs/maintenance_execution.md` | Maintenance Execution |
| `docs/maintenance_verification.md` | Maintenance Verification |
| `docs/maintenance_success_criteria.md` | Maintenance Success Criteria |
| `docs/maintenance_decision_gate.md` | Maintenance Decision Gate |
| `docs/maintenance_classification.md` | Maintenance Classification |
| `docs/maintenance_exception_handling.md` | Maintenance Exception Handling |
| `docs/maintenance_metrics.md` | Maintenance Metrics |
| `docs/maintenance_record.md` | Maintenance Record |
| `docs/maintenance_traceability.md` | Maintenance Traceability |
| `docs/maintenance_risk.md` | Maintenance Risk |
| `docs/maintenance_knowledge.md` | Maintenance Knowledge |
| `docs/maintenance_boundary.md` | Maintenance Boundary |
| `docs/operational_health_management.md` | Operational Health Management（Phase11-2） |
| `docs/health_monitoring.md` | Health Monitoring |
| `docs/health_indicators.md` | Health Indicators |
| `docs/health_classification.md` | Health Classification |
| `docs/health_threshold.md` | Health Threshold |
| `docs/health_monitoring_frequency.md` | Health Monitoring Frequency |
| `docs/health_review.md` | Health Review |
| `docs/health_trend_analysis.md` | Health Trend Analysis |
| `docs/health_alert_management.md` | Health Alert Management |
| `docs/health_dashboard.md` | Health Dashboard |
| `docs/health_reporting.md` | Health Reporting |
| `docs/health_decision_gate.md` | Health Decision Gate |
| `docs/health_recovery_coordination.md` | Health Recovery Coordination |
| `docs/health_metrics.md` | Health Metrics |
| `docs/health_traceability.md` | Health Traceability |
| `docs/health_readiness.md` | Health Readiness |
| `docs/health_ownership.md` | Health Ownership |
| `docs/health_boundary.md` | Health Boundary |
| `docs/operational_incident_recovery.md` | Operational Incident & Recovery（Phase11-3） |
| `docs/incident_lifecycle.md` | Incident Lifecycle |
| `docs/incident_classification.md` | Incident Classification |
| `docs/incident_detection.md` | Incident Detection |
| `docs/escalation_policy.md` | Escalation Policy |
| `docs/recovery_management.md` | Recovery Management |
| `docs/recovery_verification.md` | Recovery Verification |
| `docs/recovery_readiness.md` | Recovery Readiness |
| `docs/recovery_decision_gate.md` | Recovery Decision Gate |
| `docs/incident_communication.md` | Incident Communication |
| `docs/incident_timeline.md` | Incident Timeline |
| `docs/root_cause_analysis.md` | Root Cause Analysis |
| `docs/post_incident_review.md` | Post Incident Review |
| `docs/incident_metrics.md` | Incident Metrics |
| `docs/incident_traceability.md` | Incident Traceability |
| `docs/incident_record.md` | Incident Record |
| `docs/incident_boundary.md` | Incident Boundary |
| `docs/operational_knowledge_evolution.md` | Operational Knowledge Evolution（Phase11-4） |
| `docs/knowledge_sources.md` | Knowledge Sources |
| `docs/knowledge_classification.md` | Knowledge Classification |
| `docs/knowledge_repository.md` | Knowledge Repository |
| `docs/knowledge_evolution.md` | Knowledge Evolution |
| `docs/knowledge_recommendation.md` | Knowledge Recommendation |
| `docs/knowledge_metrics.md` | Knowledge Metrics |
| `docs/knowledge_traceability.md` | Knowledge Traceability |
| `docs/knowledge_quality.md` | Knowledge Quality |
| `docs/knowledge_reuse.md` | Knowledge Reuse |
| `docs/knowledge_governance.md` | Knowledge Governance |
| `docs/knowledge_decision_gate.md` | Knowledge Decision Gate |
| `docs/knowledge_boundary.md` | Knowledge Boundary |
