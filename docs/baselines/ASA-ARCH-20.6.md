# Architecture Baseline – ASA-ARCH-20.6

**Baseline ID:** ASA-ARCH-20.6  
**Title:** Runtime Pipeline  
**Version:** Draft 0.5（Phase 20.6 Frozen / Accepted）  
**Status:** Closed — Frozen / Accepted  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.5（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.6.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.6-001  
**Implementation Spec:** `auto-scribe-ai/impl/runtime_pipeline_spec.md`  
**Acceptance:** ASA-VERIFY-ARCH-20.6-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-20.6-001  
**Freeze Identifier:** ARCH-20.6-FREEZE  
**Git tag:** `arch-20.6-freeze`  
**Freeze Date:** 2026-07-26  
**Production:** `auto-scribe-ai/src/runtime_pipeline/`  
**Architecture Tests:** `auto-scribe-ai/tests/architecture/runtime_pipeline/`  

---

## 0. Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance | ASA-VERIFY-ARCH-20.6-ACCEPTANCE-001 — PASSED |
| Architecture Tests | **13 passed** |
| Regression | **923 passed** |
| 20.0〜20.5 checksums | UNCHANGED |
| Blocking Issues | NONE |

### 0.1 Production Source Checksums（frozen）— `runtime_pipeline/`

```text
18587b06c99ef3499104a94418a6c3b274472fc4bc916b55932a2fed0ce220bc  __init__.py
e7757536a4fb3fed5c9f007f0bd4fa942b64e5ec042d64b197c665ede587aa81  exceptions.py
7bb04d77a338a91e5ebf15bc8c4d39ea58e68ddd532e7810168b0e09e6e29eb0  models.py
0eccd22100c73b5a7534c2e24dd2ec81c53afec0276a8f475f7e6b0ca11d9cbf  pipeline.py
```

### 0.2 Freeze Rule

```text
Architecture 20.6 Runtime Pipeline SHALL be immutable.
Future pipeline expansions（new stages / multi-event / backpressure）
SHALL NOT mutate Phase 20.6 except through Change Requests that
supersede via a later Architecture phase（20.7+）.
```

---

## 1. Registration Declaration

* Based on ASA-ARCH-20.0〜20.5 Frozen Baselines  
* Architecture 20.6 SHALL NOT modify Architecture 15.x–20.5 contracts  
* Runtime Pipeline is an Architecture Concept — stage composition only  

---

## 2. Scope Summary

```text
Orchestrator → EventRouter → EventQueue → Scheduler → EventDispatch
             → Lifecycle → StateMachine → TransitionRule
             → LifecycleResult → Orchestrator（ExecutionContext update）
```

Pipeline connects frozen stages. It does not own Runtime State.

---

## 3. Out of Scope（→ 20.7+）

* New Pipeline stages  
* Multi-Event / Coalescing / Debouncing / Backpressure  
* Changes to Frozen Stage contracts  

---

# ASA-ARCH-20.6 Runtime Pipeline — Architecture Specification Draft 0.5（Frozen）

---

# 1. Scope

Runtime Pipeline は、ASA Runtime 全体の処理構造を表現する Architecture Concept であり、
特定のクラス・モジュール・コンポーネントを指すものではない。

20.6 は以下を対象とする：

* Pipeline Stages
* Pipeline Boundary
* Pipeline Flow（処理フロー）
* Stage Composition
* Processing Order
* Dependency Direction
* Pipeline Determinism
* Pipeline Ownership
* Pipeline Extension

対象外（Frozen Baseline を参照するのみ）：

* Orchestrator Contract（20.1）
* Policy Contract（20.2）
* Scheduler Contract（20.3）
* Lifecycle Contract（20.4）
* Event System Contract（20.5）

20.6 は Runtime Pipeline の統合構造のみを定義し、
既存 Stage の内部契約を変更しない。

---

# 2. Pipeline Model（Processing Flow）

本節は処理フローを表す。依存方向ではない。

```text
Orchestrator
    ↓
EventRouter
    ↓
EventQueue（保持境界）
    ↓
Scheduler
    ↓
EventDispatch
    ↓
Lifecycle
    ↓
StateMachine
    ↓
TransitionRule
    ↓
returns LifecycleResult
    ↓
Orchestrator（ExecutionContext 更新）
```

補足：

* EventQueue は保持境界であり、処理ステージではない。
  * EventRouter は Trigger を「生成」する
  * EventQueue は Trigger を「保持」する
  * Scheduler は Trigger を「消費」する

---

# 3. Stage Contracts（Frozen Baseline の参照）

本章は各 Stage の責務を再定義するものではなく、
ASA-ARCH-20.1〜20.5 の Frozen Contract を要約・参照するだけである。

正式な契約は Frozen Baseline を唯一のソースとする。

## 3.1 Orchestrator（20.1）

* ExecutionContext の唯一の所有者
* Pipeline の開始・終了責務を持つ
* LifecycleResult に基づき状態更新を行う

## 3.2 EventRouter（20.5）

* RawEvent → LifecycleTrigger の正規化
* Runtime における唯一の正規化境界

## 3.3 EventQueue（20.5）

* LifecycleTrigger の保持のみ
* 順序制御は行わない

## 3.4 Scheduler（20.3）

