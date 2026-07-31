# Operations Runbook（Phase6-2 … / Phase8-0 / Phase8-1 / Phase8-2 / Phase8-3）

関連仕様:

* Monitoring / Operations: `docs/specs/monitoring_operations_phase6_2.md`
* Incident Response: `docs/specs/incident_response_runbook_phase6_3_a.md`
* Observability Enhancement: `docs/specs/observability_enhancement_phase6_3_b.md`
* Operational Automation: `docs/specs/operational_automation_phase6_3_c.md`
* Operational Governance: `docs/specs/operational_governance_phase7_0.md`
* Reliability Management: `docs/specs/reliability_management_phase7_1.md`
* Security Operations: `docs/specs/security_operations_phase7_2.md`
* Advanced Automation: `docs/specs/advanced_automation_phase7_3.md`
* AI Operations Governance: `docs/specs/ai_operations_governance_phase8_0.md`
* AI Decision Support: `docs/specs/ai_decision_support_phase8_1.md`
* Knowledge Operations: `docs/specs/knowledge_operations_phase8_2.md`
* Intelligent Automation Support: `docs/specs/intelligent_automation_support_phase8_3.md`
* Deployment: `docs/deployment.md`（Phase6-1）
* Secrets: `docs/configuration_secrets.md`（Phase6-0）

障害対応の詳細手順: `docs/incident_response.md`  
記録テンプレート: `docs/incident_template.md`  
観測設計（Health Check / Metrics / Alert条件 / Dashboard要求）: `docs/observability.md`  
運用 Automation（定型）: `docs/automation.md`  
Advanced Automation（制約付き）: `docs/advanced_automation.md`  
Automation Policy: `docs/automation_policy.md`  
Automation Audit: `docs/automation_audit.md`  
Governance / 責務境界: `docs/governance.md`  
変更管理: `docs/change_management.md`  
リスク管理: `docs/risk_management.md`  
Reliability / SLI: `docs/reliability.md`  
SLO: `docs/slo.md`  
Reliability Review: `docs/review_process.md`  
Security Operations: `docs/security.md`  
Secrets Policy: `docs/secrets_policy.md`  
Dependency / Vulnerability: `docs/dependency_management.md`  
Audit Preparation: `docs/audit_preparation.md`  
AI Governance: `docs/ai_governance.md`  
AI Audit: `docs/ai_audit.md`  
AI Risk: `docs/ai_risk_management.md`  
AI Compliance: `docs/ai_compliance.md`  
AI Decision Support: `docs/ai_decision_support.md`  
AI Recommendation: `docs/ai_recommendation_policy.md`  
AI Validation: `docs/ai_validation.md`  
Knowledge Management: `docs/knowledge_management.md`  
Knowledge Source / Trust / Version: `docs/knowledge_source_policy.md` / `docs/knowledge_trust_level.md` / `docs/knowledge_versioning.md`  
Knowledge Validation / Lifecycle: `docs/knowledge_validation.md` / `docs/knowledge_lifecycle.md`  
Runbook Integration: `docs/runbook_integration.md`  
Intelligent Automation: `docs/intelligent_automation.md`  
Automation Workflow Policy: `docs/automation_workflow_policy.md`  
Automation Execution Audit: `docs/automation_execution_audit.md`  
Automation Improvement: `docs/automation_improvement.md`  
Operational Maturity Completion Report: `docs/reports/operational_maturity_completion_report.md`

---

## 1. 監視対象 Workflow

| Workflow | ファイル | 確認場所 |
|---|---|---|
| Test | `.github/workflows/test.yml`（Phase5-2） | Actions → Test |
| Release | `.github/workflows/release.yml` | Actions → Release |
| Deploy | `.github/workflows/deploy.yml` | Actions → Deploy |
| Maintenance | `.github/workflows/maintenance.yml`（Phase6-3-C） | Actions → Maintenance |
| Operations | `.github/workflows/operations.yml`（Phase6-3-C） | Actions → Operations |

確認項目:

* 最新 run の Success / Failure（Failure は隠蔽しない）
* 失敗ジョブ名・ステップ名・タイムスタンプ
* 対象 branch / tag / commit SHA
* production Deploy の Environment 承認状態

実行履歴は GitHub Actions の run 履歴として保持する（リポジトリ側で削除しない運用を推奨）。

正常 / 異常の定義・Metrics / Alert条件の詳細: `docs/observability.md`（Phase6-3-B）

---

## 2. ログ確認方法

### CI / Release / Deploy ログ

1. GitHub → Actions → 対象 Workflow → 失敗 run
2. 失敗 Job → 失敗 Step のログを開く
3. エラーメッセージ・終了コード・直前の成功ステップを記録する

### Application ログ

取得可能な範囲（ローカル実行・運用ホスト等）のみ確認する。  
取得できない場合は「未取得」と記録し、補正しない。

### Secrets 取り扱い

* ログ・通知・Incident記録に Secret 値を含めない
* 値の有無確認はキー名のみ記載する（例: `API_KEY missing`）
* 誤って露出した場合は Secret ローテーションを行い、Incident に「露出の有無」のみ記録する

