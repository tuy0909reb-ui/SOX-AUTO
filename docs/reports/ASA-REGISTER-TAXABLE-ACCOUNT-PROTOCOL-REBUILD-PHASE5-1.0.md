# ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-REBUILD-PHASE5-1.0

# Taxable Account Protocol Rebuild Phase 5 — Operational View & Runtime Connection

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T07:45:00+09:00  
**Title:** TaxableAccountViewModel 2.0 + Discord運用表示 + Runtime接続  
**Status:** **PASS / REGISTERED — OPS VIEW CONNECTED（NOT AUTO-TRADE）**  
**Parent:** Phase 4.5 Runtime Validation  
**Trading Authorization:** **NOT AUTHORIZED**  
**Auto-order:** **NONE**  
**Protocol rule changes:** **NONE**  
**Legacy mutation:** **NONE**

---

## Purpose

Connect validated New Runtime to a daily **judgment screen** so operators can see state, decision, capital path, entry timing, and 1570 risk — without adding rules or automation.

---

## Deliverables

| Artifact | Path |
|---|---|
| ViewModel spec | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-VIEWMODEL-2.0.md` |
| Discord display spec | `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DISCORD-DISPLAY-2.0.md` |
| ViewModel schema 2.0 | `docs/schemas/taxable_account_viewmodel.schema.json` |
| ViewModel + text render | `taxable_account/view/view_model.py` |
| Discord adapter | `taxable_account/view/discord_adapter.py` |
| Ops CLI | `python -m taxable_account.ops --as-of YYYY-MM-DD` |
| Scenario tests | `tests/test_taxable_account_phase5_ops_view.py` |

---

## Architecture (unchanged rules)

```text
Market Data → Detection → Decision → State (SoT)
  → ViewModel 2.0 (projection) → Discord (projection)
```

Forbidden in this phase (and not done):

- Detection / Decision / Asset Selection / Position / Risk rule edits
- 1570 stop formula change
- New sensors / investment rules
- Auto-order

---

## ViewModel 2.0 sections

1. **Current State** — Regime / Asset / Position State / Decision  
2. **Decision Reason** — judgment labels (not raw sensor dumps)  
3. **Capital Flow** — current → next candidates (1570 / 282A / CASH)  
4. **Entry Timing** — ENTRY_READY / WAIT / N/A + reason  
5. **Position** — holding block + 1570 Risk Stop (`Entry × 0.85`)

Decision vocabulary (display): `MAINTAIN` / `HOLD` / `EXIT` / `ENTRY_READY` / `REENTRY_WAIT` / `TRANSFER` / `WAIT`

---

## Completion Criteria

| # | Criterion | Result |
|---|---|---|
| 1 | 一画面で現在状態が理解可能 | **PASS** (`render_ops_text` + Discord 5 fields) |
| 2 | 野村維持・撤退・再投入判断が表示可能 | **PASS** (Growth / TRANSFER / Recovery scenarios) |
| 3 | 1570 / 282A切替判断が表示可能 | **PASS** (capital_flow + entry_timing) |
| 4 | Entry可能タイミングが表示可能 | **PASS** (`ENTRY_READY` / `WAIT`) |
| 5 | Exit後の再投入先候補が表示可能 | **PASS** (swing_candidates after REENTRY_WAIT) |
| 6 | Sensor値ではなくDecision Stateとして表示 | **PASS** (no `signals` section in VM) |
| 7 | Legacy非依存維持 | **PASS** |

```text
pytest tests/test_taxable_account_foundation.py \
       tests/test_taxable_account_runtime_integration.py \
       tests/test_taxable_account_phase45_validation.py \
       tests/test_taxable_account_phase5_ops_view.py
→ 47 passed
```

---

## Scenario coverage (Phase 5-3)

| Scenario | Display expectation | Test |
|---|---|---|
| Growth | 野村 / MAINTAIN | `test_scenario_growth_maintain_display` |
| Crash / exit | TRANSFER → 1570候補 | `test_scenario_crash_shows_1570_candidate` |
| Swing 1570 | HOLD + Risk ACTIVE | `test_scenario_swing_hold_and_risk_display` |
| Swing 282A | ENTRY_READY | `test_scenario_swing_282a_switch_display` |
| Recovery | 野村再投入条件 | `test_scenario_recovery_nomura_reentry_display` |

---

## Ops usage

```text
python -m taxable_account.ops --as-of 2020-03-24
python -m taxable_account.ops --as-of 2024-01-05 --json
```

Discord remains **dry-run** unless `--discord-live` and `TAXABLE_DISCORD_WEBHOOK` are set.

---

## Explicit Non-Actions

- No live trading authorization
- No Legacy Discord / protocol hot-path
- No sensor or stop-rule changes
- No automatic order routing

---

## Next (optional)

Scheduled paper projection / authorized webhook ops can be added later **without** changing protocol rules, only after explicit ops authorization.
