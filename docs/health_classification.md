# Health Classification（Phase11-2）

仕様: `docs/specs/operational_health_management_phase11_2.md`  
親文書: `docs/operational_health_management.md`  
Alert: `docs/health_alert_management.md`

---

## 1. Classification

```text
Healthy
Attention
Warning
Critical
```

---

## 2. Alert との役割分離

```text
Health Classification represents operational status.
Alert Level represents notification urgency.
```

Classification は運用状態、Alert は通知緊急度であり、混同しない。
