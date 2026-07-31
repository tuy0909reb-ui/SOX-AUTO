# ASA-ARCH-20.9.2 — EnginePool & Dispatch Strategy Extension

### Draft 0.4（修正版）

**Architecture ID:** ASA-ARCH-20.9.2  
**Parent:** ASA-ARCH-20.9.0 / ASA-ARCH-20.9.1  
**Status:** DRAFT（Implementation Target）

本仕様は Draft 0.4 を登録する。凍結済み 20.8 / 20.9.0 / 20.9.1 契約は変更しない。

---

# 1. スコープと位置付け

20.9.2 は、凍結済みの以下の契約を変更せずに拡張する：

- **20.8 Runtime Execution Layer**（不変）
- **20.9.0 Orchestrator 公開契約**（不変）
- **20.9.1 Orchestrator 内部責務**（不変）

目的は Orchestrator の性能・並列性・効率を扱う内部拡張であり、以下を導入する：

- EnginePool（Engineインスタンス管理）
- DispatchStrategy（Engine割り当て戦略）
- ExecutionCoordinator（Pool連携拡張）

非対象：

- Scheduler（20.10）
- Workflow / Pipeline（20.10–20.11）
- Observability（20.12）
- Runtime Execution Layer の変更

---

# 2. 内部コンポーネント構造

```text
Dispatcher
    │
    ▼
DispatchStrategy
    │
    ▼
ExecutionCoordinator
    │
    ├────────► EnginePool
    │
    ├────────► EngineRegistry
    │
    ▼
ResultCollector
    │
    ├────────► ErrorPolicy
    │
    ▼
LifecycleController
```

---

# 3. コンポーネント責務と境界

## 3.1 EnginePool

### 責務
- Engineインスタンスの生成・破棄・再利用
- Engine可用性状態の管理（Available / Busy / Offline / Disposed）
- acquire/release に応じた状態遷移

### 境界
> EnginePool SHALL NOT participate in orchestration flow control.  
> EnginePool SHALL NOT modify ExecutionGraph.  
> EnginePool SHALL NOT own engine definitions or metadata.  
> EnginePool SHALL own runtime engine instances and their availability only.  
> EnginePool MAY consult EngineRegistry when creating Engine instances, but SHALL NOT own engine definitions.

### 同時実行契約
> EnginePool SHALL NOT allocate the same Engine instance to multiple active executions simultaneously.  
> Concurrent acquire requests for the same Engine instance SHALL result in at most one successful acquisition.

---

## 3.2 DispatchStrategy

### 責務
- ExecutableNodeSet と EnginePool状態を入力とし、Engine割り当てを決定する
- 優先度・負荷分散・並列度などの論理ポリシーを適用

### 境界
> DispatchStrategy SHALL operate only on ExecutableNodeSet and EnginePool state.  
> DispatchStrategy SHALL NOT modify ExecutionGraph.  
> DispatchStrategy SHALL NOT modify node priority.  
> DispatchStrategy SHALL produce assignment decisions only and SHALL NOT retain assignment state after dispatch planning.

---

## 3.3 ExecutionCoordinator（拡張）

### 責務
- DispatchStrategy の決定に従い EnginePool から Engine を acquire
- Node と Engine の組を dispatch
- 実行完了後に Engine を release
- **Assignment 状態の所有者**

> ExecutionCoordinator SHALL own the assignment state between nodes and engines for the duration of dispatch and execution.

### 境界
> ExecutionCoordinator SHALL NOT create Engine instances.  
> ExecutionCoordinator SHALL acquire and release engines via EnginePool.  
> ExecutionCoordinator SHALL own the logical execution queue for node dispatch.

---

## 3.4 EngineRegistry

### 責務
- Engine定義・メタデータの解決（NodeID → Engine定義）

### 境界
> EngineRegistry SHALL own engine definitions and metadata only.  
> EngineRegistry SHALL NOT own runtime engine instances.  
> EngineRegistry MAY be consulted by EnginePool during instance creation.

---

## 3.5 ResultCollector

### 責務
- Engine完了結果（Success / Failure / Event）を集約
- OrchestrationContext へ結果・エラー・イベントを反映
- ErrorPolicy へ評価対象として結果を提供

### 境界
> ResultCollector SHALL update OrchestrationContext with recorded outcomes and events.  
> ResultCollector SHALL provide execution outcomes (success and failure) to ErrorPolicy for evaluation.  
> ResultCollector SHALL NOT dispatch Engine.  
> ResultCollector SHALL NOT modify ExecutionGraph.  
> ResultCollector SHALL NOT initiate orchestration state transitions.

