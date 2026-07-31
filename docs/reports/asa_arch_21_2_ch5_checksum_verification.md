# ASA-ARCH-21.2 Chapter 5 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.2 — Failure Contract（Chapter 5 / Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Chapter 5 Freeze 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 9 |
| Combined digest | `39410c1cf83ed04f9a6b9945d2b588bcb9f3adfc95803254e16e6b4297ebf695` |

**Prior chapter integrity:** PipelineInvariants / PipelinePublicContract / StructuralElement / ExpansionRules / ValidationContracts — all MATCH.

---

## 2. Freeze Target Inventory

### Design documents（3）

- `docs/baselines/ASA-ARCH-21.2.md`
- `docs/specs/asa_arch_21_2_failure_contract.md`
- `docs/specs/asa_arch_21_2_ch5_verification_mapping.md`

### Implementation（2）

- `src/workflow/FailureContracts.ts`
- `src/workflow/index.ts`（re-export）

### Tests（2）

- `tests/workflow/failure_contracts.test.ts`
- `tests/workflow/architecture_constraints.test.ts`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
21f6cda1f3d192abfee748385dfaa84b2f41676396bc25b1f1cc208fddaebedf  docs/baselines/ASA-ARCH-21.2.md
2ac7556777dda3ad2ab9481647793a5c852d9775888af75b7b8a32201f11f27a  docs/specs/asa_arch_21_2_ch5_verification_mapping.md
bf4560a4119e02b81ffc09b38510341de8dd4dd9876561ca1a366b1f2592d5c9  docs/specs/asa_arch_21_2_failure_contract.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
577d8cdf457fd2d7be7a66d2d692517ae68d6bc19410e935bf2aec94f49da122  src/workflow/FailureContracts.ts
e7913165ca056765a9a91c01f5633d44eea34b5e0eb976ec2cfa3ab3d06ed6c1  src/workflow/index.ts
4ba4cdb9dcd926394c1f7b301129daa08fd28c3ece1f2600f5532f97223b7a6e  tests/workflow/architecture_constraints.test.ts
546d378d65bdcf21d26386e3a7a515e447d64cf997de25c7d340d971a9af3f4c  tests/workflow/failure_contracts.test.ts
c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze |
|---|---|
| Runtime Execution Layer（20.8） | NONE |
| Orchestration（20.9.x） | NONE |
| Workflow Core / Builder（21.0–21.1） | NONE |
| ASA-ARCH-21.2 Chapters 1–4 | NONE |
