# ADR-20.9-001  
Introduce Orchestration Layer above Runtime Execution Layer

---

## Status

Accepted（Registration）

---

## Context

- Runtime Execution Layer は ASA-ARCH-20.8 で完了し、Freeze 済みである。
- Frozen Contracts（INV / DEP / RB / DET / SEM / ERR / FLC）および  
  Runtime Model / Multi-Event Runtime / Runtime Execution Layer は変更できない。
- ExecutionEngine を含む 20.8 Runtime Execution Layer は変更禁止である。
- `ExecutionLayerInput` のみ Non-Frozen として扱う。
- 上位の実行制御（Graph 構築・検証・Context 所有・Lifecycle）を担う  
  Orchestration Layer が必要である。
- 後方互換性を維持したまま、21.0 LTS Freeze に耐える骨格を確立する必要がある。

---

## Decision

```text
Introduce Orchestration Layer above Runtime Execution Layer without modifying any frozen runtime contracts.
```

具体的には:

- ASA-ARCH-20.9.0 として Orchestration Core Specification（Draft 1.3）を登録する。
- Core Components は Orchestrator / OrchestrationContext / ExecutionGraph とする。
- GraphBuilder / GraphValidator / ErrorPolicy は設計概念として契約を定義する。
- 20.8 Frozen Contracts および ExecutionEngine は変更しない。
- EnginePool / Dispatch / Scheduler / Workflow / Pipeline / Observability は本 ADR の実装対象外とする。

---

## Consequences

### Positive

- ExecutionEngine remains unchanged
- Frozen contracts preserved
- Future Scheduler / Workflow / Pipeline remain extension points
- Orchestration Layer の責務・Lifecycle・Graph / Context / Policy 境界が閉じる
- 20.8 との後方互換を維持したまま上位層を追加できる

### Negative / Constraints

- 20.9.0 は Core Specification 登録のみであり、実行実装は後続フェーズに委ねる
- EnginePool / Dispatch 等の詳細は別 Baseline（20.9.1 以降）で扱う必要がある
- Orchestration 実装は本 Core 契約および 20.8 Frozen Contracts を侵してはならない

---

## Alternatives Considered

### Alternative A: Runtime Execution Layer を拡張して Orchestration を内蔵する

却下。  
理由: 20.8 Frozen Contracts / ExecutionEngine 変更禁止に抵触する。

### Alternative B: ExecutionEngine 間の直接通信で協調する

却下。  
理由: Communication Constraint（Engine → Orchestrator → Context → Engine）に反する。

### Alternative C: 20.9 で Scheduler / Workflow まで同時に固定する

却下。  
理由: 本登録は Core Specification のみ。将来拡張境界を侵す。

---

## References

| Kind | Path / ID |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.0.md` |
| Specification | `docs/specs/asa_arch_20_9_0_orchestration_core.md` |
| Parent Freeze | ASA-ARCH-20.8-FREEZE |
| Parent Commit | `cce74c22568344bf53cd0d933d281da5b0cc5876` |
