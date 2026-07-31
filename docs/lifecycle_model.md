# Lifecycle Model（Phase11-0）

仕様: `docs/specs/operational_lifecycle_governance_phase11_0.md`  
親文書: `docs/operational_lifecycle_governance.md`

---

## 1. Model

```text
Planning
    ↓
Production
    ↓
Operation
    ↓
Maintenance
    ↓
Review
    ↓
Upgrade
or
Deprecation
or
Retirement
```

Review 以降の分岐は `lifecycle_decision_gate.md` に従う。  
Production 自動変更は禁止。
