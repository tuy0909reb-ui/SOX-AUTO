# Lifecycle Maintenance（Phase11-1）

仕様: `docs/specs/lifecycle_maintenance_phase11_1.md`  
Governance: `docs/operational_lifecycle_governance.md`（Phase11-0）

本ドキュメントは、Production Capability を継続的に健全な状態へ維持するための運用方式を定義する。  
本フェーズは「改善」ではなく **維持（Maintenance）** を責務とする。

---

## 1. Maintenance Principles

```text
Maintenance preserves operational stability.
Maintenance follows approved lifecycle governance.
Maintenance requires evidence.
Maintenance never bypasses operational governance.
Maintenance ensures long-term operational continuity.
```

---

## 2. Maintenance Scope

対象: Capability / AI / Automation / Policy / Documentation / Knowledge  

対象外: Research / Adoption / Architecture Design / Optimization（Phase10-4）

---

## 3. Phase Interface

```text
Phase11-0 Lifecycle Governance
        ↓
Phase11-1 Lifecycle Maintenance
        ↓
Phase11-2 Operational Health Management
        ↓
Phase11-3 Operational Incident & Recovery
        ↓
Phase11-4 Operational Knowledge Evolution
```

Maintenance（本文書）は **維持** を担う。Health（`operational_health_management.md`）は Maintenance Status 等を監視対象として取り込み、Maintenance Execution を代替しない。  
Recovery（`recovery_management.md`）は **障害復旧** であり、Maintenance（定常保守）と混同しない。

---

## 4. 関連文書

| 文書 | 内容 |
|---|---|
| `maintenance_lifecycle.md` | Maintenance Lifecycle |
| `maintenance_types.md` | Maintenance Types |
| `maintenance_frequency.md` | Maintenance Frequency |
| `maintenance_trigger.md` | Maintenance Trigger |
| `maintenance_scheduling_policy.md` | Maintenance Scheduling Policy |
| `maintenance_planning.md` | Maintenance Planning |
| `maintenance_window.md` | Maintenance Window |
| `maintenance_review.md` | Maintenance Review |
| `maintenance_approval_levels.md` | Maintenance Approval Levels |
| `maintenance_readiness_checklist.md` | Maintenance Readiness Checklist |
| `maintenance_dependency_coordination.md` | Maintenance Dependency Coordination |
| `maintenance_execution.md` | Maintenance Execution |
| `maintenance_verification.md` | Maintenance Verification |
| `maintenance_success_criteria.md` | Maintenance Success Criteria |
| `maintenance_decision_gate.md` | Maintenance Decision Gate |
| `maintenance_classification.md` | Maintenance Classification |
| `maintenance_exception_handling.md` | Maintenance Exception Handling |
| `maintenance_metrics.md` | Maintenance Metrics |
| `maintenance_record.md` | Maintenance Record |
| `maintenance_traceability.md` | Maintenance Traceability |
| `maintenance_risk.md` | Maintenance Risk |
| `maintenance_knowledge.md` | Maintenance Knowledge |
| `maintenance_boundary.md` | Human / AI / Automation Boundary |
| `operational_health_management.md` | Operational Health Management（Phase11-2） |
| `health_monitoring.md` | Health Monitoring（Maintenance Status 監視） |
| `health_recovery_coordination.md` | Health Recovery Coordination |
| `operational_incident_recovery.md` | Operational Incident & Recovery（Phase11-3） |
| `recovery_management.md` | Recovery Management（障害復旧 ≠ 定常保守） |
| `operational_knowledge_evolution.md` | Operational Knowledge Evolution（Phase11-4） |
| `knowledge_reuse.md` | Knowledge Reuse（→ Maintenance Planning） |
| `knowledge_sources.md` | Knowledge Sources（Maintenance 入力） |
