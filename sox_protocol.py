def execute_sox_protocol():

    SOX_MOTOMOTO = int(os.getenv("SOX_MOTOMOTO"))
    SOX_HYOKA = int(os.getenv("SOX_HYOKA"))

    soxx = yf.Ticker("SOXX")
    hist = soxx.history(period="5d")
    SOX_TODAY = int(hist["Close"].dropna().iloc[-1])

    today = datetime.date.today()
    today_mmdd = today.strftime("%m-%d")

    CURRENT_CYCLE, cycle_name, cycle_phase = detect_cycle(today_mmdd)

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

    is_my_bottom = SOX_MOVE_RATE <= buy_line
    is_my_takeprofit = SOX_MOVE_RATE >= sell_line

    is_market_bottom = (
        RSI_14 <= 45 and
        SOX_INDEX <= MA25 * 0.97 and
        MA5 < MA25 and
        weekly_gc
    )

    rebound_expect = ((MA25 - SOX_INDEX) / SOX_INDEX) * anomaly_factor * 100

    if is_my_takeprofit:
        return "💰【利確GO】季節サイクル売りライン突破。即利確圏。"

    # あなたSOXの変動率
    sox_change = (SOX_HYOKA - SOX_MOTOMOTO) / SOX_MOTOMOTO * 100
    sox_buy_zone = sox_change <= -10
    sox_sell_zone = sox_change >= 10

    day_dc = MA5 < MA25

    # 判定メッセージ
    if crash_zone and is_my_bottom and not is_overpriced:
        result = "🟣【暴落ゾーン買い】反発期待値高い。"
    elif sox_sell_zone:
        result = "💰【利確GO】あなたSOXが売り場帯"
    elif is_overpriced:
        result = "⚠️【買い見送り】割高ライン超え。静観。"
    elif market_bottom and sox_buy_zone:
        result = "🔥【買いGO】市場底 × あなたSOX底"
    elif sox_buy_zone:
        result = "🔵【買い準備】あなたSOXが買い場帯"
    elif day_dc:
        result = "⚠️【買い弱化】日足Dc。静観。"
    else:
        result = "➔【静観】まだ買いラインに未達。"

    # 基準比較
    base_diff_today = SOX_TODAY - SOX_MOTOMOTO
    base_diff_index = SOX_INDEX - SOX_MOTOMOTO
    base_diff_hyoka = SOX_HYOKA - SOX_MOTOMOTO

    pos_diff = SOX_HYOKA - SOX_MOTOMOTO
    index_diff = SOX_INDEX - SOX_MOTOMOTO

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
