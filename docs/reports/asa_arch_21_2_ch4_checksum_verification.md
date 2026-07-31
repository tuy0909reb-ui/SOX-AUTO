# ASA-ARCH-21.2 Chapter 4 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.2 — Validation（Chapter 4 / Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Chapter 4 Freeze 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 10 |
| Combined digest | `40ad40a247ebafc0c399844ec5490a3bbb0a3618c268447aee6a68a5ed9b3147` |

Combined digest は path ソート済み manifest 行（`HASH  path\n`）の UTF-8 連結に対する SHA-256。

**Prior chapter integrity:**

| File | Result |
|---|---|
| `PipelineInvariants.ts`（Ch1） | MATCH |
| `PipelinePublicContract.ts`（Ch2） | MATCH |
| `StructuralElement.ts`（Ch2） | MATCH |
| `ExpansionRules.ts`（Ch3） | MATCH |

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-21.2.md`
- `docs/specs/asa_arch_21_2_validation.md`
- `docs/specs/asa_arch_21_2_ch4_verification_plan.md`
- `docs/specs/asa_arch_21_2_ch4_verification_mapping.md`

### Implementation（2）

- `src/workflow/ValidationContracts.ts`
- `src/workflow/index.ts`（re-export）

### Tests（2）

- `tests/workflow/validation_contracts.test.ts`
- `tests/workflow/architecture_constraints.test.ts`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
7cbe79f66a5676dd8dd8704299b78171fce98994c91cffd96cb13bb30b7106a6  docs/baselines/ASA-ARCH-21.2.md
bfa2ee79f08f0b1e4ce6f59b2f1b38f2b1da5c72950de77c349a0bdc3c0a1850  docs/specs/asa_arch_21_2_ch4_verification_mapping.md
cdb3c46167f77cfd500b6866fb41a70d704783423e106b477cbaeeeb29d882a4  docs/specs/asa_arch_21_2_ch4_verification_plan.md
55d2d472cba2ade1b5e76e514d1fb709c0e8cbf6b3a12ecf6feae01c5ee95347  docs/specs/asa_arch_21_2_validation.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
a24a85a9ad65e9e25be6be02210dc68a28ab178f539b5c099140e8a6d13e5d4a  src/workflow/index.ts
319763b6bcead5e98355632d4be621cfbcd34daabd17d65c89ad695e12a3eb70  src/workflow/ValidationContracts.ts
3bd060e0af4a2aa19ed3065fba504d38b89a0845e5c77b99a969d344b783d843  tests/workflow/architecture_constraints.test.ts
68686873d42b71df6ffb018f4594ebf0b20c2f62a8b4b59790cfbb085240cf91  tests/workflow/validation_contracts.test.ts
c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80  tsconfig.json
```

---

## 4. Frozen Layer Integrity

| Layer | Modification in this freeze |
|---|---|
| Runtime Execution Layer（20.8） | NONE |
| Orchestration（20.9.x） | NONE |
| Workflow Core / Builder（21.0–21.1） | NONE |
| Pipeline Invariants（21.2 Ch1） | NONE |
| Public Contract（21.2 Ch2） | NONE |
| Expansion Rules（21.2 Ch3） | NONE |
