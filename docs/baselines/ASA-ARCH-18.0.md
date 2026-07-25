# Architecture Baseline – ASA-ARCH-18.0

**Baseline ID:** ASA-ARCH-18.0  
**Title:** Meta-Architecture / Convergence（successor to ASA-ARCH-17.0 Synthesis）  
**Version:** Draft 2.8（Phase 18.0–18.8 Frozen）  
**Status:** Open — Active Draft（Phase 18.0–18.8 Frozen）  
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
**Freeze（18.3）:** ASA-IMPL-REQ-ARCH-FREEZE-18.3-001  
**Acceptance（18.3）:** ASA-VERIFY-ARCH-18.3-ACCEPTANCE-001 — PASS WITH NON-BLOCKING NOTES  
**Freeze Identifier（18.3）:** ARCH-18.3-FREEZE  
**Freeze（18.4）:** ASA-IMPL-REQ-ARCH-FREEZE-18.4-001  
**Acceptance（18.4）:** ASA-VERIFY-ARCH-18.4-ACCEPTANCE-001 — PASSED  
**Freeze Identifier（18.4）:** ARCH-18.4-FREEZE  
**Freeze（18.5）:** ASA-IMPL-REQ-ARCH-FREEZE-18.5-001  
**Acceptance（18.5）:** ASA-VERIFY-ARCH-18.5-ACCEPTANCE-001 — PASSED  
**Freeze Identifier（18.5）:** ARCH-18.5-FREEZE  
**Freeze（18.6）:** ASA-IMPL-REQ-ARCH-FREEZE-18.6-001  
**Acceptance（18.6）:** ASA-VERIFY-ARCH-18.6-ACCEPTANCE-001 — PASSED  
**Freeze Identifier（18.6）:** ARCH-18.6-FREEZE  
**Freeze（18.7）:** ASA-IMPL-REQ-ARCH-FREEZE-18.7-001  
**Acceptance（18.7）:** ASA-VERIFY-ARCH-18.7-ACCEPTANCE-001 — PASSED  
**Freeze Identifier（18.7）:** ARCH-18.7-FREEZE  
**Freeze（18.8）:** ASA-IMPL-REQ-ARCH-FREEZE-18.8-001  
**Acceptance（18.8）:** ASA-VERIFY-ARCH-18.8-ACCEPTANCE-001 — PASSED  
**Freeze Identifier（18.8）:** ARCH-18.8-FREEZE  

---

## 1. Registration Declaration

本書は **ASA-ARCH-17.0 Phase 17.9 Frozen 後**の次期 Architecture Baseline である。

* Based on Architecture 17.0（Phase 17.1–17.9 Frozen）  
* Architecture 18.0 SHALL NOT modify Architecture 15.x / 16.x / 17.1–17.9  
* **Phase 18.0 Convergence / Meta-Architecture is Frozen / Accepted（Baseline 18.0）**  
* **Phase 18.1 Runtime Orchestration is Frozen / Accepted（Baseline 18.1）**  
* **Phase 18.2 Lifecycle Control is Frozen / Accepted（Baseline 18.2）**  
* **Phase 18.3 Governance Runtime is Frozen / Accepted（Baseline 18.3）**  
* **Phase 18.4 System Governance Integration is Frozen / Accepted（Baseline 18.4）**  
* **Phase 18.5 System Governance Runtime Binding is Frozen / Accepted（Baseline 18.5）**  
* **Phase 18.6 System Governance Runtime Operation is Frozen / Accepted（Baseline 18.6）**  
* **Phase 18.7 System Governance Runtime Execution Engine is Frozen / Accepted（Baseline 18.7）**  
* **Phase 18.8 System Governance Runtime Execution Control / Recovery is Frozen / Accepted（Baseline 18.8）**  

---

## 2. Scope Summary

```text
Architecture 18.0 Phase 18.0 defines runtime topology only.
Phase 18.1 defines orchestration plans only（no scheduling / execution / workers）.
Phase 18.2 defines lifecycle state control only（no runtime execution / approval execution）.
Governance runtime executes approval / contracts / audit only（no scheduling）.
Phase 18.4 integrates GovernanceDecision into SystemGovernanceEffect（pure / idempotent）.
Phase 18.5 binds SystemGovernanceEffect into RuntimeGovernanceBinding（no RuntimeOperation）.
Phase 18.6 constructs RuntimeOperation from Binding（no execution; 18.7）.
Phase 18.7 executes RuntimeOperation against the external environment（single attempt; no retry）.
Phase 18.8 controls Retry / Rollback / Timeout / CircuitBreaker / Compensation over 18.7.
```

