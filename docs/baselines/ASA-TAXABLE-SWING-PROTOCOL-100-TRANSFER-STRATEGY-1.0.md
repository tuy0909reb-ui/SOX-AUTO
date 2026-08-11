# ASA Knowledge Record — Taxable Nomura + Swing Protocol 100% Transfer Strategy

**Record ID:** ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
**Title:** 特定口座 野村世界半導体 + Swing Protocol 100%移管 設計判断記録  
**Document Type:** Design Judgment / Strategy Architecture Knowledge Record  
**ASA Domain:** 特定口座局面運用設計  
**Category:** LongTerm Growth Asset + Swing Integration Architecture  
**Status:** **DESIGN VALIDATED**  
**Implementation Frozen:** **NO**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T23:50:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
**Previous Related Records:**  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CANDIDATE ONLY**（売買ルール未確定）

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0.md` | APPROVED |
| Definition Record | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0.md` | CONNECTED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/c3a10001-ede9-4634-8542-fc6f04d0db77.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/c3a10002-cb46-42e3-87e6-f5e102f8b670.json` | CREATED |
| Evidence — Durability | `data/common_backtest/reports/nomura_proto100_durability_validation/` | REFERENCE |
| Evidence — Ratio Optimization | `data/common_backtest/reports/nomura_swing_transfer_ratio_optimization/` | REFERENCE |
| Evidence — 282A Rotation | `data/common_backtest/reports/nomura_282A_rotation_validation/` | REFERENCE |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize implementation, trading, or live capital transfer.
This record does NOT modify ASA-SWING-PROTOCOL-FREEZE-1.0.
Design Validated ≠ Implementation Frozen ≠ Live Trading Authorization.
Preserve design judgment and validation evidence only.
```

---

## 1. Purpose

特定口座における中長期成長資産運用設計について、  
野村世界半導体保有時の成長終了後資金移管モデル  
**「Swing Protocol 100%移管」（`CASE_C_PROTO100`）** の検証結果および設計判断を保存する。

```text
Save Design Judgment + Validation Evidence
≠ Finalize Trading Rules
≠ Authorize Live Capital Transfer
≠ Freeze Implementation
≠ Modify Existing Freeze Records
```

---

## 2. Classification Scope

| Field | Value |
|---|---|
| Registration Name | ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0 |
| ASA Domain | 特定口座局面運用設計 |
| Category | LongTerm Growth Asset + Swing Integration Architecture |
| Status | DESIGN VALIDATED |
| Implementation Frozen | NO |
| Trading Authorization | NOT AUTHORIZED |
| Validation model_id | `CASE_C_PROTO100` |

---

## 3. Background

通常時は成長資産を長期保有し、成長前提が崩れた可能性がある局面では  
Swing Protocol へ資金移管する設計を検討した。

| Case | Model |
|---|---|
| A | 野村世界半導体 Buy & Hold |
| B | 野村 → Alert時 Swing Protocol 100%移管 → Re-entryで野村復帰 |

対象成長資産（本Recordの検証前提）: **野村世界半導体**

---

## 4. Integrated Architecture

### 4.1 Normal State

```text
野村世界半導体 100%
```

### 4.2 Market Regime Alert

| Item | Definition |
|---|---|
| Primary Sensor | `dd15_ma200` |
| Change policy | **変更禁止**（本Recordでも変更しない） |

Alert発生時:

```text
野村世界半導体 0%
↓
Swing Protocol 100%
```

### 4.3 Recovery / Re-entry

| Item | Definition |
|---|---|
| Condition | `dd15_ma200` OFF **AND** RSI14 >= 50 **AND** 20営業日継続 |
| Action | 野村世界半導体 **100%** 復帰 |
| Change policy | **変更禁止** |

---

## 5. Connected Component

| Field | Value |
|---|---|
| Swing Component | **ASA-SWING-PROTOCOL-FREEZE-1.0** |
| Role | Alert期間中の資金運用 Component |
| Scope | Entry / Holding / Exit / Execution |
| Component mutation | **なし（Freeze維持）** |

袖内利用（Component規則・読取）:

- 1570（`crash_15` 優先）
- 282A（`semi_signal`；長期検証は Model C 代理）
- CASH（シグナル非成立時）

