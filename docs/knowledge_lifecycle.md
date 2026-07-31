# Knowledge Lifecycle Management（Phase8-2）

Ownership: `docs/document_ownership_policy.md`  
Primary SoT: Phase8-2 / Additive Section: Phase11-4（Primary 定義を上書きしない）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Validation: `docs/knowledge_validation.md`  
Versioning: `docs/knowledge_versioning.md`  
Change Management: `docs/change_management.md`

Knowledge の作成から保管・廃止までの Lifecycle を定義する。

---

## 1. Lifecycle

```text
Create
 ↓
Review
 ↓
Approve
 ↓
Use
 ↓
Update
 ↓
Archive
```

| 段階 | 内容 |
|---|---|
| Create | 新規文書・INC Lesson・Review 記録の作成（多くは Draft） |
| Review | Human Review / Validation |
| Approve | 必要に応じ CHG + 承認 → Trust/Version 更新 |
| Use | Official / Validated として運用・AI 参照 |
| Update | 更新要求 → CHG → 新 Version |
| Archive | Deprecated / Historical。参照は参考のみ |

---

## 2. 更新責任者

| 対象 | 責任 |
|---|---|
| 起案 | 作成者 / 発見者 |
| Review | Validator / 領域オーナー |
| Approve | Phase7-0 承認者 |
| Use 中の監視 | 運用 / Security / Reliability Review |
| Archive | 承認済み廃止決定の実行者 |

AI は提案のみ。Lifecycle の正式進行は Human。

---

## 3. 廃止基準（例）

次のいずれかに該当する場合 Archive / Deprecated を検討:

* 後継 Official Version が承認された
* 手順が環境・仕様と整合しなくなった
* Security / Compliance 上の問題がある
* Needs Review が長期未解消

廃止も Change Management / Audit 対象。

---

## 4. Audit 追跡

各段階で追跡可能にする:

* 作成・承認・更新・Archive の日時と担当
* 関連 CHG / AIA- / Version
* Trust Level 変更履歴

Audit Record 削除禁止。

---

## 5. Change Management 接続

```text
Knowledge Update Request
        ↓
Human Review
        ↓
Phase7-0 Change Management
        ↓
Approval
        ↓
Version Update / Trust Update / Archive
```

---

## 6. 禁止事項

* AI による正式 Lifecycle 進行
* 承認なし Update / Archive
* 自動 Approval
* 履歴削除

---

## 7. Phase11-4 Operational Knowledge Evolution Lifecycle（Additive Section）

仕様: `docs/specs/operational_knowledge_evolution_phase11_4.md`  
親文書: `docs/operational_knowledge_evolution.md`  
Decision Gate: `docs/knowledge_decision_gate.md`

Phase8-2 は AI 参照知識の Create〜Archive を管理する。  
Phase11-4 は運用知見の Candidate〜Reuse〜次サイクル Lifecycle Review への循環を定義する。責務を混同しない。

```text
Knowledge Candidate
        ↓
Review
        ↓
Validation
        ↓
Approval
        ↓
Knowledge Repository
        ↓
Reuse
        ↓
Lifecycle Review（11-0）
```

Publication は Knowledge Decision Gate（PUBLISH）と Human Approval 必須。  
Production 自動変更・Policy 自動更新は禁止。
