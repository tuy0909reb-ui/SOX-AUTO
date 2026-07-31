# Knowledge Trust Level（Phase8-2）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Source Policy: `docs/knowledge_source_policy.md`  
Versioning: `docs/knowledge_versioning.md`

Knowledge 品質を Trust Level で管理し、AI 参照を制御する。

---

## 1. Trust Level 定義

```text
Official
 └ 最新・承認済み

Validated
 └ 検証済み

Historical
 └ 過去情報・参考用途

Draft
 └ 未承認・未検証
```

| Level | 意味 | AI参照 |
|---|---|---|
| Official | 現行の承認済み知識 | 可 |
| Validated | 検証済み（現行または限定用途） | 可 |
| Historical | 過去版・参考 | 参考のみ |
| Draft | 未承認・未検証 | 不可 |

---

## 2. AI 参照制御

* AI 参照前に Trust Level を確認する
* Official / Validated のみを確定根拠の候補とする
* Historical は「参考」と明示し、単独で Decision 根拠にしない
* Draft は入力・Evidence に含めない

---

## 3. Trust Level 変更ルール

| 変更 | 条件 |
|---|---|
| Draft → Validated / Official | Human Review + 必要に応じ Change Management |
| Validated → Official | 承認・現行化の明示 |
| Official → Historical | 新 Version 承認後、または廃止 |
| 任意 → Draft | 問題発見時。AI 参照から即除外 |

* Trust Level 変更は **Audit 対象**（日時・変更者・理由・関連 CHG）
* AI による Trust Level 正式変更は禁止

---

## 4. Review 対象

次を定期または変更時に Review する:

* Official が最新か
* Validated の検証根拠が残っているか
* Historical の誤用がないか
* Draft が AI 経路に混入していないか

Security / Reliability / Governance Review で確認可能にする。

---

## 5. 禁止事項

* Draft の AI 利用
* 承認なしの Official 昇格
* Trust Level 変更履歴の削除
