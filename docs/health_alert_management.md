# Health Alert Management（Phase11-2）

仕様: `docs/specs/operational_health_management_phase11_2.md`  
親文書: `docs/operational_health_management.md`  
Classification: `docs/health_classification.md`

---

## 1. Alert Levels

```text
Information
Notice
Warning
Critical
```

---

## 2. Classification との役割分離

```text
Health Classification represents operational status.
Alert Level represents notification urgency.
```

---

## 3. Boundary

| 層 | 可能 | 不可 |
|---|---|---|
| AI | Correlation / Summarization | Alert Approval / Production Change |
| Automation | Notification（収集後） | Production Change |
| Human | Escalation / Assessment Approval | — |
