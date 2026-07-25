# Architecture Baseline – ASA-ARCH-19.1

**Baseline ID:** ASA-ARCH-19.1  
**Title:** Workflow Engine  
**Version:** Draft 0.6（Phase 19.1 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 19.1 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-19.0 Core Platform（Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-19.1.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-19.1-001  
**Implementation Spec:** `auto-scribe-ai/impl/workflow_engine_spec.md`  
**Package:** `auto-scribe-ai/src/workflow/`  
**Acceptance:** ASA-VERIFY-ARCH-19.1-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-19.1-001  
**Freeze Identifier:** ARCH-19.1-FREEZE  
**Git tag:** `arch-19.1-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-19.0 Core Platform  
* Architecture 19.1 SHALL NOT modify Architecture 15.x–19.0  
* **Phase 19.1 Workflow Engine is Frozen / Accepted（Draft 0.6）**  

---

## 2. Scope Summary

```text
Phase 19.1 defines Workflow Engine definition models only.
No Execution / Scheduling / Retry / Timeout / Recovery / Persistence.
No Event Routing / Service Discovery / Runtime State / I/O.
Depends only on Phase 19.0 Core Platform.
```

| Area | Status |
|---|---|
| Workflow / Step / Graph / Node / Edge | Frozen / Accepted |
| ExecutionPlan / Stage | Frozen / Accepted |
| ContractDefinition / StepReference | Frozen / Accepted |
| Validation / Serialization / Plan Generation | Frozen / Accepted |

---

## 3. Architecture Position

```text
Core Platform（19.0）
        │
        ▼
Workflow Engine（19.1）  ← Frozen / definition-only
        │
        ▼
（future Runtime Service / Event / State / …）
```

---

## 4. Guarantees

```text
Immutable · Pure Definition Model · Deterministic · Side-effect Free
Definition-only · Runtime Independent
```

---

## 5. Phase 19.1 — Workflow Engine

**Status:** Frozen / Accepted  
**Baseline:** 19.1 Frozen  
**Git tag:** `arch-19.1-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-19.1-FREEZE  
**Normative spec:** `auto-scribe-ai/impl/workflow_engine_spec.md`  

**Included Components:**

```text
Workflow · WorkflowStep · WorkflowGraph · WorkflowNode · WorkflowEdge
ExecutionPlan · ExecutionPlanStage · ContractDefinition · StepReference
Validation · ExecutionPlan Generation · Serialization
```

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-ARCH-19.1-001 |
| Acceptance Review | ASA-VERIFY-ARCH-19.1-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-FREEZE-ARCH-19.1-001 |
| Freeze Identifier | **ARCH-19.1-FREEZE** |
| Implementation | ASA-IMPL-REQ-ARCH-19.1-001 |
| Architecture Version | ASA-ARCH-19.1 Draft 0.6 |
| Phase status | **Frozen / Accepted** |
| Baseline | **19.1 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phase 19.1 Workflow Engine Frozen |
| Unit / Architecture / Pipeline Tests | **30 passed** |
| Regression | **673 passed** |

### 5.2 Freeze Verification

| Criterion | Result |
|---|---|
| Architecture Consistency | PASS |
| Responsibility Boundary | PASS |
| Dependency Direction | PASS |
| Circular Dependency | PASS |
| Determinism Boundary | PASS |
| Immutability | PASS |
| Definition-only Semantics | PASS |
| Validation | PASS |
| Serialization | PASS |
| Pipeline | PASS |
| Regression | 673 passed |
| Production Source | UNCHANGED |
| Blocking Issues | NONE |

### 5.3 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.6（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Step body location | `Workflow.steps` holds sole step body | Non-blocking |
| NB-3 | Schema validation | Schema body validation remains deferred | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

### 5.4 Phase 19.1 Freeze Rule

```text
Architecture 19.1 Workflow Engine SHALL be immutable.
Future Workflow Engine contract changes SHALL NOT mutate Phase 19.1
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation / plan-generation / serialization
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

### 5.5 Production Source Checksums（frozen）

```text
07a875cbb7b4179a67c7f2960c123361fcb383e24c0092a48bdd9cf747ea0224  __init__.py
a094e61765f10b3feed9e8084f7e7559c2bb013871c8f704d1a6954446dd0bf1  contract_definition.py
fbcf1c7326d31634d8e116872bc17afd8dcc35e41421e45f356b8776972f6bcb  enums.py
c5db9d1f29cadc77d812f1336d59529159e284e35a381442304db74bce52afba  exceptions.py
c62a942d347d7b4490fe441e0f27276247b8cd4b1e95b9d56f434c15cfd535cb  execution_plan.py
3c44c525c4e86327ed614c52fdea48310183816a42eb1b311d005ee33c91944d  execution_plan_stage.py
70c77d4f6733bf55fd645b548369b1436af5ac19292187f6f7303a678b45843b  serialization.py
2b14ca3ecfefec3dea48ebd5d92d9443e10f2be5db6b884d122d575b15ad1930  step_reference.py
b97271e85fb9ce291e7866c5ee0330a3f919871cc6026e3ccb05f3963c106c9b  validation.py
eec31a0c83286363c9749ba5cc1a4772763e703f8944723b4503b46cf6844141  workflow.py
5b60394e53a4305829bd7de55f3349180583f6301aeb4b0724f135934bb01554  workflow_edge.py
266c91396b383c8573ecb9b9e978f80f9907a97f7eb776a653441914e6558980  workflow_graph.py
649c6b5890defc00381b5d7fef0df9bb0f5327ef82543e6354e84ab11fdc1e88  workflow_node.py
b64d3d7cb52b34cdd563693c6099bb8fac14acef589838fcdb482ad503322653  workflow_step.py
```

---

## 6. Out of Scope

```text
Execution · Scheduling · Retry · Timeout · Recovery · Persistence
Event Routing · Service Discovery · Runtime State · Schema Validation · I/O
```

---

**End of Baseline（Draft 0.6 / Phase 19.1 Frozen / Accepted）**
