# ASA-ARCH-20.9.3 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-20.9.3 — Scheduler / Workflow Control  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Freeze Review 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 39 |
| Combined digest | `1e9601690e3494377ca0fd171223d4b1ae3c9ce6e838fc243a07f8932eb5cb2f` |

**判定理由:** Freeze Review 対象ファイルがすべて存在し、各ファイルの SHA-256 を取得・記録できた。欠損なし。

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-20.9.3.md`
- `docs/specs/asa_arch_20_9_3_scheduler_workflow_control.md`
- `docs/specs/asa_arch_20_9_3_verification_plan.md`
- `docs/specs/asa_arch_20_9_3_verification_mapping.md`

### Implementation（`src/orchestration/` — 22）

- Scheduler / DependencyResolver / SchedulingPolicy / PriorityResolver / ConcurrencyPolicy / ScheduledNodeQueue
- Dispatcher / DispatchStrategy / ExecutionCoordinator / Orchestrator / supporting 20.9.0–20.9.2 modules

### Tests（`tests/orchestration/` — 13）

- scheduler / dependency_resolver / scheduling_policy / priority_resolver / concurrency_policy / scheduled_node_queue
- arch_20_9_3_invariants + existing orchestration suite

---

## 3. File Manifest

Format: `HASH  relative/path`

```
1f7109aa80db0b6fdc815087ba6bffff1817496e035c3828f761321a69b35fbc  docs/baselines/ASA-ARCH-20.9.3.md
a5f12e61852c63256e8a636994271b2bf9a11bf6221252935f72ea13ea71b276  docs/specs/asa_arch_20_9_3_scheduler_workflow_control.md
a6c61b9dd6eb0968ebb4c915c9f37ee9a7672a2a4e0e582030582d60a40bd240  docs/specs/asa_arch_20_9_3_verification_mapping.md
2aee6879fcc36a7a8097a815f52fd8af05e5d5f6966fcb5c3b4a24e1f31ec600  docs/specs/asa_arch_20_9_3_verification_plan.md
aeb5914b2c0de1b32f12613eb06cc7d04ded9bed7b61f757a1e0e1c2ddf43a44  src/orchestration/ConcurrencyPolicy.ts
f6023815088dbf7a87af6f82894b26221d35c3a4736224276b76f6fd5834d957  src/orchestration/DependencyResolver.ts
31752ed92ea2919d3c5b3e02925646237254a159c14f7786604c9a78a37e1a80  src/orchestration/Dispatcher.ts
33bd3933895c66685fedbefaa7c2e6563eb5b037fd9e43dbf0dc18d64ff367d2  src/orchestration/DispatchStrategy.ts
d18af9a9555a4ed2823ab1cdf9a38d58836ab316cb1ed4e9542c3218a7c22181  src/orchestration/EngineDefinition.ts
9953a0cb273cd83b68a745e1b64e254429ed3dbc769f2b551bffe8692c14d31d  src/orchestration/EnginePool.ts
9bf8ef92dad8f4c7471ccb4a8c052c16ce5c1bdd42290ab2a9ee4d4017fdb7c2  src/orchestration/EngineRegistry.ts
79c29e724982f43e164c70b19219ba8e13b33f6af37a157952c80f60e7b11571  src/orchestration/ErrorPolicy.ts
63b9db176a85c5634f2fa6ee013bf297f9cb8b8c6e5d93b305d65b027895d616  src/orchestration/ExecutionCoordinator.ts
a352bd39365825eede6e8889ff0602ea333bd867a45e52e861c7491e0ee727ec  src/orchestration/ExecutionGraph.ts
4f9af5e0d7831bac081ff873561438d17acdb9529759ebec20175d1a9d08ec64  src/orchestration/GraphBuilder.ts
b17315c9e22919ea240c80bb2d11492752c8be715ffa9d5976833805cfb8bf2c  src/orchestration/GraphValidator.ts
738366f61e43ebba2f560cb8f82e284b9b7ab4358ba7f0ac68d5713c940a9df2  src/orchestration/index.ts
e4e612155075280255f178fcaf616329038030a5bc94229afb4a24c157b951bb  src/orchestration/LifecycleController.ts
7cd46712472fd0975ab8393afbc5525904c5901177ac690cbe138516a39125fb  src/orchestration/OrchestrationContext.ts
ee9f8f0fca2d7aafe2f06e0963fb97b0a73eb08466f63f0dc10825ab859d7ee6  src/orchestration/Orchestrator.ts
2bf081a28d489c7e5f8b57a69badae24327b7e18858fe917cc33495b89444ee4  src/orchestration/PriorityResolver.ts
7a00afe3da3af993b2bbf90cf2b18e5d031aae88b4a3b0c6cb964567356b1953  src/orchestration/ResultCollector.ts
81d1bf8bceccb2b2760ee81401d8bc943403d726185fb8f6644f737297c6fba1  src/orchestration/ScheduledNodeQueue.ts
09936162544a48d5d872297a38a1844cb4a9345124f47a746dd8230cfd19d906  src/orchestration/Scheduler.ts
2320db59fedbe2f2fed1ca7ebcbeba3312f5b554028825d8d7bc257e6ebd5185  src/orchestration/SchedulingPolicy.ts
7b624bfdb89d9bac9b62b7ee6e428d36a424906c5f0c61e7a05ee7548e8b9479  src/orchestration/types.ts
2b02033ff645140a173c619e7274a9f85aab66fca503bf7f7086d36b3d2d34d3  tests/orchestration/arch_20_9_2_invariants.test.ts
bfba3d164bf98e9ace391ecbc27273d277779fbbf15791806e62532d887105e8  tests/orchestration/arch_20_9_3_invariants.test.ts
52056eca0dc7e8c73dbb36ed6d19546f7e000c1c1082fa7fb60551bb936c46fd  tests/orchestration/architecture_constraints.test.ts
62de924da55312c1b25ae427a859da52386e56028a4aa49d3431889672836d68  tests/orchestration/concurrency_policy.test.ts
79a2d728f3d36ee54a859fc790f7ee341243615b89103049c1327ff24aedef2d  tests/orchestration/dependency_resolver.test.ts
c8a2a7ce29f4c29cc2b20272718e7135b2e163a81a6ff43f6afaef9da9d63366  tests/orchestration/dispatcher_graph.test.ts
b6741d7890001c7b94d4bf6e1fab92893473a311a499dcbb0191cfa95188ea16  tests/orchestration/lifecycle.test.ts
629bc4cf02ee53e03e705795c16049c7273d9b6659135371393012eef92aecc9  tests/orchestration/priority_resolver.test.ts
723c5bfc89ba54e9cfc2359555f9a263eb1a0de2942a30421f203141ac72b97a  tests/orchestration/registry_coordinator.test.ts
346a68da151e1e1600dc9515a027c5afb6e5c5a70c03842ed3b5ac8b59b5c533  tests/orchestration/result_policy_loop.test.ts
34eee705abcc7a1efcb25874b992b1a365b6609a4f765f0214d518e1ba544b8d  tests/orchestration/scheduled_node_queue.test.ts
1a952d9fd30f9358c4dce000e4b8c9076b2a4f108e698738587bc13cf5bd73b6  tests/orchestration/scheduler.test.ts
32579cea5ba37a9c9ac99004e11c0c88811a59de3e853b1f891611837336cb6d  tests/orchestration/scheduling_policy.test.ts
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze review |
|---|---|
| Runtime Model | NONE |
| Multi-Event Runtime | NONE |
| Runtime Execution Layer (`src/runtime_execution/`) | NONE |
| ExecutionEngine | NONE |
| INV / DEP / RB / DET / SEM / ERR / FLC | PRESERVED |
