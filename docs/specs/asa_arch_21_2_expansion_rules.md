# ASA-ARCH-21.2 Chapter 3 — Expansion Rules

**Draft 0.2**  
**Architecture ID:** ASA-ARCH-21.2（Chapter 3）  
**Parent:** ASA-ARCH-21.2 Chapter 2 — PipelineDefinition Public Contract（FROZEN）  
**Status:** DRAFT 0.2（Implementation Target — Chapter 3 only）

---

## 1. Purpose

Expansion Rules は、PipelineDefinition（21.2 Chapter 2）を WorkflowDefinition（21.0）へ展開するための正式な構造規則である。

Expansion Rules は **構造的意味論のみ** を扱い、  
Runtime・Scheduler・EnginePool・DispatchStrategy などの実行意味論は一切含まない。

Expansion Rules は declarative architectural contracts only であり、  
Expansion Component / Algorithm は本章では導入しない。

---

## 2. Expansion Principles

### ER-1 — Deterministic Expansion

PipelineDefinition SHALL expand deterministically.

- 同一 PipelineDefinition → 同一 WorkflowDefinition  
- 非決定性（ランダム・実行時条件）は禁止  
- WorkflowBuilder（21.1）の Determinism と整合

### ER-2 — Single Expansion

PipelineDefinition SHALL expand into exactly one valid WorkflowDefinition.

- 多義的展開禁止  
- 部分展開禁止  
- NestedPipeline を含む場合でも一意展開を保証する

### ER-3 — Acyclic Expansion

Expanded WorkflowDefinition SHALL be acyclic.

- Expansion Rules は Cycle を生成してはならない  
- Cycle Detection は Validation責務  
- ExecutionGraph（21.1）の Acyclic 契約と整合

### ER-4 — Structure Only

Expansion SHALL preserve structural semantics only.

禁止：

- Runtime semantics  
- Retry / Timeout  
- Engine assignment  
- Scheduler behavior  
- Execution policy  
- 実行時条件分岐の生成

---

## 3. Expansion Boundary

### ER-5 — Expansion Operation

Expansion SHALL operate on PipelineDefinition and produce one WorkflowDefinition.

- 主体は定義しない  
- Expansion Rules は構造規則のみを定義する  
- Expansion Boundary（PD-10）を満たすこと

### ER-6 — WorkflowBuilder Boundary

Expansion result SHALL satisfy WorkflowBuilder requirements.

- Node生成契約  
- Edge生成契約  
- DAG生成契約  
- StepDefinition → Node の一意性保持  
- Read-only Contract（21.1）との整合  

---

## 4. Structural Expansion Rules

### ER-7 — Sequence Expansion

**Definition:** Sequence SHALL expand into a linear Workflow segment.

**Rules:**
1. Sequence の各要素を順序どおりに展開する  
2. 展開結果を直線的に連結する  
3. 空Sequenceは禁止（PD-3）  
4. NestedPipeline は展開後に同一構造位置へ挿入する  

**Guarantees:** Deterministic / Acyclic / WorkflowBuilder Node/Edge 契約と整合

### ER-8 — Parallel Expansion

**Definition:** Parallel SHALL expand into multiple independent Workflow segments.

**Rules:**
1. Parallel 内の各要素を独立に展開する  
2. 展開中は互いに独立  
3. 空Parallelは禁止（PD-4）  
4. Merge が存在する場合は ER-10 に従う  

**Guarantees:** 構造的並列のみ / 実行時並列度は Runtime責務 / DAG を破壊しない

### ER-9 — Branch Expansion

**Definition:** Branch SHALL expand into conditional Workflow segments identified by a Structural Condition Reference.

**Rules:**
1. Branch は Structural Condition Reference を保持する  
2. Condition Reference は評価されない  
3. 各 Path を独立に展開する  
4. Path は Sequence / Parallel / NestedPipeline を含んでもよい  
5. Runtime-dependent branching は禁止（PI-12）  

**Guarantees:** 条件分岐は構造的意味論のみ / 実行時評価は Orchestrator（20.9.x）責務

### ER-10 — Merge Expansion

**Definition:** Merge SHALL expand into a structural convergence point.

**Rules:**
1. Merge は 2つ以上の入力を持つ  
2. Merge は「合流点」であることのみを定義  
3. 出力数は規定しない  
4. Branch / Parallel と整合する  

**Guarantees:** Convergence semantics / DAG 非破壊 / WorkflowBuilder Edge契約と整合

### ER-11 — NestedPipeline Expansion

**Definition:** NestedPipeline SHALL expand into a Workflow subgraph.

**Rules:**
1. NestedPipeline 内の PipelineDefinition を再帰的に展開する  
2. 展開結果は親構造における NestedPipeline の位置に挿入する  
3. 無限再帰は禁止（PD-7）  
4. 展開後の構造は DAG を破壊してはならない  

**Guarantees:** 再帰展開は一意 / Deterministic / Acyclic

---

## 5. Composition Expansion Rules

### ER-12 — StepDefinition Expansion

StepDefinition SHALL be preserved as exactly one Workflow step during expansion.

- WorkflowDefinition の構造として保持  
- Node生成は WorkflowBuilder（21.1）の責務  

### ER-13 — Structural Composition

Each recognized structural element SHALL define its own composition rule.

- Sequence → Linear composition  
- Parallel → Independent composition  
- Branch → Conditional composition  
- Merge → Convergence composition  
- NestedPipeline → Recursive composition  

---

## 6. Expansion Validity

### ER-14 — Valid Expansion

Valid WorkflowDefinition SHALL satisfy:

- Deterministic  
- Acyclic  
- Structural completeness  

WorkflowBuilder要件は ER-6 にて別途規定。

### ER-15 — Invalid Expansion

Expansion result not satisfying ER-1〜ER-14 SHALL be considered invalid.

Invalid Expansion includes：

- Cycle生成  
- 多義的展開  
- 不完全構造  
- 無限再帰  
- Structural Rule違反  

Failure動作は Chapter 5 Failure Contract で定義する。

---

## 7. Out of Scope（Chapter 3）

Expansion Component / Engine / Algorithm, Workflow/Pipeline Compiler, Transformer,  
Builder, Parser, Serializer, Deserializer, Validation Engine / Algorithm,  
Cycle Detection, Failure Contract, Runtime Execution, Scheduler, Dispatcher,  
Engine Assignment, Retry, Timeout, Compensation, Condition Evaluation,  
Execution Policy, ExecutionGraph / Node / Edge Construction, Graph Optimization,  
any runtime semantics.

---

## 8. Compatibility

SHALL preserve complete compatibility with ASA-ARCH-20.8〜21.1 and  
ASA-ARCH-21.2 Chapter 1–2. No frozen architectural contract may be modified. Extension only.
