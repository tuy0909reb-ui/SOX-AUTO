import os
import requests
import datetime
import yfinance as yf
import json
from sox_utils import get_env_float, fetch_with_retry, safe_float, calc_RSI

# ================================
# Discord通知
# ================================
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL")


def send_discord(message: str):
    if not DISCORD_WEBHOOK_URL:
        print("Discord Webhook URL未設定のため送信をスキップ")
        return
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


MORNING_INPUT_FILE = "morning_input.json"


def save_morning_input(sox_index, sox_futures):
    payload = {
        "SOX_TODAY": sox_index,
        "SOX_F": sox_futures,
        "date": datetime.date.today().isoformat(),
    }
    with open(MORNING_INPUT_FILE, "w") as f:
        json.dump(payload, f, indent=2)

# ANOMALY_FACTOR removed — weekly phase used instead

# ================================
# 週次アノマリー定義（WEEK_ANOMALY）
# キー: ISO週番号 (1-53), 値: 調整係数（買い閾値の微調整に使う）
# 例: 0.9 は買い基準を緩和（より買いやすく）、1.1 は引き締め
WEEK_ANOMALY = {
    9:  "BUY", 13: "BUY", 14: "BUY",
    20: "BUY", 21: "SELL",
    25: "BUY", 27: "SELL",
    30: "BUY", 31: "BUY", 32: "BUY", 33: "BUY",
    34: "SELL", 35: "SELL",
    36: "BUY", 37: "SELL",
    39: "BUY", 40: "SELL",
    41: "BUY", 42: "BUY", 43: "BUY",
    48: "SELL", 49: "SELL",
    50: "BUY", 51: "SELL",
}

