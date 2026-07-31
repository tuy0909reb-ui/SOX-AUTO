# ASA-ARCH-25.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_25_0_checksum_verification |
| Architecture | ASA-ARCH-25.0 — Construction Plan（ASA-ARCH-21.3 Chapter 25） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-25.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (10 files)

| SHA-256 | Path |
|---|---|
| `a99bcd6dc8fae2591c8f4e4ea03265832f50cc9c957722b93ffab4cd1b8817bb` | `docs/baselines/ASA-ARCH-21.3.md` |
| `25bad242cfe9aea8ccc90849d2a850ae354ed2432fffc7861e027d194b33e507` | `docs/specs/asa_arch_25_0_ch25_verification_mapping.md` |
| `4281d4d92ec0514913be91e764d521f464c2c35d6c6b830dad0fe7012833f8db` | `docs/specs/asa_arch_25_0_construction_plan.md` |
| `98544239f9c73aeda96da81f4e09cccc0d6a34a6b96cec0e980ff2161b885feb` | `jest.config.cjs` |
| `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | `src/construction_plan/ConstructionPlan.ts` |
| `9d1c21f9b2e4fd95dbbfdb3305e37914f077dcccb89d311e84a676ba16530785` | `src/construction_plan/ConstructionPlanBuilder.ts` |
| `c5dc725cfe49951dcb51529a6dc9f8321289110ed3e8004bb8439712eb5f7396` | `src/construction_plan/ConstructionPlanTypes.ts` |
| `d93335313cc03c67fc36c8029bfe5fbd9dc763d91c09166602ad103da4715ceb` | `tests/construction_plan/ConstructionPlan.spec.ts` |
| `3fc0e7bd2ff0e75d48cf18f7e32831a2e69396444bd8da94d98581fce25f6dd3` | `tests/construction_plan/ConstructionPlanBuilder.spec.ts` |
| `8ac3675c65232767404fa548966d6c599fad5b568ed4dea68c5eff6182455255` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
c77c6ac0d2ed9899b6cae8aa4722fede37133e1f9a3ceb28d5dafddead0f628d
```

| Field | Value |
|---|---|
| File Count | 10 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `19e7400fe69935c450c12cf8914802252e095b25fad8b78c470ee92586c1cdf6`（implementation inventory; 7 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionPlan.ts` | `fbdaf3773e1ccffcd2f5a422fe2afdab2e06a6bf144736b80398d690a3cb91e2` | UNCHANGED |
| `ConstructionPlanBuilder.ts` | `9d1c21f9b2e4fd95dbbfdb3305e37914f077dcccb89d311e84a676ba16530785` | UNCHANGED |
| `ConstructionPlanTypes.ts` | `c5dc725cfe49951dcb51529a6dc9f8321289110ed3e8004bb8439712eb5f7396` | UNCHANGED |
| `ConstructionSelection.ts`（Chapter 23） | `df1b1d49fb167bb04462e64e9349589d260e44135f594aefe282b7fe6d8e12ae` | UNCHANGED |
| `ConstructionSelectionTypes.ts`（Chapter 23） | `a544f1c5bc4612376ffb05943267b0a3dea5598523eec0418858ab68dde120ce` | UNCHANGED |
| `ConstructionSelectionResult.ts`（Chapter 24） | `e27dacbf615c899b85cd96bd13df0ad423e928feeca27f92f74a15e05d869bb6` | UNCHANGED |
| `ConstructionSelectionResultTypes.ts`（Chapter 24） | `a0293fbc8bbd135d73aabdfbed3addd9c6a9b17e1aa3d370f44d4185ec298611` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-25.0-001.md` is outside this inventory.
- Chapter 25 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–25 FROZEN.

---

End of Checksum Verification
