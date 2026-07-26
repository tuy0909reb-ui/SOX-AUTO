# ASA-ARCH-20.9.0 — Orchestration Core Specification (Draft 1.3 / Freeze Candidate)

**Architecture ID:** ASA-ARCH-20.9.0  
**Formal Name:** Orchestration Core Specification  
**Version:** 1.0  
**Source:** Draft 1.3 / Freeze Candidate  
**Baseline:** `docs/baselines/ASA-ARCH-20.9.0.md`  
**Status:** REGISTERED

本仕様はレビュー済み Draft 1.3（Freeze Candidate）をそのまま登録する。  
仕様の意味を変更しない。

---

## 1. スコープと前提

**スコープ:**

- ASA-ARCH-20.8 Runtime Execution Layer（Frozen）を変更せず、その上位に **Execution Orchestration Layer** を追加する。

**前提:**

- Frozen Contracts: `INV / DEP / RB / DET / SEM / ERR / FLC`
- Frozen Structures: Runtime Model / Multi-Event Runtime / Runtime Execution Layer
- `ExecutionLayerInput` のみ Non-Frozen

**20.9 の目的:**

- Frozen契約を侵さずに、Runtime Execution Layerの上位制御レイヤーを追加する。
- 21.0 LTS Freeze のための最終アーキテクチャ骨格を確立する。

---

# 2. コンポーネント一覧

- **Orchestrator**
- **OrchestrationContext**
- **ExecutionGraph**

設計上の概念（将来拡張）：

- ExecutionGraphBuilder（純関数）
- GraphValidator（非破壊）
- ErrorPolicy（Graph非変更）

---

# 3. Orchestrator

## 3.1 インターフェース

```ts
interface Orchestrator {
    initialize(plan: RuntimePlan): void;
    execute(): Promise<OrchestrationResult>;
    shutdown(): void;
}
```

---

## 3.2 状態機械（State Machine）

```text
Created
  ↓
Initialized
  ↓
Ready
  ↓
Running
  ↓
Completed
  ↓
Shutdown
```

異常系：

```text
Created
  ↓
Failed
  ↓
Shutdown
```

---

## 3.3 initialize(plan) の契約

### 正常系

```text
Created
  ↓ initialize成功
Initialized
  ↓
Ready
```

### 異常系

```text
Created
  ↓ initialize失敗
Failed
```

### 呼び出し条件

- `initialize()` は **Created状態からのみ**呼び出し可能。
- `Failed` 状態からの再初期化は禁止。

---

## 3.4 Ready状態の定義（Freeze契約）

> **Ready状態は次の条件をすべて満たす：**
>
> 1. ExecutionGraphBuilder により Graph が生成済み  
> 2. GraphValidator により Graph が検証済み  
> 3. OrchestrationContext が初期化済み  
> 4. 必要な ExecutionEngine がすべて生成済み  
> 5. いずれも成功し、副作用なく完了している

---

## 3.5 Initialization Sequence（Freeze前確認事項の反映）

```text
initialize(plan)

    1. ExecutionGraphBuilder
         - RuntimePlan → ExecutionGraph（純関数）
         - Immutable DAG を生成

    2. GraphValidator
         - Graph を検証
         - Validator は Graph を変更しない
         - 失敗時は initialize() 失敗 → Failed

    3. Create OrchestrationContext
         - Orchestratorのみが変更可能

    4. Create ExecutionEngines
         - Engine SHALL be fully constructed before Ready.

    5. Readyへ遷移
```

---

## 3.6 execute() の契約

- `execute()` は **Ready状態からのみ**呼び出し可能。
- `execute()` は **1ライフサイクルにつき1回のみ**。
- `Running` 状態での再呼び出しは禁止。
- `Completed` / `Failed` 状態からの呼び出しは禁止。

### 重要契約

> **execute() SHALL NOT implicitly invoke shutdown().**

---

## 3.7 shutdown() の契約

> **shutdown() SHALL be idempotent.**

- `Initialized` / `Ready` / `Running` / `Completed` / `Failed` から呼び出し可能。
- 2回目以降の呼び出しは状態・内部構造に変化を与えない。
- `Shutdown` 状態では `execute()` / `initialize()` は禁止。

---

# 4. OrchestrationContext

## 4.1 役割

- Orchestratorが管理する上位コンテキスト。
- 実行状態・イベント履歴・エラー情報を保持する。

## 4.2 インターフェース