# ================================
# メインロジック
# ================================
def execute_sox_protocol():

    SOX_MOTOMOTO = get_env_float("SOX_MOTOMOTO")
    SOX_HYOKA = get_env_float("SOX_HYOKA")

    soxx = yf.Ticker("SOXX")
    hist = soxx.history(period="5d")
    SOX_TODAY = safe_float(hist["Close"].dropna().iloc[-1])

    # fallback to prompt when env vars are not set
    if SOX_MOTOMOTO is None or SOX_HYOKA is None:
        try:
            SOX_MOTOMOTO = float(input("② あなたのSOX取得単価: "))
            SOX_HYOKA = float(input("③ あなたのSOX現在評価額: "))
        except Exception:
            raise RuntimeError("SOX_MOTOMOTO/SOX_HYOKA が設定されていません。")

    today = datetime.date.today()
    week_no = datetime.date.today().isocalendar().week


    # ベースライン（週次アノマリーで微調整）
    BASE_BUY_DROP = -0.06
    BASE_SELL_RISE = 0.06

    # 週次アノマリーは BUY/SELL のフラグマップを想定
    week_phase = WEEK_ANOMALY.get(week_no, "HOLD")

    if week_phase == "BUY":
        buy_line = -0.10
        sell_line = 0.08
    elif week_phase == "SELL":
        buy_line = -0.06
        sell_line = 0.10
    else:
        buy_line = -0.08
        sell_line = 0.08

    log = load_log()
    if log["year"] != today.year:
        log = {"batting": [], "year": today.year}

    # 週フラグに応じて反発期待の補正係数を決定
    if week_phase == "BUY":
        anomaly_factor = 0.95
    elif week_phase == "SELL":
        anomaly_factor = 1.05
    else:
        anomaly_factor = 1.0

    sox = fetch_with_retry("^SOX", period="180d", interval="1d", auto_adjust=False)["Close"]
    vix = fetch_with_retry("^VIX", period="30d", interval="1d", auto_adjust=False)["Close"]
    sox_f = fetch_with_retry("SOX=F", period="5d", interval="1h", auto_adjust=False)["Close"]
    nasdaq = fetch_with_retry("^IXIC", period="5d", interval="1d", auto_adjust=False)["Close"]
    nasdaq_f = fetch_with_retry("NQ=F", period="5d", interval="1h", auto_adjust=False)["Close"]
    jpy = fetch_with_retry("JPY=X", period="5d", interval="1h", auto_adjust=False)["Close"]

    SOX_INDEX = safe_float(sox.iloc[-1])
    MA5 = safe_float(sox.rolling(5).mean().iloc[-1])
    MA25 = safe_float(sox.rolling(25).mean().iloc[-1])
    RSI_14 = safe_float(calc_RSI(sox).iloc[-1])

    # use proper weekly resample (Friday close) for weekly moving averages
    try:
        weekly = sox.resample('W-FRI').last().dropna()
    except Exception:
        weekly = sox.iloc[::5]

    WMA5 = safe_float(weekly.rolling(5).mean().iloc[-1])
    WMA25 = safe_float(weekly.rolling(25).mean().iloc[-1])
    weekly_gc = (WMA5 > WMA25)

    # 短期の急落/急騰イベントや平均・中央値の反転検出
    recent_returns = sox.pct_change().dropna()
    max_down_event = False
    max_up_event = False
    mean_median_reverse = False
    try:
        if len(recent_returns) >= 3:
            max_down_event = recent_returns.tail(3).min() <= -0.03
            max_up_event = recent_returns.tail(3).max() >= 0.03
        last5 = sox.tail(5)
        mean5 = last5.mean()
        median5 = last5.median()
        mean_median_reverse = (mean5 < median5) and (sox.iloc[-1] > mean5)
    except Exception:
        max_down_event = False
        max_up_event = False
        mean_median_reverse = False

    SOX_F = safe_float(sox_f.iloc[-1])
    NASDAQ_SPOT = safe_float(nasdaq.iloc[-1])
    NASDAQ_F = safe_float(nasdaq_f.iloc[-1])
    JPY = safe_float(jpy.iloc[-1])
    JPY_prev = safe_float(jpy.iloc[-2])
    VIX = safe_float(vix.iloc[-1])

    save_morning_input(SOX_INDEX, SOX_F)

    # フラグ収集
    flags = []
    if VIX is not None and VIX > 20:
        flags.append("VIX高騰")

    if max_down_event:
        flags.append("イベント底")

    if max_up_event:
        flags.append("イベント天井")

    if mean_median_reverse:
        flags.append("風向き変化")

    if weekly_gc:
        flags.append("週足GC")

    sox_f_move = (SOX_F - SOX_INDEX) / SOX_INDEX * 100
    nasdaq_f_move = (NASDAQ_F - NASDAQ_SPOT) / NASDAQ_SPOT * 100
    jpy_move = (JPY - JPY_prev) / JPY_prev * 100

    crash_zone = VIX > 20

    KOSU = SOX_HYOKA / SOX_MOTOMOTO
    SOX_OVERPRICE_LINE = SOX_MOTOMOTO * 1.15
    REAL_OVERPRICE_LINE = SOX_OVERPRICE_LINE * KOSU
    is_overpriced = SOX_HYOKA > REAL_OVERPRICE_LINE

    SOX_MOVE_RATE = (SOX_HYOKA - SOX_MOTOMOTO) / SOX_MOTOMOTO

    is_my_bottom = SOX_MOVE_RATE <= buy_line
    is_my_takeprofit = SOX_MOVE_RATE >= sell_line

    is_market_bottom = (
        RSI_14 <= 45 and
        SOX_INDEX <= MA25 * 0.97 and
        MA5 < MA25 and
        weekly_gc
    )

    rebound_expect = ((MA25 - SOX_INDEX) / SOX_INDEX) * anomaly_factor * 100

    # まず最優先: 毎日1000円SOXの強制判定（±15％）と通常判定（±10％）
    sox_change = (SOX_HYOKA - SOX_MOTOMOTO) / SOX_MOTOMOTO * 100

    strong_buy_zone  = sox_change <= -15
    normal_buy_zone  = sox_change <= -10
    strong_sell_zone = sox_change >= 15
    normal_sell_zone = sox_change >= 10

    if strong_buy_zone:
        result = "🔥【1000円SOX 強買い】評価額が-15%以下。最優先で買い検討。"
        return result + "\n" + f"SOX変動率: {round(sox_change,2)}%"
    if strong_sell_zone:
        result = "💰【1000円SOX 強利確】評価額が+15%以上。最優先で利確検討。"
        return result + "\n" + f"SOX変動率: {round(sox_change,2)}%"

    day_dc = MA5 < MA25

    # イベントトリガーをフラグ化（補強要素）
    pm_overheat = (
        ((SOX_F - SOX_INDEX) / SOX_INDEX * 100) >= 1.5 or
        ((NASDAQ_F - NASDAQ_SPOT) / NASDAQ_SPOT * 100) >= 1.0
    )

    event_flags = {
        "crash_zone": crash_zone,
        "pm_overheat": pm_overheat,
        "market_bottom": is_market_bottom,
    }

    # イベント層判定（1000円SOXがなければ次にイベントで補強）
    if event_flags["crash_zone"] and is_my_bottom and not is_overpriced:
        result = "🟣【イベント補強買い】暴落ゾーンかつあなた底。反発期待。"
        return result

    if event_flags["pm_overheat"] and normal_sell_zone:
        result = "⚠️【イベント補強売り】PM過熱 + あなた売り圏。利確検討。"
        return result

    # 最終判定（優先順: 強利確 → 利確 → 強買い → 買い → 週次補強 → 静観）
    if strong_sell_zone:
        result = "💰【強利確GO】あなたSOX +15%超え。最優先で利確。"
    elif normal_sell_zone:
        result = "💰【利確GO】あなたSOX +10%圏。売り場帯。"
    elif strong_buy_zone and not is_overpriced:
        result = "🔥【強買いGO】あなたSOX -15%超え。最優先で買い。"
    elif normal_buy_zone and not is_overpriced:
        result = "🔵【買いGO】あなたSOX -10%圏。買い場帯。"
    elif week_phase == "BUY" and not is_overpriced:
        result = "🔵【買い補強】週次アノマリーBUY週。"
    elif week_phase == "SELL":
        result = "💰【売り補強】週次アノマリーSELL週。"
    else:
        result = "➔【静観】まだ買いラインに未達。"

    pos_diff = SOX_HYOKA - SOX_MOTOMOTO
    index_diff = SOX_INDEX - SOX_MOTOMOTO

    # トレンド矛盾の自動検知（日足下落 + 週足GC）
    trend_contradiction = (day_dc and weekly_gc)  # MA5 < MA25 かつ 週足GC
    
    # RSI14 の注記テキスト生成
    rsi_note = ""
    if RSI_14 <= 40:
        rsi_note = "（短期売られすぎ）"
    elif RSI_14 >= 70:
        rsi_note = "（短期過熱）"
    
    # VIX の警告テキスト生成
    vix_note = ""
    if VIX >= 20:
        vix_note = "⚠️（マクロセンチメント警戒）"

    details = f"""
【ポジション比較】
評価額差: {round(pos_diff)}
指数差: {round(index_diff)}
あなたSOX変動率: {round(sox_change, 2)}%

【根拠】
SOX: {round(SOX_INDEX, 2)}
MA5/25: {round(MA5, 2)} / {round(MA25, 2)}
RSI14: {round(RSI_14, 2)}{rsi_note}
SOX先物: {round(SOX_F, 2)} ({round(sox_f_move, 2)}%)
NQ先物: {round(NASDAQ_F, 2)} ({round(nasdaq_f_move, 2)}%)
VIX: {round(VIX, 2)}{vix_note}
JPY: {round(JPY, 2)} ({round(jpy_move, 2)}%)
反発期待: {round(rebound_expect, 2)}%
割高ライン: {round(REAL_OVERPRICE_LINE, 2)}
"""

    # トレンド矛盾の自動解説を追加
    if trend_contradiction:
        details += "\n※長期上昇トレンド中の一時的な押し目（絶好の爆撃チャンス）と断定。狼狽売りは厳禁。"

    if flags:
        details += "\n【補助シグナル】" + " / ".join(flags)

    return result + "\n" + details

# ================================
# 実行
# ================================
if __name__ == "__main__":
    message = execute_sox_protocol()
    print(message)
    send_discord(message)