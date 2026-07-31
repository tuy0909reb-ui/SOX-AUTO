# Recovery Decision Gate（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Verification: `docs/recovery_verification.md`

---

## 1. Gate

```text
Recovery Verification
        ↓

RECOVERED
        ↓
Close Incident

PARTIAL
        ↓
Additional Recovery

ROLLBACK
        ↓
Rollback Execution

ESCALATE
        ↓
Emergency Governance
```

---

## 2. 原則

```text
Recovery decisions require human approval
and must follow evidence from verification.
```

AI は Recommendation のみ。Rollback Execution の最終承認は Human。
