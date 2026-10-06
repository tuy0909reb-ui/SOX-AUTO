"""
BTC DCA × Halving Cycle — Phase A2 exploration (discovery).

Contract base: btc-dca-halving-contracts-v1.0-approved
Human A2 amendment (2026-08-28):
  - A2 = discovery/exploration (not forced K≤5 / not forced staged-only presentation)
  - K≤5 freeze deferred to A3
  - Prohibitions retained: no H2024 in selection, no peak/bottom rules,
    no lookahead, no extra indicators, no adoption judgment

Does NOT run A3/B/C/D.
Does NOT overwrite A1 artifacts.
"""

from __future__ import annotations

import hashlib
import itertools
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd

CONTRACT_VERSION = "btc-dca-halving-contracts-v1.0-approved"
PHASE = "A2"
A2_AMENDMENT = (
    "A2 is discovery: full grid + marginal sweeps allowed; "
    "K<=5 freeze deferred to A3; staged E→X→R not required as sole method."
)

# Contract SoT grids (do not expand silently)
E_GRID = (0, 90, 180)
X_GRID = (365, 450, 540, 630, 730, 900)
R_GRID = (30, 90, 180, 365)

T_PRIMARY = "2024-01-11"
T_APPROVE = "2024-01-10"
FEE_RATE = 0.001  # assumption, not fact
DCA_AMOUNT = 5000.0  # JPY; 10000 is linear scale for this fee model

# Exploration window: H2016 start through last pre-ETF day (exclude post_etf / H2024)
EVAL_START = "2016-07-09"
EVAL_END = "2024-01-10"  # date < T_primary

ROOT = Path(__file__).resolve().parent
A1_LATEST = ROOT / "a1" / "LATEST.txt"


