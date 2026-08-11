# ASA Knowledge Record — Taxable Regime Protocol Definition Confirmation

**Record ID:** ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0  
**Title:** 特定口座局面運用プロトコル定義確認  
**Document Type:** Knowledge / Design Record（定義確認）  
**ASA Domain:** Investment Decision Architecture / 特定口座局面運用  
**Category:** Protocol Definition Clarification  
**Status:** **CONFIRMED / RECORDED**  
**Implementation Frozen:** **NO**  
**Architecture Change:** **NONE**（凍結済み ASA Architecture は変更しない）  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T22:40:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0  
**Previous Related Records:**  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CONFIRMATION ONLY**（投資判断ではない）

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0.md` | APPROVED |
| Evidence — 282A Rotation Validation | `data/common_backtest/reports/nomura_282A_rotation_validation/` | REFERENCE |
| Evidence — Exit Protocol Allocation | `data/common_backtest/reports/nomura_exit_protocol_allocation_validation/` | REFERENCE |
| Evidence — Re-entry Precision | `data/common_backtest/reports/longterm_growth_end_reentry_precision_validation/` | REFERENCE |
| Related — Integrated Design Candidate | `docs/baselines/ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md` | CONNECTED（別物を明記） |
| Related — Swing Component | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` | CONNECTED |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT change frozen architecture.
This record does NOT change dd15_ma200 or Re-entry conditions.
This record does NOT authorize implementation or live trading.
Purpose = confirm and name the validation benchmark model only.
```

---

## 1. Purpose

特定口座局面運用検証で用いた「既存プロトコル100%」（Case C）の定義を確認し、  
今後の比較検証における**基準モデル**を ASA Knowledge Layer に明示する。

```text
Confirm definition + set comparison benchmark
≠ Change Exit / Re-entry
≠ Adopt live trading rules
≠ Replace C_70_30 design candidate
```

---

## 2. Background（Validation Context）

比較検証（`nomura_282A_rotation_validation`）:

| Case | 移管先 | 税引後最終（初期1350万・検証窓） |
|---|---|---:|
| A | 野村 Buy&Hold | 約 5.73 億 |
| B | 282A 100%単純保有 | 約 2.04 億 |
| C | 既存プロトコル100% | 約 9.68 億 |

Finding（記録）:

```text
282A単純保有 = 成長終了後の主退避先として不適
既存プロトコル100% = 資産効率改善効果を確認（検証上）
```

---

## 3. Formal Definition —「既存プロトコル100%」

### 3.1 Canonical Name

| Field | Value |
|---|---|
| Display name（検証呼称） | 既存プロトコル100% |
| Validation model_id | `CASE_C_PROTO100` |
| Allocation family（engine） | Alert時 LT 0% / Swing sleeve 100% |
| Near-equivalent engine label | `D_SWING` 系（警戒時完全退避→スイング袖） |
| **Not equal to** | `C_70_30`（ASA設計候補・警戒時 LT70% 維持） |

```text
重要:
  「既存プロトコル100%」≠ ASA-LONGTERM の設計候補 C_70_30
  「既存プロトコル100%」= 成長終了Alert中に資金をスイング・プロトコル袖へ100%移管する検証モデル
```

### 3.2 使用商品 / 資金移管先

| Layer | Instrument | Role |
|---|---|---|
| BULL（通常） | 野村世界半導体株投資 | 特定メイン資産 100% |
| RANGE / Alert | **スイング・プロトコル袖** | 資金の移管先（100%） |
| 袖内候補① | 282A（検証長期系列は Model C 代理） | `semi_signal` 時のエントリー先 |
| 袖内候補② | 1570（日経レバ） | `crash_15` 時の優先エントリー先 |
| 袖内待機 | CASH（フラット） | シグナル非成立時 |

資金移管先の正式表現:

```text
移管先 = 「282A単体」ではない
移管先 = SWING-PROTOCOL-FREEZE-1.0 規則に従うスイング袖（282A / 1570 / CASH）
```

### 3.3 局面判定（成長終了）— 変更禁止

| Item | Definition |
|---|---|
| Sensor | `dd15_ma200` |
| Purpose | 成長局面終了確認 |
| Exit Trigger | `dd15_ma200` ON → Alert ON（即時） |
| Change policy | **変更禁止** |

### 3.4 ポートフォリオ級 Action（Alert ON）

```text
Action:
  野村世界半導体を売却（特定メインを一旦解消）
  資金をスイング・プロトコル袖へ 100% 移管