### 保持方針

| 種別 | 保持 |
|---|---|
| GitHub Actions ログ | GitHub 既定保持に従う。重要 Incident は要約を docs / Issue に残す |
| Incident 記録 | `docs/incident_template.md` 形式で保管（任意の保管場所にコピー可） |
| Deploy 成果物 artifact | Workflow artifact 保持期間に従う |

---

## 3. 障害通知経路

| 事象 | 一次通知 | 確認先 |
|---|---|---|
| Workflow Failure | GitHub（Actions 失敗通知 / UI） | Actions run |
| Deploy Failure | 同上 + Environment 保護通知 | Deploy run |
| Configuration Error | Workflow 失敗ログ / 設定確認時 | `.env.example`・Environment Secrets |

要件:

* 障害発生を把握可能にする（通知オフにしない）
* 通知本文に Secrets を含めない
* 通知失敗を Success 扱いしない（再送・手動確認）

外部通知（Slack 等）は将来拡張。既存 Connector を通知用途へ流用しない。

---

## 4. デプロイ確認手順

1. Actions → Deploy の結果が Success であること
2. 入力の `environment` / `action` / `release_tag` が意図どおりであること
3. Workflow artifact `deploy-<env>-<tag>` が生成されていること
4. production の場合、Quality Gate（Test 成功）と Environment 承認が満たされていること
5. 詳細: `docs/deployment.md`

---

## 5. Incident 対応（概要）

障害検知後は必ず次の順で進める（手順の飛ばし・個人裁量の順序変更禁止）。

```text
通知受信 / Observability検知
 ↓
Workflow / Deploy状態確認
 ↓
ログ確認
 ↓
影響範囲確認
 ↓
復旧判断
 ↓
対応記録
```

観測項目・Alert条件: `docs/observability.md`  
詳細・Severity・Rollback 判断基準: `docs/incident_response.md`

---

## 6. Rollback 確認手順（実行は Phase6-1）

判断基準は Incident Response（Phase6-3-A）で定義する。  
**Rollback 操作自体は Deploy Workflow（Phase6-1）でのみ実行する。**

1. `docs/incident_response.md` の Rollback 判断基準で可否を判定する
2. 可の場合、Actions → Deploy を実行する
   - `action`: `rollback`
   - `release_tag`: 復帰先 tag（例: `v1.1.0`）
   - `environment`: 影響環境
3. 実行結果と復帰 tag を Incident に記録する

無条件 Rollback は禁止。

---

## 7. 禁止事項（運用）

* 自動復旧・自動 Rollback
* AI による障害判断の正式採用
* Secrets / Infrastructure / DB / デプロイ方式の場当たり変更
* `tools/secretary/` の緊急パッチを Runbook 代替にすること（コード変更は別プロセス）

## 8. Operational Automation 連携（Phase6-3-C）

* 手順詳細: `docs/automation.md`
* 定期確認: Actions → Maintenance（Daily Report artifact）
* 障害時の状態収集・チェックリスト: Actions → Operations（`runbook_assist`）
* Automation は情報提供のみ。Severity / Rollback 判断は人間、Rollback 実行は Deploy

## 9. Governance 連携（Phase7-0）

* 運用責務・境界: `docs/governance.md`
* 運用変更（ルール / Workflow 設定文書等）は `docs/change_management.md` の承認フロー必須
* リスク等級・受容: `docs/risk_management.md`
* 未承認変更・境界逸脱は差し戻し（成功扱いしない）

## 10. Reliability 連携（Phase7-1）

* SLI / Trend / 改善サイクル: `docs/reliability.md`
* SLO 方針（目標値は未固定）: `docs/slo.md`
* Monthly Review: `docs/review_process.md`
* 観測データは `observability.md` / Daily Report / Incident 記録を利用（収集基盤は追加しない）

## 11. Security 連携（Phase7-2）

* Security 責務・Review・Incident 境界: `docs/security.md`
* Secrets Policy（Phase6-0 継承）: `docs/secrets_policy.md`
* Dependency / Vulnerability: `docs/dependency_management.md`
* Audit Preparation: `docs/audit_preparation.md`
* Security 関連変更は Change Management 必須。Secret 値はログ・記録に含めない

## 12. Advanced Automation 連携（Phase7-3）

* Framework: `docs/advanced_automation.md`（Policy → Risk → Approval → Execution → Audit）
* Policy / Approval: `docs/automation_policy.md`
* Audit Trail: `docs/automation_audit.md`
* Phase6-3-C 定型 Automation は情報収集。制約付き実行・変更適用は Advanced Automation ゲート必須
* 無承認 Automation・High Risk 自動実行・AI 最終判断は禁止

## 13. AI Operations Governance 連携（Phase8-0）

* AI 利用ルール・Human-in-the-loop: `docs/ai_governance.md`
* AI Audit（AIA-）: `docs/ai_audit.md`（Automation Audit AA- と相互参照）
* AI Risk: `docs/ai_risk_management.md`（Phase7-0 Risk に接続）
* AI Compliance 境界: `docs/ai_compliance.md`
* AI は Analysis / Suggestion のみ。Decision / Approval は人間、Execution は承認後 Automation

