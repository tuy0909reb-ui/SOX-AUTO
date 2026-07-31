# ASA-ARCH-35.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_35_0_checksum_verification |
| Architecture | ASA-ARCH-35.0 — Extension Governance Layer（ASA-ARCH-21.3 Chapter 35） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-35.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `53fb48994bea7582d0a58774239ff713128ae42bcc726b2c1f10dbdaf876fe73` | `docs/baselines/ASA-ARCH-21.3.md` |
| `894371828c7df7215222aa16e03ed9a9256ca52555a3327992e25cb3f0e7d4b9` | `docs/specs/asa_arch_35_0_extension_governance.md` |
| `c2eb65d53147cc9360196b94c3d8802f5e9ac3c86445483e0541578dd29f6cd1` | `docs/specs/asa_arch_35_0_mapping.md` |
| `fa66e01de32c17ec6975c7fa622172d653460923ce67460742a02f167bc50f86` | `jest.config.cjs` |
| `c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97` | `src/extension_governance/ExtensionGovernanceBuilder.ts` |
| `fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d` | `src/extension_governance/ExtensionGovernanceLayer.ts` |
| `2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1` | `src/extension_governance/ExtensionGovernanceTypes.ts` |
| `a6c6ce95933bba7653c8408d030b7abb62dd61c3d2a9c606abad9ca53e75993b` | `tests/extension_governance/ExtensionGovernanceBuilder.test.ts` |
| `694dc023ebe4cb5cc699dd77a3f41c9adcb03c85825642b695e6c8d791e718f7` | `tests/extension_governance/ExtensionGovernanceConformance.test.ts` |
| `019d5d66d4f1ed4c1ceebd019e247df68fe0f5b44104c8485094d28963c72670` | `tests/extension_governance/ExtensionGovernanceLayer.test.ts` |
| `735d04846c2f0d5d3401961e2db845a46f37d437492b72e362a2fe72f9c2a606` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
a21a34f087bf3abc36fa27aa58e873956e07ff953596769e39a3097788fb4bd3
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `0240bd4b8bbe560e92ead120da2bff84d3ecbbf6130cc673b9659e16acbdfef7`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ExtensionGovernanceTypes.ts` | `2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1` | UNCHANGED |
| `ExtensionGovernanceLayer.ts` | `fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d` | UNCHANGED |
| `ExtensionGovernanceBuilder.ts` | `c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationTypes.ts`（Chapter 34） | `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationRecord.ts`（Chapter 34） | `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationBuilder.ts`（Chapter 34） | `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-35.0-001.md` is outside this inventory.
- Chapter 35 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–35 FROZEN.

---

End of Checksum Verification
