# ASA-ARCH-34.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_34_0_checksum_verification |
| Architecture | ASA-ARCH-34.0 — Construction Responsibility Structural Normalization Boundary（ASA-ARCH-21.3 Chapter 34） |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-34.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (11 files)

| SHA-256 | Path |
|---|---|
| `8ba962faa17fbaadd1508426387df8bd7b0a5f595c293b9bdb0c6b9064f0f85c` | `docs/baselines/ASA-ARCH-21.3.md` |
| `5754faaa6c35f2dbe29a158af1cd2101fcd98bc79b7948f4274d2e5ecea35cb9` | `docs/specs/asa_arch_34_0_construction_responsibility_structural_normalization.md` |
| `ff0d373cf8727c4f5fc6e9eb12da5b9e97bdceeced6c80bb6a948aa3b3fa457e` | `docs/specs/asa_arch_34_0_mapping.md` |
| `cd9f899f6a5970302cc31ea2df7071ac6d61409a32372fd0e906513a47c1019c` | `jest.config.cjs` |
| `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | `src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationBuilder.ts` |
| `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | `src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationRecord.ts` |
| `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | `src/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationTypes.ts` |
| `aa9d69fd02d92ef0daddbfa03e5487bae0869af3c036d4b2e8a5e5cb4104e619` | `tests/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationBuilder.test.ts` |
| `b20ba33de2349af42cd5b00fdf372bda09f122aa73722cb75f7cba5e4860ff08` | `tests/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationConformance.test.ts` |
| `fb5096b7dc5a1cb5e57acd8a7a3d72ef8d53f00d857028dd8b3fce2092dcb931` | `tests/construction_responsibility_structural_normalization/ConstructionResponsibilityStructuralNormalizationRecord.test.ts` |
| `468779ba1d952cdfd49ced8cbaada4e2d4ec9ec1fe7e631aa134b7352334868c` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
c342a7c8afd180a385c48c9241c5e0efd087126162aabc7949b2093294d4ba8a
```

| Field | Value |
|---|---|
| File Count | 11 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `0194d7cf2b2b968dff8b9cbb9940a50a31534b963681e3a32dbc35603453a96b`（implementation inventory; 8 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConstructionResponsibilityStructuralNormalizationTypes.ts` | `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationRecord.ts` | `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | UNCHANGED |
| `ConstructionResponsibilityStructuralNormalizationBuilder.ts` | `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | UNCHANGED |
| `ConstructionResponsibilityStructuralCompatibilityValidationTypes.ts`（Chapter 33） | `494214623a75142b4226efab5498f56c9b08d1b08ef75748e0871d5115d1334a` | UNCHANGED |
| `ConstructionResponsibilityStructuralCompatibilityValidationRecord.ts`（Chapter 33） | `4666e01fe63bed4ba6c63cc7bced1be914e0bbd9c62ad4106671dfe398681b46` | UNCHANGED |
| `ConstructionResponsibilityStructuralCompatibilityValidationBuilder.ts`（Chapter 33） | `d66998347f048f22c89e4f580354465ed6367bdf880a8c4513c971e178afb5f8` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-34.0-001.md` is outside this inventory.
- Chapter 34 implementation sources were not modified after freeze authorization; baseline / architecture docs were added or status-updated.
- Architecture baseline now: Chapter 11–34 FROZEN.

---

End of Checksum Verification
