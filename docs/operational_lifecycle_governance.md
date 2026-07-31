# Operational Lifecycle Governance（Phase11-0）

仕様: `docs/specs/operational_lifecycle_governance_phase11_0.md`  
Phase10: `docs/reports/production_adoption_completion_report.md`  
Phase11 Completion: `docs/reports/operational_lifecycle_completion_report.md`  
Framework Navigation: `docs/framework_navigation.md`

本ドキュメントは、Production に採用された Capability・Policy・AI・Automation・Knowledge を長期的に維持・更新・廃止するための統制方式を定義する。

---

## 1. Lifecycle Principles

```text
Principle 1
Every operational capability has a lifecycle.
```

```text
Principle 2
Lifecycle decisions require Human Approval.
```

```text
Principle 3
Lifecycle changes require Evidence.
```

```text
Principle 4
Retirement is governed, not abandoned.
```

```text
Principle 5
Lifecycle governance ensures long-term operational stability.
```

---

## 2. Lifecycle Scope

対象: Operational Capability / AI Capability / Automation Capability / Policy / Knowledge / Operational Procedure / Documentation  

対象外: Research / Draft Capability / Experimental AI / Experimental Policy

---

## 3. Phase Interface

```text
Phase10 Production Adoption
        ↓
Phase11-0 Operational Lifecycle Governance
        ↓
Phase11-1 Lifecycle Maintenance
        ↓
Phase11-2 Operational Health Management
        ↓
Phase11-3 Operational Incident & Recovery
        ↓
Phase11-4 Operational Knowledge Evolution
        ↓
Phase11-0 Lifecycle Governance（Next Lifecycle）
```

Governance（本文書）は Lifecycle Decision / Version / Deprecation / Retirement / Archive を統制する。  
Maintenance（`lifecycle_maintenance.md`）は Production Capability の **維持** を担い、Governance を代替しない。  
Health（`operational_health_management.md`）は健全性の **監視・評価・判断支援** を担い、Governance / Maintenance Execution を代替しない。  
Incident & Recovery（`operational_incident_recovery.md`）は障害発生後の **対応・復旧** を担い、Maintenance / Health Monitoring を代替しない。  
Knowledge Evolution（`operational_knowledge_evolution.md`）は運用知見を体系化し、**次サイクルの Lifecycle Governance** へ還元する。  
Lessons Learned → Knowledge → Governance の循環を維持する。

---

## 4. 関連文書

| 文書 | 内容 |
|---|---|
| `lifecycle_model.md` | Lifecycle Model |
| `lifecycle_states.md` | Lifecycle States |
| `lifecycle_trigger.md` | Lifecycle Trigger |
| `lifecycle_review.md` | Lifecycle Review |
| `lifecycle_ownership.md` | Lifecycle Ownership |
| `version_governance.md` | Version Governance |
| `deprecation_governance.md` | Deprecation Governance |
| `retirement_governance.md` | Retirement Governance |
| `archive_governance.md` | Archive Governance |
| `lifecycle_audit.md` | Lifecycle Audit |
| `lifecycle_traceability.md` | Lifecycle Traceability |
| `lifecycle_maturity.md` | Lifecycle Maturity |
| `end_of_life_policy.md` | End-of-Life Policy |
| `lifecycle_decision_gate.md` | Lifecycle Decision Gate |
| `docs/decision_gate_catalog.md` | Decision Gate Catalog（横断索引） |
| `lifecycle_metrics.md` | Lifecycle Metrics |
| `dependency_review.md` | Dependency Review |
| `lifecycle_risk_classification.md` | Lifecycle Risk Classification |
| `lifecycle_maintenance.md` | Lifecycle Maintenance（Phase11-1） |
| `maintenance_boundary.md` | Maintenance Boundary |
| `maintenance_traceability.md` | Maintenance Traceability |
| `operational_health_management.md` | Operational Health Management（Phase11-2） |
| `health_boundary.md` | Health Boundary |
| `health_traceability.md` | Health Traceability |
| `operational_incident_recovery.md` | Operational Incident & Recovery（Phase11-3） |
| `lessons_learned.md` | Lessons Learned（→ Lifecycle Governance） |
| `incident_boundary.md` | Incident Boundary |
| `operational_knowledge_evolution.md` | Operational Knowledge Evolution（Phase11-4） |
| `knowledge_reuse.md` | Knowledge Reuse（→ Governance Update） |
| `knowledge_decision_gate.md` | Knowledge Decision Gate |
| `knowledge_boundary.md` | Knowledge Boundary |
| `docs/reports/operational_lifecycle_completion_report.md` | Phase11 Documentation Architecture 完了証跡（Version 2.0） |
