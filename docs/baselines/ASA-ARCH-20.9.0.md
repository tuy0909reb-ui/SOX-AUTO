# ASA-ARCH-20.9.0 — Orchestration Core Specification

Status: REGISTERED（Draft 1.3 / Freeze Candidate）  
Version: 1.0  
Parent Freeze: ASA-ARCH-20.8-FREEZE  
Parent Commit: cce74c22568344bf53cd0d933d281da5b0cc5876

---

# 1. Scope

ASA-ARCH-20.9.0 は、ASA-ARCH-20.8 Runtime Execution Layer（Frozen）を変更せず、  
その上位に **Execution Orchestration Layer** を追加するための Core Specification である。

本 Baseline は **Orchestration Core** のみを登録する。

以下は本 Baseline の範囲外である（20.9.1 以降）：

- EnginePool
- Dispatch
- Scheduler
- Workflow
- Pipeline
- Observability

---

# 2. Objectives

- Frozen 契約（INV / DEP / RB / DET / SEM / ERR / FLC）を侵さずに上位制御レイヤーを追加する。
- Runtime Execution Layer / ExecutionEngine を変更しない。
- Orchestration Layer の責務境界・ライフサイクル・Graph / Context / Policy 契約を固定する。
- 21.0 LTS Freeze のための最終アーキテクチャ骨格を確立する。

---

# 3. Frozen Dependencies

本 Baseline は以下の Frozen Baseline に依存し、それらを変更しない。

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.0〜20.7 Runtime Model / Multi-Event Runtime | FROZEN | 変更禁止 |
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| INV / DEP / RB / DET / SEM / ERR / FLC | FROZEN | 変更禁止 |
| ExecutionEngine（論理契約および実装骨格） | FROZEN | 変更禁止 |

Non-Frozen（継承）:

- `ExecutionLayerInput` のみ Non-Frozen（20.8 NF-001）

依存方向:

```text
20.9.0 Orchestration Core
        ↓
20.8 Runtime Execution Layer
        ↓
20.0〜20.7 Runtime
```

逆依存および循環依存は禁止する。

---

# 4. Component Overview

## 4.1 Core Components（本登録）

| Component | Role |
|---|---|
| Orchestrator | Orchestration Layer の制御主体。initialize / execute / shutdown |
| OrchestrationContext | Orchestrator が所有する上位コンテキスト |
| ExecutionGraph | 不変 DAG。実行構造の正本 |

## 4.2 Design Concepts（将来拡張・契約定義対象）

| Concept | Role |
|---|---|
| ExecutionGraphBuilder | RuntimePlan → ExecutionGraph（純関数） |
| GraphValidator | Graph 検証（非破壊） |
| ErrorPolicy | 実行継続可否と状態遷移の決定（Graph 非変更） |

---

# 5. Responsibility Boundary

| Component | May | Must Not |
|---|---|---|
| Orchestrator | Context を変更する / Lifecycle を制御する / Engine を生成する | Frozen Runtime / ExecutionEngine 契約を変更する |
| OrchestrationContext | 状態・イベント・エラーを保持する / Snapshot を提供する | Orchestrator 以外から更新される |
| ExecutionGraph | 不変 DAG として実行構造を表す | 構築後にノード・エッジ・内部フィールドを変更する |
| GraphBuilder | RuntimePlan から Graph を決定的に生成する | 副作用を持つ / 非決定的生成を行う |
| GraphValidator | Graph を検証する | Graph を変更する |
| ErrorPolicy | 継続可否と状態遷移を決定する | ExecutionGraph を変更する |
| ExecutionEngine | Orchestrator からの指示に従い実行する / イベント通知する | Engine 間直接通信 / Context 直接更新 |

通信経路（必須）:

```text
Engine → Orchestrator → OrchestrationContext → Engine
```

ExecutionEngine 間の直接通信は禁止する。

---

# 6. Lifecycle Summary

Orchestrator 状態機械:

```text
Created → Initialized → Ready → Running → Completed → Shutdown
```

異常系:

```text
Created → Failed → Shutdown
```

主要契約:

- `initialize(plan)` は Created からのみ。成功で Ready、失敗で Failed。Failed からの再初期化禁止。
- Ready は Graph 生成・検証・Context 初期化・必要 Engine 全生成が成功した状態。
- `execute()` は Ready からのみ、1 ライフサイクル 1 回。`shutdown()` を暗黙呼び出ししない。
- `shutdown()` は idempotent。

Initialization Sequence:

1. ExecutionGraphBuilder（純関数・Immutable DAG）
2. GraphValidator（非破壊）
3. Create OrchestrationContext
4. Create ExecutionEngines（Ready 前に完全構築）
5. Ready へ遷移

---

# 7. Architecture Contracts

本 Baseline が登録する契約群（詳細は Specification）:

| Contract Area | Summary |
|---|---|
| Lifecycle | Created / Initialized / Ready / Running / Completed / Failed / Shutdown |
| Ready Contract | Builder / Validator / Context / Engines がすべて成功 |
| Execute Contract | Ready のみ / 1 回のみ / shutdown 暗黙呼出禁止 |
| Shutdown Contract | idempotent |
| Context Ownership | Only Orchestrator may mutate OrchestrationContext |
| Snapshot Contract | Snapshot は不変で mutable internal state を参照しない |
| Immutable Graph | ExecutionGraph は immutable DAG |
| DAG Validation | 循環禁止・トポロジカルソート可能・決定的実行順序 |
| GraphBuilder Determinism | 同一 RuntimePlan → 同一 Graph（純関数） |
| Validator Non-Mutation | Validator は Graph を変更しない |
| RuntimePlan Lifecycle | Builder 入力。検証済み Graph 構築後は破棄可 |
| ErrorPolicy Boundary | Graph を変更しない。STOP_ON_ERROR / CONTINUE / COLLECT_ERRORS |
| Communication Constraint | Engine 間直接通信禁止 |

---

# 8. Future Extension Boundary

本 Baseline は Core Specification のみを固定する。  
以下は将来拡張点であり、本登録では実装・詳細設計しない。

- EnginePool
- Dispatch
- Scheduler
- Workflow
- Pipeline
- Observability
- 20.9.1 以降の詳細設計

拡張は本 Core 契約を侵してはならない。  
20.8 Frozen Contracts および Runtime Execution Layer は引き続き変更禁止である。

---

# 9. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.0.md` |
| Specification | `docs/specs/asa_arch_20_9_0_orchestration_core.md` |
| Verification Plan | `docs/specs/asa_arch_20_9_0_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_20_9_0_verification_mapping.md` |
| ADR | `docs/adrs/ADR-20.9-001.md` |

---

# 10. Status

```text
Registration            : COMPLETE（artifacts registered）
Source Spec             : Draft 1.3 / Freeze Candidate
Architecture State      : REGISTERED（not yet frozen）
20.8 Compatibility      : REQUIRED / PRESERVED
Frozen Contracts        : PRESERVED
```
