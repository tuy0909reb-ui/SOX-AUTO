# Architecture Baseline – ASA-ARCH-18.0

**Baseline ID:** ASA-ARCH-18.0  
**Title:** Meta-Architecture / Convergence（successor to ASA-ARCH-17.0 Synthesis）  
**Version:** Draft 1.1（Phase 18.0 Frozen; Phase 18.1 Open）  
**Status:** Open — Active Draft（Phase 18.0 Frozen; Phases 18.1–18.4 Open）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-17.0（Presentation→Synthesis — Phase 17.1–17.9 Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-18.0.md`  

**Freeze（18.0）:** ASA-IMPL-REQ-ARCH-FREEZE-18.0-001  
**Acceptance（18.0）:** ASA-VERIFY-ARCH-18.0-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze Identifier:** ARCH-18.0-FREEZE  

---

## 1. Registration Declaration

本書は **ASA-ARCH-17.0 Phase 17.9 Frozen 後**の次期 Architecture Baseline である。

* Based on Architecture 17.0（Phase 17.1–17.9 Frozen）  
* Architecture 18.0 SHALL NOT modify Architecture 15.x / 16.x / 17.1–17.9  
* **Phase 18.0 Convergence / Meta-Architecture is Frozen / Accepted（Baseline 18.0）**  
* Phases 18.1 Runtime Orchestration / 18.2 Lifecycle / 18.3 Governance Runtime / 18.4 System Integration Freeze remain Open  

---

## 2. Scope Summary

```text
Architecture 18.0 Phase 18.0 defines runtime topology only.
Runtime execution, orchestration, lifecycle control, and governance runtime
are out of scope until Phases 18.1–18.3.
```

| Area | Change | Status |
|---|---|---|
| Phase 18.0 Convergence | SynthesisReport + GovernanceRegistry + HistoricalMetrics → ConvergenceManifest | **Frozen / Accepted** |
| Phase 18.1 Runtime Orchestration | （Open） | **Open** |
| Phase 18.2 Lifecycle Control | （Open） | **Open** |
| Phase 18.3 Governance Runtime | （Open） | **Open** |
| Phase 18.4 System Integration Freeze | （Open） | **Open** |

---

## 3. Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 0 | ASA-IMPL-REQ-CONVERGENCE-001 Final v1.1 — Convergence | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.0-001 — Phase 18.0 Freeze | **Implemented** |
| 1 | ASA-IMPL-REQ-RUNTIME-ORCHESTRATION-001 — Runtime Orchestration | **Open** |
| 2 | ASA-IMPL-REQ-LIFECYCLE-CONTROL-001 — Lifecycle Control | **Open** |
| 3 | ASA-IMPL-REQ-GOVERNANCE-RUNTIME-001 — Governance Runtime | **Open** |
| 4 | ASA-IMPL-REQ-ARCH-FREEZE-18.4-001 — System Integration Freeze | **Open** |

---

## 4. Phase 18.0 — Convergence / Meta-Architecture Baseline

**Status:** Frozen / Accepted  
**Baseline:** 18.0 Frozen  
**Git tag:** `arch-18.0-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.0-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/convergence_spec.md`  

**Public input:** `SynthesisReport` + `GovernanceRegistryModel` + `HistoricalMetricsModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/convergence_spec.md` |
| Engine | `auto-scribe-ai/src/convergence/convergence_engine.py` |
| Meta model | `auto-scribe-ai/src/convergence/meta_architecture_model.py` |
| Manifest | `auto-scribe-ai/src/convergence/convergence_manifest_model.py` |
| GovernanceRegistry | `auto-scribe-ai/src/convergence/governance_registry_model.py` |
| Exceptions | `auto-scribe-ai/src/convergence/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_convergence.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_convergence_pipeline.py` |

**Contracts（summary）:**

* Define runtime topology / dependency graph / policies only — no runtime execution  
* Deterministic ConvergenceManifest under versioned evaluation configuration  
* ConvergenceManifest owns topology and policy fields  
* MetaArchitectureModel owns references and traceability_map  
* GovernanceRegistryModel remains immutable input（no mutation by engine）  
* Snapshot evaluation; no Convergence cache  
* `evaluation_window` read-only from HistoricalMetricsModel  

Frozen Architecture 15.x–17.9 contracts remain unmodified.

### 4.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-18.0-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.0-001 |
| Freeze Identifier | **ARCH-18.0-FREEZE** |
| Implementation | ASA-IMPL-REQ-CONVERGENCE-001 Final v1.1（ACCEPTED Edition） |
| Architecture Version | ASA-ARCH-18.0 Draft 1.0（at acceptance） / Draft 1.1（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.0 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.0 Frozen; Phase 18.1 Open |

### 4.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `manifest_id` derived solely from `synthesis_id` | Non-blocking |
| NB-2 | Definition only | `execution_policy.mode = DEFINITION_ONLY`; runtime deferred to 18.1 | Non-blocking |
| NB-3 | Thresholds | `min_topology_nodes` enforced; `max_cycle_count` reserved（DAG integrity） | Non-blocking |
| NB-4 | Error separation | IntegrityError（input） / ValidationError（output） split confirmed | Non-blocking |
| NB-5 | Governance read-only | `GovernanceRegistryModel` remains immutable input | Non-blocking |
| NB-6 | Ownership | Manifest owns topology/policies; MetaArchitecture owns refs/traceability | Non-blocking |
| NB-7 | Topology definition | Deterministic DAG only; no scheduling / execution / orchestration | Non-blocking |
| NB-8 | Registry sync | Baseline registry synchronized during freeze | Non-blocking |

No contract violations. No blocking issues. Convergence baseline fixed.  
No production behavior changes during freeze.

### 4.3 Phase 18.0 Freeze Rule

```text
Architecture 18.0 Convergence SHALL be immutable.
Future Convergence contract changes SHALL NOT mutate Phase 18.0
except through Change Requests that supersede via a later Architecture 18.x phase.
Phase 18.1+ evolution SHALL begin as Open work on ASA-ARCH-18.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 5. Dependency Inheritance

```text
Convergence → Synthesis → Evolution → Reflection → Feedback → Distribution
  → Integration → NaturalLanguage → Rendering → Presentation
  → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Convergence consumes **SynthesisReport**, **GovernanceRegistryModel**, and **HistoricalMetricsModel** only.  
Architecture 15.0 / 16.0 / 17.1–17.9 source and baselines remain unchanged.  
Phase 18.0 remains Frozen and unmodified.

---

## 6. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft |
| Spec version | Draft 1.1 |
| Phase 18.0 | **Frozen / Accepted（Baseline 18.0）** |
| Phase 18.1 | **Open** |
| Phase 18.2 | **Open** |
| Phase 18.3 | **Open** |
| Phase 18.4 | **Open** |
| Based on | ASA-ARCH-17.0 Draft 1.5（Phase 17.1–17.9 Frozen） |
| Production SoT for Synthesis | **ASA-ARCH-17.0 Phase 17.9（Frozen）** |
| Production SoT for Convergence | **ASA-ARCH-18.0 Phase 18.0（Frozen）** |
| Phase 18.0 Git tag | `arch-18.0-freeze` |
| Freeze Identifier | ARCH-18.0-FREEZE |

---

## 7. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-18.0** for Phase 18.1+ draft updates（Phase 18.0 frozen） |
| Constraint | MUST NOT mutate ASA-ARCH-15.0 / 16.0 / 17.0 Phase 17.1–17.9 freeze contracts |
| Upstream | Synthesis and all prior frozen phases remain Final / frozen |
| Phase 18.0 | Immutable after `arch-18.0-freeze` |