```text
移管先 = Swing Protocol Component
移管先 ≠ 282A単独買い持ち
```

---

## 6. Validation Evidence Summary

### 6.1 Primary evidence

| Item | Path |
|---|---|
| Durability validation | `data/common_backtest/reports/nomura_proto100_durability_validation/` |
| Report | `.../durability_validation_report.md` |
| BH comparison | `.../bh_comparison.csv` |
| Period split | `.../period_split_nomura.csv` |
| Regime analysis | `.../regime_analysis.csv` |
| Failure modes | `.../failure_mode_analysis.csv` |
| Adoption judgment | `.../adoption_judgment.csv` |

### 6.2 Headline results（野村・初期1350万・税引後・2009–2026）

| Metric | BH | PROTO100 | Diff |
|---|---:|---:|---:|
| Final Asset | 5.73億円 | **9.68億円** | **+3.95億円** |
| CAGR | 24.8% | **28.7%** | **+3.93pt** |
| MaxDD | −38.6% | −41.5% | −2.9pt（深い） |

### 6.3 Supporting evidence

| Evidence | Path | Role |
|---|---|---|
| Transfer ratio optimization | `nomura_swing_transfer_ratio_optimization/` | Alert比率感度（100%が税引後首位） |
| 282A rotation validation | `nomura_282A_rotation_validation/` | 282A単独移管は不適；PROTO100優位 |

---

## 7. Period Robustness

| Period | Result |
|---|---|
| 2009–2012 | WIN |
| 2013–2016 | WIN |
| **2017–2020** | **LOSS** |
| 2021–2026 | WIN |
| FULL | WIN |

Assessment:

```text
4/5 期間で税引後 BH 超過を確認。
```

Durability judgment（evidence）: **採用候補（耐久性確認）**

---

## 8. Regime Analysis

### Positive regimes

- 2022 金融引締め局面
- 2024 半導体調整局面

### Negative regime

**2017–2020型**

Characteristics:

- 強い成長継続
- 急落後高速回復
- Alert解除待ちによる機会損失

Note: 2008 GFC は野村系列開始（2009-08）制約で直接検証不可。SOXX proxy で Architecture stress のみ補完。

---

## 9. Design Decision（Recorded）

```text
Swing Protocol 100%移管は、
暴落回避モデルではなく、
「成長終了確認後の資金効率改善モデル」
として評価する。
```

### Design Objective

| YES | NO |
|---|---|
| 成長資産保有継続 | 暴落完全回避 |
| 成長終了後の別収益機会取得 | 短期売買利益最大化 |
| 長期税引後資産最大化 | 市場タイミング予測 |

---

## 10. Trade-off Record

| Merit | Cost |
|---|---|
| 税引後資産改善 | 強気相場中の誤Alert |
| 成長終了後の資金効率改善 | 急回復局面での機会損失 |
| Swing Componentとの境界明確 | MaxDD改善は保証されない |

```text
These are recorded as design trade-offs, not defects.
```

---

## 11. Relation to Existing Records

| Related | State |
|---|---|
| ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0 | **CONNECTED** — 名称・構成定義 |
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED COMPONENT** |
| ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0 | **Parent Design Reference** |
| `C_70_30` model | **Alternative Partial Transfer Model** |

```text
C_70_30  = Alert時 Partial Swing Allocation（例: LT70 / SW30）
PROTO100 = Alert時 Full Transfer（LT0 / SW100）
両者は別モデル。混同禁止。
```

---

## 12. Future Validation Items（Not Decided Here）

1. Live capital allocation rule  
2. Final product selection beyond current validation  
3. Additional sensor integration  
4. Operational judgment memo（とくに 2017–2020型）  

---

## 13. Next Phase

```text
1. 運用判断メモ（急回復局面の扱い）
2. 必要なら Implementation Freeze を別 Version / 別申請で検討
3. NISA固定前提との総PF接続は別検証
```

Until then:

```text
Record: ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
```

---

## 14. Disclaimer

本記録は定量検証に基づく設計判断の保存であり、  
投資推奨・将来収益の保証・取引実行の認可・売買ルール確定・既存Freeze改訂ではない。
