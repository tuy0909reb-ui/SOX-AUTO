# ASA-ARCH-20.8 Runtime Execution Model Specification v1.3

Version: 1.3  
Status: DRAFT (to be frozen after verification)  
Related Baseline: ASA-ARCH-20.8 — Frozen Baseline (ID Version)

---

# 1. Overview

本仕様は ASA-ARCH-20.8 における Runtime Execution Model の  
**契約・構造・責務・決定性・意味論保持**を定義する。

Execution Layer は既存 Runtime（20.0〜20.7）の意味論を変更せず、  
additive に追加される。

---

# 2. Execution Layer Input Model

ExecutionLayerInput は Execution Engine が受け取る  
**最小単位の入力構造**である。

ExecutionLayerInput は **凍結対象ではない（ADR-20.8-002 / Baseline NF-001）**。

## 2.1 Structure

```ts
export interface ExecutionLayerInput {
    type: string;
    payload: unknown;
    metadata: Record<string, unknown>;
}
```

## 2.2 Requirements（Spec固有ID。Baseline 契約IDではない）

ELI-001 `type` は Engine が識別可能な文字列である  
ELI-002 `payload` は任意の構造を許容する  
ELI-003 `metadata` は任意のキーを許容する  
ELI-004 ELI は forward-compatible である  
ELI-005 ELI は Baseline の凍結対象ではない

---

# 3. Execution Context Model

ExecutionContext は Execution Layer の内部状態を保持する。

## 3.1 Structure

```ts
export class DefaultExecutionContext {
    readonly runtimeState: Readonly<ExternalRuntimeState>;
    readonly internalState: Readonly<ExecutionInternalState>;

    constructor(runtimeState: ExternalRuntimeState, internalState: ExecutionInternalState) {
        this.runtimeState = Object.freeze({ ...runtimeState });
        this.internalState = Object.freeze({ ...internalState });
    }
}
```

## 3.2 Requirements

RB-CTX-001 Context は External Runtime を read-only として扱う  
RB-CTX-002 Context は意味論的同値性を保持する  
RB-CTX-003 Context の状態遷移は仕様に従う  
RB-CTX-004 Context は External Runtime を変更しない

---

# 4. Execution Engine Model

ExecutionEngine は Execution Layer の中心的実行装置である。

## 4.1 Structure

```ts
export class DefaultExecutionEngine implements ExecutionEngine {
    execute(context: DefaultExecutionContext, input: ExecutionLayerInput): unknown {
        void input;
        return context;
    }
}
```

## 4.2 Requirements

RB-ENG-001 Engine は Execution Layer の実行を担う  
RB-ENG-002 Engine はスケジューリングを行わない  
RB-ENG-003 Engine はキューを所有しない  
RB-ENG-004 Engine は Event を生成しない  
RB-ENG-005 Engine は Pipeline を変更しない  
RB-ENG-006 Engine は Scheduler の順序を変更しない  
RB-ENG-007 Engine は External Runtime を変更しない

---

# 5. Adapter Model

Adapter は External Runtime の安全な投影を提供する。

## 5.1 Structure

```ts
export class DefaultAdapter implements Adapter {
    constructor(private readonly external: ExternalRuntimeState) {}

    project(): Readonly<ExternalRuntimeState> {
        return Object.freeze({ ...this.external });
    }
}
```

## 5.2 Requirements

RB-ADP-001 Adapter は External Runtime の安全な投影を提供する  
RB-ADP-002 Adapter は副作用を持たない  
RB-ADP-003 Adapter は双方向依存を作らない  
RB-ADP-004 Adapter は Execution Layer と External Runtime の接続契約を提供する

---

# 6. Determinism Model

DET-001 同一入力・同一 Context・同一 External Runtime 状態 → 同一結果を返す  
（同一結果を返すにあたり、Engine は非決定的要素を持たず、Context の状態遷移は deterministic である。）

---

# 7. Error Model

ERR-001 エラーは定義された分類体系に従う  
ERR-002 エラーは External Runtime に伝播しない  
ERR-003 エラー発生時も Pipeline の意味論は保持される

---

# 8. Semantic Equivalence

SEM-001 Event の順序・優先度・意味論は保持される  
SEM-002 Pipeline と Scheduler の意味論は保持される

---

# 9. Frozen Items

FLC-001 Execution Engine の論理契約は凍結される  
FLC-002 Execution Context の論理契約は凍結される  
FLC-003 Adapter の論理契約は凍結される

---

# 10. Non-Frozen Items

NF-001 ExecutionLayerInput の構造  
NF-002 Engine/Context/Adapter の具体 API  
NF-003 内部実装方式  
NF-004 拡張方式  
NF-005 ExecutionGraph / CompositeInput などの将来拡張
