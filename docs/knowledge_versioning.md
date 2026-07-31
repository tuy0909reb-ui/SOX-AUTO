# Knowledge Version Management（Phase8-2）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Change Management: `docs/change_management.md`（Phase7-0）  
Trust Level: `docs/knowledge_trust_level.md`  
AI Audit: `docs/ai_audit.md`

AI 参照時点の Knowledge Version を固定し、変更履歴を追跡可能にする。

---

## 1. Version 変更フロー

```text
Knowledge Update
        ↓
Change Management
        ↓
Approval
        ↓
Version Update
```

Phase7-0 Change Management 対象。承認なし Version 変更は禁止。

---

## 2. 要件

| 要件 | 内容 |
|---|---|
| Version 固定 | AI 利用（AIA-）時点の文書 Version / 改訂日 / コミット参照を記録する |
| 更新履歴保持 | 何が・いつ・誰の承認で変わったかを残す |
| 差異追跡 | 前後差分を Audit / CHG から確認可能にする |
| 過去 Version | Historical / 参考扱い。単独の確定根拠にしない |

---

## 3. AI 参照時の記録

AIA- / Decision Record に最低限:

* Knowledge パスまたは ID
* Version（または改訂日 / commit SHA）
* Trust Level
* Official 以外を使った場合はその旨

Version 未記録のまま正式採用しない。

---

## 4. Version 識別の実務

単一 `VERSION` ファイル必須ではない。次のいずれかでよい:

* 文書先頭の Version / 最終更新日
* git commit / tag
* CHG ID との紐付け

一貫して追跡できればよい。

---

## 5. 禁止事項

* AI による正式 Version 更新
* 自動 Version 更新・自動 Approval
* 承認なしの Official 差し替え
* Version 履歴 / Audit の削除
