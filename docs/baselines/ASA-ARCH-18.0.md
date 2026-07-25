# Architecture Baseline – ASA-ARCH-18.0

**Baseline ID:** ASA-ARCH-18.0  
**Title:** Meta-Architecture / Convergence（successor to ASA-ARCH-17.0 Synthesis）  
**Version:** Draft 1.5（Phase 18.0–18.2 Frozen; Phase 18.3 Open）  
**Status:** Open — Active Draft（Phase 18.0–18.2 Frozen; Phases 18.3–18.4 Open）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-17.0（Presentation→Synthesis — Phase 17.1–17.9 Frozen）  
**Registry Path:** `docs/baselines/ASA-ARCH-18.0.md`  

**Freeze（18.0）:** ASA-IMPL-REQ-ARCH-FREEZE-18.0-001  
**Acceptance（18.0）:** ASA-VERIFY-ARCH-18.0-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze Identifier（18.0）:** ARCH-18.0-FREEZE  
**Freeze（18.1）:** ASA-IMPL-REQ-ARCH-FREEZE-18.1-001  
**Acceptance（18.1）:** ASA-VERIFY-ARCH-18.1-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze Identifier（18.1）:** ARCH-18.1-FREEZE  
**Freeze（18.2）:** ASA-IMPL-REQ-ARCH-FREEZE-18.2-001  
**Acceptance（18.2）:** ASA-VERIFY-ARCH-18.2-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze Identifier（18.2）:** ARCH-18.2-FREEZE  

---

## 1. Registration Declaration

本書は **ASA-ARCH-17.0 Phase 17.9 Frozen 後**の次期 Architecture Baseline である。

* Based on Architecture 17.0（Phase 17.1–17.9 Frozen）  
* Architecture 18.0 SHALL NOT modify Architecture 15.x / 16.x / 17.1–17.9  
* **Phase 18.0 Convergence / Meta-Architecture is Frozen / Accepted（Baseline 18.0）**  
* **Phase 18.1 Runtime Orchestration is Frozen / Accepted（Baseline 18.1）**  
* **Phase 18.2 Lifecycle Control is Frozen / Accepted（Baseline 18.2）**  
* Phases 18.3 Governance Runtime / 18.4 System Integration Freeze remain Open  

---

## 2. Scope Summary

```text
Architecture 18.0 Phase 18.0 defines runtime topology only.
Phase 18.1 defines orchestration plans only（no scheduling / execution / workers）.
Phase 18.2 defines lifecycle state control only（no runtime execution / approval execution）.
Governance runtime remains out of scope until Phase 18.3.
```

| Area | Change | Status |
|---|---|---|
| Phase 18.0 Convergence | SynthesisReport + GovernanceRegistry + HistoricalMetrics → ConvergenceManifest | **Frozen / Accepted** |
| Phase 18.1 Runtime Orchestration | ConvergenceManifest + GovernanceRegistry + HistoricalMetrics → OrchestrationPlan | **Frozen / Accepted** |
| Phase 18.2 Lifecycle Control | OrchestrationPlan + GovernanceRegistry + HistoricalMetrics → LifecycleManifest | **Frozen / Accepted** |
| Phase 18.3 Governance Runtime | （Open） | **Open** |
| Phase 18.4 System Integration Freeze | （Open） | **Open** |

---

## 3. Roadmap

| Order | Request / Spec | Status |
|---|---|---|
| 0 | ASA-IMPL-REQ-CONVERGENCE-001 Final v1.1 — Convergence | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.0-001 — Phase 18.0 Freeze | **Implemented** |
| 1 | ASA-IMPL-REQ-ORCHESTRATION-001 Final v1.1 — Runtime Orchestration | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.1-001 — Phase 18.1 Freeze | **Implemented** |
| 2 | ASA-IMPL-REQ-LIFECYCLE-001 Final v1.0 — Lifecycle Control | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.2-001 — Phase 18.2 Freeze | **Implemented** |
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

## 5. Phase 18.1 — Runtime Orchestration Mechanism

**Status:** Frozen / Accepted  
**Baseline:** 18.1 Frozen  
**Git tag:** `arch-18.1-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.1-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/orchestration_spec.md`  

