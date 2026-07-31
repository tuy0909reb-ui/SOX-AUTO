# ASA-ARCH-21.3 Chapter 2 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch2_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 2 — Composition Boundary |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH2-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `416dbfb66b99d3df70176d22e411f70d062ec02fc085cc1c9bf44b0217b470c7` | `docs/baselines/ASA-ARCH-21.3.md` |
| `66649a5433b76db60501560a2bed73f481ca9d099d89ffc6e61313feb99cc8be` | `docs/specs/asa_arch_21_3_ch2_verification_mapping.md` |
| `00b487722f659fcc3523a41a1b064281a963633e33d9546ec19fd11e75ca421c` | `docs/specs/asa_arch_21_3_composition_boundary.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | `src/workflow/CompositionBoundary.ts` |
| `866a5dd363e95fb8d71df872cfe76f5b71d3585dcffc31571d826815c5665672` | `src/workflow/index.ts` |
| `8f0a8b6d7ed19fa4e0243e6dfa48d51b195314c00296e058eb58bdd3df067ea4` | `tests/workflow/architecture_constraints.test.ts` |
| `5f6f6af6eca7e945d46114892a83421b7d2a0fdd36eb97c05c4a5ec0a2312741` | `tests/workflow/composition_boundary.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
2c81fabd2da626f517f3e94a87b582f92a2853dc9313a9b71307fff3ecf15ae2
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
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | Unchanged at authorization |
| `src/workflow/CompositionPrinciples.ts` | `7df238155fbfac76bb4d8c6e953b46258c41db70fa4ddf0fea31d1e2a94cccce` | Unchanged (Chapter 1) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH2-001.md` is outside this inventory.
- Acceptance and freeze-verification status updates that are inventory-adjacent may require recompute when baseline/spec change; this digest reflects post-authorization baseline and spec status lines.

---

End of Checksum Verification
