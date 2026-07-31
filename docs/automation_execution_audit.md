# Automation Execution Audit（Phase8-3）

仕様: `docs/specs/intelligent_automation_support_phase8_3.md`  
Intelligent Automation: `docs/intelligent_automation.md`  
Phase7-3 Audit: `docs/automation_audit.md`  
AI Audit: `docs/ai_audit.md`

AI 支援付き Automation の実行トレースを追跡可能にする。  
Audit Log 削除・改ざん・Secret 値記録は禁止。

---

## 1. 記録項目（必須）

```text
Automation ID
AI Recommendation ID
Knowledge Reference
Policy Result
Approval Result
Execution Result
Failure Result
Timestamp
```

| 項目 | 内容 |
|---|---|
| Automation ID | `AA-…`（Phase7-3 と同一体系を推奨） |
| AI Recommendation ID | `AIA-…` / Candidate ID |
| Knowledge Reference | パス・Version・Trust Level |
| Policy Result | Pass / Fail + 対象 Policy。Fail 時は停止理由 |
| Approval Result | Reviewer、Decision、Reason、Timestamp |
| Execution Result | Success / Failure / Stopped / Not Executed |
| Failure Result | 失敗時の要約（Secret なし） |
| Timestamp | 各段階または実行完了時刻 |

---

## 2. 目的

* Traceability（誰が・何を・どの根拠で実行したか）
* Governance / Audit Preparation 利用
* Security Review 利用（無承認実行・Draft 根拠の有無）

---

## 3. Phase7-3 / Phase8-0 との整合

| 記録 | 役割 |
|---|---|
| `automation_audit.md`（AA-） | Phase7-3 実行 Audit |
| `ai_audit.md`（AIA-） | AI 利用・Suggestion |
| 本文書 | AI→Approval→Execution の連結 Trace（AA- に AIA-/Knowledge を含めても可） |

AA- と AIA- を相互参照し、「AI が決めて実行した」状態を作らない。

---

## 4. Policy 停止時

Policy / Risk / Validation で停止した場合も記録必須。

* Execution Result: `Stopped (Policy|Risk|Validation)`
* 成功扱いにしない

---

## 5. 保存・改ざん防止

* 訂正は追記方式
* 削除禁止
* 保存期間は `automation_audit.md` / 組織方針に準拠（最低 12 か月推奨）

---

## 6. 禁止事項

* Audit Log 削除
* 結果の Success 化改ざん
* Secret 値の記録
* Trace なしの AI 支援実行
