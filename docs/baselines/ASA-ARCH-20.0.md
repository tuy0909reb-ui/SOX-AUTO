# Architecture Baseline – ASA-ARCH-20.0

**Baseline ID:** ASA-ARCH-20.0  
**Title:** Runtime Core  
**Version:** Draft 1.3（Phase 20.0 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 20.0 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-19.5（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.0.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.0-IMPLEMENTATION-001  
**Implementation Spec:** `auto-scribe-ai/impl/runtime_core_spec.md`  
**Package:** `auto-scribe-ai/src/runtime_core/`  
**Acceptance:** ASA-VERIFY-ARCH-20.0-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-REQ-ARCH-20.0-001 / ASA-FREEZE-ARCH-20.0-001  
**Freeze Identifier:** ARCH-20.0-FREEZE  
**Git tag:** `arch-20.0-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-18.x / 19.0–19.5  
* Architecture 20.0 SHALL NOT modify Architecture 15.x–19.5  
* **Phase 20.0 Runtime Core is Frozen / Accepted（Draft 1.3）**  

---

## 2. Scope Summary

```text
Phase 20.0 introduces the minimum runtime orchestration layer.
Consumes RuntimePlan（19.5）.
Owns ExecutionContext（sole Runtime State）+ ExecutionGraph（internal）.
Produces ExecutionResult at terminal states.
Execution semantics delegated to Phase 18.x via OperationExecutor port.
```

| Area | Status |
|---|---|
| RuntimeOrchestrator | Frozen / Accepted |
| ExecutionContext / ExecutionTrace | Frozen / Accepted |
| ExecutionGraph（internal） | Frozen / Accepted |
| Result Model（BaseResult hierarchy） | Frozen / Accepted |
| Validation / Serialization | Frozen / Accepted |

---

## 3. Architecture Position

```text
RuntimeOrchestrator owns ExecutionContext + ExecutionGraph
Consumes immutable RuntimePlan（19.5）
Delegates RuntimeOperation execution via OperationExecutor → Phase 18.x
No Capability / Contract / Binding resolution · No Scheduler · No Persistence
```

---

## 4. Guarantees

```text
Stateful Runtime Layer · No Definition generation
No RuntimeOperation ownership
RuntimePlan immutable · ExecutionTrace append-only
ExecutionGraph internal · ExecutionContext sole Runtime State
```

---

## 5. Phase 20.0 — Runtime Core

**Status:** Frozen / Accepted  
**Baseline:** 20.0 Frozen  
**Git tag:** `arch-20.0-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-20.0-FREEZE  

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-REQ-ARCH-20.0-001 / ASA-FREEZE-ARCH-20.0-001 |
| Acceptance Review | ASA-VERIFY-ARCH-20.0-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Freeze Identifier | **ARCH-20.0-FREEZE** |
| Implementation | ASA-IMPL-REQ-ARCH-20.0-IMPLEMENTATION-001 |
| Architecture Version | ASA-ARCH-20.0 Draft 1.3 |
| Phase status | **Frozen / Accepted** |
| Unit / Architecture / Pipeline Tests | **16 passed** |
| Regression | **768 passed** |

### 5.2 Freeze Verification

| Criterion | Result |
|---|---|
| Acceptance retained | PASS |
| Production Source unchanged | PASS |
| Pre/Post SHA256 identical | PASS |
| Regression baseline retained | 768 passed |
| Blocking Issues | NONE |

### 5.3 Freeze Notes — Non-blocking

| ID | Detail |
|---|---|
| NB-1 | Spec remains Draft 1.3 |
| NB-2 | Failed retains Context for resume; dispose on Completed/Cancelled |
| NB-3 | Phase 18.x via injected OperationExecutor port |
| NB-4 | Freeze commit is governance metadata only |

### 5.4 Phase 20.0 Freeze Rule

```text
Architecture 20.0 Runtime Core SHALL be immutable.
Future runtime-core changes SHALL NOT mutate Phase 20.0
except through Change Requests that supersede via a later Architecture phase.
```

### 5.5 Production Source Checksums（frozen）

```text
b82a56380ca13b2c4cdb7187ac8a83d4db0c29bce29a9cb4f10a510d1d9dab72  __init__.py
9a338bd2645a320c853cfadfcc322c6ed68e4cf2e2405f0de9e1a6a019f85f13  context.py
a5c6727ea0f303fda0df9b246a5f105bf46717c05bdb4f9b94fd13da84a224a7  exceptions.py
b41066c81b2f6d1369c35778f1a7db886afb18ace28b1910a2fd4555d731b8b3  execution_graph.py
7d434ef67b70986fc4bbb04f5f2d41f8fc14b80a74dc037902555685370c88b2  orchestrator.py
2585b641467420578dc40e33bba6b0b7d66047ae0eff05a834e180bb03557543  results.py
00925039de16b3e850f6285d779ab4738009d7fd2e3af36d3bcd74976944073f  serialization.py
51eadafea4e86930d1b8205fd902b3fff1c212c08f00a4cd92ee75cf84817f04  validation.py
```

Package: `auto-scribe-ai/src/runtime_core/`

---

## 6. Out of Scope

```text
Definition generation · Capability / Contract / Binding resolution
RuntimeOperation ownership · Scheduler · Persistence · Service Discovery
RuntimePlan mutation
```

---

**End of Baseline（Draft 1.3 / Phase 20.0 Frozen / Accepted）**
