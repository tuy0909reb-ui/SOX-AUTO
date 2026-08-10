# ASA Knowledge Record — Taxable Account Protocol Legacy Boundary (Phase 1)

**Record ID:** ASA-TAXABLE-ACCOUNT-PROTOCOL-LEGACY-BOUNDARY-1.0  
**Title:** 特定口座運用プロトコル再構築 Phase 1 — Legacy境界定義  
**Document Type:** Knowledge / Migration Boundary Record  
**ASA Domain:** Taxable Account Operations Architecture  
**Category:** Legacy Separation  
**Status:** **CONFIRMED / RECORDED**  
**Version:** 1.0  
**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:30:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE1-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Architecture Change:** **NONE**（凍結済み ASA-ARCH-* は変更しない）

```text
Purpose = Legacy分離 + 参照境界の定義
≠ Legacyコード改修
≠ 実運用接続
≠ Growth / Entry / Freeze 仕様の改変
```

---

## 1. Purpose

既存の個別プロトコル群を **STATUS: LEGACY** として分離し、新特定口座統合プロトコルがそれらへ **直接依存しない** 境界を定義する。

```text
既存: 個別プロトコル中心
  ↓ Legacy化（参照・検証・知識抽出のみ）
新: 特定口座全体を管理する統合運用ロジック
```

---

## 2. Legacy Policy

| Rule | Definition |
|---|---|
| STATUS | **LEGACY** |
| Change | **禁止**（機能追加・仕様変更・運用接続の拡張をしない） |
| Allowed use | 参照 / 検証再現 / 知識抽出 / 計算ロジック仕様の読み取り |
| Forbidden use | 新運用フローからの import 直接依存 / Discord判断への接続 / ホットパス実行依存 |
| Preserve | Git履歴 / Backtest再現性 / 検証結果 / 過去判断根拠 / 利用可能な計算ロジック |

```text
Legacy = 知識と再現性の倉庫
New Protocol = 独立した仕様・State・ViewModel
抽出は「仕様再定義」であり「コード構造コピー」ではない
```

---

## 3. Legacy Inventory

### 3.1 SOX関連プロトコル

| Artifact | Path | Legacy role |
|---|---|---|
| SOX morning protocol | `sox_protocol.py` | LEGACY（**SEALED** Discord outbound） |
| Silicon defense protocol | `silicon_protocol.py` | LEGACY（**SEALED** Discord outbound） |
| SOX utils / Discord helper | `sox_utils.py` | LEGACY util（webhook送信は共通インフラとして再利用可だが、判断はLegacy） |
| SOX morning bot | `discord_morning_bot.py` | LEGACY（**SEALED** — bot接続前に遮断） |
| SOX workflow | `.github/workflows/discord_morning.yml` | LEGACY（**SEALED** — schedule removed + Discord gate） |
| PM SOX | `pm_sox_protocol.py` | LEGACY（**SEALED** Discord outbound） |
| SOX / Silicon / PM workflows | `.github/workflows/{sox_protocol,pm,discord_morning}.yml` | LEGACY（**SEALED** — see ASA-LEGACY-SOX-SENSOR-SEAL-1.0） |
| Seal state | `legacy_sox_sensor_seal.json` / `legacy_sox_sensor_seal.py` | Operational seal gate（復帰可能） |

### 3.2 NDX Exit Protocol

| Artifact | Path | Legacy role |
|---|---|---|
| NDX sell protocol | `ndx_sell_protocol.py` | LEGACY decision engine |
| NDX ops / bot / UI | `ndx_ops.py`, `ndx_discord_bot.py`, `ndx_discord_ui.py` | LEGACY ops + UI pattern reference |
| Discord frontend SoT | `docs/discord_frontend_v1.md` | LEGACY UI SoT（**ViewModel投影パターンの参照元**） |

### 3.3 Swing / Freeze / Taxable design records

| Artifact | Path | Legacy role |
|---|---|---|
| Swing Freeze component | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` | LEGACY component knowledge（Entry優先の抽出元） |
| Freeze validation pack | `data/common_backtest/reports/swing_protocol_freeze/` | LEGACY evidence |
| Taxable regime definition | `docs/baselines/ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0.md` | LEGACY benchmark definition（PROTO100） |
| PROTO100 strategy/definition | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-*.md` | LEGACY design records |
| Growth asset selection | `docs/baselines/ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` | LEGACY asset role record（野村確定の抽出元） |
| Integrated design candidate | `docs/baselines/ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md` | LEGACY design candidate（C_70_30等） |

### 3.4 Discord通知ロジック

