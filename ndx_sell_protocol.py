"""NDX売却プロトコル（SBI NASDAQ100・資金回収判断）。

利益最大化は目的ではない。
夏枯れ・調整前に利益を確保して撤退し、9〜10月の再投資資金を残す。

判定ロジックと表示は分離する。
AIは支援、最終判断はユーザー。
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
from typing import Any

import numpy as np
import pandas as pd
import requests
import yfinance as yf

from sox_utils import send_discord

# --- constants ---
PURCHASE_NAV = 10_000.0
PROFIT_LINE_PCT = 2.0
RSI_PERIOD = 14
RSI_OVERHEAT = 70.0
MACD_FAST = 12
MACD_SLOW = 26
MACD_SIGNAL = 9
MA_PERIOD = 20
NQ_GAPDOWN_PCT = -1.0
NDX_TICKER = "^NDX"
NQ_TICKER = "NQ=F"
SBI_FUND_CODE = "89311265"
SBI_FUND_URL = f"https://finance.yahoo.co.jp/quote/{SBI_FUND_CODE}"
PROTOCOL_VERSION = "2.0.0"


def _jst_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=9)


def resolve_phase(phase: str) -> str:
    if phase in ("am", "pm"):
        return phase
    # 14:00 JST 以降を午後
    return "pm" if _jst_now().hour >= 14 else "am"


def calculate_rsi(series: pd.Series, period: int = RSI_PERIOD) -> pd.Series:
    """RSI (Welles Wilder)."""
    delta = series.diff().values
    gain_raw = np.where(delta > 0, delta, 0.0)
    loss_raw = np.where(delta < 0, -delta, 0.0)
    gain = np.full(len(series), np.nan, dtype=float)
    loss = np.full(len(series), np.nan, dtype=float)
    gain[period] = np.mean(gain_raw[1 : period + 1])
    loss[period] = np.mean(loss_raw[1 : period + 1])
    for i in range(period + 1, len(series)):
        gain[i] = (gain[i - 1] * (period - 1) + gain_raw[i]) / period
        loss[i] = (loss[i - 1] * (period - 1) + loss_raw[i]) / period
    rs = gain / np.where(loss == 0, 1e-10, loss)
    rsi = 100 - (100 / (1 + rs))
    return pd.Series(rsi, index=series.index)


def calculate_macd(
    series: pd.Series,
    fast: int = MACD_FAST,
    slow: int = MACD_SLOW,
    signal: int = MACD_SIGNAL,
) -> tuple[pd.Series, pd.Series]:
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    macd_signal = macd.ewm(span=signal, adjust=False).mean()
    return macd, macd_signal


def fetch_sbi_nav() -> dict[str, Any]:
    """SBI NASDAQ100（89311265）最新基準価額を Yahoo!ファイナンスから取得。"""
    response = requests.get(
        SBI_FUND_URL,
        timeout=20,
        headers={"User-Agent": "Mozilla/5.0 (compatible; NDXSellProtocol/2.0)"},
    )
    response.raise_for_status()
    text = response.text

    m = re.search(
        r"PriceBoard__price__\w+\"[^>]*>.*?StyledNumber__value__\w+\">([0-9,]+)<",
        text,
        flags=re.S,
    )
    if not m:
        m = re.search(
            r"PriceBoard__priceBlock__\w+\"[^>]*>.*?StyledNumber__value__\w+\">([0-9,]+)<",
            text,
            flags=re.S,
        )
    if not m:
        raise RuntimeError("SBI基準価額を取得できませんでした")

    nav = float(m.group(1).replace(",", ""))
    if not (1_000 <= nav <= 100_000):
        raise RuntimeError(f"SBI基準価額が異常値です: {nav}")

    nav_date = None
    try:
        hist_resp = requests.get(
            f"{SBI_FUND_URL}/history",
            timeout=20,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NDXSellProtocol/2.0)"},
        )
        if hist_resp.ok:
            dm = re.search(
                r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})",
                hist_resp.text,
            )
            if dm:
                nav_date = f"{int(dm.group(1)):04d}-{int(dm.group(2)):02d}-{int(dm.group(3)):02d}"
    except requests.RequestException:
        pass
    if not nav_date:
        nav_date = _jst_now().date().isoformat()

    return {"nav": nav, "nav_date": nav_date, "source": SBI_FUND_URL}


def fetch_ndx_indicators() -> dict[str, Any]:
    hist = yf.Ticker(NDX_TICKER).history(period="1y")
    if hist.empty or len(hist) < max(MA_PERIOD, MACD_SLOW + MACD_SIGNAL) + 5:
        raise RuntimeError("NDXデータ不足")

    close = hist["Close"].astype(float)
    rsi = calculate_rsi(close, RSI_PERIOD)
    macd, signal = calculate_macd(close)
    ma20 = close.rolling(MA_PERIOD).mean()

    if pd.isna(rsi.iloc[-1]) or pd.isna(macd.iloc[-1]) or pd.isna(ma20.iloc[-1]):
        raise RuntimeError("テクニカル指標を計算できませんでした")

    prev_macd = float(macd.iloc[-2])
    prev_signal = float(signal.iloc[-2])
    cur_macd = float(macd.iloc[-1])
    cur_signal = float(signal.iloc[-1])
    dead_cross = (prev_macd > prev_signal) and (cur_macd <= cur_signal)

    return {
        "ndx_close": round(float(close.iloc[-1]), 2),
        "ndx_date": str(close.index[-1].date()),
        "rsi": round(float(rsi.iloc[-1]), 2),
        "macd": round(cur_macd, 4),
        "macd_signal": round(cur_signal, 4),
        "macd_dead_cross": bool(dead_cross),
        "ma20": round(float(ma20.iloc[-1]), 2),
    }


def fetch_nq_pct() -> float:
    hist = yf.Ticker(NQ_TICKER).history(period="5d")
    if hist.empty or len(hist) < 2:
        raise RuntimeError("NQ先物データ不足")
    prev = float(hist["Close"].iloc[-2])
    now = float(hist["Close"].iloc[-1])
    if prev == 0:
        raise RuntimeError("NQ先物前日終値が0です")
    return round(((now - prev) / prev) * 100.0, 2)


def purchase_ratio_pct(nav: float) -> float:
    return round((nav / PURCHASE_NAV - 1.0) * 100.0, 2)


def evaluate_morning_decision(snapshot: dict[str, Any]) -> tuple[str, str]:
    """Step1〜4の段階判定。表示用フラグとは独立。"""
    if snapshot["purchase_ratio_pct"] < PROFIT_LINE_PCT:
        return "HOLD", f"購入比{PROFIT_LINE_PCT:g}%未満"
    if snapshot["rsi"] < RSI_OVERHEAT:
        return "HOLD", f"RSI{RSI_OVERHEAT:g}未満"
    if not snapshot["macd_dead_cross"]:
        return "HOLD", "MACDデッドクロス未発生"
    if snapshot["ndx_close"] > snapshot["ma20"]:
        return "GO候補", "MA20維持中"
    return "GO", "MA20割れ（短期トレンド崩壊）"


def apply_nq_brake(morning_decision: str, nq_pct: float) -> tuple[str, str]:
    """ギャップダウン回避のみ。利益伸ばしには使わない。"""
    if nq_pct <= NQ_GAPDOWN_PCT:
        return "HOLD", f"NQ先物{nq_pct:+.2f}%≦{NQ_GAPDOWN_PCT:g}%（ギャップダウン回避）"
    return morning_decision, f"NQ先物{nq_pct:+.2f}%＞{NQ_GAPDOWN_PCT:g}%（朝判定維持）"


def collect_snapshot(*, include_nq: bool = True) -> dict[str, Any]:
    """全指標を取得・計算（表示用。段階判定で途中停止しても欠かさない）。"""
    sbi = fetch_sbi_nav()
    ndx = fetch_ndx_indicators()
    ratio = purchase_ratio_pct(sbi["nav"])
    nq_pct = fetch_nq_pct() if include_nq else None

    snap: dict[str, Any] = {
        "nav": sbi["nav"],
        "nav_date": sbi["nav_date"],
        "purchase_ratio_pct": ratio,
        "purchase_ok": ratio >= PROFIT_LINE_PCT,
        "ndx_close": ndx["ndx_close"],
        "ndx_date": ndx["ndx_date"],
        "rsi": ndx["rsi"],
        "rsi_ok": ndx["rsi"] >= RSI_OVERHEAT,
        "macd": ndx["macd"],
        "macd_signal": ndx["macd_signal"],
        "macd_dead_cross": ndx["macd_dead_cross"],
        "ma20": ndx["ma20"],
        "above_ma20": ndx["ndx_close"] > ndx["ma20"],
        "nq_pct": nq_pct,
        "nq_safe": (nq_pct is not None and nq_pct > NQ_GAPDOWN_PCT),
        "protocol_version": PROTOCOL_VERSION,
    }
    return snap


def build_view_model(phase: str) -> dict[str, Any]:
    """画面・Discord共通 ViewModel。状態ファイルは使わない。"""
    phase = resolve_phase(phase)
    snap = collect_snapshot(include_nq=True)
    morning_decision, morning_reason = evaluate_morning_decision(snap)

    view: dict[str, Any] = {
        **snap,
        "phase": phase,
        "morning_decision": morning_decision,
        "morning_reason": morning_reason,
    }

    if phase == "am":
        view["decision"] = morning_decision
        view["stop_reason"] = morning_reason
        view["final_decision"] = morning_decision
        view["reason"] = morning_reason
        view["nq_ok"] = snap["nq_safe"]
        view["nq_reason"] = "参考表示（08:30はNQ補正なし）"
    else:
        final, nq_reason = apply_nq_brake(morning_decision, float(snap["nq_pct"]))
        view["decision"] = final
        view["final_decision"] = final
        view["stop_reason"] = nq_reason if final == "HOLD" and morning_decision != "HOLD" else (
            morning_reason if final == "HOLD" else nq_reason
        )
        view["reason"] = nq_reason if final != morning_decision else (
            f"{morning_reason} / {nq_reason}"
        )
        view["nq_ok"] = snap["nq_safe"]
        view["nq_reason"] = nq_reason

    return view


def decision_title(decision: str) -> str:
    if decision == "GO":
        return "🟢 GO"
    if decision == "GO候補":
        return "🟡 GO候補"
    return "⚪ HOLD"


def _label_ok(ok: bool) -> str:
    return "OK" if ok else "NG"


def ma20_judgment_label(view: dict[str, Any]) -> str:
    """表示専用。MA20と GO / GO候補 の対応を明示する。"""
    if view.get("above_ma20"):
        return "維持（GO候補）"
    return "割れ（GO）"


def nq_judgment_label(view: dict[str, Any]) -> str:
    """表示専用。NQはギャップダウン回避（安全確認）であることを明示する。"""
    if view.get("nq_ok"):
        return "ブレーキ作動なし（朝判定維持）"
    return "ブレーキ作動（ギャップダウン回避→HOLD）"


def morning_reason_label(view: dict[str, Any]) -> str:
    """表示専用。朝の段階判定理由（NQ補正と混ぜない）。"""
    return str(
        view.get("morning_reason")
        or view.get("stop_reason")
        or "-"
    )


def format_report(view: dict[str, Any]) -> str:
    """コンソール／テキスト通知用。ViewModelのみ参照。"""
    phase = view.get("phase")
    if phase == "am":
        return _format_am(view)
    return _format_pm(view)


def _format_am(view: dict[str, Any]) -> str:
    decision = str(view.get("decision") or "HOLD")
    return f"""
