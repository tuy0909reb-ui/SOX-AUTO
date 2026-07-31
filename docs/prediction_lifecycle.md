# Prediction Lifecycle（Phase9-4）

仕様: `docs/specs/predictive_aiops_research_phase9_4.md`  
親文書: `docs/predictive_aiops_research.md`

Prediction の成熟度を管理する。

---

## 1. Lifecycle

```text
Draft
    ↓
Validated
    ↓
Trusted
    ↓
Candidate
    ↓
Archived
```

---

## 2. 要件

* Prediction Version を保持する
* Validation を経ない昇格は禁止
* Drift 検知時は再評価する

---

## 3. Classification（Phase9-0 継承）

```text
Concept
    ↓
PoC
    ↓
Pilot
    ↓
Candidate
```

* Classification 変更は Validation 結果に基づく
* Classification 履歴を Research Audit へ記録する
