# Adoption Lifecycle（Phase10-0）

仕様: `docs/specs/production_adoption_governance_phase10_0.md`  
親文書: `docs/production_adoption_governance.md`

Production 採用の成熟度・導入段階を定義する。研究成熟度（Phase9）とは独立する。

---

## 1. Adoption Lifecycle

```text
Candidate
    ↓
Adoption Review
    ↓
Pilot Production
    ↓
Limited Production
    ↓
Operational Validation
    ↓
Production Standard
```

---

## 2. 段階説明

| 段階 | 内容 |
|---|---|
| Candidate | Phase9 Exit（Validated → Candidate）を満たした採用候補 |
| Adoption Review | 技術・運用・Security・Reliability・AI/Policy 整合のレビュー |
| Pilot Production | 限定範囲での本番パイロット |
| Limited Production | 限定ユーザー / 限定範囲への拡大 |
| Operational Validation | 運用検証・KPI / Stability 確認 |
| Production Standard | 標準運用として定着 |

---

## 3. Adoption Maturity Level

```text
Approved
    ↓
Pilot Production
    ↓
Limited Production
    ↓
General Availability (GA)
```

要件:

* 各段階で評価指標を満たすこと
* GA 昇格には Operational Validation を必須とする

---

## 4. Phase9 / Phase10-1 接続

```text
Validated
    ↓
Candidate
    ↓
Adoption Review
```

Approved Candidate の本番導入手順は Phase10-1 Controlled Production Adoption（`controlled_production_adoption.md` / `controlled_rollout.md`）に従う。

```text
Adoption Lifecycle（Phase10-0）
        ↓
Controlled Rollout（Phase10-1）
Pilot → Limited → Gradual Expansion → GA → Stabilization
        ↓
Operational Validation（Phase10-2）
Continuous Validation / Decision Gate / Knowledge Feedback
```