## 14. AI Decision Support 連携（Phase8-1）

* 分析・候補・Review 接続: `docs/ai_decision_support.md`
* 候補提示・Confidence: `docs/ai_recommendation_policy.md`
* Evidence Validation: `docs/ai_validation.md`
* フロー: Input → Analysis → Candidates → Evidence → Human Review → Decision →（CHG → AA-）
* Validation / Review なしの採用、Confidence のみでの自動実行は禁止

## 15. Knowledge Operations 連携（Phase8-2）

* Knowledge 管理ハブ: `docs/knowledge_management.md`
* Source / Trust / Version: `docs/knowledge_source_policy.md`, `docs/knowledge_trust_level.md`, `docs/knowledge_versioning.md`
* Validation / Lifecycle: `docs/knowledge_validation.md`, `docs/knowledge_lifecycle.md`
* Runbook 接続: `docs/runbook_integration.md`（Incident → Search → Official Runbook → Human Review → Action）
* AI 参照は Official / Validated のみ確定根拠可。Draft 不可。Historical は参考のみ
* Knowledge 正式更新は Human + Change Management（AI 自動更新禁止）

## 16. Intelligent Automation Support 連携（Phase8-3）

* 統合方針: `docs/intelligent_automation.md`
* Workflow Policy: `docs/automation_workflow_policy.md`（Recommendation → Validation → Policy → Risk → Approval → Execution）
* Execution Trace: `docs/automation_execution_audit.md`
* Improvement Loop: `docs/automation_improvement.md`（改善は CHG、AI の Policy 変更禁止）
* 実行本体は Phase7-3。AI は Suggestion のみ。Human Approval 必須

## 17. Research Governance 連携（Phase9-0）

* Research Governance: `docs/research_governance.md`（Research ≠ Production / Human Approval）
* Research Validation: `docs/research_validation.md`（Validation Flow）
* Research Artifact Management: `docs/research_artifact_management.md`（Artifact メタデータ / Traceability）
* Research Transition: `docs/research_transition.md`（Exit Criteria / Future Adoption=Phase10候補）

## 18. AI Agent Collaboration Research 連携（Phase9-1）

* AI Agent Collaboration: `docs/ai_agent_collaboration.md`
* Agent Responsibility Model: `docs/agent_responsibility_model.md`
* Agent Collaboration Patterns: `docs/agent_collaboration_patterns.md`
* Agent Boundary: `docs/agent_boundary.md`
* Agent Research Validation: `docs/agent_research_validation.md`
* Agent Risk Management: `docs/agent_risk_management.md`
* Agent Artifact Management: `docs/agent_artifact_management.md`
* Agent Transition: `docs/agent_transition.md`

## 19. Policy as Code Research 連携（Phase9-2）

* Policy as Code Research: `docs/policy_as_code_research.md`（Research Policy never controls Production）
* Policy Model / Representation: `docs/policy_model.md` / `docs/policy_representation.md`
* Validation / Version / Testing: `docs/policy_validation.md` / `docs/policy_version_management.md` / `docs/policy_testing.md`
* Lifecycle / Conflict / Compliance: `docs/policy_lifecycle.md` / `docs/policy_conflict_resolution.md` / `docs/policy_compliance.md`
* Transition: `docs/policy_transition.md`（Phase9-3 / Phase10 候補）

## 19b. Autonomous Operations Research 連携（Phase9-3）

* Autonomous Operations Research: `docs/autonomous_operations_research.md`（Research Autonomous ≠ Production Autonomous / Human Always Wins）
* 仕様: `docs/specs/autonomous_operations_research_phase9_3.md`

## 20. Predictive AIOps Research 連携（Phase9-4）

* Predictive AIOps Research: `docs/predictive_aiops_research.md`（Production で予測結果を直接利用しない）
* Model / Sources: `docs/prediction_model.md` / `docs/prediction_sources.md`
* Validation / Confidence / Drift: `docs/prediction_validation.md` / `docs/prediction_confidence.md` / `docs/prediction_drift.md`
* Lifecycle / Explainability / Consumption: `docs/prediction_lifecycle.md` / `docs/prediction_explainability.md` / `docs/prediction_consumption_boundary.md`
* Transition: `docs/prediction_transition.md`（Future Adoption=Phase10）

## 21. Research Completion Report（Phase9）

* Phase9 Advanced Research Completion Report: `docs/reports/research_completion_report.md`（Phase9-0〜9-4 / Integration Review PASS / Phase10 Transition）

## 22. Production Adoption Governance 連携（Phase10-0）

