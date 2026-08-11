# ASA-TAXABLE-ACCOUNT-PROTOCOL-VIEWMODEL-2.0

# TaxableAccountViewModel — Operational Display Spec

**Status:** APPROVED (Phase 5 / extended Phase 5.1 → schema **2.1**)  
**Schema:** `docs/schemas/taxable_account_viewmodel.schema.json` (**2.1**)  
**Rule:** Projection from `TaxableAccountState` + runtime marks only. No new sensors / entry rules / risk rules.

**Phase 5.1 adds:** `capital_flow.{current_asset,previous_asset,next_candidate,reason}`, `reference.*`, `entry_status`, `risk.distance_pct`, `next_action`, `signal`.  
See `docs/reports/ASA-REGISTER-TAXABLE-ACCOUNT-PROTOCOL-VIEWMODEL-PHASE5.1-1.0.md`.

---

## Purpose

One-screen operational judgment model — not a numeric dump.

Operator must see: current regime/asset/decision, why, capital path, entry timing, and position/risk (when held).

---

## Sections

### 1. Current State

| Field | Source |
|---|---|
| `regime` | `state.regime_state` |
| `asset` | held asset if not CASH else selected `state.asset` |
| `position_state` | position enum; 1570+ACTIVE risk → `RISK_CONTROL_ACTIVE` |
| `decision` | display mapping only (below) |

**Decision vocabulary (display):**

| Decision | When (state mapping) |
|---|---|
| `MAINTAIN` | `GROWTH_ACTIVE` and not in exit/entry path |
| `HOLD` | `POSITION_ACTIVE` |
| `EXIT` | risk `TRIGGERED` or position `EXIT` |
| `ENTRY_READY` | position `ENTRY_READY` |
| `REENTRY_WAIT` | position `REENTRY_WAIT` |
| `TRANSFER` | regime `EXIT_PENDING` |
| `WAIT` | otherwise (watch / recovery / flat) |

### 2. Decision Reason

Human judgment labels derived from state flags — **not** raw sensor value tables.

Examples: Growth条件維持 / dd15_ma200 Alert発生 / crash_15成立 / semi_signal成立 / Recovery Model B進行中 / 1570 Risk Stop ACTIVE

### 3. Capital Flow

| Field | Meaning |
|---|---|
| `current` | Where capital sits now (label) |
| `steps` | Path narrative |
| `swing_candidates` | crash_15→1570 / semi_signal→282A / else→CASH |
| `next_destination` | Immediate candidate label |

Priority unchanged: **1570 > 282A > CASH** in Swing; Nomura only in Growth.

### 4. Entry Timing

| Status | Meaning |
|---|---|
| `ENTRY_READY` | Purchase-ready under existing protocol |
| `WAIT` | Conditions not met / transfer / recovery wait |
| `N/A` | Growth maintain or already holding |

### 5. Position

Present only while holding (`POSITION_ACTIVE` or mid-`EXIT`).

1570 adds Risk Stop block: formula `Entry × 0.85`, `stop_price`, status.

---

## Prohibitions

- No Detection / Decision / Asset Selection / Risk formula changes
- No auto-order fields
- No Legacy imports
