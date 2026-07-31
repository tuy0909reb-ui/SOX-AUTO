# Controlled Rollout（Phase10-1）

仕様: `docs/specs/controlled_production_adoption_phase10_1.md`  
親文書: `docs/controlled_production_adoption.md`  
Lifecycle: `docs/adoption_lifecycle.md`（Phase10-0）

段階導入を定義する。

---

## 1. 段階

```text
Pilot
    ↓
Limited
    ↓
Gradual Expansion
    ↓
GA
```

---

## 2. 原則

* 一度に全展開しない（段階導入）
* 各段階で Validation を実施
* 異常時は即停止可能
* Rollback は常に可逆

各段階の Expansion / GA Approval は Human Decision Boundary に従う。
