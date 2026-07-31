# ASA-ARCH-23.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_23_0_checksum_verification |
| Architecture | ASA-ARCH-23.0 — Construction Selection（ASA-ARCH-21.3 Chapter 23） |
| Spec Status | Draft 1.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-23.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `c0678afb85f6e275676dfa408488f1db63d499434e19111da7c4c3c084a9edb9` | `docs/baselines/ASA-ARCH-21.3.md` |
| `66ad80a57d05a358a3edba7580e0445c770f9436b32e251ddae9de9c8cd38dd0` | `docs/specs/asa_arch_23_0_ch23_verification_mapping.md` |
| `3b2a0f2cd60730cf56cc879584ce08d4d25978647fcb1a7fd25b490b1ae8c1dd` | `docs/specs/asa_arch_23_0_construction_selection.md` |
| `a7ea46ec772b1479705bd14cd4c29aec8e58f56b3685dd2ffcf94d81887e0263` | `jest.config.cjs` |
| `df1b1d49fb167bb04462e64e9349589d260e44135f594aefe282b7fe6d8e12ae` | `src/construction_selection/ConstructionSelection.ts` |
| `2b9d187895b17110fd800926f3f8d9c29623cd6fe7374903d7da99a9280724d4` | `src/construction_selection/ConstructionSelectionBuilder.ts` |
| `a544f1c5bc4612376ffb05943267b0a3dea5598523eec0418858ab68dde120ce` | `src/construction_selection/ConstructionSelectionTypes.ts` |
| `66f89295a1baf6b32bce4eddab2221140248221be11aeb3ab030b1d03d4481c5` | `src/construction_selection/index.ts` |
| `4fbe24f0866c1004d4f6e7fd5cb50b9d73d140fc8d49532b9a0a3a5d007d150d` | `tests/construction_selection/ConstructionSelection.spec.ts` |
| `f8a46ee2550594bd79d876caf0b061f792d3a1e53334d75d4550163b99e50547` | `tests/construction_selection/ConstructionSelectionBuilder.spec.ts` |
| `c20be043c336036da619dd0c94bae33e27b35f491a4b2c357bf677fd2b92066c` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
9728c78bf2a0949c9c0f67f819e5d204b396683d7a0e7c49f85561c49e43e019
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `25dc67cfff1afd8155a7f1315288726bb0428c0a567063965316150e8f9e90ec`（implementation inventory; 9 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionSelection.ts` | `df1b1d49fb167bb04462e64e9349589d260e44135f594aefe282b7fe6d8e12ae` | UNCHANGED |
| `ConstructionSelectionBuilder.ts` | `2b9d187895b17110fd800926f3f8d9c29623cd6fe7374903d7da99a9280724d4` | UNCHANGED |
| `ConstructionSelectionTypes.ts` | `a544f1c5bc4612376ffb05943267b0a3dea5598523eec0418858ab68dde120ce` | UNCHANGED |
| `index.ts` | `66f89295a1baf6b32bce4eddab2221140248221be11aeb3ab030b1d03d4481c5` | UNCHANGED |
| `ConstructionDiscovery.ts`（Chapter 22） | `94b0cdf3a5e7c43925f05a7019909f1e8048b9eeb4aba0cd03df1502f062c7de` | UNCHANGED |
| `ContractRegistry.ts`（Chapter 22） | `4e43378fe0965744a377140e8249749d2bdf21ce0c0b83689a60fdcd0664b1da` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-23.0-001.md` is outside this inventory.
- Chapter 23 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–23 FROZEN.

---

End of Checksum Verification
