# ASA-ARCH-21.1 — Workflow Builder

Status: FROZEN（Freeze Review COMPLETE）  
Version: Draft 0.2 / Freeze Candidate accepted  
Freeze Tag: ASA-ARCH-21.1-FREEZE（declared; git tag not issued — excluded by Freeze Review request）  
Commit: `<not issued — commit excluded by Freeze Review request>`

---

# 1. Scope

ASA-ARCH-21.1 は **Workflow → ExecutionGraph の純粋変換レイヤ** を正式化する。  
Workflow / PipelineDefinition は read-only。生成される ExecutionGraph は 20.9.x 凍結契約に準拠する。

## Included

- WorkflowBuilder（definition builder + Workflow → ExecutionGraph conversion）
- PipelineDefinition / StepDefinition
- NodeFactory / EdgeFactory
- WorkflowBuildError / InvalidStepDefinitionError
- Sequence / Parallel / Branch → Node DAG edge semantics（実行意味は含まない）
- Failure Contract（invalid Step / no partial graph / Workflow unchanged）

## Excluded

- Node execution
- Runtime scheduling
- Engine assignment
- Retry / Timeout / Compensation runtime semantics
- Changes to `src/orchestration/**` / `src/runtime_execution/**`
- Git commit / tag（本 Freeze Review 依頼により除外）

---

# 2. Objectives

- WorkflowBuilder を Workflow → ExecutionGraph 変換の公開契約所有者とする
- PipelineDefinition semantics のみから edges を生成する
- Globally unique NodeIDs / deterministic / acyclic / complete graphs を保証する
- 20.8〜21.0 Frozen Contracts を侵さない

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | PRESERVED |
| ASA-ARCH-20.9.0〜20.9.3 Orchestration | FROZEN | 変更禁止 |
| ExecutionGraph / GraphValidator（orchestration） | FROZEN | read-only 利用のみ |
| ASA-ARCH-21.0 Workflow Core | FROZEN | 上位定義モデル（互換維持） |

依存方向:

```text
Workflow / PipelineDefinition (read-only)
    ↓
WorkflowBuilder (21.1)
    ↓  NodeFactory / EdgeFactory
ExecutionGraph (20.9.x)
    ↓
Orchestrator (20.9.x)
```

逆依存（orchestration / runtime → workflow）は禁止。

---

# 4. Components

| Component | Role |
|---|---|
| WorkflowBuilder | Workflow → ExecutionGraph pure conversion（+ 21.0 fluent definition API） |
| PipelineDefinition | Read-only pipeline structure; Sequence / Parallel / Branch / dependency_graph |
| StepDefinition | Validated immutable step; exactly one Node |
| NodeFactory | StepDefinition → ExecutionGraphNode（identity preserved） |
| EdgeFactory | Edges solely from PipelineDefinition semantics |
| WorkflowBuildError | Failure Contract errors |

---

# 5. Responsibility Boundaries

| Layer | Owns | Must Not |
|---|---|---|
| WorkflowBuilder | Graph construction | Execute / schedule / assign engines / modify Workflow or PipelineDefinition / partial graphs |
| PipelineDefinition | Declarative structure + semantic edges | Runtime scheduling / engine assignment |
| StepDefinition | Step identity + declarative input | Execution semantics |
| Orchestrator（20.9.x） | Running / Completed / Failed / scheduling / dispatch | Be owned by WorkflowBuilder |

---

# 6. Conversion Rules

```text
Sequence A→B→C     → edges A→B, B→C
Parallel A,B,C     → no dependency edges
Branch Cond→A,B    → edges Cond→A, Cond→B
```

Branch の実行意味は実装しない（DAG 変換のみ）。

---

# 7. Failure Contract

- invalid StepDefinition → fail
- graph construction failure → fail without ExecutionGraph
- no partial ExecutionGraph
- Workflow remains unchanged on failure

---

# 8. ExecutionGraph Contract

Generated graph SHALL be:

- Immutable / Read-only
- Deterministic
- Acyclic
- Complete（every Step exactly once）
- Unique NodeIDs within one graph
- Compatible with 20.9.0〜20.9.3

---

# 9. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-21.1.md` |
| Specification | `docs/specs/asa_arch_21_1_workflow_builder.md` |
| Verification Plan | `docs/specs/asa_arch_21_1_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_21_1_verification_mapping.md` |
| Checksum | `docs/reports/asa_arch_21_1_checksum_verification.md` |
| Acceptance | `docs/reports/ASA-VERIFY-ARCH-21.1-ACCEPTANCE-001.md` |
| Freeze Verification | `docs/reports/ASA-ARCH-21.1-FREEZE-VERIFICATION.md` |

---

# 10. Status

```text
Freeze Review           : COMPLETE
Architecture State      : FROZEN（review accepted）
Git Commit / Tag        : NOT ISSUED（excluded by freeze request）
Blocking Issues         : NONE
```