---

## 3.6 ErrorPolicy

### 責務
- ResultCollectorから提供された結果を評価し、継続／停止を判断

### 境界
> ErrorPolicy SHALL NOT directly manipulate EnginePool state.  
> ErrorPolicy SHALL decide continuation/termination and notify LifecycleController.

---

## 3.7 LifecycleController

### 責務
- Orchestrator状態遷移の唯一の窓口

### 境界
> LifecycleController SHALL remain the sole owner of orchestration state transitions.

---

# 4. EnginePool 状態モデルと遷移契約

```text
Available
Busy
Offline
Disposed (terminal)
```

### 状態遷移

- **Available → Busy** — Owner: Coordinator — 条件: acquire 成功
- **Busy → Available** — Owner: Coordinator — 条件: release 正常終了
- **Busy → Offline** — Owner: EnginePool — 条件: 実行中エラー／ヘルスチェック失敗
- **Offline → Available** — Owner: EnginePool — 条件: 回復判定
- **Any → Disposed** — Owner: EnginePool — 条件: 明示的破棄ポリシー — Disposed は終端状態

---

# 5. Acquire / Dispatch / Release 契約

## Acquire

```text
acquire(node, pool) -> Engine | AcquireFailure
```

- No engine available → ノードは未割り当てとして次ループへ
- AcquireFailure → ResultCollector 経由で ErrorPolicy に通知

## Dispatch

```text
dispatch(node, engine) -> void
```

Runtime Execution Layer（20.8）が実行セマンティクスを所有。

## Release

```text
release(engine, pool) -> ReleaseResult
```

- 正常終了 → Busy → Available  
- Release failure → EnginePool が Offline または Disposed へ遷移

---

# 6. DispatchStrategy と DET-001

> For a given ExecutableNodeSet, EnginePool state, and DispatchStrategy configuration, engine assignment SHALL be deterministic.

- Priority conflict resolution  
- Tie-breaking（NodeID昇順など）  
- Load-balancing precedence  
- Concurrency policy ordering  

> Any non-deterministic dispatch behavior MUST be explicitly configured and SHALL NOT violate DET-001 at orchestration semantics level.

---

# 7. ErrorPolicy と EnginePool の境界（STOP_ON_ERROR）

- STOP_ON_ERROR 時:
  - Coordinator は新規 acquire を停止  
  - Busy Engine の扱いは EnginePool + Runtime Execution Layer の責務  
  - ErrorPolicy は停止要求を LifecycleController に通知するのみ

---

# 8. ExecutionCoordinator とキュー

> ExecutionCoordinator SHALL own the logical execution queue for node dispatch.

物理キューは実装側に委ねる。  
Scheduler 導入時は Coordinator が Scheduler の順序に従う。

---

# 9. Dispatch Loop（20.9.2版）

```text
Ready
  ↓
Select executable nodes (Dispatcher)
  ↓
Determine engine assignment (DispatchStrategy)
  ↓
Acquire engines (Coordinator → Pool)
  ↓
Dispatch engines (Coordinator → Runtime)
  ↓
Wait for completion
  ↓
Collect results (ResultCollector)
  ↓
Update OrchestrationContext
  ↓
Evaluate ErrorPolicy
  ↓
Lifecycle Transition
  ↓
If executable nodes remain
      Repeat
Else
      Termination
```

---

# 10. Non-Functional Constraints

- Maximum concurrency  
- Engine acquisition timeout  
- Pool exhaustion behavior  
- Resource exhaustion policy  
- Scheduler互換性（20.10）

---

# 11. Invariants（統合）

- Coordinator SHALL NOT create Engine instances.  
- Each executable node SHALL be dispatched at most once.  
- EnginePool SHALL NOT participate in orchestration flow control.  
- EnginePool SHALL NOT modify ExecutionGraph.  
- EnginePool SHALL NOT allocate the same Engine instance to multiple active executions simultaneously.  
- DispatchStrategy SHALL NOT modify ExecutionGraph.  
- DispatchStrategy SHALL NOT modify node priority.  
- DispatchStrategy SHALL NOT retain assignment state.  
- ResultCollector SHALL NOT dispatch Engine.  
- ResultCollector SHALL NOT modify ExecutionGraph.  
- LifecycleController SHALL remain the sole owner of orchestration state transitions.  
- EngineRegistry SHALL NOT own runtime engine instances.  
- EnginePool SHALL NOT own engine definitions or metadata.  
- EnginePool SHALL NOT create observable Runtime semantics.  
- Runtime semantics remain owned by Runtime Execution Layer (20.8).
