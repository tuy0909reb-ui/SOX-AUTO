# Incident Boundary（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`

Human / AI / Automation Boundary を定義する。

---

## 1. Human

* Incident Approval
* Escalation
* Recovery Approval
* RCA Approval

---

## 2. AI

* Correlation
* Timeline Analysis
* RCA Assistance
* Recommendation

---

## 3. Automation

* Detection
* Notification
* Logging
* Monitoring

---

## 4. 禁止

* Incident management による Production 自動変更
* 自動復旧・無承認 Rollback
* AI による Escalation / Recovery / RCA Approval
* Human Approval 省略
