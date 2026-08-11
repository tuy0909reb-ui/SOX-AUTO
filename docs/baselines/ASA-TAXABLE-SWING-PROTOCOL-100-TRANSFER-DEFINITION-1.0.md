# ASA Knowledge Record — Taxable Swing Protocol 100% Transfer Definition

**Record ID:** ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
**Title:** 特定口座局面運用 Swing Protocol 100%移管定義確認  
**Document Type:** Knowledge / Design Confirmation  
**ASA Domain:** Investment Decision Architecture / 特定口座局面運用  
**Category:** Protocol Naming & Boundary Clarification  
**Status:** **CONFIRMED / RECORDED**  
**Implementation Frozen:** **NO**  
**Architecture Change:** **NONE**  
**Swing Protocol Freeze Mutation:** **NONE**  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T23:20:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0  
**Previous Related Records:**  
- ASA-TAXABLE-REGIME-PROTOCOL-DEFINITION-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Follow-on Strategy Record:** ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CONFIRMATION ONLY**

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-TAXABLE-SWING-PROTOCOL-100-TRANSFER-DEFINITION-1.0.md` | APPROVED |
| Evidence | `data/common_backtest/reports/nomura_282A_rotation_validation/` | REFERENCE |
| Code path（read-only） | `run_nomura_282A_rotation_validation.py` → `CASE_C_PROTO100` | REFERENCE |

```text
This record confirms definitions and boundaries only.
Does NOT change ASA-ARCH-*, Swing Freeze contents, dd15_ma200, or Re-entry.
Does NOT authorize implementation or live trading.
```

---

## 1. Purpose

検証呼称「既存プロトコル100%」および検証ID `CASE_C_PROTO100` の正式意味を確認し、  
Swing Protocol Component / 統合設計 / `C_70_30` との境界を固定する。

---

## 2. Confirmation Results

### 2.1 「既存プロトコル100%」の正式意味

| 確認 | Result |
|---|---|
| A. Alert時に Swing Protocol Component へ資金配分100%か | **YES — CONFIRMED** |
| B. 282A単独100%保有を意味するか | **NO — CONFIRMED NOT** |
| C. 袖内で 1570 / 282A / CASH を条件利用するか | **YES — CONFIRMED** |

```text
Alert時:
  野村世界半導体  0%
  Swing Protocol  100%
```

| Priority | Name | Usage |
|---|---|---|
| 1（推奨） | **Swing Protocol 100%移管** | 文書・比較軸の正式呼称 |
| 2（検証ID） | `CASE_C_PROTO100` | コード・検証再現 |
| 3（互換） | 既存プロトコル100% | 過去レポート互換エイリアス |

### 2.2 `CASE_C_PROTO100` 構成

| State | Allocation |
|---|---|
| Normal（非Alert） | 野村世界半導体 **100%** |
| Alert（dd15_ma200 ON） | 野村 **0%** / Swing Protocol **100%** |
| Re-entry | 野村世界半導体 **100%** |

| Item | Definition |
|---|---|
| Exit / Alert ON | `dd15_ma200` |
| Re-entry | `dd15_ma200` OFF **AND** RSI14 >= 50 **AND** 20営業日継続 |
| Swing Component | ASA-SWING-PROTOCOL-FREEZE-1.0（1570 / 282A / CASH） |

### 2.3 `C_70_30` との関係

| State | `C_70_30` | `CASE_C_PROTO100` |
|---|---|---|
| 非Alert | 野村 **100%** | 野村 **100%** |
| Alert | 野村 **70%** + Swing **30%** | 野村 **0%** + Swing **100%** |

両者は別モデル。混同禁止。

### 2.4 今後の標準比較軸

| Axis | Model |
|---|---|
| A | 野村 Buy & Hold |
| B | 野村 + Swing Protocol **100%**移管 |
| C | 野村 + Swing Protocol **部分**移管（`C_70_30` 等） |

---

## 3. Disclaimer

本記録は定義確認と境界整理のみを目的とする。  
投資推奨・取引認可・Architecture改訂・Swing Freeze改訂ではない。
