# Operational Incident & Recovery（Phase11-3）

仕様: `docs/specs/operational_incident_recovery_phase11_3.md`  
Health: `docs/operational_health_management.md`（Phase11-2）  
Maintenance: `docs/lifecycle_maintenance.md`（Phase11-1）  
Runbook（Phase6-3-A）: `docs/incident_response.md`

本ドキュメントは、Production 運用中に発生した障害・異常・重大イベントについて、  
検知 → 分類 → エスカレーション → 対応 → 復旧 → 検証 → 記録 → 再発防止までを統制する。

本フェーズは「予防」ではなく **インシデント発生後の対応・復旧** を責務とする。

---

## 1. Incident Principles

```text
Incident response prioritizes operational stability.
Incident classification requires evidence.
Recovery decisions require human approval.
Incident management never changes production automatically.
Post-incident learning supports long-term resilience.
```

---

## 2. Incident Scope

対象: Capability / AI / Automation / Policy / Knowledge / Documentation / Operational Process  

対象外: Research / Adoption / Maintenance（11-1） / Health Monitoring（11-2） / Architecture Design

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

---

## 4. 責務分離

| 領域 | 文書 | 責務 |
|---|---|---|
| Health Classification | `health_classification.md` | 運用状態 |
| Incident Classification | `incident_classification.md` | インシデント重大度 |
| Maintenance | `lifecycle_maintenance.md` | 定常保守（11-1） |
| Recovery | `recovery_management.md` | 障害復旧（11-3） |
| Lessons Learned | `lessons_learned.md` | 将来の Lifecycle Governance を支援 |
| Knowledge Evolution | `operational_knowledge_evolution.md` | Lessons → Knowledge → Next Lifecycle |

運用初動 Runbook（Severity / 固定初動順）は Phase6-3-A `incident_response.md` を参照する。

---

## 5. 関連文書

| 文書 | 内容 |
|---|---|
| `incident_lifecycle.md` | Incident Lifecycle |
| `incident_classification.md` | Incident Classification |
| `incident_detection.md` | Incident Detection |
| `incident_response.md` | Incident Response（Phase11-3 Framework + Phase6-3-A Runbook） |
| `escalation_policy.md` | Escalation Policy |
| `recovery_management.md` | Recovery Management |
| `recovery_verification.md` | Recovery Verification |
| `recovery_readiness.md` | Recovery Readiness |
| `recovery_decision_gate.md` | Recovery Decision Gate |
| `incident_communication.md` | Incident Communication |
| `incident_timeline.md` | Incident Timeline |
| `root_cause_analysis.md` | Root Cause Analysis |
| `post_incident_review.md` | Post Incident Review |
| `lessons_learned.md` | Lessons Learned |
| `incident_metrics.md` | Incident Metrics |
| `incident_traceability.md` | Incident Traceability |
| `incident_record.md` | Incident Record |
| `incident_boundary.md` | Human / AI / Automation Boundary |
| `operational_knowledge_evolution.md` | Operational Knowledge Evolution（Phase11-4） |
| `knowledge_traceability.md` | Knowledge Traceability |
| `knowledge_decision_gate.md` | Knowledge Decision Gate |
