# AI Audit Management（Phase8-0）

仕様: `docs/specs/ai_operations_governance_phase8_0.md`  
AI Governance: `docs/ai_governance.md`  
Automation Audit（Phase7-3）: `docs/automation_audit.md`  
Decision Support（Phase8-1）: `docs/ai_decision_support.md` / `docs/ai_validation.md`  
Knowledge（Phase8-2）: `docs/knowledge_management.md` / `docs/knowledge_trust_level.md` / `docs/knowledge_versioning.md`  
Security Review: `docs/security.md` / `docs/audit_preparation.md`

AI 利用履歴を追跡し、AI 出力と最終判断の関係を確認可能にする。  
Audit Record の削除・利用履歴の不明化は禁止する。

Decision Support 利用時は AIA- に Suggestion / Evidence / Human Decision / Final Action を含め、Validation 結果（`ai_validation.md`）を記録する。  
Knowledge 参照時は Trust Level・Version を AIA- に記録する（`knowledge_versioning.md`）。

---

## 1. 記録対象（必須）

```text
AI Request
AI Response
Reference Data
Human Decision
Final Action
```

| 項目 | 内容 |
|---|---|
| AI Request | 依頼日時、依頼者、目的、入力概要（Secret 値禁止） |
| AI Response | 出力要約、提案の種類（分析 / 候補 / 下書き等） |
| Reference Data | 参照した Runbook・Actions URL・Report・Incident ID 等 |
| Human Decision | 採否、検証結果、承認者、日時 |
| Final Action | 実施した操作（CHG / Deploy / 記録のみ / 却下）と結果 |

推奨:

* Audit ID: `AIA-YYYYMMDD-NNN`
* 関連 AA- / CHG / INC / SEC / REL ID
* Validation 実施者

---

## 2. 記録形式

1 利用セッション（または 1 判断単位）につき 1 記録:

```text
Audit ID: AIA-
Request Time / Requester:
Purpose:
AI Request (summary, no secrets):
AI Response (summary):
Reference Data:
Human Decision:
  Validator:
  Approver:
  Decision: accept / modify / modify-with-edits / discard
Final Action:
Related IDs:
```

AI 出力全文の保存は任意。要約と根拠参照で関係が追えること。

---

## 3. Phase7-3 Automation Audit との整合

| | AI Audit（本文書） | Automation Audit（`automation_audit.md`） |
|---|---|---|
| 対象 | AI 利用と人間判断 | Policy/Risk/Approval 付き Automation 実行 |
| ID | `AIA-` | `AA-` |
| 接続 | AI 提案を Automation に載せる場合、AIA と AA を相互参照 | Trigger / Notes に AIA- を記載可 |

流れの例:

```text
AI Suggestion（AIA-）
        ↓
Human Validation + Approval
        ↓
Advanced Automation Request（AA-、Policy/Risk/Approval）
        ↓
Execution + Automation Audit
```

どちらか一方だけの記録で「AI が決めて実行した」状態を作らない。

---

## 4. Review での利用

* Governance Review / Change 監査: AIA- で AI 関与の有無を確認
* Security Review: Secret 入力・出力がないこと、Security 判断が人間確定であること
* Audit Preparation: AI 利用記録カテゴリとして参照可能にする

---

## 5. 保存・改ざん防止

* 保存期間: 最低 12 か月、または組織方針の長い方
* 訂正は追記方式（原文削除禁止）
* Audit Record 削除禁止
* Secret 値・トークンを記録しない

---

## 6. 禁止事項

* Audit Record 削除
* 利用履歴の不明化（依頼者・判断者の空欄放置を完了扱いにしない）
* AI 出力と Final Action の関係を記録せずに本番変更すること