* Production Adoption Governance: `docs/production_adoption_governance.md`（Validated → Candidate → Adoption Review → Production）
* Lifecycle / Review / Audit / Trace: `docs/adoption_lifecycle.md` / `docs/adoption_review.md` / `docs/adoption_audit.md` / `docs/adoption_traceability.md`
* Deployment / Post-Adoption / Exit: `docs/adoption_deployment_strategy.md` / `docs/post_adoption_review.md` / `docs/adoption_exit_criteria.md`
* 採用後運用は Monitoring / Operational Review / Continuous Improvement に接続。Rollback は Human Approval 必須

## 23. Controlled Production Adoption 連携（Phase10-1）

* Controlled Production Adoption: `docs/controlled_production_adoption.md`（Approved Candidate → Controlled Rollout → GA → Stabilization）
* Planning / Window / Strategy: `docs/deployment_planning.md` / `docs/change_window_management.md` / `docs/deployment_strategy.md`
* Review / Checklist / Rollout / Acceptance: `docs/pre_deployment_review.md` / `docs/adoption_readiness_checklist.md` / `docs/controlled_rollout.md` / `docs/operational_acceptance.md`
* Monitoring / Rollback / Trace / Stabilization / Record: `docs/adoption_monitoring.md` / `docs/rollback_execution.md` / `docs/deployment_traceability.md` / `docs/production_stabilization.md` / `docs/production_record.md`
* 導入後運用は Continuous Monitoring / Operational Review に接続。Rollback は Human Approval 必須

## 24. Operational Validation 連携（Phase10-2）

* Operational Validation: `docs/operational_validation.md`（Validation does not modify Production automatically）
* KPI / Reliability / Performance / Security: `docs/validation_kpi.md` / `docs/validation_reliability.md` / `docs/validation_performance.md` / `docs/validation_security.md`
* AI / Automation / Drift: `docs/validation_ai_capability.md` / `docs/validation_automation.md` / `docs/validation_drift_detection.md`
* Frequency / Decision Gate / Knowledge Feedback / Trace / Maturity: `docs/validation_frequency.md` / `docs/validation_decision_gate.md` / `docs/operational_knowledge_feedback.md` / `docs/validation_traceability.md` / `docs/validation_maturity.md`
* Rollback Recommendation は Human Approval 必須。Phase10-3 Feedback Integration へ接続

## 25. Operational Feedback Integration 連携（Phase10-3）

* Operational Feedback Integration: `docs/operational_feedback_integration.md`（Feedback does not directly modify Production）
* Lifecycle / Sources / Classification / Priority: `docs/feedback_lifecycle.md` / `docs/feedback_sources.md` / `docs/feedback_classification.md` / `docs/feedback_priority.md`
* Lessons / Knowledge / Improvement: `docs/lessons_learned.md` / `docs/knowledge_integration.md` / `docs/improvement_management.md` / `docs/improvement_decision_gate.md`
* Continuous / Trace / Maturity / Research Interface: `docs/continuous_improvement.md` / `docs/feedback_traceability.md` / `docs/operational_maturity.md` / `docs/research_feedback_interface.md`
* Improvement Decision は Human Approval 必須。Phase10-4 Future Operational Optimization へ接続

## 26. Future Operational Optimization 連携（Phase10-4）

* Future Operational Optimization: `docs/future_operational_optimization.md`（Optimization does not mean Autonomous Change）
* Lifecycle / Candidate / Review / Metrics: `docs/optimization_lifecycle.md` / `docs/optimization_candidate_management.md` / `docs/optimization_review.md` / `docs/optimization_metrics.md`
* Prioritization / Decision Gate / Risk: `docs/optimization_prioritization.md` / `docs/optimization_decision_gate.md` / `docs/optimization_risk_management.md`
* Capability / Excellence / Knowledge / Trace / Research: `docs/future_capability_planning.md` / `docs/operational_excellence_model.md` / `docs/optimization_knowledge_feedback.md` / `docs/optimization_traceability.md` / `docs/phase9_research_interface.md`
* Optimization Approval は Human 必須。Future Implementation は Phase10-0/10-1 または Phase9 Research へ接続

## 27. Production Adoption Completion Report（Phase10）

* Phase10 Production Adoption Completion Report: `docs/reports/production_adoption_completion_report.md`（Phase10-0〜10-4 / Integration Review PASS / Completed）

## 28. Operational Lifecycle Governance 連携（Phase11-0）

* Operational Lifecycle Governance: `docs/operational_lifecycle_governance.md`（Lifecycle decisions require Human Approval）
* Model / States / Trigger / Review / Ownership: `docs/lifecycle_model.md` / `docs/lifecycle_states.md` / `docs/lifecycle_trigger.md` / `docs/lifecycle_review.md` / `docs/lifecycle_ownership.md`
* Version / Deprecation / Retirement / Archive: `docs/version_governance.md` / `docs/deprecation_governance.md` / `docs/retirement_governance.md` / `docs/archive_governance.md`
* Audit / Trace / Maturity / EOL / Decision Gate: `docs/lifecycle_audit.md` / `docs/lifecycle_traceability.md` / `docs/lifecycle_maturity.md` / `docs/end_of_life_policy.md` / `docs/lifecycle_decision_gate.md`
* Metrics / Dependency / Risk: `docs/lifecycle_metrics.md` / `docs/dependency_review.md` / `docs/lifecycle_risk_classification.md`
* Lifecycle Decision は Human 必須。Production 自動変更は禁止。Phase11-1 Lifecycle Maintenance へのインターフェースを維持

