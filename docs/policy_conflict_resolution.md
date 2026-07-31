# Policy Conflict Resolution（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`

Policy 間の競合検出・分類・解決戦略を研究する。最終判断は Human Review。

---

## 1. 対象例

```text
Security Policy vs Automation Policy
AI Policy vs Governance Policy
Reliability Policy vs Research Policy
```

---

## 2. 研究項目

* Conflict Detection
* Conflict Classification
* Conflict Resolution Strategy
* Human Review による最終判断

---

## 3. 原則

* AI による競合解決の自動確定は禁止
* 競合解消結果を本番 Policy に適用しない
* Research Audit に検出・分類・判断理由を記録する
