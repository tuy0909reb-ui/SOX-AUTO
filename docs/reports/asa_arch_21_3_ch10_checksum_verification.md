# ASA-ARCH-21.3 Chapter 10 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch10_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 10 — Composition Integration |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH10-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `d0d2fbc5175579a88e6e41d99a4805c7db996cad88de3ac04adac727b2acf516` | `docs/baselines/ASA-ARCH-21.3.md` |
| `feff382705e05e4d5ca8346f3a5549dde33ef66fe2ec12e234966153548b4829` | `docs/specs/asa_arch_21_3_ch10_verification_mapping.md` |
| `5ca8c9ee73d19a647d6b10b942f3997274f9af9b51179ee75007afc9745b796a` | `docs/specs/asa_arch_21_3_composition_integration.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `d0de01b96f1342d640bdeb064fd39052a7d2770598d76ffe8d64264ec134e6b7` | `src/workflow/CompositionIntegration.ts` |
| `3ef3fc885de292db4d7f7564b2c61c859341d2e69d3c21b48e7bca9c2b185e4e` | `src/workflow/index.ts` |
| `f819e7daa2d0064567c50c9b1734db87891450e2a606daf7515b08f1a94bbfef` | `tests/workflow/architecture_constraints.test.ts` |
| `7289353d41be2bdf974ce25251213a97daea78d498f4560322279e3bc1698afb` | `tests/workflow/composition_integration.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
a81d6330a2a83cc18589459750923fa3d489b52b4a3fb57ce44070bf80a4b470
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
| `src/workflow/CompositionIntegration.ts` | `d0de01b96f1342d640bdeb064fd39052a7d2770598d76ffe8d64264ec134e6b7` | UNCHANGED |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | UNCHANGED (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | UNCHANGED (Chapter 4) |
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | UNCHANGED (Chapter 5) |
| `src/workflow/CompositionConstraints.ts` | `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | UNCHANGED (Chapter 6) |
| `src/workflow/CompositionValidation.ts` | `7da36455203245de1bc29c8c6734106de4b2cd6c47a3c944347c2bf5ed44aa1b` | UNCHANGED (Chapter 7) |
| `src/workflow/CompositionLifecycle.ts` | `d20b9c939475e8ec1159978a81b190bbe3a7c8db0527898f15e0be312956aa18` | UNCHANGED (Chapter 8) |
| `src/workflow/CompositionEvolution.ts` | `8c12be6936ca13cfc82c5d95ccc3f6aabe4e13e64f1f82a78085343e5722cca1` | UNCHANGED (Chapter 9) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH10-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
