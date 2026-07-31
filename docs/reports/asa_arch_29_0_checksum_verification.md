# ASA-ARCH-29.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_29_0_checksum_verification |
| Architecture | ASA-ARCH-29.0 — Construction Planning Manifest（ASA-ARCH-21.3 Chapter 29） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-29.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `cac5c17e7f00b2f2eaef847e14efffd84d8a3afe5dbbd4ae334ec96030182bd9` | `docs/baselines/ASA-ARCH-21.3.md` |
| `a4930e2f52742d9de9732db00b771d0d6b3900bd4870e8124d4150225fa2b620` | `docs/specs/asa_arch_29_0_construction_planning_manifest.md` |
| `1596a3dc445375561c9e0ec4a7d6e6d5825d865903263055c20f9ede4e3b7c45` | `docs/specs/asa_arch_29_0_mapping.md` |
| `1b7819eddf7ee9a9f6d28a89db9d17db04238c593935feaeaa156f47fcce25ee` | `jest.config.cjs` |
| `a502d28201985273683fc4eaefff5ae51235e5cf0cdaf330434ba3a81551603c` | `src/construction_planning_manifest/ConstructionPlanningManifest.ts` |
| `f4375c64313571eff20cbcf4042ebb0bc07878c4fac2fc1116fc6115bf6ae58f` | `src/construction_planning_manifest/ConstructionPlanningManifestBuilder.ts` |
| `25ddb9cbc9a645768198f81fcee2f0859ee8d3f0d43b665db35eac18b70b0d97` | `src/construction_planning_manifest/ConstructionPlanningManifestTypes.ts` |
| `8e462ff9de3ac09b84af55250f30ad2735a05aaa37c836578ba8e1f4702be381` | `tests/construction_planning_manifest/ConstructionPlanningManifest.test.ts` |
| `1448d04e33d7874b0d7702f52e5158b49263c7c23188ee35d0cead21b197dd4b` | `tests/construction_planning_manifest/ConstructionPlanningManifestBuilder.test.ts` |
| `fa03aa8ec3c72c2a161c6278b05ca3f21ec4b19ffa7798e0be54490e84da6cc7` | `tests/construction_planning_manifest/ConstructionPlanningManifestConformance.test.ts` |
| `867c52a3eff6a826398a4c091a7b0bf3ec26493cf31193d6c385d41b9121cdf4` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
2c5e379d3cb903de278a78cfd3845aaf9c2745a2a31dbc2b2bd263d4a10ed2f0
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `70ee05efa785f4c3ab1fbbd18c63a5ef8a8bfdca3c4ac57112798ae77c2dca43`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlanningManifest.ts` | `a502d28201985273683fc4eaefff5ae51235e5cf0cdaf330434ba3a81551603c` | UNCHANGED |
| `ConstructionPlanningManifestBuilder.ts` | `f4375c64313571eff20cbcf4042ebb0bc07878c4fac2fc1116fc6115bf6ae58f` | UNCHANGED |
| `ConstructionPlanningManifestTypes.ts` | `25ddb9cbc9a645768198f81fcee2f0859ee8d3f0d43b665db35eac18b70b0d97` | UNCHANGED |
| `ConstructionPlan.ts`（Chapter 25） | `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | UNCHANGED |
| `ConstructionPlanningContract.ts`（Chapter 26） | `299c105f834dd2ac0e10fdccfd2f5606aa272f2dd48554d1b8cd62498c0e9aa8` | UNCHANGED |
| `ConstructionPlanningDefinition.ts`（Chapter 27） | `5907c0f50b364e5d9b447a197ef2a4848f1eae565f73838a4b1ad8cb2ac8e3cd` | UNCHANGED |
| `ConstructionPlanningSpecification.ts`（Chapter 28） | `4ff3de0fb672a06a9e1787be9beb3880ada17b172197590f292f05f6885bd43f` | UNCHANGED |
| `ConstructionPlanningSpecificationBuilder.ts`（Chapter 28） | `c3a5ae39c44880e4ad048e790c5672bab41b2059e24c2624b73cc308644e01d0` | UNCHANGED |
| `ConstructionPlanningSpecificationTypes.ts`（Chapter 28） | `4acba6ad59d531796bc9432420c71d6f9b3eab50e38f984dc9ca6fa01312942a` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-29.0-001.md` is outside this inventory.
- Chapter 29 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–29 FROZEN.

---

End of Checksum Verification
