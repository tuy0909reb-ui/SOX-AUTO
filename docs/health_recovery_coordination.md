# Health Recovery Coordination（Phase11-2）

仕様: `docs/specs/operational_health_management_phase11_2.md`  
親文書: `docs/operational_health_management.md`  
Phase11-3: `docs/operational_incident_recovery.md` / `docs/recovery_management.md` / `docs/recovery_decision_gate.md`

---

## 1. 対象

* Incident Response
* Maintenance
* Rollback
* Escalation

---

## 2. 原則

```text
Health management coordinates recovery,
but does not execute recovery itself.
```

Recovery Approval / Execution は Human および Phase11-3（`recovery_management.md` / `recovery_decision_gate.md`）に従う。  
Maintenance（11-1）は定常保守であり、Recovery（11-3）と混同しない。
