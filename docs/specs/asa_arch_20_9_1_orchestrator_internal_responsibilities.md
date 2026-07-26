# ASA-ARCH-20.9.1 — Orchestrator Internal Responsibilities

### Draft 1.2（Freeze Review Candidate / Final Polishing Applied）

**Architecture ID:** ASA-ARCH-20.9.1  
**Parent:** ASA-ARCH-20.9.0 Orchestration Core Specification  
**Status:** REGISTERED（Implementation Target）

---

# 1. スコープと位置付け

- **20.9.0**：公開契約（API・状態・境界・Graph/Context契約）
- **20.9.1**：20.9.0 の契約を満たすための **Orchestrator内部責務・制御フロー** の定義  
- 実装技術（Thread / Promise / Queue 等）には依存しない論理仕様

---

# 2. 内部コンポーネント構造

```text
Orchestrator
 ├── LifecycleController
 ├── EngineRegistry
 ├── Dispatcher
 ├── ExecutionCoordinator
 └── ResultCollector
```

---

# 3. 内部依存方向（完全統一版）

依存方向を **一方向の流れ** に統一する。

```text
Dispatcher
      │
      ▼
ExecutionCoordinator
      │
      ▼
EngineRegistry

ExecutionCoordinator
      │
      ▼
ResultCollector
      │
      ▼
LifecycleController
```

### 契約

> Dependencies between Orchestrator internal components SHALL form an acyclic dependency graph.

---

# 4. 各コンポーネントの責務（最終版）

## 4.1 LifecycleController

- Orchestrator状態遷移の唯一の窓口  
- `initialize()` / `execute()` / `shutdown()` の呼び出し条件を管理

> A failure within one internal component SHALL NOT bypass LifecycleController when affecting the Orchestrator state.

---

## 4.2 EngineRegistry

- `NodeID → ExecutionEngine` の対応関係を解決するサービス

### Freeze前補強

> **EngineRegistry is a lookup service and SHALL NOT participate in orchestration flow control.**

### 契約

> EngineRegistry SHALL only resolve NodeID to ExecutionEngine.  
> NodeID SHALL uniquely identify one ExecutionEngine.

---

## 4.3 Dispatcher

- `ExecutionGraph` と `CompletedNodeSet` を入力とし、実行可能ノード集合を返す

```text
ExecutionGraph + CompletedNodeSet
      ↓
ExecutableNodeSet
```

> Dispatcher SHALL NOT modify ExecutionGraph.

---

## 4.4 ExecutionCoordinator

- Dispatcherが返したノード集合を実行し、完了を監視し、ResultCollectorへ通知する

```text
ExecutableNodeSet
      ↓
Resolve Engines (EngineRegistry)
      ↓
Start Engines
      ↓
Monitor Completion
      ↓
Notify ResultCollector
```

> Each executable node SHALL be dispatched at most once.

---

## 4.5 ResultCollector

- Engineの完了イベント（Result / Error / Event）を集約し、Context更新とPolicy評価を行う

### Freeze前補強

> **ResultCollector SHALL provide execution outcomes to ErrorPolicy for evaluation.**

---

# 5. Dispatch Loop（最終版）

```text
Ready
  ↓
Select executable nodes (Dispatcher)
  ↓
Dispatch engines (ExecutionCoordinator)
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
      ↓
      Repeat
  else
      ↓
Termination (Completed or Failed)
```

### 補強理由

- ErrorPolicyが停止を決定した場合でも、判断の根拠となる結果が必ずContextに記録される  
- 監査性・診断性・Replayの一貫性が向上する

---

# 6. 終了条件（契約）

Dispatch Loop SHALL terminate when:

1. **All executable nodes have been completed**, or  
2. **ErrorPolicy requests termination**（例: STOP_ON_ERROR）

---

# 7. ExecutionGraphの扱い（共通契約）

> All internal components SHALL treat ExecutionGraph as read-only.

---

# 8. Failure Boundary（契約）

- 内部コンポーネントの失敗は必ず LifecycleController を経由して Orchestrator状態へ反映される
- Graph Validation Failure → `initialize()` Failure → `Failed`
- Engine生成失敗 → `initialize()` Failure → `Failed`
- 実行中の致命的失敗 → `Running → Failed → Shutdown`

---

# 9. 実装非依存方針

- Thread / Promise / Queue / Lock などの技術には依存しない
- すべて論理的責務・制御フローとして記述

---

# 10. 論理API一覧（参考）

- Dispatcher  
  `selectExecutableNodes(completedNodeSet, graph) -> ExecutableNodeSet`

- ExecutionCoordinator  
  `dispatch(nodes, registry) -> void`

- ResultCollector  
  `collect(engineResult) -> void`

- EngineRegistry  
  `resolveEngine(nodeId) -> ExecutionEngine`

- LifecycleController  
  `transition(event) -> OrchestratorState`

---

# Freeze Review 判定（Draft 1.2）

| 項目 | 判定 |
|------|------|
| 20.9.0整合性 | PASS |
| Runtime Execution Layer互換性 | PASS |
| Frozen Contract Preservation | PASS |
| Internal Architecture Consistency | PASS |
| Responsibility Separation | PASS |
| Implementation Independence | PASS |
| Extensibility | PASS |
| Blocking Issues | NONE |
