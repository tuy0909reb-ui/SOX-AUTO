# ASA-ARCH-37.0 — Checksum Verification

| Field | Value |
|---|---|
| Document ID | asa_arch_37_0_checksum_verification |
| Architecture | ASA-ARCH-37.0 — ASA-CONNECT External Integration Boundary Layer（ASA-ARCH-21.3 Chapter 37） |
| Spec Status | Draft 0.3 / FROZEN |
| Freeze Authorization | ASA-FREEZE-ARCH-37.0-001 |
| Algorithm | SHA-256 |
| Encoding | UTF-8 manifest lines: `<hash>  <path>` + trailing newline |
| Combined Digest | Sorted path order, then SHA-256 of the full manifest text |
| Issuance | Post–freeze authorization inventory recompute |

---

## 1. Inventory (22 files)

| SHA-256 | Path |
|---|---|
| `01ac0940c548abf660ccb9ff7044fd8aaffa122432dc2457ac72adf554bf6b18` | `docs/baselines/ASA-ARCH-21.3.md` |
| `cd549b2ed6186b73085295aba6b111297dcedc7c08d0cbe6f11ae1ed13bb935d` | `docs/specs/asa_arch_37_0_asa_connect.md` |
| `dfb4c0790ad5fede4caeb69219874659fe434d82612637044c62e2ea5738075f` | `docs/specs/asa_arch_37_0_mapping.md` |
| `35b312ad3a94e6e94e618e812b184aa13009a316699d5f7235ceb37511171a0a` | `jest.config.cjs` |
| `b28b7c7078e0d44bdbf0a96e7cef69776847b19894859bcd50517cf154528a8f` | `src/extensions/asa_connect/AsaConnectLayer.ts` |
| `1b5788f1c31f352f980e0c834777e724b1a3df98d4dad1dfd42d179dc3052ca5` | `src/extensions/asa_connect/AuthenticationBoundary.ts` |
| `de693e151b979d0a2ab3be507e3aa6cb60230458a7ed9cbb3c97c53307f54dc7` | `src/extensions/asa_connect/ConnectExtensionContract.ts` |
| `130336a67a1111da7c42489db2b5cd37d60eee3ad14d6288da84dfa759ba0883` | `src/extensions/asa_connect/ConnectorDefinition.ts` |
| `05c294452c6b89c2e53ac1686d5200a23e74c77a92ac205667a9cdc344568ba1` | `src/extensions/asa_connect/ConnectorErrorContract.ts` |
| `622e0ab8dc2d2bd0612205d5c8c12e592a507aefa17bd9cc8c4d3e788441da76` | `src/extensions/asa_connect/ConnectorLifecycleValidator.ts` |
| `7f1b5b9ebd84d13dd948ff3af1bc9226e57be3990fd2a0366e7dda24c118a431` | `src/extensions/asa_connect/ConnectorRouter.ts` |
| `bcf81c3ddc48df84fdbfbf611513ba3cee13c7b7195d56bc8128234b474dc8a5` | `src/extensions/asa_connect/ConnectValidator.ts` |
| `2b43e9d904b982a36c5c3a91eceeae455c7c0eb1520680c7958434bcff060f69` | `src/extensions/asa_connect/DataTransformationContract.ts` |
| `16bfbc3e1c46a0fc567f449383347b809b60f1d5beafa5b742fbaf0997a34f4a` | `src/extensions/asa_connect/ExternalDataContract.ts` |
| `83f12c73f7afcb52a6223fb1d59bb1cf4709650695f597aafff1568e6a82b75e` | `src/extensions/asa_connect/ExternalRequestGuard.ts` |
| `0ddffad36aa33139f9ddc39117adf0dc138f9bc36bbf8377bff941f64bc8a480` | `src/extensions/asa_connect/index.ts` |
| `c9d0418a47e217752c2671d7cfd3f478479a18fc615f2b20c80d0c1c5183f047` | `src/extensions/asa_connect/OutboundConnectorBoundary.ts` |
| `84cf8ea69a8056c1513fe3e58936fe2de6bca58b69638013694f2d4e221fe31e` | `tests/extensions/asa_connect/AsaConnectConformance.test.ts` |
| `fc205132a453cf6073cbe6e07dfa443640febb320125ebe5f7de3ba3816b1ab0` | `tests/extensions/asa_connect/AsaConnectLayer.test.ts` |
| `bfd0793685c579b1b7a7e14178a1db0909f2a3405d6a34b9f86e6532e0c2bfe9` | `tests/extensions/asa_connect/connectFixtures.ts` |
| `30bb7c7c6893acfd73564b175b008e09eaa24e7f5d07910ba1531e266c16ddab` | `tests/extensions/asa_connect/ConnectValidator.test.ts` |
| `3a18ed54f3c281f64a1e12d8664b35c8a6cafcad332fde700115356d1eb4c533` | `tsconfig.json` |

---

## 2. Combined SHA-256

```text
729869f0ee1fdb318b446295e0f2976d11d2377f574e8766c5adc7204f327b53
```

| Field | Value |
|---|---|
| File Count | 22 |
| MATCH | True (at issuance of this report) |
| Authorization Docs | Excluded from inventory |
| Pre-freeze Combined SHA-256 | `32fff3f20453d8886a37cc82d6a79f6652dfdfff87a0ac92a9862a8dccf3be2f`（implementation inventory; 19 files before freeze-status / architecture docs） |

---

## 3. Frozen Source Spot-Checks

| Artifact | SHA-256 | Result |
|---|---|---|
| `ConnectExtensionContract.ts` | `de693e151b979d0a2ab3be507e3aa6cb60230458a7ed9cbb3c97c53307f54dc7` | UNCHANGED |
| `ConnectValidator.ts` | `bcf81c3ddc48df84fdbfbf611513ba3cee13c7b7195d56bc8128234b474dc8a5` | UNCHANGED |
| `AsaConnectLayer.ts` | `b28b7c7078e0d44bdbf0a96e7cef69776847b19894859bcd50517cf154528a8f` | UNCHANGED |
| Ch36 OpsExtensionContract | `df13e320b7b652c2ab0fa89908a35f8b936819b920c599676eeac6ba25978a0e` | UNCHANGED |
| Ch36 OpsValidator | `fb943da6556c403d0ceb125ef5ce6308cf9e98573f64328442619a20b22f46cc` | UNCHANGED |
| Ch36 AsaOpsLayer | `225ea458a6022f998ecc43e42d214d6f54675860fab9c974f2aae16988d25b48` | UNCHANGED |
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
- Authorization document `ASA-FREEZE-ARCH-37.0-001.md` is outside this inventory.
- Chapter 37 implementation sources were not modified after freeze authorization; baseline / architecture docs were status-updated.
- Architecture baseline now: Chapter 11–37 FROZEN；Extension Foundation（OPS + CONNECT） COMPLETE.

---

End of Checksum Verification
