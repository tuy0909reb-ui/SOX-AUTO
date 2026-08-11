# ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-READINESS-PHASE7-1.0

# Phase 7 — Operational Readiness Check

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T23:50:00+09:00  
**Title:** Daily ops readiness (not strategy improvement)  
**Status:** **PASS / FREEZE AUTHORIZED**  
**Parent:** Phase 6 Operational Replay Validation  

---

## Purpose

Confirm the completed protocol can be used **every day** in an operational environment (one-screen judgment), without changing trading rules.

```text
Phase 6 Replay → Phase 7 Readiness → (問題なし) → Freeze / Baseline → 通常運用
```

---

## Hard Constraints (confirmed UNCHANGED)

| Area | Status |
|---|---|
| Trading protocol | **UNCHANGED** |
| Detection logic | **UNCHANGED** |
| Asset Selection | **UNCHANGED** |
| Entry / Exit rules | **UNCHANGED** |
| Risk rules (−15% 1570) | **UNCHANGED** |
| ViewModel schema (2.1) | **UNCHANGED** |
| Legacy modules | **UNTOUCHED** |

**Ops infrastructure added (readiness only):**

| Item | Path |
|---|---|
| File state persistence | `taxable_account/state/file_store.py` |
| State `from_dict` restore | `taxable_account/domain/models.py` |
| Readiness harness | `taxable_account/validation/operational_readiness.py` |
| Daily ops CLI (state / manual fill) | `taxable_account/ops/__main__.py` |
| Tests | `tests/test_taxable_account_phase7_operational_readiness.py` |
| Evidence | `data/common_backtest/reports/taxable_account_phase7_operational_readiness/` |

---

## Confirmation Targets

| # | Target | Result |
|---|---|---|
| 1 | Market data更新 | **PASS** (bundle load + latest as_of condition) |
| 2 | State persistence | **PASS** (JSON round-trip) |
| 3 | Discord表示 | **PASS** (dry-run one-screen fields) |
| 4 | 手動Entry記録 | **PASS** (`ENTRY_FILLED` + stop arm) |
| 5 | Position更新 | **PASS** (282A hold + reference P/L) |
| 6 | Risk Stop表示 | **PASS** (850 / −15% / ACTIVE) |
| 7 | State transition | **PASS** (Growth→1570→REENTRY_WAIT) |
| 8 | Error handling | **PASS** (KeyError / TransitionError / webhook missing / missing state file) |

---

## Scenario Display Checks (one-screen)

| Scenario | Result |
|---|---|
| 野村保有中 | **PASS** |
| Alert発生 | **PASS** |
| 1570 Entry | **PASS** |
| 1570 Risk Stop ACTIVE | **PASS** |
| 1570 Exit | **PASS** |
| 282A Entry | **PASS** |
| Recovery後野村復帰 | **PASS** |
| CASH待機 | **PASS** |

---

## Daily ops usage (paper)

```text
# Market step + persist State
python -m taxable_account.ops --as-of YYYY-MM-DD --state-file data/ops/taxable_state.json

# Manual fill (existing ENTRY_FILLED event only)
python -m taxable_account.ops --state-file data/ops/taxable_state.json \
  --record-entry 1570 1000 --entry-date YYYY-MM-DD --view-state-only

# Discord remains dry-run unless --discord-live + TAXABLE_DISCORD_WEBHOOK
```

No broker auto-order. Operator confirms fills.

---

## Completion Criteria

| Criterion | Result |
|---|---|
| 実運用で必要な情報が一画面で確認できる | **PASS** |
| 売買ルール変更なし | **PASS** |
| Freeze recommended | **YES** |

```text
pytest tests/test_taxable_account_phase7_operational_readiness.py
→ 3 passed
```

---

## Freeze / Baseline Gate

Phase 7 **PASS** with no protocol defects found.

**Freeze is appropriate now.**

Recommended baseline label:

```text
ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0
```

Scope of freeze:

- Detection / Decision / Asset Selection / Position / Risk Control rules
- ViewModel schema 2.1
- Discord projection contract
- Ops CLI + FileStateStore as the daily interface

Post-freeze changes require **separate authorization** (not silent improvement).

---

## Final Confirmation

```text
Operational Readiness Check COMPLETE.

Trading protocol:
UNCHANGED

One-screen daily ops:
VERIFIED

State persistence:
VERIFIED

Discord display:
VERIFIED

Freeze / Baseline:
AUTHORIZED
```