@dataclass(frozen=True)
class Rule:
    e_start: int
    x_exit: int
    r_wait: int

    @property
    def rule_id(self) -> str:
        return f"E{self.e_start}_X{self.x_exit}_R{self.r_wait}"


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _fingerprint(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_a1_panel() -> tuple[pd.DataFrame, str]:
    data_version = A1_LATEST.read_text(encoding="utf-8").strip()
    path = ROOT / "a1" / data_version / "panel_daily.csv"
    df = pd.read_csv(path, parse_dates=["date"])
    df = df.set_index("date").sort_index()
    return df, data_version


def slice_eval(panel: pd.DataFrame) -> pd.DataFrame:
    sub = panel.loc[pd.Timestamp(EVAL_START) : pd.Timestamp(EVAL_END)].copy()
    if sub.empty:
        raise RuntimeError("empty evaluation panel")
    # Guard: no H2024 bars, no post_etf bars in selection window
    if (sub["cycle_id"] == "H2024").any():
        raise RuntimeError("H2024 leaked into A2 eval window")
    if (sub["etf_regime"] == "post_etf").any():
        raise RuntimeError("post_etf leaked into A2 eval window")
    return sub


def run_backtest(
    panel: pd.DataFrame,
    rule: Rule,
    dca_amount: float = DCA_AMOUNT,
    fee_rate: float = FEE_RATE,
    mode: str = "once_per_cycle",
) -> dict:
    """State machine: ACCUMULATING / FLAT_CASH.

    mode:
      - once_per_cycle: exit at most once per cycle when dsh>=X; stay flat until
        next cycle_id, then wait R_wait days before DCA (matches strategy intent).
      - threshold_repeat: legacy/pathological — after re-entry, dsh>=X can fire again
        in the same cycle (documented for contrast only).
    """
    if mode not in ("once_per_cycle", "threshold_repeat"):
        raise ValueError(mode)

    cash = 0.0
    units = 0.0
    lot_cost = 0.0
    cum_invested = 0.0
    cum_fees = 0.0
    cum_sell_proceeds = 0.0
    cash_wait_days = 0
    state = "ACCUMULATING"
    days_since_exit = 0
    days_in_new_cycle = 0
    reentry_armed = False
    exited_cycle_id: str | None = None
    saw_cycle_change = False

    equity_peak = 0.0
    max_dd = 0.0
    holding_peak = 0.0
    holding_mdd = 0.0

    sells: list[dict] = []
    cycle_stats: dict[str, dict] = {}
    prev_cid: str | None = None

    def ensure_cycle(cid: str) -> dict:
        if cid not in cycle_stats:
            cycle_stats[cid] = {
                "cycle_id": cid,
                "invested": 0.0,
                "sell_proceeds": 0.0,
                "buy_days": 0,
                "sell_count": 0,
                "wait_days": 0,
                "first_buy": None,
                "exit_dates": [],
            }
        return cycle_stats[cid]

    for i, dt in enumerate(panel.index):
        row = panel.iloc[i]
        px = float(row["btc_jpy"])
        dsh = float(row["days_since_halving"])
        cid = str(row["cycle_id"])
        cs = ensure_cycle(cid)

        if prev_cid is not None and cid != prev_cid:
            saw_cycle_change = True
            days_in_new_cycle = 0
            if mode == "once_per_cycle" and state == "FLAT_CASH" and exited_cycle_id == prev_cid:
                # new cycle begins while flat after prior exit
                days_since_exit = 0  # R measured in new cycle from here
        if prev_cid is None or cid != prev_cid:
            if state == "FLAT_CASH" and mode == "once_per_cycle":
                days_in_new_cycle = 0
        prev_cid = cid

        equity = cash + units * px
        equity_peak = max(equity_peak, equity) if equity_peak > 0 else max(equity, equity_peak)
        if equity_peak > 0:
            max_dd = min(max_dd, equity / equity_peak - 1.0)

        if state == "ACCUMULATING" and units > 0:
            holding_equity = units * px
            holding_peak = max(holding_peak, holding_equity)
            if holding_peak > 0:
                holding_mdd = min(holding_mdd, holding_equity / holding_peak - 1.0)

        if state == "FLAT_CASH":
            cash_wait_days += 1
            cs["wait_days"] += 1
            if mode == "once_per_cycle":
                if exited_cycle_id is not None and cid != exited_cycle_id:
                    days_in_new_cycle += 1
                    if days_in_new_cycle >= rule.r_wait:
                        state = "ACCUMULATING"
                        reentry_armed = True
                        exited_cycle_id = None
                        holding_peak = 0.0
                # else still waiting for next cycle — stay flat
            else:
                days_since_exit += 1
                if days_since_exit >= rule.r_wait:
                    state = "ACCUMULATING"
                    reentry_armed = True
                    days_since_exit = 0
                    holding_peak = 0.0

        if state == "ACCUMULATING":
            can_exit = units > 0 and dsh >= rule.x_exit
            if mode == "once_per_cycle" and exited_cycle_id == cid:
                can_exit = False  # already exited this cycle (should not hold)
            if can_exit:
                proceeds_gross = units * px
                fee = proceeds_gross * fee_rate
                proceeds = proceeds_gross - fee
                cash += proceeds
                cum_fees += fee
                cum_sell_proceeds += proceeds
                cs["sell_proceeds"] += proceeds
                cs["sell_count"] += 1
                cs["exit_dates"].append(str(dt.date()))
                sells.append(
                    {
                        "date": str(dt.date()),
                        "cycle_id": cid,
                        "dsh": dsh,
                        "units": units,
                        "price_jpy": px,
                        "proceeds_net": proceeds,
                        "lot_cost": lot_cost,
                    }
                )
                units = 0.0
                lot_cost = 0.0
                holding_peak = 0.0
                state = "FLAT_CASH"
                days_since_exit = 0
                days_in_new_cycle = 0
                reentry_armed = False
                exited_cycle_id = cid
            elif reentry_armed:
                reentry_armed = False
            elif dsh >= rule.e_start:
                fee = dca_amount * fee_rate
                net = dca_amount - fee
                qty = net / px
                units += qty
                lot_cost += net
                cum_invested += dca_amount
                cum_fees += fee
                cs["invested"] += dca_amount
                cs["buy_days"] += 1
                if cs["first_buy"] is None:
                    cs["first_buy"] = str(dt.date())

        equity = cash + units * px
        if equity_peak <= 0:
            equity_peak = equity
        else:
            equity_peak = max(equity_peak, equity)
        if equity_peak > 0:
            max_dd = min(max_dd, equity / equity_peak - 1.0)

    last_px = float(panel.iloc[-1]["btc_jpy"])
    terminal_equity = cash + units * last_px
    return {
        "rule_id": rule.rule_id,
        "mode": mode,
        "e_start": rule.e_start,
        "x_exit": rule.x_exit,
        "r_wait": rule.r_wait,
        "cum_invested": cum_invested,
        "cum_fees": cum_fees,
        "cum_sell_proceeds": cum_sell_proceeds,
        "terminal_cash": cash,
        "terminal_btc_units": units,
        "terminal_btc_value": units * last_px,
        "terminal_equity": terminal_equity,
        "return_on_invested": (terminal_equity / cum_invested - 1.0) if cum_invested > 0 else None,
        "equity_mdd": max_dd,
        "holding_mdd": holding_mdd if holding_mdd < 0 else 0.0,
        "cash_wait_days": cash_wait_days,
        "sell_count": len(sells),
        "sells": sells,
        "cycle_stats": cycle_stats,
    }


def pure_dca(panel: pd.DataFrame, dca_amount: float = DCA_AMOUNT, fee_rate: float = FEE_RATE) -> dict:
    return run_backtest(panel, Rule(0, 10**9, 10**9), dca_amount, fee_rate, mode="once_per_cycle")


def cycle_segment_metrics(
    panel: pd.DataFrame, rule: Rule, cycle_id: str, mode: str = "once_per_cycle"
) -> dict | None:
    """Run BT only on one cycle segment (fresh state) for cycle-local discovery."""
    seg = panel[panel["cycle_id"] == cycle_id]
    if seg.empty:
        return None
    r = run_backtest(seg, rule, mode=mode)
    return {
        "cycle_id": cycle_id,
        "rule_id": rule.rule_id,
        "mode": mode,
        "n_bars": int(len(seg)),
        "cum_invested": r["cum_invested"],
        "terminal_equity": r["terminal_equity"],
        "return_on_invested": r["return_on_invested"],
        "equity_mdd": r["equity_mdd"],
        "holding_mdd": r["holding_mdd"],
        "cash_wait_days": r["cash_wait_days"],
        "sell_count": r["sell_count"],
        "exit_dates": [s["date"] for s in r["sells"]],
    }


def stability_flags(row: pd.Series, pure_roi: float) -> dict:
    """Heuristic flags for A2 discovery (not adoption)."""
    r16 = row.get("H2016_roi")
    r20 = row.get("H2020_roi")
    flags = []
    if r16 is not None and r20 is not None:
        if (r16 > 0) != (r20 > 0):
            flags.append("sign_disagree_across_cycles")
        if abs(r16 - r20) > 2.0:
            flags.append("roi_gap_gt_200pp")
    if row["roi"] is not None and pure_roi is not None and row["roi"] < pure_roi - 0.05:
        flags.append("underperforms_pure_dca")
    if row["cash_wait_days"] > 800:
        flags.append("long_cash_wait")
    if row["sell_count"] == 0:
        flags.append("never_exited")
    return {"flags": flags, "n_flags": len(flags)}


def main() -> None:
    retrieved_at = _utc_now()
    data_version = f"a2-{_utc_today()}"
    out_dir = ROOT / "a2" / data_version
    out_dir.mkdir(parents=True, exist_ok=True)

    panel_full, a1_version = load_a1_panel()
    panel = slice_eval(panel_full)

    pure = pure_dca(panel)
    pure_roi = pure["return_on_invested"]

    MODE = "once_per_cycle"
    rules = [Rule(e, x, r) for e, x, r in itertools.product(E_GRID, X_GRID, R_GRID)]
    rows = []
    cycle_rows = []

    for rule in rules:
        full = run_backtest(panel, rule, mode=MODE)
        c16 = cycle_segment_metrics(panel, rule, "H2016", mode=MODE)
        c20 = cycle_segment_metrics(panel, rule, "H2020", mode=MODE)
        row = {
            "rule_id": rule.rule_id,
            "e_start": rule.e_start,
            "x_exit": rule.x_exit,
            "r_wait": rule.r_wait,
            "cum_invested": full["cum_invested"],
            "terminal_equity": full["terminal_equity"],
            "roi": full["return_on_invested"],
            "excess_roi_vs_pure": (
                None
                if full["return_on_invested"] is None or pure_roi is None
                else full["return_on_invested"] - pure_roi
            ),
            "equity_mdd": full["equity_mdd"],
            "holding_mdd": full["holding_mdd"],
            "cash_wait_days": full["cash_wait_days"],
            "sell_count": full["sell_count"],
            "H2016_roi": None if c16 is None else c16["return_on_invested"],
            "H2016_equity": None if c16 is None else c16["terminal_equity"],
            "H2016_invested": None if c16 is None else c16["cum_invested"],
            "H2016_mdd": None if c16 is None else c16["equity_mdd"],
            "H2016_wait": None if c16 is None else c16["cash_wait_days"],
            "H2016_sells": None if c16 is None else c16["sell_count"],
            "H2020_roi": None if c20 is None else c20["return_on_invested"],
            "H2020_equity": None if c20 is None else c20["terminal_equity"],
            "H2020_invested": None if c20 is None else c20["cum_invested"],
            "H2020_mdd": None if c20 is None else c20["equity_mdd"],
            "H2020_wait": None if c20 is None else c20["cash_wait_days"],
            "H2020_sells": None if c20 is None else c20["sell_count"],
            "min_cycle_roi": None
            if c16 is None or c20 is None
            else min(c16["return_on_invested"], c20["return_on_invested"]),
            "exit_dates": "|".join(s["date"] for s in full["sells"]),
        }
        flags = stability_flags(pd.Series(row), pure_roi)
        row.update({"stability_flags": "|".join(flags["flags"]), "n_flags": flags["n_flags"]})
        rows.append(row)
        if c16:
            cycle_rows.append(c16)
        if c20:
            cycle_rows.append(c20)

    results = pd.DataFrame(rows)
    cycle_df = pd.DataFrame(cycle_rows)

    # Marginal sweeps (discovery views)
    def best_by(group_cols: list[str], metric: str = "min_cycle_roi") -> pd.DataFrame:
        return (
            results.sort_values(metric, ascending=False)
            .groupby(group_cols, as_index=False)
            .head(1)
            .sort_values(metric, ascending=False)
        )

    sweep_x = (
        results[results["e_start"].eq(0) & results["r_wait"].eq(180)]
        .sort_values("x_exit")
        [["rule_id", "x_exit", "roi", "min_cycle_roi", "excess_roi_vs_pure", "cash_wait_days", "equity_mdd", "H2016_roi", "H2020_roi"]]
    )
    sweep_e = (
        results[results["x_exit"].eq(540) & results["r_wait"].eq(180)]
        .sort_values("e_start")
        [["rule_id", "e_start", "roi", "min_cycle_roi", "excess_roi_vs_pure", "cash_wait_days", "H2016_roi", "H2020_roi"]]
    )
    sweep_r = (
        results[results["e_start"].eq(0) & results["x_exit"].eq(540)]
        .sort_values("r_wait")
        [["rule_id", "r_wait", "roi", "min_cycle_roi", "excess_roi_vs_pure", "cash_wait_days", "H2016_roi", "H2020_roi"]]
    )

    # Rank views (discovery — not adoption)
    # Cycle-local beat: compare cycle ROI to pure-DCA on same segment
    pure16 = pure_dca(panel[panel["cycle_id"] == "H2016"])
    pure20 = pure_dca(panel[panel["cycle_id"] == "H2020"])
    results["H2016_excess_vs_cycle_pure"] = results["H2016_roi"] - pure16["return_on_invested"]
    results["H2020_excess_vs_cycle_pure"] = results["H2020_roi"] - pure20["return_on_invested"]

    by_roi = results.sort_values("roi", ascending=False)
    by_min_cycle = results.sort_values("min_cycle_roi", ascending=False)
    by_excess = results.sort_values("excess_roi_vs_pure", ascending=False)
    both_positive_excess = results[
        (results["H2016_excess_vs_cycle_pure"] > 0) & (results["H2020_excess_vs_cycle_pure"] > 0)
    ].sort_values("min_cycle_roi", ascending=False)

    # Persist
    results_csv = results.to_csv(index=False, lineterminator="\n")
    cycle_csv = cycle_df.to_csv(index=False, lineterminator="\n")
    (out_dir / "grid_results.csv").write_text(results_csv, encoding="utf-8")
    (out_dir / "cycle_segment_results.csv").write_text(cycle_csv, encoding="utf-8")
    sweep_x.to_csv(out_dir / "sweep_exit_E0_R180.csv", index=False, lineterminator="\n")
    sweep_e.to_csv(out_dir / "sweep_entry_X540_R180.csv", index=False, lineterminator="\n")
    sweep_r.to_csv(out_dir / "sweep_reentry_E0_X540.csv", index=False, lineterminator="\n")

    def top_records(df: pd.DataFrame, n: int = 15) -> list[dict]:
        return json.loads(df.head(n).to_json(orient="records"))

    exploration = {
        "note": "Discovery rankings only — not adoption / not candidate_set freeze",
        "pure_dca_full_window": {
            "cum_invested": pure["cum_invested"],
            "terminal_equity": pure["terminal_equity"],
            "roi": pure["return_on_invested"],
            "equity_mdd": pure["equity_mdd"],
        },
        "pure_dca_H2016": {
            "roi": pure16["return_on_invested"],
            "terminal_equity": pure16["terminal_equity"],
            "cum_invested": pure16["cum_invested"],
        },
        "pure_dca_H2020": {
            "roi": pure20["return_on_invested"],
            "terminal_equity": pure20["terminal_equity"],
            "cum_invested": pure20["cum_invested"],
        },
        "top_by_full_roi": top_records(by_roi),
        "top_by_min_cycle_roi": top_records(by_min_cycle),
        "top_by_excess_vs_pure": top_records(by_excess),
        "both_cycles_beat_cycle_pure": top_records(both_positive_excess, 30),
        "never_exited_count": int((results["sell_count"] == 0).sum()),
        "grid_size": int(len(results)),
        "sweep_exit_E0_R180": json.loads(sweep_x.to_json(orient="records")),
        "sweep_entry_X540_R180": json.loads(sweep_e.to_json(orient="records")),
        "sweep_reentry_E0_X540": json.loads(sweep_r.to_json(orient="records")),
    }
    (out_dir / "exploration_summary.json").write_text(
        json.dumps(exploration, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    # Analyst synthesis helpers
    x_effect = sweep_x[["x_exit", "roi", "min_cycle_roi", "H2016_roi", "H2020_roi", "cash_wait_days"]].to_dict(
        orient="records"
    )
    e_effect = sweep_e[["e_start", "roi", "min_cycle_roi", "H2016_roi", "H2020_roi"]].to_dict(orient="records")
    r_effect = sweep_r[["r_wait", "roi", "min_cycle_roi", "H2016_roi", "H2020_roi", "cash_wait_days"]].to_dict(
        orient="records"
    )

    meta = {
        "phase": PHASE,
        "contract_version": CONTRACT_VERSION,
        "a2_amendment": A2_AMENDMENT,
        "data_version": data_version,
        "source_a1_data_version": a1_version,
        "retrieved_at": retrieved_at,
        "eval_start": EVAL_START,
        "eval_end": EVAL_END,
        "eval_end_rationale": (
            "Last calendar day with date < T_primary so A2 selection uses no post_etf / no H2024 bars. "
            "H2020 segment is truncated ~3 months before next halving."
        ),
        "T_approve": T_APPROVE,
        "T_primary": T_PRIMARY,
        "grids": {"E": list(E_GRID), "X": list(X_GRID), "R": list(R_GRID)},
        "assumptions": {
            "dca_amount_jpy": DCA_AMOUNT,
            "fee_rate": FEE_RATE,
            "tax_scenario": "tax_none_in_a2_primary",
            "price_field": "btc_jpy",
            "reentry_mode": "once_per_cycle",
            "reentry_mode_note": (
                "Exit at most once per cycle at dsh>=X; remain flat until next cycle_id; "
                "then wait R_wait days before DCA. "
                "threshold_repeat (intra-cycle re-exit) is rejected as mismatched to strategy intent."
            ),
        },
        "prohibited": [
            "H2024 in selection/optimization",
            "post_etf bars in eval window",
            "peak/bottom rule inputs",
            "lookahead",
            "MVRV/ETF flow/Nasdaq/DXY/rates",
            "adoption judgment",
            "A3/B/C/D in this run",
        ],
        "content_fingerprints": {
            "grid_results.csv": _fingerprint(results_csv),
            "cycle_segment_results.csv": _fingerprint(cycle_csv),
        },
        "n_rules": len(rules),
        "panel_rows": int(len(panel)),
    }
    (out_dir / "run_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    report = build_report(meta, exploration, results, x_effect, e_effect, r_effect, pure, pure16, pure20)
    (out_dir / "A2_REPORT.md").write_text(report, encoding="utf-8")

    docs = Path(__file__).resolve().parents[2] / "docs" / "reports"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / "BTC-COMPLETE-A2-EXPLORATION-001.md").write_text(
        report + f"\n---\n\nVersioned artifacts: `research/btc_dca_halving/a2/{data_version}/`\n",
        encoding="utf-8",
    )
    (ROOT / "a2" / "LATEST.txt").write_text(data_version + "\n", encoding="utf-8")

    print(f"A2 complete: {out_dir}")
    print(f"rules={len(rules)} rows={len(panel)} pure_roi={pure_roi:.4f}")
    print(f"top min_cycle: {by_min_cycle.iloc[0]['rule_id']} {by_min_cycle.iloc[0]['min_cycle_roi']:.4f}")
    print(f"both-beat count: {len(both_positive_excess)}")


def build_report(
    meta: dict,
    exploration: dict,
    results: pd.DataFrame,
    x_effect: list,
    e_effect: list,
    r_effect: list,
    pure: dict,
    pure16: dict,
    pure20: dict,
) -> str:
    by_min = results.sort_values("min_cycle_roi", ascending=False).head(10)
    by_roi = results.sort_values("roi", ascending=False).head(10)
    both = results[
        (results["H2016_excess_vs_cycle_pure"] > 0) & (results["H2020_excess_vs_cycle_pure"] > 0)
    ].sort_values("min_cycle_roi", ascending=False)

    def fmt_table(df: pd.DataFrame, cols: list[str]) -> str:
        lines = ["| " + " | ".join(cols) + " |", "|" + "|".join(["---"] * len(cols)) + "|"]
        for _, r in df.iterrows():
            cells = []
            for c in cols:
                v = r[c]
                if isinstance(v, float):
                    cells.append(f"{v:.2%}" if "roi" in c or "excess" in c or "mdd" in c else f"{v:.1f}")
                else:
                    cells.append(str(v))
            lines.append("| " + " | ".join(cells) + " |")
        return "\n".join(lines)

    lines = [
        "# BTC A2 — Entry / Exit / Re-entry Exploration (Discovery)",
        "",
        "**Record:** `BTC-COMPLETE-A2-EXPLORATION-001`",
        "**Status:** COMPLETE — Phase A2 only (not A3 freeze, not adoption)",
        f"**Contract:** `{meta['contract_version']}`",
        f"**data_version:** `{meta['data_version']}`",
        f"**source A1:** `{meta['source_a1_data_version']}`",
        f"**retrieved_at:** `{meta['retrieved_at']}`",
        "",
        "```text",
        "A2 role: discovery / exploration",
        "A3 role (later): review → candidate_set freeze (K≤5)",
        "C role (later): fixed apply to post-ETF / H2024 — NO refit",
        "```",
        "",
        "## 0. Amendment vs earlier tight A2 binding",
        "",
        meta["a2_amendment"],
        "",
        "Maintained prohibitions: no H2024/post_etf in selection, no peak/bottom rules,",
        "no lookahead, no extra indicators, no adoption judgment.",
        "",
        "## 1. Eval window & assumptions",
        "",
        f"| Item | Value |",
        f"|---|---|",
        f"| eval window | {meta['eval_start']} → {meta['eval_end']} |",
        f"| rationale | {meta['eval_end_rationale']} |",
        f"| DCA | {meta['assumptions']['dca_amount_jpy']} JPY/day |",
        f"| fee_rate | {meta['assumptions']['fee_rate']} (assumption) |",
        f"| tax | none in primary A2 tables |",
        f"| price | btc_jpy |",
        f"| reentry mode | once_per_cycle (exit ≤1/cycle; R waits after next halving) |",
        f"| grid | E={meta['grids']['E']} X={meta['grids']['X']} R={meta['grids']['R']} |",
        f"| n rules | {meta['n_rules']} |",
        "",
        "### Semantics note (important discovery)",
        "",
        "A naive reading of `dsh>=X` after Re-entry inside the **same** cycle causes repeated exits",
        "(threshold_repeat). That does **not** match「全撤退→次サイクル再DCA」.",
        "A2 primary results use **once_per_cycle** only.",
        "",
        "## 2. What is safe to explore vs overfitting risk",
        "",
        "### Explorable in A2 (this run)",
        "",
        "- Coarse calendar grids on `days_since_halving` for Entry delay and Exit",
        "- Coarse calendar wait after full exit for Re-entry",
        "- Full E×X×R enumeration on the **fixed** contract grid (72 rules)",
        "- One-factor sweeps (vary X with E,R fixed, etc.) for mechanism reading",
        "- Compare to pure DCA on the **same** window / cycle segment",
        "- Stability across H2016 vs H2020 (N=2 — descriptive only)",
        "",
        "### Overfitting / avoid as 'discovery of truth'",
        "",
        "- Continuous day-by-day optimization of E/X/R",
        "- Rules using in-cycle peak/trough or max drawdown breach from peak",
        "- Expanding grid after seeing H2016/H2020 answers (forbidden without new contract version)",
        "- Adding MVRV/flows/Nasdaq because they 'would have helped'",
        "- Fitting different parameters per cycle then calling it one rule",
        "- Using H2024 / post_etf to choose among rules (forbidden; reserved for C)",
        "- Treating max full-window ROI as the strategy (ignores cycle stability & cash drag)",
        "",
        "## 3. Benchmark: Pure DCA (no exit)",
        "",
        f"- Full window ROI: **{pure['return_on_invested']:.2%}** | invested {pure['cum_invested']:.0f} | equity {pure['terminal_equity']:.0f} | MDD {pure['equity_mdd']:.2%}",
        f"- H2016 segment ROI: **{pure16['return_on_invested']:.2%}**",
        f"- H2020 segment ROI (truncated pre-ETF): **{pure20['return_on_invested']:.2%}**",
        "",
        "## 4. One-factor sweeps (mechanism)",
        "",
        "### Exit sweep (E=0, R=180)",
        "",
    ]

    lines.append("| X | ROI | min(H16,H20) ROI | H2016 | H2020 | wait_days |")
    lines.append("|---:|---:|---:|---:|---:|---:|")
    for r in x_effect:
        lines.append(
            f"| {r['x_exit']} | {r['roi']:.2%} | {r['min_cycle_roi']:.2%} | {r['H2016_roi']:.2%} | {r['H2020_roi']:.2%} | {r['cash_wait_days']} |"
        )

    lines += ["", "### Entry sweep (X=540, R=180)", "", "| E | ROI | min ROI | H2016 | H2020 |", "|---:|---:|---:|---:|---:|"]
    for r in e_effect:
        lines.append(
            f"| {r['e_start']} | {r['roi']:.2%} | {r['min_cycle_roi']:.2%} | {r['H2016_roi']:.2%} | {r['H2020_roi']:.2%} |"
        )

    lines += ["", "### Re-entry sweep (E=0, X=540)", "", "| R | ROI | min ROI | H2016 | H2020 | wait |", "|---:|---:|---:|---:|---:|---:|"]
    for r in r_effect:
        lines.append(
            f"| {r['r_wait']} | {r['roi']:.2%} | {r['min_cycle_roi']:.2%} | {r['H2016_roi']:.2%} | {r['H2020_roi']:.2%} | {r['cash_wait_days']} |"
        )

    lines += [
        "",
        "## 5. Full-grid discovery rankings (not freeze)",
        "",
        "### Top 10 by min(H2016,H2020) ROI — stability-oriented",
        "",
        fmt_table(
            by_min,
            ["rule_id", "roi", "min_cycle_roi", "H2016_roi", "H2020_roi", "excess_roi_vs_pure", "cash_wait_days", "stability_flags"],
        ),
        "",
        "### Top 10 by full-window ROI — peak fit (higher overfit risk)",
        "",
        fmt_table(
            by_roi,
            ["rule_id", "roi", "min_cycle_roi", "H2016_roi", "H2020_roi", "excess_roi_vs_pure", "cash_wait_days"],
        ),
        "",
        f"### Rules that beat cycle-local pure DCA on **both** H2016 and H2020: **{len(both)}** / {len(results)}",
        "",
    ]
    if len(both):
        lines.append(fmt_table(
            both.head(15),
            ["rule_id", "min_cycle_roi", "H2016_excess_vs_cycle_pure", "H2020_excess_vs_cycle_pure", "cash_wait_days", "equity_mdd"],
        ))
    else:
        lines.append("_None — calendar full-exit rules did not beat buy-and-DCA on both cycles in this window._")

    lines += [
        "",
        "## 6. What we see (analyst read)",
        "",
        _analyst_read(results, x_effect, e_effect, r_effect, pure, both),
        "",
        "## 7. Promising patterns for A3 review (not frozen)",
        "",
        _promising(both, by_min, results),
        "",
        "## 8. Overfitting concerns",
        "",
        "- N=2 completed explore cycles only; any 'best' rule is anecdotal.",
        "- H2020 truncated before ETF/halving overlap by design — full-cycle truth not claimed.",
        "- Full-window ROI favors rules that stayed invested through 2020–2021 blow-off; may conflict with 'full exit' intent.",
        "- If both-cycle beat set is empty/small, the honest discovery may be: **pure DCA dominates coarse calendar exits** in-sample.",
        "- Do not expand X grid toward observed A1 peaks (e.g. ~525d) after seeing results — that would be peak-adjacent fitting.",
        "",
        "## 9. A3 freeze discussion points (stop here — do not freeze in A2)",
        "",
        "1. Is the goal to beat pure DCA, or to encode an intentional full-exit risk policy even if ROI is lower?",
        "2. Prefer max ROI champions vs min-cycle / both-cycle survivors?",
        "3. How much cash-wait is acceptable for the 'full exit' philosophy?",
        "4. Keep multiple X regimes (early vs late exit) in candidate_set rather than one champion?",
        "5. Entry delay (E>0) appears secondary in sweeps — freeze E=0 unless there is a policy reason?",
        "6. Re-entry wait: economic meaning vs noise on N=2?",
        "7. Tax scenario (30%) may flip rankings when exits crystallize gains — run before A3 freeze?",
        "8. Confirm eval_end truncation policy remains acceptable for A3 narrative.",
        "",
        "## 10. Artifacts",
        "",
        f"- `research/btc_dca_halving/a2/{meta['data_version']}/`",
        "- `grid_results.csv`, `cycle_segment_results.csv`",
        "- `sweep_exit_E0_R180.csv`, `sweep_entry_X540_R180.csv`, `sweep_reentry_E0_X540.csv`",
        "- `exploration_summary.json`, `run_meta.json`, `A2_REPORT.md`",
        "",
        "## 11. Stop line",
        "",
        "A3 / B / C / D **not** started. H2024 not used for selection.",
        "",
    ]
    return "\n".join(lines)


def _analyst_read(results, x_effect, e_effect, r_effect, pure, both) -> str:
    # Derive short quantitative statements from sweeps
    x_rois = [(r["x_exit"], r["roi"], r["min_cycle_roi"]) for r in x_effect]
    best_x = max(x_rois, key=lambda t: t[2])
    worst_x = min(x_rois, key=lambda t: t[2])
    e_span = max(r["roi"] for r in e_effect) - min(r["roi"] for r in e_effect)
    r_span = max(r["roi"] for r in r_effect) - min(r["roi"] for r in r_effect)
    n_never = int((results["sell_count"] == 0).sum())
    return "\n".join(
        [
            f"- Pure DCA full-window ROI is {pure['return_on_invested']:.2%} — the bar for 'exit helps'.",
            f"- In Exit sweep (E=0,R=180), best min-cycle X={best_x[0]} (min-cycle ROI {best_x[2]:.2%}); "
            f"weakest min-cycle X={worst_x[0]} ({worst_x[2]:.2%}).",
            f"- Entry sweep ROI span ≈ {e_span:.2%} — Entry delay is relatively small vs Exit choice.",
            f"- Re-entry sweep ROI span ≈ {r_span:.2%} — R matters mainly via cash-wait drag / miss.",
            f"- Both-cycle beat vs cycle-pure count = {len(both)} / {len(results)}.",
            f"- Rules with sell_count=0 in window: {n_never} (X beyond available dsh path / never triggered).",
            "- Feature: calendar full-exit is a **risk/regimen** choice more than a free ROI lunch on this grid.",
        ]
    )


def _promising(both: pd.DataFrame, by_min: pd.DataFrame, results: pd.DataFrame) -> str:
    lines = []
    if len(both):
        lines.append("**Pattern A — both cycles beat cycle-local pure DCA (strongest discovery claim on this grid):**")
        for _, r in both.head(8).iterrows():
            lines.append(
                f"- `{r['rule_id']}` min_cycle_roi={r['min_cycle_roi']:.2%} "
                f"(H16 excess {r['H2016_excess_vs_cycle_pure']:.2%}, H20 excess {r['H2020_excess_vs_cycle_pure']:.2%}, "
                f"wait={int(r['cash_wait_days'])}d)"
            )
    else:
        lines.append("**Pattern A — empty:** no rule beat pure DCA on both cycle segments.")
    lines.append("")
    lines.append("**Pattern B — high min-cycle ROI (stability-oriented, may still trail pure DCA):**")
    for _, r in by_min.head(5).iterrows():
        lines.append(
            f"- `{r['rule_id']}` min={r['min_cycle_roi']:.2%} full={r['roi']:.2%} "
            f"excess_vs_pure={r['excess_roi_vs_pure']:.2%} flags={r['stability_flags'] or '-'}"
        )
    # Late vs early exit clusters
    early = results[results["x_exit"] <= 540].sort_values("min_cycle_roi", ascending=False).head(3)
    late = results[results["x_exit"] >= 730].sort_values("min_cycle_roi", ascending=False).head(3)
    lines.append("")
    lines.append("**Pattern C — early-exit cluster (X≤540) leaders:** " + ", ".join(early["rule_id"].astype(str)))
    lines.append("**Pattern D — late-exit cluster (X≥730) leaders:** " + ", ".join(late["rule_id"].astype(str)))
    return "\n".join(lines)


if __name__ == "__main__":
    main()
