# ASA-ARCH-21.2 — Pipeline Definition

Status: FROZEN — Chapter 1 + Chapter 2 + Chapter 3 + Chapter 4 + Chapter 5  
Version: Draft 0.2  
Freeze Tags:
- `ASA-ARCH-21.2-CH1-FREEZE`（authorized: ASA-FREEZE-ARCH-21.2-CH1-001）
- `ASA-ARCH-21.2-CH2-FREEZE`（declared）
- `ASA-ARCH-21.2-CH3-FREEZE`（declared）
- `ASA-ARCH-21.2-CH4-FREEZE`（authorized: ASA-FREEZE-ARCH-21.2-CH4-001）
- `ASA-ARCH-21.2-CH5-FREEZE`（declared; git tag not issued — unless requested）  
Commit: `<not issued — commit excluded unless requested>`

---

# 1. Scope

ASA-ARCH-21.2 は Pipeline 構造契約を段階的に凍結する。

## Chapter 1 — Pipeline Invariants（FROZEN）

PI-1…PI-13 — `src/workflow/PipelineInvariants.ts`

## Chapter 2 — PipelineDefinition Public Contract（FROZEN）

PD-1…PD-13 — `PipelinePublicContract.ts`, `StructuralElement.ts`

## Chapter 3 — Expansion Rules（FROZEN）

ER-1…ER-15 — `src/workflow/ExpansionRules.ts`

## Chapter 4 — Validation（FROZEN）

VL-1…VL-20 — `src/workflow/ValidationContracts.ts`

## Chapter 5 — Failure Contract（FROZEN）

FL-1…FL-17 — declarative failure contract registry only.  
Registry: `src/workflow/FailureContracts.ts`

## Excluded

- Failure handling / exception classes / error codes  
- Recovery / retry / logging / runtime stop behavior  
- Validation / Expansion engines and algorithms  
- WorkflowBuilder / ExecutionGraph / Runtime behavior  
- Any runtime execution semantics  

---

# 2. Objectives

- Fix Invariants, Public Contract, Expansion Rules, Validation, and Failure as declarative contracts  
- Keep Failure free of handling, recovery, and runtime behavior  
- Preserve 20.8〜21.1 and prior 21.2 chapters（extension only）

---

# 3. Frozen Dependencies

| Dependency | Status | Constraint |
|---|---|---|
| ASA-ARCH-20.8 Runtime Execution Layer | FROZEN | 変更禁止 |
| ASA-ARCH-20.9.0〜20.9.3 Orchestration | FROZEN | 変更禁止 |
| ASA-ARCH-21.0 Workflow Core | FROZEN | 変更禁止 |
| ASA-ARCH-21.1 Workflow Builder | FROZEN | 変更禁止 |
| ASA-ARCH-21.2 Chapter 1–4 | FROZEN | 変更禁止 |

---

# 4. Chapter 5 Failure Contracts

| ID | Title |
|---|---|
| FL-1 | Declarative Failure |
| FL-2 | Structural Failure Only |
| FL-3 | Pre-runtime Detectability |
| FL-4 | Deterministic Failure |
| FL-5 | Failure Is Not Behavior |
| FL-6 | Failure Is Not Recovery |
| FL-7 | Structural Scope Only |
| FL-8 | Invalid Structure |
| FL-9 | Invalid Expansion |
| FL-10 | Invariant Violation |
| FL-11 | Compatibility Violation |
| FL-12 | Structural Non-continuability |
| FL-13 | Structurally Terminal |
| FL-14 | Semantically Non-recoverable |
| FL-15 | Structural Validation Determines Failure |
| FL-16 | Deterministic Determination |
| FL-17 | Failure Category |

Failure Categories: Invalid Structure / Invalid Expansion / Invariant Violation / Compatibility Violation.

---

# 5. Responsibility Boundaries

| Layer | Owns | Must Not |
|---|---|---|
| Chapters 1–4 | PI / PD / ER / VL contracts | Failure handling |
| Failure Contract（Ch5） | FL-1…FL-17 declarative contracts | Handling / recovery / runtime behavior |
| WorkflowBuilder（21.1） | Workflow → ExecutionGraph | Own Failure Contract |
| Orchestrator（20.9.x） | Runtime error handling | Own structural Failure Contract |

---

# 6. Registration Artifacts

| Kind | Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-21.2.md` |
| Ch5 Spec | `docs/specs/asa_arch_21_2_failure_contract.md` |
| Ch5 Verification Mapping | `docs/specs/asa_arch_21_2_ch5_verification_mapping.md` |
| Ch5 Implementation | `src/workflow/FailureContracts.ts` |
| Ch5 Tests | `tests/workflow/failure_contracts.test.ts` |
| Ch5 Checksum | `docs/reports/asa_arch_21_2_ch5_checksum_verification.md` |
| Ch5 Acceptance | `docs/reports/ASA-VERIFY-ARCH-21.2-CH5-ACCEPTANCE-001.md` |
| Ch5 Freeze Verification | `docs/reports/ASA-ARCH-21.2-CH5-FREEZE-VERIFICATION.md` |

---

# 7. Status

```text
Chapter 1 Freeze : COMPLETE
Chapter 2 Freeze : COMPLETE
Chapter 3 Freeze : COMPLETE
Chapter 4 Freeze : COMPLETE
Chapter 5 Freeze : COMPLETE（Freeze Review）
Git Commit / Tag : NOT ISSUED（unless separately requested）
Blocking Issues  : NONE
```
