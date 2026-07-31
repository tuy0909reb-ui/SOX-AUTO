# Knowledge Source Policy（Phase8-2）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Knowledge Management: `docs/knowledge_management.md`  
Trust Level: `docs/knowledge_trust_level.md`  
Evidence Validation: `docs/ai_validation.md`（Phase8-1）

AI が参照してよい Knowledge Source と禁止データを定義する。

---

## 1. AI 参照可能な Knowledge（Approved Source）

```text
Official Documentation
Approved Runbook
Validated Incident Record
Approved Review Record
```

| ソース | 条件 |
|---|---|
| Official Documentation | Trust Level = Official、承認済み・現行 Version |
| Approved Runbook | 最新 Approved。過去版は Historical（参考のみ） |
| Validated Incident Record | Validation 済み / Trust が Validated 以上 |
| Approved Review Record | REL- / SEC- 等で承認または完了扱い |

AI 参照制御（Trust Level 連動）:

| Trust Level | AI参照 |
|---|---|
| Official | 可 |
| Validated | 可 |
| Historical | 参考のみ（確定根拠にしない） |
| Draft | 不可 |

---

## 2. AI 参照禁止

```text
Draft
未検証情報
Secrets
Credential情報
不明な生成情報
```

| 禁止 | 理由 |
|---|---|
| Draft Knowledge | 未承認・未検証 |
| 未検証情報 | Evidence Validation 未完了 |
| Secrets / Credential | Security / Compliance 境界 |
| 出所不明の AI 生成のみ | 事実と区別不可 |

---

## 3. Phase8-1 Evidence Validation 接続

```text
Knowledge Source（本文書）
        ↓
AI Decision Support Input
        ↓
Evidence Check（ai_validation.md）
        ↓
Human Review
```

* Source Policy 違反の入力は AI Analysis に載せない
* Evidence 突合時に Trust Level / Version を確認する
* Historical のみの根拠で Approve しない

---

## 4. 信頼性管理

* Source の Trust Level 変更は Audit 対象（AIA- / CHG 記録）
* 出所（パス・ID・Version）を常に記録する
* Phase8-0 AI Risk（誤情報・古い情報）と整合する

---

## 5. 禁止事項

* Draft の AI 利用
* Secrets / Credential の Knowledge 化
* 未検証情報を Official / Validated と偽ること
