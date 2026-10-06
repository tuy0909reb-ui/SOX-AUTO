# BTC A3 — Candidate Set Freeze (Purpose ↔ A2 Consistency)

**Record:** `BTC-COMPLETE-A3-CANDIDATE-SET-001`
**Status:** FROZEN_PENDING_SM_SOT_ALIGNMENT — A3 complete; B/C/D not started
**Contract:** `btc-dca-halving-contracts-v1.0-approved`
**candidate_set_id:** `btc-dca-halving-candset-a3-2026-08-27`
**frozen_at:** `2026-08-27T22:02:41Z`
**sources:** A1 `a1-2026-08-27` / A2 `a2-2026-08-27`

```text
A3 ≠ adoption
A3 ≠ 'pick X=540 because it won'
A3 = align strategy purpose with A2 facts, then freeze a small probe set for C
H2024 not used for selection
```

## 0. Declared optimization object (A3)

Test whether calendar once-per-cycle full-exit + re-DCA structure remains comparable post-ETF — NOT maximize full-window ROI vs pure DCA

Not used as sole gate: beat pure DCA on full-window ROI.

## 1. Why cycle-local and full-window diverge

1. **Different capital paths:** Cycle-segment BT starts fresh each cycle and often ends in cash after one exit → ROI reflects that cycle's timed exit. Full-window keeps sale proceeds as cash across years while pure DCA keeps compounding BTC.
2. **Cash drag:** once_per_cycle flat from exit until next cycle (+R) removes upside of multi-year BTC appreciation that pure DCA captures.
3. **Different questions:** cycle-local asks 'did the timed exit help *this* cycle vs never selling in-segment?'; full-window asks 'did repeated full exits grow wealth vs never selling across 2016→early 2024?'.
4. **A2 fact:** X=540 can win the first question on H2016 & H2020 and still lose the second vs pure DCA on all 72 rules.

## 2. Effect of Re-entry R

- Under once_per_cycle, R does **not** change H2016/H2020 cycle-local ROI (no next cycle inside a segment).
- R changes full-window invested capital, wait days, and when post-halving DCA resumes.
- A2: within E0_X540, larger R raised full-window ROI-on-invested (less early buying) — **not** treated as R optimization proof.
- **A3 decision:** do not optimize R. Freeze **R=180** for all candidates (mid-grid + contract BENCH_CAL_SIMPLE). Choose R later only if C/tax/policy requires a sensitivity run (new set_id).

### How R *should* be chosen (criteria order)

1. Strategy purpose (next-cycle reconnect — once_per_cycle already encodes this)
2. Operational simplicity (one R across the set)
3. Tax/cost assumptions (future sensitivity; not A3 optimizer)
4. Full-window path metrics (monitor in C; do not refit)

## 3. Interpreting 'full exit loses to pure DCA'

| Wrong reading | A3 reading |
|---|---|
| Strategy failed; abandon full exit | Full exit is a **regime choice** with an expected wealth opportunity cost vs never-sell DCA in a long uptrend sample |
| Only keep rules that beat pure DCA | Would empty the set and abandon the hypothesis before C |
| Ignore pure DCA | Still required benchmark — large shortfall is a risk to report in C, not a silent discard rule |

A3 keeps candidates that **instantiate the hypothesis** and remain **not catastrophically incoherent** on A2 (X=540 family is best among exits; contrasts retained). Pure-DCA gap is a C evaluation axis (`comparable`/`degraded`/`inconclusive`), not an A3 kill-switch.

## 4. Meaning of X=540 on both H2016 and H2020

- On the **fixed coarse grid**, X=540 was the unique Exit with both-cycle beat vs cycle-local pure DCA (with E=0).
- This is evidence of a **repeatable calendar timing on N=2 under this grid**, not statistical proof of an edge.
- It justifies carrying X=540 as the **primary probe** into C — not as a locked trading rule for adoption.

## 5. Peak proximity / lookahead concern

- A1 descriptive H2016 days_halving→peak ≈ 525; grid X=540 is adjacent.
- A2/A3 **did not** choose X by inverting peak dates; X was a pre-registered grid point.
- Residual risk: Nature may have favored ~1.5y exits in these two cycles; C exists to stress that outside the explore sample.
- **Forbidden:** shrinking grid toward 525 after A1/A2.

## 6. Reflecting E=0 dominance

- All frozen candidates use **E=0**.
- E>0 rules are explicitly not frozen (dominated; adds complexity without A2 support).

## 7. Does K≤5 still matter?

K≤5 is an upper bound to prevent carrying the full exploration grid into C; it is not a quota to fill.

This freeze uses **K=3** (≤5). Not padded to 5.

## 8. once_per_cycle vs Strategy State Machine SoT — GAP (blocks B/C)

