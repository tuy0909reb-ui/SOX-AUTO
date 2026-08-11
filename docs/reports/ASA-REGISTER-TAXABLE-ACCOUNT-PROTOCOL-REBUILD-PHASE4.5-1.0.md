# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE4.5-1.0

# Taxable Account Protocol Rebuild Phase 4.5 — Runtime Validation Review

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T07:20:00+09:00  
**Title:** New Runtime vs Design Spec Validation（Legacy非依存）  
**Status:** **PASS / VALIDATED — READY FOR PHASE 5 GATE**  
**Parent:** Phase 4 Runtime Integration  
**Trading Authorization:** **NOT AUTHORIZED**  
**Live Discord / live market feed:** **NOT STARTED**（Phase 5）  
**Legacy mutation:** **NONE**

---

## Purpose

Confirm Phase 4 New Runtime matches design specs and prior validated review expectations, using **spec-condition oracles** — not Legacy code comparison.

---

## Scope

| Area | Package |
|---|---|
| Detection / Decision / Position / Risk / State / View | `taxable_account/` |
| Validation tests | `tests/test_taxable_account_phase45_validation.py` |
| Evidence CSVs | `data/common_backtest/reports/taxable_account_phase45_validation/` |

---

## Method

1. **Detection:** Independent formula oracles for `dd15_ma200` / `crash_15`; Model B clear-day rules; `semi_signal ∧ crash_15 = ∅`
2. **Decision:** Regime transition table + Asset Selection priority matrix
3. **Risk:** Engine event sequence Entry → arm 0.85 → TRIGGERED → Exit → re-eval wait
4. **Integrity:** AST / attribute / banned-token checks (Detection no position SoT; ViewModel projection; Discord no judgment; no Legacy imports)
5. **Historical:** Crisis windows 2016 / COVID / 2022 / 2024 — 1570 path MAE + paper runtime stop counts

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Detection仕様一致 | **PASS** |
| 2 | State遷移一致 | **PASS** |
| 3 | 1570 Risk Control一致 | **PASS** |
| 4 | ViewModel純粋投影確認 | **PASS** |
| 5 | Legacy非依存確認 | **PASS** |

```text
pytest tests/test_taxable_account_phase45_validation.py
→ 20 passed

pytest tests/test_taxable_account_foundation.py \
       tests/test_taxable_account_runtime_integration.py \
       tests/test_taxable_account_phase45_validation.py
→ 34 passed
```

---

## 1. Detection Validation

| Sensor | Spec check | Result |
|---|---|---|
| `dd15_ma200` | 250d high DD≥15% ∧ close&lt;SMA200 vs oracle | PASS |
| Recovery Model B | ON immediate; OFF after False ∧ RSI14≥50 × 20bd | PASS |
| `crash_15` | Nikkei /252d high ≤ −15% vs oracle | PASS |
| `semi_signal` | themes ∧ ¬crash_15 (mutual exclusion) | PASS |

### Spec deltas noted（vs prior verbal / Legacy narrative）

| Item | New Runtime | Note |
|---|---|---|
| Growth sensor series | SOXX NAV (`soxx_etf_nav.value`) | Spec sensor is `dd15_ma200`; Nomura is Growth **asset**, not sensor |
| Nomura price column | `nav` | Dataset has no `adjusted_close`; loader maps `nav` |
| RSI Wilder avg-loss=0 | RSI→100 | Edge case fixed so Model B can clear on sustained uptrends |

**Forbidden method avoided:** No import/diff against `sox_protocol` / `run_swing` / Legacy Discord modules.

---

## 2. Decision Validation

### Regime

| From | Event | To | Result |
|---|---|---|---|
| GROWTH_ACTIVE | ALERT_ON | EXIT_PENDING | PASS |
| EXIT_PENDING | TRANSFER_COMPLETE | SWING_ACTIVE | PASS |
| EXIT_PENDING | ALERT_OFF | REENTRY_PENDING | PASS |
| SWING_ACTIVE | ALERT_OFF | REENTRY_PENDING | PASS |
| REENTRY_PENDING | RECOVERY_COMPLETE | GROWTH_ACTIVE | PASS |
| REENTRY_PENDING | ALERT_ON | EXIT_PENDING | PASS |

### Asset Selection priority

| Regime | Signals | Asset | Result |
|---|---|---|---|
| GROWTH_ACTIVE | any | 野村 | PASS |
| SWING_ACTIVE | crash_15 (±semi) | 1570 | PASS（1570 &gt; 282A） |
| SWING_ACTIVE | semi only | 282A | PASS |
| SWING_ACTIVE | none | CASH | PASS |
| EXIT/REENTRY_PENDING | any | CASH | PASS |

---

## 3. Position / Risk Validation

```text
ENTRY_FILLED (1570 @ 1000)
  → stop_price = 850 (= entry × 0.85), Risk ACTIVE
  → STOP_TRIGGERED
  → EXIT_FILLED
  → REENTRY_WAIT / CASH / Risk N/A
```

**Result:** PASS

---

## 4. State Integrity

| Check | Result |
|---|---|
| `TaxableAccountState` is sole trading SoT | PASS |
| DetectionAdapter has no regime/position/risk fields | PASS |
| ViewModel maps enums + prices only（display decision） | PASS |
| Discord adapter AST: no sensor / select_asset judgment | PASS |
| Package text: no Legacy protocol tokens | PASS |

---

## 5. Historical Scenario — 1570 Stop

Evidence:

- `crisis_1570_stop_paths.csv`
- `crisis_1570_stop_hit_rates.csv`
- `crisis_runtime_stop_events.csv`

### Path MAE（crash_15 run-start entries, 20bd low vs −15%）

| Crisis | Paths | Stop-hit (low) | Interpretation |
|---|---:|---:|---|
| 2016 | 1 | 1 | Continuation — stop engagement expected |
| COVID | 1 | 1 | Sparse sample; see runtime |
| 2022 | 1 | 0 | No −15% low breach in window path |
| 2024 | 1 | 0 | No −15% low breach in window path |

### Paper runtime（auto-transfer / auto-fill）

| Crisis | 1570 entries | STOP_TRIGGERED | Interpretation |
|---|---:|---:|---|
| 2016 | 3 | 2 | Deep continuation — not “false fire” |
| COVID | 2 | 1 | Not every entry stopped（anti-blanket） |
| 2022 | 0 | 0 | No 1570 entry in window under New Runtime |
| 2024 | 1 | 0 | Entry without stop |

**Verdict:** Stop engages on continuation risk (2016-type) and does **not** dominate rebound windows as a blanket exit. **PASS** for “不要発火していない” under the validated −15% pre-set model.

---

## Fixes applied during Validation

1. `rsi_wilder`: avg-loss=0 → RSI 100（Model B clearability）
2. `load_market_bundle`: Nomura column `nav` (dataset shape)

---

## Explicit Non-Actions

- No Phase 5 live market feed / authorized webhook
- No Legacy protocol edits or hot-path imports
- No Decision-layer schema change
- No trading authorization

---

## Phase 5 gate

Phase 5（live接続） may start only after this Validation PASS.

**Gate status:** **OPEN for Phase 5 planning / implementation start**  
**Ops status:** still **NOT LIVE** until Phase 5 completion criteria are separately met.
