# ASA-TAXABLE-ACCOUNT-PROTOCOL-LIVE-DRY-RUN-PHASE8-1.0

# Phase 8 — Live Operation Dry Run

**Date:** 2026-08-05  
**Timestamp:** 2026-08-05T00:20:00+09:00  
**Title:** ViewModel → Discord Adapter → Webhook infra dry-run  
**Status:** **PASS (projection path VERIFIED; live POST operator-gated)**  
**Parent:** Phase 7 Operational Readiness / Runtime Freeze 1.0  
**Evidence run:** `python -m taxable_account.ops --phase8-dry-run` → overall=PASS  
**Webhook source observed:** `logs/portfolio/discord_webhook.json` (infra file; no Legacy import)  

---

## Purpose

Validate the **live display path** for daily ops:

```text
Market Data → Detection → State → ViewModel 2.1
  → Discord Adapter → Webhook → Discord
```

Reuse existing SOX Discord webhook **as send infrastructure only**.

---

## Hard Constraints

| Constraint | Status |
|---|---|
| SOX Legacy Protocol dependency | **FORBIDDEN / NONE** |
| Trading protocol / Detection / Selection / Risk | **UNCHANGED** |
| ViewModel schema 2.1 | **UNCHANGED** |
| Webhook connection only | **YES** |

Banned imports in `taxable_account/` hot path: `sox_protocol`, `sox_utils`, `discord_notify`, `ndx_*`, `run_longterm`, `run_swing`.

---

## Webhook resolution (infra)

| Priority | Source |
|---|---|
| 1 | `TAXABLE_DISCORD_WEBHOOK` |
| 2 | `DISCORD_WEBHOOK_URL` (same secret as SOX CI / ops) |
| 3 | Optional gitignored JSON under `logs/**/discord_webhook.json` |

Implementation: `taxable_account/view/webhook_config.py`  
Adapter: `taxable_account/view/discord_adapter.py`

---

## Confirmation Targets

| # | Target | Result |
|---|---|---|
| 1 | ViewModel 2.1 → Discord Adapter | **PASS** |
| 2 | Adapter → Webhook POST path | **PASS** (mocked HTTP 204 in CI) |
| 3 | 一画面表示 | **PASS** (8 Discord fields) |
| 4 | 日次更新 | **PASS** (latest market as_of pipeline) |
| 5 | State persistence | **PASS** (FileStateStore round-trip) |
| 6 | Error handling | **PASS** (missing webhook → error, no crash) |
| 7 | No Legacy protocol import | **PASS** |

---

## How to run

```text
# Default Phase 8 dry-run (no Discord POST)
python -m taxable_account.ops --phase8-dry-run

# With state file + as-of
python -m taxable_account.ops --phase8-dry-run --as-of 2026-07-31 \
  --state-file data/ops/taxable_state.json

# Operator-authorized real webhook POST (uses DISCORD_WEBHOOK_URL / TAXABLE_…)
python -m taxable_account.ops --phase8-send --as-of 2026-07-31 \
  --state-file data/ops/taxable_state.json
```

CI / automated tests always use `send=False` + mocked POST.

---

## Deliverables

| Artifact | Path |
|---|---|
| Webhook resolver | `taxable_account/view/webhook_config.py` |
| Live dry-run harness | `taxable_account/validation/live_dry_run.py` |
| Tests | `tests/test_taxable_account_phase8_live_dry_run.py` |
| Evidence | `data/common_backtest/reports/taxable_account_phase8_live_dry_run/` |

---

## Final Confirmation

```text
Live Operation Dry Run COMPLETE.

Webhook infra:
REUSED (DISCORD_WEBHOOK_URL / TAXABLE_DISCORD_WEBHOOK)

Legacy Protocol dependency:
NONE

ViewModel → Discord path:
VERIFIED

One-screen / daily update / persistence / errors:
VERIFIED

Live POST to Discord:
OPERATOR-GATED (--phase8-send)
```
