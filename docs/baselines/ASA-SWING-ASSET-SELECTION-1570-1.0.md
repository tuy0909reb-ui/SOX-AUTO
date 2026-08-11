# ASA Knowledge Record — Swing Asset Selection: 1570 Standard Continuation

**Record ID:** ASA-SWING-ASSET-SELECTION-1570-1.0  
**Title:** 特定口座 Swing Asset 選定判断記録 — 1570 標準継続  
**Document Type:** Design Judgment / Swing Asset Selection Decision  
**ASA Domain:** 特定口座 / Swing Protocol  
**Category:** Swing Asset Selection  
**Status:** **DESIGN VALIDATED**  
**Implementation Frozen:** **NO**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Version:** 1.0  
**Date:** 2026-08-11  
**Timestamp:** 2026-08-11T07:13:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-SWING-ASSET-SELECTION-1570-1.0  
**Previous Related Records:**  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CANDIDATE ONLY**（投資推奨・売買認可ではない）

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-SWING-ASSET-SELECTION-1570-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-SWING-ASSET-SELECTION-1570-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/ffc983b9-94e9-480d-a9c2-58f84079efe6.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/ff97d515-9ad9-4d10-8968-9f86e8a71bd8.json` | CREATED |
| Evidence — Product Comparison | `data/common_backtest/reports/swing_asset_product_comparison/` | REFERENCE |
| Evidence — 1570/1579 Gap | `data/common_backtest/reports/swing_asset_product_comparison/1570_vs_1579_gap/` | REFERENCE |
| Evidence — FREEZE | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` | CONNECTED（未変更） |
| Evidence — PROTO100 | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md` | CONNECTED（未変更） |
| Evidence — Growth Selection | `docs/baselines/ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` | CONNECTED（未変更） |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize trading, capital transfer, or permanent lock-in.
This record does NOT modify ASA-SWING-PROTOCOL-FREEZE-1.0 Entry/Holding/Exit/Re-entry/Sensor.
This record does NOT change Growth Asset selection.
Design Validated ≠ Implementation Frozen ≠ Live Trading Authorization.
Preserve Swing Asset selection judgment and comparison evidence only.
```

---

## 1. Purpose

特定口座 Swing Protocol における **標準 Swing Asset（crash sleeve）選定判断** を保存する。

```text
Save product-selection judgment + comparison evidence + corrections
≠ Protocol rule change
≠ Trading authorization
≠ Capital transfer authorization
≠ Permanent product lock
```

---

## 2. Classification Scope

| Field | Value |
|---|---|
| Registration Name | ASA-SWING-ASSET-SELECTION-1570-1.0 |
| ASA Domain | 特定口座 / Swing Protocol |
| Category | Swing Asset Selection |
| Status | DESIGN VALIDATED |
| Implementation Frozen | NO |
| Trading Authorization | NOT AUTHORIZED |

---

## 3. Decision Summary

| Field | Value |
|---|---|
| Selected Standard Swing Asset | **1570**（NEXT FUNDS 日経平均レバレッジ・インデックス連動型上場投信） |
| Leverage class | 約2x / Nikkei leveraged index ETF |
| Role | 現行 Swing Protocol における **標準 Swing Asset（採用候補固定）** |
| Current Decision | **1570を標準Swing Assetとして継続する**（実装凍結・売買認可ではない） |

---

## 4. Decision Background

当初のSwing Protocol設計では1570を基準Swing Assetとして採用していた。

その後、次を追加検証した。

- 2倍レバレッジ商品の比較（1570 / 1579 / 1458 / 1568）
- 3倍ブル・4.3倍ブル（実NAV優先）
- ETFと投資信託のExecution差
- 1570 vs 1579の差分原因分析

目的は、

> 1570より高いレバレッジ、低コスト、異なる指数の商品を使用することでSwing期待値を改善できるか

を確認することであった。

本Recordは **Asset選定判断のみ** を保存する。  
FREEZE-1.0 の Entry / Holding / Exit / Re-entry / Sensor / Growth は変更しない。

---

## 5. Comparison Evidence（要約）

Primary evidence（read-only）:

- `data/common_backtest/reports/swing_asset_product_comparison/`
- `data/common_backtest/reports/swing_asset_product_comparison/1570_vs_1579_gap/`

比較対象:

- 1570 / 1579 / 1458 / 1568
- 楽天日本株トリプル・ブル（3x）
- 楽天日本株4.3倍ブル（4.3x）
- SBI日本株4.3ブル（実NAV完全比較未成立・合成未使用）

Phase1（2018-01-31〜・1570=100）主要結果:

| Product | Final index | CAGR (approx) | MaxDD (approx) | Win rate |
|---|---:|---:|---:|---:|
| 1570 | 100 | 40.9% | -41.5% | 72% |
| 1579 | ~100.6 | ~41.0% | ~-41.4% | 72% |
| 1458 | 95.9 | — | — | 72% |
| 1568 | 92.5 | — | — | 72% |
| 楽天3x | 49.9 | 29.8% | -69.5% | 60% |
| 楽天4.3x | 57.4 | 32.0% | -77.7% | 60% |
| SBI4.3x | NAV incomplete | — | — | — |

