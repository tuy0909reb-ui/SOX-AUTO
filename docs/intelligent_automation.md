# Intelligent Automation Support（Phase8-3）

仕様: `docs/specs/intelligent_automation_support_phase8_3.md`  
Workflow Policy: `docs/automation_workflow_policy.md`  
Execution Audit: `docs/automation_execution_audit.md`  
Improvement: `docs/automation_improvement.md`  
Advanced Automation（Phase7-3）: `docs/advanced_automation.md`  
AI Decision Support（Phase8-1）: `docs/ai_decision_support.md`  
Knowledge（Phase8-2）: `docs/knowledge_management.md`  
AI Governance（Phase8-0）: `docs/ai_governance.md`

本ドキュメントは **AI 支援付き Automation** の統合運用方針を定義する。  
AI は実行主体にならない。本番コード（`tools/secretary/`）変更・完全自律運用は行わない。

---

## 1. 概要

AI の分析・Knowledge・Recommendation を、Human Approval と Governance 制約下で Phase7-3 Automation 実行へ接続する。

```text
Operational Data
        │
Knowledge Source
        │
        ▼
AI Analysis
        ↓
Recommendation
        ↓
Policy Check
        ↓
Risk Evaluation
        ↓
Human Approval
        ↓
Automation Execution（Phase7-3）
        ↓
Audit Record
```

---

## 2. AI / Human / Automation 責務境界

```text
AI
 ↓
Suggestion

Human
 ↓
Approval

Automation
 ↓
Execution
```

| 層 | 責務 | 禁止 |
|---|---|---|
| AI | Recommendation / 分析補助 | 最終判断、承認、直接実行 |
| Human | Validation、Approval、理由記録 | Approval 省略 |
| Automation（Phase7-3） | 承認後の実行制御・Workflow・Audit | 無承認実行、AI 判断の自動実行化 |

---

## 3. Phase 接続

| Phase | 接続内容 |
|---|---|
| Phase8-0 | AI 利用統制・HITL・AIA- |
| Phase8-1 | Recommendation / Evidence / Confidence / Decision Record |
| Phase8-2 | Knowledge Trust / Version / Source Policy |
| Phase7-3 | Policy/Risk/Approval 付き **実行**（本 Phase は支援・接続） |
| Phase7-0 | Change Management（改善・Policy 変更） |

### Phase7-3 との境界

| | Phase7-3 Advanced Automation | Phase8-3 Intelligent Automation Support |
|---|---|---|
| 役割 | 実行制御・Workflow・Audit 管理 | Recommendation Integration・Knowledge 利用・評価支援・Approval 接続 |
| 入力 | 承認済み Automation Request | AI Suggestion + Evidence + Knowledge Ref |

---

## 4. 関連文書

| 文書 | 内容 |
|---|---|
| `automation_workflow_policy.md` | Workflow / Policy / Risk / Approval / 実行条件 |
| `automation_execution_audit.md` | Execution Trace |
| `automation_improvement.md` | Continuous Improvement Loop |
| `advanced_automation.md` | Phase7-3 実行 Framework |
| `automation_policy.md` | Phase7-3 Policy / Approval（併用） |

---

## 5. 禁止事項（再掲）

* AI 最終判断・承認・直接実行・Policy 変更
* AI による本番変更 / Rollback / Secrets 操作
* Human Approval 省略・完全自律運用
* Audit Log 削除
* `tools/secretary/` 変更
