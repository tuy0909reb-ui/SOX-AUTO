# Research Governance（Phase9-0）

仕様: `docs/specs/research_governance_phase9_0.md`

本ドキュメントは、研究活動を安全かつ統制された形で実施するための運用文書である。
研究は本番環境から隔離し、本番を直接変更しない（`Research ≠ Production`）。

---

## 1. Research Principles

Phase9では以下を基本原則とする。

1. Research is isolated from Production.
2. Research never modifies Production.
3. Research must be evidence-driven.
4. Human Approval is mandatory.
5. Validated Research may become Future Adoption.

---

## 2. Research Scope

## 研究対象

* 次世代AIOps
* AI Agent
* Policy as Code
* 自律運用候補
* 予測モデル
* 新しい運用方式
* 新しいガバナンス方式

## 対象外

* 本番変更
* 本番データ操作
* 本番ポリシー改変
* 本番自律運用導入
* 本番AI権限拡張

原則:

```text
Research ≠ Production
```

---

## 3. Research Classification

研究の成熟度を統一基準で管理する。

```text
Concept
    ↓
PoC
    ↓
Pilot
    ↓
Candidate
```

## Concept

* アイデア段階
* 実装前
* 技術調査

## PoC

* 仮説検証
* Sandbox環境
* 実現可能性確認

## Pilot

* 限定環境評価
* 運用適合性確認
* リスク評価

## Candidate

* 正式採用候補
* Future Adoption対象
* Phase10候補

要件:

* ClassificationをResearch Auditへ記録する
* Classification変更はValidation結果に基づく
* Human Reviewを必須とする

---

## 4. Experiment Governance

管理対象:

* PoC開始条件
* 仮説・目的・評価指標
* Sandbox / Staging利用
* 本番データ利用禁止
* 実験ログ
* PoC終了条件

原則:

```text
Experiment is isolated from Production.
```

---

## 5. Research Risk Management

管理対象:

* 本番環境への影響
* 誤作動
* 過剰自律性
* 誤予測
* ガバナンス逸脱
* データ漏洩
* Agent境界逸脱

原則:

* 研究は本番環境から隔離する
* Agentは本番権限を持たない
* 自律運用は研究段階に限定する

---

## 6. Research Audit（記録要件）

記録対象:

* PoC開始理由
* 実験内容
* 評価結果
* リスク評価
* Decision Record
* 採用・不採用理由
* 将来フェーズへの推薦理由
* Classification履歴

目的:

* 研究の透明性
* 意思決定の説明責任
* 将来フェーズへの引き継ぎ

---

## 7. Phase 接続（Research ≠ Production）

* Phase7-0 Operational Governance: 変更管理・リスク受容・承認統制に接続
* Phase8-0 AI Operations Governance: AI出力利用は統制方針に従い、Productionを直接変更しない
* Phase8-1 / Phase8-2: AI分析・Evidence/Knowledge参照を「研究の入力」として利用し得るが、採用判断（昇格）は Human Approval を経る

Research Governance は、本番運用を変更することを目的としない。

---

## 8. Phase9-1 への接続

Phase9-1（AI Agent Collaboration Research）は、本フェーズの原則（`Research ≠ Production`、Human Approval必須、Evidence-driven、研究隔離）を前提として、
Agent責務分離・協調方式・境界・安全性・リスク評価の研究を進める。

関連文書:

* `docs/ai_agent_collaboration.md`
* `docs/agent_responsibility_model.md`
* `docs/agent_collaboration_patterns.md`
* `docs/agent_boundary.md`
* `docs/agent_research_validation.md`
* `docs/agent_risk_management.md`
* `docs/agent_artifact_management.md`
* `docs/agent_transition.md`

---

## 9. Phase9-2 への接続

Phase9-2（Policy as Code Research）は、本フェーズの原則（`Research ≠ Production`、Human Approval必須、Evidence-driven、研究隔離）を前提として、
Policy の宣言的表現・Validation・Version/Lifecycle・Conflict・Compliance を研究する。  
`Research Policy never controls Production.`

関連文書:

* `docs/policy_as_code_research.md`
* `docs/policy_model.md`
* `docs/policy_representation.md`
* `docs/policy_validation.md`
* `docs/policy_version_management.md`
* `docs/policy_testing.md`
* `docs/policy_lifecycle.md`
* `docs/policy_conflict_resolution.md`
* `docs/policy_compliance.md`
* `docs/policy_transition.md`

---

## 10. Phase9-4 への接続

Phase9-4（Predictive AIOps Research）は、本フェーズの原則（`Research ≠ Production`、Human Approval必須、Evidence-driven、研究隔離）を前提として、
予測モデル・予兆検知・Drift・Lifecycle を研究する。  
**Production で予測結果を直接利用しない。**

関連文書:

* `docs/predictive_aiops_research.md`
* `docs/prediction_model.md`
* `docs/prediction_sources.md`
* `docs/prediction_validation.md`
* `docs/prediction_confidence.md`
* `docs/prediction_drift.md`
* `docs/prediction_lifecycle.md`
* `docs/prediction_explainability.md`
* `docs/prediction_consumption_boundary.md`
* `docs/prediction_transition.md`

---

## 11. Phase10-0 への接続

Research 成果（Validated / Candidate）は Phase10-0 Adoption Review へ移行する。

```text
Validated
    ↓
Candidate
    ↓
Adoption Review
```

関連文書:

* `docs/production_adoption_governance.md`
* `docs/adoption_lifecycle.md`
* `docs/adoption_review.md`
* `docs/adoption_traceability.md`

Research 側は Production を直接変更しない。採用判断・段階導入・Rollback は Phase10-0 / Phase7 統制に従う。

