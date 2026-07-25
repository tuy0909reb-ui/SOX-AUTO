# Architecture Baseline – ASA-ARCH-19.2

**Baseline ID:** ASA-ARCH-19.2  
**Title:** Capability Layer  
**Version:** Draft 0.2（Phase 19.2 Frozen / Accepted）  
**Status:** Open — Active Draft（Phase 19.2 Frozen）  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-19.1 Workflow Engine（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-19.2.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-19.2-001  
**Implementation Spec:** `auto-scribe-ai/impl/capability_layer_spec.md`  
**Package:** `auto-scribe-ai/src/capability/`  
**Acceptance:** ASA-VERIFY-ARCH-19.2-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-19.2-001  
**Freeze Identifier:** ARCH-19.2-FREEZE  
**Git tag:** `arch-19.2-freeze`  
**Freeze Date:** 2026-07-25  

---

## 1. Registration Declaration

* Based on ASA-ARCH-19.0 / 19.1  
* Architecture 19.2 SHALL NOT modify Architecture 15.x–19.1  
* **Phase 19.2 Capability Layer is Frozen / Accepted（Draft 0.2）**  

---

## 2. Scope Summary

```text
Phase 19.2 defines Capability / CapabilitySet definition models only.
Reuses Phase 19.1 ContractDefinition（no redefinition）.
No Execution / Scheduling / RuntimeService ownership / I/O.
```

| Area | Status |
|---|---|
| Capability | Frozen / Accepted |
| CapabilitySet（unversioned） | Frozen / Accepted |
| Validation / Serialization | Frozen / Accepted |

---

## 3. Architecture Position

```text
Core Platform（19.0）
        │
        ▼
Capability Layer（19.2）  ← Frozen / definition-only
        │
        ▼
Workflow Engine（19.1）
        │
        ▼
Execution Layer（18.x）
```

Technical dependency for ContractDefinition reuse: `capability → workflow.contract_definition`.  
Workflow production source remains Frozen / unmodified.

---

## 4. Guarantees

```text
Immutable · Pure Definition Model · Deterministic · Side-effect Free
Definition-only · Runtime Independent · No RuntimeService ownership
```

---

## 5. Phase 19.2 — Capability Layer

**Status:** Frozen / Accepted  
**Baseline:** 19.2 Frozen  
**Git tag:** `arch-19.2-freeze`  
**Freeze Date:** 2026-07-25  
**Freeze Identifier:** ARCH-19.2-FREEZE  
**Normative spec:** `auto-scribe-ai/impl/capability_layer_spec.md`  

**Included Components:**

```text
Capability · CapabilitySet · Validation · Serialization
ContractDefinition reuse（Phase 19.1）
```

### 5.1 Acceptance & Freeze Record

| Field | Value |
|---|---|
| Freeze Instruction | ASA-FREEZE-ARCH-19.2-001 |
| Acceptance Review | ASA-VERIFY-ARCH-19.2-ACCEPTANCE-001 |
| Acceptance Result | **PASSED** |
| Acceptance Status | **ACCEPTED** |
| Architecture Review | **PASSED** |
| Eligible for Baseline Freeze | **YES** |
| Freeze Request | ASA-FREEZE-ARCH-19.2-001 |
| Freeze Identifier | **ARCH-19.2-FREEZE** |
| Implementation | ASA-IMPL-REQ-ARCH-19.2-001 |
| Architecture Version | ASA-ARCH-19.2 Draft 0.2 |
| Phase status | **Frozen / Accepted** |
| Baseline | **19.2 Frozen** |
| Freeze Date | **2026-07-25** |
| Freeze Scope | Phase 19.2 Capability Layer Frozen |
| Unit / Architecture / Pipeline Tests | **22 passed** |
| Regression | **695 passed** |

### 5.2 Freeze Verification

| Criterion | Result |
|---|---|
| Architecture Consistency | PASS |
| Responsibility Boundary | PASS |
| Dependency Direction | PASS |
| Determinism Boundary | PASS |
| Immutability | PASS |
| Definition-only | PASS |
| Capability Layer Isolation | PASS |
| ContractDefinition Reuse | PASS |
| Traceability Boundary | PASS |
| Version Responsibility Boundary | PASS |
| Regression | 695 passed |
| Production Source | UNCHANGED |
| Blocking Issues | NONE |

### 5.3 Freeze Notes — Non-blocking

| ID | Topic | Detail | Status |
|---|---|---|---|
| NB-1 | Spec maturity | Spec remains Draft 0.2（Finalization recorded at freeze） | Non-blocking |
| NB-2 | Contract reuse | `capability → workflow.contract_definition`; Workflow Frozen | Non-blocking |
| NB-3 | Wiring deferred | WorkflowStep → Capability wiring deferred | Non-blocking |
| NB-4 | Freeze commit scope | Production source outside freeze commit（governance metadata only） | Non-blocking |

### 5.4 Phase 19.2 Freeze Rule

```text
Architecture 19.2 Capability Layer SHALL be immutable.
Future Capability contract changes SHALL NOT mutate Phase 19.2
except through Change Requests that supersede via a later Architecture phase.
No functional / API / contract / validation / serialization
changes without formal architectural approval.
```

Production behavior unchanged by this freeze（governance documents only）.

### 5.5 Production Source Checksums（frozen）

```text
c717363369dc591ee643a61492622db52a58d1a4eaa613c1d87e05af71f2c0b9  __init__.py
23c878294a7c4d78c8c2b09692f9801ab19076268a4dbb3819c1a3279c2e6ab8  capability.py
23b01dc50efedb11bf621b27958d344270734868d652b81106952360a0f55039  capability_set.py
e565d834e56f026cf80281aa4a9130781c6105c89c5df35e9ae1ded3547a77b6  exceptions.py
069aee5b887c0d89ae191c86f1ea38b9523d6b8aee7b5ceb12d09986e8220d58  serialization.py
8201d2371de7cf1d7684bf67bfec2fb58f976a3df8b7d237dfe9d0b526d333b6  validation.py
```

---

## 6. Out of Scope

```text
Execution · Scheduling · Retry · Timeout · Recovery · Persistence
Event Routing · Service Discovery · Runtime State · Version Validation · I/O
```

---

**End of Baseline（Draft 0.2 / Phase 19.2 Frozen / Accepted）**
