# Architecture Baseline – ASA-ARCH-20.4

**Baseline ID:** ASA-ARCH-20.4  
**Title:** Runtime Lifecycle（Architecture Test Specification）  
**Version:** Draft 1.1（Phase 20.4 Frozen / Accepted）  
**Status:** Closed — Frozen / Accepted  
**Category:** Architecture Evolution  
**Document Type:** Architecture Baseline  
**Previous Baseline:** ASA-ARCH-20.3（Frozen / Accepted）  
**Registry Path:** `docs/baselines/ASA-ARCH-20.4.md`  

**Acceptance:** ASA-VERIFY-ARCH-20.4-ACCEPTANCE-001 — **PASSED（ACCEPTED）**  
**Freeze:** ASA-FREEZE-ARCH-20.4-001  
**Freeze Identifier:** ARCH-20.4-FREEZE  
**Git tag:** `arch-20.4-freeze`  
**Freeze Date:** 2026-07-25  
**Production:** `auto-scribe-ai/src/runtime_lifecycle/`  
**Architecture Tests:** `auto-scribe-ai/tests/architecture/runtime_lifecycle/`  

---

## 0. Acceptance & Freeze Record

| Field | Value |
|---|---|
| Acceptance | ASA-VERIFY-ARCH-20.4-ACCEPTANCE-001 — PASSED |
| Architecture Tests | **50 passed** |
| Regression | **900 passed** |
| 20.0 / 20.3 checksums | UNCHANGED |
| Blocking Issues | NONE |

### 0.1 Production Source Checksums（frozen）— `runtime_lifecycle/`

```text
c1a602828749078e13f3474f5b062abe03bb18dc6bd36d094479075a7f6c8194  __init__.py
0e7c3f5594646ccf741407257f60bc285fce07afe393ac40de63c6d5517517ad  exceptions.py
04521fda2e06fabe80b1498d03ff4cc7ddd0138b2ad1863983e699674466d69d  lifecycle.py
e0bac899df81ce87cef5162e8dfa9a7e30e471499b09ce59fbd795f9a849f47c  models.py
fd8c403df9cddb41fa6d28e5869b29b2ba5141ce0c57dc2385a18c0f876fa796  rules.py
722bdbfc844032cc28c7e7f4ecab936b35724736d7f40c6118584696aa4496b1  state_machine.py
```

### 0.2 Freeze Rule

```text
Architecture 20.4 Runtime Lifecycle SHALL be immutable.
Future lifecycle expansions SHALL NOT mutate Phase 20.4
except through Change Requests that supersede via a later Architecture phase.
```

---

# ASA-ARCH-20.4 Runtime Lifecycle — Architecture Test Specification

## Draft 1.1（Normative — Frozen）

20.4 Runtime Lifecycle の責務境界・決定性・依存方向・状態遷移契約を、実装非依存の Architecture Contract として定義する。

本仕様は ASA-ARCH 20.0〜20.3 の契約を継承し、それらを Runtime Lifecycle に適用する。

---

# 1. Scope

本仕様は以下の責務のみを対象とする。

* Runtime Lifecycle
* StateMachine
* TransitionRule
* LifecycleResult

以下は対象外とする。

* Orchestrator の状態更新
* PolicyResolver の評価
* RuntimeScheduler のスケジューリング
* 実装言語
* 永続化
* ログ出力
* Telemetry

---

# 2. Type Contracts

## TC-20.4-001 — ExecutionStateType

ExecutionStateType は ExecutionState の種類を識別する Value Object である。

### 契約

* 値によって等価性を判定する
* 参照同一性を要求しない
* 新しい StateType を追加可能である

---

## TC-20.4-002 — ExecutionState

ExecutionState は Runtime の現在状態を表現する Value Object である。

### 保持する情報

* type
* metadata

### 契約

* 等価性は type と metadata により決定される
* Immutable として扱う

---

## TC-20.4-003 — LifecycleTriggerType

LifecycleTriggerType は遷移契機を識別する Value Object である。

### 例

* RuntimeEvent
* Timeout
* Cancellation
* ExternalSignal

### 契約

* 値で比較する
* 将来追加可能

---

## TC-20.4-004 — LifecycleTrigger

LifecycleTrigger は状態遷移要求を表す Value Object である。

### 保持する情報

* type
* payload

### 契約

* payload は Trigger の付帯情報である
* Lifecycle は payload の構造へ依存しない