## 29. Lifecycle Maintenance 連携（Phase11-1）

* Lifecycle Maintenance: `docs/lifecycle_maintenance.md`（Maintenance preserves operational stability / Human Approval）
* Lifecycle / Types / Frequency / Trigger / Scheduling: `docs/maintenance_lifecycle.md` / `docs/maintenance_types.md` / `docs/maintenance_frequency.md` / `docs/maintenance_trigger.md` / `docs/maintenance_scheduling_policy.md`
* Planning / Window / Review / Approval / Readiness / Dependency: `docs/maintenance_planning.md` / `docs/maintenance_window.md` / `docs/maintenance_review.md` / `docs/maintenance_approval_levels.md` / `docs/maintenance_readiness_checklist.md` / `docs/maintenance_dependency_coordination.md`
* Execution / Verification / Success / Decision Gate / Classification / Exception: `docs/maintenance_execution.md` / `docs/maintenance_verification.md` / `docs/maintenance_success_criteria.md` / `docs/maintenance_decision_gate.md` / `docs/maintenance_classification.md` / `docs/maintenance_exception_handling.md`
* Metrics / Record / Trace / Risk / Knowledge / Boundary: `docs/maintenance_metrics.md` / `docs/maintenance_record.md` / `docs/maintenance_traceability.md` / `docs/maintenance_risk.md` / `docs/maintenance_knowledge.md` / `docs/maintenance_boundary.md`
* Maintenance は維持であり改善ではない。AI は Analysis / Recommendation のみ。Automation は Approved Procedure のみ。Phase11-2 Operational Health Management へのインターフェースを維持

## 30. Operational Health Management 連携（Phase11-2）

* Operational Health Management: `docs/operational_health_management.md`（Health monitoring never changes production automatically）
* Monitoring / Indicators / Classification / Threshold / Frequency: `docs/health_monitoring.md` / `docs/health_indicators.md` / `docs/health_classification.md` / `docs/health_threshold.md` / `docs/health_monitoring_frequency.md`
* Review / Trend / Alert / Dashboard / Reporting: `docs/health_review.md` / `docs/health_trend_analysis.md` / `docs/health_alert_management.md` / `docs/health_dashboard.md` / `docs/health_reporting.md`
* Decision Gate / Recovery Coordination / Metrics / Trace / Readiness / Ownership / Boundary: `docs/health_decision_gate.md` / `docs/health_recovery_coordination.md` / `docs/health_metrics.md` / `docs/health_traceability.md` / `docs/health_readiness.md` / `docs/health_ownership.md` / `docs/health_boundary.md`
* Health Classification（運用状態）と Alert Level（通知緊急度）を分離。Health Metrics は Assessment / Decision Gate の評価根拠。Recovery は調整のみで実行しない。Phase11-3 Operational Incident & Recovery へのインターフェースを維持

## 31. Operational Incident & Recovery 連携（Phase11-3）

* Operational Incident & Recovery: `docs/operational_incident_recovery.md`（Recovery decisions require human approval）
* Lifecycle / Classification / Detection / Response / Escalation: `docs/incident_lifecycle.md` / `docs/incident_classification.md` / `docs/incident_detection.md` / `docs/incident_response.md` / `docs/escalation_policy.md`
* Recovery / Verification / Readiness / Decision Gate: `docs/recovery_management.md` / `docs/recovery_verification.md` / `docs/recovery_readiness.md` / `docs/recovery_decision_gate.md`
* Communication / Timeline / RCA / Post Review / Lessons: `docs/incident_communication.md` / `docs/incident_timeline.md` / `docs/root_cause_analysis.md` / `docs/post_incident_review.md` / `docs/lessons_learned.md`
* Metrics / Trace / Record / Boundary: `docs/incident_metrics.md` / `docs/incident_traceability.md` / `docs/incident_record.md` / `docs/incident_boundary.md`
* Incident Classification（重大度）≠ Health Classification（運用状態）。Recovery（障害復旧）≠ Maintenance（定常保守）。Lessons Learned → Lifecycle Governance。Phase11-4 Operational Knowledge Evolution へのインターフェースを維持

## 32. Operational Knowledge Evolution 連携（Phase11-4）

* Operational Knowledge Evolution: `docs/operational_knowledge_evolution.md`（Knowledge never changes production automatically）
* Lifecycle / Sources / Classification / Validation / Repository: `docs/knowledge_lifecycle.md` / `docs/knowledge_sources.md` / `docs/knowledge_classification.md` / `docs/knowledge_validation.md` / `docs/knowledge_repository.md`
* Evolution / Recommendation / Metrics / Trace / Quality: `docs/knowledge_evolution.md` / `docs/knowledge_recommendation.md` / `docs/knowledge_metrics.md` / `docs/knowledge_traceability.md` / `docs/knowledge_quality.md`
* Reuse / Governance / Decision Gate / Boundary: `docs/knowledge_reuse.md` / `docs/knowledge_governance.md` / `docs/knowledge_decision_gate.md` / `docs/knowledge_boundary.md`
* Lessons Learned → Knowledge → Repository → Reuse → Lifecycle Governance（Next Cycle）。AI は Recommendation のみ。Publication は Human Approval 必須