━━━━━━━━━━━━━━━━━━━━━━
NDX日次ダッシュボード 08:30  {decision_title(decision)}
（売却指示ではありません）
━━━━━━━━━━━━━━━━━━━━━━
基準価額       : {view['nav']:,.0f} 円
基準価額日付   : {view['nav_date']}
購入比         : {view['purchase_ratio_pct']:+.2f}%
購入比判定     : {_label_ok(view['purchase_ok'])}（閾値 {PROFIT_LINE_PCT:g}%）
NASDAQ100終値  : {view['ndx_close']}
RSI            : {view['rsi']}
RSI判定        : {_label_ok(view['rsi_ok'])}（閾値 {RSI_OVERHEAT:g}）
MACD           : {view['macd']} / Signal {view['macd_signal']}
MACD判定       : {_label_ok(view['macd_dead_cross'])}（デッドクロス）
MA20           : {view['ma20']}
MA20判定       : {ma20_judgment_label(view)}

━━━━━━━━━━━━━━━━━━━━━━
総合判定 : {decision}
判定理由 : {morning_reason_label(view)}
━━━━━━━━━━━━━━━━━━━━━━
""".strip()


def _format_pm(view: dict[str, Any]) -> str:
    decision = str(view.get("final_decision") or view.get("decision") or "HOLD")
    return f"""