---

## 6. High-Leverage Conclusion

3x / 4.3xについて、レバレッジ倍率そのものの粗い期待リターンは存在し得る。

しかし現行 Swing Protocol（短中期crash保有 + Growth復帰）では、

- ボラティリティ・ドラッグ
- 急回復局面での取り逃し
- コスト
- 投資信託のNAV約定 / Execution lag / T+3拘束

を含めると、実商品ベースのSwingリターンは **1570を上回らなかった**。

```text
Hypothesis REJECTED (under current FREEZE-1.0 + PROTO100):
「高レバレッジ商品へ変更すればSwing期待値が改善する」
```

3x / 4.3xを採用する場合は、現行FREEZE-1.0の単純なAsset replacementではなく、  
Execution / Holding / Exit を含む **新規Protocol検証** が必要。

---

## 7. 1579 Correction（誤情報訂正）

以前提示されていた次の情報は **採用しない**。

```text
WRONG / WITHDRAWN:
1579 = 日興アセット
TER = 0.385%
→ 「約0.495%/年の低コストだから1579へ変更」
```

今回の検証で使用・確認した扱い:

```text
CORRECTED:
1579 = 日経平均ブル2倍上場投信（シンプレクス）
公的資料上のTER ≒ 0.825%
```

したがって、旧情報を根拠とした「低コストだから1579へ変更する」判断は **撤回** する。

---

## 8. 1570 vs 1579 Difference Analysis

Evidence: `data/common_backtest/reports/swing_asset_product_comparison/1570_vs_1579_gap/`

| Item | Result |
|---|---|
| Swing crash trades | 25 |
| 1579 wins / 1570 wins | 13 / 12 |
| Mean trade diff | ~+2.7 bp |
| Final index gap | ~+0.55 pt |
| Top-3 impact share | ~38% |
| Execution diff | **NONE**（同一 same-bar + slip） |
| CA-cleaned Buy&Hold | 1579は優位ではなく、むしろ1570優位 |

評価:

```text
+0.55pt = structural superiority ではない
= Swing timing / sample-path dependent small gap
= 商品変更を正当化する再現性は未確認
```

---

## 9. Decision

### Selected Standard Swing Asset

**1570**

### Adoption Reasons

1. 現行Swing Protocolで既に検証済み
2. 短中期Swingに必要な流動性・Execution整合性が高い
3. 1579との差は実質的に誤差範囲
4. 1579に構造的優位を示す証拠がない
5. 3x / 4.3xは実商品ベースで明確に劣後
6. 現行Protocolを変更せず継続利用できる
7. 商品変更による複雑性を増やす合理性が現時点でない

### Final Design Judgment

1570があらゆる条件で最強だからではない。

現行Swing Protocolという短中期crash保有モデルにおいて、

- 2倍ETF間の差は小さい
- 1579の優位性は再現性を確認できない
- 3x / 4.3xは実商品ベースで劣後
- ETFのExecution特性がGrowth復帰との接続に適している
- 商品変更による追加複雑性を正当化する期待値が確認できない

という総合判断により、**現時点の最適な設計判断は「1570継続」** とする。

---

## 10. Decision Boundary

### IN SCOPE

- 1570を標準Swing Assetとして保持（採用候補固定）
- 商品比較結果の保存
- 1579の誤情報訂正
- 高レバレッジ商品の非採用判断（現行Protocol下）
- 将来の再評価基準の保存

### OUT OF SCOPE

- Swing Protocol FREEZE-1.0の変更
- Entry / Holding / Exit / Re-entry 変更
- dd15_ma200 / Sensor 変更
- Growth Asset 変更
- Live資金移動
- Trading Authorization
- 資金配分変更

```text
Existing related Records are CONNECTED by reference only.
This registration does NOT mutate:
- ASA-SWING-PROTOCOL-FREEZE-1.0
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0
```

---

## 11. Future Re-evaluation Trigger

1570を永久固定とはしない。新Versionで再評価する条件:

- 1570を明確に上回る再現性のある商品優位性が確認された場合
- 1570の流動性・Execution特性がSwing用途に対して悪化した場合
- 新たなレバレッジ商品が登場した場合
- コスト・追随性・Executionを含む総合優位性が確認された場合
- Swing Protocol自体のHolding期間やExecution条件が変更される場合

特に高レバレッジ商品は、単純なAsset replacementとして扱わない。  
Protocol側の再設計を伴う新検証が必要。

---

## 12. Related Records（reference only / unmodified）

| Related ID | Connection |
|---|---|
| ASA-SWING-PROTOCOL-FREEZE-1.0 | CONNECTED — Entry/Holding/Exit rules unchanged |
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 | CONNECTED — PROTO100 transfer strategy unchanged |
| ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0 | CONNECTED — Growth Asset unchanged |

---

## 13. Closing Stamp

```text
ASA-SWING-ASSET-SELECTION-1570-1.0
Status: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
Selected Standard Swing Asset: 1570
High-leverage (3x/4.3x) under current Protocol: NOT ADOPTED
1579 TER/issuer misinfo: CORRECTED / WITHDRAWN as change rationale
FREEZE-1.0 mutation: NONE
```
