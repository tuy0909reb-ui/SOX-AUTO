# ASA Knowledge Record — Silicon Cycle Monitor Materials

**Record ID:** ASA-SILICON-CYCLE-MONITOR-MATERIALS-1.0  
**Title:** シリコンサイクル監視材料（年次③＋継続監視共有）  
**Document Type:** Operational Materials Baseline  
**ASA Domain:** Silicon Cycle Monitor / NISA Annual Plan ③  
**Status:** ACTIVE  
**Version:** 1.0  
**Date:** 2026-10-20  
**Authority:** HUMAN_ARCHITECT  

```text
Purpose = 共有 Review 材料の定義と投影面（年次ゲート / 定期通知）
≠ Fact / Hypothesis / Decision / Position
≠ 一括／再設計の自動断定
≠ レガシー silicon_protocol Discord 封印解除
≠ taxable_account dd15_ma200 との統合
≠ PFOS Decision / Ranking 接続
```

---

## 1. Layer

| Layer | Role |
|---|---|
| **Review / 評価材料（再生成可能）** | 本 Record の置き場 |
| Fact / Hypothesis / Decision / Position | 触らない |

---

## 2. Shared core

| Item | Path |
|---|---|
| Materials module | `scripts/silicon_cycle/materials.py` |
| Schema | `silicon_cycle_materials_v1` |
| CLI | `scripts/silicon_cycle/build_materials.py` |

**Price-required:**

- SOX vs 200DMA（位置・傾き）
- SOX vs S&P（SPY）相対 3M / 6M / 12M
- SOX 12M 分位
- 高値下落率（全売却ライン **-25%** は表示ラベルのみ）

**Legacy-compat (best-effort):**

- WSTS 3M MoM マイナス連
- TSMC YoY %

欠落時は `data_gaps` に記録し、価格材料は fail-open で出す。

`watch_hint.elevated` は **通知頻度用**のみ。買い方推奨ではない。

---

## 3. Projection A — NISA annual ③

| Item | Path |
|---|---|
| Builder | `scripts/nisa_annual/build_cycle_gate.py` |
| Output | `data/nisa/annual/<plan_year>/cycle_gate_YYYYMM.{md,json}` |
| Pointer | `data/nisa/annual/latest/pointer.json` → `cycle_gate` |

Rules parent: `ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0`  
Human reply: materials only（`NISA-ANNUAL-PLAN-AI-TEAM-RESPONSE-2026-10-17`）。

---

## 4. Projection B — Ongoing watch + Discord

| Mode | Cadence |
|---|---|
| `normal` | 毎月1日 |
| `elevated` | 毎週月曜（`watch_hint` または Human `human_force_elevated`） |

| Item | Path |
|---|---|
| Notify CLI | `scripts/silicon_cycle/run_notify.py` |
| State | `data/ops/silicon_cycle_watch.json` |
| Webhook | `SILICON_CYCLE_DISCORD_WEBHOOK` or `logs/silicon_cycle/discord_webhook.json` |
| Workflow | `.github/workflows/silicon-cycle-watch.yml` |

**Forbidden destinations:** NISA annual webhook, monthly #一般, sealed legacy `DISCORD_WEBHOOK_URL`.

Message order: 今見る理由 → 材料サマリ → 年次③との関係 → データ欠落。

---

## 5. Relation to legacy seal

Companion: `ASA-LEGACY-SOX-SENSOR-SEAL-1.0`  

- `silicon_protocol.py` remains **SEALED** for Discord.  
- Successor path = this shared materials core + dedicated watch webhook.  
- Do not revive `#大崩壊・索敵` naming as the primary ops surface.

---

## 6. Prohibitions

```text
- 一括／再設計の自動確定文言
- 商品自動入替・発注
- レガシー封印解除を本機能の完了条件にすること
- Fact / Hypothesis / Decision / Position への材料の混入
```
