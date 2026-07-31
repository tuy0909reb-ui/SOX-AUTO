# Escalation Policy（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Classification: `docs/incident_classification.md`

---

## 1. Policy

```text
Information
    ↓
Owner

Minor
    ↓
Operational Governance

Major
    ↓
Operational Governance
    ↓
Emergency Review

Critical
    ↓
Emergency Governance
    ↓
Executive Approval
```

---

## 2. 役割分離

```text
Incident Classification represents incident severity.
Escalation Policy defines organizational response.
```

Escalation は Human 必須。AI による Escalation 決定は禁止。
