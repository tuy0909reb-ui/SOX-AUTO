# Recovery Management（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Maintenance: `docs/lifecycle_maintenance.md`  
Decision Gate: `docs/recovery_decision_gate.md`

---

## 1. 対象

* Rollback
* Service Restoration
* Configuration Recovery
* Dependency Recovery

---

## 2. Maintenance との責務分離

```text
Maintenance = 定常保守（11-1）
Recovery = 障害復旧（11-3）
```

Recovery Approval は Human 必須。自動復旧・無承認 Rollback は禁止。