---

## TC-20.4-005 — LifecycleStatus

LifecycleStatus は遷移結果を表現する Value Object である。

### 最低限保証される状態

* Success
* Rejected
* InvalidTransition
* Ambiguous Transition

### 契約

* 値比較である
* 将来拡張可能
* 既存状態の意味論を変更してはならない

---

## TC-20.4-006 — TransitionId

TransitionId は適用された TransitionRule を識別する Value Object である。

### 契約

* Rule を識別する
* 表現形式は Architecture の対象外
* 一意性の範囲は StateMachine 内とする

---

## TC-20.4-007 — LifecycleResult

LifecycleResult は Lifecycle の唯一の出力である。

### 保持する情報

* next_state
* status
* transition_id
* metadata

### 契約

* Immutable
* Value Object
* Runtime 状態を保持しない

---

# 3. Structural Contract Tests

## SC-20.4-001 — Lifecycle は Stateless

Lifecycle は Runtime State を保持してはならない。

### 保持禁止

* ExecutionContext
* ExecutionState
* Scheduler 情報
* PolicyEvaluationResult
* 過去の LifecycleResult
* mutable cache
* transition history

### 保証

Lifecycle は入力から結果を生成するだけである。

---

## SC-20.4-002 — Lifecycle は Runtime Owner ではない

Lifecycle は Runtime 状態を所有しない。

ExecutionContext の所有者は Orchestrator である。

---

## SC-20.4-003 — Lifecycle の責務

Lifecycle の責務は

### 入力

* current
* trigger
* policy

から

LifecycleResult

を返却することである。

その他の責務を持たない。

---

## SC-20.4-004 — StateMachine の責務

StateMachine は

* Rule の評価
* Rule の適用可否判定
* Rule の決定
* LifecycleResult の生成

を担当する。

評価・決定の意味論および適用手順は
TransitionRule / StateMachine Contract Tests に従う。

ExecutionContext は保持しない。

---

## SC-20.4-005 — TransitionRule の責務

TransitionRule は

* can_apply
* apply

のみを提供する。

Rule 同士の競合解決は担当しない。

---

# 4. Behavioral Contract Tests

## BC-20.4-001 — 決定的評価

Lifecycle は同一入力に対して同一の制御結果を返却しなければならない。

### 入力

* current
* trigger
* policy

### 保証

同一入力に対する LifecycleResult の制御上の等価性は

* next_state
* status
* transition_id

において一致する。

metadata の差異は制御等価性に影響しない。

---

## BC-20.4-002 — 入力不変性

Lifecycle は入力を変更してはならない。

### 変更禁止対象

* current
* trigger
* policy

### 保証

評価前後で入力の値等価性が維持される。

---

## BC-20.4-003 — 副作用禁止

Lifecycle は副作用を持ってはならない。

### 禁止

* ExecutionContext の更新
* Orchestrator への状態反映
* PolicyResolver の評価実行
* RuntimeScheduler の呼び出し
* 永続化
* 外部 I/O

### 保証

Lifecycle の唯一の出力は LifecycleResult である。

---

## BC-20.4-004 — Metadata 非制御

Lifecycle は metadata を制御判断に用いてはならない。

### 禁止用途

* Rule 選択
* 状態遷移可否の判定
* status の決定

### 許可用途

* 診断
* 監査
* デバッグ
* 可観測性

本契約は LR-20.4-006 と整合する。

---

## BC-20.4-005 — 単一出力

Lifecycle の出力は LifecycleResult のみである。

### 保証

* 追加の制御チャネルを持たない
* Runtime State を返却しない
* ExecutionContext を返却しない

---

## BC-20.4-006 — Status 意味論の保持

Lifecycle が返却する LifecycleStatus は

* Success
* Rejected
* InvalidTransition
* Ambiguous Transition

の意味論に従う。

Success / Rejected / InvalidTransition の意味は LifecycleResult Contract Tests に従う。

Ambiguous Transition の意味は TransitionRule / StateMachine Contract Tests に従う。

既存 status の意味論を変更してはならない。

---

# 5. TransitionRule / StateMachine Contract Tests

## TR-20.4-001 — TransitionRule.can_apply

can_apply は Rule の適用可否を判定する純粋関数である。

### 契約

* 入力のみから結果を決定する
* 副作用を持たない
* Runtime State を変更しない
* ExecutionContext を変更しない

