# AI Compliance Boundary（Phase8-0）

仕様: `docs/specs/ai_operations_governance_phase8_0.md`  
AI Governance: `docs/ai_governance.md`  
AI Audit: `docs/ai_audit.md`  
Security Operations: `docs/security.md` / `docs/secrets_policy.md` / `docs/audit_preparation.md`（Phase7-2）

AI 利用に関する **Compliance 境界（管理範囲）** を定義する。  
法的 Compliance 適合判断・認証取得・外部契約対応は対象外。

---

## 1. 管理対象

| 対象 | 内容 | 記録 |
|---|---|---|
| AI 利用記録 | 誰が・何の目的で・どの判断に使ったか | `ai_audit.md`（AIA-） |
| データ取り扱い方針 | 入力・出力に含めてよい情報の範囲 | 本 §2 |
| 利用責任範囲 | AI / Human / 組織の責任の切り分け | `ai_governance.md` |

---

## 2. データ取り扱い方針

含めてよい（運用上）:

* 公開仕様・Runbook の参照
* Secret を含まないログ要約、Actions URL、Incident ID
* 非個人の運用メタデータ（Workflow 名、tag、環境名）

含めてはいけない:

* Secret 値・トークン・パスワード
* 不要な個人情報（取り扱いが未定義の場合は投入しない）
* 本番接続情報の実値

出力側も同様。AI 応答に Secret が混入した場合は Security Incident 候補（`security.md`）として扱う。

---

## 3. 利用責任範囲

| 主体 | 責任 |
|---|---|
| AI 利用者（依頼者） | 入力の適切性、Audit 起票、Validation 依頼 |
| Validator / Approver | 出力検証・採否・承認記録 |
| 実行責任者 | 承認後アクションの実施範囲遵守 |
| Governance / Security | 方針維持・Review・逸脱の差し戻し |

AI ベンダーまたはモデルの「回答」は組織の最終責任を代替しない。

---

## 4. Phase7-2 Security との接続

| Security | AI Compliance |
|---|---|
| Secrets 露出禁止 | AI 入出力にも適用 |
| Security Review | AIA- 記録の確認対象に含められる |
| Audit Preparation | AI 利用記録を監査準備カテゴリとして参照 |
| Security Incident | AI 経由の露出・権限逸脱疑いを境界内でエスカレーション |

---

## 5. 対象外（明示）

* 法的 Compliance 適合の判断
* ISO / SOC 等の認証取得対応
* 外部契約（DPA 等）の充足判断
* 規制当局向け提出パッケージの作成（別プロセス）

必要時は Governance / 法務 / 別 Phase で扱う。

---

## 6. 禁止事項

* 法的判断を本文書の「完了」で代替すること
* Secret を含む AI 利用を Audit なしで行うこと
* AI 利用記録の削除
