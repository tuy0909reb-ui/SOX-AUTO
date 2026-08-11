# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-VIEWMODEL-PHASE5.1-1.0

# Taxable Account Protocol — ViewModel Reference Numbers (Phase 5.1)

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T21:40:00+09:00  
**Title:** ViewModel / Discord operational display — reference numbers  
**Status:** **PASS / REGISTERED**  
**Parent:** Phase 5 Operational View  
**Confirmation:** **Display improvement only. Trading protocol unchanged.**

---

## Scope (allowed changes only)

| Changed | Path |
|---|---|
| ViewModel builder | `taxable_account/view/view_model.py` |
| Discord adapter | `taxable_account/view/discord_adapter.py` |
| ViewModel schema | `docs/schemas/taxable_account_viewmodel.schema.json` → **2.1** |
| Display tests | `tests/test_taxable_account_phase51_viewmodel.py` (+ related assertion updates) |
| Runtime mark passthrough | `taxable_account/runtime/session.py` (`as_of=` into ViewModel only) |

**Not modified:** Detection sensors, Decision / Asset Selection, Freeze Entry, 1570 Risk Stop rule, Exit / ReEntry rules, Legacy modules.

---

## Schema changes (2.0 → 2.1)

Added / extended:

```json
{
  "capital_flow": {
    "current_asset": "",
    "previous_asset": "",
    "next_candidate": "",
    "reason": ""
  },
  "reference": {
    "entry_date": null,
    "entry_price": null,
    "current_price": null,
    "pnl_pct": null,
    "holding_days": null,
    "drawdown_from_high_pct": null
  },
  "entry_status": {
    "status": "READY | WAIT",
    "candidate": "",
    "blocking_reason": ""
  },
  "risk": {
    "applicable": false,
    "stop_price": null,
    "distance_pct": null,
    "status": "N/A"
  },
  "next_action": "",
  "signal": null
}
```

Reference / distance values are projected from State + caller marks (`current_price`, optional `high_price`, `as_of`). Discord performs **formatting only**.

---

## Discord field order

1. Current State  
2. Decision  
3. Current Asset  
4. Capital Flow  
5. Next Action  
6. Entry Timing  
7. Reference Numbers  
8. Risk Control  

Title: `特定口座 Protocol`

---

## Tests

```text
pytest tests/test_taxable_account_foundation.py \
       tests/test_taxable_account_runtime_integration.py \
       tests/test_taxable_account_phase45_validation.py \
       tests/test_taxable_account_phase5_ops_view.py \
       tests/test_taxable_account_phase51_viewmodel.py
→ 57 passed
```

| Scenario | Coverage |
|---|---|
| 1 Normal Growth | 野村 / MAINTAIN / Reference P/L·Holding·High DD |
| 2 Alert ON | Capital Flow / Swing candidate |
| 3 crash_15 | 1570 candidate / Entry READY |
| 4 1570 Holding | Risk Stop / Entry / Current / P/L |
| 5 1570 Stop | EXIT → REENTRY_WAIT |
| 6 282A Holding | semi_signal display |
| 7 Recovery | 野村再投入候補 |

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Existing tests PASS | **PASS** |
| 2 | New ViewModel tests PASS | **PASS** |
| 3 | Discord display test PASS | **PASS** |
| 4 | No trading rule changes | **PASS** |
| 5 | No Legacy dependency | **PASS** |
| 6 | No new decision logic | **PASS** |
| 7 | One-screen readability | **PASS** |

---

## Explicit statement

> Display improvement only. Trading protocol unchanged.
