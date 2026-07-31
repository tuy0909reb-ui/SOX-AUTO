# ASA-ARCH-21.3 Chapter 5 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch5_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 5 — Composition Invariants |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH5-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `ec18b441583e3d8c34cc081a248691ba06c5080a4558aef775e7397835c99e82` | `docs/baselines/ASA-ARCH-21.3.md` |
| `aa6d0e540397c3dc597bf56f1fffc6e4795a5cf0bec6d30ebb853e51ad0e3b42` | `docs/specs/asa_arch_21_3_ch5_verification_mapping.md` |
| `a81fb6aa9d47d551de45d9e644e605a2c3f82ae3d8b8ef4d4d99151904ca3ce5` | `docs/specs/asa_arch_21_3_composition_invariants.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | `src/workflow/CompositionInvariants.ts` |
| `455b42581d9298f744b26cd8dddef06ce69df18141ee42015f4b054fee0e6ae2` | `src/workflow/index.ts` |
| `b0932c4c34fd34d7f655ca88234f2c8dc41213aee5af16916cc403e2ad0590d4` | `tests/workflow/architecture_constraints.test.ts` |
| `f0c4516c13c512f6fb157c1a947000d506d949bb88eb7b8f1876db7d92a330bb` | `tests/workflow/composition_invariants.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
0235fc3a2547ba7ac173868b4a7d4cee6c379be96993fe77839f6d7e35154c95
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
| `src/workflow/CompositionInvariants.ts` | `a94d3d361e6f7d8672e2e5a752b18aa301916bb3ef1370379a40045dcb02d925` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged (Chapter 2) |
| `src/workflow/CompositionModel.ts` | `37b24bca3f1be9aa26c6fddf6d3fb0221f320339828b4cc3afe326db0fe2da85` | Unchanged (Chapter 3) |
| `src/workflow/CompositionContract.ts` | `4c0d16c35705014b6b9a9655983dccb0086bcab9172b1fd99baf248926762190` | Unchanged (Chapter 4) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH5-001.md` is outside this inventory.
- This digest reflects post-authorization baseline and specification status lines.

---

End of Checksum Verification