## 33. Operational Lifecycle Completion Report（Phase11）

* Phase11 Documentation Architecture Completion Report: `docs/reports/operational_lifecycle_completion_report.md`（Version 2.0 / Approved / Integrity Verified / Self Review Evidence / Production Impact なし）

## 34. Document Ownership Policy

* Document Ownership Policy: `docs/document_ownership_policy.md`（Version 1.1 / Approved / Primary SoT・Secondary Reference・Additive Section）
* 共有文書例: `incident_response.md`（Primary Phase6）/ `lessons_learned.md`（Primary Phase10）/ `knowledge_lifecycle.md`・`knowledge_validation.md`（Primary Phase8）
* Primary の構造・定義変更は Primary 所有フェーズのみ。Additive は Primary を上書きしない

## 35. Decision Gate Catalog

* Decision Gate Catalog: `docs/decision_gate_catalog.md`（Version 1.1 / Approved / Phase10〜Phase11）
* Gate: Adoption / Lifecycle / Maintenance / Health / Recovery / Knowledge
* 原則: Human Approval 必須。AI は recommend only。Automation は evidence 収集のみ。自律 Production 変更を防止
* 詳細ラベルの正本は各 `*_decision_gate.md`（Catalog は横断索引）

## 36. Framework Navigation

* Framework Navigation: `docs/framework_navigation.md`（Version 1.1 / Approved）
* 正方向: Research → Adoption → Production → Lifecycle → Maintenance → Health → Incident → Knowledge → Lifecycle
* 逆リンク: Research → Future Adoption（Phase10）/ Adopted → Lifecycle（Phase11-0）
* Research Hub: `research_governance.md` / Adoption Hub: `production_adoption_governance.md` / Lifecycle Hub: `operational_lifecycle_governance.md`

## 37. Phase1 Documentation Positioning

* Phase1 Documentation Positioning: `docs/phase1_documentation_positioning.md`（Version 1.1 / Approved）
* Phase1 = Foundation / Conceptual Origin（Pre-Spec Domain）
* Phase1 専用 Spec は意図的に置かない（Spec は Phase2 Requirements から開始）
* Foundation Docs のみ。Production / Governance / Operational Docs の直接対象外

## 38. Architecture Decision Record（ADR）

* Architecture Decision Record: `docs/architecture_decision_record.md`（Version 1.1 / Approved）
* 主要判断: Phase1 Foundation / Spec開始Phase2 / Ownership / Decision Gate / 逆リンク / Phase11閉ループ / Human Approval / Production Boundary / Knowledge∈Lifecycle
* ADR は設計判断の正本。関連方針: `document_ownership_policy.md` / `decision_gate_catalog.md` / `framework_navigation.md` / `phase1_documentation_positioning.md`

## 39. Boundary Catalog

* Boundary Catalog: `docs/boundary_catalog.md`（Version 1.1 / Approved）
* 5層: Human / AI / Automation / Production / Documentation
* Phase・Lifecycle・Version Boundary を横断索引
* Phase 固有詳細: `maintenance_boundary.md` / `health_boundary.md` / `incident_boundary.md` / `knowledge_boundary.md`
* ADR #8/#9 と整合。AI は決定・Production変更・Version決定を行わない

## 40. Documentation Style Guide

* Documentation Style Guide: `docs/documentation_style_guide.md`（Version 1.1 / Approved）
* カテゴリ: Foundation / Spec / Governance / Operational / ADR
* Front Matter・Status Values・Naming・Versioning・Link Rules を統一
* Boundary Catalog / Ownership / Gate / ADR と整合。AI は Version 決定を行わない

## 41. Documentation Review Process

* Documentation Review Process: `docs/documentation_review_process.md`（Version 1.1 / Approved）
* Lifecycle: Contributor（任意）→ Draft → Review → Human Approval → Repository → Deprecated → Archived
* Roles: Contributor / Primary Owner / Reviewer / Approver（AI は承認しない）
* Style Guide / Boundary / Ownership / Gate / ADR と整合する文書運用の正本

## 42. Glossary

* Glossary: `docs/glossary.md`（Version 1.1 / Approved）
* 用語カテゴリ: Boundary / Governance / Lifecycle / Specification / Architecture
* Evidence / Traceability を正式定義。Status Values・Ownership・Gate・Lifecycle 語彙を統一
* Style Guide / Boundary / Ownership / Gate / ADR / Review Process / Navigation と整合

## 43. Documentation Review Checklist

