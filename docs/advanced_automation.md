# Advanced Automation（Phase7-3）

仕様: `docs/specs/advanced_automation_phase7_3.md`  
Policy: `docs/automation_policy.md`  
Audit Trail: `docs/automation_audit.md`  
定型 Automation（Phase6-3-C）: `docs/automation.md`  
Governance: `docs/governance.md` / `docs/change_management.md` / `docs/risk_management.md`  
Reliability: `docs/reliability.md`  
Security: `docs/security.md`  
AI Operations Governance（Phase8-0）: `docs/ai_governance.md` / `docs/ai_audit.md`  
AI Decision Support（Phase8-1）: `docs/ai_decision_support.md`  
Intelligent Automation Support（Phase8-3）: `docs/intelligent_automation.md`
Research Governance（Phase9-0）: `docs/research_governance.md` / `docs/research_transition.md`  
Policy as Code Research（Phase9-2）: `docs/policy_as_code_research.md` / `docs/policy_transition.md`  
Predictive AIOps Research（Phase9-4）: `docs/predictive_aiops_research.md` / `docs/prediction_consumption_boundary.md`  
Production Adoption Governance（Phase10-0）: `docs/production_adoption_governance.md` / `docs/adoption_deployment_strategy.md`  
Controlled Production Adoption（Phase10-1）: `docs/controlled_production_adoption.md` / `docs/controlled_rollout.md`  
Operational Validation（Phase10-2）: `docs/operational_validation.md` / `docs/validation_automation.md`  
Operational Feedback Integration（Phase10-3）: `docs/operational_feedback_integration.md` / `docs/improvement_decision_gate.md`  
Future Operational Optimization（Phase10-4）: `docs/future_operational_optimization.md` / `docs/optimization_decision_gate.md`  
Operational Lifecycle Governance（Phase11-0）: `docs/operational_lifecycle_governance.md` / `docs/lifecycle_decision_gate.md`  
Lifecycle Maintenance（Phase11-1）: `docs/lifecycle_maintenance.md` / `docs/maintenance_boundary.md`  
Operational Health Management（Phase11-2）: `docs/operational_health_management.md` / `docs/health_boundary.md`  
Operational Incident & Recovery（Phase11-3）: `docs/operational_incident_recovery.md` / `docs/incident_boundary.md`

本ドキュメントは **Controlled Automation**（判断支援・制約付き実行）の Framework を定義する。  
完全自律運用・AI 最終判断・自動復旧・無承認実行・`tools/secretary/` 変更は行わない。

AI を Suggestion に使う場合:  
Input → Analysis → Candidates → Evidence（Phase8-1）→ Human Validation/Approval → 本 Framework の Policy/Risk/Approval → Execution。  
Phase8-3（`intelligent_automation.md` / `automation_workflow_policy.md`）は AI 連携の入口・Trace・改善ループを定義し、**実行制御自体は本 Phase7-3 Framework** が担う。
Research（`Research ≠ Production`）の昇格条件は Research Transition（Phase9-0）で定義し、採用判断は Human Approval を経る。  
**Approved Automation Capability** の Production 昇格は Phase10-0 Adoption Review の後、Phase10-1 Controlled Rollout / Deployment Strategy / Rollback Execution を経る。Research / Experimental Automation の直接本番適用は禁止。  
導入後は Phase10-2 Automation Validation（`Automation follows Approved Procedure only.`）で継続検証する。  
改善提案は Phase10-3 Improvement Decision Gate（Human Approval）を経る。Feedback による Automation 直接変更は禁止。  
将来の Automation Capability 改善は Phase10-4 Optimization Decision Gate を経る。自己変更 Automation / Production 自動最適化は禁止。  
Production 採用後の Automation Capability は Phase11-0 Lifecycle Review / Deprecation / Retirement / Archive で長期管理する。Lifecycle Decision は Human Approval 必須。  
維持作業は Phase11-1 Lifecycle Maintenance（Approved Procedure のみ / Human Approval）で実施する。自己変更・自律的最適化・未承認実行は禁止。  
運用中の健全性は Phase11-2 Operational Health Management で監視する。Health Monitoring による Production 自動変更・Recovery 自動実行は禁止。  
障害発生後は Phase11-3 Operational Incident & Recovery で対応・復旧する。自動復旧・無承認 Rollback・AI Escalation/Recovery Approval は禁止。

---

## 1. Phase6-3-C との境界

| | Phase6-3-C Operational Automation | Phase7-3 Advanced Automation |
|---|---|---|
| 目的 | 定型作業の自動実行 | Governance / Reliability / Security 制約下での判断支援＋承認付き実行 |
| 例 | Health Check、Daily Report、Runbook 補助 | Policy Check → Risk → Approval → Execution → Audit |
| 判断 | 情報提供のみ（人間が判断） | 判断材料＋Policy/Risk ゲート＋人間承認 |
| Workflow | `maintenance.yml` / `operations.yml` | 原則新規 WF 不要。補助定義のみ可 |

Phase6-3-C の定型 Automation は本 Framework の「Trigger / 情報収集」側として利用できる。  
制約付き実行（変更適用・Deploy 等）は必ず本 Framework の Policy / Risk / Approval を通す。