---

## TR-20.4-002 — TransitionRule.apply

apply は状態遷移を実行し LifecycleResult を生成する純粋関数である。

### 契約

* 入力のみから LifecycleResult を生成する
* ExecutionContext を変更しない
* RuntimeScheduler を変更しない
* PolicyResolver を呼び出さない
* Runtime 外部状態を変更しない

---

## TR-20.4-003 — apply の事前条件

apply は

can_apply(current, trigger, policy)

が True を返した Rule に対してのみ呼び出される。

False を返した Rule に対して apply を実行することは契約違反である。

---

## TR-20.4-004 — Rule Evaluation

StateMachine は入力に対して Rule を評価する。

評価結果は次のいずれかである。

* 適用可能 Rule が存在しない
* 適用可能 Rule が一件存在する
* 適用可能 Rule が複数存在する

StateMachine は常に評価結果を一意に決定できなければならない。

---

## TR-20.4-005 — Rule Selection Semantics

StateMachine が保証する意味論は次のとおりである。

### Rule が存在しない

Rejected

### Rule が一件存在する

Success

### Rule が複数存在する

Ambiguous Transition

Architecture が保証するのはここまでとする。

Rule の探索順序

Rule の優先順位

Rule の競合解決方法

Rule の探索アルゴリズム

は実装契約とする。

---

## TR-20.4-006 — Lifecycle Boundary

Lifecycle は Rule を直接探索しない。

Lifecycle は Rule を直接実行しない。

Lifecycle は StateMachine へ評価を委譲し、

返却された LifecycleResult を変更せず、そのまま返却する。

---

## TR-20.4-007 — StateMachine Responsibility

StateMachine は次の責務のみを持つ。

* Rule の評価
* Rule の適用可否判定
* Rule の決定
* LifecycleResult の生成

ExecutionContext の所有

ExecutionContext の更新

Policy の評価

Scheduler 制御

は責務に含まれない。

---

## TR-20.4-008 — TransitionRule Collection

StateMachine は構成済みの TransitionRule 集合を保持する。

### 契約

* Rule 集合は構成後に変更されない
* Rule の追加・削除は Runtime 中に行わない
* 空集合を許容する

空集合の場合

評価結果は常に Rejected となる。

---

# 6. LifecycleResult Contract Tests

## LR-20.4-001 — LifecycleResult は Value Object

LifecycleResult は Runtime の制御結果を表現する Value Object である。

### 保持する情報

* next_state
* status
* transition_id
* metadata

### 契約

* Immutable
* 値による等価性
* Runtime State を保持しない

---

## LR-20.4-002 — LifecycleResult の等価性

LifecycleResult の制御上の等価性は

* next_state
* status
* transition_id

によって定義される。

metadata は診断情報であり、

制御状態の等価性には影響しない。

---

## LR-20.4-003 — Success

Success は

適用可能な TransitionRule が一件存在し、

正常に状態遷移が実行されたことを意味する。

### Success の契約

* next_state は Rule が生成した状態である
* transition_id は適用 Rule を識別する
* Rule は一件だけ適用される

---

## LR-20.4-004 — Rejected

Rejected は

構造上は遷移可能であるが、

適用可能な Rule が存在しない

ことを意味する。

### Rejected の契約

* next_state は current と同値
* Rule は適用されない
* Runtime State は変更されない
* transition_id は「遷移なし」を識別できること

具体的な表現形式は実装契約とする。

---

## LR-20.4-005 — InvalidTransition

InvalidTransition は

構造的に遷移が禁止されていることを意味する。

### 例

* Terminal State
* 禁止された状態遷移

### InvalidTransition の契約

* next_state は current と同値
* Rule は適用されない
* Runtime State は変更されない
* transition_id は「遷移なし」を識別できること

具体的な表現形式は実装契約とする。

---

## LR-20.4-006 — metadata

metadata は補助情報のみを保持する。

### 用途

* 診断
* 監査
* デバッグ
* 可観測性

### 契約

metadata は

* Rule 選択
* 制御判断
* 状態遷移

には使用してはならない。

---

# 7. Trigger / Payload Contract Tests

## TG-20.4-001 — Trigger Boundary

Lifecycle は

LifecycleTrigger を StateMachine へ委譲する。

Lifecycle 自身は Trigger の意味論を持たない。

---

## TG-20.4-002 — Payload Boundary

