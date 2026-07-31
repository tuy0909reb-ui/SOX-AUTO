# Policy as Code Research（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`

本ドキュメントは、運用ポリシーをコードとして定義・検証・評価する方式を研究するための概要である。  
研究のみを担当し、本番 Policy・本番 Automation・本番 Infrastructure への適用は行わない。

---

## 1. 概要

Phase9-2 Policy as Code Research は、

* Phase9-0 Research Governance
* Phase9-1 AI Agent Collaboration Research

を前提として、Policy の宣言的表現・Validation・Version・Testing・Lifecycle・Conflict・Compliance を研究する。

原則:

```text
Research Policy never controls Production.
```

---

## 2. Research Scope

研究対象:

* Declarative Policy
* Policy as Code
* Policy Validation
* Policy Versioning
* Policy Testing
* Policy Composition
* Compliance as Code
* Governance as Code
* Policy Evaluation Engine
* Policy Language比較

対象外:

* 本番 Policy 変更
* 本番 Security Policy 変更
* 本番 Automation 制御
* 本番 Infrastructure 適用
* 本番 CI/CD 適用

---

## 3. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7-0 | Governance / Change / Risk。本番 Policy 変更は CHG 対象であり、本研究は適用しない |
| Phase8-0 | AI Policy 研究は AI Governance 境界に従う |
| Phase8-1 | Decision Support への Policy Trace 研究（適用はしない） |
| Phase8-2 | Knowledge / Version との整合研究 |
| Phase8-3 | Automation Policy 評価の研究入力 |
| Phase9-0 | Research ≠ Production / Human Approval / Exit Criteria |
| Phase9-1 | Agent 境界下での Policy 研究入力 |
| Phase9-3 | Validated Policy → Autonomous Operations Research の基盤 |

---

## 4. Phase9-3 への接続

```text
Phase9-2
Policy as Code Research
        ↓
Validated Policy
        ↓
Phase9-3
Autonomous Operations Research
        ↓
Candidate Automation
        ↓
Phase10
Production Adoption
```

---

## 5. 関連文書

| 文書 | 内容 |
|---|---|
| `policy_model.md` | Policy Model |
| `policy_representation.md` | 表現方式比較 |
| `policy_validation.md` | Validation |
| `policy_version_management.md` | Version 管理 |
| `policy_testing.md` | Testing（研究用途） |
| `policy_lifecycle.md` | Lifecycle |
| `policy_conflict_resolution.md` | Conflict Resolution |
| `policy_compliance.md` | Compliance Integration |
| `policy_transition.md` | Exit Criteria / Future Adoption |

---

## 6. 禁止事項

* 本番 Policy 変更・Production への適用
* AI による Policy 自動変更
* Human Review 省略
* Research Audit 削除
* `tools/secretary/` 変更
