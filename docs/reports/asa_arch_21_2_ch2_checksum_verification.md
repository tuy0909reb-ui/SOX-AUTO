# ASA-ARCH-21.2 Chapter 2 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.2 — PipelineDefinition Public Contract（Chapter 2 / Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Chapter 2 Freeze 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 11 |
| Combined digest | `5aef0a7531b0635ce7f5d034654b4e7d7ca5b31f94181129e00b3bc94b617bb2` |

Combined digest は path ソート済み manifest 行（`HASH  path\n`）の UTF-8 連結に対する SHA-256。

**Chapter 1 integrity:** `src/workflow/PipelineInvariants.ts` SHA-256 remains  
`c0131ad6905126929f79c3fc6fe06bfb63fff018962b3f119ddad177a99d5fb9`（Ch1 freeze record MATCH）.

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-21.2.md`
- `docs/specs/asa_arch_21_2_pipeline_public_contract.md`
- `docs/specs/asa_arch_21_2_ch2_verification_plan.md`
- `docs/specs/asa_arch_21_2_ch2_verification_mapping.md`

### Implementation（3）

- `src/workflow/PipelinePublicContract.ts`
- `src/workflow/StructuralElement.ts`
- `src/workflow/index.ts`（re-export）

### Tests（2）

- `tests/workflow/pipeline_public_contract.test.ts`
- `tests/workflow/architecture_constraints.test.ts`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
803597d802783645eac2f76e1b39314e4aebd7bbb89ae70029334bd0c515f14d  docs/baselines/ASA-ARCH-21.2.md
2009afa099cd4472f2feb79bcd2a5424f1582b7ce6a94734e2f1ce7b3941c63e  docs/specs/asa_arch_21_2_ch2_verification_mapping.md
0cd19dff5532b11986e28a8354e9a1ebf5dcfcce3a4f8dcae95719b29be43ad8  docs/specs/asa_arch_21_2_ch2_verification_plan.md
eea143f6cb5ab7412862c2f5a0e7f5c6128c7dee3b2a3c5622af7d81ae76f070  docs/specs/asa_arch_21_2_pipeline_public_contract.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
eeb67f3c5a21263f9c157bb8dc8d66201a8335967da8b99cf95b3805325053a8  src/workflow/index.ts
05ba7e0c0a3a0b7db65a244972ecc1f9b31d4ccbea6efafcb7b7beddb3876e72  src/workflow/PipelinePublicContract.ts
90a0d2654c03a3a07c1194efc2ffa25380e39d82193763e242121c284106597d  src/workflow/StructuralElement.ts
8e526c434072bfce5bc08dd945e90973c0de0d9ae9a8f32b153914973f9f07f1  tests/workflow/architecture_constraints.test.ts
d18f87890250e63f980761e42a1b3348ac4a36648b818f672fca50c96795bea3  tests/workflow/pipeline_public_contract.test.ts
c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze |
|---|---|
| Runtime Execution Layer（20.8） | NONE |
| Orchestration（20.9.x） | NONE |
| Workflow Core（21.0） | NONE |
| Workflow Builder（21.1） `PipelineDefinition.ts` | NONE |
| Pipeline Invariants（21.2 Ch1） | NONE（hash MATCH） |