* Documentation Review Checklist: `docs/documentation_review_checklist.md`（Version 1.0 / Approved）
* Reviewer 標準確認: Front Matter / Style / Boundary / Ownership / Gate / ADR / Version / Evidence / Traceability / Repository
* Extended: Phase固有Boundary / Lifecycle / Operational Flow / Monitoring / Incident・Maintenance
* Human Approval 前の品質保証。Review Process と併用

## 44. Documentation Index

* Documentation Index: `docs/documentation_index.md`（Version 1.1 / Approved）
* Foundation / Architecture Governance / Documentation Governance / Operational・Lifecycle / Navigation を索引化
* Spec・Operational 子文書は Additive で Hub 導線（`docs/specs/` / Phase9〜11 Hubs）
* 新規登録・Status/Owner/Category/Phase 変更時に Index 更新必須

## 45. Template Library

* Template Library: `docs/template_library.md`（Version 1.1 / Approved）
* テンプレート: Spec / ADR / Governance / Report
* Style Guide / Review Process / Checklist / Glossary / Boundary / Ownership / Gate / ADR と整合
* 新規文書作成時は本 Library を起点とし、Review Checklist で確認する

## 46. Governance Self Review

* Governance Self Review: `docs/governance_self_review.md`（Version 1.1 / Approved）
* Documentation Architecture 監査。Integrity Verified。指摘（Minor）なし
* 対象: Foundation / Architecture Governance / Documentation Governance / Navigation / Operational・Lifecycle
* Production Impact: なし。自走可能な文書体系を確認

## 47. Governance Maintenance Plan

* Governance Maintenance Plan: `docs/governance_maintenance_plan.md`（Version 1.1 / Approved Candidate）
* 3層: Routine Review（Monthly）/ Change Review（Event-driven）/ Self Review（Quarterly）
* Index 正本更新ルール・Phase10→11 接続確認・Production Adoption Readiness を定義
* Checklist を監査基準として再利用（二重化しない）。Human Approval 後に Approved へ昇格可能

## 48. Monthly Governance Review（2026-07）

* Monthly Governance Review: `docs/reports/monthly_governance_review_202607.md`（Version 1.0 / Approved Candidate）
* Routine Review（Monthly）初回実施。Checklist 全項目 PASS。Documentation Governance: Healthy
* Actions: なし。次回: 2026-08。Production Impact: なし

## 49. Documentation Architecture Production Adoption Readiness

* Production Adoption Readiness Report: `docs/reports/documentation_architecture_production_adoption_readiness.md`（Version 1.0 / Approved Candidate）
* 判定: **Production Adoption Ready**。Readiness Checklist 全項目 PASS
* Evidence: Self Review / Completion Report 2.0 / Maintenance Plan / Monthly Review 2026-07
* Production Impact: なし（Documentation Architecture 適格性。Runtime 変更なし）

## 50. Phase10 → Phase11 Connection Validation

* Connection Validation Report: `docs/reports/phase10_phase11_connection_validation.md`（Version 1.1 / Approved Candidate）
* 判定: **Connection Valid** / Documentation Architecture Lifecycle: **Closed**
* Checklist 全項目 PASS。Adoption → Lifecycle 逆リンクと整合
* Production Impact: なし

## 51. Phase12 Auto Scribe AI（Architecture Baseline）

* Spec: `docs/specs/auto_scribe_ai_architecture_phase12.md`（Version 2.0）
* Baseline ID: **ASA-ARCH-2.0**（Design Baseline / Design Freeze）
* Event Layer Architecture ID: **ASA-ARCH-12.0**（`docs/baselines/ASA-ARCH-12.0.md` ≡ ASA-ARCH-2.0）
* Registry: `docs/baselines/ASA-ARCH-2.0.md` / Index: `docs/baselines/README.md`
* Supersedes: ASA-ARCH-1.3（履歴: `docs/baselines/ASA-ARCH-1.3.md`）
* Next: —（REC / API / STOR / CAP / SRCH / EXP Registered）
* Approved: Pending Human Approval。Runtime 実装は本 Baseline を基準とする

### Phase12 Implementation Specifications