━━━━━━━━━━━━━━━━━━━━━━
NDX日次ダッシュボード 14:05  {decision_title(decision)}
（売却指示ではありません）
━━━━━━━━━━━━━━━━━━━━━━
朝判定（再計算）: {view.get('morning_decision')}
基準価額       : {view['nav']:,.0f} 円
基準価額日付   : {view['nav_date']}
購入比         : {view['purchase_ratio_pct']:+.2f}%
購入比判定     : {_label_ok(view['purchase_ok'])}（閾値 {PROFIT_LINE_PCT:g}%）
NASDAQ100終値  : {view['ndx_close']}
RSI            : {view['rsi']}
RSI判定        : {_label_ok(view['rsi_ok'])}（閾値 {RSI_OVERHEAT:g}）
MACD           : {view['macd']} / Signal {view['macd_signal']}
MACD判定       : {_label_ok(view['macd_dead_cross'])}（デッドクロス）
MA20           : {view['ma20']}
MA20判定       : {ma20_judgment_label(view)}
NQ先物         : {view['nq_pct']:+.2f}%
NQ判定         : {nq_judgment_label(view)}

━━━━━━━━━━━━━━━━━━━━━━
総合判定 : {decision}
判定理由 : {morning_reason_label(view)}
NQ補正   : {nq_judgment_label(view)}
━━━━━━━━━━━━━━━━━━━━━━
""".strip()


def format_discord_message(view: dict[str, Any]) -> str:
    """Webhook本文。画面表示と同一項目（同一 ViewModel）。毎日必ず送る。"""
    decision = str(view.get("final_decision") or view.get("decision") or "HOLD")
    title = decision_title(decision)
    is_pm = view.get("phase") == "pm"
    phase = "14:05" if is_pm else "08:30"
    lines = [
        f"**NDX日次ダッシュボード {phase}  {title}**",
        "売却指示ではありません。相場状態の確認用です。",
    ]
    if is_pm:
        lines.append(f"朝判定（再計算）: {view.get('morning_decision')}")
    lines.extend(
        [
            f"基準価額: {view['nav']:,.0f} 円",
            f"基準価額日付: {view['nav_date']}",
            f"購入比: {view['purchase_ratio_pct']:+.2f}%",
            f"購入比判定: {_label_ok(view['purchase_ok'])}（閾値 {PROFIT_LINE_PCT:g}%）",
            f"NASDAQ100終値: {view['ndx_close']}",
            f"RSI: {view['rsi']}",
            f"RSI判定: {_label_ok(view['rsi_ok'])}（閾値 {RSI_OVERHEAT:g}）",
            f"MACD: {view['macd']} / Signal {view['macd_signal']}",
            f"MACD判定: {_label_ok(view['macd_dead_cross'])}（デッドクロス）",
            f"MA20: {view['ma20']}",
            f"MA20判定: {ma20_judgment_label(view)}",
        ]
    )
    if is_pm:
        lines.append(f"NQ先物: {view['nq_pct']:+.2f}%")
        lines.append(f"NQ判定: {nq_judgment_label(view)}")
    lines.extend(
        [
            f"総合判定: {decision}",
            f"判定理由: {morning_reason_label(view)}",
        ]
    )
    if is_pm:
        lines.append(f"NQ補正: {nq_judgment_label(view)}")
    return "\n".join(lines)


def run_phase(
    phase: str,
    *,
    notify: bool = False,
    webhook: str | None = None,
) -> dict[str, Any]:
    view = build_view_model(phase)
    text = format_report(view)
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode("cp932", errors="replace").decode("cp932"))

    if notify:
        # HOLD / GO候補 / GO いずれも毎日通知（日次ダッシュボード）
        send_discord(format_discord_message(view), webhook_url=webhook)
    return view


def main() -> None:
    parser = argparse.ArgumentParser(
        description="NDX sell protocol v2 (capital recovery, not profit max)"
    )
    parser.add_argument(
        "--phase",
        choices=["am", "pm", "auto"],
        default="auto",
        help="am=08:30 / pm=14:05 / auto=JST",
    )
    parser.add_argument("--notify", action="store_true", help="Discord通知する")
    parser.add_argument("--webhook", default=None, help="Webhook URL")
    args = parser.parse_args()
    run_phase(args.phase, notify=args.notify, webhook=args.webhook)


if __name__ == "__main__":
    main()