| Area | Change | Status |
|---|---|---|
| Phase 18.0 Convergence | SynthesisReport + GovernanceRegistry + HistoricalMetrics → ConvergenceManifest | **Frozen / Accepted** |
| Phase 18.1 Runtime Orchestration | ConvergenceManifest + GovernanceRegistry + HistoricalMetrics → OrchestrationPlan | **Frozen / Accepted** |
| Phase 18.2 Lifecycle Control | OrchestrationPlan + GovernanceRegistry + HistoricalMetrics → LifecycleManifest | **Frozen / Accepted** |
| Phase 18.3 Governance Runtime | LifecycleManifest + GovernanceRegistry + RuntimeContext → GovernanceDecision | **Frozen / Accepted** |
| Phase 18.4 System Governance Integration | GovernanceDecision + SystemGovernanceRegistry + IntegrationContext → SystemGovernanceEffect | **Frozen / Accepted** |
| Phase 18.5 System Governance Runtime Binding | SystemGovernanceEffect + RuntimeContext → RuntimeGovernanceBinding | **Frozen / Accepted** |
| Phase 18.6 System Governance Runtime Operation | RuntimeGovernanceBinding + RuntimeContext → RuntimeOperation | **Frozen / Accepted** |
| Phase 18.7 System Governance Runtime Execution | RuntimeOperation + ExecutionContext → ExecutionResult | **Frozen / Accepted** |
| Phase 18.8 System Governance Runtime Execution Control | RuntimeOperation + ExecutionContext + ControlPolicy → ExecutionControlResult | **Frozen / Accepted** |

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
| 3 | ASA-IMPL-REQ-GOVERNANCE-RUNTIME-001 Draft 0.1 — Governance Runtime | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.3-001 — Phase 18.3 Freeze | **Implemented** |
| 4 | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-INTEGRATION-001 Draft 0.2 — System Governance Integration | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.4-001 — Phase 18.4 Freeze | **Implemented** |
| 5 | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-BINDING-001 Draft 0.2 — Runtime Binding | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.5-001 — Phase 18.5 Freeze | **Implemented** |
| 6 | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-OPERATION-001 Draft 0.2 — Runtime Operation | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.6-001 — Phase 18.6 Freeze | **Implemented** |
| 7 | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-EXECUTION-001 Draft 0.2 — Runtime Execution | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.7-001 — Phase 18.7 Freeze | **Implemented** |
| 8 | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-EXECUTION-CONTROL-001 Draft 0.2 — Execution Control | **Frozen** |
| — | ASA-IMPL-REQ-ARCH-FREEZE-18.8-001 — Phase 18.8 Freeze | **Implemented** |

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

## 7. Phase 18.3 — Governance Runtime

**Status:** Frozen / Accepted  
**Baseline:** 18.3 Frozen  
**Git tag:** `arch-18.3-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.3-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/governance_runtime_spec.md`  

**Public input:** `LifecycleManifest` + `GovernanceRegistryModel` + `RuntimeContext`  

