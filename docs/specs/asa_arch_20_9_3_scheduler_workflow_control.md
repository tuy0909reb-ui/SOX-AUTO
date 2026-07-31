# ASA-ARCH-20.9.3 — Scheduler / Workflow Control

### Draft 0.4（最終研磨反映済み・完全版）

**Architecture ID:** ASA-ARCH-20.9.3  
**Parent:** ASA-ARCH-20.9.2 EnginePool & Dispatch Strategy  
**Status:** DRAFT（Implementation Target）

本仕様は Draft 0.4 を登録する。凍結済み 20.8 / 20.9.0 / 20.9.1 / 20.9.2 契約は変更しない。

---

## 1. スコープ

20.9.3 は Orchestrator に **実行順序（Scheduling）** を導入するレイヤであり、  
20.9.2 の Dispatch 基盤の上位に位置する。

扱う内容：

- 実行可能ノード集合の取得（Dispatcher）
- 依存関係の検証（DependencyResolver）
- 優先度の適用（SchedulingPolicy / PriorityResolver）
- 並列度の制御（ConcurrencyPolicy）
- 実行順序の決定（Scheduler）
- 実行キューの生成（ScheduledNodeQueue）

20.10 Workflow / Pipeline の前提となる基盤。

---

## 2. コンポーネント構造

```text
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
```

---

## 3. コンポーネント責務

### 3.1 Dispatcher

**責務:**

> Dispatcher SHALL retrieve the ExecutableNodeSet from OrchestrationContext.

**境界:**

> Dispatcher SHALL NOT perform dependency resolution.  
> Dispatcher SHALL NOT determine execution order.

---

### 3.2 Scheduler

**責務:**

- ExecutableNodeSet を入力として受け取る  
- DependencyResolver / SchedulingPolicy / ConcurrencyPolicy を統合し順序を決定  
- ScheduledNodeQueue を生成する  

**境界:**

> Scheduler SHALL NOT assign engines.  
> Scheduler SHALL NOT modify ExecutionGraph.  
> Scheduler SHALL NOT modify OrchestrationContext.  
> Scheduler SHALL NOT retain execution results.  
> Scheduler SHALL produce deterministic ordering.  
> Scheduler SHALL terminate for every valid acyclic ExecutionGraph.  
> Scheduler SHALL evaluate an immutable view of CompletedNodeSet during one scheduling cycle.

**失敗契約:**

> Scheduler SHALL fail without producing a ScheduledNodeQueue if dependency validation fails.  
> Scheduler SHALL NOT produce a partial ScheduledNodeQueue upon scheduling failure.  
> Scheduling failure SHALL be reported to ErrorPolicy, which SHALL notify LifecycleController according to its configured policy.

---

### 3.3 DependencyResolver

**責務:**

> DependencyResolver SHALL validate dependency constraints within ExecutableNodeSet and assist Scheduler in ordering.

**境界:**

> DependencyResolver SHALL NOT generate ExecutableNodeSet.  
> DependencyResolver SHALL NOT modify ExecutionGraph.

---

### 3.4 SchedulingPolicy

**責務:**

> SchedulingPolicy SHALL define the ordering rules applied by Scheduler.

**境界:**

> SchedulingPolicy SHALL NOT modify node priority values.  
> SchedulingPolicy SHALL NOT inspect EnginePool state.  
> SchedulingPolicy SHALL apply ordering rules deterministically.  
> When multiple nodes are equivalent under the selected SchedulingPolicy, the tie-breaking rule SHALL be deterministic.

---

### 3.5 PriorityResolver

**責務:**

> PriorityResolver SHALL apply stable priority ordering.

**境界:**

> PriorityResolver SHALL NOT modify priority values.  
> PriorityResolver SHALL preserve topological order for nodes with equal priority.

---

### 3.6 ConcurrencyPolicy

**責務:**

> ConcurrencyPolicy SHALL limit simultaneous execution according to ConcurrencyLimit.

**境界:**

> ConcurrencyPolicy SHALL NOT reorder nodes.  
> ConcurrencyPolicy SHALL only limit simultaneous execution.  
> ConcurrencyPolicy SHALL NOT modify EnginePool state.

**入力契約:**

```text
Input:
    ScheduledNodeQueue
    ConcurrencyLimit
```

---

## 4. Scheduler 入出力契約

```text
Input:
    ExecutableNodeSet
    SchedulingPolicy
    ConcurrencyPolicy

Output:
    ScheduledNodeQueue
```

---

## 5. ScheduledNodeQueue 契約

> ScheduledNodeQueue SHALL be immutable after construction.  
> ScheduledNodeQueue SHALL be ordered.  
> ScheduledNodeQueue SHALL be read-only.  
> ScheduledNodeQueue SHALL be deterministic.  
> Each NodeID SHALL appear at most once within a ScheduledNodeQueue.

DispatchStrategy との境界:

> DispatchStrategy SHALL consume ScheduledNodeQueue without modifying it.

---

## 6. Dispatch Loop（20.9.3 最終版）

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

> A “Scheduling Cycle” SHALL comprise the sequence from Dispatcher through LifecycleController for one evaluation of ExecutableNodeSet.

---

## 7. Invariants

- Dispatcher SHALL NOT perform dependency resolution.  
- Scheduler SHALL NOT modify ExecutionGraph.  
- Scheduler SHALL NOT assign engines.  
- Scheduler SHALL NOT retain execution results.  
- Scheduler SHALL produce deterministic ordering.  
- Scheduler SHALL terminate for every valid acyclic ExecutionGraph.  
- Scheduler SHALL evaluate an immutable view of CompletedNodeSet during one scheduling cycle.  
- Scheduler SHALL fail without producing a ScheduledNodeQueue if dependency validation fails.  
- Scheduler SHALL NOT produce a partial ScheduledNodeQueue upon scheduling failure.  
- DependencyResolver SHALL NOT generate ExecutableNodeSet.  
- SchedulingPolicy SHALL NOT modify priority values.  
- SchedulingPolicy SHALL NOT inspect EnginePool state.  
- When multiple nodes are equivalent under the selected SchedulingPolicy, tie-breaking SHALL be deterministic.  
- PriorityResolver SHALL preserve topological order for equal priority.  
- ConcurrencyPolicy SHALL NOT reorder nodes.  
- ConcurrencyPolicy SHALL only limit simultaneous execution.  
- ScheduledNodeQueue SHALL be immutable, ordered, deterministic, and contain each NodeID at most once.  
- DispatchStrategy SHALL consume ScheduledNodeQueue without modifying it.  
- Scheduling failure SHALL be propagated to ErrorPolicy, which SHALL notify LifecycleController.
