# Maintenance Boundary（Phase11-1）

仕様: `docs/specs/lifecycle_maintenance_phase11_1.md`  
親文書: `docs/lifecycle_maintenance.md`

Human / AI / Automation Boundary を定義する。

---

## 1. Human

* Planning
* Approval
* Execution Approval
* Verification Approval
* Rollback Approval

---

## 2. AI

* Analysis
* Recommendation

---

## 3. Automation

* Scheduled Execution（Approved Procedure のみ）
* Monitoring
* Reporting
* Notification

---

## 4. 禁止

* AI Final Decision / Approval
* Automation による未承認変更・自己変更・自律的最適化
* Human Approval 省略
* Production Boundary の迂回