* 実行順序の決定
* EventQueue から Trigger を取り出す

## 3.5 EventDispatch（20.5）

* Lifecycle への委譲
* LifecycleResult を Orchestrator へ返却

## 3.6 Lifecycle（20.4）

* 遷移要求の受付
* StateMachine への委譲

## 3.7 StateMachine（20.4）

* Rule の探索・選択・適用

## 3.8 TransitionRule（20.4）

* 遷移の純粋実行

## 3.9 LifecycleResult（20.4）

* next_state / status / transition_id / metadata
* Orchestrator が ExecutionContext を更新するための唯一の入力

---

# 4. Behavioral Contracts

## BC-20.6-001 — Pipeline Determinism

Pipeline Inputs は、
Frozen Baseline（20.1〜20.5）が各 Stage に対して定義する入力契約の集合である。

Frozen Baseline の決定性契約が満たされる限り、
Pipeline 全体としても決定性を維持する。

## BC-20.6-002 — Pipeline Statelessness

Pipeline 自体は状態を保持しない。
状態は ExecutionContext のみが保持する（20.1）。

## BC-20.6-003 — Pipeline Responsibility

Pipeline は Stage を接続する責務のみを持つ。

Pipeline は以下の責務を持たない：

* Policy 評価
* Rule 選択
* Scheduler 実装
* ExecutionContext 所有
* Transition 実行責務（TransitionRule が担当）

## BC-20.6-004 — Error Propagation Boundary

Pipeline は Stage の正常終了・異常終了契約に従い、
後続 Stage への伝播可否を変更しない。

例：

* EventRouter が validate に失敗した場合、Trigger は生成されず EventQueue に渡らない。
* Pipeline はこの挙動を変更しない。

## BC-20.6-005 — Context Update Timing

ExecutionContext の更新は Pipeline の終端である Orchestrator の責務であり、
Pipeline 内の他 Stage は ExecutionContext を変更しない。

---

# 5. Integration Contracts

## IC-20.6-001 — Frozen Baseline Integration

Pipeline は 20.0〜20.5 の Frozen Contract をそのまま利用する。
変更・拡張・再定義は禁止。

## IC-20.6-002 — Stage Boundary Preservation

Pipeline は Stage の境界を変更しない。
Stage の責務は Frozen Baseline に従う。

## IC-20.6-003 — Dependency Direction（依存方向）

依存方向は以下に固定する：

```text
Orchestrator → EventRouter → EventQueue → Scheduler → EventDispatch → Lifecycle → StateMachine → TransitionRule
```

補足：

* LifecycleResult は Value Object であり、依存方向には含めない。
* Stage 間の逆方向依存および循環依存は禁止される。

## IC-20.6-004 — End-to-End Flow Consistency

20.6 は現行 Pipeline の構成を定義対象とする。

構成変更（Stage 追加・削除）は 20.7 以降で再定義される。

## IC-20.6-005 — TransitionRule 拡張の影響

TransitionRule の追加・変更は Pipeline Contract に影響を与えない。
Pipeline は Stage 接続のみを保証する。

## IC-20.6-006 — Pipeline Composition

Pipeline は Frozen Baseline で定義された Stage を
順序付けて接続した論理構造である。

Pipeline は Stage を包含するが、
Stage を所有しない。

## IC-20.6-007 — Pipeline Lifecycle & Ownership

### Pipeline Lifecycle

* Pipeline は Orchestrator によって開始される。
* LifecycleResult が返却された時点で Pipeline は終了する。

### Pipeline Ownership

* Pipeline は ExecutionContext を所有しない。
* ExecutionContext の唯一の所有者は Orchestrator である。

---

# 6. Extension Contracts

## EX-20.6-001 — Stage Implementation Replacement

Stage の Implementation は変更可能である。
ただし Frozen Baseline が定義する Contract を完全に維持する限りにおいてのみ許可される。

## EX-20.6-002 — Pipeline Augmentation

Pipeline に新しい Stage を追加する場合は、
20.7 以降の Architecture Contract として扱う。

## EX-20.6-003 — Multi-Event Extensions

Multi-Event Dispatch / Coalescing / Debouncing / Backpressure は
20.6 の対象外であり、20.7 以降で定義する。

---

# 7. Architecture Summary

## AS-20.6-001 — Pipeline の位置付け

Runtime Pipeline は ASA Runtime の
統合処理構造を表す Architecture Concept である。

20.0〜20.5 の Stage を
一つのエンドツーエンド処理フローとして接続する。

## AS-20.6-002 — Responsibility Boundary

Pipeline は接続責務のみを持ち、
各 Stage の内部契約には介入しない。

## AS-20.6-003 — Dependency Direction

Pipeline は上流 Stage のみに依存し、
逆方向依存および循環依存は禁止される。

## AS-20.6-004 — Determinism

Frozen Baseline の決定性契約が満たされる限り、
Pipeline 全体としても決定性を維持する。

## AS-20.6-005 — Extension Strategy

Pipeline の拡張（新 Stage / Multi-Event / Backpressure など）は
20.7 以降で扱う。

20.6 は現行 Runtime の統合構造を固定するフェーズである。

---

**End of ASA-ARCH-20.6 Runtime Pipeline — Architecture Specification（Draft 0.5 / Frozen）**