**Public output:** `GovernanceDecision`（embeds exactly one `GovernanceAuditRecord`）  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/governance_runtime_spec.md` |
| Engine | `auto-scribe-ai/src/governance_runtime/governance_runtime_engine.py` |
| Runtime model | `auto-scribe-ai/src/governance_runtime/governance_runtime_model.py` |
| Decision | `auto-scribe-ai/src/governance_runtime/governance_decision.py` |
| Contract | `auto-scribe-ai/src/governance_runtime/governance_contract.py` |
| Audit | `auto-scribe-ai/src/governance_runtime/governance_audit.py` |
| Validation | `auto-scribe-ai/src/governance_runtime/governance_validation.py` |
| Exceptions | `auto-scribe-ai/src/governance_runtime/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_governance_runtime.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_governance_runtime_pipeline.py` |

**Contracts（summary）:**

* Execute approval / contract enforcement / runtime governance policy / audit only  
* Decisions: `APPROVED` / `DENIED` / `DEFERRED` with propagation effects `READY` / `TERMINATED` / `SUSPENDED`  
* LifecycleManifest / GovernanceRegistryModel / RuntimeContext remain read-only（no mutation）  
* Exactly one GovernanceDecision and exactly one GovernanceAuditRecord per evaluation  
* Deterministic under identical inputs; timestamps from RuntimeContext only  
* No worker / scheduler / queue / execution / retry engines  

Phase 18.0–18.2 contracts remain Frozen and unmodified.

### 7.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance Review | ASA-VERIFY-ARCH-18.3-ACCEPTANCE-001 |
| Acceptance Result | **PASS WITH NON-BLOCKING NOTES** |
| Acceptance Status | **ACCEPTED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.3-001 |
| Freeze Identifier | **ARCH-18.3-FREEZE** |
| Implementation | ASA-IMPL-REQ-GOVERNANCE-RUNTIME-001 Draft 0.1 |
| Architecture Version | ASA-ARCH-18.0 Draft 1.6（at acceptance） / Draft 1.7（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.3 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.3 Frozen; Phase 18.4 Open |

### 7.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Implementation Spec remains Draft 0.1（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Propagation | `lifecycle_effect` recorded; LifecycleManifest.current_state not mutated | Non-blocking |
| NB-3 | Fail-closed | Unsupported mandatory registry rules → ContractViolationError | Non-blocking |
| NB-4 | Spec path | Spec under `auto-scribe-ai/impl/`（matches 18.0–18.2） | Non-blocking |

No contract violations. No blocking issues. Governance Runtime baseline fixed.  
No production behavior changes during freeze.

### 7.3 Phase 18.3 Freeze Rule

```text
Architecture 18.3 Governance Runtime SHALL be immutable.
Future Governance Runtime contract changes SHALL NOT mutate Phase 18.3
except through Change Requests that supersede via a later Architecture 18.x phase.
Phase 18.4+ evolution SHALL begin as Open work on ASA-ARCH-18.0.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 8. Phase 18.4 — System Governance Integration

**Status:** Frozen / Accepted  
**Baseline:** 18.4 Frozen  
**Git tag:** `arch-18.4-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.4-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/system_governance_integration_spec.md`  

**Public input:** `GovernanceDecision` + `SystemGovernanceRegistry` + `IntegrationContext`  

**Public output:** `SystemGovernanceEffect`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/system_governance_integration_spec.md` |
| Integrator | `auto-scribe-ai/src/system_governance_integration/integrator.py` |
| Models | `auto-scribe-ai/src/system_governance_integration/models.py` |
| Registry | `auto-scribe-ai/src/system_governance_integration/registry.py` |
| Validation | `auto-scribe-ai/src/system_governance_integration/validation.py` |
| Exceptions | `auto-scribe-ai/src/system_governance_integration/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_system_governance_integration.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_system_governance_integration_pipeline.py` |

**Contracts（summary）:**

* Pure / idempotent `apply` — no I/O, logging, mutation, caching, wall-clock, randomness  
* Decision mapping: APPROVED→ALLOW / DENIED→BLOCK / DEFERRED→PENDING  
* Registry mandatory contracts in fixed order（fail-fast）  
* Validation: Schema → Ownership → Contract → Determinism → Traceability  
* `effect_id = SHA256(normalize(decision_id)|normalize(audit_reference_id)|normalize(timestamp))`  
* Audit chain terminal at SystemGovernanceEffect（no SystemPolicy propagation）  

Phase 18.0–18.3 contracts remain Frozen and unmodified.

### 8.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-18.4-001 |
| Acceptance Review | ASA-VERIFY-ARCH-18.4-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.4-001 |
| Freeze Identifier | **ARCH-18.4-FREEZE** |
| Implementation | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-INTEGRATION-001 Draft 0.2 |
| Architecture Version | ASA-ARCH-18.0 Draft 1.8（at acceptance） / Draft 1.9（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.4 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.4 Frozen |
| Regression | **493 passed** |

### 8.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Terminal effect | SystemGovernanceEffect is terminal; SystemPolicy out of scope | Non-blocking |
| NB-3 | Hash verification | Audit-chain hash verification deferred | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

No contract violations. No blocking issues. System Governance Integration baseline fixed.  
No production behavior changes during freeze.

### 8.3 Phase 18.4 Freeze Rule

```text
Architecture 18.4 System Governance Integration SHALL be immutable.
Future Integration contract changes SHALL NOT mutate Phase 18.4
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation-order / exception hierarchy changes
without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 9. Phase 18.5 — System Governance Runtime Binding

