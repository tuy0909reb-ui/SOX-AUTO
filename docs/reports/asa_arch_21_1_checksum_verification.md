# ASA-ARCH-21.1 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.1 — Workflow Builder（Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Freeze Review 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 28 |
| Combined digest | `9ca476f45f5c232799b902eb148ebb3f5fc014f00478b78381e0ae807ae9880c` |

**判定理由:** Freeze Review 対象ファイルがすべて存在し、各ファイルの SHA-256 を取得・記録できた。欠損なし。  
Combined digest は path ソート済み manifest 行（`HASH  path\n`）の UTF-8 連結に対する SHA-256。

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-21.1.md`
- `docs/specs/asa_arch_21_1_workflow_builder.md`
- `docs/specs/asa_arch_21_1_verification_plan.md`
- `docs/specs/asa_arch_21_1_verification_mapping.md`

### Implementation（12）

- `src/workflow/*`（WorkflowBuilder / PipelineDefinition / StepDefinition / NodeFactory / EdgeFactory / WorkflowBuildError + 21.0 Core）

### Tests（10）

- `tests/workflow/*`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
02b20e1f0252df9792e3e721a84a33d7d961cf219dc6142cca9babea684eb549  docs/baselines/ASA-ARCH-21.1.md
057d75f1473c5e115beecd9995f39fe6f9ce160d8e36eedb1506aee21e75ee32  docs/specs/asa_arch_21_1_verification_mapping.md
b1f3fba5f113220009843b67a4c6f2014810b5a49e92f6d9a0dc58128c345a3b  docs/specs/asa_arch_21_1_verification_plan.md
10f32b3d23633f4e8fd9c33bc8e67e4a434125fdaf39b501182060692c0fefa3  docs/specs/asa_arch_21_1_workflow_builder.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
37332934e1e898d8c251e9968c27c1326640141717198572377c4a4e2330e972  src/workflow/EdgeFactory.ts
ddd3aeb9bf6b8334b24aaab5c41fb79b6218c7a50e598cd6562ff4f7cca8f53c  src/workflow/ExecutionPolicy.ts
51f70b2185873d2e3d3a91d43ddc77dc54c0c967e0d9f853b3a967f3210a246e  src/workflow/index.ts
d2e30909dfb8027aaa6ac4676e3d3798ad95dae6f7bb76e804a7df2ddd7e093e  src/workflow/NodeFactory.ts
0a5e65db93812b7817e166ecc4d317cb125db06d32a305ceec4c80c3094a10c1  src/workflow/PipelineDefinition.ts
7802b0f56fa665d13c11647520375bbf46df0b0d8e981957dce2553e4327fc5d  src/workflow/StepDefinition.ts
a719bacf0629744b80346f27b51a0a2401142e62bd5530466701e345c8f1a3e0  src/workflow/Workflow.ts
c4869a22831736d3f52abc3ceaff562fa6aaffab5722f29e6d4dc5294d0603c5  src/workflow/WorkflowBuilder.ts
4d8a19bc636e21bc8f0495595ad6763c5d95445b7945b4dc00c84832a652325b  src/workflow/WorkflowBuildError.ts
7023f753fd77edaee9a7dd5e272811c624bfd8b16f2a3cd79ba72a4c77ff0e1f  src/workflow/WorkflowDefinition.ts
c8059367f41e6993d6944e3256f48584bc4a32b001417a7aa15d650380e1f8eb  src/workflow/WorkflowMetadata.ts
346b7c8ea3da27c96b2bbecb751fa94db7e3971eed356e9686b0b6d863849140  src/workflow/WorkflowState.ts
c3442124392b2375553b3cc81ccfe409d5b2456f7162d27f4ca171660a46bdce  tests/workflow/architecture_constraints.test.ts
f6767f83325ae4755fdfbf15cffc995b78528134bf97d26ce95c870ebcea5ad5  tests/workflow/edge_factory.test.ts
4541e871704e68415b9e7d6a96b68fe6890a7c2d1ef3ab0435d490b661491257  tests/workflow/execution_policy.test.ts
66abbc630ddc0c6f268fae5f6e4be65920e89ca422556e3f823e7f48b4eb008c  tests/workflow/graph_builder_contract.test.ts
f1e774f2eace44973c82a0b421680aba9314f0fad99206d27a8b700853a6c551  tests/workflow/lifecycle_contract.test.ts
1c353334be95d556751bd46f40cb49816466ca381dfd6abaffe9795565ac0a94  tests/workflow/node_factory.test.ts
9b68fd44b88f941c2a3d1f852c84abc9bcfb2e0cf678fd80efcb9dacc55b3458  tests/workflow/pipeline_definition.test.ts
039313e88b838c86e229b45e556debe4a9dbb5d060cd4a239e6f55bbf6c7a4dc  tests/workflow/step_definition.test.ts
1e9a64df1e8e09742afabdafbe00d76be005757f8d5c490d8556be1f6b3f9100  tests/workflow/workflow_builder.test.ts
8cdbd95a9f190b9f4d23810a39dfd67c8339d6582f94f9c05f75ebdf0c2aebb1  tests/workflow/workflow_definition.test.ts
c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze review |
|---|---|
| Runtime Execution Layer | NONE |
| Orchestration（20.9.x） | NONE（read-only dependency: ExecutionGraph / GraphValidator） |
| ASA-ARCH-21.0 Workflow Core contracts | PRESERVED（façade delegation） |
| INV / DEP / RB / DET / SEM / ERR / FLC | PRESERVED |
