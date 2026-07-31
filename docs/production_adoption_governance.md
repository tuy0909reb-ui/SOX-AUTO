# Production Adoption Governance（Phase10-0）

仕様: `docs/specs/production_adoption_governance_phase10_0.md`

本ドキュメントは、研究成果（Validated / Candidate）を Production へ安全に採用するための統制ルールを定義する。  
個別機能の実装や運用改善は Phase10-1 以降で扱う。

---

## 1. 概要

Phase10-0 Production Adoption Governance は、以下を前提とする。

* Phase7 Operational Governance
* Phase8 AI Governance
* Phase9 Research Governance

扱う範囲:

* 採用基準 / 採用レビュー / 段階的導入
* 採用監査 / 採用後評価 / 採用成熟度
* 採用廃止基準 / 採用トレーサビリティ

---

## 2. Production Adoption Principles

```text
Principle 1
Production follows Validated Research only.
```

```text
Principle 2
Human Approval is mandatory.
```

```text
Principle 3
Production must remain reversible.
```

```text
Principle 4
Evidence precedes Adoption.
```

```text
Principle 5
Operational Stability has priority.
```

---

## 3. Research → Production 境界

昇格可能:

```text
Validated
    ↓
Candidate
    ↓
Approved
```

昇格不可:

* Research / Experiment
* Draft Policy / Experimental Agent
* Concept / PoC / Pilot（未検証）

---

## 4. Human Approval 原則

```text
AI may recommend.

AI never approves.

Human is the final authority.
```

```text
Research Recommendation
        ↓
Technical Review
        ↓
Operational Review
        ↓
Final Human Approval
        ↓
Production Adoption
```

---

## 5. Production Boundary

採用対象:

* Validated Research / Candidate Technology
* Approved Policy / Approved AI Capability / Approved Automation Capability

対象外:

* Concept / PoC / Pilot
* Experimental Policy / Experimental Agent / 未検証 AI

---

## 6. Phase 接続

| Phase | 接続 |
|---|---|
| Phase7 | Change / Risk / Rollback / Operational Control |
| Phase8 | AI Capability 採用時の HITL / Decision Support |
| Phase9 | Validated → Candidate → Adoption Review |
| Phase10-1 | 個別機能実装・運用改善（本 Phase の次工程） |
| Phase11-0 | Adopted → Production Runtime → Lifecycle Governance（逆リンク必須） |

Framework Navigation: `docs/framework_navigation.md`  
Decision Gate Catalog: `docs/decision_gate_catalog.md`  
Connection Validation: `docs/reports/phase10_phase11_connection_validation.md`

---

## 6.1 Adoption → Lifecycle（逆リンク）

Production Adoption で Adopt された Capability / Policy / AI / Automation は、  
Production Runtime 投入後、**必ず Phase11-0 Operational Lifecycle Governance へ接続する**。

```text
Adopted → Production Runtime → Lifecycle（Phase11-0）
```

| Adoption結果 | 次工程 |
|---|---|
| Adopt | Production → Lifecycle（11-0） |
| Revise | Research へ戻る |
| Reject | Research へ戻る（改善案化） |

関連文書:

* `docs/operational_lifecycle_governance.md`
* `docs/lifecycle_decision_gate.md`
* `docs/reports/operational_lifecycle_completion_report.md`

Lifecycle Decision / Deprecation / Retirement は Phase11-0 の責務。Adoption は入口であり Lifecycle を代替しない。

---

## 7. 関連文書

| 文書 | 内容 |
|---|---|
| `adoption_lifecycle.md` | Adoption Lifecycle |
| `adoption_review.md` | Adoption Review |
| `adoption_audit.md` | Adoption Audit |
| `adoption_traceability.md` | Research → Production Trace |
| `adoption_deployment_strategy.md` | 段階導入 |
| `post_adoption_review.md` | 採用後評価 |
| `adoption_exit_criteria.md` | 廃止・Rollback 条件 |
| `docs/framework_navigation.md` | Framework Navigation（逆リンク含む） |
| `docs/operational_lifecycle_governance.md` | Operational Lifecycle Governance（Phase11-0） |
| `docs/decision_gate_catalog.md` | Decision Gate Catalog |
