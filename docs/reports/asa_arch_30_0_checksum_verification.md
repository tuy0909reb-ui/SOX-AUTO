# ASA-ARCH-30.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_30_0_checksum_verification |
| Architecture | ASA-ARCH-30.0 — Construction Planning Consumption Boundary（ASA-ARCH-21.3 Chapter 30） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-30.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `9ab4b8af90df03786ea663a9e535add9d5585cc50be94bd9d12e4406e17efa4c` | `docs/baselines/ASA-ARCH-21.3.md` |
| `1f840172986f6cb0081ef20a19f665b4dfa38fb17be2632e9a69bbc2ec3cfa3f` | `docs/specs/asa_arch_30_0_construction_planning_consumption_boundary.md` |
| `822610599b7d2dc805760f642582f48b0721dcd25ef92ad3d008bad15f71f73d` | `docs/specs/asa_arch_30_0_mapping.md` |
| `ad5ab2adb2a593b4f520ec46073a9532b421ab564db42cf158e43da6ce271c41` | `jest.config.cjs` |
| `9fa51f0378b2405110badaccbe2b0797526afd37958f08b8a50860d01f4f7bab` | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary.ts` |
| `1036138e2035ef70f1b38b8e2885c5ac3cb631f033580c66f9c411d32ebfa376` | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder.ts` |
| `c700b65e86ee80f98072c67a175e042dd2540e34cb3df66d51e86c95c1714ccb` | `src/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryTypes.ts` |
| `2b15f51a20c6703c1e984ba21db429f3ff954cf3560bd8ffdfe43e3cefcc936f` | `tests/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundary.test.ts` |
| `100dc80ec1444eaf2c47134a7b13375bb265a83a33071f31ebee18e0d226a7c0` | `tests/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryBuilder.test.ts` |
| `b2df605b0853d141065f238238eff7f6bdce439775a71b54a24cf6ef1a1b50f3` | `tests/construction_planning_consumption_boundary/ConstructionPlanningConsumptionBoundaryConformance.test.ts` |
| `dc619e079e7082dac2194400b93cba667cd6446480d25576a135fd43970e632e` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
13fcd5ca0b1b5ccd9d71d7784206463bb5d35f60c7b9c61b95b6b611a026a925
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `968a42e68725394c7b3a500a10eef734b59a7abdd0626027d901492f7c65447e`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlanningConsumptionBoundary.ts` | `9fa51f0378b2405110badaccbe2b0797526afd37958f08b8a50860d01f4f7bab` | UNCHANGED |
| `ConstructionPlanningConsumptionBoundaryBuilder.ts` | `1036138e2035ef70f1b38b8e2885c5ac3cb631f033580c66f9c411d32ebfa376` | UNCHANGED |
| `ConstructionPlanningConsumptionBoundaryTypes.ts` | `c700b65e86ee80f98072c67a175e042dd2540e34cb3df66d51e86c95c1714ccb` | UNCHANGED |
| `ConstructionPlanningManifest.ts`（Chapter 29） | `a502d28201985273683fc4eaefff5ae51235e5cf0cdaf330434ba3a81551603c` | UNCHANGED |
| `ConstructionPlanningManifestBuilder.ts`（Chapter 29） | `f4375c64313571eff20cbcf4042ebb0bc07878c4fac2fc1116fc6115bf6ae58f` | UNCHANGED |
| `ConstructionPlanningManifestTypes.ts`（Chapter 29） | `25ddb9cbc9a645768198f81fcee2f0859ee8d3f0d43b665db35eac18b70b0d97` | UNCHANGED |
| `ConstructionPlanningSpecification.ts`（Chapter 28） | `4ff3de0fb672a06a9e1787be9beb3880ada17b172197590f292f05f6885bd43f` | UNCHANGED |
| `ConstructionPlanningSpecificationBuilder.ts`（Chapter 28） | `c3a5ae39c44880e4ad048e790c5672bab41b2059e24c2624b73cc308644e01d0` | UNCHANGED |
| `ConstructionPlanningSpecificationTypes.ts`（Chapter 28） | `4acba6ad59d531796bc9432420c71d6f9b3eab50e38f984dc9ca6fa01312942a` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-30.0-001.md` is outside this inventory.
- Chapter 30 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–30 FROZEN.

---

End of Checksum Verification
