import os
import requests
import datetime
import yfinance as yf
import pandas as pd
import json

# ================================
# Discord通知（毅さん専用）
# ================================
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")

def send_discord(message: str):
    try:
        requests.post(DISCORD_WEBHOOK_URL, json={"content": message})
    except Exception as e:
        print("Discord送信エラー:", e)

# ================================
# 打席ログ
# ================================
LOG_FILE = "sox_batting_log.json"

def load_log():
    if not os.path.exists(LOG_FILE):
        return {"batting": [], "year": datetime.date.today().year}
    with open(LOG_FILE, "r") as f:
        return json.load(f)

def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=4)

def safe_float(x):
    if hasattr(x, "item"):
        return float(x.item())
    return float(x)

# ================================
# RSI計算
# ================================
def calc_RSI(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(period).mean()
    ma_down = down.rolling(period).mean()
    RS = ma_up / ma_down
    return 100 - (100 / (1 + RS))

# ================================
# 季節補正係数（自動生成）
# ================================
def generate_anomaly_factor():
    today = datetime.date.today()
    start = today - datetime.timedelta(days=365 * 20)
    df = yf.download("SOXX", start=start.strftime("%Y-%m-%d"), end=today.strftime("%Y-%m-%d"))
    df = df[["Close"]].dropna()
    df["date"] = df.index
    df["mmdd"] = df["date"].dt.strftime("%m-%d")
    df["year"] = df["date"].dt.year

    CYCLE_WINDOWS = {
        1: {"buy": ("02-10", "02-28"), "sell": ("04-01", "04-20")},
        2: {"buy": ("05-01", "05-31"), "sell": ("07-20", "07-31")},
        3: {"buy": ("08-25", "09-07"), "sell": ("09-10", "09-20")},
        4: {"buy": ("10-10", "10-20"), "sell": ("12-10", "12-20")},
    }

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

ANOMALY_FACTOR = generate_anomaly_factor()

# ================================
# サイクル判定
# ================================
CYCLE_WINDOWS = {
    1: {"name": "冬春（納税・還付金）", "buy": ("02-10", "02-28"), "sell": ("04-01", "04-20")},
    2: {"name": "Sell in May", "buy": ("05-01", "05-31"), "sell": ("07-20", "07-31")},
    3: {"name": "夏秋（ジャクソンホール）", "buy": ("08-25", "09-07"), "sell": ("09-10", "09-20")},
    4: {"name": "秋冬（決算・年末ラリー）", "buy": ("10-10", "10-20"), "sell": ("12-10", "12-20")},
}

def detect_cycle(today_mmdd):
    for cycle_id, win in CYCLE_WINDOWS.items():
        buy_start, buy_end = win["buy"]
        sell_start, sell_end = win["sell"]
        if buy_start <= today_mmdd <= buy_end:
            return cycle_id, win["name"], "買場帯"
        if sell_start <= today_mmdd <= sell_end:
            return cycle_id, win["name"], "売場帯"
    return None, "サイクル外", "サイクル外"

# ================================
# メインロジック（完全自動版）
# ================================
def execute_sox_protocol():

    SOX_MOTOMOTO = int(os.getenv("SOX_MOTOMOTO"))
    SOX_HYOKA = int(os.getenv("SOX_HYOKA"))

    soxx = yf.Ticker("SOXX")
    hist = soxx.history(period="5d")
    SOX_TODAY = int(hist["Close"].dropna().iloc[-1])

    today = datetime.date.today()
    today_mmdd = today.strftime("%m-%d")

    CURRENT_CYCLE, cycle_name, cycle_phase = detect_cycle(today_mmdd)

    # 季節サイクル別の売り買いライン（毅さん最終版）
    BUY_DROP_RATE = {
        1: -0.05,
        2: -0.07,
        3: -0.05,
        4: -0.09,
        5: -0.06,
        6: -0.05,
    }

    SELL_RISE_RATE = {
        1: 0.08,
        2: 0.07,
        3: 0.05,
        4: 0.09,
        5: 0.06,
        6: 0.05,
    }

    buy_line = BUY_DROP_RATE.get(CURRENT_CYCLE, -0.06)
    sell_line = SELL_RISE_RATE.get(CURRENT_CYCLE, 0.06)

    log = load_log()
    if log["year"] != today.year:
        log = {"batting": [], "year": today.year}

    batting_count = len(log["batting"])
    anomaly_factor = ANOMALY_FACTOR.get(CURRENT_CYCLE, 1.0)

    sox = yf.download("^SOX", period="180d", interval="1d", auto_adjust=False)["Close"]
    vix = yf.download("^VIX", period="30d", interval="1d", auto_adjust=False)["Close"]
    sox_f = yf.download("SOX=F", period="5d", interval="1h", auto_adjust=False)["Close"]
    nasdaq = yf.download("^IXIC", period="5d", interval="1d", auto_adjust=False)["Close"]
    nasdaq_f = yf.download("NQ=F", period="5d", interval="1h", auto_adjust=False)["Close"]
    jpy = yf.download("JPY=X", period="5d", interval="1h", auto_adjust=False)["Close"]

    SOX_INDEX = safe_float(sox.iloc[-1])
    MA5 = safe_float(sox.rolling(5).mean().iloc[-1])
    MA25 = safe_float(sox.rolling(25).mean().iloc[-1])
    RSI_14 = safe_float(calc_RSI(sox).iloc[-1])

    weekly = sox.iloc[::5]
    WMA5 = safe_float(weekly.rolling(5).mean().iloc[-1])
    WMA25 = safe_float(weekly.rolling(25).mean().iloc[-1])
    weekly_gc = (WMA5 > WMA25)

    SOX_F = safe_float(sox_f.iloc[-1])
    NASDAQ_SPOT = safe_float(nasdaq.iloc[-1])
    NASDAQ_F = safe_float(nasdaq_f.iloc[-1])
    JPY = safe_float(jpy.iloc[-1])
    JPY_prev = safe_float(jpy.iloc[-2])
    VIX = safe_float(vix.iloc[-1])

    sox_f_move = (SOX_F - SOX_INDEX) / SOX_INDEX * 100
    nasdaq_f_move = (NASDAQ_F - NASDAQ_SPOT) / NASDAQ_SPOT * 100
    jpy_move = (JPY - JPY_prev) / JPY_prev * 100

    pm_overheat = (sox_f_move >= 1.5 or nasdaq_f_move >= 1.0)
    crash_zone = VIX > 20

    KOSU = SOX_HYOKA / SOX_MOTOMOTO
    SOX_OVERPRICE_LINE = SOX_MOTOMOTO * 1.15
    REAL_OVERPRICE_LINE = SOX_OVERPRICE_LINE * KOSU
    is_overpriced = SOX_HYOKA > REAL_OVERPRICE_LINE

    SOX_MOVE_RATE = (SOX_HYOKA - SOX_MOTOMOTO) / SOX_MOTOMOTO

    # 季節サイクル別の買い・売り判定
    is_my_bottom = SOX_MOVE_RATE <= buy_line
    is_my_takeprofit = SOX_MOVE_RATE >= sell_line

    is_market_bottom = (
        RSI_14 <= 45 and
        SOX_INDEX <= MA25 * 0.97 and
        MA5 < MA25 and
        weekly_gc
    )

    rebound_expect = ((MA25 - SOX_INDEX) / SOX_INDEX) * anomaly_factor * 100

    # 季節サイクル売り判定
    if is_my_takeprofit:
        return "💰【利確GO】季節サイクル売りライン突破。即利確圏。"

    # ===== 最終判定 =====
    if crash_zone and is_my_bottom and not is_overpriced:
        result = "🟣【暴落ゾーン買い】反発期待値高い。"

    # ===== あなたSOXの変動率（％） =====
sox_change = (SOX_HYOKA - SOX_MOTOMOTO) / SOX_MOTOMOTO * 100

sox_buy_zone = sox_change <= -10      # -10%以下 → 買い場帯
sox_sell_zone = sox_change >= 10      # +10%以上 → 売り場帯

# ===== 買い判定 =====
if market_bottom and sox_buy_zone:
    decision = "🔥【買いGO】市場底 × あなたSOX底"
elif sox_buy_zone:
    decision = "🔵【買い準備】あなたSOXが買い場帯"
elif day_dc:
    decision = "⚠️【買い弱化】日足DC。静観。"
else:
    decision = "➔【静観】買いライン未達"

# ===== 売り判定 =====
if sox_sell_zone:
    decision_sell = "💰【利確GO】あなたSOXが売り場帯"

elif is_overpriced:
    result = "⚠ [買い見送り] 割高ライン超え。静観。"
        result = "🔥【買いGO強化】反発10％ゾーン。（打席記録済み）"
    elif MA5 < MA25:
        result = "⚠️【買い弱化】日足DC。静観。"
    elif is_overpriced:
        result = "⚠️【買い見送り】割高ライン超え。静観。"
    else:
        result = "➔【静観】まだ買いラインに未達。"

    # ===== 基準比較 =====
    base_diff_today = SOX_TODAY - SOX_MOTOMOTO
    base_diff_index = SOX_INDEX - SOX_MOTOMOTO
    base_diff_hyoka = SOX_HYOKA - SOX_MOTOMOTO

        # ===== 根拠数字まとめ（読みやすいフォーマット） =====
    pos_diff = SOX_HYOKA - SOX_MOTOMOTO          # 評価額差（あなたのポジション）
    index_diff = SOX_INDEX - SOX_MOTOMOTO        # 指数との差（市場との乖離）

details = f"""
【ポジション比較】
評価額差: {round(pos_diff)}
指数差: {round(index_diff)}
あなたSOX変動率: {round(sox_change, 2)}%

【根拠】
SOX: {round(SOX_INDEX, 2)}
MA5/25: {round(MA5, 2)} / {round(MA25, 2)}
RSI14: {round(RSI_14, 2)}
SOX先物: {round(SOX_F, 2)} ({round(sox_f_move, 2)}%)
NQ先物: {round(NASDAQ_F, 2)} ({round(nasdaq_f_move, 2)}%)
VIX: {round(VIX, 2)}
JPY: {round(JPY, 2)} ({round(jpy_move, 2)}%)
反発期待: {round(rebound_expect, 2)}%
割高ライン: {round(REAL_OVERPRICE_LINE, 2)}
"""


    return result + "\n" + details

# ================================
# 実行
# ================================
message = execute_sox_protocol()
print(message)
send_discord(message)
