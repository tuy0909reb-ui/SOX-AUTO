# ASA-ARCH-21.2 Chapter 4 — Validation

**Draft 0.2**  
**Architecture ID:** ASA-ARCH-21.2（Chapter 4）  
**Parent:** ASA-ARCH-21.2 Chapter 3 — Expansion Rules（FROZEN）  
**Status:** DRAFT 0.2（Implementation Target — Chapter 4 only）

---

## 1. Purpose

Validation は、PipelineDefinition（21.2 Chapter 2）および Expansion Rules（21.2 Chapter 3）に基づいて生成される構造が **妥当であるかどうかを判定するための契約** である。

Validation は **判定のみ** を行い、  
Runtime・Expansion・WorkflowBuilder・Graph構築・実行意味論は一切扱わない。

Validation SHALL remain a declarative architectural contract only.

---

## 2. Validation Principles

### VL-1 — Declarative Validation

Validation SHALL be declarative.

- 妥当性条件のみを定義  
- アルゴリズム・手続きは含まない  
- 判定結果は classification のみ

### VL-2 — Structure Only

Validation SHALL operate on structural semantics only.

禁止：Runtime semantics / Execution behavior / Execution policy /  
Scheduler / EnginePool / DispatchStrategy / 実行時データ / 実行時条件分岐の評価

### VL-3 — Deterministic Validation

Validation SHALL be deterministic.

- 同一 PipelineDefinition → 同一判定結果  
- 同一 WorkflowDefinition → 同一判定結果  
- 非決定性禁止

### VL-4 — Pipeline Validation / Workflow Validation

Validation SHALL apply to:

1. Pipeline Validation（pre-expansion）  
2. Workflow Validation（post-expansion）

### VL-5 — No Execution

Validation SHALL NOT execute any part of the workflow.

- StepDefinition の実行禁止  
- 条件式の評価禁止  
- Runtime状態の参照禁止

---

## 3. Validation Boundary

### VL-6 — Validation Is Not Expansion

Validation SHALL NOT perform explicit or implicit expansion.

### VL-7 — Validation Is Not WorkflowBuilder

Validation SHALL NOT construct ExecutionGraph.

### VL-8 — Validation Is Not Runtime

Validation SHALL NOT reference or evaluate any runtime behavior or execution policy.

---

## 4. PipelineDefinition Validation（Pre-expansion）

### VL-9 — Recognized Elements Compliance

Validation SHALL verify compliance with the structural contracts defined in Chapter 2.

### VL-10 — Structural Completeness Compliance

Validation SHALL verify that PipelineDefinition satisfies structural completeness as defined in Chapter 2.

### VL-11 — Branch / Parallel / NestedPipeline Consistency

Validation SHALL verify structural consistency of Branch, Parallel, and NestedPipeline according to Chapter 2 and Chapter 3.

---

## 5. WorkflowDefinition Validation（Post-expansion）

### VL-12 — Deterministic Workflow

Expanded WorkflowDefinition SHALL be deterministic.

### VL-13 — Acyclic Workflow

Expanded WorkflowDefinition SHALL be acyclic.

Cycle Detection は Validation契約であり、実装は含まない。

### VL-14 — Structural Completeness After Expansion

Expanded WorkflowDefinition SHALL be structurally complete.

### VL-15 — Downstream Contract Compatibility

Validation SHALL verify compatibility with downstream structural contracts.

---

## 6. Validation Failure Classification

（動作は Chapter 5 で定義）

### VL-16 — Invalid Structure

PipelineDefinition が Chapter 2 の契約に適合しない場合、invalid structure と分類する。

### VL-17 — Invalid Expansion

WorkflowDefinition が Chapter 3 の契約に適合しない場合、invalid expansion と分類する。

### VL-18 — Invariant Violation

Invariant Violation includes any violation of PI-1 through PI-13.

### VL-19 — Compatibility Violation

Downstream Contract Compatibility に違反する場合、compatibility violation と分類する。

---

## 7. Validation Outcome Contract

### VL-20 — Validation Outcome Classification

Validation outcome SHALL be classified as one of:

- Valid  
- Invalid Structure  
- Invalid Expansion  
- Invariant Violation  
- Compatibility Violation  

---

## 8. Out of Scope（Chapter 4）

Validation Engine / Algorithm / Executor, Expansion Component / Engine / Algorithm,  
Compilers / Builder / Transformer / Parser / Serializer, ExecutionGraph / Node / Edge / Graph Construction,  
Cycle Detection Implementation, Condition Evaluation, Workflow / Runtime Execution,  
Scheduler / Dispatcher / Engine Assignment, Retry / Timeout / Compensation,  
Failure Handling / Recovery / Diagnostics / Reporting, any runtime semantics.

---

## 9. Compatibility

SHALL preserve complete compatibility with ASA-ARCH-20.8〜21.1 and  
ASA-ARCH-21.2 Chapter 1–3. No frozen architectural contract may be modified. Extension only.
