# ASA-ARCH-22.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_22_0_checksum_verification |
| Architecture | ASA-ARCH-22.0 — Construction Discovery（ASA-ARCH-21.3 Chapter 22） |
| Spec Status | Draft 0.7 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-22.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (9 files)

| SHA-256 | Path |
|---|---|
| `7dd3afe05e8dd260e24cc8aaf9a549623fce8264096701620de63fb89a82f2c5` | `docs/baselines/ASA-ARCH-21.3.md` |
| `a562211eb762fb773449046ec77fb5905de5865f7e607dc7fb933f9bbd08257d` | `docs/specs/asa_arch_22_0_ch22_verification_mapping.md` |
| `6e70af8cce4febab0d6629a430f334f01e8e7d0cd11fc89a1345ec5ab68369f7` | `docs/specs/asa_arch_22_0_construction_discovery.md` |
| `b1a544b68c29728ba95bf182636dff5e25439ed6872f4e820f4ea70d9ae0b9ed` | `jest.config.cjs` |
| `94b0cdf3a5e7c43925f05a7019909f1e8048b9eeb4aba0cd03df1502f062c7de` | `src/contracts/construction/ConstructionDiscovery.ts` |
| `4e43378fe0965744a377140e8249749d2bdf21ce0c0b83689a60fdcd0664b1da` | `src/contracts/registry/ContractRegistry.ts` |
| `08c10d8858e1260cfe702ea4350c883c9578f7c614094be76f94175dc80a88fb` | `tests/contracts/construction/ConstructionDiscovery.test.ts` |
| `4c93637d116af66dfb2d183b60778f94ce3ed722ead99529f72a9f69f4901e37` | `tests/workflow/architecture_constraints.test.ts` |
| `0d275029886a2757bc753cfe13a17ac7a9b59caa7110f54c46b2ed12736fe7ae` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
2d27bf2e3f40a31d45b86ab1fcbb2622822555dcd63a7c84b4fe6208722680bc
```

| Field | Value |
|---|---|
| File Count | 9 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `acd33bed19403696fcc760f35d18b413146f2663425f51e1519a0685ed20ae1c`（verified at authorization） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `src/contracts/construction/ConstructionDiscovery.ts` | `94b0cdf3a5e7c43925f05a7019909f1e8048b9eeb4aba0cd03df1502f062c7de` | UNCHANGED |
| `src/contracts/construction/ConstructionCatalog.ts` | `7d86872e2d825c597c7c9e3694ce6b30fa1edebf8f1ae0dc9f7aefb13b010809` | UNCHANGED (Chapter 21) |
| `src/contracts/construction/ConstructionRegistry.ts` | `c7285f57707e5b077cfade328f240f3f4dcbe2e71352a8282262163e4c4dec30` | UNCHANGED (Chapter 20) |
| `src/contracts/construction/ConstructionDefinition.ts` | `56f06a0e52c903bb147fe98c8075f479b5f8a95c87373eb015c794bf32c844a0` | UNCHANGED (Chapter 19) |
| `src/workflow/CompositionBoundaryContract.ts` | `deeea188a11bafa7aac33126cf3583a1e90493b5434b64f1ad2bc6994a5ea3bf` | UNCHANGED (Chapter 11) |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-22.0-001.md` is outside this inventory.
- Chapter 22 source was not modified after freeze authorization; only status documentation changed.
- Post-freeze combined digest differs from pre-freeze solely due to baseline / spec freeze-status text updates.
- Architecture baseline now: Chapter 11–22 FROZEN.

---

End of Checksum Verification
