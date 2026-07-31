# ASA-ARCH-35.1 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_35_1_checksum_verification |
| Architecture | ASA-ARCH-35.1 — Extension Development Framework（ASA-ARCH-21.3 Chapter 35.1） |
| Spec Status | Draft 0.2 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-35.1-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `c895a709a7f84616e66cbff8b64fddcb1d5477c9efc0cace9ed88dbb2fd8d800` | `docs/baselines/ASA-ARCH-21.3.md` |
| `7db82538153cbca3bdf2d5d5d750402ee595dff5bc820c88e1304846c5920b68` | `docs/specs/asa_arch_35_1_extension_development_framework.md` |
| `ce01a2cfc26037d15c997210c52ed45a3b829dc9f006cf017a315d1dbc756463` | `docs/specs/asa_arch_35_1_mapping.md` |
| `b393ae66e96bb7d8e30dfa788419f7a978630754893271f0641cbba3cb32ffbc` | `jest.config.cjs` |
| `b3d620d26eee055bfa6ebba6b0af5b1f7098ce98ed7e2fcb47a8da581adb49dc` | `src/extension_development_framework/ExtensionDevelopmentFramework.ts` |
| `e3e3ee5a7cf536013e911a5e1727db0fa11dcf0b2c141a72c57bab469f83ad19` | `src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder.ts` |
| `87436f97b4873f309163d542067767033cf02421a1863ac0eb38b96b418d305c` | `src/extension_development_framework/ExtensionDevelopmentFrameworkTypes.ts` |
| `8a18fc08432acc4fb59b420168c4e80e550e133099f6b32428894ea95a09373c` | `tests/extension_development_framework/ExtensionDevelopmentFramework.test.ts` |
| `73245873f158789ae163fb91e68dc23572bb2d518844beca0d74a08229f6e6af` | `tests/extension_development_framework/ExtensionDevelopmentFrameworkBuilder.test.ts` |
| `bc0352accd2f74c4ab20d4e778ab50edd38d3b5d9d78b3e8363d546812f6cb06` | `tests/extension_development_framework/ExtensionDevelopmentFrameworkConformance.test.ts` |
| `4c979ea61f56d34c72f75eae7b2f69aee49ff58242aa366d5d0284cd2eb1e06d` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
ab99af783356af54b469a7bb7784abbc270a63c3691e91f52c23ef4a437b2267
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `16c51ccf49d7183980da18e6d375e6191a8cb8407c85d57e3e54434571be6a46`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ExtensionDevelopmentFrameworkTypes.ts` | `87436f97b4873f309163d542067767033cf02421a1863ac0eb38b96b418d305c` | UNCHANGED |
| `ExtensionDevelopmentFramework.ts` | `b3d620d26eee055bfa6ebba6b0af5b1f7098ce98ed7e2fcb47a8da581adb49dc` | UNCHANGED |
| `ExtensionDevelopmentFrameworkBuilder.ts` | `e3e3ee5a7cf536013e911a5e1727db0fa11dcf0b2c141a72c57bab469f83ad19` | UNCHANGED |
| `ExtensionGovernanceTypes.ts`（Chapter 35.0） | `2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1` | UNCHANGED |
| `ExtensionGovernanceLayer.ts`（Chapter 35.0） | `fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d` | UNCHANGED |
| `ExtensionGovernanceBuilder.ts`（Chapter 35.0） | `c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationTypes.ts`（Chapter 34） | `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationRecord.ts`（Chapter 34） | `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationBuilder.ts`（Chapter 34） | `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-35.1-001.md` is outside this inventory.
- Chapter 35.1 implementation sources were not modified after freeze authorization; baseline / architecture docs were status-updated.
- Architecture baseline now: Chapter 11–35.1 FROZEN.

---

End of Checksum Verification
