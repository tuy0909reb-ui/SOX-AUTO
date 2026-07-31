# ASA-ARCH-28.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_28_0_checksum_verification |
| Architecture | ASA-ARCH-28.0 — Construction Planning Specification（ASA-ARCH-21.3 Chapter 28） |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-28.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `7c7f26ff4d7a6b7053d87d61d7bfbd7e12899cfc1c00d17495d76854b4f12a0d` | `docs/baselines/ASA-ARCH-21.3.md` |
| `ce978c7a195ef5be12ddc5553134dc34749fb2ed0c1cac51cf38379873662a9d` | `docs/specs/asa_arch_28_0_ch28_verification_mapping.md` |
| `546740adb54994bd6b15dfab4ecb3c2f6925932a1204f8bffcb84e8b452f8a1d` | `docs/specs/asa_arch_28_0_construction_planning_specification.md` |
| `4c4dc017edad4ebadb5506978b72a282ec2654909e5d27df8e417e94c33151d9` | `jest.config.cjs` |
| `4ff3de0fb672a06a9e1787be9beb3880ada17b172197590f292f05f6885bd43f` | `src/construction_planning_specification/ConstructionPlanningSpecification.ts` |
| `c3a5ae39c44880e4ad048e790c5672bab41b2059e24c2624b73cc308644e01d0` | `src/construction_planning_specification/ConstructionPlanningSpecificationBuilder.ts` |
| `4acba6ad59d531796bc9432420c71d6f9b3eab50e38f984dc9ca6fa01312942a` | `src/construction_planning_specification/ConstructionPlanningSpecificationTypes.ts` |
| `758cbde2f4724277cc4e2e70b5b160f9aa342ccb54628f028bcdd1d0c7ed4072` | `tests/construction_planning_specification/ConstructionPlanningSpecification.test.ts` |
| `25362d5892831adf1ee14c690c06e586414d102ddadc9d521edb6067b80209d9` | `tests/construction_planning_specification/ConstructionPlanningSpecificationBuilder.test.ts` |
| `f89e5c7513c6457b3f632e57f9c1fc7dd764d4a246086f2d32e64e3c6b356231` | `tests/construction_planning_specification/ConstructionPlanningSpecificationConformance.test.ts` |
| `b3d2b79e9d4c3ed287463821e700a00785ce0350ba66d498cc991693f75e2fa9` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
1ec4c94900ad1fe7cf7aa79497940166467cd28eab715f84232ca062a716df1c
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `b04eda97e875a0309cc31a41b32aaedb4ce0be19450aad835d8aeb71e2a8976b`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlanningSpecification.ts` | `4ff3de0fb672a06a9e1787be9beb3880ada17b172197590f292f05f6885bd43f` | UNCHANGED |
| `ConstructionPlanningSpecificationBuilder.ts` | `c3a5ae39c44880e4ad048e790c5672bab41b2059e24c2624b73cc308644e01d0` | UNCHANGED |
| `ConstructionPlanningSpecificationTypes.ts` | `4acba6ad59d531796bc9432420c71d6f9b3eab50e38f984dc9ca6fa01312942a` | UNCHANGED |
| `ConstructionPlan.ts`（Chapter 25） | `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | UNCHANGED |
| `ConstructionPlanningContract.ts`（Chapter 26） | `299c105f834dd2ac0e10fdccfd2f5606aa272f2dd48554d1b8cd62498c0e9aa8` | UNCHANGED |
| `ConstructionPlanningDefinition.ts`（Chapter 27） | `5907c0f50b364e5d9b447a197ef2a4848f1eae565f73838a4b1ad8cb2ac8e3cd` | UNCHANGED |
| `ConstructionPlanningDefinitionBuilder.ts`（Chapter 27） | `8268528a79b76ddfa5a18c8f05383dacb1ea2fea8902bc59de16cc6aece878e8` | UNCHANGED |
| `ConstructionPlanningDefinitionTypes.ts`（Chapter 27） | `d6a1957282dc606b07200b7a238e562d473b316cf1f97e071fc2a650008fde40` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-28.0-001.md` is outside this inventory.
- Chapter 28 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–28 FROZEN.

---

End of Checksum Verification
