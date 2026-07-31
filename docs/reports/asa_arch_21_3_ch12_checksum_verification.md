# ASA-ARCH-21.3 Chapter 12 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_21_3_ch12_checksum_verification |
| Architecture | ASA-ARCH-21.3 Chapter 12 — Pipeline Composition Contract |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-21.3-CH12-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `1a62ddee9de01302cda56d3f482662e7d9a313bf9615286dffba570e3c3a2106` | `docs/baselines/ASA-ARCH-21.3.md` |
| `bea66b985c92af0fe1946e2077ccc40e977a2526260fedf3ee07dd8915d521ed` | `docs/specs/asa_arch_21_3_ch12_verification_mapping.md` |
| `3d554280c184cc6c45a7492d639fbe21534f4ff3fb4ecb586e89b7024668f99e` | `docs/specs/asa_arch_21_3_pipeline_composition_contract.md` |
| `db7632dc41b58180ba7ff1ec228f8a98bf7028a0cf4c6f01df761f6c33dcf12e` | `jest.config.cjs` |
| `a1caa487fe6e52d72da3412c396dcfce362cb67d0ecbe5d0060e7535c9627548` | `src/workflow/PipelineCompositionContract.ts` |
| `233c94da48f4f1a02e1fee1eeb5d3b91e1f9be30f0aa01e67d86cff1ebf3635a` | `src/workflow/index.ts` |
| `983931bed141048e1e6ba0691c8d1d00b58139ff5c7adea2599191ddc6d808eb` | `tests/workflow/architecture_constraints.test.ts` |
| `f45fdb0a2e34894caea9481100d6a20bb228189a8c3ebc89a4aecd2f83a99998` | `tests/workflow/pipeline_composition_contract.test.ts` |
| `c6c8e4bc833195b7158d20c3486500f682fbbed4f967b2bfdf327ed05e837e80` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
b56e92f6ddb05ae7aa300b2296a4042962611d79dd1fd9032d5e19593d367c47
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
| `src/workflow/PipelineCompositionContract.ts` | `a1caa487fe6e52d72da3412c396dcfce362cb67d0ecbe5d0060e7535c9627548` | UNCHANGED |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |
| `src/workflow/CompositionIntegration.ts` | `d0de01b96f1342d640bdeb064fd39052a7d2770598d76ffe8d64264ec134e6b7` | UNCHANGED (Chapter 10) |
| `src/workflow/CompositionBoundary.ts` | `b4108a2234715c06e24f661f4c18a94972ed64daf8cb4cf4e2c909a26ada5c5f` | UNCHANGED (Chapter 2) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-21.3-CH12-001.md` is outside this inventory.
- Chapter 12 source was not modified after freeze authorization; only status documentation changed.

---

End of Checksum Verification
