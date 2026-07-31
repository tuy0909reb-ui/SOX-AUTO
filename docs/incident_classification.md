# Incident Classification（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Escalation: `docs/escalation_policy.md`  
Health Classification: `docs/health_classification.md`

---

## 1. Classification

```text
Information
Minor
Major
Critical
```

---

## 2. Escalation / Health との役割分離

```text
Incident Classification represents incident severity.
Escalation Policy defines organizational response.
```

Health Classification（Healthy / Attention / Warning / Critical）は運用状態を表す。  
Incident Classification はインシデント重大度を表す。混同しない。

Evidence 必須。自動分類による承認省略は禁止。
