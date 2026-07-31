# Automation Audit Trail（Phase7-3）

仕様: `docs/specs/advanced_automation_phase7_3.md`  
Framework: `docs/advanced_automation.md`  
Policy / Approval: `docs/automation_policy.md`  
Security Review: `docs/security.md` / `docs/audit_preparation.md`

Advanced Automation の実行履歴を追跡可能にする。  
Audit Log の削除・改ざん・Secret 値の記録は禁止する。

---

## 1. 記録項目（必須）

```text
Automation ID
Execution Time
Trigger
Target
Policy Result
Risk Result
Approval Result
Execution Result
```

| 項目 | 内容 |
|---|---|
| Automation ID | `AA-YYYYMMDD-NNN` |
| Execution Time | 開始・終了（UTC または JST を明記） |
| Trigger | Manual / Reliability / Security / Operational / Emergency |
| Target | 環境・Workflow・文書・tag 等（Secret 値なし） |
| Policy Result | Pass / Fail + 確認した Policy 名。Fail 時は停止理由 |
| Risk Result | Low / Medium / High + 根拠要約 |
| Approval Result | 承認者・日時 / 不要（Low 事前定義） / 未承認で停止 |
| Execution Result | Success / Failure / Stopped（Policy） / Not Executed |

推奨追加:

* 実行責任者
* 関連 CHG / INC / SEC / REL ID
* Actions run URL（実行した場合）

---

## 2. 記録形式

1 Automation につき 1 記録（Issue / docs コピー / 運用メモのいずれか）。最低テンプレート:

```text
Automation ID: AA-
Execution Time:
Trigger:
Target:
Policy Result:
Risk Result:
Approval Result:
  Approver:
  Approved at:
Execution Owner:
Execution Result:
Related IDs:
Notes:（Secret 値禁止）
```

Security Review / Audit Preparation から参照できるよう、ID と日付で検索可能にする。

---

## 3. 改ざん防止方針

* 記録作成後の「結果の Success 化」修正は禁止
* 訂正が必要な場合は追記（訂正日時・訂正者・理由）とし、原文を消さない
* Audit Log の削除は禁止
* Secret 値・トークンを記録に含めない（キー名と有無のみ）

---

## 4. 保存期間・管理方法

| 項目 | 方針 |
|---|---|
| 保存期間 | 最低 12 か月、または組織の運用保持方針の長い方 |
| 管理場所 | リポジトリ外の運用記録、または承認済み docs / Issue（Secret なし） |
| Actions 連携 | Workflow 実行時は run URL を Audit に残す（ログ本文への Secret 出力禁止） |
| バックアップ | 組織の通常バックアップに委ねる（本フェーズで新規基盤は作らない） |

---

## 5. Security Review での利用

Monthly Security Review（`docs/security.md`）で以下を確認可能にする:

* [ ] 期間内の AA- 記録一覧
* [ ] Policy Fail / 無承認実行の有無（あれば逸脱として記録）
* [ ] High Risk の自動実行がないこと
* [ ] Secrets 関連 Automation の承認経路

Audit Preparation（`docs/audit_preparation.md`）の Security 記録カテゴリに AA- を含める。

---

## 6. Policy 停止時の記録

Policy Check または Risk ゲートで停止した場合も **必ず** Audit Record を残す。

* Execution Result: `Stopped (Policy)` または `Stopped (Risk)`
* 停止理由を Policy Result / Risk Result に記載
* 成功扱いにしない

---

## 7. 禁止事項

* Audit Log 削除
* 結果の改ざん・隠蔽
* Secret 値の Audit 記載
* 記録なしの Automation 実行