**Status:** Frozen / Accepted  
**Baseline:** 18.5 Frozen  
**Git tag:** `arch-18.5-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.5-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/system_governance_runtime_binding_spec.md`  

**Public input:** `SystemGovernanceEffect` + `RuntimeContext`（binding-layer）  

**Public output:** `RuntimeGovernanceBinding`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/system_governance_runtime_binding_spec.md` |
| Binder | `auto-scribe-ai/src/system_governance_runtime_binding/binder.py` |
| Models | `auto-scribe-ai/src/system_governance_runtime_binding/models.py` |
| Validation | `auto-scribe-ai/src/system_governance_runtime_binding/validation.py` |
| Exceptions | `auto-scribe-ai/src/system_governance_runtime_binding/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_system_governance_runtime_binding.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_system_governance_runtime_binding_pipeline.py` |

**Contracts（summary）:**

* Pure / idempotent `bind` — no I/O, logging, mutation, caching, wall-clock, randomness  
* Mapping: ALLOW→ALLOW_BINDING / BLOCK→BLOCK_BINDING / PENDING→PENDING_BINDING  
* Validation: Schema → Ownership → Contract → Determinism → Traceability（fail-fast）  
* `binding_id = SHA256(normalize(effect_id|runtime_context_id|effect_timestamp))`  
* `binding.timestamp` inherits `effect.timestamp`  
* RuntimeOperation neither generated nor executed（placeholder `DEFERRED_TO_18_6`）  

Phase 18.0–18.4 contracts remain Frozen and unmodified.

### 9.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-18.5-001 |
| Acceptance Review | ASA-VERIFY-ARCH-18.5-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.5-001 |
| Freeze Identifier | **ARCH-18.5-FREEZE** |
| Implementation | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-BINDING-001 Draft 0.2 |
| Architecture Version | ASA-ARCH-18.0 Draft 2.0（at acceptance） / Draft 2.1（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.5 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.5 Frozen |
| Regression | **514 passed** |

### 9.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | RuntimeOperation | Deferred to Phase 18.6（placeholder only） | Non-blocking |
| NB-3 | RuntimeContext | Binding-layer context distinct from Phase 18.3 | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

No contract violations. No blocking issues. Runtime Binding baseline fixed.  
No production behavior changes during freeze.

### 9.3 Phase 18.5 Freeze Rule

```text
Architecture 18.5 System Governance Runtime Binding SHALL be immutable.
Future Binding contract changes SHALL NOT mutate Phase 18.5
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation-order / binding_id / exception hierarchy
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 10. Phase 18.6 — System Governance Runtime Operation

**Status:** Frozen / Accepted  
**Baseline:** 18.6 Frozen  
**Git tag:** `arch-18.6-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.6-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/system_governance_runtime_operation_spec.md`  

**Public input:** `RuntimeGovernanceBinding` + `RuntimeContext`（binding-layer）  