payload の解釈は

TransitionRule の責務である。

Lifecycle は payload の内容に依存してはならない。

---

## TG-20.4-003 — Payload Compatibility

payload の構造変更は

Lifecycle の契約へ影響を与えてはならない。

Trigger の拡張によって

Lifecycle の責務は変化しない。

---

# 8. Extension Contract Tests

## EX-20.4-001 — ExecutionStateType の拡張

新しい ExecutionStateType を追加しても

* Lifecycle
* StateMachine
* TransitionRule

の責務境界は変化しない。

新しい状態に対する挙動は

Rule 定義によって決定される。

---

## EX-20.4-002 — LifecycleTriggerType の拡張

新しい LifecycleTriggerType を追加しても

Lifecycle の責務は変化しない。

対応する Rule が存在しない場合は

Rejected

または禁止遷移契約に従って評価される。

---

## EX-20.4-003 — LifecycleStatus の拡張

LifecycleStatus は将来拡張可能である。

ただし

* Success
* Rejected
* InvalidTransition
* Ambiguous Transition

の意味論を変更してはならない。

---

## EX-20.4-004 — TransitionRule の追加

TransitionRule を追加しても

Lifecycle の責務は変化しない。

Rule の追加は

StateMachine の構成変更のみで実現できること。

---

## EX-20.4-005 — StateMachine の構成変更

StateMachine は

構成時の Rule 集合変更によって拡張可能である。

Architecture が保証するのは

* Rule の評価
* Rule の適用可否判定
* Rule の決定
* LifecycleResult の生成

および TR-20.4-005 の選択意味論のみであり、

Rule の探索順序

Rule の優先順位

Rule の競合解決方法

Rule の探索アルゴリズム

は実装契約とする。

Runtime 中の Rule 追加・削除は TR-20.4-008 に従い禁止する。

---

# 9. Orchestrator Boundary Tests

## OC-20.4-001 — Lifecycle の責務境界

Lifecycle は

LifecycleResult を返却する。

ExecutionContext の更新は行わない。

---

## OC-20.4-002 — Orchestrator の責務

ExecutionContext の更新は

Orchestrator の責務である。

Lifecycle は

ExecutionContext の所有権を持たない。

---

## OC-20.4-003 — Policy Boundary

Policy の評価は

PolicyResolver の責務である。

Lifecycle は評価済みの結果のみを利用する。

---

## OC-20.4-004 — Scheduler Boundary

Scheduler は

* 実行順序
* 優先順位
* 再試行
* Dispatch
* Queue

など Runtime 実行戦略を担当する。

Lifecycle はこれらへ依存しない。

---

# 10. Determinism / Dependency Contract Tests

## DD-20.4-001 — 決定性境界

Lifecycle / StateMachine / TransitionRule の制御結果は決定的である。

### 保証

同一の

* current
* trigger
* policy
* StateMachine 構成

に対して、制御上の LifecycleResult は一致する。

本契約は BC-20.4-001 および LR-20.4-002 と整合する。

---

## DD-20.4-002 — 依存方向

依存は常に上位から下位への一方向である。

### 許可

* Lifecycle → StateMachine → TransitionRule
* Lifecycle は評価済み policy を入力として受け取る

### 禁止

* Lifecycle → Orchestrator 状態更新
* Lifecycle → PolicyResolver 評価実行
* Lifecycle → RuntimeScheduler
* Core / Orchestration / Policy / Scheduler への逆流依存

---

## DD-20.4-003 — 20.0〜20.3 契約の継承

本仕様は次を継承する。

* 20.0 Core — ExecutionContext 所有と決定性
* 20.1 Orchestration Boundary — Orchestrator が唯一の協調点
* 20.2 Policy — 判断のみ / 評価済み結果の利用
* 20.3 Scheduler — 実行戦略は Lifecycle の対象外

Lifecycle はこれらの契約を侵食してはならない。

---

## DD-20.4-004 — 適合性総括

Runtime Lifecycle Architecture Contract が保証するのは次のみである。

* 責務境界
* 状態遷移契約
* 決定性
* 依存方向
* 拡張可能性

実装言語、永続化、ログ、Telemetry、具体的 Rule 選択アルゴリズムは対象外である。

---

**End of ASA-ARCH-20.4 Runtime Lifecycle — Architecture Test Specification（Draft 1.1 / Frozen）**
