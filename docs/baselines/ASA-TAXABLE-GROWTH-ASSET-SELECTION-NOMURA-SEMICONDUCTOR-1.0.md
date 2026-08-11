# ASA Knowledge Record — Taxable Growth Asset Selection: Nomura World Semiconductor

**Record ID:** ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
**Title:** 特定口座 Growth Asset 選定判断記録 — 野村世界半導体 採用判断  
**Document Type:** Design Judgment / Growth Asset Selection Decision  
**ASA Domain:** 特定口座局面運用設計  
**Category:** Growth Asset Selection Decision  
**Status:** **DESIGN VALIDATED**  
**Implementation Frozen:** **NO**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Version:** 1.0  
**Date:** 2026-08-03  
**Timestamp:** 2026-08-03T05:50:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
**Previous Related Records:**  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CANDIDATE ONLY**（投資推奨・売買認可ではない）

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/d4b20001-ede9-4634-8542-fc6f04d0db78.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/d4b20002-cb46-42e3-87e6-f5e102f8b671.json` | CREATED |
| Evidence — Asset Selection | `data/common_backtest/reports/longterm_semiconductor_asset_selection/` | REFERENCE |
| Evidence — PROTO100 Strategy | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md` | CONNECTED |
| Evidence — Durability | `data/common_backtest/reports/nomura_proto100_durability_validation/` | REFERENCE |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize trading, capital transfer, or permanent lock-in.
This record does NOT guarantee future returns.
Design Validated ≠ Implementation Frozen ≠ Live Trading Authorization.
Preserve selection judgment and evaluation criteria only.
```

---

## 1. Purpose

特定口座局面運用設計における Growth Asset（成長資産）の選定判断理由を保存する。

```text
Save product-selection judgment + evaluation criteria
≠ Investment recommendation
≠ Trading authorization
≠ Permanent hold guarantee
≠ Future return guarantee
```

---

## 2. Classification Scope

| Field | Value |
|---|---|
| Registration Name | ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0 |
| ASA Domain | 特定口座局面運用設計 |
| Category | Growth Asset Selection Decision |
| Status | DESIGN VALIDATED |
| Implementation Frozen | NO |
| Trading Authorization | NOT AUTHORIZED |

---

## 3. Decision Summary

| Field | Value |
|---|---|
| Selected Growth Asset | 野村世界業種別投資シリーズ **世界半導体株投資** |
| Dataset / NAV key | `World Semiconductor` |
| Role | 特定口座における **Growth Asset** |
| Current Decision | **採用候補として固定管理する**（実装凍結・売買認可ではない） |

---

## 4. Decision Background

Growth Asset候補として比較検討した例:

- SOX系ETF（指数連動）
- 2243 等指数連動商品
- 野村世界半導体
- その他半導体関連商品

評価は単純な指数連動性ではなく、次を基準とした。

| Criterion | Intent |
|---|---|
| Theme Fit | 半導体成長テーマへの適合 |
| Holdings Structure | 保有構造・集中度の把握 |
| Concentration | 集中リスクの認識（除外条件ではない） |
| Historical Performance | 検証期間のリターン特性 |
| Volatility | 高ボラ＝短期売買対象としない |
| Cost | 信託報酬等を認識したうえでの合理性 |
| Regime Adaptability | 局面運用（Alert/移管）との接続性 |

Evidence reference（read-only）:

- `data/common_backtest/reports/longterm_semiconductor_asset_selection/`
- `final_selection_report.md` / `product_structure.csv` / `return_comparison.csv`

---

## 5. Selection Reason

### Primary Reason

半導体成長テーマへの集中投資として、過去検証期間において高いリターン特性を確認したため。

### Confirmed Stance

```text
- アクティブファンドであること自体は除外理由としない
- 銘柄選択による超過収益可能性を評価対象とする
- 高ボラティリティは短期売買対象を意味しない
```

### Decision Statement

```text
過去実績では、
アクティブ運用コストを考慮しても、
Growth Assetとして採用する合理性を確認した。
```

---

## 6. Integration with Taxable Protocol

Current architecture（設計接続）:

```text
Normal:
  野村世界半導体 保有

Sensor:
  dd15_ma200

Growth終了判定:
  成長前提が崩れた可能性を検知

Action:
  Swing Protocol 100%移管

Recovery:
  Re-entry条件成立後、野村世界半導体へ復帰
```

| Related | State |
|---|---|
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 | **CONNECTED** — Growth Asset側の商品選定 |
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0 | **CONNECTED** — 移管定義 |
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED COMPONENT** — Alert時運用袖 |

本Recordは商品選定判断であり、移管プロトコル本体の変更ではない。

---

## 7. Evaluation Result（Recorded Finding）

野村世界半導体は、次を総合評価し、特定口座 Growth Asset 候補として採用する。

- 高成長テーマ適合性
- 過去リターン
- 局面運用との接続性（PROTO100耐久検証との接続）

Supporting headline（接続検証・参考）:

| Context | Finding |
|---|---|
| Asset selection | 高リターン特性・テーマ適合（コスト・集中は認識） |
| PROTO100 durability | 野村×PROTO100で税引後優位・4/5期間耐久（別Record） |

---

## 8. Risk Record

| # | Risk | Content |
|---|---|---|
| 1 | Active Fund Risk | 運用者判断 / 銘柄選択能力 / 組入変更 |
| 2 | Theme Risk | 半導体成長率低下 / AI投資循環変化 / 産業構造変化 |
| 3 | Cost Risk | 信託報酬 / 購入時コスト等 |

これらは欠陥ではなく、選定時に認識する残存リスクとして記録する。

---

## 9. Monitoring Policy

### Future Review Items

- ファンド組入銘柄変化
- コスト変更
- 半導体市場構造変化
- 成長テーマ継続性

### Review Trigger

```text
Growth Assetとしての前提条件が変化した場合のみ再評価する。
日常的な価格変動のみでは再選定しない。
```

---

## 10. Decision Boundary

| YES | NO |
|---|---|
| 現時点でのGrowth Asset選択判断保存 | 永久保有保証 |
| 特定口座設計上の採用候補固定 | 売却禁止 |
| 将来再評価時の判断基準保持 | 市場予測確定 |
| | 売買実行認可 |
| | 投資推奨・将来収益保証 |

---

## 11. Next Phase

```text
1. 組入・コスト・テーマ前提のモニタリング
2. 前提変化時のみ再選定検証
3. PROTO100運用判断メモとの併用参照
```

Until then:

```text
Record: ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
Selected Growth Asset: Nomura World Semiconductor (candidate lock for design)
```

---

## 12. Disclaimer

本記録は成長資産選定の設計判断保存であり、  
投資推奨・将来収益の保証・取引実行の認可・永久固定・既存Freeze改訂ではない。