```

| 保有比率（Alert ON） | Value |
|---|---|
| 野村世界半導体 | **0%** |
| スイング袖 | **100%** |
| 単純現金強制 | しない（袖内でシグナル無なら実質待機） |

### 3.5 スイング袖 Entry / Exit（コンポーネント規則・読取再利用）

Source: `ASA-SWING-PROTOCOL-FREEZE-1.0`（変更せず読取）

| Item | Definition |
|---|---|
| Entry priority | (1) 1570 if 日経225 52週高値比 <= -15%（`crash_15`） (2) 282A/Model C if `semi_signal` (3) else flat |
| Holding | 保有中の局面切替なし |
| Exit 282A側 | 基本 15 営業日 + 異常撤退 |
| Exit 1570側 | 基本 20 営業日 |
| Slippage（component） | 片道 0.1% 想定 |
| Alert解除時 | スイングポジションを flatten し、資金を野村へ復帰 |

### 3.6 Re-entry（野村復帰）— 変更禁止

| Item | Definition |
|---|---|
| Condition | `dd15_ma200` OFF **AND** RSI14 >= 50 **AND** 20営業日継続 |
| Action | スイング袖を解消し、野村世界半導体へ **100%** 復帰 |
| Change policy | **変更禁止** |

Evidence: `longterm_growth_end_reentry_precision_validation`（Model B）

### 3.7 保有比率まとめ

| State | 野村 | スイング袖 |
|---|---:|---:|
| BULL（非Alert） | 100% | 0% |
| RANGE/Alert | 0% | 100% |
| Re-entry後 | 100% | 0% |

---

## 4. Role Classification（局面役割）

| Regime | Asset / Sleeve | Status |
|---|---|---|
| **BULL** | 野村世界半導体 100% | **CONFIRMED** |
| **RANGE**（成長終了Alert） | スイング・プロトコル袖 100%（282A/1570/CASH 規則） | **CONFIRMED（検証基準モデル）** |
| **BEAR** | ポートフォリオ級の独立BEAR袖は**未定義** | **NOT DEFINED** |

BEAR補足:

```text
日経急落（crash_15）時はスイング袖内で1570が優先されうる。
これは BEAR 専用レイヤーではなく、RANGE袖内のエントリー優先規則である。
```

---

## 5. 282A Role Reclassification

### 5.1 Current Finding（Confirmed）

```text
282A 100%単純保有（買い持ち待機）:
  成長終了後の主退避先として 不採用
```

根拠: Case B（約2.04億） << Case A BH（約5.73億） << Case C プロトコル（約9.68億）

### 5.2 Future Role Candidates（Not Adopted Yet）

| Candidate Role | Status |
|---|---|
| RANGE局面スイング候補（袖内・`semi_signal`） | **RETAINED as component role**（SWING-PROTOCOL-FREEZE） |
| 口数増加戦略候補 | **CANDIDATE ONLY / UNCONFIRMED** |
| 成長終了後100%退避先 | **REJECTED** |

---

## 6. Comparison Benchmark（今後の標準比較軸）

今後の特定口座局面運用検証では、原則次を標準比較軸とする。

```text
標準軸:
  野村 Buy&Hold
    vs
  野村 + 既存プロトコル100%（CASE_C_PROTO100）
```

| Axis | Role |
|---|---|
| 野村 BH | 成長保有ベースライン |
| 野村 + 既存プロトコル100% | 局面移管の基準モデル（本Recordで定義確認） |

### 6.1 Relation to C_70_30

| Model | Alert配分 | ASA上の位置づけ |
|---|---|---|
| `C_70_30 × dd15_ma200` | LT70% + Swing30% | 統合思想の**設計候補**（ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0） |
| `CASE_C_PROTO100` | LT0% + Swing100% | 今回検証の**基準移管モデル**（本Record） |

```text
両者を混同しない。
今後「既存プロトコル」と言う場合、文脈を明示する:
  - PROTO100 = 本Recordの基準移管モデル
  - C_70_30 = 長期統合設計候補（警戒時もLT主軸）
```

---

## 7. Restrictions（遵守）

| Restriction | Status |
|---|---|
| 凍結済み ASA Architecture 変更禁止 | OBSERVED |
| `dd15_ma200` 変更禁止 | OBSERVED |
| Re-entry条件変更禁止 | OBSERVED |
| 投資判断ではなく設計確認のみ | OBSERVED |
| 実装認可なし | OBSERVED |
| コード生成・実装要求なし | OBSERVED |

---

## 8. Confirmed Statements（Machine-readable）

```text
PROTO100_NAME = CASE_C_PROTO100
PROTO100_BULL = Nomura_World_Semiconductor_100%
PROTO100_ALERT_DEST = Swing_Sleeve_100%  # not 282A BH
PROTO100_SWING_RULES = ASA-SWING-PROTOCOL-FREEZE-1.0
PROTO100_EXIT_SENSOR = dd15_ma200
PROTO100_REENTRY = dd15_ma200_OFF AND RSI14>=50 AND 20d
PROTO100_NE_C_70_30 = true
ROLE_282A_FULL_PARK = REJECTED
ROLE_282A_SWING_COMPONENT = RETAINED
BENCHMARK_AXIS = Nomura_BH vs Nomura_PLUS_PROTO100
BEAR_SLEEVE = NOT_DEFINED
```

---

## 9. Disclaimer

本記録は検証で用いたモデル定義の確認と、今後の比較軸の明確化のみを目的とする。  
投資推奨・将来収益の保証・取引実行の認可・売買ルール確定・Architecture改訂ではない。