**Public input:** `ConvergenceManifest` + `GovernanceRegistryModel` + `HistoricalMetricsModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/orchestration_spec.md` |
| Engine | `auto-scribe-ai/src/orchestration/orchestration_engine.py` |
| Model | `auto-scribe-ai/src/orchestration/orchestration_model.py` |
| Plan | `auto-scribe-ai/src/orchestration/orchestration_plan_model.py` |
| Exceptions | `auto-scribe-ai/src/orchestration/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_orchestration.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_orchestration_pipeline.py` |

**Contracts（summary）:**

* Define orchestration plan only — no scheduling / execution / workers / threads  
* Deterministic OrchestrationPlan under versioned evaluation configuration  
* OrchestrationPlan references OrchestrationModel only（no field duplication）  
* OrchestrationModel owns topology / transitions / boundaries / recovery / hooks / config / traceability  
* Recovery and governance hooks are definition / checkpoint only（approval in 18.3）  
* Snapshot evaluation; no Orchestration cache  
* `evaluation_window` read-only from HistoricalMetricsModel  

Phase 18.0 contracts remain Frozen and unmodified.

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-18.1-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.1-001 |
| Freeze Identifier | **ARCH-18.1-FREEZE** |
| Implementation | ASA-IMPL-REQ-ORCHESTRATION-001 Final v1.1 |
| Architecture Version | ASA-ARCH-18.0 Draft 1.2（at acceptance） / Draft 1.3（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.1 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.1 Frozen; Phase 18.2 Open |

### 5.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `plan_id` derived from `manifest_id`; uniqueness per orchestration evaluation set | Non-blocking |
| NB-2 | Recovery definition | Recovery policy is definition-only; not executed | Non-blocking |
| NB-3 | Governance hooks | Checkpoint definitions only; approval deferred to Phase 18.3 | Non-blocking |
| NB-4 | Topology | Deterministic DAG using topological ordering | Non-blocking |
| NB-5 | Pipeline scope | Convergence → Orchestration; runtime execution out of scope | Non-blocking |
| NB-6 | Deferred runtime | Scheduling / workers / async / lifecycle deferred to 18.2+ | Non-blocking |

No contract violations. No blocking issues. Orchestration baseline fixed.  
No production behavior changes during freeze.

### 5.3 Phase 18.1 Freeze Rule

```text
Architecture 18.1 Runtime Orchestration SHALL be immutable.
Future Orchestration contract changes SHALL NOT mutate Phase 18.1
except through Change Requests that supersede via a later Architecture 18.x phase.
Phase 18.2+ evolution SHALL begin as Open work on ASA-ARCH-18.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 6. Phase 18.2 — Lifecycle Control Mechanism

**Status:** Frozen / Accepted  
**Baseline:** 18.2 Frozen  
**Git tag:** `arch-18.2-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.2-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/lifecycle_spec.md`  

**Public input:** `OrchestrationPlan` + `GovernanceRegistryModel` + `HistoricalMetricsModel`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/lifecycle_spec.md` |
| Engine | `auto-scribe-ai/src/lifecycle/lifecycle_engine.py` |
| Model | `auto-scribe-ai/src/lifecycle/lifecycle_model.py` |
| Manifest | `auto-scribe-ai/src/lifecycle/lifecycle_manifest_model.py` |
| Configuration | `auto-scribe-ai/src/lifecycle/lifecycle_configuration_model.py` |
| Exceptions | `auto-scribe-ai/src/lifecycle/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_lifecycle.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_lifecycle_pipeline.py` |

**Contracts（summary）:**

* Define lifecycle state machine / restart / stability only — no runtime execution  
* Deterministic LifecycleManifest under versioned immutable configuration  
* LifecycleManifest references LifecycleModel only（no field duplication）  
* LifecycleModel owns configuration / states / transitions / restart / stability / boundaries / traceability  
* ROLLBACK is an action（not a state）; FAILED is non-terminal  
* Governance checkpoints definition only（approval in 18.3）  
* Snapshot evaluation; no Lifecycle cache  

Phase 18.0–18.1 contracts remain Frozen and unmodified.

### 6.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-18.2-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.2-001 |
| Freeze Identifier | **ARCH-18.2-FREEZE** |
| Implementation | ASA-IMPL-REQ-LIFECYCLE-001 Final v1.0 |
| Architecture Version | ASA-ARCH-18.0 Draft 1.4（at acceptance） / Draft 1.5（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.2 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.2 Frozen; Phase 18.3 Open |

