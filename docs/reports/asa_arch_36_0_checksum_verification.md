# ASA-ARCH-36.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_36_0_checksum_verification |
| Architecture | ASA-ARCH-36.0 — ASA-OPS Operational Extension Layer（ASA-ARCH-21.3 Chapter 36） |
| Spec Status | Draft 0.4 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-36.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (20 files)

| SHA-256 | Path |
|---|---|
| `9e16c2998d22c663e7d08c6e5602c027896a23872000c551ebbb2a6aa965ef9f` | `docs/baselines/ASA-ARCH-21.3.md` |
| `6aee1ee38d97b80ce8bb23669084343969f51972cbc6e19fba7a27d486c29ebd` | `docs/specs/asa_arch_36_0_asa_ops.md` |
| `e02058b5e06ffe6799cfa8f212e99fca58a9698fafa1630fe70f148f1daf1a41` | `docs/specs/asa_arch_36_0_mapping.md` |
| `4af8ef16fccaaa6f0a223f4dd7bdf1794a6ecfdf35ae167589ea9a2c025c69cb` | `jest.config.cjs` |
| `225ea458a6022f998ecc43e42d214d6f54675860fab9c974f2aae16988d25b48` | `src/extensions/asa_ops/AsaOpsLayer.ts` |
| `df8aef99d5ca184fa24e934e33556b65ada8ce57861eec1b3fd41747af7f2b71` | `src/extensions/asa_ops/index.ts` |
| `231de19823ffc6aaaa1bc20ed32b74d1860b9a61697141babad646ef9f04c6c3` | `src/extensions/asa_ops/OpsAudit.ts` |
| `3135cea720846c240f37a9e6771eb52b7e98956cd9760ad502ed63bc57bd76ac` | `src/extensions/asa_ops/OpsExecutionTrace.ts` |
| `df13e320b7b652c2ab0fa89908a35f8b936819b920c599676eeac6ba25978a0e` | `src/extensions/asa_ops/OpsExtensionContract.ts` |
| `8cdc003d9458cc733853fdb249ba19beeb019901d58512e017975f8ff04de210` | `src/extensions/asa_ops/OpsHealth.ts` |
| `22d9519094d8327ac2ac38a1cf5621692ae1c5c513d80f3c84b9cc37208c211f` | `src/extensions/asa_ops/OpsLogger.ts` |
| `93d44ad6bbb850fe0fc3ad11ce576ac29a0f8047cadcc0507333dc8886232498` | `src/extensions/asa_ops/OpsMonitoring.ts` |
| `74853d49ff7453be04f7da630d7e32baeee4a0507c872a89a802508de875c184` | `src/extensions/asa_ops/OpsObservation.ts` |
| `ea7eba9c83ec1a349c837251e9906093049c74f328b6c6091e78a4e60e68e052` | `src/extensions/asa_ops/OpsReporting.ts` |
| `fb943da6556c403d0ceb125ef5ce6308cf9e98573f64328442619a20b22f46cc` | `src/extensions/asa_ops/OpsValidator.ts` |
| `bdb953e1378b2df1b69fabff0c12f5b3baeb4c99f8bbd688c9cb2b887abe1be0` | `tests/extensions/asa_ops/AsaOpsConformance.test.ts` |
| `3dde4164b36b0453b82999559b01c6fa5da0aff3e87767513d84d0cd512724fb` | `tests/extensions/asa_ops/AsaOpsLayer.test.ts` |
| `06531625c746f5ae1d11df3a2891b4d53c7389365eab1431c56286aa16644e87` | `tests/extensions/asa_ops/opsFixtures.ts` |
| `613a9318458f785aa738c9dd4801857d8e9a3423ae8609e7bbfc34a1ba09ce2f` | `tests/extensions/asa_ops/OpsValidator.test.ts` |
| `a92629db2eca6ed6db1d639a6557e8ca07063d77596de5104ab6949e3d56ba05` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
4b038dd1f6b48ca8f7e74e87818f69d8cdacfc0bd7b1ceff019e4108f541360d
```

| Field | Value |
|---|---|
| File Count | 20 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `6b3bb6f6e0c6ac3c72be6a5298609e5b977ca2b31f01617fdb7574c0b329e2c6`（implementation inventory; 17 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `OpsExtensionContract.ts` | `df13e320b7b652c2ab0fa89908a35f8b936819b920c599676eeac6ba25978a0e` | UNCHANGED |
| `OpsValidator.ts` | `fb943da6556c403d0ceb125ef5ce6308cf9e98573f64328442619a20b22f46cc` | UNCHANGED |
| `AsaOpsLayer.ts` | `225ea458a6022f998ecc43e42d214d6f54675860fab9c974f2aae16988d25b48` | UNCHANGED |
| Ch35.1 Framework Types | `87436f97b4873f309163d542067767033cf02421a1863ac0eb38b96b418d305c` | UNCHANGED |
| Ch35.1 Framework Model | `b3d620d26eee055bfa6ebba6b0af5b1f7098ce98ed7e2fcb47a8da581adb49dc` | UNCHANGED |
| Ch35.1 Framework Builder | `e3e3ee5a7cf536013e911a5e1727db0fa11dcf0b2c141a72c57bab469f83ad19` | UNCHANGED |
| Ch35.0 Governance Types | `2ef85a745ee7b68e660c2f358f93bac1a6c9e9dd52566c1fd466ec6b24c0fdb1` | UNCHANGED |
| Ch35.0 Governance Layer | `fd68aad6ef98eba2c1a5bebf79a6c49318ab491be68a304d01cc2d904349821d` | UNCHANGED |
| Ch35.0 Governance Builder | `c23e83abe95dbdcdd36c922a8ef10271212ecaff39785dfa466527415ee31d97` | UNCHANGED |
| Ch34 Normalization Types | `1fddae6b0edff3dfef825d637c159937a1d429184a1bbdd90e0de7bc44e2322a` | UNCHANGED |
| Ch34 Normalization Record | `1075079fc4c84a58b08cdc030c4e23ad55fbb5c2d84688bdfcb484dec7e05eb4` | UNCHANGED |
| Ch34 Normalization Builder | `5bc3f591c24785a6ca9f895e4b3bac851220b63492f12312847fb43c42b3d85f` | UNCHANGED |

---

## 4. Notes

- Combined digest is computed over the sorted manifest of per-file SHA-256 lines (POSIX-style two-space separator).
- Authorization document `ASA-FREEZE-ARCH-36.0-001.md` is outside this inventory.
- Chapter 36 implementation sources were not modified after freeze authorization; baseline / architecture docs were status-updated.
- Architecture baseline now: Chapter 11–36 FROZEN.

---

End of Checksum Verification
