"""Monthly multi-asset review with hypothesis progress."""

from __future__ import annotations

import argparse
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from portfolio.review_common import (
    COMPARE_MODES,
    build_compare_table,
    compute_peer_metrics,
    default_compare_set,
    evaluate_hypothesis,
    format_compare_header,
    format_pct,
    latest_holdings,
    load_open_hypotheses,
    load_price_frame,
    month_bounds,
    persist_review_run,
    ytd_start,
)


def run_monthly_review(
    *,
    db_path: str | None = None,
    year: int | None = None,
    month: int | None = None,
    compare_set: list[str] | None = None,
    compare_mode: str = "intersection",
    persist: bool = True,
) -> str:
    today = date.today()
    year = year or today.year
    month = month or today.month
    codes = compare_set or default_compare_set()
    period_start, period_end = month_bounds(year, month)

    df = load_price_frame(db_path, codes)
    if df.empty:
        return "No market_daily data. Run collect_market_daily.py first."

    last = df.index.max().strftime("%Y-%m-%d")
    calendar_end = min(period_end, last)

    peer = compute_peer_metrics(
        df, codes, period_start, calendar_end, mode=compare_mode
    )
    ytd_peer = compute_peer_metrics(
        df, codes, ytd_start(calendar_end), calendar_end, mode=compare_mode
    )
    table = build_compare_table(peer["metrics"], ytd_peer["metrics"])

    lines: list[str] = []
    lines.append(f"## Monthly review {year}-{month:02d}")
    lines.append("Purpose: verify investment judgments (Fact + Hypothesis + Position).")
    lines.append(f"Compare set: {', '.join(codes)}")
    lines.extend(format_compare_header(peer))
    lines.append(
        f"YTD Compare period: {ytd_peer['compare_start'] or 'n/a'} -> "
        f"{ytd_peer['compare_end'] or 'n/a'} (n={ytd_peer['n_obs']})"
    )
    lines.append(f"YTD Compare reason: {ytd_peer['compare_reason']}")
    lines.append("")
    lines.append(f"### Performance (peer comparison, mode={compare_mode})")
    if not table:
        lines.append("(no peers/dates available for this compare mode)")
    else:
        lines.append(
            f"{'rank':>4} {'asset':<16} {'ret':>9} {'YTD':>9} {'MDD':>9} {'vol':>9}"
        )
        for r in table:
            lines.append(
                f"{r['rank'] or '-':>4} {r['asset']:<16} "
                f"{format_pct(r['ret']):>9} {format_pct(r.get('ytd')):>9} "
                f"{format_pct(r['mdd']):>9} {format_pct(r['vol']):>9}"
            )

    lines.append("")
    lines.append("### Hypothesis progress")
    hyps = load_open_hypotheses(db_path)
    hyp_evals = []
    if not hyps:
        lines.append("(no open/monitoring hypotheses)")
    else:
        for h in hyps:
            ev = evaluate_hypothesis(h, df, calendar_end, mode=compare_mode)
            if ev is None:
                continue
            hyp_evals.append(ev)
            lines.append(
                f"- #{ev['hypothesis_id']} [{ev['status']}->{ev['suggested_status']}] "
                f"{ev['title']}"
            )
            lines.append(f"  Comparison mode: {ev.get('compare_mode')}")
            lines.append(
                f"  Compare period: {ev.get('compare_start')} -> {ev.get('compare_end')} "
                f"(n={ev.get('compare_n_obs')})"
            )
            lines.append(f"  Compare reason: {ev.get('compare_reason')}")
            lines.append(
                f"  expected={ev['expected_ranking']} actual={ev['actual_ranking']} "
                f"corr={ev['rank_corr']}"
            )
        if not hyp_evals:
            lines.append("(no active hypotheses in this window)")

    lines.append("")
    lines.append("### Positions (holdings_snapshot)")
    holdings = latest_holdings(db_path, as_of=calendar_end)
    if not holdings:
        lines.append("(no holdings snapshots)")
    else:
        as_of = holdings[0]["as_of_date"]
        lines.append(f"as_of={as_of}")
        for h in holdings:
            lines.append(
                f"- {h['position_id']} ({h['account']}/{h['asset_code']}) "
                f"value={h['value_jpy']} cost={h['cost_jpy']} pnl={h['pnl_jpy']} "
                f"hyp={h['hypothesis_id']}"
            )

    summary = "\n".join(lines)
    compare_start = peer["compare_start"] or period_start
    compare_end = peer["compare_end"] or calendar_end

    if persist and peer["metrics"]:
        metric_rows: list[tuple[str, str, float | None]] = []
        for r in table:
            code = r["asset"]
            metric_rows.append(("ret_month", code, r["ret"]))
            metric_rows.append(("ytd", code, r.get("ytd")))
            metric_rows.append(("mdd_month", code, r["mdd"]))
            metric_rows.append(("vol_month", code, r["vol"]))
            metric_rows.append(("rank_month", code, float(r["rank"]) if r["rank"] else None))
        run_id = persist_review_run(
            db_path,
            review_type="monthly",
            period_start=compare_start,
            period_end=compare_end,
            params={
                "compare_set": codes,
                "compare_mode": compare_mode,
                "compare_reason": peer["compare_reason"],
                "year": year,
                "month": month,
                "calendar_start": period_start,
                "calendar_end": calendar_end,
                "compare_start": compare_start,
                "compare_end": compare_end,
                "n_obs": peer["n_obs"],
            },
            summary_text=summary,
            metrics_rows=metric_rows,
        )
        summary += f"\n\n(persisted review_run id={run_id})"

    return summary


def main() -> None:
    from portfolio.cli_support import (
        add_version_flag,
        cli_runtime,
        maybe_exit_on_version,
    )

    parser = argparse.ArgumentParser(
        description=(
            "Monthly judgment review (Fact + Hypothesis + Position). "
            "Generated artifact — not market SoT."
        )
    )
    parser.add_argument("--db", default=None)
    parser.add_argument("--year", type=int, default=None)
    parser.add_argument("--month", type=int, default=None)
    parser.add_argument(
        "--compare-set",
        default=None,
        help="Comma-separated equal peers (default: MEGA10_PROXY,SOXX,FNGS,QQQ)",
    )
    parser.add_argument(
        "--compare-mode",
        default="intersection",
        choices=list(COMPARE_MODES),
        help="intersection=common dates; calendar=fixed window, missing peers excluded",
    )
    parser.add_argument("--no-persist", action="store_true")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run review and print output without writing review_run",
    )
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)
    codes = [c.strip() for c in args.compare_set.split(",")] if args.compare_set else None

    with cli_runtime("review_monthly"):
        persist = not (args.no_persist or args.dry_run)
        text = run_monthly_review(
            db_path=args.db,
            year=args.year,
            month=args.month,
            compare_set=codes,
            compare_mode=args.compare_mode,
            persist=persist,
        )
        if args.dry_run:
            print("DRY-RUN: review computed; review_run NOT persisted")
            print(f"DRY-RUN: output_chars={len(text)}")
        print(text)
        if not args.dry_run:
            try:
                from discord_notify import notify_review

                if notify_review(text, kind="Monthly Review"):
                    print("(Discord: review summary sent)")
            except Exception:
                pass


if __name__ == "__main__":
    main()
