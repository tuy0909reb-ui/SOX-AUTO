# Automation Workflow Policy（Phase8-3）

仕様: `docs/specs/intelligent_automation_support_phase8_3.md`  
Intelligent Automation: `docs/intelligent_automation.md`  
Phase7-3: `docs/advanced_automation.md` / `docs/automation_policy.md`  
Decision Support: `docs/ai_decision_support.md`  
Knowledge: `docs/knowledge_source_policy.md`

AI Recommendation を Automation 実行へ載せる際の Workflow・Policy・Risk・Approval・実行条件を定義する。

---

## 1. Workflow（固定順）

```text
AI Recommendation
 ↓
Validation
 ↓
Policy Check
 ↓
Risk Evaluation
 ↓
Human Approval
 ↓
Automation Execution
```

飛ばし・Approval 省略は禁止。Execution は Phase7-3 経由。

| 段階 | 内容 | 参照 |
|---|---|---|
| AI Recommendation | 候補・理由（入力情報として扱う） | `ai_recommendation_policy.md` |
| Validation | Evidence 必須。Confidence のみ不可 | `ai_validation.md` |
| Policy Check | 下記 Policy 評価 | §2 |
| Risk Evaluation | Low/Medium/High | `risk_management.md` / `advanced_automation.md` |
| Human Approval | Requester / Reviewer / Decision / Reason / Timestamp | §4 |
| Automation Execution | 承認済み範囲のみ | Phase7-3 |

---

## 2. Policy Enforcement

評価対象:

```text
Change Policy
Security Policy
Reliability Policy
Risk Policy
Knowledge Policy
```

| Policy | 確認内容 |
|---|---|
| Change | CHG 承認の有無（変更実行時） |
| Security | Secrets 非露出、Security 設定変更の承認 |
| Reliability | 無秩序改善でないこと、Review/Item 接続 |
| Risk | 等級評価済み。High は自動実行不可 |
| Knowledge | Official/Validated、Version 追跡、Draft 不使用 |

* Policy 違反時は **停止**（Execution に進まない）
* 未承認変更は禁止
* Governance Rule を維持する
* Policy 自体の変更は Phase7-0 Change Management 対象

---

## 3. Decision Integration（Phase8-1）

Automation への入力として扱う:

```text
AI Recommendation
Evidence
Confidence
Human Decision
Knowledge Reference
```

要件:

* Recommendation は入力情報のみ（実行判断の代替にしない）
* Confidence のみで実行判断しない
* Evidence Validation 必須
* Knowledge Version / Trust Level を追跡可能にする

---

## 4. Human Approval Workflow

```text
AI Suggestion
        ↓
Validation
        ↓
Approval Request
        ↓
Human Decision
        ↓
Execution
        ↓
Audit
```

記録必須:

```text
Requester
Reviewer
Decision
Reason
Timestamp
```

Decision: Approve / Reject / Approve-with-edits。  
Reject も記録する。Automation 実行は Phase7-3 経由。

---

## 5. Execution 条件

すべて満たすこと:

1. Validation Pass
2. Policy Check Pass
3. Risk 評価済み（High は手動のみ・Automation 実行禁止）
4. Human Approval 完了
5. Knowledge Reference が Source Policy 準拠
6. 実行範囲 = 承認範囲

---

## 6. 禁止条件

* AI 最終判断・AI 承認・AI 直接実行
* Validation / Policy / Approval スキップ
* Confidence のみでの実行
* Draft Knowledge を根拠とした実行
* High Risk の自動実行
* Human Approval 省略
* 完全自律運用

---

## 7. Phase7-3 との関係

本 Policy は AI 連携時の入口条件を定義する。  
実行制御の詳細は `advanced_automation.md` / `automation_policy.md` に従う。  
重複して「別の実行経路」を作らない。
