"""Discord digest formatting for silicon-cycle watch (materials only)."""

from __future__ import annotations

from typing import Any, Optional


def _fmt_pct(x: Optional[float], *, already_pct: bool = False) -> str:
    if x is None:
        return "—"
    v = float(x) if already_pct else float(x) * 100.0
    return f"{v:.2f}%"


def format_watch_message(
    materials: dict[str, Any],
    *,
    mode: str,
    plan_year: int,
    why: str,
) -> str:
    price = materials.get("price") or {}
    watch = materials.get("watch_hint") or {}
    legacy = materials.get("legacy_compat") or {}
    lights = legacy.get("sensor_lights") or {}
    gaps = materials.get("data_gaps") or []
    reasons = watch.get("reasons") or []

    rel3 = next(
        (r for r in (price.get("vs_sp500") or []) if r.get("months") == 3),
        None,
    )
    vs3 = _fmt_pct(rel3.get("vs_sp500") if rel3 else None)

    lines = [
        "【シリコンサイクル監視】材料ダイジェスト",
        "",
        f"今見る理由: {why}",
        f"モード: {mode}（F2: 頻度は常に月次 / elevatedは文面フラグ）",
        f"as_of: {materials.get('as_of')}",
        "",
        "材料サマリ:",
        f"- SOX終値: {price.get('sox_close', '—')} / 200DMA: {price.get('ma200', '—')}",
        f"- 高値からの下落率: {_fmt_pct(price.get('drop_from_high_pct'), already_pct=True)} "
        f"（参考水準 -{price.get('reference_drop_pct', price.get('defense_exit_threshold_pct', 25))}% "
        f"/ 旧防衛由来・未再検証・自動売却なし）",
        f"- 12M分位: {price.get('percentile_12m', '—')}",
        f"- vs S&P 3M超過: {vs3}",
        f"- ファンダ生数値: WSTS_3m_minus={legacy.get('wsts_3m_minus')} "
        f"TSMC_YoY%={legacy.get('tsmc_yoy_pct')} "
        f"MA記述={lights.get('ma200', 'N/A')}",
        f"- elevatedフラグ: {'YES' if watch.get('elevated') else 'NO'}"
        + (f" ({', '.join(reasons)})" if reasons else "")
        + "（頻度は月次固定）",
        "",
        f"年次③との関係: NISA {plan_year} の買い方（年初一括／再設計）確認材料。"
        " 商品入替・発注ではない。",
        "",
        "データ欠落: " + (", ".join(gaps) if gaps else "なし"),
        "",
        "材料のみ。推奨・自動入替・発注なし。",
    ]
    return "\n".join(lines)
