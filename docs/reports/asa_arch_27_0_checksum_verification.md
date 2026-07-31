# ASA-ARCH-27.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_27_0_checksum_verification |
| Architecture | ASA-ARCH-27.0 — Construction Planning Definition（ASA-ARCH-21.3 Chapter 27） |
| Spec Status | Draft 0.5 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-27.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `40ce106371d6a330afe39c405106d121181fe4e227ae56b33b667fe275ffea36` | `docs/baselines/ASA-ARCH-21.3.md` |
| `5a22f4b46636dd800b60b72f2d804d35be868974a912f67bfdc93e1750a672f8` | `docs/specs/asa_arch_27_0_ch27_verification_mapping.md` |
| `38f98bc6f9f2c8c1352052198f83922ceb7d48b74154f5560855006c3f2bb30f` | `docs/specs/asa_arch_27_0_construction_planning_definition.md` |
| `34face195841641c23b402d0b7e570e9b9629128f29adf3d9b8c460b5360c244` | `jest.config.cjs` |
| `5907c0f50b364e5d9b447a197ef2a4848f1eae565f73838a4b1ad8cb2ac8e3cd` | `src/construction_planning_definition/ConstructionPlanningDefinition.ts` |
| `8268528a79b76ddfa5a18c8f05383dacb1ea2fea8902bc59de16cc6aece878e8` | `src/construction_planning_definition/ConstructionPlanningDefinitionBuilder.ts` |
| `d6a1957282dc606b07200b7a238e562d473b316cf1f97e071fc2a650008fde40` | `src/construction_planning_definition/ConstructionPlanningDefinitionTypes.ts` |
| `cf755cf39d006076d2fbdb4c281dc308462786d209b6777881e11080f29f22f0` | `tests/construction_planning_definition/ConstructionPlanningDefinition.test.ts` |
| `b5d21ab88e7839f3ba63e7669613bb714acf767e942121235bdbb907001e3416` | `tests/construction_planning_definition/ConstructionPlanningDefinitionBuilder.test.ts` |
| `49771f23b8c4c1416ffa086d8c6f5e6f5e513d037c8f6afddec86f5d287d9b78` | `tests/construction_planning_definition/ConstructionPlanningDefinitionContract.test.ts` |
| `0659913e83cfec4007bd7798db71593c207e6ba9d5eb00de2a7b3ad14387e399` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
2bb636dcfaeaf89ef04591baf0b3edafc7a46135eb03b1660d74410778325aa5
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `9b3a91b15d1f294478a98d0f322505e8dd215852e700e3f81e0b44bb7d0d2146`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlanningDefinition.ts` | `5907c0f50b364e5d9b447a197ef2a4848f1eae565f73838a4b1ad8cb2ac8e3cd` | UNCHANGED |
| `ConstructionPlanningDefinitionBuilder.ts` | `8268528a79b76ddfa5a18c8f05383dacb1ea2fea8902bc59de16cc6aece878e8` | UNCHANGED |
| `ConstructionPlanningDefinitionTypes.ts` | `d6a1957282dc606b07200b7a238e562d473b316cf1f97e071fc2a650008fde40` | UNCHANGED |
| `ConstructionPlan.ts`（Chapter 25） | `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | UNCHANGED |
| `ConstructionPlanTypes.ts`（Chapter 25） | `c5dc725cfe49951dcb51529a6dc9f8321289110ed3e8004bb8439712eb5f7396` | UNCHANGED |
| `ConstructionPlanningContract.ts`（Chapter 26） | `299c105f834dd2ac0e10fdccfd2f5606aa272f2dd48554d1b8cd62498c0e9aa8` | UNCHANGED |
| `ConstructionPlanningContractBuilder.ts`（Chapter 26） | `2072a1ab46fc0086fe0d2a9b7aa34f0b5eea8a91d430b1c625d8b850f833f10a` | UNCHANGED |
| `ConstructionPlanningContractTypes.ts`（Chapter 26） | `2bc00dfad9704d0e18adb8636a1d89bf78287fedf14729b32a89bc8a148906a5` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-27.0-001.md` is outside this inventory.
- Chapter 27 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–27 FROZEN.

---

End of Checksum Verification
