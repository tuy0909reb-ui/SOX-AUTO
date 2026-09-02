# ASA Confirmation — 1570 Risk Stop Integrated BT Evidence

**Report ID:** ASA-CONFIRM-TAXABLE-1570-RISK-STOP-INTEGRATED-BT-EVIDENCE-1.0  
**Date:** 2026-09-02  
**Authority:** HUMAN_ARCHITECT  
**Status:** **CONFIRMED**  
**Protocol Rule Change:** **NO**

---

## Purpose

RUNTIME-FREEZE 済みの 1570 Entry×0.85 Risk Stop に対し、PROTO100 統合 BT Evidence を付与し、Human が採用維持を確定した記録。

---

## Decision Surface

```text
対象: PROTO100 スイング袖・1570 一括 ± Entry×0.85
期間: 2009-08-27 → 2026-07-31（初期1350万・税引後）
N: 1570 trades 44（Stopなし）/ 45（Stopあり）；Stop発動 2
評価目的: 統合 BT Evidence 付与と採用維持の確認
判断可能範囲: 影響量記述・採用維持の確定
判断禁止範囲: Stop閾値再探索・60/40再導入・PROTO100不採用化・投資推奨
```

---

## Evidence Summary

| Case | Final（税引後） | CAGR | MaxDD | Stop発動 |
|---|---:|---:|---:|---:|
| B_LUMP（Stopなし・§6.2 Headline系） | 9.68億円 | 28.71% | −41.5% | 0 |
| B_LUMP_STOP（一括 + Entry×0.85） | 11.28億円 | 29.88% | −41.5% | 2 |

差分: +1.60億円（+16.5%）/ CAGR +1.17pt / MaxDD 不変

Artifacts:

- Script: `run_nomura_1570_risk_stop_validation.py`
- Report: `data/common_backtest/reports/nomura_1570_risk_stop_validation/risk_stop_validation_report.md`

---

## Human Judgment（CONFIRMED）

| Item | Decision |
|---|---|
| Entry×0.85 Risk Stop | **採用維持** |
| RUNTIME-FREEZE | **意味変更なし**（Unfreeze なし） |
| Swing FREEZE「固定損切不採用」 | **触らない**（Risk Control は上乗せ層） |
| PROTO100 Headline 9.68億 | **歴史 Headline 維持**（Stop 未実装系と明記） |
| 60/40 / 閾値再探索 | **実施しない** |

---

## Updated Baselines（same change）

| Baseline | Update |
|---|---|
| `ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0` | §6.3–§6.5 Evidence + Confirmation |
| `ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0` | Risk Stop Evidence + Confirmation 行 |
| `ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0` | §5.6 Evidence + Confirmation |

---

## Explicit Non-Authorization

- Broker auto-order / live trading
- Stop 閾値変更（0.15 以外）
- Swing FREEZE の「固定損切」意味書き換え
- PROTO100 採用判断の再オープン
