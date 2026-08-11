"""Shared review helpers: load prices, score windows, match hypotheses."""

from __future__ import annotations

import json
from datetime import date, datetime
from typing import Any

import pandas as pd

from portfolio import DEFAULT_COMPARE_SET, PROTOCOL_VERSION
from portfolio.db import connect, init_db, utc_now_iso
from portfolio.metrics import (
    asset_availability,
    intersection_frame,
    metrics_for_window,
    nan_to_none,
    rank_by_metric,
    ranking_match_score,
    slice_window,
)

COMPARE_MODES = ("intersection", "calendar")


def load_price_frame(
    db_path: str | None,
    codes: list[str],
) -> pd.DataFrame:
    init_db(db_path)
    conn = connect(db_path)
    try:
        placeholders = ",".join("?" * len(codes))
        rows = conn.execute(
            f"""
            SELECT a.code, m.date, m.price
            FROM market_daily m
            JOIN asset a ON a.asset_id = m.asset_id
            WHERE a.code IN ({placeholders})
              AND m.price IS NOT NULL
            ORDER BY m.date
            """,
            codes,
        ).fetchall()
    finally:
        conn.close()

    if not rows:
        return pd.DataFrame()

    data: dict[str, dict[str, float]] = {}
    for r in rows:
        data.setdefault(r["code"], {})[r["date"]] = float(r["price"])
    series = {
        code: pd.Series(vals, dtype=float)
        for code, vals in data.items()
    }
    df = pd.DataFrame(series)
    df.index = pd.to_datetime(df.index)
    return df.sort_index()


def compute_asset_metrics(
    df: pd.DataFrame,
    codes: list[str],
    start: str | None,
    end: str | None,
) -> dict[str, dict[str, float]]:
    """Per-asset metrics on each series independently (legacy helper)."""
    window = slice_window(df, start, end)
    out: dict[str, dict[str, float]] = {}
    for code in codes:
        if code not in window.columns:
            continue
        out[code] = metrics_for_window(window[code])
    return out


def compute_peer_metrics(
    df: pd.DataFrame,
    codes: list[str],
    calendar_start: str | None,
    calendar_end: str | None,
    *,
    mode: str = "intersection",
) -> dict[str, Any]:
    """
    Peer comparison under intersection or calendar mode.

    intersection: only dates where all peers have prices (late starters shrink window).
    calendar: same calendar window; peers with no data in-window are excluded.
    """
    if mode not in COMPARE_MODES:
        raise ValueError(f"mode must be one of {COMPARE_MODES}")

    availability = asset_availability(df, codes)
    window = slice_window(df, calendar_start, calendar_end)

    if mode == "intersection":
        aligned, compare_start, compare_end = intersection_frame(
            df, codes, calendar_start, calendar_end
        )
        active_codes = [c for c in codes if c in aligned.columns]
        excluded: list[str] = []
        reason_parts = [
            "intersection: compare only dates where all selected peers have prices"
        ]
        late = []
        for c in codes:
            info = availability.get(c, {})
            start = info.get("start")
            if start and calendar_start and str(start) > str(calendar_start):
                late.append(f"{c} available from {start}")
        if late:
            reason_parts.append(
                "compare start adjusted for late history (" + "; ".join(late) + ")"
            )
        if compare_start and calendar_start and compare_start > calendar_start:
            reason_parts.append(
                f"effective start {compare_start} (calendar asked {calendar_start})"
            )
        compare_reason = "; ".join(reason_parts)
    else:
        # calendar: keep peers that have at least 2 points in the window
        active_codes = []
        excluded = []
        for c in codes:
            if c not in window.columns:
                excluded.append(c)
                continue
            n = int(window[c].dropna().shape[0])
            if n < 2:
                excluded.append(c)
            else:
                active_codes.append(c)
        if not active_codes:
            aligned = pd.DataFrame()
            compare_start = None
            compare_end = None
        else:
            # Per-asset metrics on own series inside calendar window (no force-align)
            aligned = window[active_codes]
            # Display period = calendar clip to data that exists for any active peer
            any_px = aligned.dropna(how="all")
            if any_px.empty:
                compare_start = None
                compare_end = None
            else:
                compare_start = any_px.index.min().strftime("%Y-%m-%d")
                compare_end = any_px.index.max().strftime("%Y-%m-%d")
        reason_parts = [
            "calendar: same calendar window; peers without in-window data are out of scope"
        ]
        if excluded:
            reason_parts.append("excluded=" + ",".join(excluded))
        if active_codes:
            reason_parts.append("included=" + ",".join(active_codes))
        compare_reason = "; ".join(reason_parts)

    metrics: dict[str, dict[str, float]] = {}
    if mode == "intersection" and not aligned.empty:
        for code in active_codes:
            metrics[code] = metrics_for_window(aligned[code])
        n_obs = int(len(aligned))
    elif mode == "calendar" and active_codes:
        for code in active_codes:
            metrics[code] = metrics_for_window(window[code])
        # n_obs = min length among active (informative)
        lengths = [int(window[c].dropna().shape[0]) for c in active_codes]
        n_obs = int(min(lengths)) if lengths else 0
    else:
        n_obs = 0

    return {
        "mode": mode,
        "metrics": metrics,
        "compare_start": compare_start,
        "compare_end": compare_end,
        "compare_reason": compare_reason,
        "calendar_start": calendar_start,
        "calendar_end": calendar_end,
        "n_obs": n_obs,
        "availability": availability,
        "active_codes": active_codes,
        "excluded_codes": excluded,
    }


