# ASA-ARCH-21.1 — Workflow Builder

### Draft 0.2（Full Specification / All Contracts Integrated）

**Architecture ID:** ASA-ARCH-21.1  
**Parent:** ASA-ARCH-21.0 Workflow Core  
**Status:** DRAFT（Freeze Candidate / Implementation Target）

---

## 1. スコープ

Workflow → ExecutionGraph の純粋変換レイヤ。  
Workflow は定義オブジェクト、ExecutionGraph は 20.9.x Orchestrator が扱う実行 DAG。

---

## 2. WorkflowBuilder の責務

> WorkflowBuilder SHALL convert Workflow into a valid ExecutionGraph.

具体的には：

- PipelineDefinition を解析し Node DAG を生成  
- StepDefinition を Node に変換  
- Edges を Pipeline semantics のみから生成  
- NodeID を ExecutionGraph 内で一意に生成  
- ExecutionGraph の acyclic / deterministic / complete を保証  
- Workflow / PipelineDefinition を read-only として扱う  

---

## 3. WorkflowBuilder の境界

> WorkflowBuilder SHALL NOT execute nodes.  
> WorkflowBuilder SHALL NOT determine runtime scheduling.  
> WorkflowBuilder SHALL NOT assign engines.  
> WorkflowBuilder SHALL NOT modify Workflow.  
> WorkflowBuilder SHALL treat Workflow as read-only.  
> WorkflowBuilder SHALL treat PipelineDefinition as read-only.  
> WorkflowBuilder SHALL NOT embed retry/timeout semantics.  
> WorkflowBuilder SHALL NOT embed execution semantics.  
> WorkflowBuilder SHALL NOT embed scheduling semantics.  
> WorkflowBuilder SHALL NOT produce a cyclic ExecutionGraph.

---

## 4. Input / Output 契約

### Input

```
Workflow
```

### Output

```
ExecutionGraph
```

### Failure Contract

> WorkflowBuilder SHALL fail without producing an ExecutionGraph when graph construction fails.  
> WorkflowBuilder SHALL NOT produce a partial ExecutionGraph upon failure.  
> WorkflowBuilder SHALL fail if any StepDefinition is invalid.  
> Workflow SHALL remain unchanged when WorkflowBuilder fails.

---

## 5. PipelineDefinition → Node DAG 変換

### Sequence  
A → B → C  
Edges: A→B, B→C

### Parallel  
A, B, C  
Edges: none

### Branch  
Cond → A  
Cond → B

### 契約

> WorkflowBuilder SHALL generate edges solely from PipelineDefinition semantics.

---

## 6. StepDefinition → Node 変換

> StepDefinition SHALL be converted into exactly one Node.  
> Every StepDefinition SHALL be represented exactly once within the generated ExecutionGraph.  
> Node SHALL preserve StepDefinition identity.  
> Node SHALL NOT embed execution semantics.

---

## 7. ExecutionGraph 契約（20.9.x と完全整合）

ExecutionGraph SHALL be:

- Acyclic  
- Deterministic  
- Immutable  
- Read-only  
- Complete（欠落なし）  
- Unique（NodeID 重複なし）  
- Compatible with 20.9.3 Scheduler  
- Compatible with 20.9.2 DispatchStrategy  
- Compatible with 20.9.1 Internal Responsibilities  
- Compatible with 20.9.0 Public Contract  

---

## 8. Lifecycle Integration

```
Created
Validated
Immutable
GraphBuilt (21.1)
Ready
──────── Workflow責務終了

Running
Completed
Failed
──────── Orchestrator責務
```

---

## 9. Invariants（Draft 0.2）

- WorkflowBuilder SHALL NOT modify Workflow.  
- WorkflowBuilder SHALL treat Workflow as read-only.  
- WorkflowBuilder SHALL treat PipelineDefinition as read-only.  
- WorkflowBuilder SHALL generate globally unique NodeIDs within one ExecutionGraph.  
- WorkflowBuilder SHALL generate edges solely from PipelineDefinition semantics.  
- WorkflowBuilder SHALL generate a valid acyclic ExecutionGraph.  
- WorkflowBuilder SHALL NOT embed execution semantics.  
- WorkflowBuilder SHALL NOT embed scheduling semantics.  
- WorkflowBuilder SHALL NOT embed engine assignment semantics.  
- WorkflowBuilder SHALL NOT produce partial graphs.  
- WorkflowBuilder SHALL fail if any StepDefinition is invalid.  
- Workflow SHALL remain unchanged when WorkflowBuilder fails.  
- PipelineDefinition SHALL be expanded deterministically.  
- StepDefinition SHALL be converted deterministically.  
- WorkflowBuilder SHALL produce identical ExecutionGraphs for identical Workflow definitions.  
- ExecutionGraph SHALL be immutable and deterministic.  
- Every StepDefinition SHALL be represented exactly once.
