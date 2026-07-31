# ASA-ARCH-20.9.2 — EnginePool & Dispatch Strategy

Status: FROZEN（Freeze Review COMPLETE）  
Version: 1.0  
Draft: 0.4  
Freeze Tag: ASA-ARCH-20.9.2-FREEZE（declared; git tag not issued — excluded by ASA-FREEZE-REQ-ARCH-20.9.2-001）  
Commit: `<not issued — commit excluded by ASA-FREEZE-REQ-ARCH-20.9.2-001>`

---

# 1. Purpose

ASA-ARCH-20.9.2 は、凍結済み 20.8 / 20.9.0 / 20.9.1 契約を変更せずに  
**EnginePool** と **DispatchStrategy** を導入し、ExecutionCoordinator を拡張する。

目的は Orchestrator の性能・並列性・効率を扱う内部拡張である。

---

# 2. Scope

## Included

- EnginePool（runtime instance / availability）
- DispatchStrategy（assignment decisions only）
- ExecutionCoordinator extensions（acquire / dispatch / release / assignment ownership）
- EngineRegistry definition ownership
- ResultCollector / ErrorPolicy boundary clarification
- Architecture tests and verification documents

## Excluded

- Scheduler / Workflow / Pipeline / Observability
- Runtime Execution Layer changes
- Implementation-specific optimizations
- Git commit / tag（本 Freeze Review 依頼により除外）

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | PRESERVED |
| ASA-ARCH-20.9.0 Orchestration Core | Parent | 公開契約不変 |
| ASA-ARCH-20.9.1 Orchestrator Internal Responsibilities | FROZEN | 内部責務契約を侵さない |

依存方向（acyclic）:

```text
Dispatcher → DispatchStrategy → ExecutionCoordinator
                                      ├→ EnginePool → EngineRegistry
                                      └→ ResultCollector → ErrorPolicy → LifecycleController
```

---

# 4. Frozen Components

| Component | Role |
|---|---|
| EnginePool | Runtime instance lifecycle / availability |
| DispatchStrategy | Deterministic assignment decisions |
| ExecutionCoordinator | Acquire / dispatch / release; owns assignment state |
| EngineRegistry | Definitions / metadata only |
| ResultCollector | Outcomes → Context; forward to ErrorPolicy |
| ErrorPolicy | Continuation / termination; notifies LifecycleController |
| LifecycleController | Sole owner of orchestration state transitions |

---

# 5. Verification Summary（Freeze Review）

| Check | Result |
|---|---|
| Scope Verification | PASS |
| Runtime Compatibility | PASS（`src/runtime_execution` unchanged） |
| Frozen Contract Preservation | PRESERVED |
| Architecture Verification | PASS |
| Dispatch Architecture | PASS |
| Typecheck / Jest / Architecture Tests / Regression | PASS（41 suites / 81 tests） |
| Documentation | PASS |
| Blocking Issues | NONE |

---

# 6. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.2.md` |
| Specification | `docs/specs/asa_arch_20_9_2_engine_pool_dispatch_strategy.md` |
| Verification Plan | `docs/specs/asa_arch_20_9_2_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_20_9_2_verification_mapping.md` |
| Checksum Report | `docs/reports/asa_arch_20_9_2_checksum_verification.md` |
| Acceptance | `docs/reports/ASA-VERIFY-ARCH-20.9.2-ACCEPTANCE-001.md` |
| Freeze Verification | `docs/reports/ASA-ARCH-20.9.2-FREEZE-VERIFICATION.md` |

---

# 7. Status

```text
Freeze Review           : COMPLETE
Architecture State      : FROZEN（review accepted）
Git Commit / Tag        : NOT ISSUED（excluded by freeze request）
Blocking Issues         : NONE
```
