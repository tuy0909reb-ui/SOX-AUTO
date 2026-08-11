"""Quarterly multi-asset review: peer compare, hypothesis verification, Mega rebalance."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from hypothesis_cli import update_hypothesis
from portfolio.review_common import (
    COMPARE_MODES,
    build_compare_table,
    classify_hypothesis_result,
    compute_peer_metrics,
    default_compare_set,
    evaluate_hypothesis,
    format_compare_header,
    format_pct,
    format_ranking_chain,
    latest_holdings,
    load_hypothesis_reviews,
    load_price_frame,
    load_rebalance_events,
    load_registered_hypotheses,
    persist_review_run,
    quarter_bounds,
    ranking_diff_lines,
)


def _append_hypothesis_block(
    lines: list[str],
    *,
    hyp_id: int,
    title: str,
    expected: list[str],
    actual: list[str],
    suggested_result: str,
    human_reviews: list[dict],
    thesis: str | None = None,
    status_note: str | None = None,
    compare_mode: str | None = None,
    compare_start: str | None = None,
    compare_end: str | None = None,
    compare_reason: str | None = None,
    compare_n_obs: int | None = None,
) -> None:
    lines.append(f"#### Hypothesis #{hyp_id}: {title}")
    if status_note:
        lines.append(status_note)
    if thesis:
        lines.append(f"Thesis: {thesis[:160]}")
    lines.append(f"Comparison mode: {compare_mode or 'n/a'}")
    lines.append(
        f"Compare period: {compare_start or 'n/a'} -> {compare_end or 'n/a'}"
        + (f" (n={compare_n_obs})" if compare_n_obs is not None else "")
    )
    lines.append(f"Compare reason: {compare_reason or 'n/a'}")
    lines.append("")
    lines.append("Hypothesis")
    lines.append(format_ranking_chain(expected))
    lines.append("")
    lines.append("Actual")
    lines.append(format_ranking_chain(actual))
    lines.append("")
    lines.append("Diff")
    for d in ranking_diff_lines(expected, actual):
        lines.append(f"- {d}")
    lines.append("")
    lines.append("Result")
    lines.append(suggested_result)
    if human_reviews:
        lines.append("")
        lines.append("Human reviews (hypothesis_review)")
        for hr in human_reviews:
            ranking = hr["actual_ranking"]
            try:
                ranking = format_ranking_chain(json.loads(ranking))
            except (TypeError, json.JSONDecodeError):
                pass
            lines.append(
                f"- {hr['review_date']} [{hr['result']}] actual={ranking}"
            )
            if hr.get("comment"):
                lines.append(f"  comment: {hr['comment']}")
    lines.append("")


def run_quarterly_review(
    *,
    db_path: str | None = None,
    year: int | None = None,
    quarter: int | None = None,
    compare_set: list[str] | None = None,
    compare_mode: str = "intersection",
    persist: bool = True,
    apply_hypothesis_updates: bool = False,
) -> str:
    today = date.today()
    year = year or today.year
    quarter = quarter or ((today.month - 1) // 3 + 1)
    codes = compare_set or default_compare_set()
    period_start, period_end = quarter_bounds(year, quarter)

    df = load_price_frame(db_path, codes)
    if df.empty:
        return "No market_daily data. Run collect_market_daily.py first."

    last = df.index.max().strftime("%Y-%m-%d")
    calendar_end = min(period_end, last)

    peer = compute_peer_metrics(
        df, codes, period_start, calendar_end, mode=compare_mode
    )
    table = build_compare_table(peer["metrics"])

    lines: list[str] = []
    lines.append(f"## Quarterly review {year}-Q{quarter}")
    lines.append("Purpose: verify investment judgments (Fact + Hypothesis + Position).")
    lines.append(f"Compare set: {', '.join(codes)}")
    lines.extend(format_compare_header(peer))
    lines.append("")
    lines.append(f"### 1. Peer performance (mode={compare_mode})")
    if not table:
        lines.append("(no peers/dates available for this compare mode)")
    else:
        lines.append(
            f"{'rank':>4} {'asset':<16} {'ret':>9} {'MDD':>9} {'vol':>9} {'sharpe':>8}"
        )
        for r in table:
            sharpe = r["sharpe"]
            sharpe_s = f"{sharpe:.2f}" if sharpe is not None else "n/a"
            lines.append(
                f"{r['rank'] or '-':>4} {r['asset']:<16} "
                f"{format_pct(r['ret']):>9} {format_pct(r['mdd']):>9} "
                f"{format_pct(r['vol']):>9} {sharpe_s:>8}"
            )

    # Formal hypothesis vs actual comparison (core judgment section)
    lines.append("")
    lines.append("### 2. Hypothesis verification")
    lines.append(
        "(Registered hypotheses vs period actual ranking; "
        "Result is suggested from market data unless a human review exists.)"
    )
    lines.append("")

    registered = load_registered_hypotheses(db_path, as_of_max=calendar_end)
    hyp_evals = []
    shown = 0

    if not registered:
        lines.append("(no registered hypotheses)")
    else:
        for h in registered:
            ev = evaluate_hypothesis(h, df, calendar_end, mode=compare_mode)
            if ev is None:
                continue
            hyp_evals.append(ev)
            expected = ev["expected_ranking"]
            actual = ev["actual_ranking"]
            suggested = classify_hypothesis_result(expected, actual)
            human = load_hypothesis_reviews(
                db_path,
                hypothesis_id=ev["hypothesis_id"],
                start=period_start,
                end=period_end,
            )
            # Prefer latest human result display note when present
            result_display = suggested
            if human:
                result_display = (
                    f"{suggested} (suggested) / "
                    f"human latest={human[-1]['result']}"
                )
            _append_hypothesis_block(
                lines,
                hyp_id=ev["hypothesis_id"],
                title=ev["title"],
                expected=expected,
                actual=actual,
                suggested_result=result_display,
                human_reviews=human,
                thesis=ev.get("thesis"),
                status_note=(
                    f"status={ev['status']} matured={ev['matured']} "
                    f"corr={ev['rank_corr']}"
                ),
                compare_mode=ev.get("compare_mode"),
                compare_start=ev.get("compare_start"),
                compare_end=ev.get("compare_end"),
                compare_reason=ev.get("compare_reason"),
                compare_n_obs=ev.get("compare_n_obs"),
            )
            shown += 1

            if apply_hypothesis_updates and ev["matured"]:
                update_hypothesis(
                    db_path=db_path,
                    hypothesis_id=ev["hypothesis_id"],
                    status=ev["suggested_status"],
                    outcome_summary=(
                        f"auto quarterly {year}-Q{quarter}: "
                        f"actual={ev['actual_ranking']} result={suggested} "
                        f"compare={ev.get('compare_start')}->{ev.get('compare_end')}"
                    ),
                    actual_ranking=ev["actual_ranking"],
                )
                lines.append(f"APPLIED hypothesis status -> {ev['suggested_status']}")
                lines.append("")

        if shown == 0:
            lines.append("(no active hypotheses in this window)")

    # Mega rebalance (one section, not the whole review)
    lines.append("### 3. Mega rebalance / constituent events")
    events = load_rebalance_events(db_path, period_start, calendar_end)
    mega_events = [
        e
        for e in events
        if e["asset_code"] in ("MEGA10_PROXY", "MEGA10_OFFICIAL", "MEGA10_FUND", "MEGA10")
    ]
    if not mega_events:
        lines.append("(no rebalance_event rows in this quarter)")
    else:
        for e in mega_events:
            lines.append(
                f"- {e['event_date']} {e['asset_code']} {e['event_type']} "
                f"source={e['source']}"
            )

    # Positions x hypothesis
    lines.append("")
    lines.append("### 4. Positions x hypothesis")
    holdings = latest_holdings(db_path, as_of=calendar_end)
    if not holdings:
        lines.append("(no holdings snapshots)")
    else:
        for h in holdings:
            lines.append(
                f"- {h['position_id']}: asset={h['asset_code']} "
                f"value={h['value_jpy']} linked_hyp={h['hypothesis_id']}"
            )

    summary = "\n".join(lines)
    compare_start = peer["compare_start"] or period_start
    compare_end = peer["compare_end"] or calendar_end

    if persist and peer["metrics"]:
        metric_rows: list[tuple[str, str, float | None]] = []
        for r in table:
            code = r["asset"]
            metric_rows.append(("ret_quarter", code, r["ret"]))
            metric_rows.append(("mdd_quarter", code, r["mdd"]))
            metric_rows.append(("vol_quarter", code, r["vol"]))
            metric_rows.append(("sharpe_quarter", code, r["sharpe"]))
            metric_rows.append(
                ("rank_quarter", code, float(r["rank"]) if r["rank"] else None)
            )
        for ev in hyp_evals:
            metric_rows.append(
                (
                    f"hyp_{ev['hypothesis_id']}_rank_corr",
                    "_hypothesis_",
                    ev["rank_corr"],
                )
            )
        run_id = persist_review_run(
            db_path,
            review_type="quarterly",
            period_start=compare_start,
            period_end=compare_end,
            params={
                "compare_set": codes,
                "compare_mode": compare_mode,
                "compare_reason": peer["compare_reason"],
                "year": year,
                "quarter": quarter,
                "calendar_start": period_start,
                "calendar_end": calendar_end,
                "compare_start": compare_start,
                "compare_end": compare_end,
                "n_obs": peer["n_obs"],
                "hypotheses": [e["hypothesis_id"] for e in hyp_evals],
            },
            summary_text=summary,
            metrics_rows=metric_rows,
        )
        if apply_hypothesis_updates:
            for ev in hyp_evals:
                if ev["matured"]:
                    update_hypothesis(
                        db_path=db_path,
                        hypothesis_id=ev["hypothesis_id"],
                        linked_review_run_id=run_id,
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
            "Quarterly judgment review (Fact + Hypothesis + Position). "
            "Generated artifact — not market SoT."
        )
    )
    parser.add_argument("--db", default=None)
    parser.add_argument("--year", type=int, default=None)
    parser.add_argument("--quarter", type=int, choices=[1, 2, 3, 4], default=None)
    parser.add_argument("--compare-set", default=None)
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
    parser.add_argument(
        "--apply-hypothesis-updates",
        action="store_true",
        help="Write suggested status/actual_ranking into hypothesis for matured items",
    )
    add_version_flag(parser)
    args = parser.parse_args()
    maybe_exit_on_version(args)
    codes = [c.strip() for c in args.compare_set.split(",")] if args.compare_set else None

    with cli_runtime("review_quarterly"):
        persist = not (args.no_persist or args.dry_run)
        apply = args.apply_hypothesis_updates and not args.dry_run
        text = run_quarterly_review(
            db_path=args.db,
            year=args.year,
            quarter=args.quarter,
            compare_set=codes,
            compare_mode=args.compare_mode,
            persist=persist,
            apply_hypothesis_updates=apply,
        )
        if args.dry_run:
            print("DRY-RUN: review computed; review_run NOT persisted")
            print(f"DRY-RUN: output_chars={len(text)}")
        print(text)
        if not args.dry_run:
            try:
                from discord_notify import notify_review

                if notify_review(text, kind="Quarterly Review"):
                    print("(Discord: review summary sent)")
            except Exception:
                pass


if __name__ == "__main__":
    main()