```ts
interface OrchestrationContext {
    state: OrchestrationState;
    events: EventRecord[];
    errors: ErrorRecord[];
    startTime: number;
    endTime?: number;
    snapshot(): OrchestrationSnapshot;
}
```

---

## 4.3 更新責務（Freeze契約）

> **Only Orchestrator may mutate OrchestrationContext.**

Engineはイベント通知のみ。  
Context更新はOrchestratorの専権。

---

## 4.4 Snapshot契約

> **Snapshot SHALL NOT reference mutable internal state.**

- Snapshotは不変。
- Context更新後もSnapshotは変化しない。
- SnapshotはRunning中でも取得可能。

---

# 5. ExecutionGraph

## 5.1 契約（最重要）

> **ExecutionGraph shall be an immutable Directed Acyclic Graph.**

### Immutable の厳密定義

> **ExecutionGraph and all contained nodes and edges SHALL be immutable after construction.**

- ノード・エッジの追加・削除・変更禁止
- ノード内部フィールドも変更禁止

### Directed

- 全エッジは方向を持つ

### Acyclic

- 循環禁止
- トポロジカルソート可能
- 実行順序は決定的（DET）

---

## 5.2 GraphBuilder（純関数）

> **RuntimePlan → ExecutionGraph は純関数である。**

- 同じRuntimePlanからは常に同じGraphが生成される（deterministic）
- ただし **injectiveである必要はない**  
  （異なるPlanから同じGraphが生成されてもよい）

---

## 5.3 GraphValidator（非破壊）

> **GraphValidator SHALL NOT mutate ExecutionGraph.**

### 検証項目

- 循環の有無
- 孤立ノード
- 重複ID
- 未接続ノード
- エントリポイントの存在

### 失敗時の挙動

> **Graph Validation Failure → initialize() Failure → Failed**

---

# 6. ErrorPolicy

## 6.1 契約

> **ErrorPolicy SHALL NOT modify ExecutionGraph.**

- Policyは実行継続可否と状態遷移を決定するのみ。

## 6.2 種類

- STOP_ON_ERROR  
- CONTINUE  
- COLLECT_ERRORS

---

# 7. RuntimePlan のライフサイクル

> **RuntimePlan is used as an input to ExecutionGraphBuilder and may be discarded after a valid ExecutionGraph has been constructed and validated.**

- OrchestratorはRuntimePlanを変更しない。
- 保持するか破棄するかは実装ポリシーに委ねる。

---

# 8. 通信経路の制約

> **ExecutionEngine間の直接通信は禁止。**

通信経路は必ず：

```text
Engine
  ↓
Orchestrator
  ↓
OrchestrationContext
  ↓
Engine
```

---

# 9. Freeze Contracts

本仕様が Freeze Candidate として固定する契約は以下である。

| ID | Contract |
|---|---|
| FC-LIFECYCLE | Orchestrator 状態機械および遷移条件 |
| FC-READY | Ready 状態の 5 条件 |
| FC-INIT-SEQ | Initialization Sequence（Builder → Validator → Context → Engines → Ready） |
| FC-EXECUTE | execute() は Ready のみ・1 回のみ・shutdown 暗黙呼出禁止 |
| FC-SHUTDOWN | shutdown() は idempotent |
| FC-CTX-OWN | Only Orchestrator may mutate OrchestrationContext |
| FC-SNAPSHOT | Snapshot SHALL NOT reference mutable internal state |
| FC-GRAPH-IMM | ExecutionGraph shall be an immutable DAG |
| FC-BUILDER | RuntimePlan → ExecutionGraph は純関数（deterministic） |
| FC-VALIDATOR | GraphValidator SHALL NOT mutate ExecutionGraph |
| FC-PLAN-LC | RuntimePlan は Builder 入力であり検証済み Graph 後に破棄可 |
| FC-ERROR-POL | ErrorPolicy SHALL NOT modify ExecutionGraph |
| FC-COMM | ExecutionEngine 間の直接通信は禁止 |

---

# 10. Freeze Review 推奨結論

この Draft 1.3 は以下を満たす：

- Frozen契約を侵さない  
- Runtime Execution Layerを変更しない  
- Orchestration Layerの責務が完全に閉じている  
- ライフサイクルが厳密に定義されている  
- Graph / Context / Policy の境界が明確  
- 21.0 LTS Freeze に耐える構造  

**20.9.0 Core Specification は Freeze Review に提出可能。**
