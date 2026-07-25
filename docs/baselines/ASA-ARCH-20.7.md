# Architecture Baseline – ASA-ARCH-20.7

**Baseline ID:** ASA-ARCH-20.7  
**Title:** Multi-Event Runtime（Pre-Pipeline Runtime）  
**Version:** Draft 0.5（Phase 20.7 Frozen / Accepted）  
**Status:** Closed — Frozen / Accepted  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.6（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.7.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.7-001  
**Implementation Spec:** `auto-scribe-ai/impl/pre_pipeline_runtime_spec.md`  
**Acceptance:** ASA-VERIFY-ARCH-20.7-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-20.7-001  
**Freeze Identifier:** ARCH-20.7-FREEZE  
**Git tag:** `arch-20.7-freeze`  
**Freeze Date:** 2026-07-26  
**Production:** `auto-scribe-ai/src/pre_pipeline_runtime/`  
**Architecture Tests:** `auto-scribe-ai/tests/architecture/pre_pipeline_runtime/`  

---

## 0. Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance | ASA-VERIFY-ARCH-20.7-ACCEPTANCE-001 — PASSED |
| Architecture Tests | **18 passed** |
| Regression | **941 passed** |
| 20.0〜20.6 checksums | UNCHANGED |
| Blocking Issues | NONE |

### 0.1 Production Source Checksums（frozen）— `pre_pipeline_runtime/`

```text
5a474246f6f15974b9e046204c60165855a9b1e22df42529b09d289779000b39  __init__.py
d6a6f3076ff70af5b112ae93831de7b7e337e1875e0e79a977a1fe5bc71c048e  aggregation.py
5ed5ed23dd710bbfe59fec7cdf4ddd0d56c067dd2854ca781f670e0f573edda1  backpressure.py
d4ff4e2733728534af8d9abe2bd1aae9877e73320a51c8f5203dbc53d0929179  burst_coordinator.py
847f0a13a007363e6c3cbd2d2cb5182e2e7ef89e8750529b08e038a1cda7e65a  debouncing.py
ff6841710a00a43316e2fd55dd9fa2de47ce649d06812cefd202b5863ab798e5  event_batch.py
b9753d2527cac1e7d9fdd5401858dde3e0cd28d044583fa8b3ae444ec920c297  event_stream.py
063587f146d3b4c9b6b3fa4a24e783b857cf52ff47532d29ffd6b33eb1451d85  exceptions.py
b63835f07918ed5d6e43c958936b62f70749e4d2f7f2e7b3e756fa53a58f35ab  policy_set.py
36abab20b4587f01a409660d3921ba550d79f8a92fe4ed5e558a1e9735152c51  pre_pipeline_runtime.py
f3d5e9ce419cd03bd8ed9b3fd9c435540d3094b2a86b4ff34e7c17387448e61a  prioritization.py
f65e54aa663ebcb60f3c4e0bb3792ecccd51c0683e7352a42310c40df64674f5  priority.py
c6737500a4926aac4addb08f852f49383e5d0044bef2a9616fb1528064889517  queue_observation.py
91eff1cabddd18e89f7504ec3c3a10027ca0f318ba527302dfeecbe69376a186  transformation.py
```

### 0.2 Freeze Rule

```text
Architecture 20.7 Multi-Event Runtime SHALL be immutable.
Future multi-event / throughput / distribution expansions
SHALL NOT mutate Phase 20.7 except through Change Requests that
supersede via a later Architecture phase（20.8+）.
```

---

## 1. Registration Declaration

* Based on ASA-ARCH-20.0〜20.6 Frozen Baselines  
* Architecture 20.7 SHALL NOT modify Architecture 15.x–20.6 contracts  
* Multi-Event Runtime is a Pre-Pipeline Runtime（Ingress Processing Layer）  

---

## 2. Scope Summary

```text
Orchestrator
    ↓
Pre-Pipeline Runtime（Aggregation / Debouncing / Prioritization / Backpressure / Burst）
    ↓
Runtime Pipeline（20.6）
```

Output MUST be semantically equivalent to 20.6 Pipeline Inputs（LifecycleTrigger sequence）.

---

## 3. Out of Scope

* Modifications to Orchestrator / Scheduler / Lifecycle / Event System / Pipeline internal contracts  
* Distributed / high-throughput designs（→ 20.8+）  

---

## 4. Normative Architecture

See ASA-ARCH-20.7 Multi-Event Runtime — Architecture Specification Draft 0.5
as provided in ASA-IMPL-REQ-ARCH-20.7-001（full text retained below）.

---

# ASA-ARCH-20.7 Multi-Event Runtime — Architecture Specification Draft 0.5（Frozen）

---

# 1. Scope

ASA-ARCH-20.7 は、20.6 Runtime Pipeline の上位拡張として、
複数イベントを同時に扱う Runtime のアーキテクチャ契約を定義する。

対象：

* Pre-Pipeline Runtime（Ingress Processing Layer）
* Multi-Event Processing Model
* Event Stream / Event Batch
* Event Aggregation（Coalescing）
* Event Debouncing
* Backpressure / Queue Pressure Control
* Event Prioritization（Priority Metadata）
* Burst Handling（Coordinator Concept）
* Throughput Contracts
* Scheduler / Pipeline の拡張境界（Boundary のみ）

20.7 は既存 Stage の内部契約を変更しない。

---

# 2. Pre-Pipeline Runtime（Ingress Processing Layer）

```text
Orchestrator
    ↓
Pre-Pipeline Runtime（Ingress Processing Layer）
    ↓
Runtime Pipeline（20.6）
```

責務：

* 複数イベントの集約・抑制・優先度付け・負荷制御
* Pipeline Inputs の意味論を変更しない
* Frozen Baseline（20.1〜20.6）の内部契約を変更しない

---

# 3–14. Contracts

Normative contracts BC-20.7-001〜006 / IC-20.7-001〜004 / AS-20.7-001〜004
and sections 3–14 of ASA-IMPL-REQ-ARCH-20.7-001 Draft 0.5 apply in full.

Key fixed names:

* **Priority Metadata**（formal）— Priority Descriptor / Hint are aliases
* **Queue Observation Interface** — read-only; never mutates EventQueue
* **Policy Set** — Aggregation / Debouncing / Backpressure / Priority
* **Burst Handling Coordinator** — not a Stage

---

**End of Baseline（Phase 20.7 Frozen / Accepted）**
