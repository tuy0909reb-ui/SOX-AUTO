# Deployment Strategy（Phase10-1）

仕様: `docs/specs/controlled_production_adoption_phase10_1.md`  
親文書: `docs/controlled_production_adoption.md`

本番導入方式を管理する。

---

## 1. Strategy 候補

```text
Big Bang
Canary
Blue/Green
Rolling Update
Feature Flag
```

---

## 2. 評価項目

* Risk
* Rollback 容易性
* Downtime
* Operational Load

---

## 3. 原則

```text
Deployment Strategy shall minimize operational risk.
```

導入方式は対象システム・リスク評価に基づき選択する。  
選定結果は Deployment Plan / Production Record に記録する。
