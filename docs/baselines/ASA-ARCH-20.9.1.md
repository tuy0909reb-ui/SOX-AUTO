# ASA-ARCH-20.9.1 — Orchestrator Internal Responsibilities

Status: FROZEN  
Version: 1.0  
Freeze Tag: ASA-ARCH-20.9.1-FREEZE  
Commit: <freeze 時に記入>

---

# 1. Purpose

ASA-ARCH-20.9.1 は ASA-ARCH-20.9.0 Orchestration Core の公開契約を満たすための  
**Orchestrator 内部責務・制御フロー** を定義し、実装として凍結する。

20.9.1 は additive であり、Runtime Execution Layer（20.8）および  
Orchestration Core 契約（20.9.0）を変更しない。

---

# 2. Scope

## Included

- Orchestrator Internal Responsibilities Specification
- Orchestration implementation (`src/orchestration/`)
- Architecture tests (`tests/orchestration/`)

## Excluded（future work）

- EnginePool
- Scheduler
- Workflow
- Pipeline
- Observability
- Retry
- Queue / Thread-specific implementation

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.0〜20.7 | FROZEN | 変更禁止 |
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | 変更禁止 |
| ExecutionEngine | FROZEN | 変更禁止 |
| ASA-ARCH-20.9.0 Orchestration Core | REGISTERED / Parent | 公開契約を侵さない |

依存方向:

```text
orchestration
        │
        ▼
runtime_execution
```

逆依存は存在しない。

---

# 4. Frozen Components

| Component | Role |
|---|---|
| LifecycleController | 状態遷移の唯一の窓口 |
| EngineRegistry | NodeID → ExecutionEngine 参照解決のみ |
| Dispatcher | 実行可能ノード選択（Graph read-only） |
| ExecutionCoordinator | ディスパッチ・完了監視・ResultCollector 通知 |
| ResultCollector | Result/Error/Event 集約・Context 更新・ErrorPolicy 評価 |
| Orchestrator | 公開 façade（initialize / execute / shutdown） |
| OrchestrationContext | 上位コンテキスト（Orchestrator 所有） |
| ExecutionGraph | 不変 DAG |
| GraphBuilder | RuntimePlan → Graph（純関数） |
| GraphValidator | 非破壊検証 |
| ErrorPolicy | Graph 非変更・継続可否決定 |

---

# 5. Architecture Contracts（要約）

- Internal component dependencies form an acyclic graph
- Lifecycle transitions validated; invalid transitions rejected
- EngineRegistry is lookup-only（no flow control）
- Dispatcher / internal components treat ExecutionGraph as read-only
- Each executable node dispatched at most once
- ResultCollector updates Context before ErrorPolicy evaluation
- Failures affecting Orchestrator state go through LifecycleController
- Dispatch loop terminates when all nodes completed or ErrorPolicy requests termination

---

# 6. Verification Requirements

| ID | Requirement |
|---|---|
| VFY-001 | Architecture Tests PASS |
| VFY-002 | Dependency Verification PASS |
| VFY-003 | Regression PASS（20.8 含む） |
| VFY-004 | Checksum Verification PASS |
| VFY-005 | TypeScript Typecheck + Jest PASS |

---

# 7. Freeze Criteria

| ID | Criterion |
|---|---|
| FRC-001 | 全検証 PASS |
| FRC-002 | Freeze Commit ID 固定 |
| FRC-003 | Freeze Tag 発行 |
| FRC-004 | Blocking Issues = 0 |

---

# 8. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.1.md` |
| Specification | `docs/specs/asa_arch_20_9_1_orchestrator_internal_responsibilities.md` |
| Implementation | `src/orchestration/` |
| Architecture Tests | `tests/orchestration/` |
| Checksum Report | `docs/reports/asa_arch_20_9_1_checksum_verification.md` |
| Acceptance | `docs/reports/ASA-VERIFY-ARCH-20.9.1-ACCEPTANCE-001.md` |
| Parent Core | `docs/baselines/ASA-ARCH-20.9.0.md` |
