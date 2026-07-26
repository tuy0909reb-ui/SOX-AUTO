# ASA-ARCH-20.8 Checksum Verification Report

**Verification ID:** VFY-004  
**Baseline:** ASA-ARCH-20.8 — Frozen Baseline (ID Version)  
**Algorithm:** SHA-256（lowercase hex）  
**Date:** 2026-07-26  
**Purpose:** Freeze 対象成果物が改変されていないことを証明するためのチェックサム記録

---

## 1. Result

| Item | Value |
|---|---|
| VFY-004 | **PASS** |
| Missing files | 0 |
| File count | 50 |
| Combined digest | `49b25d6e7c70eb12074150732b136755dc4c2a9c699d919454fc0d53530e9f73` |

**判定理由:** Freeze 対象ファイルがすべて存在し、各ファイルの SHA-256 を取得・記録できた。欠損なし。

---

## 2. Freeze Target Inventory

### Design documents（6）

- `docs/baselines/ASA-ARCH-20.8.md`
- `docs/specs/runtime_execution_spec_v1.3.md`
- `docs/specs/asa_arch_20_8_verification_mapping.md`
- `docs/specs/asa_arch_20_8_verification_plan.md`
- `docs/adrs/ADR-20.8-001.md`
- `docs/adrs/ADR-20.8-002.md`

### Production skeleton（6）

- `src/runtime_execution/*`（全 `.ts` ファイル）

### Architecture tests（38）

- `tests/runtime_execution/*`（全ファイル）

---

## 3. File Manifest

Format: `HASH  relative/path`