* **ASA-IMPL-REC-1.1** Record JSON Schema: `docs/specs/auto_scribe_ai_record_json_schema.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Supersedes: ASA-IMPL-REC-1.0 / CR: ASA-CR-REC-001）
* **ASA-IMPL-API-1.0** Runtime API Specification: `docs/specs/auto_scribe_ai_runtime_api_specification.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Depends On: ASA-IMPL-REC-1.1）
* **ASA-IMPL-STOR-1.0** Storage Specification: `docs/specs/auto_scribe_ai_storage_specification.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0）
* **ASA-IMPL-CAP-1.0** Auto Capture Rule Specification: `docs/specs/auto_scribe_ai_auto_capture_rule_specification.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0）
* **ASA-IMPL-SRCH-1.0** Search Specification: `docs/specs/auto_scribe_ai_search_specification.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0）
* **ASA-IMPL-EXP-1.0** Export Specification: `docs/specs/auto_scribe_ai_export_specification.md`（Ready for Coding / Parent: ASA-ARCH-2.0 / Depends On: ASA-IMPL-REC-1.1, ASA-IMPL-API-1.0, ASA-IMPL-STOR-1.0, ASA-IMPL-SRCH-1.0, ASA-IMPL-CAP-1.0）
* Pending: —

## 52. Phase13 Knowledge Memory Architecture（Architecture Baseline）

* Baseline ID: **ASA-ARCH-13.0**（Knowledge Layer / Registered — Ready for Implementation）
* Registry: `docs/baselines/ASA-ARCH-13.0.md` / Index: `docs/baselines/README.md`
* Parent Baseline: **ASA-ARCH-12.0**（Event Layer; ≡ ASA-ARCH-2.0）
* Scope: DEC / IMP / REV / DSEARCH / RecordRef / DKM Principles
* Next: —（Phase13 child specs Registered）
* Child Traceability Baseline: **ASA-ARCH-14.0**
* Child Trace Intelligence Baseline: **ASA-ARCH-15.0**

### Phase13 Implementation Specifications

* **ASA-IMPL-DEC-1.0** Decision Memory: `docs/specs/auto_scribe_ai_decision_memory_specification.md`（Ready for Coding / Parent: ASA-ARCH-13.0）
* **ASA-IMPL-IMP-1.0** Implementation Memory: `docs/specs/auto_scribe_ai_implementation_memory_specification.md`（Ready for Coding / Parent: ASA-ARCH-13.0）
* **ASA-IMPL-REV-1.0** Revert Memory: `docs/specs/auto_scribe_ai_revert_memory_specification.md`（Ready for Coding / Parent: ASA-ARCH-13.0 / CR: ASA-CR-REV-001）
* **ASA-IMPL-DSEARCH-1.0** Deep Search: `docs/specs/auto_scribe_ai_deep_search_specification.md`（Ready for Coding / Parent: ASA-ARCH-13.0 / CR: ASA-CR-DSEARCH-001）

## 53. Phase14 Traceability Layer Architecture（Architecture Baseline）

* Baseline ID: **ASA-ARCH-14.0**（Traceability Layer / Registered — Ready for Implementation）
* Registry: `docs/baselines/ASA-ARCH-14.0.md` / Index: `docs/baselines/README.md`
* Parent Baseline: **ASA-ARCH-13.0**（Knowledge Layer）
* Scope: TRACE（abstract） / COMMIT / PR / ISSUE / RELEASE / TraceSourceType / TTP Principles
* Traceability Flow SoT: DEC → ISSUE → COMMIT → PR → RELEASE（ASA-ARCH-14.0 §7.3）
* Child specs: TRACE / COMMIT / PR / ISSUE / RELEASE — Registered（RELEASE Implemented）

### Phase14 Implementation Specifications

* **ASA-IMPL-TRACE-1.0** Traceability（Base Trace）: `docs/specs/auto_scribe_ai_traceability_specification.md`（Ready for Coding / Parent: ASA-ARCH-14.0）
* **ASA-IMPL-COMMIT-1.0** Commit: `docs/specs/auto_scribe_ai_commit_implementation_specification.md`（Ready for Coding / Parent: ASA-ARCH-14.0 / Derived From: ASA-IMPL-TRACE-1.0 / CR: ASA-CR-COMMIT-001）
* **ASA-IMPL-PR-1.0** Pull Request: `docs/specs/auto_scribe_ai_pr_implementation_specification.md`（Implemented / Parent: ASA-ARCH-14.0 / CR: ASA-CR-PR-001 / ASA-CR-PR-002 / ASA-CR-PR-STORE-001）
* **ASA-IMPL-ISSUE-1.0** Issue: `docs/specs/auto_scribe_ai_issue_implementation_specification.md`（Implemented / Parent: ASA-ARCH-14.0 / CR: ASA-CR-ISSUE-001 / REQ: ASA-IMPL-REQ-ISSUE-001）
* **ASA-IMPL-RELEASE-1.0** Release: `docs/specs/auto_scribe_ai_release_implementation_specification.md`（Implemented / Parent: ASA-ARCH-14.0 / CHK: ASA-CHK-REL-001 PASS / REQ: ASA-IMPL-REQ-RELEASE-001）
* Persistence: TRACE（abstract）+ COMMIT / PR / ISSUE / RELEASE Stores（5-Store symmetry / ASA-CR-PR-STORE-001）

## 54. Phase15 Trace Intelligence Layer Architecture（Architecture Baseline）

* Baseline ID: **ASA-ARCH-15.0**（Trace Intelligence Layer / Registered — Architecture Baseline / Final v9）
* Registry: `docs/baselines/ASA-ARCH-15.0.md`
* Alias: `docs/architecture/asa_arch_15_trace_intelligence_layer.md`
* Parent: **ASA-ARCH-14.0**（Traceability Layer）
* Components: Trace Query Layer / Trace Graph Engine / Trace Consistency Checker / Repository Facade API
* Drafts v1–v8: Superseded
* Next: **ASA-IMPL-REQ-TRACE-QUERY-001**（Query Layer）
* Implementation order: Query → Graph → Checker → Facade
