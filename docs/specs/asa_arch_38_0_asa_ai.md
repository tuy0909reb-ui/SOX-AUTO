# ASA-ARCH-38.0 — ASA-AI Extension Intelligence Layer

**Draft 0.5**  
**Architecture ID:** ASA-ARCH-38.0（ASA-AI Extension Intelligence Layer）  
**Pipeline Position:** ASA-ARCH-21.3 Chapter 38（third Extension Domain；sibling to OPS / CONNECT）  
**Parent:** ASA-ARCH-35.1 — Extension Development Framework（FROZEN）  
**Status:** DRAFT 0.5 / **FROZEN**（ASA-FREEZE-ARCH-38.0-001）

Status: Draft 0.5 / FROZEN  
Registration: ASA-REGISTER-ARCH-38.0-001  
Freeze Authorization: ASA-FREEZE-ARCH-38.0-001

---

# 1. Scope

Chapter 38 defines ASA-AI — the Extension Intelligence Layer providing
standardized intelligence contracts independent from implementation technology.

Purpose: Interpret / Analyze / Evaluate / Explain / Recommend / Propose.

Not: Decision maker; not Execution subject; not Core / Governance / Framework /
OPS / CONNECT mutation; not model selection / training / vendor coupling.

---

# 2. Position

```text
Extension Development Framework (35.1 Frozen)
        |
ASA-OPS (36.0)   ASA-CONNECT (37.0)   ASA-AI (38.0)
```

Authority fixed: **ADVISOR**. Proposal ≠ Execution.

---

# 3. Implementation Baseline

| Artifact | Path |
|---|---|
| Package | `src/extensions/asa_ai/` |
| Extension Contract | `AiExtensionContract.ts` |
| Intelligence Contract | `IntelligenceContract.ts` |
| Runtime / Session | `AiRuntimeBoundary.ts` |
| Proposal / Evidence / Confidence / Uncertainty | `AiProposalContract.ts` |
| Memory / Learning / I-O | `AiMemoryContract.ts` |
| Security / Audit / Trace / Determinism | `AiSecurityContract.ts` |
| Registration / Discovery / Selection / Fallback / Lifecycle | `AiProviderRegistration.ts` |
| Layer Model | `AsaAiLayer.ts` |
| Validator | `AiValidator.ts`（`establish()`） |
| Barrel | `index.ts` |

Builder operation: `AiValidator.establish()`.