**Public output:** `RuntimeOperation`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/system_governance_runtime_operation_spec.md` |
| Builder | `auto-scribe-ai/src/system_governance_runtime_operation/builder.py` |
| Models | `auto-scribe-ai/src/system_governance_runtime_operation/models.py` |
| Validation | `auto-scribe-ai/src/system_governance_runtime_operation/validation.py` |
| Exceptions | `auto-scribe-ai/src/system_governance_runtime_operation/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_system_governance_runtime_operation.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_system_governance_runtime_operation_pipeline.py` |

**Contracts（summary）:**

* Pure / idempotent `build` — no I/O, logging, mutation, caching, wall-clock, randomness  
* Mapping: ALLOW_BINDING→ALLOW_OPERATION / BLOCK_BINDING→BLOCK_OPERATION / PENDING_BINDING→PENDING_OPERATION  
* Validation: Schema → Ownership → Contract → Determinism → Traceability（fail-fast）  
* `operation_id = SHA256(normalize(binding_id|runtime_context_id|binding_timestamp))`  
* `operation.timestamp` inherits `binding.timestamp`  
* Deterministic `operation_plan`; execution deferred（`DEFERRED_TO_18_7`）  

Phase 18.0–18.5 contracts remain Frozen and unmodified.

### 10.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-18.6-001 |
| Acceptance Review | ASA-VERIFY-ARCH-18.6-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.6-001 |
| Freeze Identifier | **ARCH-18.6-FREEZE** |
| Implementation | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-OPERATION-001 Draft 0.2 |
| Architecture Version | ASA-ARCH-18.0 Draft 2.2（at acceptance） / Draft 2.3（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.6 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.6 Frozen |
| Regression | **535 passed** |

### 10.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Execution deferred | RuntimeOperation execution remains Phase 18.7 | Non-blocking |
| NB-3 | Plan status | `operation_plan.execution_status = DEFERRED_TO_18_7` | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

No contract violations. No blocking issues. Runtime Operation baseline fixed.  
No production behavior changes during freeze.

### 10.3 Phase 18.6 Freeze Rule

```text
Architecture 18.6 System Governance Runtime Operation SHALL be immutable.
Future Operation contract changes SHALL NOT mutate Phase 18.6
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation-order / operation_id / exception hierarchy
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 11. Phase 18.7 — System Governance Runtime Execution Engine

**Status:** Frozen / Accepted  
**Baseline:** 18.7 Frozen  
**Git tag:** `arch-18.7-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.7-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/system_governance_runtime_execution_spec.md`  

**Public input:** `RuntimeOperation` + `ExecutionContext`  

**Public output:** `ExecutionResult`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/system_governance_runtime_execution_spec.md` |
| Engine | `auto-scribe-ai/src/system_governance_runtime_execution/engine.py` |
| Models | `auto-scribe-ai/src/system_governance_runtime_execution/models.py` |
| Validation | `auto-scribe-ai/src/system_governance_runtime_execution/validation.py` |
| Exceptions | `auto-scribe-ai/src/system_governance_runtime_execution/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_system_governance_runtime_execution.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_system_governance_runtime_execution_pipeline.py` |

**Contracts（summary）:**

* Sole architectural boundary permitted to interact with external systems  
* Consumes immutable `RuntimeOperation` without modification  
* Validation: Schema → Permission → Environment → Contract → Traceability（fail-fast）  
* `execution_result_id = SHA256(normalize(operation_id|execution_context_id|execution_timestamp))`  
* Validation failure → exception / no `ExecutionResult`  
* Post-start failure → `ExecutionResult.execution_status = FAILURE`（side effects / rollback recorded）  
* Single execution attempt; no retry; rollback best-effort only  
* Trace chain: decision → effect → binding → operation → execution_result  

Phase 18.0–18.6 contracts remain Frozen and unmodified.

### 11.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-18.7-001 |
| Acceptance Review | ASA-VERIFY-ARCH-18.7-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.7-001 |
| Freeze Identifier | **ARCH-18.7-FREEZE** |
| Implementation | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-EXECUTION-001 Draft 0.2 |
| Architecture Version | ASA-ARCH-18.0 Draft 2.5（at acceptance） / Draft 2.6（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.7 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.7 Frozen |
| Regression | **560 passed** |

### 11.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Retry deferred | Retry strategy remains a future-phase responsibility | Non-blocking |
| NB-3 | Rollback scope | Rollback remains best-effort only | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

No contract violations. No blocking issues. Runtime Execution baseline fixed.  
No production behavior changes during freeze.

### 11.3 Phase 18.7 Freeze Rule

```text
Architecture 18.7 System Governance Runtime Execution Engine SHALL be immutable.
Future Execution contract changes SHALL NOT mutate Phase 18.7
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation-order / execution_result_id / exception hierarchy
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 12. Phase 18.8 — System Governance Runtime Execution Control / Recovery