---

## 2. Advanced Automation Framework

全体フロー（固定順。飛ばし禁止）:

```text
Trigger
 ↓
Policy Check
 ↓
Risk Evaluation
 ↓
Approval
 ↓
Execution
 ↓
Audit Record
```

| 段階 | 内容 | 詳細文書 |
|---|---|---|
| Trigger | 手動起案 / Review 改善 Item / 定型 Automation 結果 / Incident 後の運用作業要求 | 本 §3 |
| Policy Check | Change / Security / Reliability / Deployment Policy 確認 | `automation_policy.md` |
| Risk Evaluation | Low / Medium / High | 本 §4、`risk_management.md` |
| Approval | Human Approval（リスク等級に応じて） | `automation_policy.md` |
| Execution | 承認済み範囲のみ実行（Deploy は Phase6-1、文書変更は CHG 適用等） | 実行責任者を記録 |
| Audit Record | Automation ID ほか必須項目 | `automation_audit.md` |

### 2-1 実行条件

すべて満たすこと:

1. Trigger と対象が明示されている
2. Policy Check が Pass（逸脱なし）
3. Risk が評価済み（未評価は実行不可）
4. リスク等級に応じた Approval が完了している（High は自動実行不可）
5. 実行範囲が承認内容と一致している

### 2-2 Policy 違反時の停止

* Policy Check で違反または未承認が検出された場合、**即停止**する
* Execution に進まない
* 停止理由を Audit Record に記録する（補正して実行しない）

停止理由の例:

* Change Management 未承認
* Security Policy 違反（Secret 露出リスク等）
* Reliability / Deployment Policy 逸脱
* High Risk の自動実行要求

---

## 3. Trigger（起動条件）

| Trigger 種別 | 例 | 備考 |
|---|---|---|
| Manual Request | 運用者が Automation Request を起案 | ID: `AA-YYYYMMDD-NNN` |
| Reliability Improvement | Monthly Review の Improvement Item | CHG と接続 |
| Security Review Item | SEC Review の改善候補 | Security Policy 必須 |
| Operational Event | Maintenance Failure Summary 等の後続対応 | 定型収集は Phase6-3-C、実行は本 Framework |
| Emergency | 急迫障害 | Phase7-0 緊急変更フロー準拠 |

AI による Trigger 確定・最終判断は禁止。Suggestion に AI を使う場合は Phase8-0（`ai_governance.md`）に従い、Human Validation 後にのみ本 Framework へ進む。

---

## 4. Risk Controlled Automation

`docs/risk_management.md` の等級を Automation 実行可否に接続する。

| Risk | Automation 扱い | 承認 |
|---|---|---|
| Low | **条件付き**自動実行可能（Policy Pass かつ対象が定型・可逆・staging 限定等の事前定義範囲内） | 通常承認（事前定義された Low 範囲は記録付きで可） |
| Medium | 自動実行不可。Human Approval **必須**のうえ実行 | 追加確認＋承認記録 |
| High | **手動対応のみ**。Automation による実行禁止 | 上位判断。自動実行禁止 |

禁止:

* High Risk の自動実行
* Risk 評価なしの Automation
* 「Low と称した」High の省略承認

Low の「条件付き」例（事前定義・文書化が必要）:

* 既承認の定型レポート再実行（内容変更なし）
* staging 向けの承認済み手順の再適用（範囲固定）

production Deploy / Secrets 更新 / 依存更新は原則 Medium 以上。

---

## 5. Decision Support（判断支援）

Automation / 運用者が参照する材料（確定は人間）:

* Observability / Daily Report（Phase6）
* Reliability SLI/SLO / Review（Phase7-1）
* Security Review / Secrets / Dependency（Phase7-2）
* Change / Risk 記録（Phase7-0）

提供するのは判断材料とゲート結果のみ。最終判断・Severity 確定・Rollback 要否は人間。

---

## 6. Execution（実行）

| 実行種別 | 実行手段 | 備考 |
|---|---|---|
| 定型収集・レポート | Phase6-3-C Workflow | Framework の情報収集として利用可 |
| Deploy / Rollback | Phase6-1 `deploy.yml` | Approval 後に人間または承認済み手順で起動 |
| 文書・設定変更 | Change Management 適用 | 未承認適用禁止 |
| Secrets 更新 | `secrets_policy.md` + CHG | 自動変更禁止 |

実行責任者を Audit Record に記録する。実行範囲の拡大（スコープクリープ）禁止。

---

## 7. 禁止事項（再掲）

* `tools/secretary/` 変更
* AI 最終判断・自動復旧・自動 Rollback
* 自動 Security 修正・Secrets / Infrastructure / Database 自動変更
* 無承認 Automation
* Audit Log 削除
* Policy / Risk ゲートのスキップ

---

## 8. 関連文書

| 文書 | 内容 |
|---|---|
| `docs/automation_policy.md` | Policy Based Automation / Approval Workflow |
| `docs/automation_audit.md` | Audit Trail |
| `docs/automation.md` | Phase6-3-C 定型 Automation |
| `docs/change_management.md` | 変更・緊急フロー |
| `docs/risk_management.md` | Risk 等級・受容 |