def format_compare_header(
    peer: dict[str, Any],
) -> list[str]:
    """Mandatory review banner: mode, period, reason (+ availability)."""
    lines = [
        f"Comparison mode: {peer.get('mode')}",
        f"Compare period: {peer.get('compare_start') or 'n/a'} -> {peer.get('compare_end') or 'n/a'}"
        + (f" (n={peer.get('n_obs')})" if peer.get("n_obs") is not None else ""),
        f"Compare reason: {peer.get('compare_reason') or 'n/a'}",
        f"Calendar window: {peer.get('calendar_start')} -> {peer.get('calendar_end')}",
    ]
    if peer.get("active_codes") is not None:
        lines.append(f"Active peers: {', '.join(peer['active_codes']) or '(none)'}")
    if peer.get("excluded_codes"):
        lines.append(f"Excluded peers: {', '.join(peer['excluded_codes'])}")
    lines.append("Asset availability (full DB coverage):")
    for code, info in (peer.get("availability") or {}).items():
        lines.append(
            f"  {code}: {info.get('start')} -> {info.get('end')} (n={info.get('n', 0)})"
        )
    return lines


def format_availability_block(
    availability: dict[str, dict[str, object]],
    *,
    compare_start: str | None,
    compare_end: str | None,
    calendar_start: str | None = None,
    calendar_end: str | None = None,
    n_obs: int | None = None,
) -> list[str]:
    """Deprecated banner helper; prefer format_compare_header(peer)."""
    lines: list[str] = []
    if calendar_start or calendar_end:
        lines.append(f"Calendar window: {calendar_start} -> {calendar_end}")
    lines.append(
        f"Compare period (intersection): {compare_start or 'n/a'} -> {compare_end or 'n/a'}"
        + (f" (n={n_obs})" if n_obs is not None else "")
    )
    lines.append("Asset availability (full DB coverage):")
    for code, info in availability.items():
        lines.append(
            f"  {code}: {info.get('start')} -> {info.get('end')} (n={info.get('n', 0)})"
        )
    return lines


def ytd_start(end: str) -> str:
    d = datetime.strptime(end, "%Y-%m-%d").date()
    return f"{d.year}-01-01"


def month_bounds(year: int, month: int) -> tuple[str, str]:
    import calendar

    start = date(year, month, 1)
    end = date(year, month, calendar.monthrange(year, month)[1])
    return start.isoformat(), end.isoformat()


def quarter_bounds(year: int, quarter: int) -> tuple[str, str]:
    import calendar

    if quarter not in (1, 2, 3, 4):
        raise ValueError("quarter must be 1..4")
    start_month = 3 * (quarter - 1) + 1
    end_month = start_month + 2
    start = date(year, start_month, 1)
    end = date(year, end_month, calendar.monthrange(year, end_month)[1])
    return start.isoformat(), end.isoformat()


