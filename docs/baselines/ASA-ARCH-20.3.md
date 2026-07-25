# Architecture Baseline – ASA-ARCH-20.3

**Baseline ID:** ASA-ARCH-20.3  
**Title:** Runtime Scheduler（Architecture Tests）  
**Version:** Design Guideline Draft 0.1（Phase 20.3 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 20.3 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.2（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.3.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.3-001  
**Implementation Spec:** `auto-scribe-ai/impl/runtime_scheduler_arch_tests_spec.md`  
**Declarations:** `auto-scribe-ai/src/runtime_scheduler/`  
**Architecture Tests:** `auto-scribe-ai/tests/runtime_scheduler/`  
**Acceptance:** ASA-VERIFY-ARCH-20.3-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-20.3-001  
**Freeze Identifier:** ARCH-20.3-FREEZE  
**Git tag:** `arch-20.3-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-20.0 / 20.1 / 20.2 Frozen  
* Architecture 20.3 SHALL NOT modify Architecture 15.x–20.2  
* **Phase 20.3 Runtime Scheduler Architecture Tests are Frozen / Accepted**  

---

## 2. Scope Summary

```text
Non-deterministic scheduling layer（contract shell）.
Generates SchedulingPlan（owned by Orchestrator）.
Does not hold Runtime State · does not call Policy/Lifecycle.
QueueModel / PriorityModel / RetryStrategy are pluggable.
```

| Area | Status |
|---|---|
| Structural contracts | Frozen / Accepted |
| Behavioral contracts | Frozen / Accepted |
| Extension contracts | Frozen / Accepted |
| Minimal runtime_scheduler declarations | Frozen / Accepted |

---

## 3. Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance | ASA-VERIFY-ARCH-20.3-ACCEPTANCE-001 — PASSED |
| Architecture Tests | **14 passed** |
| Regression | **818 passed** |
| 20.0 / 20.1 / 20.2 checksums | UNCHANGED |
| Blocking Issues | NONE |

### 3.1 Production Source Checksums（frozen）— `runtime_scheduler/`

```text
bef20043206b1053ca3f445087af5dace373f33e05e6350cbe6ef93a0a03b2c6  __init__.py
c85c59e05cac38d71f5f8127ced66c48de008b9625753c1398633652f5fc1af2  exceptions.py
f6fcc745536dd3f1391daff14d4c801c18f8a7c7fcb3413aaf6f88383ed4f32a  models.py
e23a5d9cb1289cb1236f00e83153159a73c2bc87b26b77a4f1ffc902ee1de7a2  plugins.py
57cc9addb76b47598431fd36c2709f29642fb0f0d3d45c1bd82a3358ec83934b  scheduler.py
```

### 3.2 Freeze Rule

```text
Architecture 20.3 Scheduler Architecture Tests / declarations SHALL be immutable.
Future scheduler algorithm expansions SHALL NOT mutate Phase 20.3
except through Change Requests that supersede via a later Architecture phase.
```

---

## 4. Out of Scope

```text
Full production scheduling algorithms · Lifecycle · EventBus
Worker threads · Persistent queues
```

---

**End of Baseline（Phase 20.3 Frozen / Accepted）**