```
8b2c4d9695ad5f3c9d87dc2aade9251644a33a5fcfdfa95574190612c4018a0f  docs/adrs/ADR-20.8-001.md
a868dd8052ff406c7550efac1755b148d418fa2cdbeec9cde0e8d93abfad6b55  docs/adrs/ADR-20.8-002.md
df1b3743511f91ec7dafce90ce8d26facbdcbae539f2f2274f5cd35a5088a8b2  docs/baselines/ASA-ARCH-20.8.md
4d563f98aa875fe34608967be01a8eb147fdb6a258a53d93d617e3092464e166  docs/specs/asa_arch_20_8_verification_mapping.md
d99e63c2243283cf007597640cb91fec19d91c7fd6c2ad44f806a01adca087d2  docs/specs/asa_arch_20_8_verification_plan.md
0a64f8abe38ad715b79dd159854659220ead9604d5ad2757028d5e7f34b6fb57  docs/specs/runtime_execution_spec_v1.3.md
e1f33a42a9cdebec521c878ab15480d4708c32f95998044fc7409e4147c646af  src/runtime_execution/Adapter.ts
42b2a5ed0e4ca9a066cf506cffca49c705f8db16da40d113061c61fd646e37e5  src/runtime_execution/ExecutionContext.ts
1f027cb1d9acf3ed5a75c6f26b799c11ddfa8fa21fa61fa105a27e4cc825957b  src/runtime_execution/ExecutionEngine.ts
b5dd390ccf777077d80b4f658d3a20c2b27e0a02663a3a507c758e56f2e1509f  src/runtime_execution/ExecutionLayerInput.ts
c3e17f5384c9fdf870310ca0fa46fc5b0e6ab8449b41d1f963d26f6fefab0bd5  src/runtime_execution/index.ts
6468a265ad88e727b2b48d1bdcccfd1ff7855eb705afd9e85e65475f6c9e852b  src/runtime_execution/types.ts
2ff149a79775dcc924d8ecff1672c46176f14eca298344c569aab0d881ca9aa8  tests/runtime_execution/ARCHITECTURE_TEST_LIST.md
a9bcf5154157b3d97ab2b326800cf8be5c4975730b47e7e408c9fc37a5c30481  tests/runtime_execution/DEP-001.test.ts
6d632e84d57b0680fd522081a7d1eea3556b4a06e44b1dc119989c14199ed752  tests/runtime_execution/DEP-002.test.ts
db0fac4c17a4d27d5e6eefc763449c8a9ca2531b3c8b534c697e68d56255ca52  tests/runtime_execution/DEP-003.test.ts
6c42341b404cad4337e1eef5529baa5d18f99a1a42ec061d35d272bf2fc72c5e  tests/runtime_execution/DET-001.test.ts
7902a6f0c57251b7c7a631c8cd7c0ba9a379c8592703bbe139dcebe0ae816b6b  tests/runtime_execution/ERR-001.test.ts
627db3000d45cd0e324f8275897ab1259f69b2f411fea3628ad81784a5e82cf0  tests/runtime_execution/ERR-002.test.ts
b9c39743fd45980c5c1d5c4eabf36fcf35147d6868cfb5067e8fa96a7a538ee1  tests/runtime_execution/ERR-003.test.ts
8458586d285228135025ec35ee67245ca70960c7ecdd3649f185280a412cd205  tests/runtime_execution/FLC-001.test.ts
5bcaacc96947893e5286b763141f12906366463b26b7a1f6b87885769355cf5b  tests/runtime_execution/FLC-002.test.ts
36157ce2df04e1f8e82a7e36d9c2e6762e946abbf7086b791fd3c77394e8ed95  tests/runtime_execution/FLC-003.test.ts
e355ec979dc3de682233ad4a0385e3d36e65d80ea347124f9f5f0f92227203f6  tests/runtime_execution/INV-001.test.ts
2cdbdfec9f39dd8d95fd10cc493169f255bf97100aeed95bb57c0cd1efb7afc0  tests/runtime_execution/INV-002.test.ts
0753a3444221c58b7f998af568056b3ef19facb263f22c70d76dde0a4150c9d7  tests/runtime_execution/INV-003.test.ts
f01f4e98138113b688c2d1a6a9a0c56543299cabb809095f07e611d2b70acfcc  tests/runtime_execution/INV-004.test.ts
0bea850cd090f22f519ac8112ce8ed25fb14d7224c6f42b910489c7683f4dde3  tests/runtime_execution/INV-005.test.ts
ffcee42b26484ae7580ec516ef52931231884512f5c31ead49df96cbf1990b2d  tests/runtime_execution/INV-006.test.ts
33214c8b5238e47b35eee55ac4354958df58c4600872947c8e56a20ad200b81e  tests/runtime_execution/INV-007.test.ts
f48eba252414bc749537e086bd6482f91dbf39e4aa645814b42a42039b207301  tests/runtime_execution/RB-ADP-001.test.ts
1ca4e8b7874ce3495866b6875fe6d29b4d9de600a4600ae7842d430c65de035a  tests/runtime_execution/RB-ADP-002.test.ts
268dcb8c24fb9c6537d7c4cb6721ad7c39c7a3d99990ef711110156021deb158  tests/runtime_execution/RB-ADP-003.test.ts
cc120c720b1d9422400bba647254300bc606088ce03847e4844c2f58f9ade118  tests/runtime_execution/RB-ADP-004.test.ts
bcf3e98f464df4f481e9e72d721318b2e15698e78db95087b2046f1c98f6079a  tests/runtime_execution/RB-CTX-001.test.ts
202b75d92ea5dc368a435c3faba638653c3f17b5efeb5450016291765570f408  tests/runtime_execution/RB-CTX-002.test.ts
102f8c708b14cf776634e1921a0016617b07ecf2e246061cdaf1c1adafa3b8a2  tests/runtime_execution/RB-CTX-003.test.ts
b6beed11396bfdabff52bbe75923c408362ca54cc623fc74cdf3d203d44b3661  tests/runtime_execution/RB-CTX-004.test.ts
4cd55b0c087030e8c7475425a1d9bc29f6c8cc630c3c4f9a837d16fb2d1be46a  tests/runtime_execution/RB-ENG-001.test.ts
2d6f5de8b2bc6ce5a584e70adcadeda1df26c9975cc7f432a946ebc742b3e916  tests/runtime_execution/RB-ENG-002.test.ts
295147a0e266e250da8e7d01b4f8a066144efccb05fe0ecd20ce60d8466a6c2f  tests/runtime_execution/RB-ENG-003.test.ts
12e0a4f6455f9034c36e374bcff99959979e3a5f249236cc5b9c2786e0c8559d  tests/runtime_execution/RB-ENG-004.test.ts
c4ebcabac684149c4b9fc7bda1030e58b4ec6adb9ba1aefae93ca2005501484c  tests/runtime_execution/RB-ENG-005.test.ts
b62aad9b43890e76d0a57d9b9c52a2abd088c21b44634a741cacd042830fc796  tests/runtime_execution/RB-ENG-006.test.ts
d17c04a4b37d54ca43ee4bcbdff61d72f07c767639247ea6a54de5a515cf5ca2  tests/runtime_execution/RB-ENG-007.test.ts
beb4e22085d643598e00c1aaab1754d8810fa09f58beee890f5e7bccfaf813a6  tests/runtime_execution/README.md
82964d4153822cf67361e84783f1e20057af4663d96ca24942b3c10bce020d20  tests/runtime_execution/SEM-001.test.ts
d48eae175b4fbaf2e063ff508da909d24984664699aff4bc097a8b8eefb0a5dc  tests/runtime_execution/SEM-002.test.ts
4cc280c9d9a620f6d8450bd136fc2aae820f8f954f234bcb389cdc60b7247a7d  tests/runtime_execution/TODO.md
88e0d8b29624c024a8e7233f993869815d559e8ca14e2642a4fab9311f3a36a5  tests/runtime_execution/execution_engine_basic.test.ts
```

---

## 4. Notes

- Commit / Tag 発行、Baseline `Commit` 欄更新は本レポートの範囲外（未実施）。
- 以降の改変検知は、本 manifest の各 HASH および Combined digest との照合により行う。
