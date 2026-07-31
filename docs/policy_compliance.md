# Policy Compliance Integration（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`

Policy as Code Research と既存 Governance / Security / Reliability / AI / Research 統制との接続を整理する。  
接続は研究上の整合確認であり、本番 Policy の置換ではない。

---

## 1. 確認対象

* Phase7 Governance
* Security
* Reliability
* AI Governance
* Research Governance

---

## 2. 接続方針

| 領域 | 研究上の接続 | 禁止 |
|---|---|---|
| Phase7-0 | Change / Risk / 承認との整合確認 | 未承認の本番 Policy 変更 |
| Security | Security Policy 表現の適合性研究 | Secrets / Security 本番変更 |
| Reliability | Reliability Policy 表現の適合性研究 | 自動復旧導入 |
| AI Governance | AI Policy と HITL 境界の整合 | AI による Policy 自動変更 |
| Research Governance | Research ≠ Production / Audit / Transition | Production 制御 |

---

## 3. Risk（研究）

* 誤 Policy
* Policy 競合
* 過剰制約
* 制約不足
* 誤判定
* Policy Drift

原則:

```text
Research Policy never controls Production.
```
