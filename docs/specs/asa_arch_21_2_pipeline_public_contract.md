# ASA-ARCH-21.2 Chapter 2 — PipelineDefinition Public Contract

**Draft 0.2**  
**Architecture ID:** ASA-ARCH-21.2（Chapter 2）  
**Parent:** ASA-ARCH-21.2 Chapter 1 — Pipeline Invariants（FROZEN）  
**Status:** DRAFT 0.2（Implementation Target — Chapter 2 only）

---

## 1. Purpose

PipelineDefinition Public Contract は、PipelineDefinition が外部に対して提供する正式な公開モデルであり、  
Chapter 1（Pipeline Invariants）で定義された不変条件を具体化する。

PipelineDefinition は **構造的意味論のみ** を表現し、  
Runtime・Scheduler・EnginePool・DispatchStrategy などの実行意味論は一切持たない。

PipelineDefinition は **Definition Object** であり、  
生成・変換・検証・失敗動作の責務は持たない。

---

## 2. Definition Object Contract

### PD-1 — Definition Object

PipelineDefinition SHALL be a definition object.

**Definition:**
- 実行可能オブジェクトではない  
- 状態を持たない  
- 構造的意味論のみを表現する  

**Constraints:**
- Pipeline Invariants（PI-1〜PI-13）をすべて満たす  
- Runtime意味論を一切含まない  

**Compatibility Notes:**
- Workflow（21.0）および WorkflowBuilder（21.1）と整合する構造を提供する  

---

## 3. Standard Structural Elements

### PD-2 — Recognized Structural Elements

PipelineDefinition SHALL consist only of recognized structural elements.

Recognized Structural Elements（21.2 初期セット）：

- Sequence  
- Parallel  
- Branch  
- Merge  
- NestedPipeline  

将来拡張（Loop / Scatter / Join / Switch / Map / Reduce 等）は  
Recognized Elements の追加として扱う。

---

## 4. Structural Element Contracts

### PD-3 — Sequence Contract

**Definition:**  
Sequence SHALL define a deterministic ordered list of structural elements.

**Constraints:**  
- 順序は固定  
- 非決定性禁止  
- 空Sequence禁止  
- NestedPipeline を含んでもよい  

**Compatibility Notes:**  
- WorkflowBuilder の Node生成契約と整合  
- Expansion後は Workflow の線形構造として扱われる  

### PD-4 — Parallel Contract

**Definition:**  
Parallel SHALL define a deterministic set of concurrently eligible branches.

**Constraints:**  
- 空Parallel禁止  
- 並列度は構造的意味論のみ  
- 実行時の並列度は Runtime責務  

**Compatibility Notes:**  
- Branch / Merge と組み合わせ可能  
- Expansion後は複数の独立パスとして Workflow に展開される  

### PD-5 — Branch Contract

**Definition:**  
Branch SHALL define a structural conditional path identified by a Condition Identifier.

**Constraints:**  
- Condition Identifier は評価されない  
- 実行時評価は Orchestrator（20.9.x）責務  
- 1つ以上の Path を持つ  
- Path は Sequence / Parallel / NestedPipeline を含んでもよい  
- Runtime-dependent branching は禁止（PI-12）  

**Compatibility Notes:**  
- Expansion後は Workflow の条件分岐構造として扱われる  

### PD-6 — Merge Contract

**Definition:**  
Merge SHALL define a structural convergence point.

**Constraints:**  
- 2つ以上の入力を持つ  
- Merge は「合流点」であることのみを定義  
- 出力数は Expansion Rules の責務  

**Compatibility Notes:**  
- Branch / Parallel と整合  
- Expansion後は Workflow の合流ノードとして扱われる  

### PD-7 — NestedPipeline Contract

**Definition:**  
NestedPipeline SHALL embed another PipelineDefinition as a structural element.

**Constraints:**  
- 無限再帰禁止  
- NestedPipeline 自体は未展開構造  
- 展開は Expansion Rules の責務  

**Compatibility Notes:**  
- Expansion後は Workflow のサブグラフとして展開される  
- DAG（PI-6）を破壊してはならない  

---

## 5. Composition Contract

### PD-8 — Composition Contract

PipelineDefinition SHALL consist only of:

- Recognized Structural Elements  
- StepDefinitions（21.0）  
- NestedPipeline  
- PipelineDefinition（再帰構造）

禁止：

- Runtimeオブジェクト  
- Engine / Scheduler / DispatchStrategy  
- ExecutionGraph  
- Workflowインスタンス  
- 実行時データ  

---

## 6. Expansion Boundary Contract

### PD-9 — Expansion Capability

PipelineDefinition SHALL be expandable into exactly one valid Workflow.

- Expansion主体は本章では定義しない  
- 多義的展開禁止  
- 部分展開禁止  
- Workflow（21.0）との整合性を保持  

### PD-10 — Expansion Boundary

PipelineDefinition SHALL define the boundary for expansion by an expansion component.

- Expansion Rules は Chapter 3 で定義  
- PipelineDefinition は「展開可能な構造」を提供する  

---

## 7. Read-only Contract

### PD-11 — Read-only Exposure

PipelineDefinition SHALL be publicly exposed as read-only.

- 外部からの変更禁止  
- Orchestrator（20.9.x）からの変更禁止  
- WorkflowBuilder（21.1）からの変更禁止  

---

## 8. Compatibility Contract

### PD-12 — WorkflowBuilder Compatibility

Expansion result SHALL satisfy WorkflowBuilder requirements.

- Node生成契約を破壊しない  
- Edge生成契約を破壊しない  
- StepDefinition → Node の一意性を保持  
- DAG生成契約を破壊しない  

---

## 9. Structural Validity Contract

### PD-13 — Structural Validity

PipelineDefinition containing an invalid structure SHALL be considered invalid.

Invalid Structure includes:

- 未定義の Recognized Element  
- 空Sequence / 空Parallel  
- 無効な Branch / Merge  
- 無限再帰  
- 不完全構造（PD-3〜PD-7違反）

Failure動作は Chapter 5 Failure Contract で定義する。

---

## 10. Out of Scope（Chapter 2）

Expansion Component / Rules / Compiler / Transformer / Builder / Parser /  
Serializer / Deserializer / Validation Algorithm / Failure Contract /  
Runtime / Scheduler / Dispatcher / Engine Assignment / Retry / Timeout /  
Compensation / Conditional Evaluation / Execution Policy / Workflow Execution /  
ExecutionGraph Construction / any runtime semantics.

---

## 11. Compatibility

SHALL preserve complete compatibility with ASA-ARCH-20.8〜21.1 and Chapter 1（PI-1…PI-13）.  
No frozen architectural contract may be modified. Extension only.
