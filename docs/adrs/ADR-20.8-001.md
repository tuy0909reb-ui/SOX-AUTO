# ADR-20.8-001  
Logical Components Only — Frozen Architecture Decision

---

## Status
Accepted

---

## Context

ASA-ARCH-20.8 は Runtime Execution Model を新規追加するアーキテクチャである。  
20.0〜20.7 はすべて Freeze 完了済みであり、既存 Runtime の意味論・責務・依存方向は変更できない。

20.8 の目的は「既存 Runtime の意味論を変更せずに Execution Layer を追加すること」である。

このため、20.8 の設計では以下の課題が発生する。

- 既存 Runtime の構造を変更できない  
- 既存コンポーネントの API を変更できない  
- 既存コンポーネントの責務境界を変更できない  
- 既存の Event/Pipeline/Scheduler の意味論を変更できない  
- 既存の内部状態を変更できない  

したがって、20.8 は **既存 Runtime の上に論理レイヤーを追加する** 以外の選択肢が存在しない。

---

## Decision

20.8 は **論理コンポーネントのみを凍結する**。

凍結対象は以下の 3 つの論理コンポーネントである。

1. **Execution Engine**  
2. **Execution Context**  
3. **Adapter**

これらは Baseline により MUST/MUST NOT が固定される。

一方で、以下は凍結しない。

- 具体的な API  
- 内部構造  
- 実装方式  
- 拡張方式  
- 入力モデルの詳細構造（ExecutionLayerInput）

理由は以下の通り。

- 20.8 は additive であり、既存 Runtime を変更しない  
- 20.8 の論理契約は固定する必要がある  
- しかし実装方式は将来拡張の余地を残す必要がある  
- ExecutionLayerInput は将来 ExecutionGraph や CompositeInput に拡張される可能性がある  

---

## Consequences

### Positive
- 20.8 の論理契約が固定される  
- 既存 Runtime の意味論を完全に保持できる  
- 将来の拡張余地を確保できる  
- 実装方式を柔軟に変更できる  
- Architecture Tests が明確になる  

### Negative
- 実装方式が複数存在し得るため、実装ガイドラインが必要  
- ExecutionLayerInput の構造が固定されないため、実装時に整合性確認が必要  

---

## Alternatives Considered

### Alternative A: API を凍結する  
却下。  
理由: 将来の拡張余地が失われる。

### Alternative B: ExecutionLayerInput を凍結する  
却下。  
理由: 入力モデルは将来拡張される可能性が高い。

### Alternative C: 20.8 を既存 Runtime に統合する  
却下。  
理由: 20.0〜20.7 は Freeze 完了済みであり、変更禁止。

---

## Final

20.8 は **論理コンポーネントのみを凍結し、実装方式は凍結しない**。  
これにより、既存 Runtime の意味論を保持しつつ、将来拡張可能な Execution Layer を追加できる。
