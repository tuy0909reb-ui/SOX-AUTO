"""
BTC DCA × Halving — SM SoT alignment resolution + Phase B confirmation.

- Does NOT change candidate E/X/R identities
- Updates A3 freeze status to FROZEN after SM SoT once_per_cycle adoption
- Runs B: reconcile frozen set with SoT SM + reproduce A2 metrics
- Does NOT run C/D
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from run_a2_exploration import (  # noqa: E402
    EVAL_END,
    EVAL_START,
    Rule,
    cycle_segment_metrics,
    load_a1_panel,
    pure_dca,
    run_backtest,
    slice_eval,
)

CONTRACT_VERSION = "btc-dca-halving-contracts-v1.1-sm-once-per-cycle"
A3_DIR = ROOT / "a3" / "a3-2026-08-27"
A2_DIR = ROOT / "a2" / "a2-2026-08-27"
TOL = 1e-9


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _fp(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def resolve_a3_freeze() -> dict:
    path = A3_DIR / "candidate_set.json"
    cs = json.loads(path.read_text(encoding="utf-8"))
    # Preserve candidate identities exactly
    rules_before = [(c["rule_id"], c["e_start"], c["x_exit"], c["r_wait"]) for c in cs["candidates"]]

    cs["status"] = "FROZEN"
    cs["contract_version"] = CONTRACT_VERSION
    cs["formally_frozen_at"] = _utc_now()
    cs["sm_sot_alignment"] = {
        "resolved": True,
        "resolved_at": cs["formally_frozen_at"],
        "human_decision": "Adopt once_per_cycle into Strategy State Machine SoT",
        "contract_version": CONTRACT_VERSION,
        "r_semantics": (
            "R_wait counts calendar days in the NEW cycle_id after transition; "
            "not from exit date. Frozen set uses R_wait=180."
        ),
        "constraints": {
            "exit_per_cycle_max": 1,
            "same_cycle_reentry_after_exit": False,
            "reentry_only_in_next_cycle": True,
            "e_start_frozen": 0,
            "r_wait_frozen": 180,
            "candidate_rules_unchanged": True,
        },
    }
    cs["state_machine_binding"] = {
        "required_mode_for_these_candidates": "once_per_cycle",
        "approved_contract_sm_gap": False,
        "aligned_with_sot": True,
        "gate": "B may proceed; C still requires explicit later authorization",
    }

    rules_after = [(c["rule_id"], c["e_start"], c["x_exit"], c["r_wait"]) for c in cs["candidates"]]
    if rules_before != rules_after:
        raise RuntimeError("candidate E/X/R changed unexpectedly")

    text = json.dumps(cs, ensure_ascii=False, indent=2) + "\n"
    path.write_text(text, encoding="utf-8")

    # Amendment note beside freeze (does not replace A3 analysis)
    note = "\n".join(
        [
            "# A3 Freeze Status Resolution",
            "",
            f"- prior_status: FROZEN_PENDING_SM_SOT_ALIGNMENT",
            f"- new_status: FROZEN",
            f"- formally_frozen_at: {cs['formally_frozen_at']}",
            f"- contract_version: {CONTRACT_VERSION}",
            "- candidate E/X/R: unchanged",
            "- SM SoT: once_per_cycle adopted (Human 2026-08-28)",
            "",
        ]
    )
    (A3_DIR / "FREEZE_STATUS_RESOLUTION.md").write_text(note, encoding="utf-8")

    meta_path = A3_DIR / "run_meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["status"] = "FROZEN"
    meta["contract_version"] = CONTRACT_VERSION
    meta["formally_frozen_at"] = cs["formally_frozen_at"]
    meta["sm_gap_blocks_BCD"] = False
    meta["sm_gap_blocks_C_until_authorized"] = True
    meta["candidate_set_fingerprint"] = _fp(text)
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return cs


def near(a: float, b: float, tol: float = 1e-8) -> bool:
    return abs(a - b) <= max(tol, abs(b) * 1e-10)


def run_phase_b(cs: dict) -> None:
    data_version = f"b-{_utc_today()}"
    out = ROOT / "b" / data_version
    out.mkdir(parents=True, exist_ok=True)

    panel_full, a1_ver = load_a1_panel()
    panel = slice_eval(panel_full)
    pure = pure_dca(panel)
    pure16 = pure_dca(panel[panel["cycle_id"] == "H2016"])
    pure20 = pure_dca(panel[panel["cycle_id"] == "H2020"])

    checks = []
    rows = []
    all_pass = True

    for c in cs["candidates"]:
        rule = Rule(c["e_start"], c["x_exit"], c["r_wait"])
        full = run_backtest(panel, rule, mode="once_per_cycle")
        c16 = cycle_segment_metrics(panel, rule, "H2016", mode="once_per_cycle")
        c20 = cycle_segment_metrics(panel, rule, "H2020", mode="once_per_cycle")

        # SM invariants
        sells = full["sells"]
        cycles_sold = [s["cycle_id"] for s in sells]
        one_per_cycle = len(cycles_sold) == len(set(cycles_sold))
        expected_cycles = {"H2016", "H2020"}
        sold_set = set(cycles_sold)
        sm_ok = (
            full["sell_count"] == 2
            and one_per_cycle
            and sold_set == expected_cycles
            and all(int(s["dsh"]) == c["x_exit"] for s in sells)
        )

        # Reproduce A2 stored metrics
        repro = {
            "roi": near(full["return_on_invested"], c["a2_full_window_roi"]),
            "excess": near(
                full["return_on_invested"] - pure["return_on_invested"],
                c["a2_excess_roi_vs_pure_full"],
            ),
            "min_cycle": near(
                min(c16["return_on_invested"], c20["return_on_invested"]),
                c["a2_min_cycle_roi"],
            ),
            "wait": full["cash_wait_days"] == c["a2_cash_wait_days"],
            "sells": full["sell_count"] == c["a2_sell_count"],
            "invested": near(full["cum_invested"], c["a2_cum_invested"]),
            "equity": near(full["terminal_equity"], c["a2_terminal_equity"], tol=1e-4),
        }
        params_ok = c["e_start"] == 0 and c["r_wait"] == 180
        ok = sm_ok and params_ok and all(repro.values())
        all_pass = all_pass and ok

        row = {
            "rule_id": c["rule_id"],
            "role_in_set": c["role_in_set"],
            "e_start": c["e_start"],
            "x_exit": c["x_exit"],
            "r_wait": c["r_wait"],
            "mode": "once_per_cycle",
            "b_roi": full["return_on_invested"],
            "b_excess_vs_pure": full["return_on_invested"] - pure["return_on_invested"],
            "b_min_cycle_roi": min(c16["return_on_invested"], c20["return_on_invested"]),
            "b_H2016_roi": c16["return_on_invested"],
            "b_H2020_roi": c20["return_on_invested"],
            "b_cash_wait_days": full["cash_wait_days"],
            "b_sell_count": full["sell_count"],
            "b_exit_dates": "|".join(s["date"] for s in sells),
            "b_exit_cycles": "|".join(cycles_sold),
            "b_exit_dsh": "|".join(str(int(s["dsh"])) for s in sells),
            "a2_roi": c["a2_full_window_roi"],
            "sm_invariants_pass": sm_ok,
            "a2_reproduce_pass": all(repro.values()),
            "params_e0_r180_pass": params_ok,
            "overall_pass": ok,
            "repro_detail": repro,
        }
        rows.append(row)
        checks.append(
            {
                "rule_id": c["rule_id"],
                "sm_ok": sm_ok,
                "repro": repro,
                "params_ok": params_ok,
                "overall_pass": ok,
                "sells": sells,
            }
        )

    # threshold_repeat negative control on primary: must NOT match once_per_cycle sell pattern
    primary = Rule(0, 540, 180)
    churn = run_backtest(panel, primary, mode="threshold_repeat")
    negative_control = {
        "rule_id": "E0_X540_R180",
        "threshold_repeat_sell_count": churn["sell_count"],
        "once_per_cycle_sell_count": 2,
        "pass_if_churn_gt_once": churn["sell_count"] > 2,
    }

    results = pd.DataFrame([{k: v for k, v in r.items() if k != "repro_detail"} for r in rows])
    csv = results.to_csv(index=False, lineterminator="\n")
    (out / "b_confirmation_results.csv").write_text(csv, encoding="utf-8")

    summary = {
        "phase": "B",
        "contract_version": CONTRACT_VERSION,
        "data_version": data_version,
        "candidate_set_id": cs["candidate_set_id"],
        "candidate_set_status": cs["status"],
        "eval_start": EVAL_START,
        "eval_end": EVAL_END,
        "source_a1": a1_ver,
        "source_a2": "a2-2026-08-27",
        "source_a3": "a3-2026-08-27",
        "overall_pass": all_pass,
        "pure_dca_roi": pure["return_on_invested"],
        "pure_dca_H2016_roi": pure16["return_on_invested"],
        "pure_dca_H2020_roi": pure20["return_on_invested"],
        "checks": checks,
        "negative_control_threshold_repeat": negative_control,
        "adoption_judgment": False,
        "proceeded_to_C": False,
    }
    (out / "b_confirmation_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    report = build_b_report(summary, results, negative_control, cs)
    (out / "B_REPORT.md").write_text(report, encoding="utf-8")

    meta = {
        "phase": "B",
        "contract_version": CONTRACT_VERSION,
        "data_version": data_version,
        "retrieved_at": _utc_now(),
        "overall_pass": all_pass,
        "candidate_set_id": cs["candidate_set_id"],
        "content_fingerprints": {"b_confirmation_results.csv": _fp(csv)},
        "no_adoption": True,
        "no_C": True,
    }
    (out / "run_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    docs = Path(__file__).resolve().parents[2] / "docs" / "reports"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / "BTC-COMPLETE-B-CANDIDATE-CONFIRMATION-001.md").write_text(
        report + f"\n---\n\nVersioned artifacts: `research/btc_dca_halving/b/{data_version}/`\n",
        encoding="utf-8",
    )
    # Also record SM amendment completion
    (docs / "BTC-COMPLETE-SM-ONCE-PER-CYCLE-AMENDMENT-001.md").write_text(
        "\n".join(
            [
                "# BTC SM SoT Amendment — once_per_cycle",
                "",
                f"**Contract:** `{CONTRACT_VERSION}`",
                f"**Resolved at:** `{cs['formally_frozen_at']}`",
                f"**candidate_set_id:** `{cs['candidate_set_id']}` (E/X/R unchanged)",
                f"**status:** `{cs['status']}`",
                "",
                "See contracts §2 in `BTC-DESIGN-DCA-HALVING-CYCLE-ANALYSIS-CONTRACTS-001.md`.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    (ROOT / "b" / "LATEST.txt").write_text(data_version + "\n", encoding="utf-8")
    print(f"B complete: {out} overall_pass={all_pass}")


def build_b_report(summary: dict, results: pd.DataFrame, neg: dict, cs: dict) -> str:
    lines = [
        "# BTC B — Frozen Candidate Confirmation (pre-C)",
        "",
        "**Record:** `BTC-COMPLETE-B-CANDIDATE-CONFIRMATION-001`",
        f"**Status:** {'PASS' if summary['overall_pass'] else 'FAIL'} — Phase B only",
        f"**Contract:** `{CONTRACT_VERSION}`",
        f"**candidate_set_id:** `{summary['candidate_set_id']}`",
        f"**candidate_set status:** `{summary['candidate_set_status']}`",
        f"**data_version:** `{summary['data_version']}`",
        "",
        "```text",
        "B = confirm frozen candidates under SoT once_per_cycle + reproduce A2 metrics",
        "B ≠ adoption",
        "B ≠ ETF/post-H2024 validation (that is C)",
        "```",
        "",
        "## 0. Preconditions",
        "",
        "- SM SoT amended to once_per_cycle (R counts in new cycle)",
        "- A3 status resolved: FROZEN (candidate E/X/R unchanged)",
        f"- Eval window: {summary['eval_start']} → {summary['eval_end']} (no H2024 / no post_etf)",
        "",
        "## 1. SM invariant checks",
        "",
        "For each frozen rule:",
        "- mode = once_per_cycle",
        "- E=0, R=180",
        "- sell_count = 2 (H2016 once, H2020 once)",
        "- exit dsh == X",
        "- no same-cycle double exit",
        "",
        "## 2. A2 reproduction",
        "",
        "| rule_id | SM | A2 repro | E0/R180 | overall | B ROI | A2 ROI | exits |",
        "|---|---|---|---|---|---:|---:|---|",
    ]
    for _, r in results.iterrows():
        lines.append(
            f"| {r['rule_id']} | {r['sm_invariants_pass']} | {r['a2_reproduce_pass']} | "
            f"{r['params_e0_r180_pass']} | {r['overall_pass']} | {r['b_roi']:.2%} | "
            f"{r['a2_roi']:.2%} | {r['b_exit_dates']} |"
        )

    lines += [
        "",
        "## 3. Negative control",
        "",
        f"- `threshold_repeat` on E0_X540_R180 sell_count = {neg['threshold_repeat_sell_count']} "
        f"(once_per_cycle = {neg['once_per_cycle_sell_count']})",
        f"- distinct from SoT path: **{neg['pass_if_churn_gt_once']}**",
        "",
        "## 4. Purpose reminders carried into later C",
        "",
        "- Full-window still trails pure DCA for all three (expected regimen cost)",
        "- X=540 remains primary probe; 365/730 are contrasts",
        "- Do not refit on H2024",
        "",
        f"Pure DCA full-window ROI (B window): **{summary['pure_dca_roi']:.2%}**",
        "",
        "## 5. Stop line",
        "",
        f"- overall_pass = **{summary['overall_pass']}**",
        "- C / D **not** started",
        "- No investment adoption",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    cs = resolve_a3_freeze()
    if cs["status"] != "FROZEN":
        raise RuntimeError("freeze resolution failed")
    run_phase_b(cs)


if __name__ == "__main__":
    main()
