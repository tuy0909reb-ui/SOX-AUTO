# ASA-ARCH-31.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_31_0_checksum_verification |
| Architecture | ASA-ARCH-31.0 — Construction Structural Responsibility Boundary（ASA-ARCH-21.3 Chapter 31） |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-31.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `959fc3c762a1fd8dee595d5f154d6e6ccbba3e9c1f831ad5a79c29bac2eb4611` | `docs/baselines/ASA-ARCH-21.3.md` |
| `c737bd795b63d46f362392c860fcd8e890e596fb3203cb2e31ede246778bbbec` | `docs/specs/asa_arch_31_0_construction_structural_responsibility_boundary.md` |
| `b813598833e57b3e4c41eaec9772270c346223c8763bc7ed994301da7dacfefa` | `docs/specs/asa_arch_31_0_mapping.md` |
| `20a690f43646c44da6e8cfca7b7961e269c4fb1145e5c7b13e8cb0d6914015e5` | `jest.config.cjs` |
| `954071b4014d7f7e2a9c774f7e98a6f07179f8ebd708b2ecdac1a0d707585949` | `src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary.ts` |
| `9a1061264ae8f0e450f3c2b1fe81866c6a6e16f7b27f1d00a27b2f31e9b31e62` | `src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder.ts` |
| `4e3fd26f7956ff0e654a1b96a27a0f2d4304d48bda66e9719713a23af052b9b5` | `src/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryTypes.ts` |
| `2ec1e11ef522d45406342c822d78d4851ab4427eade58451e50df8462e0bb9da` | `tests/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundary.test.ts` |
| `be6c303d1861409e4be232fbed98016d5c1d69248aaa23193ceb6e59b5ccf311` | `tests/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryBuilder.test.ts` |
| `7b024dd36a4f43a98a56f3a18f4c647d0efc7fac29957d9b0e6ed11c71ffa205` | `tests/construction_structural_responsibility_boundary/ConstructionStructuralResponsibilityBoundaryConformance.test.ts` |
| `f60ae8dfaca6cb8ea98426c8506de68c37e02eec4adadf5965732f78dd58c4ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
52909ab0612590d10e7dc5c744e6abc0192fe769655f2a7e1796f579ffedca4e
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `10ffb1495ec2a34f4b486041b004c79eb54cea62bba7e1d0076e1db7e31fde7e`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionStructuralResponsibilityBoundary.ts` | `954071b4014d7f7e2a9c774f7e98a6f07179f8ebd708b2ecdac1a0d707585949` | UNCHANGED |
| `ConstructionStructuralResponsibilityBoundaryBuilder.ts` | `9a1061264ae8f0e450f3c2b1fe81866c6a6e16f7b27f1d00a27b2f31e9b31e62` | UNCHANGED |
| `ConstructionStructuralResponsibilityBoundaryTypes.ts` | `4e3fd26f7956ff0e654a1b96a27a0f2d4304d48bda66e9719713a23af052b9b5` | UNCHANGED |
| `ConstructionPlanningConsumptionBoundaryTypes.ts`（Chapter 30） | `c700b65e86ee80f98072c67a175e042dd2540e34cb3df66d51e86c95c1714ccb` | UNCHANGED |
| `ConstructionPlanningConsumptionBoundary.ts`（Chapter 30） | `9fa51f0378b2405110badaccbe2b0797526afd37958f08b8a50860d01f4f7bab` | UNCHANGED |
| `ConstructionPlanningConsumptionBoundaryBuilder.ts`（Chapter 30） | `1036138e2035ef70f1b38b8e2885c5ac3cb631f033580c66f9c411d32ebfa376` | UNCHANGED |
| `ConstructionPlanningManifest.ts`（Chapter 29） | `a502d28201985273683fc4eaefff5ae51235e5cf0cdaf330434ba3a81551603c` | UNCHANGED |
| `ConstructionPlanningManifestBuilder.ts`（Chapter 29） | `f4375c64313571eff20cbcf4042ebb0bc07878c4fac2fc1116fc6115bf6ae58f` | UNCHANGED |
| `ConstructionPlanningManifestTypes.ts`（Chapter 29） | `25ddb9cbc9a645768198f81fcee2f0859ee8d3f0d43b665db35eac18b70b0d97` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-31.0-001.md` is outside this inventory.
- Chapter 31 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–31 FROZEN.

---

End of Checksum Verification
