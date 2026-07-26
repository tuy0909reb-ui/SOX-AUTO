# ASA-ARCH-20.9.0 Verification Plan

本書は ASA-ARCH-20.9.0 — Orchestration Core Specification（Draft 1.3 / Freeze Candidate）の  
登録整合性および契約検証計画である。

Baseline は契約、Specification は設計、Verification は検証である。

**対象:** ASA-ARCH-20.9.0 Orchestration Core（登録検証）  
**非対象:** EnginePool / Dispatch / Scheduler / Workflow / Pipeline / Observability の実装検証  
**必須前提:** ASA-ARCH-20.8 Freeze 完全維持

---

# 1. Verification Scope

本計画は以下を検証する。

1. Artifact Presence  
2. Baseline Consistency  
3. Specification Consistency  
4. ADR Consistency  
5. Runtime Compatibility  
6. Frozen Contract Preservation  
7. Lifecycle Validation  
8. Graph Contract Validation  
9. Context Ownership Validation  
10. Error Policy Validation  

---

# 2. Verification Items

## 2.1 Artifact Presence

**目的:** 登録成果物がすべて存在する。

| Check | Expected Path |
|---|---|
| Baseline | `docs/baselines/ASA-ARCH-20.9.0.md` |
| Specification | `docs/specs/asa_arch_20_9_0_orchestration_core.md` |
| Verification Plan | `docs/specs/asa_arch_20_9_0_verification_plan.md` |
| Verification Mapping | `docs/specs/asa_arch_20_9_0_verification_mapping.md` |
| ADR | `docs/adrs/ADR-20.9-001.md` |

**Pass Criteria:** 5 成果物がすべて存在する。

---

## 2.2 Baseline Consistency

**目的:** Baseline が必須セクションを備え、Draft 1.3 と矛盾しない。

必須セクション:

- Scope
- Objectives
- Frozen Dependencies
- Component Overview
- Responsibility Boundary
- Lifecycle Summary
- Architecture Contracts
- Future Extension Boundary

**Pass Criteria:** 必須セクション完備、20.9.1 以降を範囲外と明記。

---

## 2.3 Specification Consistency

**目的:** Specification が Draft 1.3 を意味変更なく反映している。

対象項目:

- Scope
- Components
- Orchestrator
- Lifecycle
- Initialization Sequence
- OrchestrationContext
- ExecutionGraph
- GraphBuilder
- GraphValidator
- ErrorPolicy
- RuntimePlan Lifecycle
- Communication Constraint
- Freeze Contracts

**Pass Criteria:** Draft 1.3 の契約文言・状態機械・境界が保持されている。

---

## 2.4 ADR Consistency

**目的:** ADR-20.9-001 が登録方針と一致する。

確認内容:

- Decision: Orchestration Layer を Runtime Execution Layer 上位に追加し Frozen 契約を変更しない
- Context: 20.8 完了、上位層必要性、後方互換
- Consequences: ExecutionEngine 不変、Frozen 保持、将来拡張点明示

**Pass Criteria:** Decision / Context / Consequences が揃い、仕様と矛盾しない。

---

## 2.5 Runtime Compatibility

**目的:** 20.8 Runtime Execution Layer との互換性維持。

確認内容:

- Runtime Execution Layer を変更していない
- ExecutionEngine を変更していない
- 依存方向は 20.9.0 → 20.8 → 20.0〜20.7 のみ
- `ExecutionLayerInput` のみ Non-Frozen として扱う

**Pass Criteria:** 20.8 成果物・契約に対する破壊的変更がない。

---

## 2.6 Frozen Contract Preservation

**目的:** 20.8 Frozen Contracts が保持されている。

変更禁止対象:

- INV / DEP / RB / DET / SEM / ERR / FLC
- Runtime Model / Multi-Event Runtime / Runtime Execution Layer
- ExecutionEngine

**Pass Criteria:** 上記に対する変更・再定義・緩和がない。  
**Result Expectation:** PRESERVED

---

## 2.7 Lifecycle Validation

**目的:** Orchestrator Lifecycle 契約が仕様として閉じている。

確認内容:

- Created → Initialized → Ready → Running → Completed → Shutdown
- Created → Failed → Shutdown
- initialize は Created のみ / Failed 再初期化禁止
- execute は Ready のみ・1 回のみ・shutdown 暗黙呼出禁止
- shutdown は idempotent

**Pass Criteria:** Lifecycle / Ready / Execute / Shutdown 契約が仕様に明記されている。

---

## 2.8 Graph Contract Validation

**目的:** ExecutionGraph 関連契約が仕様として閉じている。

確認内容:

- Immutable DAG
- GraphBuilder 純関数・決定性（injective 不要）
- GraphValidator 非破壊
- Validation Failure → initialize Failure → Failed
- RuntimePlan は Builder 入力であり検証後破棄可

**Pass Criteria:** Immutable Graph / DAG Validation / Builder Determinism / Validator Non-Mutation / RuntimePlan Lifecycle が明記されている。

---

## 2.9 Context Ownership Validation

**目的:** Context 所有権と Snapshot 契約が仕様として閉じている。

確認内容:

- Only Orchestrator may mutate OrchestrationContext
- Engine はイベント通知のみ
- Snapshot SHALL NOT reference mutable internal state
- Snapshot は Running 中取得可能

**Pass Criteria:** Context Ownership / Snapshot Contract が明記されている。

---

## 2.10 Error Policy Validation

**目的:** ErrorPolicy 境界が仕様として閉じている。

確認内容:

- ErrorPolicy SHALL NOT modify ExecutionGraph
- STOP_ON_ERROR / CONTINUE / COLLECT_ERRORS
- Policy は継続可否と状態遷移のみ決定

**Pass Criteria:** ErrorPolicy Boundary が明記されている。

---

# 3. Out of Scope（本 Verification）

以下は実施しない。

- EnginePool / Dispatch / Scheduler / Workflow / Pipeline / Observability 実装試験
- Runtime Execution Layer / ExecutionEngine 変更試験（変更自体が禁止）
- 20.8 Architecture Tests の再定義
- Freeze Tag / Freeze Commit 発行（本作業は登録のみ）

---

# 4. Pass / Fail Summary Template

| ID | Item | Result |
|---|---|---|
| VP-001 | Artifact Presence | |
| VP-002 | Baseline Consistency | |
| VP-003 | Specification Consistency | |
| VP-004 | ADR Consistency | |
| VP-005 | Runtime Compatibility | |
| VP-006 | Frozen Contract Preservation | |
| VP-007 | Lifecycle Validation | |
| VP-008 | Graph Contract Validation | |
| VP-009 | Context Ownership Validation | |
| VP-010 | Error Policy Validation | |

期待結果（登録完了時）:

```text
Architecture Review      PASS
Registration            COMPLETE
Backward Compatibility  PASS
Frozen Contracts        PRESERVED
Blocking Issues         NONE
```
