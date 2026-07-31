# ASA-ARCH-21.2 Chapter 3 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-21.2 — Expansion Rules（Chapter 3 / Draft 0.2）  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Chapter 3 Freeze 対象成果物のチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 10 |
| Combined digest | `696c3d32de918350c4e78033ed9ac1cad0d41b7b558bd4862e2ae34c9fa98ba3` |

Combined digest は path ソート済み manifest 行（`HASH  path\n`）の UTF-8 連結に対する SHA-256。

**Prior chapter integrity:**

| File | Result |
|---|---|
| `PipelineInvariants.ts`（Ch1） | MATCH |
| `PipelinePublicContract.ts`（Ch2） | MATCH |
| `StructuralElement.ts`（Ch2） | MATCH |

---

## 2. Freeze Target Inventory

### Design documents（4）

- `docs/baselines/ASA-ARCH-21.2.md`
- `docs/specs/asa_arch_21_2_expansion_rules.md`
- `docs/specs/asa_arch_21_2_ch3_verification_plan.md`
- `docs/specs/asa_arch_21_2_ch3_verification_mapping.md`

### Implementation（2）

- `src/workflow/ExpansionRules.ts`
- `src/workflow/index.ts`（re-export）

### Tests（2）

- `tests/workflow/expansion_rules.test.ts`
- `tests/workflow/architecture_constraints.test.ts`

### Toolchain（2）

- `tsconfig.json`
- `jest.config.cjs`

---

## 3. File Manifest

Format: `HASH  relative/path`

```
19b2862f81cd6bfdad13545d58ef985603f11a0510cba18c4b7eee5b7c5bff91  docs/baselines/ASA-ARCH-21.2.md
0b50b5ad5aad7ad969fd070f338a1bef63be6aa7e86977eeb7fd95e96383f0d0  docs/specs/asa_arch_21_2_ch3_verification_mapping.md
f646ead0057342a03eb261874c30a565ead5c167bea822f9c6262e7a944af22b  docs/specs/asa_arch_21_2_ch3_verification_plan.md
5844a5c074bca889b9114faa2d0d9caaa690b790374c6a6528834fdfb3484812  docs/specs/asa_arch_21_2_expansion_rules.md
db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e  jest.config.cjs
b1ba4799850f4c322a5215123315f41a322e6fc8ce089a4978e5b45174a5437a  src/workflow/ExpansionRules.ts
4ee7c9e0a0130b968ce157ee428eaabeb5329abad54557bb6cd793ac2f307e67  src/workflow/index.ts
68c505e0db580c78af709d87d17153c288be7d11070c79af456e5db51147f84c  tests/workflow/architecture_constraints.test.ts
769e75e8758dd0928a59a513fb5065307323d92085dd8525d786e11ece581178  tests/workflow/expansion_rules.test.ts
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
