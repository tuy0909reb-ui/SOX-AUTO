# Policy Model（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`

研究対象となる Policy モデルを整理する。本番 Policy の置換・適用は行わない。

---

## 1. Policy Models

```text
Governance Policy
Security Policy
Reliability Policy
Automation Policy
AI Policy
Research Policy
```

| Model | 研究上の役割 | 本番適用 |
|---|---|---|
| Governance Policy | 変更・承認・境界の宣言的表現 | 禁止 |
| Security Policy | Secrets / Security 制約の表現研究 | 禁止 |
| Reliability Policy | Reliability / Review 接続の表現研究 | 禁止 |
| Automation Policy | Controlled Automation 制約の表現研究 | 禁止 |
| AI Policy | AI 利用境界の表現研究 | 禁止 |
| Research Policy | 研究専用 Policy（Production を制御しない） | 禁止 |

---

## 2. 要件

* Policy 責務を分離する
* Policy 依存関係を明確化する
* Policy 競合を識別可能とする

---

## 3. Hierarchy Research（研究）

優先順位モデルの研究対象例:

```text
Governance
      ↓
Security
      ↓
Compliance
      ↓
Reliability
      ↓
Automation
```

Hierarchy 変更は研究対象。本番環境への適用は行わない。
