# ASA-ARCH-21.0 — Workflow Core

Status: FROZEN（Freeze Review COMPLETE）  
Version: 1.0  
Freeze Tag: ASA-ARCH-21.0-FREEZE（declared; git tag not issued — excluded by Freeze Review request）  
Commit: `<not issued — commit excluded by Freeze Review request>`

---

# 1. Scope

ASA-ARCH-21.0 は **Workflow 定義モデルのみ** を導入する。  
Runtime behavior は既存 20.9.x Orchestrator が所有する。

## Included

- Workflow / WorkflowDefinition / WorkflowMetadata / WorkflowState
- ExecutionPolicy（宣言専用）
- WorkflowBuilder（definition builder）
- GraphBuilder による Workflow → ExecutionGraph 変換契約
- Workflow lifecycle（Created → Ready）

## Excluded

- Runtime execution control
- Scheduling / Dispatch / Engine assignment inside Workflow
- Retry / Timeout / Compensation runtime（将来）
- Changes to `src/orchestration/**` / `src/runtime_execution/**`
- Git commit / tag（本 Freeze Review 依頼により除外）

---

# 2. Objectives

- Declarative Workflow definition を固定する
- Workflow 責務を Ready で終了させる
- GraphBuilder を唯一の Workflow → ExecutionGraph 変換経路とする
- 20.8〜20.9.3 Frozen Contracts を侵さない

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | PRESERVED |
| ASA-ARCH-20.9.0〜20.9.3 Orchestration | FROZEN | 変更禁止 |
| ExecutionGraph / GraphBuilder（orchestration） | FROZEN | read-only 利用のみ |

依存方向:

```text
workflow
    ↓
GraphBuilder
    ↓
ExecutionGraph
    ↓
Orchestrator (20.9.x)
```

逆依存は禁止。

---

# 4. Components

| Component | Role |
|---|---|
| Workflow | Immutable declarative definition |
| WorkflowDefinition | Raw definition shape |
| WorkflowMetadata | Declarative metadata |
| WorkflowState | Created→Validated→Immutable→GraphBuilt→Ready |
| ExecutionPolicy | Declares behavior only |
| WorkflowBuilder | Definition builder only |
| GraphBuilder（orchestration） | Workflow → ExecutionGraph（read-only Workflow） |

---

# 5. Responsibility Boundaries

| Layer | Owns | Must Not |
|---|---|---|
| Workflow | Definition through Ready | Execute / schedule / dispatch / assign engines / runtime state |
| GraphBuilder | Workflow→ExecutionGraph | Modify Workflow / partial graph / scheduling / engine assignment |
| Orchestrator（20.9.x） | Running / Completed / Failed / Suspended / Resumed | Be owned by Workflow |

---

# 6. Workflow Lifecycle

```text
[Workflow responsibility]
    Created → Validated → Immutable → GraphBuilt → Ready
─────────────── ends at Ready

[Orchestrator responsibility]
    Running / Completed / Failed / Suspended / Resumed
```

---

# 7. GraphBuilder Contract

```text
Input:  Workflow
Output: ExecutionGraph
```

- Read-only Workflow
- Acyclic ExecutionGraph
- Fail without producing graph; no partial graph
- No scheduling / engine assignment / retry-timeout semantics embedded

---

# 8. Future Extensions

- Workflow runtime engine
- Retry / Timeout / Compensation（21.5 想定）
- Advanced pipeline composition

拡張は本 Core 契約および 20.8〜20.9.3 Frozen Contracts を侵してはならない。

---

# 9. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-21.0.md` |
| Specification | `docs/specs/asa_arch_21_0_workflow_core.md` |
| Verification Plan | `docs/specs/asa_arch_21_0_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_21_0_verification_mapping.md` |
| Checksum | `docs/reports/asa_arch_21_0_checksum_verification.md` |
| Acceptance | `docs/reports/ASA-VERIFY-ARCH-21.0-ACCEPTANCE-001.md` |
| Freeze Verification | `docs/reports/ASA-ARCH-21.0-FREEZE-VERIFICATION.md` |

---

# 10. Status

```text
Freeze Review           : COMPLETE
Architecture State      : FROZEN（review accepted）
Git Commit / Tag        : NOT ISSUED（excluded by freeze request）
Blocking Issues         : NONE
```
