"""
BTC DCA × Halving Cycle — Phase A1 descriptive statistics only.

Contract: btc-dca-halving-contracts-v1.0-approved
Phase: A1 only (no Entry/Exit/Re-entry exploration, no candidate_set).

Outputs under research/btc_dca_halving/a1/<data_version>/
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import yfinance as yf

CONTRACT_VERSION = "btc-dca-halving-contracts-v1.0-approved"
PHASE = "A1"
BAR_TZ_POLICY = "utc_calendar_date_yahoo_daily_close"
PRICE_SOURCE = "Yahoo Finance BTC-USD (auto_adjust=True)"
FX_SOURCE = "Yahoo Finance JPY=X (USDJPY, auto_adjust=True)"
BTC_TICKER = "BTC-USD"
FX_TICKER = "JPY=X"

T_APPROVE = "2024-01-10"
T_PRIMARY = "2024-01-11"

HALVINGS = [
    {"cycle_id": "H2012", "halving_date": "2012-11-28", "role": "descriptive_only_if_in_panel"},
    {"cycle_id": "H2016", "halving_date": "2016-07-09", "role": "explore_select"},
    {"cycle_id": "H2020", "halving_date": "2020-05-11", "role": "explore_select"},
    {"cycle_id": "H2024", "halving_date": "2024-04-19", "role": "post_etf_validation_incomplete"},
]

MATCH_WINDOWS = (180, 365, 400, 540)

ROOT = Path(__file__).resolve().parent
START = "2014-01-01"


def _utc_today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _download_close(ticker: str, start: str) -> pd.Series:
    hist = yf.Ticker(ticker).history(start=start, auto_adjust=True)
    if hist.empty:
        raise RuntimeError(f"empty history for {ticker}")
    close = hist["Close"].astype(float).copy()
    # UTC calendar date label; strip tz to date-only key (contract §3.3)
    close.index = pd.to_datetime([str(pd.Timestamp(x).date()) for x in close.index])
    close = close[~close.index.duplicated(keep="last")].sort_index()
    close.name = ticker
    return close


def _fingerprint(csv_text: str) -> str:
    return hashlib.sha256(csv_text.encode("utf-8")).hexdigest()


def assign_cycle(dates: pd.DatetimeIndex) -> pd.DataFrame:
    """Assign cycle_id and days_since_halving per approved calendar contract."""
    rows = []
    halving_ts = [(h["cycle_id"], pd.Timestamp(h["halving_date"])) for h in HALVINGS]
    for d in dates:
        cycle_id = None
        halving_date = None
        for i, (cid, hd) in enumerate(halving_ts):
            nxt = halving_ts[i + 1][1] if i + 1 < len(halving_ts) else None
            if d >= hd and (nxt is None or d < nxt):
                cycle_id = cid
                halving_date = hd
                break
        if cycle_id is None:
            # before first listed halving
            cycle_id = "PRE_H2012"
            halving_date = pd.NaT
            dsh = np.nan
        else:
            dsh = int((d - halving_date).days)
        rows.append(
            {
                "date": d,
                "cycle_id": cycle_id,
                "halving_date": None if pd.isna(halving_date) else str(halving_date.date()),
                "days_since_halving": dsh,
            }
        )
    return pd.DataFrame(rows).set_index("date")


def build_panel() -> tuple[pd.DataFrame, pd.Series, pd.Series, dict]:
    btc = _download_close(BTC_TICKER, START)
    usdjpy = _download_close(FX_TICKER, START)

    # Spine = BTC calendar; FX reindex + ffill only (no linear interpolation)
    spine = btc.index
    fx = usdjpy.reindex(spine).ffill()

    # Drop BTC-missing (already spine); drop rows before first FX print
    first_fx = fx.first_valid_index()
    if first_fx is None:
        raise RuntimeError("USDJPY series has no valid prints")
    btc = btc.loc[btc.index >= first_fx]
    fx = fx.loc[fx.index >= first_fx]
    # Any remaining FX NaN at start after cut should not exist; drop if any
    mask = btc.notna() & fx.notna()
    btc = btc.loc[mask]
    fx = fx.loc[mask]

    cycle = assign_cycle(btc.index)
    t_primary = pd.Timestamp(T_PRIMARY)
    regime = np.where(btc.index >= t_primary, "post_etf", "pre_etf")

    panel = pd.DataFrame(
        {
            "btc_usd": btc.values,
            "usdjpy": fx.values,
            "btc_jpy": (btc.values * fx.values),
            "cycle_id": cycle["cycle_id"].values,
            "halving_date": cycle["halving_date"].values,
            "days_since_halving": cycle["days_since_halving"].values,
            "etf_regime": regime,
        },
        index=btc.index,
    )
    panel.index.name = "date"

    quality = {
        "btc_start": str(btc.index[0].date()),
        "btc_end": str(btc.index[-1].date()),
        "btc_rows_raw_after_align": int(len(btc)),
        "fx_first_valid_on_spine": str(first_fx.date()),
        "fx_ffill_non_trading_days": True,
        "btc_dropna": True,
        "linear_interpolation": False,
    }
    return panel, btc, fx, quality


def _mdd(px: pd.Series) -> float:
    peak = px.cummax()
    dd = px / peak - 1.0
    return float(dd.min()) if len(dd) else float("nan")


def _window_stats(px: pd.Series, start: pd.Timestamp, days: int) -> dict | None:
    end = start + pd.Timedelta(days=days)
    seg = px[(px.index >= start) & (px.index <= end)]
    if len(seg) < 5:
        return None
    rets = seg.pct_change().dropna()
    return {
        "window_days": days,
        "n_bars": int(len(seg)),
        "start": str(seg.index[0].date()),
        "end": str(seg.index[-1].date()),
        "return": float(seg.iloc[-1] / seg.iloc[0] - 1.0),
        "vol_ann_sqrt365": float(rets.std() * np.sqrt(365)) if len(rets) else None,
        "mdd": _mdd(seg),
    }


def cycle_descriptive(panel: pd.DataFrame) -> dict:
    out: dict = {
        "note": (
            "Peaks/bottoms are DESCRIPTIVE ONLY. "
            "They MUST NOT be used as Entry/Exit/Re-entry rule inputs (contract §4.3 / §9)."
        ),
        "cycles": [],
        "h2024_etf_confound": {
            "required": True,
            "T_approve": T_APPROVE,
            "T_primary": T_PRIMARY,
            "H2024_halving": "2024-04-19",
            "statement": (
                "H2024 halving (2024-04-19) is close to US spot BTC ETF public trading start "
                "(T_primary=2024-01-11; T_approve=2024-01-10). "
                "post_etf early period and post-halving path overlap. "
                "Do not attribute outcomes to a single factor (ETF vs halving)."
            ),
        },
    }

    for h in HALVINGS:
        cid = h["cycle_id"]
        hd = pd.Timestamp(h["halving_date"])
        sub = panel[panel["cycle_id"] == cid]
        if sub.empty:
            out["cycles"].append(
                {
                    "cycle_id": cid,
                    "halving_date": h["halving_date"],
                    "role": h["role"],
                    "status": "out_of_panel",
                }
            )
            continue

        px_usd = sub["btc_usd"]
        px_jpy = sub["btc_jpy"]
        peak_i = int(px_usd.values.argmax())
        trough_i = int(px_usd.values.argmin())
        peak_date = px_usd.index[peak_i]
        trough_date = px_usd.index[trough_i]
        # complete_flag: next halving arrived AND panel covers the halving date
        next_h = None
        ids = [x["cycle_id"] for x in HALVINGS]
        if cid in ids:
            idx = ids.index(cid)
            if idx + 1 < len(HALVINGS):
                next_h = pd.Timestamp(HALVINGS[idx + 1]["halving_date"])
        covers_halving = bool(sub.index.min() <= hd <= sub.index.max())
        cycle_complete_flag = bool(
            next_h is not None and panel.index.max() >= next_h and covers_halving
        )
        coverage = "full_from_halving" if covers_halving else "partial_mid_cycle"

        windows_usd = []
        windows_jpy = []
        for w in MATCH_WINDOWS:
            # Windows that begin before panel coverage are omitted (no backfill)
            if not covers_halving and (hd + pd.Timedelta(days=w)) < sub.index.min():
                continue
            wu = _window_stats(panel["btc_usd"], hd, w)
            wj = _window_stats(panel["btc_jpy"], hd, w)
            if wu and covers_halving:
                windows_usd.append(wu)
            if wj and covers_halving:
                windows_jpy.append(wj)

        # path from halving to in-cycle peak (descriptive); only if halving is in panel
        if covers_halving:
            post = px_usd[px_usd.index >= hd]
            peak_post_i = int(post.values.argmax())
            peak_post_date = post.index[peak_post_i]
            days_halving_to_peak = int((peak_post_date - hd).days)
            ret_halving_to_peak = float(post.iloc[peak_post_i] / post.iloc[0] - 1.0)
        else:
            peak_post_date = None
            days_halving_to_peak = None
            ret_halving_to_peak = None

        # ETF overlap metrics for H2024 only (descriptive)
        etf_overlap = None
        if cid == "H2024":
            pre_halving_post_etf = panel[
                (panel.index >= pd.Timestamp(T_PRIMARY)) & (panel.index < hd)
            ]
            etf_overlap = {
                "days_T_primary_to_halving": int((hd - pd.Timestamp(T_PRIMARY)).days),
                "bars_post_etf_before_halving": int(len(pre_halving_post_etf)),
                "btc_usd_return_T_primary_to_halving": (
                    float(
                        panel.loc[hd, "btc_usd"] / panel.loc[pd.Timestamp(T_PRIMARY), "btc_usd"] - 1.0
                    )
                    if pd.Timestamp(T_PRIMARY) in panel.index and hd in panel.index
                    else None
                ),
            }

        out["cycles"].append(
            {
                "cycle_id": cid,
                "halving_date": h["halving_date"],
                "role": h["role"],
                "status": "in_panel",
                "cycle_complete_flag": cycle_complete_flag,
                "coverage": coverage,
                "covers_halving_date": covers_halving,
                "panel_start": str(sub.index[0].date()),
                "panel_end": str(sub.index[-1].date()),
                "n_bars": int(len(sub)),
                "btc_usd_start": float(px_usd.iloc[0]),
                "btc_usd_end": float(px_usd.iloc[-1]),
                "btc_usd_cycle_return": float(px_usd.iloc[-1] / px_usd.iloc[0] - 1.0),
                "btc_jpy_cycle_return": float(px_jpy.iloc[-1] / px_jpy.iloc[0] - 1.0),
                "mdd_usd": _mdd(px_usd),
                "mdd_jpy": _mdd(px_jpy),
                "vol_ann_usd": float(px_usd.pct_change().dropna().std() * np.sqrt(365)),
                "vol_ann_jpy": float(px_jpy.pct_change().dropna().std() * np.sqrt(365)),
                "peak_date_in_available_segment_usd": str(peak_date.date()),
                "peak_price_usd": float(px_usd.iloc[peak_i]),
                "trough_date_in_available_segment_usd": str(trough_date.date()),
                "trough_price_usd": float(px_usd.iloc[trough_i]),
                "days_halving_to_in_cycle_peak": days_halving_to_peak,
                "return_halving_to_in_cycle_peak_usd": ret_halving_to_peak,
                "peak_date_post_halving_usd": (
                    None if peak_post_date is None else str(peak_post_date.date())
                ),
                "match_windows_usd": windows_usd,
                "match_windows_jpy": windows_jpy,
                "etf_confound_descriptive": etf_overlap,
                "rule_input_forbidden": True,
            }
        )
    return out


def plot_figures(panel: pd.DataFrame, fig_dir: Path) -> list[str]:
    fig_dir.mkdir(parents=True, exist_ok=True)
    written: list[str] = []

    # Full history USD
    fig, ax = plt.subplots(figsize=(11, 5))
    ax.plot(panel.index, panel["btc_usd"], color="#1f4e79", lw=1.0, label="BTC-USD Close")
    for h in HALVINGS:
        hd = pd.Timestamp(h["halving_date"])
        if panel.index.min() <= hd <= panel.index.max():
            ax.axvline(hd, color="#c45911", ls="--", lw=1.0, alpha=0.8)
            ax.text(hd, ax.get_ylim()[1] * 0.98, h["cycle_id"], rotation=90, va="top", fontsize=8)
    ax.axvline(pd.Timestamp(T_PRIMARY), color="#548235", ls=":", lw=1.2, label=f"T_primary {T_PRIMARY}")
    ax.set_yscale("log")
    ax.set_title("BTC-USD (log) with halvings and T_primary")
    ax.legend(loc="upper left", fontsize=8)
    ax.grid(True, alpha=0.25)
    fig.tight_layout()
    p = fig_dir / "btc_usd_halving_timeline.png"
    fig.savefig(p, dpi=120)
    plt.close(fig)
    written.append(str(p.name))

    # Per-cycle from halving, normalized
    fig, ax = plt.subplots(figsize=(10, 5))
    for h in HALVINGS:
        cid = h["cycle_id"]
        hd = pd.Timestamp(h["halving_date"])
        sub = panel[panel["cycle_id"] == cid]
        if sub.empty or hd not in panel.index:
            # use nearest on/after
            post = panel[panel.index >= hd]
            if post.empty or post["cycle_id"].iloc[0] != cid:
                continue
            base = float(post["btc_usd"].iloc[0])
            dsh = (post.index - hd).days
            ax.plot(dsh, post["btc_usd"] / base, label=cid, lw=1.2)
        else:
            post = panel[(panel.index >= hd) & (panel["cycle_id"] == cid)]
            if post.empty:
                continue
            base = float(post["btc_usd"].iloc[0])
            dsh = post["days_since_halving"].astype(float)
            ax.plot(dsh, post["btc_usd"] / base, label=cid, lw=1.2)
    ax.axhline(1.0, color="gray", lw=0.8)
    ax.set_xlabel("days_since_halving")
    ax.set_ylabel("price / price_at_halving")
    ax.set_title("Normalized BTC-USD path from each halving (descriptive)")
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.25)
    fig.tight_layout()
    p = fig_dir / "btc_usd_normalized_from_halving.png"
    fig.savefig(p, dpi=120)
    plt.close(fig)
    written.append(str(p.name))

    # JPY series
    fig, ax = plt.subplots(figsize=(11, 5))
    ax.plot(panel.index, panel["btc_jpy"], color="#833c0c", lw=1.0, label="BTC-JPY (USD×USDJPY)")
    ax.axvline(pd.Timestamp(T_PRIMARY), color="#548235", ls=":", lw=1.2, label=f"T_primary {T_PRIMARY}")
    for h in HALVINGS:
        hd = pd.Timestamp(h["halving_date"])
        if panel.index.min() <= hd <= panel.index.max():
            ax.axvline(hd, color="#c45911", ls="--", lw=1.0, alpha=0.7)
    ax.set_yscale("log")
    ax.set_title("BTC-JPY (log) via USDJPY ffill alignment")
    ax.legend(loc="upper left", fontsize=8)
    ax.grid(True, alpha=0.25)
    fig.tight_layout()
    p = fig_dir / "btc_jpy_halving_timeline.png"
    fig.savefig(p, dpi=120)
    plt.close(fig)
    written.append(str(p.name))

    return written


def write_report(out_dir: Path, meta: dict, descriptive: dict) -> Path:
    cycles = descriptive["cycles"]
    lines = [
        "# BTC A1 — Descriptive Statistics (Price + Halving Calendar)",
        "",
        f"**Record:** `BTC-COMPLETE-A1-DESCRIPTIVE-STATISTICS-001`",
        f"**Status:** COMPLETE — Phase A1 only",
        f"**Contract:** `{CONTRACT_VERSION}`",
        f"**data_version:** `{meta['data_version']}`",
        f"**retrieved_at (UTC):** `{meta['retrieved_at']}`",
        "",
        "```text",
        "Phase: A1 only",
        "NOT done: E/X/R exploration, candidate_set, extra indicators, adoption judgment",
        "Peaks/bottoms: descriptive observation only — forbidden as rule inputs",
        "```",
        "",
        "## Data contract summary",
        "",
        f"| Item | Value |",
        f"|---|---|",
        f"| price_source | {meta['price_source']} |",
        f"| fx_source | {meta['fx_source']} |",
        f"| timezone / bar | {meta['bar_tz_policy']} |",
        f"| execution price | Yahoo daily Close |",
        f"| JPY conversion | btc_jpy = btc_usd * usdjpy |",
        f"| FX missing | reindex to BTC spine + ffill only |",
        f"| BTC missing | drop row |",
        f"| linear interpolation | forbidden / not used |",
        f"| T_approve | {T_APPROVE} |",
        f"| T_primary | {T_PRIMARY} |",
        f"| panel | {meta['first_date']} → {meta['last_date']} ({meta['row_count']} rows) |",
        "",
        "## Halving calendar SoT",
        "",
        "| cycle_id | halving_date | role |",
        "|---|---|---|",
    ]
    for h in HALVINGS:
        lines.append(f"| {h['cycle_id']} | {h['halving_date']} | {h['role']} |")

    lines += [
        "",
        "## H2024 × ETF confound (required)",
        "",
        descriptive["h2024_etf_confound"]["statement"],
        "",
        "## Cycle descriptive table",
        "",
        "| cycle_id | complete | coverage | n | USD cycle ret | JPY cycle ret | MDD USD | days halv→peak* |",
        "|---|---|---|---:|---:|---:|---:|---:|",
    ]
    for c in cycles:
        if c.get("status") != "in_panel":
            lines.append(
                f"| {c['cycle_id']} | — | out_of_panel | — | — | — | — | — |"
            )
            continue
        peak_days = c["days_halving_to_in_cycle_peak"]
        lines.append(
            "| {cid} | {comp} | {cov} | {n} | {ur:.1%} | {jr:.1%} | {mdd:.1%} | {d} |".format(
                cid=c["cycle_id"],
                comp=c["cycle_complete_flag"],
                cov=c.get("coverage", ""),
                n=c["n_bars"],
                ur=c["btc_usd_cycle_return"],
                jr=c["btc_jpy_cycle_return"],
                mdd=c["mdd_usd"],
                d="—" if peak_days is None else peak_days,
            )
        )
    lines += [
        "",
        "\\* `days halv→peak` = descriptive in-cycle peak after halving; **not a rule input**.",
        "",
        "## Match windows from halving (USD return)",
        "",
    ]
    for c in cycles:
        if c.get("status") != "in_panel":
            continue
        lines.append(f"### {c['cycle_id']}")
        lines.append("")
        lines.append("| W | end | return | MDD | vol_ann |")
        lines.append("|---:|---|---:|---:|---:|")
        for w in c.get("match_windows_usd", []):
            lines.append(
                f"| {w['window_days']} | {w['end']} | {w['return']:.1%} | {w['mdd']:.1%} | "
                f"{(w['vol_ann_sqrt365'] or float('nan')):.1%} |"
            )
        lines.append("")
        if c["cycle_id"] == "H2024" and c.get("etf_confound_descriptive"):
            e = c["etf_confound_descriptive"]
            lines += [
                "Confound descriptive extras:",
                f"- days T_primary→halving: {e['days_T_primary_to_halving']}",
                f"- bars post_etf before halving: {e['bars_post_etf_before_halving']}",
                f"- USD return T_primary→halving: "
                f"{'—' if e['btc_usd_return_T_primary_to_halving'] is None else format(e['btc_usd_return_T_primary_to_halving'], '.1%')}",
                "",
            ]

    lines += [
        "## Artifacts",
        "",
        f"Directory: `{out_dir.as_posix()}`",
        "",
        "- `run_meta.json`",
        "- `btc_usd_daily.csv`",
        "- `usdjpy_daily.csv`",
        "- `panel_daily.csv`",
        "- `descriptive_halving.json`",
        "- `figures/`",
        "- `A1_REPORT.md` (this file)",
        "",
        "## Next phase",
        "",
        "A2 (E→X→R exploration) is **not** started.",
        "",
    ]
    path = out_dir / "A1_REPORT.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def main() -> None:
    retrieved_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    retrieval_date = _utc_today()
    data_version = f"a1-{retrieval_date}"

    out_dir = ROOT / "a1" / data_version
    fig_dir = out_dir / "figures"
    out_dir.mkdir(parents=True, exist_ok=True)

    panel, btc, fx, quality = build_panel()
    descriptive = cycle_descriptive(panel)
    figs = plot_figures(panel, fig_dir)

    btc_csv = btc.rename("btc_usd").to_csv(lineterminator="\n")
    fx_csv = fx.rename("usdjpy").to_csv(lineterminator="\n")
    panel_csv = panel.to_csv(lineterminator="\n")

    (out_dir / "btc_usd_daily.csv").write_text(btc_csv, encoding="utf-8")
    (out_dir / "usdjpy_daily.csv").write_text(fx_csv, encoding="utf-8")
    (out_dir / "panel_daily.csv").write_text(panel_csv, encoding="utf-8")

    meta = {
        "phase": PHASE,
        "contract_version": CONTRACT_VERSION,
        "data_version": data_version,
        "retrieved_at": retrieved_at,
        "retrieval_date_utc": retrieval_date,
        "price_source": PRICE_SOURCE,
        "fx_source": FX_SOURCE,
        "btc_ticker": BTC_TICKER,
        "fx_ticker": FX_TICKER,
        "bar_tz_policy": BAR_TZ_POLICY,
        "timezone": "UTC calendar date labels from Yahoo daily bars (tz stripped)",
        "execution_price": "Close",
        "jpy_conversion": "btc_jpy = btc_usd * usdjpy",
        "missing_treatment": {
            "btc": "drop rows with missing BTC",
            "usdjpy": "reindex to BTC spine; forward-fill only; no linear interpolation",
        },
        "halving_calendar_sot": HALVINGS,
        "T_approve": T_APPROVE,
        "T_primary": T_PRIMARY,
        "first_date": str(panel.index[0].date()),
        "last_date": str(panel.index[-1].date()),
        "row_count": int(len(panel)),
        "content_fingerprints": {
            "btc_usd_daily.csv": _fingerprint(btc_csv),
            "usdjpy_daily.csv": _fingerprint(fx_csv),
            "panel_daily.csv": _fingerprint(panel_csv),
        },
        "quality": quality,
        "figures": figs,
        "prohibited_in_a1": [
            "E/X/R exploration",
            "candidate_set",
            "MVRV and other overlays",
            "ETF flow",
            "Nasdaq/DXY/rates",
            "adoption judgment",
            "using peaks as exit rules",
        ],
    }
    (out_dir / "run_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (out_dir / "descriptive_halving.json").write_text(
        json.dumps(descriptive, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    report = write_report(out_dir, meta, descriptive)

    # Stable pointer for latest A1 without overwriting versioned runs
    latest = ROOT / "a1" / "LATEST.txt"
    latest.write_text(data_version + "\n", encoding="utf-8")

    # Copy-style completion report into docs/reports for discoverability
    docs = Path(__file__).resolve().parents[2] / "docs" / "reports"
    docs.mkdir(parents=True, exist_ok=True)
    docs_report = docs / "BTC-COMPLETE-A1-DESCRIPTIVE-STATISTICS-001.md"
    docs_report.write_text(
        report.read_text(encoding="utf-8")
        + f"\n---\n\nVersioned artifact root: `research/btc_dca_halving/a1/{data_version}/`\n",
        encoding="utf-8",
    )

    print(f"A1 complete: {out_dir}")
    print(f"data_version={data_version}")
    print(f"rows={meta['row_count']} {meta['first_date']} → {meta['last_date']}")
    print(f"report={report}")


if __name__ == "__main__":
    main()
