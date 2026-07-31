# ASA-ARCH-21.3 Chapter 9 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch9_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 9 — Composition Evolution |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH9-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `b5fd305170777fba2ed9a45a99e4de9d500ce47ce0297c4f0c42dd93f175b6ad` | `docs/baselines/ASA-ARCH-21.3.md` |
| `721eb4e573824b27b9ac86624bc872ef3dc793ed697a77dcca6c64755441037c` | `docs/specs/asa_arch_21_3_ch9_verification_mapping.md` |
| `dd22b600d089de466dfa0c5f57ad35720d67d8cd2f777a9d90c09158e606760d` | `docs/specs/asa_arch_21_3_composition_evolution.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `8c12be6936ca13cfc82c5d95ccc3f6aabe4e13e64f1f82a78085343e5722cca1` | `src/workflow/CompositionEvolution.ts` |
| `862ba3a069104b0161781f743d25ce40af18851e6c2247ac41bc96cad0c89a63` | `src/workflow/index.ts` |
| `b4704bae43761fbe72019b20be1f5194bf0699d8c0b4ca37ee0f50e3f85a1e0e` | `tests/workflow/architecture_constraints.test.ts` |
| `e23dc4d40273b7f9eb79ba3846df63a0846e3bb5690c758e688cd9b9c579fccf` | `tests/workflow/composition_evolution.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
c6d403728a9b2877243e6907a77ffc113042a7227d00719281d717a40142c180
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
| `src/workflow/CompositionEvolution.ts` | `8c12be6936ca13cfc82c5d95ccc3f6aabe4e13e64f1f82a78085343e5722cca1` | Unchanged at authorization |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged (Chapter 4) |
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | Unchanged (Chapter 5) |
| `src/workflow/CompositionConstraints.ts` | `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | Unchanged (Chapter 6) |
| `src/workflow/CompositionValidation.ts` | `7da36455203245de1bc29c8c6734106de4b2cd6c47a3c944347c2bf5ed44aa1b` | Unchanged (Chapter 7) |
| `src/workflow/CompositionLifecycle.ts` | `d20b9c939475e8ec1159978a81b190bbe3a7c8db0527898f15e0be312956aa18` | Unchanged (Chapter 8) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH9-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
