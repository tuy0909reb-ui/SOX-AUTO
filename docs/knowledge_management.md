# Knowledge Management（Phase8-2）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Source Policy: `docs/knowledge_source_policy.md`  
Trust Level: `docs/knowledge_trust_level.md`  
Versioning: `docs/knowledge_versioning.md`  
Validation: `docs/knowledge_validation.md`  
Lifecycle: `docs/knowledge_lifecycle.md`  
Runbook Integration: `docs/runbook_integration.md`  
Intelligent Automation（Phase8-3）: `docs/intelligent_automation.md`

本ドキュメントは AI が安全に参照できる**運用知識基盤**の管理方針を定義する。  
AI による Knowledge 正式更新・Runbook 変更・Incident 確定・`tools/secretary/` 変更は行わない。

AI 支援 Automation 実行時の Knowledge 参照は Source Policy / Trust / Version に従い、Trace に記録する（`automation_execution_audit.md`）。

---

## 1. Phase 境界

| Phase | 役割 |
|---|---|
| Phase8-0 | AI 利用を統制する |
| Phase8-1 | AI で判断を補助する |
| Phase8-2 | AI が参照する知識を管理する |

```text
Knowledge
    ↓
AI Decision Support
    ↓
Human Decision
    ↓
Automation
```

---

## 2. Knowledge Repository（対象範囲）

| カテゴリ | 主なソース | 参照用途 |
|---|---|---|
| Runbook | `operations.md`, `incident_response.md`, `deployment.md` 等 | 手順・初動 |
| Incident History | INC- / `incident_template.md` | 類似障害・Lesson Learned |
| Decision Records | AIA- Decision / CHG 関連判断 | 判断経緯の再利用 |
| Reliability Review | REL- / `review_process.md` | 傾向・改善履歴 |
| Security Review | SEC- / `security.md` | Security 確認項目（Secret 値なし） |
| Automation Audit | AA- / `automation_audit.md` | 実行・停止履歴 |

Repository は単一 DB 製品を必須としない。上記記録が**出所追跡可能**であればよい。

---

## 3. 管理方針

* 情報源（文書パス / ID / Version）を明確化する
* 出所を追跡可能にする
* 更新責任者を定義する（`knowledge_lifecycle.md`）
* Trust Level / Version を AI 参照前に確認する
* Secrets / Credential を Knowledge として保存しない

---

## 4. 更新責任（概要）

| 対象 | 更新責任の目安 |
|---|---|
| Runbook | 運用オーナー / Change 起案者（承認後） |
| Incident Knowledge | Incident 対応者（記録完成時） |
| Review Records | Review 実施者 / 承認者 |
| Trust Level / Version | Change Management 承認後に変更 |

AI は更新提案のみ可。正式更新は Human + Phase7-0 Change Management。

---

## 5. 参照用途

* Phase8-1 AI Decision Support の Input / Evidence
* Human Review 時の Runbook / Incident 検索（`runbook_integration.md`）
* Governance / Security / Reliability Review の材料

Draft Knowledge の AI 利用は禁止（`knowledge_trust_level.md`）。

---

## 6. 関連文書

| 文書 | 内容 |
|---|---|
| `knowledge_source_policy.md` | AI 参照可/不可ソース |
| `knowledge_trust_level.md` | Official / Validated / Historical / Draft |
| `knowledge_versioning.md` | Version 固定・CHG 接続 |
| `knowledge_validation.md` | Validated / Needs Review / Deprecated |
| `knowledge_lifecycle.md` | Create〜Archive |
| `runbook_integration.md` | Incident → Runbook 接続 |
| `docs/research_governance.md` | Research Governance（Research ≠ Production） |
| `docs/research_validation.md` | Research Validation（Evidence-driven評価） |
| `docs/research_artifact_management.md` | Research Artifacts 管理（Version / Traceability） |
| `docs/research_transition.md` | Research Transition（Future Adoption=Phase10候補） |
| `docs/ai_agent_collaboration.md` | AI Agent Collaboration（Phase9-1） |
| `docs/agent_responsibility_model.md` | Agent Responsibility Model（責務分離 / 境界 / 相互作用 / 非対象） |
| `docs/agent_collaboration_patterns.md` | Agent Collaboration Patterns（Sequential/Parallel/Hierarchical/Coordinator） |
| `docs/agent_boundary.md` | Agent Boundary（Permission/Data/Execution/Governance/Risk） |
| `docs/agent_research_validation.md` | Agent Research Validation（Flow / Criteria / Governance適合） |
| `docs/agent_risk_management.md` | Agent Risk Management（Runaway/Boundary/Autonomy/Leak等） |
| `docs/agent_artifact_management.md` | Agent Artifact Management（Artifacts / Version / Traceability / Audit） |
| `docs/agent_transition.md` | Agent Transition（Exit Criteria / Future Adoption=Phase10候補） |
| `docs/policy_as_code_research.md` | Policy as Code Research（Phase9-2） |
| `docs/policy_lifecycle.md` | Policy Lifecycle（Versionと独立） |
| `docs/policy_transition.md` | Policy Transition（Phase9-3 / Phase10候補） |
| `docs/predictive_aiops_research.md` | Predictive AIOps Research（Phase9-4） |
| `docs/prediction_sources.md` | Prediction Sources（未検証Knowledge禁止） |
| `docs/prediction_transition.md` | Prediction Transition（Phase10候補） |
