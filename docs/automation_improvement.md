# Automation Improvement Loop（Phase8-3）

仕様: `docs/specs/intelligent_automation_support_phase8_3.md`  
Intelligent Automation: `docs/intelligent_automation.md`  
Change Management: `docs/change_management.md`（Phase7-0）  
Execution Audit: `docs/automation_execution_audit.md`

AI 支援 Automation の実行結果から Policy / 手順を改善するサイクルを定義する。  
AI による Policy 正式変更は禁止。Human Review 必須。

---

## 1. 改善サイクル

```text
Execute
 ↓
Review
 ↓
Analyze
 ↓
Improve
 ↓
Change Management
```

仕様上の対応:

```text
Execute
 ↓
Review
 ↓
Analyze
 ↓
Improve Policy
 ↓
Review Approval
```

| 段階 | 内容 |
|---|---|
| Execute | 承認済み Automation 実行 |
| Review | 結果・Failure・Audit Trace の確認 |
| Analyze | 傾向・再発・Policy ギャップ（AI 補助可、確定は人間） |
| Improve | 改善案の起案（Policy / Workflow / Knowledge） |
| Change Management | CHG → Approval → 適用 |
| Review Approval | 承認後の効果確認 |

---

## 2. 制約

* **AI による Policy 変更は禁止**（提案のみ可）
* **Human Review 必須**
* 改善適用は **Phase7-0 Change Management** 経由
* 承認なしの Policy / Workflow 文書変更は禁止
* Audit / Trace を削除して「改善完了」としない

---

## 3. 入力材料

* `automation_execution_audit.md` / AA-
* AIA- / Decision Record
* Knowledge Validation / Trust 変更履歴
* Reliability / Security Review Item

---

## 4. 出力

* Improvement Item（ID・内容・優先度）
* 関連 CHG
* 必要に応じ Knowledge Update Request（Phase8-2 Versioning）

---

## 5. 禁止事項

* AI 単独での Policy / Workflow 正式更新
* Human Review 省略
* 自動 Approval
* 改善を理由とした無承認本番変更
