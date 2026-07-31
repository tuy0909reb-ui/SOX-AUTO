# ASA-ARCH-20.9.3 — Scheduler / Workflow Control

Status: FROZEN（Freeze Review COMPLETE）  
Version: 1.0  
Draft: 0.4  
Freeze Tag: ASA-ARCH-20.9.3-FREEZE（declared; git tag not issued — excluded by Freeze Review request）  
Commit: `<not issued — commit excluded by Freeze Review request>`

---

# 1. Scope

ASA-ARCH-20.9.3 は Orchestrator に **実行順序（Scheduling）** を導入するレイヤであり、  
20.9.2 Dispatch 基盤の上位に位置する。

## Included

- Dispatcher（ExecutableNodeSet 取得）
- Scheduler
- DependencyResolver
- SchedulingPolicy（FIFO / Priority）
- PriorityResolver
- ConcurrencyPolicy
- ScheduledNodeQueue
- Dispatch Loop / Scheduling Cycle 統合
- Architecture tests and verification documents

## Excluded

- Workflow / Pipeline 詳細（20.10）
- Observability
- Runtime Execution Layer changes
- Git commit / tag（本 Freeze Review 依頼により除外）

---

# 2. Objectives

- 実行可能ノード集合に対する決定的スケジューリングを導入する
- 20.9.2 EnginePool / DispatchStrategy との責務分離を維持する
- Immutable ScheduledNodeQueue により Dispatch 入力を固定する
- 20.10 Workflow / Pipeline の前提基盤を確立する
- 凍結済み 20.8〜20.9.2 契約を侵さない

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | PRESERVED |
| ASA-ARCH-20.9.0 Orchestration Core | Parent | 公開契約不変 |
| ASA-ARCH-20.9.1 Internal Responsibilities | FROZEN | 内部責務契約を侵さない |
| ASA-ARCH-20.9.2 EnginePool & Dispatch Strategy | Parent | Dispatch 基盤を侵さない |

依存方向:

```text
20.9.3 → 20.9.2 → 20.9.1 → 20.9.0 → 20.8
```

---

# 4. Components

| Component | Role |
|---|---|
| Dispatcher | ExecutableNodeSet 取得（順序決定・依存解決なし） |
| Scheduler | Resolver / Policy / Concurrency 統合 → Queue 生成 |
| DependencyResolver | ExecutableNodeSet 内依存検証・順序補助 |
| SchedulingPolicy | FIFO / Priority 順序規則 |
| PriorityResolver | 安定優先度順序（同順位は topo 維持） |
| ConcurrencyPolicy | ConcurrencyLimit のみ適用（順序変更なし） |
| ScheduledNodeQueue | Immutable / Ordered / Deterministic Queue |
| DispatchStrategy | Queue を変更せず消費し assignment 決定 |
| ExecutionCoordinator | Acquire / Dispatch / Release；Assignment 所有 |

---

# 5. Responsibility Boundaries

| Component | Must Not |
|---|---|
| Scheduler | assign engines / modify Graph / modify Context / retain results / partial queue on failure |
| DependencyResolver | generate ExecutableNodeSet / modify Graph |
| SchedulingPolicy | modify priorities / inspect EnginePool |
| ConcurrencyPolicy | reorder nodes / modify EnginePool |
| DispatchStrategy | retain AssignmentState / modify Queue |
| EnginePool | retain Assignment |
| ExecutionCoordinator | create Engine instances（Pool 経由のみ） |
| LifecycleController | （sole owner of orchestration state transitions） |

---

# 6. Dispatch Loop

```text
Scheduling Cycle:
    Dispatcher
        ↓
    ExecutableNodeSet
        ↓
    Scheduler
        ├─ DependencyResolver
        ├─ SchedulingPolicy
        │     └─ PriorityResolver
        └─ ConcurrencyPolicy
        ↓
    ScheduledNodeQueue
        ↓
    DispatchStrategy (20.9.2)
        ↓
    ExecutionCoordinator
        ↓
    EnginePool
        ↓
    ResultCollector
        ↓
    OrchestrationContext
        ↓
    ErrorPolicy
        ↓
    LifecycleController
        ↓
    Next Scheduling Cycle or Termination
```

A Scheduling Cycle comprises Dispatcher through LifecycleController for one ExecutableNodeSet evaluation.

---

# 7. Scheduler Contracts

- Deterministic ordering
- Immutable CompletedNodeSet view per cycle
- Fail without producing Queue if dependency validation fails
- No partial Queue on failure
- Scheduling failure → ErrorPolicy → LifecycleController
- Terminates for every valid acyclic ExecutionGraph
- ScheduledNodeQueue: immutable, ordered, read-only, deterministic, unique NodeIDs

---

# 8. Future Extensions

- Workflow / Pipeline（20.10〜）
- Advanced scheduling policies
- Observability（別フェーズ）

拡張は本 Core / Scheduler 契約および 20.8〜20.9.2 Frozen Contracts を侵してはならない。

---

# 9. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.3.md` |
| Specification | `docs/specs/asa_arch_20_9_3_scheduler_workflow_control.md` |
| Verification Plan | `docs/specs/asa_arch_20_9_3_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_20_9_3_verification_mapping.md` |
| Checksum Report | `docs/reports/asa_arch_20_9_3_checksum_verification.md` |
| Acceptance | `docs/reports/ASA-VERIFY-ARCH-20.9.3-ACCEPTANCE-001.md` |
| Freeze Verification | `docs/reports/ASA-ARCH-20.9.3-FREEZE-VERIFICATION.md` |

---

# 10. Status

```text
Freeze Review           : COMPLETE
Architecture State      : FROZEN（review accepted）
Git Commit / Tag        : NOT ISSUED（excluded by freeze request）
Blocking Issues         : NONE
```
