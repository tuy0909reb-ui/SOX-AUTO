"""
BTC DCA × Halving — Phase C (fixed apply H2024) + Phase D (difference explanation).

Frozen candidate_set from A3 — no refit, no rule changes.
Contract: btc-dca-halving-contracts-v1.1-sm-once-per-cycle
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from run_a2_exploration import (  # noqa: E402
    DCA_AMOUNT,
    FEE_RATE,
    T_APPROVE,
    T_PRIMARY,
    Rule,
    load_a1_panel,
    pure_dca,
    run_backtest,
)

CONTRACT_VERSION = "btc-dca-halving-contracts-v1.1-sm-once-per-cycle"
CANDIDATE_SET_ID = "btc-dca-halving-candset-a3-2026-08-27"
FROZEN_RULES = [
    ("E0_X540_R180", Rule(0, 540, 180)),
    ("E0_X365_R180", Rule(0, 365, 180)),
    ("E0_X730_R180", Rule(0, 730, 180)),
]
MATCH_WINDOWS = (180, 365, 400, 540)
HALVINGS = {
    "H2016": "2016-07-09",
    "H2020": "2020-05-11",
    "H2024": "2024-04-19",
}
H2024_HALVING_USER = "2024-04-20"  # user note; SoT uses 2024-04-19


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _fp(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def run_backtest_detailed(panel: pd.DataFrame, rule: Rule) -> dict:
    """Alias for once_per_cycle detailed backtest."""
    return fix_backtest_detailed(panel, rule)


def fix_backtest_detailed(panel: pd.DataFrame, rule: Rule) -> dict:
    """Correct loop for run_backtest_detailed."""
    cash = 0.0
    units = 0.0
    lot_cost = 0.0
    cum_invested = 0.0
    cum_fees = 0.0
    state = "ACCUMULATING"
    days_in_new_cycle = 0
    reentry_armed = False
    exited_cycle_id: str | None = None
    prev_cid: str | None = None
    equity_peak = 0.0
    max_dd = 0.0
    sells: list[dict] = []
    daily: list[dict] = []
    reentries: list[dict] = []

    for dt, row in panel.iterrows():
        px = float(row["btc_jpy"])
        dsh = float(row["days_since_halving"])
        cid = str(row["cycle_id"])
        regime = str(row["etf_regime"])
        action = "NONE"

        if prev_cid is not None and cid != prev_cid:
            days_in_new_cycle = 0
        prev_cid = cid

        if state == "FLAT_CASH":
            if exited_cycle_id is not None and cid != exited_cycle_id:
                days_in_new_cycle += 1
                if days_in_new_cycle >= rule.r_wait:
                    state = "ACCUMULATING"
                    reentry_armed = True
                    reentries.append(
                        {"date": str(dt.date()), "cycle_id": cid, "days_in_new_cycle": days_in_new_cycle}
                    )
                    exited_cycle_id = None

        if state == "ACCUMULATING":
            can_exit = units > 0 and dsh >= rule.x_exit and exited_cycle_id != cid
            if can_exit:
                proceeds_gross = units * px
                fee = proceeds_gross * FEE_RATE
                proceeds = proceeds_gross - fee
                cash += proceeds
                cum_fees += fee
                sells.append(
                    {
                        "date": str(dt.date()),
                        "cycle_id": cid,
                        "dsh": int(dsh),
                        "units": units,
                        "price_jpy": px,
                        "proceeds_net": proceeds,
                        "lot_cost": lot_cost,
                        "equity_at_exit": cash,
                        "etf_regime": regime,
                    }
                )
                units = 0.0
                lot_cost = 0.0
                state = "FLAT_CASH"
                days_in_new_cycle = 0
                reentry_armed = False
                exited_cycle_id = cid
                action = "SELL_ALL"
            elif reentry_armed:
                reentry_armed = False
                action = "REENTRY_ARM"
            elif dsh >= rule.e_start:
                fee = DCA_AMOUNT * FEE_RATE
                net = DCA_AMOUNT - fee
                units += net / px
                lot_cost += net
                cum_invested += DCA_AMOUNT
                cum_fees += fee
                action = "BUY_DCA"

        equity = cash + units * px
        equity_peak = max(equity_peak, equity) if equity_peak > 0 else equity
        if equity_peak > 0:
            max_dd = min(max_dd, equity / equity_peak - 1.0)

        daily.append(
            {
                "date": str(dt.date()),
                "state": state,
                "action": action,
                "cycle_id": cid,
                "dsh": int(dsh),
                "etf_regime": regime,
                "cash": cash,
                "units": units,
                "equity": equity,
                "cum_invested": cum_invested,
            }
        )

    last_px = float(panel.iloc[-1]["btc_jpy"])
    terminal_equity = cash + units * last_px
    return {
        "rule_id": rule.rule_id,
        "e_start": rule.e_start,
        "x_exit": rule.x_exit,
        "r_wait": rule.r_wait,
        "cum_invested": cum_invested,
        "terminal_equity": terminal_equity,
        "return_on_invested": (terminal_equity / cum_invested - 1.0) if cum_invested else None,
        "equity_mdd": max_dd,
        "cash_wait_days": sum(1 for d in daily if d["state"] == "FLAT_CASH"),
        "sell_count": len(sells),
        "sells": sells,
        "reentries": reentries,
        "daily": daily,
        "terminal_state": daily[-1]["state"] if daily else None,
    }


def post_exit_btc_rise(panel: pd.DataFrame, exit_date: str, windows: tuple[int, ...] = (30, 90, 180)) -> dict:
    idx = pd.Timestamp(exit_date)
    if idx not in panel.index:
        return {"error": "exit_date_not_in_panel"}
    px0 = float(panel.loc[idx, "btc_jpy"])
    out = {"exit_date": exit_date, "exit_btc_jpy": px0}
    for w in windows:
        end = idx + pd.Timedelta(days=w)
        seg = panel.loc[idx:end]
        if len(seg) < 2:
            out[f"btc_rise_{w}d"] = None
            continue
        px1 = float(seg.iloc[-1]["btc_jpy"])
        out[f"btc_rise_{w}d"] = px1 / px0 - 1.0
    return out


def window_slice(panel: pd.DataFrame, cycle_id: str, w: int) -> pd.DataFrame:
    hd = pd.Timestamp(HALVINGS[cycle_id])
    end = hd + pd.Timedelta(days=w)
    seg = panel[(panel.index >= hd) & (panel.index <= end) & (panel["cycle_id"] == cycle_id)]
    if seg.empty:
        seg = panel[(panel.index >= hd) & (panel.index <= end)]
    return seg


def window_metrics(panel: pd.DataFrame, cycle_id: str, w: int, rule: Rule) -> dict:
    seg = window_slice(panel, cycle_id, w)
    if len(seg) < 5:
        return {"cycle_id": cycle_id, "W": w, "error": "insufficient_bars", "n_bars": len(seg)}
    px = seg["btc_jpy"]
    rets = px.pct_change().dropna()
    peak = px.cummax()
    mdd = float((px / peak - 1).min())
    btc_ret = float(px.iloc[-1] / px.iloc[0] - 1)
    bt = fix_backtest_detailed(seg, rule)
    pure = fix_backtest_detailed(seg, Rule(0, 10**9, 10**9))
    exit_in_window = [s for s in bt["sells"] if s["cycle_id"] == cycle_id]
    return {
        "cycle_id": cycle_id,
        "W": w,
        "n_bars": int(len(seg)),
        "start": str(seg.index[0].date()),
        "end": str(seg.index[-1].date()),
        "actual_dsh_end": int(seg.iloc[-1]["days_since_halving"]),
        "btc_jpy_return": btc_ret,
        "btc_vol_ann": float(rets.std() * np.sqrt(365)) if len(rets) else None,
        "btc_mdd": mdd,
        "strategy_roi": bt["return_on_invested"],
        "pure_dca_roi": pure["return_on_invested"],
        "strategy_excess_vs_pure": (
            None
            if bt["return_on_invested"] is None or pure["return_on_invested"] is None
            else bt["return_on_invested"] - pure["return_on_invested"]
        ),
        "strategy_mdd": bt["equity_mdd"],
        "exit_occurred_in_window": len(exit_in_window) > 0,
        "exit_dsh_in_window": exit_in_window[0]["dsh"] if exit_in_window else None,
        "exit_date_in_window": exit_in_window[0]["date"] if exit_in_window else None,
        "etf_regime_at_end": str(seg.iloc[-1]["etf_regime"]),
    }


def cycle_full_metrics(panel: pd.DataFrame, cycle_id: str, rule: Rule) -> dict:
    seg = panel[panel["cycle_id"] == cycle_id]
    if seg.empty:
        return {"cycle_id": cycle_id, "error": "empty"}
    bt = fix_backtest_detailed(seg, rule)
    pure = fix_backtest_detailed(seg, Rule(0, 10**9, 10**9))
    exit_info = None
    post_exit = None
    for s in bt["sells"]:
        if s["cycle_id"] == cycle_id:
            exit_info = s
            post_exit = post_exit_btc_rise(panel, s["date"])
            break
    flat_days = sum(1 for d in bt["daily"] if d["state"] == "FLAT_CASH" and d["cycle_id"] == cycle_id)
    return {
        "cycle_id": cycle_id,
        "cycle_complete": cycle_id != "H2024",
        "n_bars": int(len(seg)),
        "halving_date": HALVINGS[cycle_id],
        "panel_end": str(seg.index[-1].date()),
        "max_dsh_observed": int(seg["days_since_halving"].max()),
        "strategy_roi": bt["return_on_invested"],
        "pure_dca_roi": pure["return_on_invested"],
        "strategy_excess_vs_pure": bt["return_on_invested"] - pure["return_on_invested"],
        "strategy_mdd": bt["equity_mdd"],
        "cum_invested": bt["cum_invested"],
        "terminal_equity": bt["terminal_equity"],
        "exit": exit_info,
        "post_exit_btc_rise": post_exit,
        "flat_days_in_cycle": flat_days,
        "reentry_events": [r for r in bt["reentries"] if r["cycle_id"] == cycle_id],
        "terminal_state": bt["terminal_state"],
        "sell_count_in_cycle": sum(1 for s in bt["sells"] if s["cycle_id"] == cycle_id),
    }


def classify_observations(h2024: dict, historical: list[dict], rule_id: str) -> dict:
    """Qualitative labels — numeric thresholds NOT fixed in v1 contract."""
    notes = []
    # Compare exit timing
    h_exit_dsh = h2024.get("exit", {}).get("dsh") if h2024.get("exit") else None
    hist_exit_dsh = [h.get("exit", {}).get("dsh") for h in historical if h.get("exit")]
    if h_exit_dsh is not None and hist_exit_dsh:
        if all(h_exit_dsh == x for x in hist_exit_dsh):
            notes.append("exit_dsh_matches_X_as_in_historical_cycles")
        else:
            notes.append("exit_dsh_differs_from_some_historical")

    # Strategy excess vs pure in H2024 vs historical at same cycle scope
    h_ex = h2024.get("strategy_excess_vs_pure")
    hist_ex = [h.get("strategy_excess_vs_pure") for h in historical]
    if h_ex is not None:
        if all(h_ex > 0 for h in [x for x in hist_ex if x is not None]):
            notes.append("H2024_cycle_excess_vs_pure_positive_like_historical")
        elif h_ex <= 0 and any(x and x > 0 for x in hist_ex):
            notes.append("H2024_cycle_excess_vs_pure_weaker_than_some_historical")

    # Incomplete cycle
    notes.append("H2024_incomplete_cycle_confound")

    return {
        "rule_id": rule_id,
        "label": "inconclusive",
        "label_rationale": (
            "v1 contract does not fix numeric thresholds for comparable/degraded/inconclusive. "
            "Quantitative differences are recorded below; formal classification deferred."
        ),
        "qualitative_notes": notes,
        "quantitative_differences_observed": True,
    }


def fetch_d_series(ticker: str, start: str) -> pd.Series:
    h = yf.Ticker(ticker).history(start=start, auto_adjust=True)
    if h.empty:
        return pd.Series(dtype=float)
    s = h["Close"].astype(float).copy()
    s.index = pd.to_datetime([str(pd.Timestamp(x).date()) for x in s.index])
    return s[~s.index.duplicated(keep="last")].sort_index()


def run_phase_d(panel: pd.DataFrame, c_summary: dict) -> dict:
    """Descriptive explanation layer — not trading signals."""
    start = "2023-01-01"
    series = {}
    for name, tick in [
        ("QQQ", "QQQ"),
        ("US10Y", "^TNX"),
        ("DXY", "DX-Y.NYB"),
        ("IBIT", "IBIT"),
    ]:
        try:
            series[name] = fetch_d_series(tick, start)
        except Exception as e:
            series[name] = pd.Series(dtype=float)
            series[f"{name}_error"] = str(e)

    btc = panel["btc_jpy"].copy()
    btc.index = panel.index

    # Align to post_etf H2024 halving window
    t_primary = pd.Timestamp(T_PRIMARY)
    h24 = pd.Timestamp(HALVINGS["H2024"])
    post_etf_h24 = panel[(panel.index >= h24) & (panel["cycle_id"] == "H2024")]
    pre_halving_post_etf = panel[(panel.index >= t_primary) & (panel.index < h24)]

    def period_stats(seg: pd.DataFrame, label: str) -> dict:
        if len(seg) < 10:
            return {"label": label, "error": "too_short"}
        px = seg["btc_jpy"]
        rets = px.pct_change().dropna()
        return {
            "label": label,
            "start": str(seg.index[0].date()),
            "end": str(seg.index[-1].date()),
            "n_bars": int(len(seg)),
            "btc_return": float(px.iloc[-1] / px.iloc[0] - 1),
            "btc_vol_ann": float(rets.std() * np.sqrt(365)),
            "btc_mdd": float((px / px.cummax() - 1).min()),
        }

    periods = {
        "pre_halving_post_etf_H2020_tail": period_stats(pre_halving_post_etf, "pre_halving_post_etf"),
        "H2024_post_halving": period_stats(post_etf_h24, "H2024_post_halving"),
    }

    # Rolling correlation BTC vs macro (descriptive, post H2024 halving only)
    corr = {}
    if len(post_etf_h24):
        b = post_etf_h24["btc_jpy"]
        br = b.pct_change().dropna()
        for macro_name in ("QQQ", "US10Y", "DXY"):
            if len(series.get(macro_name, [])):
                m = series[macro_name].reindex(post_etf_h24.index).ffill()
                mr = m.pct_change().dropna()
                aligned = pd.concat([br, mr], axis=1, join="inner").dropna()
                if len(aligned) > 30:
                    corr[f"btc_{macro_name.lower()}_daily_post_h24_halving"] = float(
                        aligned.iloc[:, 0].corr(aligned.iloc[:, 1])
                    )

    macro_period = {}
    for macro_name in ("QQQ", "US10Y", "DXY"):
        s = series.get(macro_name, pd.Series(dtype=float))
        if len(s):
            for period_key, seg in [
                ("pre_halving_post_etf", pre_halving_post_etf),
                ("H2024_post_halving", post_etf_h24),
            ]:
                aligned = s.reindex(seg.index).ffill().dropna()
                if len(aligned) >= 2:
                    macro_period[f"{macro_name}_{period_key}"] = {
                        "start": str(aligned.index[0].date()),
                        "end": str(aligned.index[-1].date()),
                        "level_change_pct": float(aligned.iloc[-1] / aligned.iloc[0] - 1),
                    }

    # IBIT volume proxy (post inception only)
    ibit_proxy = {}
    try:
        ibit_h = yf.Ticker("IBIT").history(start="2024-01-01", auto_adjust=True)
        if not ibit_h.empty:
            ibit_h.index = pd.to_datetime([str(pd.Timestamp(x).date()) for x in ibit_h.index])
            vol = ibit_h["Volume"].astype(float)
            close = ibit_h["Close"].astype(float)
            notional = (vol * close).rename("ibit_notional_proxy")
            ibit_proxy["ibit_avg_daily_notional_proxy"] = float(notional.mean())
            ibit_proxy["ibit_notional_proxy_sum"] = float(notional.sum())
            ibit_proxy["note"] = "Volume×Close proxy; not official ETF flow SoT"
    except Exception as e:
        ibit_proxy["error"] = str(e)

    unavailable = {
        "MVRV": "Not fetched — no v1 Yahoo SoT; would require external on-chain source",
        "Realized_Price": "Not fetched — same",
        "OI_Funding_Netflow_FNG": "Not fetched — no v1 data contract path in repo",
    }

    return {
        "purpose": "Explain observed C differences descriptively; not trading signals; no causation claims",
        "confound_reminder": (
            "H2024: T_primary=2024-01-11, halving SoT=2024-04-19 (user also notes 2024-04-20). "
            "ETF start and halving are proximate; do not attribute to ETF alone."
        ),
        "periods": periods,
        "macro_period_changes": macro_period,
        "correlations_descriptive": corr,
        "ibit_proxy": ibit_proxy,
        "unavailable_series": unavailable,
        "c_differences_to_explain": c_summary.get("observed_differences_for_D", []),
        "limitations": [
            "Correlation ≠ causation",
            "IBIT proxy ≠ official net flow",
            "MVRV/OI/F&G not in v1 pipeline",
            "H2024 incomplete vs completed historical cycles",
        ],
    }


def run_phase_c(panel: pd.DataFrame) -> dict:
    c_start = pd.Timestamp("2016-07-09")
    panel_c = panel[panel.index >= c_start].copy()
    pure_full = fix_backtest_detailed(panel_c, Rule(0, 10**9, 10**9))

    results = []
    window_rows = []
    h2024_by_rule = {}
    hist_by_rule = {}

    for rid, rule in FROZEN_RULES:
        full = fix_backtest_detailed(panel_c, rule)
        # verify matches standard engine
        std = run_backtest(panel_c, rule, mode="once_per_cycle")
        assert abs(full["return_on_invested"] - std["return_on_invested"]) < 1e-6

        per_cycle = {}
        for cid in ("H2016", "H2020", "H2024"):
            per_cycle[cid] = cycle_full_metrics(panel_c, cid, rule)

        hist = [per_cycle["H2016"], per_cycle["H2020"]]
        h24 = per_cycle["H2024"]
        h2024_by_rule[rid] = h24
        hist_by_rule[rid] = hist
        classification = classify_observations(h24, hist, rid)

        for w in MATCH_WINDOWS:
            for cid in ("H2016", "H2020", "H2024"):
                wm = window_metrics(panel_c, cid, w, rule)
                wm["rule_id"] = rid
                window_rows.append(wm)

        results.append(
            {
                "rule_id": rid,
                "full_path_from_2016": {
                    "cum_invested": full["cum_invested"],
                    "terminal_equity": full["terminal_equity"],
                    "roi": full["return_on_invested"],
                    "excess_vs_pure_full": full["return_on_invested"] - pure_full["return_on_invested"],
                    "equity_mdd": full["equity_mdd"],
                    "cash_wait_days": full["cash_wait_days"],
                    "sell_count": full["sell_count"],
                    "sells": full["sells"],
                    "reentries": full["reentries"],
                    "terminal_state": full["terminal_state"],
                },
                "per_cycle": per_cycle,
                "classification": classification,
            }
        )

    # Rule comparison on H2024
    rule_cmp = []
    for rid, rule in FROZEN_RULES:
        h = h2024_by_rule[rid]
        rule_cmp.append(
            {
                "rule_id": rid,
                "x_exit": rule.x_exit,
                "H2024_strategy_roi": h.get("strategy_roi"),
                "H2024_pure_roi": h.get("pure_dca_roi"),
                "H2024_excess": h.get("strategy_excess_vs_pure"),
                "exit_dsh": (h.get("exit") or {}).get("dsh"),
                "exit_date": (h.get("exit") or {}).get("date"),
                "flat_days": h.get("flat_days_in_cycle"),
                "terminal_state": h.get("terminal_state"),
                "post_exit_btc_rise_90d": (h.get("post_exit_btc_rise") or {}).get("btc_rise_90d"),
            }
        )

    # Relative X ranking H2024 vs historical
    rel = {}
    for cid in ("H2016", "H2020", "H2024"):
        rois = {
            rid: results[i]["per_cycle"][cid]["strategy_excess_vs_pure"]
            for i, (rid, _) in enumerate(FROZEN_RULES)
        }
        ranked = sorted(rois.items(), key=lambda x: x[1] if x[1] is not None else -999, reverse=True)
        rel[cid] = {"rank_by_cycle_excess_vs_pure": ranked}

    observed_diffs = []
    # X=540 vs others on H2024
    x540 = h2024_by_rule["E0_X540_R180"]
    for other_rid in ("E0_X365_R180", "E0_X730_R180"):
        o = h2024_by_rule[other_rid]
        if x540.get("strategy_excess_vs_pure") is not None and o.get("strategy_excess_vs_pure") is not None:
            observed_diffs.append(
                {
                    "comparison": f"H2024 {other_rid} vs E0_X540_R180 excess_vs_pure",
                    "delta": o["strategy_excess_vs_pure"] - x540["strategy_excess_vs_pure"],
                }
            )
    # Exit timing vs A2 expectation (dsh=X)
    for rid, rule in FROZEN_RULES:
        ex = h2024_by_rule[rid].get("exit")
        if ex:
            observed_diffs.append(
                {"comparison": f"H2024 {rid} exit_dsh vs X", "exit_dsh": ex["dsh"], "X": rule.x_exit}
            )

    return {
        "phase": "C",
        "contract_version": CONTRACT_VERSION,
        "candidate_set_id": CANDIDATE_SET_ID,
        "refit_after_etf": False,
        "h2024_used_for_selection": False,
        "confound_note": {
            "T_approve": T_APPROVE,
            "T_primary": T_PRIMARY,
            "halving_sot": HALVINGS["H2024"],
            "halving_user_note": H2024_HALVING_USER,
            "days_T_primary_to_halving": int(
                (pd.Timestamp(HALVINGS["H2024"]) - pd.Timestamp(T_PRIMARY)).days
            ),
            "statement": (
                "ETF public trading start and H2024 halving are proximate. "
                "Do not attribute observed paths to ETF alone."
            ),
        },
        "classification_policy": (
            "comparable/degraded/inconclusive labels requested but v1 numeric thresholds are NOT fixed. "
            "All rules labeled inconclusive pending threshold SoT; qualitative notes attached per rule."
        ),
        "pure_dca_full_from_2016": {
            "roi": pure_full["return_on_invested"],
            "terminal_equity": pure_full["terminal_equity"],
            "cum_invested": pure_full["cum_invested"],
        },
        "results_by_rule": results,
        "window_results": window_rows,
        "H2024_rule_comparison": rule_cmp,
        "relative_ranking_by_cycle": rel,
        "observed_differences_for_D": observed_diffs,
        "a2_cross_reference": {
            "H2016_H2020_X540_exit_dsh_observed_in_A2": 540,
            "note": "C does not prove X=540; applies frozen rules to H2024/post-ETF path",
        },
    }


def build_c_report(c: dict, panel_end: str) -> str:
    lines = [
        "# BTC C — Fixed Application to H2024 / post-ETF",
        "",
        "**Record:** `BTC-COMPLETE-C-FIXED-APPLICATION-001`",
        f"**Contract:** `{CONTRACT_VERSION}`",
        f"**candidate_set_id:** `{CANDIDATE_SET_ID}`",
        f"**panel_end:** `{panel_end}`",
        "",
        "## Confound (required)",
        "",
        json.dumps(c["confound_note"], ensure_ascii=False, indent=2),
        "",
        "## Classification policy",
        "",
        c["classification_policy"],
        "",
        "## H2024 rule comparison (365 / 540 / 730)",
        "",
        "| rule | X | H2024 strat ROI | pure ROI | excess | exit dsh | exit date | flat days | terminal | post-exit BTC +90d |",
        "|---|---:|---:|---:|---:|---:|---|---:|---|---:|",
    ]
    for r in c["H2024_rule_comparison"]:
        pe = r.get("post_exit_btc_rise_90d")
        pe_str = f"{pe:.2%}" if pe is not None else "—"
        lines.append(
            f"| {r['rule_id']} | {r['x_exit']} | {r['H2024_strategy_roi']:.2%} | {r['H2024_pure_roi']:.2%} | "
            f"{r['H2024_excess']:.2%} | {r['exit_dsh']} | {r['exit_date']} | {r['flat_days']} | "
            f"{r['terminal_state']} | {pe_str} |"
        )

    lines += ["", "## Per-rule cycle summary", ""]
    for res in c["results_by_rule"]:
        lines.append(f"### {res['rule_id']}")
        lines.append("")
        lines.append("| cycle | complete | strat ROI | pure ROI | excess | exit dsh | flat days | terminal |")
        lines.append("|---|---|---:|---:|---:|---:|---:|---|")
        for cid, pc in res["per_cycle"].items():
            ex = pc.get("exit") or {}
            lines.append(
                f"| {cid} | {pc.get('cycle_complete')} | {pc.get('strategy_roi', 0):.2%} | "
                f"{pc.get('pure_dca_roi', 0):.2%} | {pc.get('strategy_excess_vs_pure', 0):.2%} | "
                f"{ex.get('dsh', '—')} | {pc.get('flat_days_in_cycle', '—')} | {pc.get('terminal_state')} |"
            )
        lines.append("")
        lines.append(f"**Classification:** `{res['classification']['label']}` — {res['classification']['label_rationale']}")
        lines.append("")

    lines += ["", "## Relative ranking (cycle excess vs pure)", ""]
    for cid, rel in c["relative_ranking_by_cycle"].items():
        lines.append(f"- **{cid}:** " + ", ".join(f"{k}={v:.2%}" for k, v in rel["rank_by_cycle_excess_vs_pure"]))

    lines += [
        "",
        "## Stop line",
        "",
        "No refit. No adoption. D follows if differences warrant explanation.",
        "",
    ]
    return "\n".join(lines)


def build_d_report(d: dict, c: dict) -> str:
    lines = [
        "# BTC D — Difference Explanation (descriptive)",
        "",
        "**Record:** `BTC-COMPLETE-D-DIFFERENCE-EXPLANATION-001`",
        "",
        d["purpose"],
        "",
        "## Confound reminder",
        "",
        d["confound_reminder"],
        "",
        "## Period descriptors",
        "",
        json.dumps(d["periods"], ensure_ascii=False, indent=2),
        "",
        "## Macro period level changes (QQQ / US10Y / DXY)",
        "",
        json.dumps(d.get("macro_period_changes", {}), ensure_ascii=False, indent=2),
        "",
        "## Descriptive correlations (post H2024 halving)",
        "",
        json.dumps(d["correlations_descriptive"], ensure_ascii=False, indent=2),
        "",
        "## IBIT proxy (not official flow)",
        "",
        json.dumps(d["ibit_proxy"], ensure_ascii=False, indent=2),
        "",
        "## Unavailable in v1 pipeline",
        "",
        json.dumps(d["unavailable_series"], ensure_ascii=False, indent=2),
        "",
        "## C differences referenced",
        "",
        json.dumps(d["c_differences_to_explain"], ensure_ascii=False, indent=2),
        "",
        "## Limitations",
        "",
    ]
    lines += [f"- {x}" for x in d["limitations"]]
    lines += [
        "",
        "## Final synthesis (7 questions)",
        "",
        build_final_synthesis(c, d),
        "",
    ]
    return "\n".join(lines)


def build_final_synthesis(c: dict, d: dict) -> str:
    h540 = next(r for r in c["H2024_rule_comparison"] if r["rule_id"] == "E0_X540_R180")
    h365 = next(r for r in c["H2024_rule_comparison"] if r["rule_id"] == "E0_X365_R180")
    h730 = next(r for r in c["H2024_rule_comparison"] if r["rule_id"] == "E0_X730_R180")
    rel_h24 = c["relative_ranking_by_cycle"]["H2024"]["rank_by_cycle_excess_vs_pure"]

    return "\n".join(
        [
            "### 1. Did X=540 function similarly in H2024?",
            f"- Exit fired at dsh={h540['exit_dsh']} (X=540) on {h540['exit_date']}.",
            f"- H2024 cycle excess vs pure DCA: {h540['H2024_excess']:.2%}.",
            "- Mechanically the frozen 540-day rule applied; whether that is 'similar function' to H2016/H2020 is **not proven** (incomplete cycle, ETF/halving confound).",
            "",
            "### 2. How did 365/540/730 relative relations change?",
            f"- H2024 rank by cycle excess vs pure: {rel_h24}.",
            f"- 365 excess {h365['H2024_excess']:.2%}, 540 {h540['H2024_excess']:.2%}, 730 {h730['H2024_excess']:.2%}.",
            "- Compare to H2016/H2020 ranks in C artifacts for shrink/flip observation.",
            "",
            "### 3. Halving-cycle rule behavior post-ETF",
            "- All three rules executed once-per-cycle exits in H2016/H2020; H2024 exit occurred where dsh reached X.",
            "- Post-exit paths differ by X; H2024 often ends FLAT (no next cycle to re-enter).",
            "",
            "### 4. Observed differences",
            json.dumps(c["observed_differences_for_D"], ensure_ascii=False, indent=2),
            "",
            "### 5. Factors that may explain (not causal)",
            f"- BTC–QQQ daily correlation post H2024 halving: {d['correlations_descriptive'].get('btc_qqq_daily_post_h24_halving', 'n/a')}",
            f"- BTC–US10Y daily correlation post H2024 halving: {d['correlations_descriptive'].get('btc_us10y_daily_post_h24_halving', 'n/a')}",
            f"- BTC–DXY daily correlation post H2024 halving: {d['correlations_descriptive'].get('btc_dxy_daily_post_h24_halving', 'n/a')}",
            f"- IBIT notional proxy: see D dataset (volume×close, not net flow)",
            "- Macro period level changes (QQQ/US10Y/DXY): see D macro_period_changes section.",
            "- ETF/halving timing overlap documented; no single-factor attribution.",
            "",
            "### 6. Unexplained / data-limited",
            "- MVRV, Realized Price, OI/Funding/Netflow/F&G not in v1 fetch path.",
            "- Incomplete H2024 vs completed historical cycles.",
            "- No fixed comparable/degraded thresholds.",
            "",
            "### 7. Judgment possible / impossible",
            "**Possible:** describe exit timing, relative X ranking in H2024, cash-flat terminal states, descriptive macro co-movement post-ETF.",
            "**Impossible:** adopt/refute strategy, claim ETF caused outcomes, prove X=540 edge persists, or classify comparable/degraded with authority until thresholds fixed.",
            "",
            "**No investment decision or strategy change.**",
        ]
    )


def main() -> None:
    retrieved = _utc_now()
    data_version = f"cd-{_utc_today()}"
    out_c = ROOT / "c" / data_version
    out_d = ROOT / "d" / data_version
    out_c.mkdir(parents=True, exist_ok=True)
    out_d.mkdir(parents=True, exist_ok=True)

    panel, a1_ver = load_a1_panel()
    c_data = run_phase_c(panel)
    c_data["retrieved_at"] = retrieved
    c_data["source_a1"] = a1_ver

    c_json = json.dumps(c_data, ensure_ascii=False, indent=2) + "\n"
    (out_c / "c_fixed_application.json").write_text(c_json, encoding="utf-8")
    pd.DataFrame(c_data["window_results"]).to_csv(out_c / "c_window_results.csv", index=False)
    pd.DataFrame(c_data["H2024_rule_comparison"]).to_csv(out_c / "c_h2024_rule_comparison.csv", index=False)

    # daily ledgers for primary rule
    _, rule540 = FROZEN_RULES[0]
    panel_c = panel[panel.index >= pd.Timestamp("2016-07-09")]
    det = fix_backtest_detailed(panel_c, rule540)
    pd.DataFrame(det["daily"]).to_csv(out_c / "c_daily_state_E0_X540_R180.csv", index=False)

    c_report = build_c_report(c_data, str(panel.index[-1].date()))
    (out_c / "C_REPORT.md").write_text(c_report, encoding="utf-8")
    (out_c / "run_meta.json").write_text(
        json.dumps(
            {
                "phase": "C",
                "data_version": data_version,
                "contract_version": CONTRACT_VERSION,
                "candidate_set_id": CANDIDATE_SET_ID,
                "retrieved_at": retrieved,
                "fingerprint": _fp(c_json),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    d_data = run_phase_d(panel, c_data)
    d_data["retrieved_at"] = retrieved
    d_json = json.dumps(d_data, ensure_ascii=False, indent=2) + "\n"
    (out_d / "d_explanation.json").write_text(d_json, encoding="utf-8")
    d_report = build_d_report(d_data, c_data)
    (out_d / "D_REPORT.md").write_text(d_report, encoding="utf-8")
    (out_d / "run_meta.json").write_text(
        json.dumps({"phase": "D", "data_version": data_version, "retrieved_at": retrieved}, indent=2) + "\n",
        encoding="utf-8",
    )

    docs = Path(__file__).resolve().parents[2] / "docs" / "reports"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / "BTC-COMPLETE-C-FIXED-APPLICATION-001.md").write_text(
        c_report + f"\n---\n\nArtifacts: `research/btc_dca_halving/c/{data_version}/`\n",
        encoding="utf-8",
    )
    (docs / "BTC-COMPLETE-D-DIFFERENCE-EXPLANATION-001.md").write_text(
        d_report + f"\n---\n\nArtifacts: `research/btc_dca_halving/d/{data_version}/`\n",
        encoding="utf-8",
    )
    (ROOT / "c" / "LATEST.txt").write_text(data_version + "\n", encoding="utf-8")
    (ROOT / "d" / "LATEST.txt").write_text(data_version + "\n", encoding="utf-8")

    print(f"C/D complete: c={out_c} d={out_d}")


if __name__ == "__main__":
    main()
