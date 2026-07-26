# ASA-ARCH-20.9.0 Verification Mapping

本書は ASA-ARCH-20.9.0 Orchestration Core Specification（Draft 1.3）の契約を、  
Verification Plan の検証項目へ対応付ける。

Baseline: `docs/baselines/ASA-ARCH-20.9.0.md`  
Specification: `docs/specs/asa_arch_20_9_0_orchestration_core.md`  
Verification Plan: `docs/specs/asa_arch_20_9_0_verification_plan.md`

---

# 1. Draft 1.3 Contracts → Verification Items

| Contract | Spec Section | Verification Plan | Mapping ID |
|---|---|---|---|
| Lifecycle | §3.2 / §3.3 | 2.7 Lifecycle Validation | MAP-LC-001 |
| Ready Contract | §3.4 / §3.5 | 2.7 Lifecycle Validation | MAP-RDY-001 |
| Execute Contract | §3.6 | 2.7 Lifecycle Validation | MAP-EXE-001 |
| Shutdown Contract | §3.7 | 2.7 Lifecycle Validation | MAP-SHD-001 |
| Context Ownership | §4.3 | 2.9 Context Ownership Validation | MAP-CTX-001 |
| Snapshot Contract | §4.4 | 2.9 Context Ownership Validation | MAP-SNP-001 |
| Immutable Graph | §5.1 | 2.8 Graph Contract Validation | MAP-GRF-001 |
| DAG Validation | §5.1 / §5.3 | 2.8 Graph Contract Validation | MAP-DAG-001 |
| GraphBuilder Determinism | §5.2 | 2.8 Graph Contract Validation | MAP-BLD-001 |
| Validator Non-Mutation | §5.3 | 2.8 Graph Contract Validation | MAP-VAL-001 |
| RuntimePlan Lifecycle | §7 | 2.8 Graph Contract Validation | MAP-PLN-001 |
| ErrorPolicy Boundary | §6 | 2.10 Error Policy Validation | MAP-ERR-001 |
| Communication Constraint | §8 | 2.5 Runtime Compatibility / Responsibility | MAP-COM-001 |

---

# 2. Detailed Mapping

## 2.1 Lifecycle

| Element | Spec | Verify |
|---|---|---|
| Normal path Created→…→Shutdown | §3.2 | VP-007 |
| Failure path Created→Failed→Shutdown | §3.2 | VP-007 |
| initialize Created-only | §3.3 | VP-007 |
| Failed re-init prohibited | §3.3 | VP-007 |

## 2.2 Ready Contract

| Element | Spec | Verify |
|---|---|---|
| Graph built by ExecutionGraphBuilder | §3.4(1), §3.5(1) | VP-007 / VP-008 |
| Graph validated by GraphValidator | §3.4(2), §3.5(2) | VP-007 / VP-008 |
| OrchestrationContext initialized | §3.4(3), §3.5(3) | VP-007 / VP-009 |
| Required ExecutionEngines constructed | §3.4(4), §3.5(4) | VP-007 / VP-005 |
| Side-effect-free success | §3.4(5) | VP-007 |

## 2.3 Execute Contract

| Element | Spec | Verify |
|---|---|---|
| Ready-only | §3.6 | VP-007 |
| Once per lifecycle | §3.6 | VP-007 |
| No re-call in Running | §3.6 | VP-007 |
| No call from Completed/Failed | §3.6 | VP-007 |
| SHALL NOT implicitly invoke shutdown() | §3.6 | VP-007 |

## 2.4 Shutdown Contract

| Element | Spec | Verify |
|---|---|---|
| Idempotent | §3.7 | VP-007 |
| Callable from Initialized/Ready/Running/Completed/Failed | §3.7 | VP-007 |
| No further initialize/execute after Shutdown | §3.7 | VP-007 |

## 2.5 Context Ownership

| Element | Spec | Verify |
|---|---|---|
| Only Orchestrator may mutate Context | §4.3 | VP-009 |
| Engine notifies events only | §4.3 | VP-009 / MAP-COM-001 |

## 2.6 Snapshot Contract

| Element | Spec | Verify |
|---|---|---|
| Snapshot SHALL NOT reference mutable internal state | §4.4 | VP-009 |
| Snapshot immutable after creation | §4.4 | VP-009 |
| Snapshot available while Running | §4.4 | VP-009 |