def load_open_hypotheses(db_path: str | None) -> list[dict[str, Any]]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        rows = conn.execute(
            """
            SELECT * FROM hypothesis
            WHERE status IN ('open', 'monitoring')
            ORDER BY as_of_date, hypothesis_id
            """
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def resolve_horizon_end(h: dict[str, Any], as_of_eval: str) -> str | None:
    if h.get("horizon_end"):
        return h["horizon_end"]
    start = datetime.strptime(h["as_of_date"], "%Y-%m-%d").date()
    horizon = h["horizon"]
    if horizon == "1M":
        # approx: +30 days calendar
        end = pd.Timestamp(start) + pd.DateOffset(months=1)
    elif horizon == "3M":
        end = pd.Timestamp(start) + pd.DateOffset(months=3)
    elif horizon == "6M":
        end = pd.Timestamp(start) + pd.DateOffset(months=6)
    elif horizon == "1Y":
        end = pd.Timestamp(start) + pd.DateOffset(years=1)
    elif horizon == "3Y":
        end = pd.Timestamp(start) + pd.DateOffset(years=3)
    else:
        return None
    return end.strftime("%Y-%m-%d")


def evaluate_hypothesis(
    h: dict[str, Any],
    df: pd.DataFrame,
    eval_end: str,
    *,
    mode: str = "intersection",
) -> dict[str, Any] | None:
    compare_set = json.loads(h["compare_set"])
    expected = json.loads(h["expected_ranking"])
    start = h["as_of_date"]
    if start > eval_end:
        return None

    horizon_end = resolve_horizon_end(h, eval_end)
    # Progress window: from hypothesis date to min(eval_end, horizon_end)
    end = eval_end
    if horizon_end and horizon_end < eval_end:
        end = horizon_end

    peer = compute_peer_metrics(df, compare_set, start, end, mode=mode)
    metrics = peer["metrics"]
    actual = rank_by_metric(metrics, "ret", ascending=False)
    score = ranking_match_score(expected, actual)

    matured = bool(horizon_end and eval_end >= horizon_end)
    suggested = h["status"]
    if matured and actual:
        if expected and actual and expected[0] == actual[0]:
            suggested = "confirmed"
        elif score == score and score >= 0.5:  # not nan
            suggested = "inconclusive"
        else:
            suggested = "rejected"
    elif actual:
        suggested = "monitoring"

    return {
        "hypothesis_id": h["hypothesis_id"],
        "title": h["title"],
        "status": h["status"],
        "suggested_status": suggested,
        "as_of_date": start,
        "eval_end": end,
        "compare_mode": peer["mode"],
        "compare_start": peer["compare_start"],
        "compare_end": peer["compare_end"],
        "compare_reason": peer["compare_reason"],
        "compare_n_obs": peer["n_obs"],
        "horizon": h["horizon"],
        "horizon_end": horizon_end,
        "matured": matured,
        "expected_ranking": expected,
        "actual_ranking": actual,
        "rank_corr": nan_to_none(score),
        "metrics": {k: {mk: nan_to_none(mv) for mk, mv in v.items()} for k, v in metrics.items()},
        "thesis": h["thesis"],
    }


def latest_holdings(db_path: str | None, as_of: str | None = None) -> list[dict]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        if as_of:
            rows = conn.execute(
                """
                SELECT * FROM holdings_snapshot
                WHERE as_of_date = (
                  SELECT MAX(as_of_date) FROM holdings_snapshot WHERE as_of_date <= ?
                )
                ORDER BY position_id
                """,
                (as_of,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM holdings_snapshot
                WHERE as_of_date = (SELECT MAX(as_of_date) FROM holdings_snapshot)
                ORDER BY position_id
                """
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def load_rebalance_events(
    db_path: str | None,
    start: str,
    end: str,
) -> list[dict]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        rows = conn.execute(
            """
            SELECT * FROM rebalance_event
            WHERE event_date >= ? AND event_date <= ?
            ORDER BY event_date, event_id
            """,
            (start, end),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def persist_review_run(
    db_path: str | None,
    *,
    review_type: str,
    period_start: str,
    period_end: str,
    params: dict,
    summary_text: str,
    metrics_rows: list[tuple[str, str, float | None]],
) -> int:
    """Insert review_run + review_metric rows. Returns run_id."""
    init_db(db_path)
    conn = connect(db_path)
    try:
        cur = conn.execute(
            """
            INSERT INTO review_run(
              review_type, period_start, period_end, generated_at,
              protocol_version, params_json, status, summary_text
            ) VALUES (?, ?, ?, ?, ?, ?, 'ok', ?)
            """,
            (
                review_type,
                period_start,
                period_end,
                utc_now_iso(),
                PROTOCOL_VERSION,
                json.dumps(params, ensure_ascii=False),
                summary_text,
            ),
        )
        run_id = int(cur.lastrowid)
        for metric_key, asset_code, value in metrics_rows:
            conn.execute(
                """
                INSERT INTO review_metric(run_id, metric_key, asset_code, value)
                VALUES (?, ?, ?, ?)
                """,
                (run_id, metric_key, asset_code, value),
            )
        conn.commit()
        return run_id
    finally:
        conn.close()


def format_pct(x: float | None) -> str:
    if x is None:
        return "n/a"
    return f"{x * 100:+.2f}%"


def format_ranking_chain(codes: list[str] | None) -> str:
    if not codes:
        return "(n/a)"
    return " > ".join(codes)


def classify_hypothesis_result(
    expected: list[str],
    actual: list[str],
) -> str:
    """Map ranking gap to human-review result vocabulary."""
    if not expected or not actual:
        return "invalidated"
    if expected == actual:
        return "validated"
    score = ranking_match_score(expected, actual)
    top_ok = expected[0] == actual[0]
    if top_ok or (score == score and score >= 0.5):
        return "partially_validated"
    return "invalidated"


def ranking_diff_lines(expected: list[str], actual: list[str]) -> list[str]:
    """Short human-readable diff bullets."""
    lines: list[str] = []
    if not expected or not actual:
        lines.append("insufficient ranking data")
        return lines
    if expected == actual:
        lines.append("full order match")
        return lines
    if expected[0] != actual[0]:
        lines.append(f"top-1 differed: expected {expected[0]}, actual {actual[0]}")
    else:
        lines.append(f"top-1 matched: {expected[0]}")
    for i, code in enumerate(expected):
        if code in actual:
            ai = actual.index(code)
            if ai != i:
                lines.append(f"{code}: expected rank {i + 1}, actual rank {ai + 1}")
        else:
            lines.append(f"{code}: missing from actual ranking")
    for code in actual:
        if code not in expected:
            lines.append(f"{code}: unexpected in actual ranking")
    return lines


def load_hypothesis_reviews(
    db_path: str | None,
    *,
    hypothesis_id: int | None = None,
    start: str | None = None,
    end: str | None = None,
) -> list[dict[str, Any]]:
    init_db(db_path)
    conn = connect(db_path)
    try:
        sql = "SELECT * FROM hypothesis_review WHERE 1=1"
        params: list[Any] = []
        if hypothesis_id is not None:
            sql += " AND hypothesis_id = ?"
            params.append(hypothesis_id)
        if start:
            sql += " AND review_date >= ?"
            params.append(start)
        if end:
            sql += " AND review_date <= ?"
            params.append(end)
        sql += " ORDER BY review_date, review_id"
        return [dict(r) for r in conn.execute(sql, params).fetchall()]
    finally:
        conn.close()


def load_registered_hypotheses(
    db_path: str | None,
    *,
    as_of_max: str | None = None,
) -> list[dict[str, Any]]:
    """Hypotheses registered on or before as_of_max (all statuses except superseded optional)."""
    init_db(db_path)
    conn = connect(db_path)
    try:
        if as_of_max:
            rows = conn.execute(
                """
                SELECT * FROM hypothesis
                WHERE as_of_date <= ?
                  AND status != 'superseded'
                ORDER BY as_of_date, hypothesis_id
                """,
                (as_of_max,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT * FROM hypothesis
                WHERE status != 'superseded'
                ORDER BY as_of_date, hypothesis_id
                """
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def build_compare_table(
    period_metrics: dict[str, dict[str, float]],
    ytd_metrics: dict[str, dict[str, float]] | None = None,
) -> list[dict]:
    ranking = rank_by_metric(period_metrics, "ret", ascending=False)
    rank_map = {c: i + 1 for i, c in enumerate(ranking)}
    rows = []
    for code, m in period_metrics.items():
        row = {
            "asset": code,
            "rank": rank_map.get(code),
            "ret": nan_to_none(m.get("ret", float("nan"))),
            "mdd": nan_to_none(m.get("mdd", float("nan"))),
            "vol": nan_to_none(m.get("vol", float("nan"))),
            "sharpe": nan_to_none(m.get("sharpe", float("nan"))),
        }
        if ytd_metrics and code in ytd_metrics:
            row["ytd"] = nan_to_none(ytd_metrics[code].get("ret", float("nan")))
        rows.append(row)
    rows.sort(key=lambda r: (r["rank"] is None, r["rank"] or 999))
    return rows


def default_compare_set() -> list[str]:
    return list(DEFAULT_COMPARE_SET)
