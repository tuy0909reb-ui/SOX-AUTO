"""
BTC DCA × Halving — Phase A3 candidate_set freeze (analysis + freeze artifacts).

Does NOT run B/C/D.
Does NOT overwrite A1/A2.
Does NOT use H2024 for selection.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

CONTRACT_VERSION = "btc-dca-halving-contracts-v1.0-approved"
PHASE = "A3"
SOURCE_A2 = "a2-2026-08-27"
SOURCE_A1 = "a1-2026-08-27"

ROOT = Path(__file__).resolve().parent


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _fp(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_a2_row(rule_id: str, grid: pd.DataFrame) -> dict:
    row = grid.loc[grid["rule_id"] == rule_id].iloc[0]
    return {
        "rule_id": rule_id,
        "e_start": int(row["e_start"]),
        "x_exit": int(row["x_exit"]),
        "r_wait": int(row["r_wait"]),
        "a2_full_window_roi": float(row["roi"]),
        "a2_excess_roi_vs_pure_full": float(row["excess_roi_vs_pure"]),
        "a2_min_cycle_roi": float(row["min_cycle_roi"]),
        "a2_H2016_roi": float(row["H2016_roi"]),
        "a2_H2020_roi": float(row["H2020_roi"]),
        "a2_cash_wait_days": int(row["cash_wait_days"]),
        "a2_equity_mdd": float(row["equity_mdd"]),
        "a2_sell_count": int(row["sell_count"]),
        "a2_cum_invested": float(row["cum_invested"]),
        "a2_terminal_equity": float(row["terminal_equity"]),
    }


def main() -> None:
    data_version = f"a3-{_utc_today()}"
    out = ROOT / "a3" / data_version
    out.mkdir(parents=True, exist_ok=True)

    grid = pd.read_csv(ROOT / "a2" / SOURCE_A2 / "grid_results.csv")
    a2_meta = json.loads((ROOT / "a2" / SOURCE_A2 / "run_meta.json").read_text(encoding="utf-8"))

    # Frozen set: contrast on X, hold E=0 and R=180 fixed (not R-optimized)
    frozen_ids = ["E0_X540_R180", "E0_X365_R180", "E0_X730_R180"]
    candidates = []
    for i, rid in enumerate(frozen_ids, start=1):
        base = load_a2_row(rid, grid)
        meta = CANDIDATE_META[rid]
        candidates.append(
            {
                "rank_in_set": i,
                **base,
                **meta,
                "mode": "once_per_cycle",
                "refit_after_etf": False,
                "used_h2024_for_selection": False,
            }
        )

    candidate_set = {
        "candidate_set_id": f"btc-dca-halving-candset-{data_version}",
        "frozen_at": _utc_now(),
        "phase": PHASE,
        "contract_version": CONTRACT_VERSION,
        "status": "FROZEN_PENDING_SM_SOT_ALIGNMENT",
        "source_a1_data_version": SOURCE_A1,
        "source_a2_data_version": SOURCE_A2,
        "selection_window": {
            "eval_start": a2_meta["eval_start"],
            "eval_end": a2_meta["eval_end"],
            "note": "Same as A2; no H2024 / no post_etf in selection",
        },
        "optimization_objective_declared": {
            "primary_for_C": (
                "Test whether calendar once-per-cycle full-exit + re-DCA structure "
                "remains comparable post-ETF — NOT maximize full-window ROI vs pure DCA"
            ),
            "not_used_as_sole_gate": "beat_pure_dca_full_window",
            "also_tracked": [
                "cycle_local_roi_vs_cycle_pure",
                "full_window_roi_vs_pure",
                "cash_wait_days",
                "equity_mdd",
                "exit_timing_vs_halving",
            ],
        },
        "k_policy": {
            "contract_K_max": 5,
            "actual_K": len(candidates),
            "meaning": (
                "K≤5 is an upper bound to prevent carrying the full exploration grid into C; "
                "it is not a quota to fill."
            ),
        },
        "parameters_held_constant_across_set": {
            "e_start": 0,
            "r_wait": 180,
            "r_selection_basis": (
                "Policy/mid-grid + contract BENCH_CAL_SIMPLE uses R=180; "
                "NOT chosen by maximizing A2 full-window ROI (that would pick R=365)."
            ),
            "mode": "once_per_cycle",
        },
        "explicitly_not_frozen": {
            "E0_X540_R365": "Higher A2 full ROI within X=540 family but R was not an optimization target",
            "E90_*": "Dominated on A2; no policy reason to delay Entry",
            "X=450/630/900": "Interior/weak on A2 grid; excluded to keep C interpretable",
            "threshold_repeat": "Rejected; mismatches next-cycle re-DCA intent",
        },
        "state_machine_binding": {
            "required_mode_for_these_candidates": "once_per_cycle",
            "approved_contract_sm_gap": True,
            "gap_summary": SM_GAP,
            "gate": "B/C must not proceed until Human confirms SM SoT amendment or rejects freeze",
        },
        "candidates": candidates,
        "benchmarks_for_later_C": [
            {"id": "BENCH_PURE_DCA", "role": "never-exit wealth path"},
            {"id": "BENCH_CAL_SIMPLE", "params": "E0_X540_R180", "role": "aligned with primary candidate"},
        ],
        "prohibitions": [
            "Do not refit E/X/R on H2024 or post_etf",
            "Do not treat this freeze as investment adoption",
            "Do not interpret pure-DCA underperformance alone as strategy failure",
            "Do not interpret cycle-local X=540 edge alone as adoption",
        ],
    }

    text = json.dumps(candidate_set, ensure_ascii=False, indent=2) + "\n"
    (out / "candidate_set.json").write_text(text, encoding="utf-8")

    analysis = build_analysis(grid, candidate_set, a2_meta)
    (out / "A3_ANALYSIS.md").write_text(analysis, encoding="utf-8")
    (out / "A3_REPORT.md").write_text(analysis, encoding="utf-8")

    meta = {
        "phase": PHASE,
        "contract_version": CONTRACT_VERSION,
        "data_version": data_version,
        "frozen_at": candidate_set["frozen_at"],
        "candidate_set_id": candidate_set["candidate_set_id"],
        "status": candidate_set["status"],
        "source_a1": SOURCE_A1,
        "source_a2": SOURCE_A2,
        "a2_grid_fingerprint": a2_meta["content_fingerprints"]["grid_results.csv"],
        "candidate_set_fingerprint": _fp(text),
        "K": len(candidates),
        "sm_gap_blocks_BCD": True,
    }
    (out / "run_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    docs = Path(__file__).resolve().parents[2] / "docs" / "reports"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / "BTC-COMPLETE-A3-CANDIDATE-SET-001.md").write_text(
        analysis + f"\n---\n\nVersioned artifacts: `research/btc_dca_halving/a3/{data_version}/`\n",
        encoding="utf-8",
    )
    (ROOT / "a3" / "LATEST.txt").write_text(data_version + "\n", encoding="utf-8")
    print(f"A3 complete: {out}")
    print(f"candidate_set_id={candidate_set['candidate_set_id']} K={len(candidates)}")
    print("STATUS=FROZEN_PENDING_SM_SOT_ALIGNMENT (B/C blocked until SM gap resolved)")


SM_GAP = {
    "approved_SoT_R_wait": (
        "FLAT_CASH after exit; re-enter after R_wait calendar days from exit "
        "(contracts §2 / §5.1). Does not forbid same-cycle re-entry."
    ),
    "a2_a3_mode_once_per_cycle": (
        "Exit at most once per cycle_id when dsh>=X; remain FLAT until cycle_id changes; "
        "then wait R_wait days in the new cycle before DCA."
    ),
    "differences": [
        "SoT allows re-entry R days after exit even if still in same cycle; once_per_cycle forbids it",
        "SoT does not state 'one exit per cycle'; once_per_cycle adds that constraint",
        "Under literal SoT + dsh>=X, same-cycle re-entry yields threshold_repeat churn (rejected in A2)",
    ],
    "recommendation": (
        "Human should amend Strategy State Machine SoT to once_per_cycle before B/C, "
        "because that matches「次サイクルで再DCA」and A2/A3 freeze binding."
    ),
}


CANDIDATE_META = {
    "E0_X540_R180": {
        "role_in_set": "primary_cycle_pattern_probe",
        "selection_reason": (
            "A2: X=540 is the only Exit on the contract grid that beat cycle-local pure DCA "
            "on both H2016 and H2020 with E=0. Carried to C as the cycle-structure probe — "
            "NOT as an adopted max-ROI rule. R=180 fixed (mid-grid / BENCH_CAL_SIMPLE), not R-optimized."
        ),
        "strengths": [
            "Both-cycle cycle-local outperformance vs segment pure DCA in A2 window",
            "Clear once-per-cycle full-exit timing (dsh=540) aligned with strategy narrative",
            "E=0 matches A2 dominance without delayed-entry complexity",
        ],
        "weaknesses": [
            "Full-window ROI trails pure DCA substantially (A2 excess ≈ -609pp)",
            "Long cash wait after each exit",
            "X=540 near H2016 descriptive peak (~525d) — peak-proximity overfit concern",
        ],
        "overfit_concerns": [
            "N=2 explore cycles only",
            "Do not interpret proximity to A1 peak days as validation",
            "H2020 truncated pre-ETF in A2",
        ],
        "vs_pure_dca": "Loses on full-window wealth path; wins on cycle-segment ROI at X=540",
        "what_C_tests": (
            "Does the X=540 once-per-cycle exit+re-DCA structure remain timing-comparable "
            "and economically non-degraded post-ETF / into H2024 (without refit)?"
        ),
    },
    "E0_X365_R180": {
        "role_in_set": "early_exit_contrast",
        "selection_reason": (
            "A2 early-exit contrast on same E/R. Weaker cycle-local results than X=540 but "
            "still a valid full-exit regimen. Included so C does not only test the A2 'winner' X."
        ),
        "strengths": [
            "Earlier risk-off / shorter hold after halving",
            "Still once-per-cycle full exit (not a hold proxy)",
            "Controls for 'only X=540 was cherry-picked for C'",
        ],
        "weaknesses": [
            "Worse A2 cycle-local and full-window metrics than X=540",
            "Even longer cash wait in A2 (earlier exit → longer flat into next cycle)",
            "May crystallize gains earlier (tax sensitivity later)",
        ],
        "overfit_concerns": [
            "Not an A2 champion — present only as structural contrast",
        ],
        "vs_pure_dca": "Larger full-window shortfall than X=540 in A2",
        "what_C_tests": (
            "If early calendar exits degrade differently post-ETF than X=540, "
            "the cycle pattern is X-sensitive rather than a generic full-exit effect."
        ),
    },
    "E0_X730_R180": {
        "role_in_set": "late_exit_contrast",
        "selection_reason": (
            "A2 late-exit contrast. Closer to 'hold longer then exit once'. "
            "Poor A2 cycle-local H2020 ROI — useful degraded baseline for C comparison."
        ),
        "strengths": [
            "Shorter flat period after exit within-cycle path vs early X",
            "Stress-tests whether 'almost hold' calendar exits behave differently post-ETF",
        ],
        "weaknesses": [
            "Weak A2 min-cycle ROI (H2020 especially)",
            "Still trails pure DCA full-window",
            "Less distinctive as a cycle-timing strategy",
        ],
        "overfit_concerns": [
            "Included for contrast breadth, not because A2 favored it",
        ],
        "vs_pure_dca": "Large full-window shortfall; weak cycle-local vs X=540",
        "what_C_tests": (
            "Whether late exits look more 'comparable' to a hold path post-ETF, "
            "vs the X=540 cycle-timed exit."
        ),
    },
}


def build_analysis(grid: pd.DataFrame, candidate_set: dict, a2_meta: dict) -> str:
    crows = candidate_set["candidates"]
    lines = [
        "# BTC A3 — Candidate Set Freeze (Purpose ↔ A2 Consistency)",
        "",
        "**Record:** `BTC-COMPLETE-A3-CANDIDATE-SET-001`",
        "**Status:** FROZEN_PENDING_SM_SOT_ALIGNMENT — A3 complete; B/C/D not started",
        f"**Contract:** `{CONTRACT_VERSION}`",
        f"**candidate_set_id:** `{candidate_set['candidate_set_id']}`",
        f"**frozen_at:** `{candidate_set['frozen_at']}`",
        f"**sources:** A1 `{SOURCE_A1}` / A2 `{SOURCE_A2}`",
        "",
        "```text",
        "A3 ≠ adoption",
        "A3 ≠ 'pick X=540 because it won'",
        "A3 = align strategy purpose with A2 facts, then freeze a small probe set for C",
        "H2024 not used for selection",
        "```",
        "",
        "## 0. Declared optimization object (A3)",
        "",
        candidate_set["optimization_objective_declared"]["primary_for_C"],
        "",
        "Not used as sole gate: beat pure DCA on full-window ROI.",
        "",
        "## 1. Why cycle-local and full-window diverge",
        "",
        "1. **Different capital paths:** Cycle-segment BT starts fresh each cycle and often ends in cash after one exit → ROI reflects that cycle's timed exit. Full-window keeps sale proceeds as cash across years while pure DCA keeps compounding BTC.",
        "2. **Cash drag:** once_per_cycle flat from exit until next cycle (+R) removes upside of multi-year BTC appreciation that pure DCA captures.",
        "3. **Different questions:** cycle-local asks 'did the timed exit help *this* cycle vs never selling in-segment?'; full-window asks 'did repeated full exits grow wealth vs never selling across 2016→early 2024?'.",
        "4. **A2 fact:** X=540 can win the first question on H2016 & H2020 and still lose the second vs pure DCA on all 72 rules.",
        "",
        "## 2. Effect of Re-entry R",
        "",
        "- Under once_per_cycle, R does **not** change H2016/H2020 cycle-local ROI (no next cycle inside a segment).",
        "- R changes full-window invested capital, wait days, and when post-halving DCA resumes.",
        "- A2: within E0_X540, larger R raised full-window ROI-on-invested (less early buying) — **not** treated as R optimization proof.",
        "- **A3 decision:** do not optimize R. Freeze **R=180** for all candidates (mid-grid + contract BENCH_CAL_SIMPLE). Choose R later only if C/tax/policy requires a sensitivity run (new set_id).",
        "",
        "### How R *should* be chosen (criteria order)",
        "",
        "1. Strategy purpose (next-cycle reconnect — once_per_cycle already encodes this)",
        "2. Operational simplicity (one R across the set)",
        "3. Tax/cost assumptions (future sensitivity; not A3 optimizer)",
        "4. Full-window path metrics (monitor in C; do not refit)",
        "",
        "## 3. Interpreting 'full exit loses to pure DCA'",
        "",
        "| Wrong reading | A3 reading |",
        "|---|---|",
        "| Strategy failed; abandon full exit | Full exit is a **regime choice** with an expected wealth opportunity cost vs never-sell DCA in a long uptrend sample |",
        "| Only keep rules that beat pure DCA | Would empty the set and abandon the hypothesis before C |",
        "| Ignore pure DCA | Still required benchmark — large shortfall is a risk to report in C, not a silent discard rule |",
        "",
        "A3 keeps candidates that **instantiate the hypothesis** and remain **not catastrophically incoherent** on A2 (X=540 family is best among exits; contrasts retained). Pure-DCA gap is a C evaluation axis (`comparable`/`degraded`/`inconclusive`), not an A3 kill-switch.",
        "",
        "## 4. Meaning of X=540 on both H2016 and H2020",
        "",
        "- On the **fixed coarse grid**, X=540 was the unique Exit with both-cycle beat vs cycle-local pure DCA (with E=0).",
        "- This is evidence of a **repeatable calendar timing on N=2 under this grid**, not statistical proof of an edge.",
        "- It justifies carrying X=540 as the **primary probe** into C — not as a locked trading rule for adoption.",
        "",
        "## 5. Peak proximity / lookahead concern",
        "",
        "- A1 descriptive H2016 days_halving→peak ≈ 525; grid X=540 is adjacent.",
        "- A2/A3 **did not** choose X by inverting peak dates; X was a pre-registered grid point.",
        "- Residual risk: Nature may have favored ~1.5y exits in these two cycles; C exists to stress that outside the explore sample.",
        "- **Forbidden:** shrinking grid toward 525 after A1/A2.",
        "",
        "## 6. Reflecting E=0 dominance",
        "",
        "- All frozen candidates use **E=0**.",
        "- E>0 rules are explicitly not frozen (dominated; adds complexity without A2 support).",
        "",
        "## 7. Does K≤5 still matter?",
        "",
        candidate_set["k_policy"]["meaning"],
        "",
        f"This freeze uses **K={candidate_set['k_policy']['actual_K']}** (≤5). Not padded to 5.",
        "",
        "## 8. once_per_cycle vs Strategy State Machine SoT — GAP (blocks B/C)",
        "",
        "```text",
        json.dumps(SM_GAP, ensure_ascii=False, indent=2),
        "```",
        "",
        "**A3 action:** Freeze is marked `FROZEN_PENDING_SM_SOT_ALIGNMENT`.",
        "Do **not** start B/C implementation until Human amends SoT to once_per_cycle (recommended) or rejects this binding.",
        "",
        "## 9. Frozen candidate_set (K=3)",
        "",
    ]

    for c in crows:
        lines += [
            f"### {c['rank_in_set']}. `{c['rule_id']}` — {c['role_in_set']}",
            "",
            f"| Field | Value |",
            f"|---|---|",
            f"| E / X / R | {c['e_start']} / {c['x_exit']} / {c['r_wait']} |",
            f"| mode | {c['mode']} |",
            f"| A2 full ROI | {c['a2_full_window_roi']:.2%} |",
            f"| A2 excess vs pure (full) | {c['a2_excess_roi_vs_pure_full']:.2%} |",
            f"| A2 min(H16,H20) ROI | {c['a2_min_cycle_roi']:.2%} |",
            f"| A2 wait days | {c['a2_cash_wait_days']} |",
            "",
            f"**選定理由:** {c['selection_reason']}",
            "",
            "**強み:**",
        ]
        lines += [f"- {s}" for s in c["strengths"]]
        lines += ["", "**弱み:**"]
        lines += [f"- {s}" for s in c["weaknesses"]]
        lines += ["", "**過学習懸念:**"]
        lines += [f"- {s}" for s in c["overfit_concerns"]]
        lines += [
            "",
            f"**純DCAとの差:** {c['vs_pure_dca']}",
            "",
            f"**Cで検証する内容:** {c['what_C_tests']}",
            "",
        ]

    lines += [
        "## 10. Why not 'X=540 only'",
        "",
        "A single X=540 freeze would make C unable to separate 'full-exit hypothesis' from 'this one grid point'.",
        "Early (365) and late (730) contrasts keep C interpretable if post-ETF behavior splits by Exit timing.",
        "X=540 remains the **primary** probe, not the sole frozen rule.",
        "",
        "## 11. Stop line",
        "",
        "- A3 artifacts written; A1/A2 untouched",
        "- B / C / D **not** started",
        "- H2024 **not** used for selection",
        "- Next Human decision: approve `once_per_cycle` as SM SoT (or reject freeze binding)",
        "",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    main()