## 2.7 Immutable Graph

| Element | Spec | Verify |
|---|---|---|
| Immutable DAG | §5.1 | VP-008 |
| Nodes/edges immutable after construction | §5.1 | VP-008 |
| Node internal fields immutable | §5.1 | VP-008 |

## 2.8 DAG Validation

| Element | Spec | Verify |
|---|---|---|
| Directed edges | §5.1 | VP-008 |
| Acyclic / topological sort | §5.1 | VP-008 |
| Deterministic execution order (DET) | §5.1 | VP-008 / VP-006 |
| Cycles / isolates / duplicate IDs / disconnected / entrypoint | §5.3 | VP-008 |
| Validation failure → initialize failure → Failed | §5.3 | VP-007 / VP-008 |

## 2.9 GraphBuilder Determinism

| Element | Spec | Verify |
|---|---|---|
| Pure function RuntimePlan → ExecutionGraph | §5.2 | VP-008 |
| Same plan → same graph | §5.2 | VP-008 |
| Need not be injective | §5.2 | VP-008 |

## 2.10 Validator Non-Mutation

| Element | Spec | Verify |
|---|---|---|
| GraphValidator SHALL NOT mutate ExecutionGraph | §5.3 | VP-008 |

## 2.11 RuntimePlan Lifecycle

| Element | Spec | Verify |
|---|---|---|
| Input to Builder | §7 | VP-008 |
| May be discarded after valid graph | §7 | VP-008 |
| Orchestrator does not mutate RuntimePlan | §7 | VP-008 |

## 2.12 ErrorPolicy Boundary

| Element | Spec | Verify |
|---|---|---|
| SHALL NOT modify ExecutionGraph | §6.1 | VP-010 |
| Decides continuation / state transition only | §6.1 | VP-010 |
| STOP_ON_ERROR / CONTINUE / COLLECT_ERRORS | §6.2 | VP-010 |

## 2.13 Communication Constraint

| Element | Spec | Verify |
|---|---|---|
| No direct Engine-to-Engine communication | §8 | VP-005 |
| Path: Engine → Orchestrator → Context → Engine | §8 | VP-005 / VP-009 |

---

# 3. Frozen Compatibility Mapping

| Frozen Area | Constraint | Registration Check |
|---|---|---|
| INV / DEP / RB / DET / SEM / ERR / FLC | 変更禁止 | VP-006 |
| Runtime Model / Multi-Event Runtime | 変更禁止 | VP-005 / VP-006 |
| Runtime Execution Layer / ExecutionEngine | 変更禁止 | VP-005 / VP-006 |
| ExecutionLayerInput | Non-Frozen only | VP-005 |

---

# 4. Freeze Contract IDs → Mapping

| Spec Freeze Contract | Mapping ID |
|---|---|
| FC-LIFECYCLE | MAP-LC-001 |
| FC-READY | MAP-RDY-001 |
| FC-EXECUTE | MAP-EXE-001 |
| FC-SHUTDOWN | MAP-SHD-001 |
| FC-CTX-OWN | MAP-CTX-001 |
| FC-SNAPSHOT | MAP-SNP-001 |
| FC-GRAPH-IMM | MAP-GRF-001 |
| FC-BUILDER | MAP-BLD-001 |
| FC-VALIDATOR | MAP-VAL-001 |
| FC-PLAN-LC | MAP-PLN-001 |
| FC-ERROR-POL | MAP-ERR-001 |
| FC-COMM | MAP-COM-001 |
| FC-INIT-SEQ | MAP-RDY-001（Initialization Sequence） |

---

# 5. Coverage Statement

Draft 1.3 の最低対象契約はすべて Verification Plan 項目へ対応付け済みである。

```text
Lifecycle                 → VP-007
Ready Contract            → VP-007 / VP-008 / VP-009 / VP-005
Execute Contract          → VP-007
Shutdown Contract         → VP-007
Context Ownership         → VP-009
Snapshot Contract         → VP-009
Immutable Graph           → VP-008
DAG Validation            → VP-008
GraphBuilder Determinism  → VP-008
Validator Non-Mutation    → VP-008
RuntimePlan Lifecycle     → VP-008
ErrorPolicy Boundary      → VP-010
Communication Constraint  → VP-005 / VP-009
```
