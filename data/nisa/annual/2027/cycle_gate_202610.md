# 【③シリコンサイクルゲート】NISA 2027 計画材料

**Plan year:** 2027  
**As of:** 2026-10-17  

役割: 翌年の買い方（年初一括 / 再設計）の**検討材料**。商品入替ゲートではない。

---

**Schema:** `silicon_cycle_materials_v1`  
**Layer:** Review_materials  
**Generated:** 2026-10-19T20:07:09Z

## 判断スコープ

- 対象: シリコンサイクル監視材料（年次③ゲート＋継続監視共通）
- 期間: as_of=2026-10-17
- N: SOX価格必須；WSTS/TSMCは任意
- 評価目的: 年次の買い方確認材料と警戒年の定期確認材料
- 判断可能範囲: 材料の把握・Humanによる年初一括／再設計の検討開始
- 判断禁止範囲: 一括／再設計の自動断定、発注・入替、Decision接続

## 価格材料

- SOX終値: 11137.29（effective_end=2026-10-16）
- 250日高値: 14634.72
- 高値下落率: 23.90%
- 全売却ライン表示（材料）: 閾値 -25% / 到達=NO
- 200DMA: 10597.64 （終値下回り=NO / 傾き下落=NO）
- 12M分位: 0.563

### SOX vs S&P500（SPY）相対

| 窓 | SOX | SPY | 超過 |
|---|---:|---:|---:|
| 3M | -6.15% | 1.92% | -8.07% |
| 6M | 19.38% | 9.33% | 10.05% |
| 12M | 63.78% | 16.78% | 47.00% |

## レガシー互換センサー（任意）

- WSTS 3M MoMマイナス連: N/A （raw=None）
- TSMC YoY: N/A （raw=None / soft_threshold=10%）
- 200MA判定灯: GREEN

## 監視ヒント（スケジュール用）

- elevated: **YES**
- reasons: drop_from_high_ge_15pct
- note: Schedule cadence only. Not a buy-method recommendation.

## データ欠落

- （なし）

## Human判断欄（年次③）

- [ ] 年初一括のまま
- [ ] 買い方を再設計
- メモ:

---

材料のみ。推奨・自動入替・発注なし。レガシーsilicon_protocol Discord封印は解除しない。