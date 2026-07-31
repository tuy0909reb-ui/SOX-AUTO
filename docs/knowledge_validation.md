# Knowledge Validation（Phase8-2）

Ownership: `docs/document_ownership_policy.md`  
Primary SoT: Phase8-2 / Additive Section: Phase11-4（Primary 定義を上書きしない）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Lifecycle: `docs/knowledge_lifecycle.md`  
Trust Level: `docs/knowledge_trust_level.md`  
AI Validation: `docs/ai_validation.md`（Phase8-1）

Knowledge の検証状態を管理し、未確認知識の正式利用を防ぐ。

---

## 1. Validation 状態

```text
Validated
Needs Review
Deprecated
```

| 状態 | 意味 | 正式利用 / AI |
|---|---|---|
| Validated | 検証済み | 可（Trust と合わせて） |
| Needs Review | 要再確認 | 正式利用不可。Draft 相当扱い可 |
| Deprecated | 廃止・非推奨 | 正式利用不可。Historical へ |

---

## 2. 要件

* 古い情報を識別する（最終検証日・関連 Version）
* 更新履歴を保持する
* 未確認 Knowledge（Needs Review / Draft）を正式利用しない
* Phase8-1 Evidence Validation と矛盾する場合は Needs Review

---

## 3. 状態遷移（概要）

| From → To | 条件 |
|---|---|
| Needs Review → Validated | Human 検証完了 |
| Validated → Needs Review | 不整合・陳腐化の疑い |
| * → Deprecated | 廃止決定（CHG 推奨） |

状態変更は Audit 対象。AI による正式状態変更は禁止。

---

## 4. 禁止事項

* Needs Review / Deprecated を Official 根拠にすること
* Validation 状態の改ざん・削除
* 自動 Validation 完了扱い

---

## 5. Phase11-4 Operational Knowledge Evolution Validation（Additive Section）

仕様: `docs/specs/operational_knowledge_evolution_phase11_4.md`  
親文書: `docs/operational_knowledge_evolution.md`  
Decision Gate: `docs/knowledge_decision_gate.md`

### 確認項目

* Evidence
* Review
* Traceability
* Approval

### 原則

```text
Knowledge validation requires human approval.
```

Phase8-2 Validation 状態（Validated / Needs Review / Deprecated）を前提とし、  
Phase11-4 は運用知見の Publish 前 Validation（Evidence / Trace / Human Approval）を追加定義する。  
AI による Validation 完了扱い・自動 Publish は禁止。
