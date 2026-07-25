# Architecture Baseline – ASA-ARCH-19.3

**Baseline ID:** ASA-ARCH-19.3  
**Title:** Capability Graph & Capability Registry  
**Version:** Draft 1.1（Phase 19.3 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 19.3 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-19.2 Capability Layer（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-19.3.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-19.3-001  
**Implementation Spec:** `auto-scribe-ai/impl/capability_graph_spec.md`  
**Package:** `auto-scribe-ai/src/capability_graph/`  
**Acceptance:** ASA-VERIFY-ARCH-19.3-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-19.3-001 / ASA-FREEZE-REQ-ARCH-19.3-001  
**Freeze Identifier:** ARCH-19.3-FREEZE  
**Git tag:** `arch-19.3-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-19.0 / 19.1 / 19.2  
* Architecture 19.3 SHALL NOT modify Architecture 15.x–19.2  
* **Phase 19.3 Capability Graph & Registry is Frozen / Accepted（Draft 1.1）**  

---

## 2. Scope Summary

```text
Phase 19.3 defines CapabilityGraph + CapabilityRegistry + pure Analyzer.
Definition-only / Immutable / Deterministic.
No RuntimeService / Execution / Persistence / I/O.
```

| Area | Status |
|---|---|
| CapabilityGraph / Node / Edge | Frozen / Accepted |
| CapabilityRegistry | Frozen / Accepted |
| CapabilityGraphAnalyzer | Frozen / Accepted |
| Validation / Serialization | Frozen / Accepted |

---

## 3. Architecture Position

```text
Workflow Engine（19.1） references Capability Registry
Capability Registry references Capability（19.2）
Capability Graph references Capability（19.2）
CapabilityGraphAnalyzer analyzes CapabilityGraph（pure）
```

---

## 4. Guarantees

```text
Pure · Immutable · Deterministic · Definition-only
DAG（No Cycle） · Registry uniqueness · Graph–Registry consistency
```

---

## 5. Phase 19.3 — Capability Graph & Registry

**Status:** Frozen / Accepted  
**Baseline:** 19.3 Frozen  
**Git tag:** `arch-19.3-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-19.3-FREEZE  

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-REQ-ARCH-19.3-001 |
| Acceptance Review | ASA-VERIFY-ARCH-19.3-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Freeze Identifier | **ARCH-19.3-FREEZE** |
| Implementation | ASA-IMPL-REQ-ARCH-19.3-001 |
| Architecture Version | ASA-ARCH-19.3 Draft 1.1 |
| Phase status | **Frozen / Accepted** |
| Unit / Architecture / Pipeline Tests | **21 passed** |
| Regression | **716 passed** |

### 5.2 Freeze Notes — Non-blocking

| ID | Detail |
|---|---|
| NB-1 | Spec remains Draft 1.1 |
| NB-2 | Result objects remain local（not Core） |
| NB-3 | Workflow → Registry wiring deferred |
| NB-4 | Freeze commit is governance metadata only |

### 5.3 Phase 19.3 Freeze Rule

```text
Architecture 19.3 Capability Graph & Capability Registry SHALL be immutable.
Future contract changes SHALL NOT mutate Phase 19.3
except through Change Requests that supersede via a later Architecture phase.
```

### 5.4 Production Source Checksums（frozen）

```text
ee63de53c96b17572f942943bba8a5f5357d97ddf7465905a8733ba79348a014  __init__.py
312c5b8678886027bd131fd340a1826a38859dded929020c80d2247bff489830  analyzer.py
09a0426507733408bd23c924b3905dea2a737f01e04302230ac2492b43158663  exceptions.py
f8031f795555ec409d40cff509b4c1cc06b5ac8fa85b07138a00150bf7c4e7bb  graph.py
bedb3e8b07290f974d886dc778e3f04bd84d9581bce3ecb1a6d96c6bac5c6a1e  models.py
a0a759fbe1b7a9e2169b201c1f772079246fd2d21976ac159e758ed0a802ef63  registry.py
9e229eee54a0003272880f81e863f2641bbc10378b327e8f0aab65fada838548  results.py
821a3a510a524dadea418a630a77b192a9726f7ac53e950d706110c6f4d2d941  serialization.py
de597280a0dbdf0b00884ce28b666983c99e523f4345a180750bb7b002e18bd6  validation.py
```

---

## 6. Out of Scope

```text
Execution · Scheduling · Retry · Timeout · Recovery · Persistence
Event Routing · Service Discovery · Runtime State · I/O
```

---

**End of Baseline（Draft 1.1 / Phase 19.3 Frozen / Accepted）**
