# ASA-ARCH-21.2 Pipeline Invariants — Draft 0.2

**Architecture ID:** ASA-ARCH-21.2（Chapter 1）  
**Parent:** ASA-ARCH-21.1 Workflow Builder  
**Status:** DRAFT 0.2（Implementation Target — Chapter 1 only）

---

## 1. Purpose

Pipeline Invariants は、PipelineDefinition が常に満たすべき性質を定義する。  
Invariant は構造的本質のみを扱い、Validation・Expansion・Failure Contract の責務には踏み込まない。

Pipeline Invariants は、PipelineDefinition Public Contract・Expansion Rules・Validation・Failure Contract の上位概念であり、21.2 のすべての仕様はこの Invariant に従属する。

---

## 2. Core Invariants

### PI-1 — Immutable Lifecycle

Pipeline SHALL become immutable immediately after successful validation.

- Validation完了後は内部状態の変更禁止  
- Lifecycleとしての不変性を規定  
- WorkflowBuilder（21.1）の Read-only Contract と整合

### PI-2 — Read-only Exposure

Pipeline SHALL be exposed as read-only to all external components.

- Orchestrator（20.9.x）からの書き換え禁止  
- Runtime側からの変更禁止  
- 外部公開時点で完全固定

### PI-3 — Determinism

Pipeline SHALL be deterministic.

- 同一 PipelineDefinition → 同一 Workflow  
- Expansion Rules は決定的であること  
- 非決定性（ランダム・実行時条件分岐）は禁止  
- WorkflowBuilder（21.1）の Determinism と整合

### PI-4 — Structure Only

Pipeline SHALL represent workflow structure only.

Pipeline SHALL NOT define runtime behavior or execution policy.

禁止事項（すべて Runtime責務）：

- Retry  
- Timeout  
- Engine assignment  
- Scheduler behavior  
- Priority  
- Load balancing  
- Dispatch preference  
- Compensation  
- その他 Execution Policy 全般

### PI-5 — Single Expansion

Pipeline SHALL be expandable into exactly one valid Workflow.

- Expansion主体は本章では定義しない  
- 多義的展開禁止  
- 部分展開禁止  
- Workflow（21.0）との整合性を保持

### PI-6 — Acyclic Expansion

Expanded Workflow SHALL be acyclic.

- Cycle Detection は Validation章の責務  
- ExecutionGraph（21.1）の Acyclic 契約と整合

### PI-7 — Compatibility with WorkflowBuilder

Pipeline SHALL be compatible with WorkflowBuilder (21.1).

- Node生成契約を破壊しない  
- Edge生成契約を破壊しない  
- StepDefinition → Node の一意性を侵害しない  
- WorkflowBuilder Failure Contract を侵害しない

### PI-8 — Implementation Independence

Pipeline SHALL be implementation independent.

- 言語・フレームワーク・実行環境に依存しない  
- DSLは表現手段であり、意味論は PipelineDefinition に属する

### PI-9 — Semantic Independence

Pipeline semantics SHALL be independent from representation.

- DSL / JSON / YAML / ProtoBuf などの表現形式に依存しない  
- 表現形式の違いが意味論に影響してはならない

---

## 3. Structural Invariants

### PI-10 — Complete Structural Definition

Pipeline SHALL represent a complete structural definition.

- 不完全な構造は禁止  
- 具体的な完全性条件は Public Contract と Validation で定義  
- Nested Pipeline の展開有無は本章では扱わない（Expansion Rulesの責務）

### PI-11 — Recognized Structural Elements

Pipeline SHALL consist only of recognized structural elements.

- Recognized Elements は Public Contract で定義  
- Sequence / Parallel / Branch / Merge / Nested は 21.2 の初期セット  
- 将来拡張（Loop / Scatter / Join / Switch / Map / Reduce 等）を阻害しない

### PI-12 — No Runtime-dependent Branching

Pipeline SHALL NOT contain runtime-dependent branching.

- 条件分岐は構造としてのみ表現  
- 実行時条件評価は Orchestrator（20.9.x）責務  
- 動的分岐生成禁止

---

## 4. Failure Invariant

### PI-13 — Immediate Failure on Violation

Any violation of Pipeline Invariants SHALL cause immediate failure.

- Failure分類は Failure Contract章で定義  
- Invariant章では「即時失敗」のみ規定する

---

## 5. Out of Scope（Chapter 1）

PipelineDefinition Public Contract, Expansion Rules, Validation, Failure Contract,  
DSL / Parser / Compiler / Expander / Builder / Serializer / Deserializer,  
Optimization, Runtime, Execution, Scheduler, Dispatcher, Engine Assignment,  
Retry, Timeout, Compensation, Conditional Evaluation, Dynamic Branch Resolution,  
Execution Policy, and any runtime semantics.

---

## 6. Compatibility

SHALL preserve complete compatibility with ASA-ARCH-20.8〜21.1.  
No frozen contract may be modified. Extension only.
