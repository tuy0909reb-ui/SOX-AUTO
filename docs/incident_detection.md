# Incident Detection（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
親文書: `docs/operational_incident_recovery.md`  
Health Alert: `docs/health_alert_management.md`

---

## 1. Triggers

* Health Alert
* Monitoring
* User Report
* Security Event
* Vendor Notification
* Operational Failure

---

## 2. 原則

Detection は Incident Lifecycle の開始条件である。  
Health Monitoring（11-2）の結果を Detection 入力として取り込む。  
Detection 自体は Production 自動変更・自動復旧を行わない。
