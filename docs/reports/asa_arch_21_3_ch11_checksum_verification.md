# ASA-ARCH-21.3 Chapter 11 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch11_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 11 — Composition Boundary Contract |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH11-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `6374ce97583357d2d8e7914986ba7653381f976478e224c1442d8dc2893183a0` | `docs/baselines/ASA-ARCH-21.3.md` |
| `aad64ecbcef6eabc0571d18b4257222fdc137a0a82339696bc0786133d4aa961` | `docs/specs/asa_arch_21_3_ch11_verification_mapping.md` |
| `6735634ff75baaaa8e6ee7504a54b6485f75d8ff4764fc8a2e927538122ed8a6` | `docs/specs/asa_arch_21_3_composition_boundary_contract.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | `src/workflow/CompositionBoundaryContract.ts` |
| `0529b9a726433060302c3571f716fda5f64297ceda862ac5e4c1750d1f946fed` | `src/workflow/index.ts` |
| `fc70b01b4c572239dc6201e85919fa5c73824ec3f2f56b2f9fa61a433be2da6e` | `tests/workflow/architecture_constraints.test.ts` |
| `522e375745faf5012d5deb1734ace6d7bf3bd9315a374408f444cafb2c68d900` | `tests/workflow/composition_boundary_contract.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
a8d3a5b758523d13e404a65e0365ce83091926a40fc81e68bd94e422f1364536
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | UNCHANGED (Chapter 2) |
| `src/workflow/CompositionIntegration.ts` | `d0de01b96f1342d640bdeb064fd39052a7d2770598d76ffe8d64264ec134e6b7` | UNCHANGED (Chapter 10) |
| `src/workflow/CompositionEvolution.ts` | `8c12be6936ca13cfc82c5d95ccc3f6aabe4e13e64f1f82a78085343e5722cca1` | UNCHANGED (Chapter 9) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH11-001.md` is outside this inventory.
- Chapter 11 `CompositionBoundaryContract.ts`（CBC-*） remains distinct from Chapter 2 `CompositionBoundary.ts`（CB-*）.

---

End of Checksum Verification
