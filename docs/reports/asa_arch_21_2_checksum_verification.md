# ASA-ARCH-21.2 Checksum Verification Report（Chapter 1）

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.2 — Pipeline Invariants（Chapter 1 / Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Chapter 1 Freeze 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 10 |
| Combined digest | `aa4157172dcdf1b4f03001aa473b81914c25c40b4e349c458812d76eae5ef4aa` |

**判定理由:** Chapter 1 Freeze 対象ファイルがすべて存在し、SHA-256 を取得・記録できた。欠損なし。  
Combined digest は path ソート済み manifest 行（`HASH  path\n`）の UTF-8 連結に対する SHA-256。

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-21.2.md`
- `docs/specs/asa_arch_21_2_pipeline_invariants.md`
- `docs/specs/asa_arch_21_2_verification_plan.md`
- `docs/specs/asa_arch_21_2_verification_mapping.md`

### Implementation（2）

- `src/workflow/PipelineInvariants.ts`
- `src/workflow/index.ts`（re-export only）

### Tests（2）

- `tests/workflow/pipeline_invariants.test.ts`
- `tests/workflow/architecture_constraints.test.ts`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
2b9b5b505382ac6f00c1356629bfa024fce50aa710375b467090d260d159b177  docs/baselines/ASA-ARCH-21.2.md
d513f79f43d204c033ef86ba9f451d27afd3f544764475ba98f4efa656dfce6b  docs/specs/asa_arch_21_2_pipeline_invariants.md
1ee658f299aff2ac096ccddb02afb9bae806b80f10a36231f32f89f33d1d8cf7  docs/specs/asa_arch_21_2_verification_mapping.md
a3beaf8c46fc75308a1860f8a1bb6131e8d112452ed24a90e12a4fbaaa1783bb  docs/specs/asa_arch_21_2_verification_plan.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
62c531588a9520fdff74a1eef9513fb9326d3e72c869c5e7c545e9af059717bb  src/workflow/index.ts
c0131ad6905126929f79c3fc6fe06bfb63fff018962b3f119ddad177a99d5fb9  src/workflow/PipelineInvariants.ts
09ed0499dbd15d6feb317e5820e569cbbb94bc1c6887b9323cc0080a4ebcc30c  tests/workflow/architecture_constraints.test.ts
cb10f735447c6b9da550fdbcf9dab2cb4d5ea849e66ed72e7d9d356d5aafa5d7  tests/workflow/pipeline_invariants.test.ts
c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze |
|---|---|
| Runtime Execution Layer（20.8） | NONE |
| Orchestration（20.9.x） | NONE |
| Workflow Core（21.0） | NONE |
| Workflow Builder（21.1） modules（other than index re-export） | NONE |
| PipelineDefinition.ts（21.1） | NONE |
