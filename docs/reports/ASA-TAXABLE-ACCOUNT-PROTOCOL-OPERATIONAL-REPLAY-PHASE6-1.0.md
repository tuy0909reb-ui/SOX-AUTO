# ASA-TAXABLE-ACCOUNT-PROTOCOL-OPERATIONAL-REPLAY-PHASE6-1.0

# Phase 6 — Operational Replay Validation

**Date:** 2026-08-04  
**Timestamp:** 2026-08-04T23:30:00+09:00  
**Title:** Discord ViewModel operational replay (operator readability)  
**Status:** **PASS / COMPLETE**  
**Parent:** Phase 5.1 ViewModel Reference Numbers  

---

## Objective

Validate that a human operator can understand **current state, capital flow, and next action** from ViewModel 2.1 → Discord display through the full runtime chain.

**Not in scope:** strategy improvement, parameter optimization, rule modification, new signals.

---

## Hard Constraints (confirmed)

| Item | Status |
|---|---|
| Growth / dd15_ma200 / Model B / crash_15 / semi_signal | **UNCHANGED** |
| Asset Selection / Freeze Entry / Exit / ReEntry | **UNCHANGED** |
| 1570 Risk Stop (−15%) | **UNCHANGED** |
| ViewModel decision logic | **UNCHANGED** |
| Legacy modules | **UNTOUCHED** |

**This phase added only:**

- Replay harness: `taxable_account/validation/operational_replay.py`
- Tests: `tests/test_taxable_account_phase6_operational_replay.py`
- Evidence: `data/common_backtest/reports/taxable_account_phase6_operational_replay/`

---

## Validation Flow

```text
Historical / Scripted Market Data
  → Detection → Regime Decision → Asset Selection
  → Position Management → Risk Control → State
  → ViewModel 2.1 → Discord Display
```

---

## Evidence Location

| Artifact | Path |
|---|---|
| Summary | `.../taxable_account_phase6_operational_replay/summary.json` |
| Per-scenario JSON | `S1_*.json` … `S6_*.json` |
| Transition logs | `S1_transitions.log` … `S6_transitions.log` |

```text
pytest tests/test_taxable_account_phase6_operational_replay.py
→ 8 passed

Full related suite:
→ 65 passed
```

---

## Scenario Results

### S1 — Normal Growth — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-01-04 → 2024-01-05 |
| Purpose | Normal operation display |

**State transitions:** GROWTH_ACTIVE (stable)

**Verified:**

| Check | Result |
|---|---|
| Regime GROWTH_ACTIVE | PASS |
| Asset 野村世界半導体株投資 | PASS |
| Decision MAINTAIN | PASS |
| Entry timing N/A | PASS |
| Next = monitoring (dd15_ma200 Alert monitoring) | PASS |
| No unnecessary ALERT_ON | PASS |
| Reference block present | PASS |
| Discord one-screen fields | PASS |

---

### S2 — Growth Exit Transition — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-02-01 → 2024-02-02 |
| Purpose | 野村 → dd15 Alert → SWING |

**State transitions:** GROWTH_ACTIVE → SWING_ACTIVE  
**Events (transition day):** ALERT_ON, TRANSFER_COMPLETE  

**Verified:** Exit reason (dd15 Alert) visible in Capital Flow / Discord; next candidate displayed.  
*(EXIT_PENDING is intra-step under auto_transfer; events prove the path.)*

---

### S3 — Crash Recovery Entry — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-03-01 → 2024-03-05 |
| Purpose | crash_15 → 1570 entry |

**Flow captured:**

```text
GROWTH_ACTIVE
  → SWING_ACTIVE + ENTRY_READY (1570)   [auto_fill delayed]
  → POSITION_ACTIVE / RISK_CONTROL_ACTIVE
```

**Verified:**

| Check | Result |
|---|---|
| Entry Status READY / Candidate 1570 | PASS |
| Reason crash_15 ACTIVE | PASS |
| SIGNAL_ENTRY_AVAILABLE then ENTRY_FILLED | PASS |
| Discord shows 1570 | PASS |

---

### S4 — 1570 Risk Control — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-04-01 → 2024-04-03 |
| Purpose | Entry × 0.85 stop display |

**Flow:**

```text
1570 Entry → Risk ACTIVE (stop=850)
  → price 840 → STOP_TRIGGERED → EXIT_FILLED → REENTRY_WAIT
```

**Verified:**

| Check | Result |
|---|---|
| Risk ACTIVE + stop 850 | PASS |
| TRIGGERED → REENTRY_WAIT | PASS |
| Next: Freeze Re-evaluation | PASS |
| Discord Risk Control shows stop | PASS |
| No Freeze rule modification | PASS |

---

### S5 — 282A Swing — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-05-01 → 2024-05-03 |
| Purpose | semi_signal alternative path |

**Verified:** Asset 282A; Signal semi_signal; Next Existing Exit monitoring; ENTRY_READY then POSITION_ACTIVE.

---

### S6 — Recovery Re-entry — **PASS**

| Field | Value |
|---|---|
| Input period | 2024-06-03 → 2024-06-05 |
| Purpose | Return to Growth |

**Events (recovery day):** ALERT_OFF, RECOVERY_COMPLETE  
**Final:** GROWTH_ACTIVE / 野村 / MAINTAIN  

*(REENTRY_PENDING is intra-step under auto recovery; events + final Nomura display verify the operator-visible outcome.)*

---

## Completion Criteria

| Criterion | Result |
|---|---|
| Growth operation | **PASS** |
| Exit transition | **PASS** |
| 1570 entry flow | **PASS** |
| 1570 Risk Stop display | **PASS** |
| 282A flow | **PASS** |
| Recovery return | **PASS** |
| Capital Flow visibility | **PASS** |
| One-screen operation | **PASS** |
| No protocol modification | **PASS** |

---

## Final Confirmation

```text
Operational Replay Validation COMPLETE.

Trading protocol:
UNCHANGED

ViewModel:
VERIFIED

Discord Display:
VERIFIED

Runtime operation readiness:
VALIDATED
```

No implementation expansion after PASS without separate authorization.