| Artifact | Path | Legacy role |
|---|---|---|
| Portfolio Discord notify | `discord_notify.py` | LEGACY portfolio review webhook |
| Secretary Discord connector | `tools/secretary/connectors/discord_connector.py` | LEGACY tooling |

```text
新 TaxableAccount Discord は上記へ機能追加しない。
新規 ViewModel + 新規 UI 仕様で構築する（Phase 4）。
```

### 3.5 Backtest / validation engines

| Artifact | Path | Legacy role |
|---|---|---|
| Swing sleeve simulator | `run_longterm_swing_integrated_validation.py` | LEGACY engine（再現・抽出） |
| Swing panel builder | `run_swing_integrated_backtest.py` | LEGACY panel / signal definitions source |
| Asset prep | `prepare_swing_assets_daily.py` | LEGACY dataset prep |
| Nomura / PROTO validators | `run_nomura_*.py`, `run_longterm_growth_end_*.py` | LEGACY evidence runners |
| Sensor evaluation | `run_longterm_sox_ma_sensor_evaluation.py` ほか | LEGACY sensor evidence |

---

## 4. Dependency Map（現状）

```text
[LEGACY islands — no unified taxable runtime]

SOX morning ──► Discord text
NDX sell    ──► Discord embed (ViewModel pattern)
Portfolio   ──► Discord webhook summaries
Swing Freeze docs/evidence ──► backtest only
Taxable regime docs ──► design only (Runtime Activation: NONE)
simulate_swing_sleeve ──► offline validation only
```

```text
Missing today:
  Taxable Account live State Machine
  Unified Asset Selection runtime
  1570 Position Risk Control runtime
  TaxableAccount ViewModel → Discord
```

---

## 5. Extraction Catalog（仕様として再定義する要素）

新プロトコルは Legacy **コード構造をコピーしない**。以下を **Logic Spec** として再定義する。

| Layer (New) | Extract from Legacy | Spec content (frozen meaning) |
|---|---|---|
| Market Detection | sensor/validation evidence | `dd15_ma200`; Recovery Model B（OFF ∧ RSI14≥50 × 20bd） |
| Market Detection | swing panel / freeze | `crash_15`（日経52週高値比 ≤ -15%）; `semi_signal` |
| Asset Selection | Freeze + Growth asset record | Growth=野村; Crash=1570; Other swing=282A; else CASH |
| Position / Exit defaults | Freeze hold/exit | 1570 hold≈20bd; 282A hold≈15bd; abnormal exit 規則（読取） |
| Risk Control | **New validated rule**（2026-08 reviews） | 1570 Entry時 事前逆指値 Entry×0.85 |
| Discord pattern | NDX frontend | 判定はプロトコル、Discordは投影のみ |

### 5.1 Explicitly NOT extracted as New runtime dependency

- SOX ±15%/±10% position zone judgment
- NDX sell RSI/futures GO logic
- Freeze 文書中の「固定損切は採用しない」を New 全体ルールとして継承すること  
  → New では **1570 Position Risk Control を独立層**として定義（Freeze Entryは変更しない）
- Discord morning / NDX embed のチャンネル・文言・ボタン

---

## 6. Legacy Boundary Contract

| ID | Contract |
|---|---|
| LBC-1 | New Taxable Account Protocol は Legacy モジュールを import して判断しない |
| LBC-2 | Legacy ファイルへの機能追加（特定口座統合目的）は禁止 |
| LBC-3 | 計算ロジック再利用時は New 側に仕様を再記述し、必要なら計算関数のみ共有ライブラリ化を別途検討（Phase 3） |
| LBC-4 | Backtest再現は Legacy runners を維持し、New validation は別エントリで構築する |
| LBC-5 | Discord Legacy への「特定口座フィールド追加」は禁止。新 ViewModel 経路のみ |

---

## 7. Relation to New Architecture

Companion record:

- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-ARCHITECTURE-1.0.md`

```text
This Legacy Boundary record does NOT define runtime states.
State / Asset / Risk / ViewModel = Architecture record.
```

---

## 8. Phase 1 Completion Checklist（本レコード分）

| # | Criterion | Status |
|---|---|---|
| 1 | 既存プロトコルが Legacy として分離されている | **YES（本境界定義）** |
| 3 | 既存ロジックから利用する要素が明確化されている | **YES（Extraction Catalog）** |

残件は Architecture レコード側（責務境界 / Risk独立仕様 / Discord ViewModel / 旧依存なし説明）。

---

## 9. Non-Goals

- Legacy コードの削除
- workflow の再有効化
- 実売買自動化
- Growth / Entry / Sensor 意味の変更
