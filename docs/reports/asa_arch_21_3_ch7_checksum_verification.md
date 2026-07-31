# ASA-ARCH-21.3 Chapter 7 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch7_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 7 — Composition Validation |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH7-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `d319bfe45bddb25d6fe3ddf9a5f3ff98fe96f0ae4fdf89e1f2edaee4896f2738` | `docs/baselines/ASA-ARCH-21.3.md` |
| `a6a3dd6c5e73b3e8498ec435861cea0b4866dfd52f57232219fb75d5cf9c26cb` | `docs/specs/asa_arch_21_3_ch7_verification_mapping.md` |
| `cceefa8b08eca350d3ecfbbec6f2b27d353441c1d28a8b7acca8a74e1298ac69` | `docs/specs/asa_arch_21_3_composition_validation.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `7da36455203245de1bc29c8c6734106de4b2cd6c47a3c944347c2bf5ed44aa1b` | `src/workflow/CompositionValidation.ts` |
| `24f2a164d2a0028c20a9082d44dbb410d002655e6de313007df79f74b2119153` | `src/workflow/index.ts` |
| `4e3ffc08795bb602a7a96ee2ab9ecb896c286dd31a1dca7b53d746c785e028df` | `tests/workflow/architecture_constraints.test.ts` |
| `a83604188f55385a486f97bbc828162943cd82ca6094fc02a448e5f7a9105fe9` | `tests/workflow/composition_validation.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
825ac2809a60750049054af39179f70b1854b215cf6f56e4c197fd1f24d149c7
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
| `src/workflow/CompositionValidation.ts` | `7da36455203245de1bc29c8c6734106de4b2cd6c47a3c944347c2bf5ed44aa1b` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged (Chapter 2) |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged (Chapter 4) |
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | Unchanged (Chapter 5) |
| `src/workflow/CompositionConstraints.ts` | `57cfa77c9a93065c11cf27ee9087f444fe3239cd0bd9967d3aa2e5499822a1d1` | Unchanged (Chapter 6) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH7-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
