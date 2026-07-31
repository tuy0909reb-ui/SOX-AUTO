# Health Decision Gate（Phase11-2）

仕様: `docs/specs/operational_health_management_phase11_2.md`  
親文書: `docs/operational_health_management.md`  
Metrics: `docs/health_metrics.md`

---

## 1. Gate

```text
Healthy
    ↓
Continue

Attention
    ↓
Observe

Warning
    ↓
Review

Critical
    ↓
Immediate Review
```

---

## 2. Metrics との関係

```text
Health Metrics support Health Assessment
and Health Decision Gate.
```

Gate 結果は判断支援である。Recovery Execution / Production Change は本 Gate では行わない。Human Approval 必須。