```text
{
  "approved_SoT_R_wait": "FLAT_CASH after exit; re-enter after R_wait calendar days from exit (contracts §2 / §5.1). Does not forbid same-cycle re-entry.",
  "a2_a3_mode_once_per_cycle": "Exit at most once per cycle_id when dsh>=X; remain FLAT until cycle_id changes; then wait R_wait days in the new cycle before DCA.",
  "differences": [
    "SoT allows re-entry R days after exit even if still in same cycle; once_per_cycle forbids it",
    "SoT does not state 'one exit per cycle'; once_per_cycle adds that constraint",
    "Under literal SoT + dsh>=X, same-cycle re-entry yields threshold_repeat churn (rejected in A2)"
  ],
  "recommendation": "Human should amend Strategy State Machine SoT to once_per_cycle before B/C, because that matches「次サイクルで再DCA」and A2/A3 freeze binding."
}
```

**A3 action:** Freeze is marked `FROZEN_PENDING_SM_SOT_ALIGNMENT`.
Do **not** start B/C implementation until Human amends SoT to once_per_cycle (recommended) or rejects this binding.

## 9. Frozen candidate_set (K=3)

### 1. `E0_X540_R180` — primary_cycle_pattern_probe

| Field | Value |
|---|---|
| E / X / R | 0 / 540 / 180 |
| mode | once_per_cycle |
| A2 full ROI | 705.38% |
| A2 excess vs pure (full) | -609.22% |
| A2 min(H16,H20) ROI | 236.99% |
| A2 wait days | 1840 |

**選定理由:** A2: X=540 is the only Exit on the contract grid that beat cycle-local pure DCA on both H2016 and H2020 with E=0. Carried to C as the cycle-structure probe — NOT as an adopted max-ROI rule. R=180 fixed (mid-grid / BENCH_CAL_SIMPLE), not R-optimized.

**強み:**
- Both-cycle cycle-local outperformance vs segment pure DCA in A2 window
- Clear once-per-cycle full-exit timing (dsh=540) aligned with strategy narrative
- E=0 matches A2 dominance without delayed-entry complexity

**弱み:**
- Full-window ROI trails pure DCA substantially (A2 excess ≈ -609pp)
- Long cash wait after each exit
- X=540 near H2016 descriptive peak (~525d) — peak-proximity overfit concern

**過学習懸念:**
- N=2 explore cycles only
- Do not interpret proximity to A1 peak days as validation
- H2020 truncated pre-ETF in A2

**純DCAとの差:** Loses on full-window wealth path; wins on cycle-segment ROI at X=540

**Cで検証する内容:** Does the X=540 once-per-cycle exit+re-DCA structure remain timing-comparable and economically non-degraded post-ETF / into H2024 (without refit)?

### 2. `E0_X365_R180` — early_exit_contrast

| Field | Value |
|---|---|
| E / X / R | 0 / 365 / 180 |
| mode | once_per_cycle |
| A2 full ROI | 156.66% |
| A2 excess vs pure (full) | -1157.93% |
| A2 min(H16,H20) ROI | 196.43% |
| A2 wait days | 2190 |

**選定理由:** A2 early-exit contrast on same E/R. Weaker cycle-local results than X=540 but still a valid full-exit regimen. Included so C does not only test the A2 'winner' X.

**強み:**
- Earlier risk-off / shorter hold after halving
- Still once-per-cycle full exit (not a hold proxy)
- Controls for 'only X=540 was cherry-picked for C'

**弱み:**
- Worse A2 cycle-local and full-window metrics than X=540
- Even longer cash wait in A2 (earlier exit → longer flat into next cycle)
- May crystallize gains earlier (tax sensitivity later)

**過学習懸念:**
- Not an A2 champion — present only as structural contrast

**純DCAとの差:** Larger full-window shortfall than X=540 in A2

**Cで検証する内容:** If early calendar exits degrade differently post-ETF than X=540, the cycle pattern is X-sensitive rather than a generic full-exit effect.

### 3. `E0_X730_R180` — late_exit_contrast

| Field | Value |
|---|---|
| E / X / R | 0 / 730 / 180 |
| mode | once_per_cycle |
| A2 full ROI | 189.31% |
| A2 excess vs pure (full) | -1125.28% |
| A2 min(H16,H20) ROI | 49.19% |
| A2 wait days | 1460 |

**選定理由:** A2 late-exit contrast. Closer to 'hold longer then exit once'. Poor A2 cycle-local H2020 ROI — useful degraded baseline for C comparison.

**強み:**
- Shorter flat period after exit within-cycle path vs early X
- Stress-tests whether 'almost hold' calendar exits behave differently post-ETF

**弱み:**
- Weak A2 min-cycle ROI (H2020 especially)
- Still trails pure DCA full-window
- Less distinctive as a cycle-timing strategy

**過学習懸念:**
- Included for contrast breadth, not because A2 favored it

**純DCAとの差:** Large full-window shortfall; weak cycle-local vs X=540

**Cで検証する内容:** Whether late exits look more 'comparable' to a hold path post-ETF, vs the X=540 cycle-timed exit.

## 10. Why not 'X=540 only'

A single X=540 freeze would make C unable to separate 'full-exit hypothesis' from 'this one grid point'.
Early (365) and late (730) contrasts keep C interpretable if post-ETF behavior splits by Exit timing.
X=540 remains the **primary** probe, not the sole frozen rule.

## 11. Stop line

- A3 artifacts written; A1/A2 untouched
- B / C / D **not** started
- H2024 **not** used for selection
- Next Human decision: approve `once_per_cycle` as SM SoT (or reject freeze binding)
