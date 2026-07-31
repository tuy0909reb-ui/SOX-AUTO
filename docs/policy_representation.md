# Policy Representation（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`

Policy の表現方式を比較・評価する。表現方式の正式採用・本番適用は行わない。

---

## 1. 候補

```text
YAML
JSON
DSL
Rego
CUE
Custom Schema
```

---

## 2. 評価項目

* 可読性
* 保守性
* 学習コスト
* 拡張性
* 検証容易性

---

## 3. 研究上の扱い

* 比較結果は Research Artifact（Comparison Report）として記録する
* 表現方式の選択は Human Review を経る
* Production Policy の書式変更は対象外
