# Rollback Execution（Phase10-1）

仕様: `docs/specs/controlled_production_adoption_phase10_1.md`  
親文書: `docs/controlled_production_adoption.md`  
Exit: `docs/adoption_exit_criteria.md`（Phase10-0）  
Incident: `docs/incident_response.md`

Rollback の条件・フロー・承認を定義する。

---

## 1. 実施条件

* Critical Incident
* KPI Failure
* Security Issue
* Governance Violation

---

## 2. Rollback Flow

```text
Detect
    ↓
Assess
    ↓
Contain
    ↓
Rollback
    ↓
Review
```

---

## 3. Human Approval

```text
Rollback requires Human Approval.
```

* AI 単独 Rollback 禁止
* Rollback Record を Production Record / Adoption Audit に残す
* Phase7 Change / Incident / Deploy Rollback 実行境界と整合する
