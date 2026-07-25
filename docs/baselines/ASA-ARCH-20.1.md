# Architecture Baseline – ASA-ARCH-20.1

**Baseline ID:** ASA-ARCH-20.1  
**Title:** Runtime Orchestration Boundary  
**Version:** Draft 1.0（Phase 20.1 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 20.1 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.0（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.1.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.1-001  
**Implementation Spec:** `auto-scribe-ai/impl/runtime_orchestration_spec.md`  
**Package:** `auto-scribe-ai/src/runtime_orchestration/`  
**Acceptance:** ASA-VERIFY-ARCH-20.1-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-REQ-ARCH-20.1-001 / ASA-FREEZE-ARCH-20.1-001  
**Freeze Identifier:** ARCH-20.1-FREEZE  
**Git tag:** `arch-20.1-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-20.0 Frozen / Accepted  
* Architecture 20.1 SHALL NOT modify Architecture 15.x–20.0  
* **Phase 20.1 Runtime Orchestration Boundary is Frozen / Accepted（Draft 1.0）**  

---

## 2. Scope Summary

```text
Phase 20.1 defines Boundary Contracts for the 20.x Runtime Layer.
Not a feature-addition phase.
Prepares safe extension for 20.2–20.5 without eroding 20.0 Core.
```

| Area | Status |
|---|---|
| Ownership / Mutability contracts | Frozen / Accepted |
| Dependency direction | Frozen / Accepted |
| Policy / Scheduler / Lifecycle / Events Protocols | Frozen / Accepted |
| SchedulingPlan ownership model | Frozen / Accepted |
| BoundaryOrchestrator coordination point | Frozen / Accepted |
| Validation / Serialization | Frozen / Accepted |

---

## 3. Guarantees

```text
Upper → Lower only · No reverse into Core
Runtime State = ExecutionContext only
RuntimePlan / ExecutionGraph / ExecutionResult immutable
Events = notification only · Policy = judgment only
Scheduler generates SchedulingPlan; Orchestrator owns it
```

---

## 4. Phase 20.1 — Runtime Orchestration Boundary

**Status:** Frozen / Accepted  
**Baseline:** 20.1 Frozen  
**Git tag:** `arch-20.1-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-20.1-FREEZE  

### 4.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-REQ-ARCH-20.1-001 / ASA-FREEZE-ARCH-20.1-001 |
| Acceptance Review | ASA-VERIFY-ARCH-20.1-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Freeze Identifier | **ARCH-20.1-FREEZE** |
| Implementation | ASA-IMPL-REQ-ARCH-20.1-001 |
| Architecture Version | ASA-ARCH-20.1 Draft 1.0 |
| Phase status | **Frozen / Accepted** |
| Unit / Architecture / Pipeline Tests | **14 passed** |
| Regression | **782 passed** |

### 4.2 Freeze Verification

| Criterion | Result |
|---|---|
| Acceptance retained | PASS |
| Production Source unchanged during freeze | PASS |
| Pre/Post SHA256 identical | PASS |
| 20.0 Core checksum retained | PASS |
| Regression baseline retained | 782 passed |
| Blocking Issues | NONE |

### 4.3 Freeze Notes — Non-blocking

| ID | Detail |
|---|---|
| NB-1 | Spec remains Draft 1.0 |
| NB-2 | Algorithms deferred to 20.2–20.5 |
| NB-3 | BoundaryOrchestrator does not replace 20.0 RuntimeOrchestrator |
| NB-4 | Freeze commit is governance metadata only |

### 4.4 Phase 20.1 Freeze Rule

```text
Architecture 20.1 Runtime Orchestration Boundary SHALL be immutable.
Future boundary changes SHALL NOT mutate Phase 20.1
except through Change Requests that supersede via a later Architecture phase.
```

### 4.5 Production Source Checksums（frozen）

```text
4e7195eeece6175d8f4eb1aa565ed190fe2abbe9577a58d658cdafd740715f89  __init__.py
0dc1885a591b05223d6f5866a940852c009f159b0becda605edc101e68cb5844  contracts.py
2122d0a07b982c16f919f7d6e3a0fdb317e5bd18b394d82644e76dad5f399705  dependency.py
765cf2865d93c73b321ce7a98ad6278ba0707059b72d9605dc30ebefbc975a26  events.py
781674c418f22a022e995d6ed2ac7526bf922fe0e18130f3d2c9cba73d5ac483  exceptions.py
85ece1cc04033621794246a8be42651aa257e3841f12f88733d9c4a1295236ad  interfaces.py
e840e8a92957cc7369d72b5cc9694c80eae3b99588635f28fd90625ab51693fe  orchestrator_boundary.py
45b9bcdc5b6ecdcab459d6da28943085a273e80c5d261935527020d5e1caf0b7  ownership.py
bed6bae656e48e281ef207b5bfdbdb7dd9021b31a096c731c60e045fdc20c5f1  scheduling_plan.py
cebc6adb385aedc3ce1d4b00b3f5c699f1bdc4659fd244d7b2530d94a6be4e20  serialization.py
3cea4c53017149a5dc8651a2c3c3b51560aef97a6d2b3af0e10234e80d7cf9d2  validation.py
```

Package: `auto-scribe-ai/src/runtime_orchestration/`

---

## 5. Out of Scope

```text
Retry / Timeout algorithms · Scheduler algorithms · Lifecycle state machine
EventBus / Event delivery · Concurrency / Parallel / Workers / Queues · Policy logic
```

---

**End of Baseline（Draft 1.0 / Phase 20.1 Frozen / Accepted）**
