# Operational Health Management（Phase11-2）

仕様: `docs/specs/operational_health_management_phase11_2.md`  
Maintenance: `docs/lifecycle_maintenance.md`（Phase11-1）  
Governance: `docs/operational_lifecycle_governance.md`（Phase11-0）

本ドキュメントは、Production 運用中の健全性を継続監視し、異常兆候を早期に検知・評価・判断支援するための運用方式を定義する。

---

## 1. Health Principles

```text
Operational health is continuously observed.
Health assessment requires evidence.
Health status supports human decision.
Health monitoring never changes production automatically.
Operational visibility supports long-term stability.
```

---

## 2. Health Scope

対象: Capability / AI / Automation / Policy / Knowledge / Documentation / Operational Process  

対象外: Research / Adoption / Architecture Design / Lifecycle Governance / Maintenance Execution

---

## 3. Health Monitoring Model

```text
Operational State
        ↓
Monitoring
        ↓
Health Assessment
        ↓
Health Classification
        ↓
Trend Analysis
        ↓
Decision Support
        ↓
Operational Continuation
```

---

## 4. Phase Interface

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

Health Management は監視・評価・判断支援を担い、Lifecycle Decision / Maintenance Execution / Recovery Execution を代替しない。  
Health Alert は Phase11-3 Incident Detection の入力となる。Recovery Coordination は調整のみで、Recovery Execution は Phase11-3 に従う。

---

## 5. 関連文書

| 文書 | 内容 |
|---|---|
| `health_monitoring.md` | Health Monitoring |
| `health_indicators.md` | Health Indicators |
| `health_classification.md` | Health Classification |
| `health_threshold.md` | Health Threshold |
| `health_monitoring_frequency.md` | Health Monitoring Frequency |
| `health_review.md` | Health Review |
| `health_trend_analysis.md` | Health Trend Analysis |
| `health_alert_management.md` | Health Alert Management |
| `health_dashboard.md` | Health Dashboard |
| `health_reporting.md` | Health Reporting |
| `health_decision_gate.md` | Health Decision Gate |
| `health_recovery_coordination.md` | Health Recovery Coordination |
| `health_metrics.md` | Health Metrics |
| `health_traceability.md` | Health Traceability |
| `health_readiness.md` | Health Readiness |
| `health_ownership.md` | Health Ownership |
| `health_boundary.md` | Human / AI / Automation Boundary |
| `operational_incident_recovery.md` | Operational Incident & Recovery（Phase11-3） |
| `incident_detection.md` | Incident Detection（Health Alert 入力） |
| `recovery_decision_gate.md` | Recovery Decision Gate |
| `incident_boundary.md` | Incident Boundary |
| `operational_knowledge_evolution.md` | Operational Knowledge Evolution（Phase11-4） |
| `knowledge_reuse.md` | Knowledge Reuse（→ Health Threshold） |
| `knowledge_sources.md` | Knowledge Sources（Health 入力） |