### 6.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Identifier scope | `manifest_id` derived from orchestration `plan_id` + `evaluation_window` | Non-blocking |
| NB-2 | Definition only | Transition/restart/recovery paths specified but not executed | Non-blocking |
| NB-3 | Governance hooks | Approval execution deferred to Phase 18.3 | Non-blocking |
| NB-4 | Generation / restart | `generation` starts at 0; `restart_id` from `manifest_id` + `generation` | Non-blocking |
| NB-5 | Exception hierarchy | `IllegalTransitionError` sibling under `LifecycleError`（not under ValidationError） | Non-blocking |
| NB-6 | Traceability | Uses `terminal_state_placeholder` until runtime terminal | Non-blocking |
| NB-7 | Metrics read-only | `HistoricalMetricsModel` not updated; triggers reserved | Non-blocking |
| NB-8 | Registry sync | Baseline registry synchronized during freeze | Non-blocking |

No contract violations. No blocking issues. Lifecycle baseline fixed.  
No production behavior changes during freeze.

### 6.3 Phase 18.2 Freeze Rule

```text
Architecture 18.2 Lifecycle Control SHALL be immutable.
Future Lifecycle contract changes SHALL NOT mutate Phase 18.2
except through Change Requests that supersede via a later Architecture 18.x phase.
Phase 18.3+ evolution SHALL begin as Open work on ASA-ARCH-18.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 7. Dependency Inheritance

```text
Lifecycle → Orchestration → Convergence → Synthesis → Evolution → Reflection → Feedback → Distribution
  → Integration → NaturalLanguage → Rendering → Presentation
  → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Lifecycle consumes **OrchestrationPlan**, **GovernanceRegistryModel**, and **HistoricalMetricsModel** only.  
Orchestration consumes **ConvergenceManifest**, **GovernanceRegistryModel**, and **HistoricalMetricsModel** only.  
Convergence consumes **SynthesisReport**, **GovernanceRegistryModel**, and **HistoricalMetricsModel** only.  
Architecture 15.0 / 16.0 / 17.1–17.9 source and baselines remain unchanged.  
Phase 18.0–18.2 remain Frozen and unmodified.

---

## 8. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft |
| Spec version | Draft 1.5 |
| Phase 18.0 | **Frozen / Accepted（Baseline 18.0）** |
| Phase 18.1 | **Frozen / Accepted（Baseline 18.1）** |
| Phase 18.2 | **Frozen / Accepted（Baseline 18.2）** |
| Phase 18.3 | **Open** |
| Phase 18.4 | **Open** |
| Based on | ASA-ARCH-17.0 Draft 1.5（Phase 17.1–17.9 Frozen） |
| Production SoT for Synthesis | **ASA-ARCH-17.0 Phase 17.9（Frozen）** |
| Production SoT for Convergence | **ASA-ARCH-18.0 Phase 18.0（Frozen）** |
| Production SoT for Orchestration | **ASA-ARCH-18.0 Phase 18.1（Frozen）** |
| Production SoT for Lifecycle | **ASA-ARCH-18.0 Phase 18.2（Frozen）** |
| Phase 18.0 Git tag | `arch-18.0-freeze` |
| Phase 18.1 Git tag | `arch-18.1-freeze` |
| Phase 18.2 Git tag | `arch-18.2-freeze` |
| Freeze Identifier（18.0） | ARCH-18.0-FREEZE |
| Freeze Identifier（18.1） | ARCH-18.1-FREEZE |
| Freeze Identifier（18.2） | ARCH-18.2-FREEZE |

---

## 9. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-18.0** for Phase 18.3+ draft updates（Phase 18.0–18.2 frozen） |
| Constraint | MUST NOT mutate ASA-ARCH-15.0 / 16.0 / 17.0 Phase 17.1–17.9 freeze contracts |
| Upstream | Convergence / Orchestration / Lifecycle and all prior frozen phases remain Final / frozen |
| Phase 18.0 | Immutable after `arch-18.0-freeze` |
| Phase 18.1 | Immutable after `arch-18.1-freeze` |
| Phase 18.2 | Immutable after `arch-18.2-freeze` |
