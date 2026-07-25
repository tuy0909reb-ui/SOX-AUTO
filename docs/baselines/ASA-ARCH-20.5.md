# Architecture Baseline – ASA-ARCH-20.5

**Baseline ID:** ASA-ARCH-20.5  
**Title:** Runtime Event System  
**Version:** Draft 1.0（Phase 20.5 Frozen / Accepted）  
**Status:** Closed — Frozen / Accepted  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.4（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.5.md`  

**Implementation:** ASA-IMPL-REQ-ARCH-20.5-001  
**Acceptance:** ASA-VERIFY-ARCH-20.5-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-20.5-001  
**Freeze Identifier:** ARCH-20.5-FREEZE  
**Git tag:** `arch-20.5-freeze`  
**Freeze Date:** 2026-07-26  
**Production:** `auto-scribe-ai/src/runtime_event/`  
**Lifecycle dependency（frozen）:** `auto-scribe-ai/src/runtime_lifecycle/`  
**Architecture Tests:** `auto-scribe-ai/tests/architecture/runtime_event/`  

---

## 0. Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance | ASA-VERIFY-ARCH-20.5-ACCEPTANCE-001 — PASSED |
| Architecture Tests | **42 passed** |
| Regression | **910 passed** |
| 20.3 / 20.4 checksums | UNCHANGED |
| Blocking Issues | NONE |

### 0.1 Production Source Checksums（frozen）— `runtime_event/`

```text
8ff3189c973222f86d4f20b2f93763dc9104920ff121b671e759cc15b0d516b0  __init__.py
bfcaf53ef806bdca0ee07e5ae06fb14b7258168549e108df1d0c3f385a859023  dispatch.py
f283b20c67bf2fe0a0d2a43565e039ac60aec7627167b1dec6e82be22b4c09ee  exceptions.py
276183f5cf405e0e6c4fa3dcbb380c8944445e0708fb6cf942a8f3d87ff31f96  models.py
77079358ca5df0ea1fe5e3557750b1f3299397cedc3a195745a8948626252ffd  ordering.py
72903bc00f88bbbac3821bb4a3df3b73b5907d6a2aa78a251dbfc077799b3ee7  pipeline.py
901127f0ecd41b0ad23e5c50c98f4cc8a5aa8f6b7e237655f56517b330824f3e  queue.py
d732efbaf54ddc76f9285ad79c13de5c6d9e659201d1257cdcd9dba7984d56bd  router.py
```

### 0.2 Freeze Rule

```text
Architecture 20.5 Runtime Event System SHALL be immutable.
Future event-system expansions SHALL NOT mutate Phase 20.5
except through Change Requests that supersede via a later Architecture phase.
```

---

# ASA-ARCH-20.5 Runtime Event System — Architecture Specification Draft 1.0（Freeze）

---

# 1. Scope

本仕様は以下を対象とする。

* RawEvent（外部・内部から流入する未正規化イベント）
* EventRouter（RawEvent → LifecycleTrigger の正規化）
* EventQueue（正規化済みイベントの保持）
* EventDispatch（Lifecycle への引き渡し）

対象外：

* Lifecycle の状態遷移（20.4）
* PolicyResolver の評価（20.2）
* RuntimeScheduler のスケジューリング（20.3）
* Orchestrator の状態更新（20.1）
* 永続化・ログ・Telemetry

---

# 2. Type Contracts

## TC-20.5-001 — RawEvent

RawEvent は Runtime Event System に流入するイベントの入力表現である。

### 契約

* RawEvent は外部システムでは意味論を持つ。
* ASA Runtime 内では EventRouter による正規化前には意味論を保証しない。
* RawEvent は「正規化前の入力」として扱う。

---

## TC-20.5-002 — EventType

EventType は RawEvent の分類を表す Value Object である。

### 契約

* 値比較である。
* 拡張可能である。
* EventType と LifecycleTriggerType は 1:1 でなくてもよい。

---

## TC-20.5-003 — EventPayload

EventPayload は RawEvent に付随するデータである。

### 契約

* EventRouter が解釈する。
* Lifecycle は EventPayload の構造・意味論に依存しない（20.4）。

---

## TC-20.5-004 — LifecycleTrigger（20.4 継承）

LifecycleTrigger は 20.5 の最終出力である。

### 構造

* `type: LifecycleTriggerType`
* `payload: Payload`（EventPayload から構築）

### 契約

* Lifecycle は `type` のみで遷移判断する。
* `payload` の解釈は TransitionRule の責務とする。

---

# 3. Structural Contracts

## SC-20.5-001 — EventRouter の責務

EventRouter は RawEvent を LifecycleTrigger に正規化する。

### 責務

1. **parse** — RawEvent から EventType / EventPayload を抽出する
2. **validate** — RawEvent が EventSystem の契約に適合するか検証する
3. **map** — EventType を LifecycleTriggerType に対応付ける
4. **construct** — LifecycleTrigger を構築する

### 契約

* EventRouter は正規化と検証のみを担当する。
* 状態遷移・Policy 評価・Scheduler 参照は行わない。
* EventRouter は Runtime における唯一の正規化境界である。

---

## SC-20.5-002 — EventQueue の責務

EventQueue は正規化済み LifecycleTrigger を一時保持する。

### 契約

* EventQueue は LifecycleTrigger のみを保持する。
* RawEvent は保持しない。
* EventQueue は順序制御を行わない（実行順序は Scheduler の責務）。
* EventQueue は Lifecycle を呼び出さない。
* EventQueue は StateMachine を呼び出さない。

---

## SC-20.5-003 — EventDispatch の責務

EventDispatch は LifecycleTrigger を Lifecycle に渡す。

### 契約

* EventDispatch は Lifecycle の遷移操作を呼び出す。
* EventDispatch は LifecycleResult を解釈・変更しない。
* EventDispatch は ExecutionContext を変更しない。
* EventDispatch は LifecycleResult を Orchestrator へ返却する。

---

# 4. Behavioral Contracts

## BC-20.5-001 — Deterministic Normalization

### 契約

* 同値な RawEvent は同値な LifecycleTrigger に正規化される。

---

## BC-20.5-002 — RawEvent → LifecycleTrigger の一意性

### 契約

* 各 RawEvent はちょうど 1 つの LifecycleTrigger に正規化される。
* 複数の EventType が同じ LifecycleTriggerType に正規化されてもよい。
* 1つの RawEvent が複数の LifecycleTrigger に分岐することは契約違反である。

---

## BC-20.5-003 — TimeoutSignal

### 契約

* Timeout 系 RawEvent は LifecycleTriggerType("Timeout") に正規化される。
* Timeout の意味論は TransitionRule が担当する。

---

## BC-20.5-004 — CancellationSignal

### 契約

* Cancel 系 RawEvent は LifecycleTriggerType("Cancellation") に正規化される。
* Cancellation の意味論は TransitionRule が担当する。

---

## BC-20.5-005 — ExternalSignal

### 契約

* 外部入力 RawEvent は LifecycleTriggerType("ExternalSignal") に正規化される。
* payload は EventRouter が構築する。
* Lifecycle は payload を解釈しない。

---

## BC-20.5-006 — EventDispatch の純粋性

### 契約

* EventDispatch は Lifecycle の遷移操作を呼び出すだけである。
* LifecycleResult を変更しない。
* 状態を保持しない。
* LifecycleResult を Orchestrator へ返却することで責務を完了する。

---

## BC-20.5-007 — Invalid RawEvent の扱い

### 契約

* validate に失敗した RawEvent は Lifecycle に渡されない。
* 失敗時の扱い（Discard / ErrorTrigger / FailureResult など）は実装契約とする。
* Architecture Contract は「Lifecycle に渡さない」ことのみ保証する。

---

# 5. Integration Contracts（20.4 との整合）

## IC-20.5-001 — LifecycleTrigger の唯一性

### 契約

* 20.5 の出力は常に LifecycleTrigger である。
* Lifecycle は RawEvent を直接扱わない。

---

## IC-20.5-002 — payload 境界

### 契約

* EventRouter は payload を構築する。
* Lifecycle は payload を解釈しない。
* payload の意味論は TransitionRule の責務であり、20.4 の契約を変更しない。

---

## IC-20.5-003 — AmbiguousTransition

### 契約

* EventRouter は 1つの RawEvent から複数の LifecycleTrigger を生成しない。
* AmbiguousTransition は 20.4 の Rule 選択時にのみ発生する。
* 20.5 は Rule 選択に関与しない。

---

## IC-20.5-004 — TerminalState

### 契約

* TerminalState に対する EventDispatch は Lifecycle が InvalidTransition を返すことで処理される。
* EventSystem は TerminalState を直接認識しない。

---

## IC-20.5-005 — TransitionRule 追加の影響

### 契約

* TransitionRule の追加・変更は 20.5 Event System の契約へ影響を与えない。
* EventRouter / EventQueue / EventDispatch の責務は TransitionRule の拡張によって変化しない。

---

# 6. Extension Contracts

## EX-20.5-001 — 新しい EventType の追加

### 契約

* 新しい RawEvent / EventType を追加しても、EventRouter が LifecycleTrigger に正規化できれば 20.5 の契約は維持される。

---

## EX-20.5-002 — 新しい LifecycleTriggerType の追加

### 契約

* LifecycleTriggerType は拡張可能である。
* EventRouter が新しい TriggerType を生成できれば、20.4 の Lifecycle 契約は破綻しない。

---

## EX-20.5-003 — 新しい Signal の追加

### 契約

* Timeout / Cancellation / External に加えて、RetrySignal / BackoffSignal / HeartbeatSignal など新しい Signal を追加可能である。
* 追加 Signal の意味論は TransitionRule 側で定義される。

---

## EX-20.5-004 — EventQueue の拡張

### 契約

* EventQueue の内部構造（FIFO / PriorityQueue など）は実装契約とする。
* Architecture Contract は「LifecycleTrigger を保持する」ことのみ保証する。

---

# 7. Architecture Summary

## AS-20.5-001 — Runtime Processing Flow

本節の図は「依存方向」ではなく「処理フロー」を表す。

```text
Orchestrator
    │
    ▼
