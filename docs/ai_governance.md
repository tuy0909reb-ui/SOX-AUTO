# AI Operations Governance（Phase8-0）

仕様: `docs/specs/ai_operations_governance_phase8_0.md`  
AI Audit: `docs/ai_audit.md`  
AI Risk: `docs/ai_risk_management.md`  
AI Compliance: `docs/ai_compliance.md`  
Operational Governance: `docs/governance.md`（Phase7-0）  
Advanced Automation: `docs/advanced_automation.md`（Phase7-3）  
AI Decision Support（Phase8-1）: `docs/ai_decision_support.md`

本ドキュメントは AI を運用プロセスへ安全に統合するための**統制方針**のみを定義する。  
AI モデル導入・API 接続・自動判断実装・`tools/secretary/` 変更は行わない。

分析・候補提示・Evidence 検証の具体フローは Phase8-1（`ai_decision_support.md`）を用いる。  
Phase8-0 は Policy / Risk / Audit / Compliance、Phase8-1 は Analysis / Recommendation / Validation。  
AI が参照する知識の管理は Phase8-2（`knowledge_management.md`）。Draft Knowledge の AI 利用は禁止。

---

## 1. AI 利用目的

運用における AI 利用の目的は次に限定する。

* 情報の整理・要約
* 分析の補助（判断材料の提示）
* 候補の提示（原因候補・改善候補など）
* 検索・参照支援
* レポート下書き・文書構成の補助

AI 出力はすべて**参考情報**であり、最終判断・承認・本番変更の代替ではない。

---

## 2. 利用可能範囲 / 禁止範囲

### 2-1 利用可能

| 用途 | 例 | 条件 |
|---|---|---|
| 情報整理 | ログ要約、Incident 時系列の整理 | Secret 値を入力・出力に含めない |
| 分析補助 | Failure 傾向の仮説列挙 | Human Validation 必須 |
| 候補提示 | 障害原因候補、改善 Item 候補 | 未検証のまま CHG/Deploy しない |
| 検索支援 | Runbook / 仕様の参照案内 | 根拠文書を明示 |
| レポート生成 | Review / Daily 報告の下書き | 人間が内容を確定 |

### 2-2 利用禁止

* AI による最終判断（Severity、Rollback 要否、承認の代替）
* AI による本番変更・Deploy / Rollback の単独実行
* AI による Secrets 操作・Security 修正
* Human Approval の省略
* 未検証 AI 出力のみを根拠とする Change 適用
* AI Audit 記録の削除・隠蔽

---

## 3. Human-in-the-loop Boundary（必須）

```text
AI
 ↓
Analysis / Suggestion

Human
 ↓
Decision / Approval

Automation
 ↓
Execution
```

| 層 | 責務 | 禁止 |
|---|---|---|
| AI | 分析・提案・整理 | 最終決定、承認、本番変更 |
| Human | 意思決定・承認・Output Validation | Approval 省略、AI への責任転嫁 |
| Automation | 承認後の実行（Phase6/7 の定義範囲） | 無承認実行、AI 判断の自動実行化 |

重要操作（Deploy、Rollback、Secrets 更新、Security 設定変更、High Risk 変更）は**人間承認必須**。

---

## 4. AI Output Validation

AI 出力を扱う際の検証方針。

| 対象 | 検証内容 |
|---|---|
| 分析結果 | 根拠データ（Actions / Report / Incident）と突合 |
| 障害原因候補 | Runbook・ログで裏取り。未検証候補で Rollback しない |
| 改善提案 | Change Management / Risk 評価を経る |
| Security 情報整理 | `security.md` / Secrets Policy。値の再出力禁止 |

要件:

* AI 出力は参考情報として扱う
* 根拠情報（Reference Data）を確認可能にする（`ai_audit.md`）
* 未検証情報による変更は禁止

検証者（Human）と承認者を記録する。

---

## 5. AI / Human / Automation 責務分離

| 領域 | AI Governance（本 Phase） | Phase7-0 Governance | Phase7-3 Advanced Automation |
|---|---|---|---|
| 役割 | AI 利用ルール・境界・検証・監査・AI リスク | 運用変更・Risk 受容・境界全般 | Policy/Risk/Approval 付き実行 |
| AI 利用 | 方針定義 | Change 時の AI 利用も CHG 対象になり得る | AI を最終判断に使わない |
| 実行 | しない | 承認フロー | 承認後 Execution |

---

## 6. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7-0 | Change / Risk / 緊急フロー。AI 利用変更も未承認禁止 |
| Phase7-1 | Reliability 分析補助に AI を使う場合も Validation + Audit |
| Phase7-2 | Security 情報の AI 整理は Secret 非露出・人間確定 |
| Phase7-3 | Automation 実行ゲート。AI Suggestion → Human Approval → Execution |
| Phase8-1 | Decision Support（分析・候補・検証） |
| Phase8-2 | Knowledge Trust/Version。参照可能な知識の範囲 |
| Phase8-3 | Intelligent Automation Support（AI→Approval→Phase7-3 Execution の接続） |
| Phase9-0 | Research Governance（Research ≠ Production / Human Approval / Exit Criteria） |
| Phase9-1 | AI Agent Collaboration Research（Agent境界 / Human主導 / Exit Criteria） |
| Phase9-2 | Policy as Code Research（AI Policy表現研究。本番Policy適用禁止） |
| Phase9-4 | Predictive AIOps Research（予測は研究専用。Confidence HighでもHuman Decision必須） |
| Phase10-0 | Production Adoption Governance（AI Capability採用はHuman Approval必須。AI never approves） |
| Phase10-1 | Controlled Production Adoption（AI Capability導入のDeployment/Rollback/GA承認はHuman） |
| Phase10-2 | Operational Validation（AI Capability検証。AI Output is Recommendation Only） |
| Phase10-3 | Operational Feedback Integration（AIはRecommendationのみ。Improvement/Knowledge承認はHuman） |
| Phase10-4 | Future Operational Optimization（AIはRecommendation/Simulationのみ。Optimization ApprovalはHuman） |
| Phase11-0 | Operational Lifecycle Governance（Lifecycle DecisionはHuman Approval必須。AI never approves） |
| Phase11-1 | Lifecycle Maintenance（AIはAnalysis/Recommendationのみ。Planning/Approval/Verification/RollbackはHuman） |
| Phase11-2 | Operational Health Management（AIはAnalysis/Trend/Recommendationのみ。Assessment/Escalation/Recovery ApprovalはHuman） |
| Phase11-3 | Operational Incident & Recovery（AIはCorrelation/Timeline/RCA Assistance/Recommendationのみ。Incident/Escalation/Recovery/RCA ApprovalはHuman） |
| Phase11-4 | Operational Knowledge Evolution（AIはSummarization/Recommendation/Classification/Duplicate Detectionのみ。Approval/Validation/PublicationはHuman） |

---

## 7. 禁止事項（再掲）

* AI 最終判断・本番変更・Rollback 判断・Secrets / Security 操作
* Human Approval 省略
* AI Audit 削除
* モデル開発・学習・API 接続追加（本フェーズ）