**Status:** Frozen / Accepted  
**Baseline:** 18.8 Frozen  
**Git tag:** `arch-18.8-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-18.8-FREEZE  

**Normative spec:** `auto-scribe-ai/impl/system_governance_runtime_execution_control_spec.md`  

**Public input:** `RuntimeOperation` + `ExecutionContext` + `ControlPolicy`  

**Public output:** `ExecutionControlResult`  

**Deliverables:**

| Kind | Path |
|---|---|
| Spec | `auto-scribe-ai/impl/system_governance_runtime_execution_control_spec.md` |
| Controller | `auto-scribe-ai/src/system_governance_runtime_execution_control/controller.py` |
| Models | `auto-scribe-ai/src/system_governance_runtime_execution_control/models.py` |
| Validation | `auto-scribe-ai/src/system_governance_runtime_execution_control/validation.py` |
| Exceptions | `auto-scribe-ai/src/system_governance_runtime_execution_control/exceptions.py` |
| Unit tests | `auto-scribe-ai/tests/test_system_governance_runtime_execution_control.py` |
| Pipeline tests | `auto-scribe-ai/tests/test_system_governance_runtime_execution_control_pipeline.py` |

**Contracts（summary）:**

* Validation: Schema → Permission → Policy → Environment → Contract → Traceability（fail-fast）  
* Retry with deterministic backoff; ExecutionResult immutable  
* Rollback BEST_EFFORT / STRICT（STRICT failure → ControlFailureError）  
* Compensation NONE / SUCCESS / FAILURE with compensation_id / reference  
* Timeout MONOTONIC / WALL_CLOCK / EXTERNAL_SCHEDULER + cancellation modes  
* Circuit Breaker CLOSED / OPEN / HALF_OPEN  
* `execution_control_result_id = SHA256(normalize(operation_id|execution_context_id|timestamp))`  
* Trace: decision → effect → binding → operation → execution_result → execution_control_result  

Phase 18.0–18.7 contracts remain Frozen and unmodified.

### 12.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-18.8-001 |
| Acceptance Review | ASA-VERIFY-ARCH-18.8-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-IMPL-REQ-ARCH-FREEZE-18.8-001 |
| Freeze Identifier | **ARCH-18.8-FREEZE** |
| Implementation | ASA-IMPL-REQ-SYSTEM-GOVERNANCE-RUNTIME-EXECUTION-CONTROL-001 Draft 0.2 |
| Architecture Version | ASA-ARCH-18.0 Draft 2.7（at acceptance） / Draft 2.8（post-freeze） |
| Phase status | **Frozen / Accepted** |
| Baseline | **18.8 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phases 15.x–18.8 Frozen |
| Regression | **583 passed** |

### 12.2 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Scope boundary | Advanced transaction / orchestration beyond Control remains deferred | Non-blocking |
| NB-3 | STRICT rollback | STRICT rollback failure raises ControlFailureError（no result） | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

No contract violations. No blocking issues. Runtime Execution Control baseline fixed.  
No production behavior changes during freeze.

### 12.3 Phase 18.8 Freeze Rule

```text
Architecture 18.8 System Governance Runtime Execution Control / Recovery SHALL be immutable.
Future Control contract changes SHALL NOT mutate Phase 18.8
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation-order / execution_control_result_id / exception hierarchy
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

---

## 13. Dependency Inheritance

```text
ExecutionControlResult → ExecutionResult → RuntimeOperation → RuntimeBinding → SystemGovernanceIntegration
  → GovernanceRuntime → Lifecycle → Orchestration → Convergence → Synthesis → Evolution → Reflection
  → Feedback → Distribution → Integration → NaturalLanguage → Rendering → Presentation
  → Recommendation → Reasoning → Audit → Decision
  → Checker → Graph → Query → Facade → Store
```

Runtime Execution Control consumes **RuntimeOperation**, **ExecutionContext**, and **ControlPolicy**.  
Phases 18.0–18.8 remain Frozen and unmodified.  
Architecture 15.0 / 16.0 / 17.1–17.9 source and baselines remain unchanged.

---

## 14. Status