EventRouter
    │
    ▼
LifecycleTrigger
    │
    ▼
EventQueue
    │
    ▼
Scheduler (20.3)
    │
    ▼
EventDispatch
    │
    ▼
Lifecycle (20.4)
    │
    ▼
StateMachine
    │
    ▼
TransitionRule
    │
    ▼
LifecycleResult
    │
    ▼
Orchestrator が ExecutionContext を更新
```

---

## AS-20.5-002 — 責務境界

### 契約

* **EventRouter:** RawEvent → LifecycleTrigger の正規化＋検証（唯一の正規化境界）
* **EventQueue:** LifecycleTrigger の保持のみ
* **Scheduler:** 実行順序の決定（20.3）
* **EventDispatch:** Lifecycle への委譲＋結果の Orchestrator への返却
* **Lifecycle:** 遷移要求の受付（20.4）
* **StateMachine:** Rule 選択（20.4）
* **TransitionRule:** 遷移実行（20.4）
* **Orchestrator:** ExecutionContext の更新（20.1）

---

## AS-20.5-003 — 依存方向

### 契約

* 依存方向は一方向である。

```text
Orchestrator → EventRouter → EventQueue → Scheduler → EventDispatch → Lifecycle → StateMachine → TransitionRule
```

* 逆方向依存は禁止する。

---

**End of ASA-ARCH-20.5 Runtime Event System — Architecture Specification（Draft 1.0 / Frozen）**
