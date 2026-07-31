# AI Evidence Based Validation（Phase8-1）

仕様: `docs/specs/ai_decision_support_phase8_1.md`  
Decision Support: `docs/ai_decision_support.md`  
Recommendation: `docs/ai_recommendation_policy.md`  
AI Audit: `docs/ai_audit.md`

AI 出力を事実情報と区別し、根拠確認なしの採用を禁止する。

---

## 1. 確認対象（Evidence）

| 種別 | ソース例 |
|---|---|
| Reference Data | 仕様・Runbook パス、Release tag、文書 Version |
| Logs | GitHub Actions 失敗 Step、運用ログ要約（Secret なし） |
| Metrics | Observability / Daily Report の指標 |
| Incident History | INC-、Severity、復旧記録 |
| Review Records | REL- / SEC- / CHG- / AA- |

---

## 2. Validation 手順

```text
AI Suggestion / Candidates
        ↓
Evidence 収集（出所を記録）
        ↓
AI生成内容 vs 事実情報の突合
        ↓
Pass / Fail / Needs more data
        ↓
Human Review（Pass のみ Approve 候補）
```

| 結果 | 扱い |
|---|---|
| Pass | Human Review へ進める（Approve は別工程） |
| Fail | 候補却下または修正要求。採用禁止 |
| Needs more data | 追加確認必須。Low Confidence と同様に採用保留 |

要件:

* 根拠データを確認可能にする（ID / URL / パス）
* AI 生成内容と事実情報を記録上で区別する
* **Validation なしの採用は禁止**

---

## 3. 分析結果と根拠の分離

| 欄 | 内容 |
|---|---|
| AI Analysis / Suggestion | モデル出力の要約（仮説・候補） |
| Evidence | 実測・記録・文書からの事実 |
| Gap | 未確認・矛盾・欠測 |

未確認を確定情報として書かない。矛盾がある場合は Fail または Needs more data。

---

## 4. Validator 記録

Validation 実施時に記録:

* Validator（実施者）
* 日時
* 結果（Pass / Fail / Needs more data）
* Evidence 一覧
* 関連 AIA-

AIA- の Reference Data / Human Decision に Validation 結果を反映する。

---

## 5. Change / Automation への接続

* Validation Pass かつ Human Approve 後のみ、CHG / AA- へ進める
* Validation Fail のまま Advanced Automation に載せない
* Evidence 欠落のまま本番変更しない

---

## 6. 禁止事項

* Validation スキップでの採用
* AI 出力をログ事実として記録すること
* Secret を Evidence として貼付すること
* Confidence のみでの Validation Pass 扱い
