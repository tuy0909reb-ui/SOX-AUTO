# Predictive AIOps Research（Phase9-4）

仕様: `docs/specs/predictive_aiops_research_phase9_4.md`

本ドキュメントは、将来の運用イベントを予測し、事前に兆候を検知するための研究方針を定義する。  
**Production で予測結果を直接利用しない。** 本番環境の変更は行わない。

---

## 1. 概要

Phase9-4 Predictive AIOps Research は、以下を前提とする。

* Phase9-0 Research Governance
* Phase9-1 AI Agent Collaboration
* Phase9-2 Policy as Code
* Phase9-3 Autonomous Operations

研究対象は予測モデル・予兆検知・リスク予測である。

---

## 2. Research Scope

研究対象:

* Predictive Monitoring
* Predictive Incident Detection
* Predictive Capacity Planning
* Predictive Performance Degradation
* Predictive Risk Assessment
* Forecast Model / Trend Analysis / Early Warning
* Time Series Analysis / Predictive Recommendation
* Explainable Prediction / Prediction Drift Research

対象外:

* 本番自動復旧・本番自動判断
* 本番アラート変更・本番ポリシー更新・本番 AI 実行

---

## 3. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7-0 | Governance / Change / Risk。予測結果による未承認変更禁止 |
| Phase8-1 | Decision Support。Confidence High でも Human Decision 必須 |
| Phase8-2 | Knowledge Repository 参照（未検証 Knowledge 禁止） |
| Phase9-0 | Research Audit / Classification / Exit Criteria |
| Phase9-1 | Agent 境界下での予測補助（実行判断はしない） |
| Phase9-2 | Validated Policy 参照のみ。Policy 更新禁止 |
| Phase9-3 | Prediction → Human Review → Autonomous Candidate（研究）。直接起動禁止 |
| Phase10 | Production Adoption Review（採用判断は Phase10） |

---

## 4. 関連文書

| 文書 | 内容 |
|---|---|
| `prediction_model.md` | Prediction Model |
| `prediction_sources.md` | Prediction Sources |
| `prediction_validation.md` | Forecast Validation |
| `prediction_confidence.md` | Prediction Confidence |
| `prediction_drift.md` | Prediction Drift Research |
| `prediction_lifecycle.md` | Prediction Lifecycle |
| `prediction_explainability.md` | Explainability |
| `prediction_consumption_boundary.md` | Consumption Boundary |
| `prediction_transition.md` | Exit Criteria / Phase10 Interface |

---

## 5. 禁止事項

* Prediction による本番自動復旧・自動判断
* Prediction による Policy 更新・Automation 実行
* Human Review 省略
* Secret 利用
* `tools/secretary/` 変更
