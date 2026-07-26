# ADR-20.8-002 — ExecutionLayerInput を凍結しない

Status: ACCEPTED  
Date: 2026-07-26  
Related Baseline: ASA-ARCH-20.8 — Frozen Baseline (ID Version)  
Related Spec: runtime_execution_spec_v1.3

---

# 1. Context

ExecutionLayerInput（ELI）は Execution Engine が受け取る  
最小単位の入力構造である。

ELI は以下のように定義される：

```ts
export interface ExecutionLayerInput {
    type: string;
    payload: unknown;
    metadata: Record<string, unknown>;
}
```

ELI は Engine の拡張性・将来互換性に強く依存するため、  
Baseline の凍結対象に含めるべきかが議論された。

---

# 2. Decision

**ExecutionLayerInput は凍結しない。**

---

# 3. Rationale

RAT-001 ELI は将来の拡張（CompositeInput / ExecutionGraph）に依存する  
RAT-002 ELI を凍結すると Engine の forward-compatibility が失われる  
RAT-003 Baseline の凍結対象は “論理契約” のみである  
RAT-004 ELI は論理契約ではなく “データ構造” である  
RAT-005 ELI の柔軟性は 20.8 の設計目的に合致する

---

# 4. Alternatives

ALT-001 ELI を完全凍結する  
→ 将来拡張が困難になるため却下

ALT-002 ELI の一部のみ凍結する  
→ 境界が曖昧になり監査性が低下するため却下

ALT-003 ELI を versioned schema として管理する  
→ 過剰設計であり現段階では不要

---

# 5. Consequences

CON-001 ELI は将来拡張可能  
CON-002 Engine は柔軟な入力を受け取れる  
CON-003 Baseline の凍結範囲が明確になる  
CON-004 監査時に “凍結対象ではない” と明確に判断できる

---

# 6. Final Decision

ExecutionLayerInput は **Baseline の凍結対象に含めない**。  
これは 20.8 の設計目的（additive / forward-compatible）と一致する。  
Baseline 上は NF-001 として非凍結である。
