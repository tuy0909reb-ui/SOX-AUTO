# ASA-ARCH-21.0 — Workflow Core

**Architecture ID:** ASA-ARCH-21.0  
**Title:** Workflow Core  
**Version:** 1.0  
**Status:** DRAFT（Implementation Target）  
**Parents:** ASA-ARCH-20.8〜20.9.3（Frozen）

本フェーズは **Workflow 定義モデルのみ** を導入する。  
Runtime behavior は既存 20.9.x Orchestrator が所有する。

---

# 1. Scope

## Included

- Workflow definition model
- WorkflowMetadata / inputs / outputs / variables / pipeline
- ExecutionPolicy（宣言専用）
- WorkflowBuilder（definition builder）
- GraphBuilder による Workflow → ExecutionGraph 変換契約
- Workflow lifecycle（Created → Ready）

## Excluded

- Runtime execution control
- Scheduling / Dispatch / Engine assignment
- Retry / Timeout / Compensation（将来 21.5）
- Workflow / Pipeline runtime engine
- Changes to `src/orchestration/**` or `src/runtime_execution/**`

---

# 2. Core Model

```text
Workflow
 ├─ workflow_id
 ├─ workflow_name
 ├─ workflow_version
 ├─ metadata
 ├─ inputs
 ├─ outputs
 ├─ variables
 ├─ pipeline
 ├─ execution_policy
 └─ workflow_state
```

### Identification

> `workflow_id` SHALL uniquely identify one Workflow definition.  
> `workflow_version` SHALL identify the immutable revision of the Workflow.

---

# 3. Workflow Contracts

Workflow SHALL:

- define what to execute
- remain immutable after successful validation
- contain no runtime execution logic
- contain no scheduling semantics
- contain no dispatch semantics
- contain no engine assignment semantics
- contain no runtime state
- expose only declarative definitions

Workflow SHALL NOT:

- execute nodes
- determine execution order
- assign engines
- inspect EnginePool
- interact with Scheduler
- interact with DispatchStrategy
- modify ExecutionGraph

---

# 4. Immutability

> **Workflow SHALL be immutable after successful validation.**

```text
Created
    ↓
Validated
    ↓
Immutable
    ↓
GraphBuilt (by GraphBuilder)
    ↓
Ready
```

---

# 5. GraphBuilder Input / Output Contract

```text
Input:
    Workflow

Output:
    ExecutionGraph
```

GraphBuilder SHALL:

- treat Workflow as read-only
- generate an acyclic ExecutionGraph
- fail without producing an ExecutionGraph if construction fails
- never produce a partial ExecutionGraph
- never modify Workflow
- never embed scheduling semantics
- never embed engine assignment semantics
- never embed retry/timeout semantics

### Failure Contract

> GraphBuilder SHALL fail without producing an ExecutionGraph when graph construction fails.  
> GraphBuilder SHALL NOT produce a partial ExecutionGraph upon construction failure.

### Read-only Contract

> GraphBuilder SHALL NOT modify Workflow.  
> GraphBuilder SHALL treat Workflow as read-only.

---

# 6. ExecutionPolicy

> ExecutionPolicy SHALL declare execution behavior only.  
> ExecutionPolicy SHALL NOT perform execution control.

Runtime execution remains outside the scope of this phase.

---

# 7. Workflow Lifecycle Responsibility Boundary

> Workflow responsibility SHALL end at the Ready state.  
> Running / Completed / Failed states SHALL be owned by Orchestrator (20.9.x).

```text
[Workflow responsibility]
    Created
    Validated
    Immutable
    GraphBuilt
    Ready
─────────────── Workflow scope ends here

[Orchestrator responsibility]
    Running
    Completed
    Failed
    Suspended
    Resumed
```

---

# 8. Dependency Direction

```text
workflow
    ↓
GraphBuilder
    ↓
ExecutionGraph
    ↓
Orchestrator (20.9.x)
```

Reverse dependencies are prohibited.

---

# 9. Invariants

- Workflow is declarative definition only
- Workflow immutable after validation
- Workflow responsibility ends at Ready
- GraphBuilder does not modify Workflow
- GraphBuilder does not produce partial ExecutionGraph on failure
- ExecutionPolicy declares behavior only
- No scheduling / dispatch / engine assignment in Workflow
- Runtime Execution Layer and orchestration frozen contracts preserved
