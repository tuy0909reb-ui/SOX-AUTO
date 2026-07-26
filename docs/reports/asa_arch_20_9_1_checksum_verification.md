# ASA-ARCH-20.9.1 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-20.9.1 — Orchestrator Internal Responsibilities  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Freeze 対象成果物が改変されていないことを証明するためのチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 22 |
| Combined digest | `77120ce057b6d52e54fe92aeb0b78a83011989d9fda00f3acb4ea29ef4f0ba1d` |

**判定理由:** Freeze 対象ファイルがすべて存在し、各ファイルの SHA-256 を取得・記録できた。欠損なし。

---

## 2. Freeze Target Inventory

### Design documents（2）

- `docs/baselines/ASA-ARCH-20.9.1.md`
- `docs/specs/asa_arch_20_9_1_orchestrator_internal_responsibilities.md`

### Production（13）

- `src/orchestration/*`（全 `.ts` ファイル）

### Architecture tests（5）

- `tests/orchestration/*`（全 `.test.ts` ファイル）

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
0b033049174824d5f6a8646d8837625112740b15adc7512ab5a9cbf7d829e77c  docs/baselines/ASA-ARCH-20.9.1.md
e0339ae04d7720bd1cf450615c0be085e469d5ba15558be06b734e91836c2e69  docs/specs/asa_arch_20_9_1_orchestrator_internal_responsibilities.md
96581dc21769d2c19fccdece8d3f72a44923db957671276090ddb06d2ddcd1e2  jest.config.cjs
beeb3862e8695ba6f800df5c743910e8da2311e93496ae80f622fae6ab308d4c  src/orchestration/Dispatcher.ts
575ffca2776b677c21e11b25b6694911cd496546e0a0b3adf5a776bc1e1fc051  src/orchestration/EngineRegistry.ts
6222830075535f80ed77dd83c76dd5c6c91003cca36a8795f4e5702b217e8e94  src/orchestration/ErrorPolicy.ts
7d1bf7a2ae49a9601bf574209ccdb3534aabd4c0b5dca350700dd7805cc51d73  src/orchestration/ExecutionCoordinator.ts
a352bd39365825eede6e8889ff0602ea333bd867a45e52e861c7491e0ee727ec  src/orchestration/ExecutionGraph.ts
4f9af5e0d7831bac081ff873561438d17acdb9529759ebec20175d1a9d08ec64  src/orchestration/GraphBuilder.ts
b17315c9e22919ea240c80bb2d11492752c8be715ffa9d5976833805cfb8bf2c  src/orchestration/GraphValidator.ts
0dc496f98dba5df05bc70713fd82e074404d7440d497373e72a95f7265652718  src/orchestration/index.ts
e4e612155075280255f178fcaf616329038030a5bc94229afb4a24c157b951bb  src/orchestration/LifecycleController.ts
7cd46712472fd0975ab8393afbc5525904c5901177ac690cbe138516a39125fb  src/orchestration/OrchestrationContext.ts
074cf1db4f6b9508a9134a086f1787d36d6796c73c5dc926c8ef0b94dd9802ce  src/orchestration/Orchestrator.ts
5132983b243b60e94a8108b8a6c15630319a4526f87bbdb1767f6df583df0171  src/orchestration/ResultCollector.ts
d5555382fc683b7708312af861ffec4a11ab71d636af972f2ad21bd1e0ffc7af  src/orchestration/types.ts
9c679846619e077cd7ddf7efc812c5758920bc3c8619ae02d305211b4dea03fe  tests/orchestration/architecture_constraints.test.ts
c8a2a7ce29f4c29cc2b20272718e7135b2e163a81a6ff43f6afaef9da9d63366  tests/orchestration/dispatcher_graph.test.ts
b6741d7890001c7b94d4bf6e1fab92893473a311a499dcbb0191cfa95188ea16  tests/orchestration/lifecycle.test.ts
b33c29a99952a00be5851e39a269ba1e1af8afe2bb7ccecff33afec31a76e0ce  tests/orchestration/registry_coordinator.test.ts
6093997f56821e0c3c40a042aeb6ce4bf36e49d8a03fc7639aeaa01d694e2a8a  tests/orchestration/result_policy_loop.test.ts
2c3164f8458d71b96d5bba9b42ee251e8b6ab3d8010017eb1a2a61d8e1989105  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze |
|---|---|
| Runtime Model | NONE |
| Multi-Event Runtime | NONE |
| Runtime Execution Layer (`src/runtime_execution/`) | NONE |
| ExecutionEngine | NONE |
| INV / DEP / RB / DET / SEM / ERR / FLC | PRESERVED |