---

## 12. Phase10-1 への接続

Adoption Review で Approved となった Candidate は、Phase10-1 Controlled Production Adoption へ移行する。

```text
Candidate
    ↓
Adoption Review（Phase10-0）
    ↓
Approved Candidate
    ↓
Controlled Adoption（Phase10-1）
```

関連文書:

* `docs/controlled_production_adoption.md`
* `docs/controlled_rollout.md`
* `docs/deployment_traceability.md`
* `docs/production_record.md`

Research Traceability（Research ID → Validation ID → Candidate ID）は Adoption ID / Deployment ID へ接続する。

---

## 13. Phase10-2 への接続

Production 導入後の品質・安全性・運用適合性検証は Phase10-2 Operational Validation で行う。

```text
Controlled Adoption（Phase10-1）
        ↓
Operational Validation（Phase10-2）
        ↓
Operational Feedback Integration（Phase10-3）
```

関連文書:

* `docs/operational_validation.md`
* `docs/validation_decision_gate.md`
* `docs/operational_knowledge_feedback.md`
* `docs/validation_traceability.md`

---

## 14. Phase10-3 への接続（Research Feedback）

運用改善が既存運用だけでは解決できない場合、Phase10-3 Research Feedback Interface 経由で Phase9 Research へ接続する。

```text
Improvement Proposal
        ↓
Operational Review
        ↓
Research Candidate
        ↓
Phase9 Research
```

関連文書:

* `docs/operational_feedback_integration.md`
* `docs/research_feedback_interface.md`
* `docs/improvement_decision_gate.md`
* `docs/feedback_traceability.md`

Production から直接 Research へ変更を反映しない。Research 移行は Human Review 必須。

---

## 15. Phase10-4 への接続（Future Optimization / Research）

将来の Capability / Architecture 改善は Phase10-4 Future Capability Planning / Phase9 Research Interface を経る。

```text
Optimization Idea
        ↓
Research Candidate
        ↓
Phase9 Research
        ↓
Future Adoption
```

関連文書:

* `docs/future_operational_optimization.md`
* `docs/future_capability_planning.md`
* `docs/phase9_research_interface.md`
* `docs/optimization_decision_gate.md`

Research 開始には Human Review。Research 結果の自動採用は禁止。

---

## 16. Phase11-0 への接続（Lifecycle / Research Trace）

Production 採用後の Capability / Policy / AI / Automation / Knowledge は Phase11-0 Operational Lifecycle Governance で長期管理する。

```text
Research
        ↓
Adoption（Phase10）
        ↓
Lifecycle（Phase11-0）
        ↓
Retirement / Archive
```

関連文書:

* `docs/operational_lifecycle_governance.md`
* `docs/lifecycle_traceability.md`
* `docs/version_governance.md`
* `docs/archive_governance.md`

Lifecycle Decision は Human Approval 必須。Research 結果の直接 Lifecycle 適用は禁止。

---

## 17. Phase11-1 への接続（Maintenance / Research Boundary）

Production 採用後の維持作業は Phase11-1 Lifecycle Maintenance で実施する。Research / Optimization は Maintenance Scope 外。

```text
Lifecycle（Phase11-0）
        ↓
Maintenance（Phase11-1）
        ↓
Operational Continuation
```

関連文書:

* `docs/lifecycle_maintenance.md`
* `docs/maintenance_boundary.md`
* `docs/maintenance_traceability.md`

Maintenance は維持であり Research 昇格・Adoption・Optimization を代替しない。

---

## 18. Phase11-2 への接続（Health / Research Boundary）

運用中の健全性監視は Phase11-2 Operational Health Management で実施する。Research は Health Scope 外。

```text
Maintenance（Phase11-1）
        ↓
Health Management（Phase11-2）
        ↓
Operational Continuation / Incident & Recovery（Phase11-3）
```

関連文書:

* `docs/operational_health_management.md`
* `docs/health_boundary.md`
* `docs/health_traceability.md`

Health は監視・判断支援であり Research 昇格・Production 自動変更を行わない。

---

## 19. Phase11-3 への接続（Incident & Recovery / Research Boundary）

障害発生後の対応・復旧は Phase11-3 Operational Incident & Recovery で統制する。Research は Incident Scope 外。

```text
Health Management（Phase11-2）
        ↓
Incident & Recovery（Phase11-3）
        ↓
Lessons Learned → Lifecycle Governance（11-0）
        ↓
Operational Knowledge Evolution（Phase11-4）
```

関連文書:

* `docs/operational_incident_recovery.md`
* `docs/incident_boundary.md`
* `docs/lessons_learned.md`
* `docs/recovery_decision_gate.md`

Incident / Recovery は Research 昇格・自動復旧を行わない。Lessons Learned は Lifecycle Governance を支援する。

---

## 20. Phase11-4 / Framework Navigation（Knowledge / 逆リンク）

Research 成果の本番還元経路と、Adopt 後の Lifecycle 閉ループを一望する。

```text
Research → Future Adoption（Phase10）
        ↓ Adopt
Production Runtime → Lifecycle（Phase11-0）
        ↓ …
Knowledge Evolution（Phase11-4）→ Lifecycle（Next）
```

| Research成果 | Adoptionでの扱い |
|---|---|
| Validated | Adoption候補として審査 |
| Candidate | 改善案として評価 |
| Proposal | 採用可否判断へ進む |

関連文書:

* `docs/framework_navigation.md`
* `docs/production_adoption_governance.md`
* `docs/operational_knowledge_evolution.md`
* `docs/decision_gate_catalog.md`

Research は Production を直接変更しない。Future Adoption は Phase10、Adopt 後の長期運用は Phase11。

