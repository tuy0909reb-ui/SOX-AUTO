# Operational Knowledge Evolution（Phase11-4）

仕様: `docs/specs/operational_knowledge_evolution_phase11_4.md`  
Incident: `docs/operational_incident_recovery.md`（Phase11-3）  
Lifecycle Governance: `docs/operational_lifecycle_governance.md`（Phase11-0）  
Knowledge Operations（Phase8-2）: `docs/knowledge_management.md`

本ドキュメントは、Production 運用で得られた知見を体系化し、  
Governance・Maintenance・Health・Incident・Operational Process へ還元する Knowledge Evolution Layer を定義する。

単なる知識管理ではなく、**運用経験を次のライフサイクルへ循環させる**層である。

---

## 1. Knowledge Principles

```text
Operational knowledge is evidence-based.
Knowledge evolution supports future operations.
Knowledge requires validation.
Knowledge never changes production automatically.
Knowledge is governed throughout its lifecycle.
```

---

## 2. Knowledge Scope

対象: Lessons Learned / Operational Procedures / Best Practices / Recovery Knowledge / Maintenance Knowledge / Health Knowledge / AI Operational Knowledge  

対象外: Research / Draft Ideas / Experimental Knowledge

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
        ↓
Phase11-0 Lifecycle Governance（Next Lifecycle）
```

Phase8-2 Knowledge Management は AI 参照知識基盤の管理を担う。  
Phase11-4 は運用ライフサイクル循環の出口として、次サイクルの Governance（11-0）へ還元する。責務を混同しない。

---

## 4. 関連文書

| 文書 | 内容 |
|---|---|
| `knowledge_lifecycle.md` | Knowledge Lifecycle（Phase8-2 + Phase11-4） |
| `knowledge_sources.md` | Knowledge Sources |
| `knowledge_classification.md` | Knowledge Classification |
| `knowledge_validation.md` | Knowledge Validation（Phase8-2 + Phase11-4） |
| `knowledge_repository.md` | Knowledge Repository |
| `knowledge_evolution.md` | Knowledge Evolution |
| `knowledge_recommendation.md` | Knowledge Recommendation |
| `knowledge_metrics.md` | Knowledge Metrics |
| `knowledge_traceability.md` | Knowledge Traceability |
| `knowledge_quality.md` | Knowledge Quality |
| `knowledge_reuse.md` | Knowledge Reuse |
| `knowledge_governance.md` | Knowledge Governance |
| `knowledge_decision_gate.md` | Knowledge Decision Gate |
| `knowledge_boundary.md` | Human / AI / Automation Boundary |
| `lessons_learned.md` | Lessons Learned（入力） |
| `knowledge_management.md` | Knowledge Management（Phase8-2） |
