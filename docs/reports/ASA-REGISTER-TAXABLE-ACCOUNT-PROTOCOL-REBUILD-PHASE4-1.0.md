# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE4-1.0

# Taxable Account Protocol Rebuild Phase 4 — Registration

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T06:55:00+09:00  
**Title:** New Runtime Integration（Detection→State→ViewModel→Discord投影）  
**Status:** **APPROVED / REGISTERED — RUNTIME FOUNDATION INTEGRATED（NOT LIVE OPS）**  
**Parent:** Phase 1–3 Taxable Account Protocol rebuild records  
**Trading Authorization:** **NOT AUTHORIZED**  
**Live Discord webhook default:** **DRY-RUN**  
**Legacy mutation:** **NONE**

---

## Deliverables

| Artifact | Path |
|---|---|
| Detection sensors/adapter | `taxable_account/detection/` |
| Runtime session | `taxable_account/runtime/session.py` |
| Discord projection adapter | `taxable_account/view/discord_adapter.py` |
| Integration tests | `tests/test_taxable_account_runtime_integration.py` |
| Foundation tests | `tests/test_taxable_account_foundation.py` |

---

## Runtime flow（implemented）

```text
MarketData / ScriptedCondition
  → Market Detection (MarketCondition)
  → Regime Decision + Asset Selection
  → TaxableAccountState update
  → Position Management + 1570 Risk Control
  → TaxableAccountState update
  → TaxableAccountViewModel
  → DiscordProjection (dry-run by default)
```

State remains Single Source of Truth. Discord does not judge.

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | Market Detection → State 更新接続 | **PASS** |
| 2 | Asset Selection 仕様通り | **PASS** |
| 3 | Position State 遷移確認 | **PASS** |
| 4 | 1570 Risk Control 動作確認 | **PASS** |
| 5 | State が SoT として機能 | **PASS** |
| 6 | ViewModel 生成確認 | **PASS** |
| 7 | Discord は投影のみ | **PASS**（dry-run / no judgment） |
| 8 | Legacy 非依存 | **PASS**（import境界テスト） |

```text
pytest tests/test_taxable_account_foundation.py \
       tests/test_taxable_account_runtime_integration.py
→ 14 passed
```

---

## Scenario coverage

| Scenario | Test |
|---|---|
| Normal Growth → 野村 | `test_scenario_normal_growth` |
| Crash → Swing → 1570 → Risk ACTIVE | `test_scenario_crash_entry_risk_active` |
| −15% Stop → Exit → Flat → 再評価待ち | `test_scenario_risk_stop_exit_reeval` |
| Recovery → Growth | `test_scenario_recovery_to_growth` |
| Detection crash_15 without Legacy | `test_detection_adapter_computes_crash_without_legacy_import` |

---

## Explicit Non-Actions

- No Legacy protocol edits/imports
- No SOX / NDX / existing notify mutation
- No new sensors
- No Entry / Freeze / Growth rule redesign
- No live trading authorization
- Webhook send only if `TAXABLE_DISCORD_WEBHOOK` set and `discord_dry_run=False`

---

## Next（Phase 5 候補）

- Real market data wiring into `MarketDataBundle`
- Ops scheduling (non-Legacy)
- Authorized live Discord channel binding
- Paper/live execution adapters (separate authorization)