| Field | Value |
|---|---|
| Registration | Open — Active Draft |
| Spec version | Draft 2.8 |
| Phase 18.0 | **Frozen / Accepted（Baseline 18.0）** |
| Phase 18.1 | **Frozen / Accepted（Baseline 18.1）** |
| Phase 18.2 | **Frozen / Accepted（Baseline 18.2）** |
| Phase 18.3 | **Frozen / Accepted（Baseline 18.3）** |
| Phase 18.4 | **Frozen / Accepted（Baseline 18.4）** |
| Phase 18.5 | **Frozen / Accepted（Baseline 18.5）** |
| Phase 18.6 | **Frozen / Accepted（Baseline 18.6）** |
| Phase 18.7 | **Frozen / Accepted（Baseline 18.7）** |
| Phase 18.8 | **Frozen / Accepted（Baseline 18.8）** |
| Based on | ASA-ARCH-17.0 Draft 1.5（Phase 17.1–17.9 Frozen） |
| Production SoT for Synthesis | **ASA-ARCH-17.0 Phase 17.9（Frozen）** |
| Production SoT for Convergence | **ASA-ARCH-18.0 Phase 18.0（Frozen）** |
| Production SoT for Orchestration | **ASA-ARCH-18.0 Phase 18.1（Frozen）** |
| Production SoT for Lifecycle | **ASA-ARCH-18.0 Phase 18.2（Frozen）** |
| Production SoT for Governance Runtime | **ASA-ARCH-18.0 Phase 18.3（Frozen）** |
| Production SoT for System Governance Integration | **ASA-ARCH-18.0 Phase 18.4（Frozen）** |
| Production SoT for Runtime Binding | **ASA-ARCH-18.0 Phase 18.5（Frozen）** |
| Production SoT for Runtime Operation | **ASA-ARCH-18.0 Phase 18.6（Frozen）** |
| Production SoT for Runtime Execution | **ASA-ARCH-18.0 Phase 18.7（Frozen）** |
| Production SoT for Runtime Execution Control | **ASA-ARCH-18.0 Phase 18.8（Frozen）** |
| Phase 18.0 Git tag | `arch-18.0-freeze` |
| Phase 18.1 Git tag | `arch-18.1-freeze` |
| Phase 18.2 Git tag | `arch-18.2-freeze` |
| Phase 18.3 Git tag | `arch-18.3-freeze` |
| Phase 18.4 Git tag | `arch-18.4-freeze` |
| Phase 18.5 Git tag | `arch-18.5-freeze` |
| Phase 18.6 Git tag | `arch-18.6-freeze` |
| Phase 18.7 Git tag | `arch-18.7-freeze` |
| Phase 18.8 Git tag | `arch-18.8-freeze` |
| Freeze Identifier（18.0） | ARCH-18.0-FREEZE |
| Freeze Identifier（18.1） | ARCH-18.1-FREEZE |
| Freeze Identifier（18.2） | ARCH-18.2-FREEZE |
| Freeze Identifier（18.3） | ARCH-18.3-FREEZE |
| Freeze Identifier（18.4） | ARCH-18.4-FREEZE |
| Freeze Identifier（18.5） | ARCH-18.5-FREEZE |
| Freeze Identifier（18.6） | ARCH-18.6-FREEZE |
| Freeze Identifier（18.7） | ARCH-18.7-FREEZE |
| Freeze Identifier（18.8） | ARCH-18.8-FREEZE |

---

## 15. Governance

| Role | Rule |
|---|---|
| Editable baseline | **ASA-ARCH-18.0** for post-18.8 evolution only via formal change control（Phase 18.0–18.8 frozen） |
| Constraint | MUST NOT mutate ASA-ARCH-15.0 / 16.0 / 17.0 Phase 17.1–17.9 freeze contracts |
| Upstream | Phases 18.0–18.8 remain Final / frozen |
| Phase 18.0 | Immutable after `arch-18.0-freeze` |
| Phase 18.1 | Immutable after `arch-18.1-freeze` |
| Phase 18.2 | Immutable after `arch-18.2-freeze` |
| Phase 18.3 | Immutable after `arch-18.3-freeze` |
| Phase 18.4 | Immutable after `arch-18.4-freeze` |
| Phase 18.5 | Immutable after `arch-18.5-freeze` |
| Phase 18.6 | Immutable after `arch-18.6-freeze` |
| Phase 18.7 | Immutable after `arch-18.7-freeze` |
| Phase 18.8 | Immutable after `arch-18.8-freeze` |
