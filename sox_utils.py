import os
import time
import requests
import yfinance as yf
import pandas as pd


def get_env_float(name):
    val = os.getenv(name)
    if val is None:
        return None
    try:
        return float(val)
    except Exception:
        try:
            return float(val.replace(",", ""))
        except Exception:
            return None


def send_discord(message: str, webhook_url=None, timeout=10):
    """Send a Discord notification when a webhook is configured."""
    url = webhook_url or os.getenv("DISCORD_WEBHOOK_URL")
    if not url:
        print("Discord Webhook URL未設定のため送信をスキップ")
        return False

    try:
        response = requests.post(url, json={"content": message}, timeout=timeout)
        response.raise_for_status()
        return True
    except requests.RequestException as exc:
        print("Discord送信エラー:", exc)
        return False


def fetch_with_retry(ticker, attempts=3, delay=1, **kwargs):
    """Fetch OHLCV via Ticker.history (avoids yf.download MultiIndex columns)."""
    if attempts < 1:
        raise ValueError("attempts must be at least 1")

    last_exc = None
    history_kwargs = {}
    for key in ("period", "interval", "start", "end", "auto_adjust", "prepost"):
        if key in kwargs:
            history_kwargs[key] = kwargs[key]
    if "auto_adjust" not in history_kwargs:
        history_kwargs["auto_adjust"] = False

    for i in range(attempts):
        try:
            df = yf.Ticker(ticker).history(**history_kwargs)
            if df is None or df.empty:
                raise ValueError(f"No data returned for {ticker}")
            return df
        except Exception as e:
            last_exc = e
            if i < attempts - 1:
                time.sleep(delay * (i + 1))
    raise last_exc


def safe_float(x):
    if hasattr(x, "item"):
        return float(x.item())
    return float(x)


def calc_RSI(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(period).mean()
    ma_down = down.rolling(period).mean()
    RS = ma_up / ma_down
    return 100 - (100 / (1 + RS))


# 年4回の季節サイクル窓（generate_anomaly_factor / バックテスト共通）
CYCLE_WINDOWS = {
    1: {"buy": ("02-10", "02-28"), "sell": ("04-01", "04-20")},
    2: {"buy": ("05-01", "05-31"), "sell": ("07-20", "07-31")},
    3: {"buy": ("08-25", "09-07"), "sell": ("09-10", "09-20")},
    4: {"buy": ("10-10", "10-20"), "sell": ("12-10", "12-20")},
}


def generate_anomaly_factor():
    today = pd.Timestamp.today().date()
    start = today - pd.Timedelta(days=365 * 20)

    df = fetch_with_retry("SOXX", start=start.strftime("%Y-%m-%d"), end=today.strftime("%Y-%m-%d"))
    df = df[["Close"]].dropna()

    df = df.copy()
    df["date"] = df.index
    df["mmdd"] = df["date"].dt.strftime("%m-%d")
    df["year"] = df["date"].dt.year

    anomaly_factor = {}

    for cycle_id, win in CYCLE_WINDOWS.items():
        buy_start, buy_end = win["buy"]
        sell_start, sell_end = win["sell"]

        buy_drops = []
        sell_rises = []

        for year in df["year"].unique():
            buy_df = df[(df["year"] == year) & (df["mmdd"] >= buy_start) & (df["mmdd"] <= buy_end)]
            if len(buy_df) > 1:
                start_price = safe_float(buy_df.iloc[0]["Close"])
                end_price = safe_float(buy_df.iloc[-1]["Close"])
                buy_drops.append((end_price - start_price) / start_price)

            sell_df = df[(df["year"] == year) & (df["mmdd"] >= sell_start) & (df["mmdd"] <= sell_end)]
            if len(sell_df) > 1:
                start_price = safe_float(sell_df.iloc[0]["Close"])
                end_price = safe_float(sell_df.iloc[-1]["Close"])
                sell_rises.append((end_price - start_price) / start_price)

        buy_exp = sum(buy_drops) / len(buy_drops) if buy_drops else 0
        factor = 1 - buy_exp * 10
        factor = max(0.50, min(1.50, factor))
        anomaly_factor[cycle_id] = round(factor, 2)

    return anomaly_factor
