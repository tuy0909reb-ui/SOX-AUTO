import pandas as pd
import pytz
import requests
from datetime import datetime

from sox_utils import fetch_with_retry, safe_float, send_discord

# ============================
#  TSMC YoY（壊れない自動計算版）
# ============================
def get_tsmc_yoy_pct():
    try:
        url = "https://www.tsmc.com/api/monthly-revenues"
        res = requests.get(url, timeout=10)
        if res.status_code != 200:
            return None

        data = res.json()["data"]

        latest = data[-1]
        latest_month = latest["Month"]
        latest_year = latest["Year"]
        latest_revenue = float(latest["Revenue"])

        prev_year = latest_year - 1
        prev = next((x for x in data if x["Year"] == prev_year and x["Month"] == latest_month), None)
        if prev is None:
            return None

        prev_revenue = float(prev["Revenue"])
        yoy = (latest_revenue - prev_revenue) / prev_revenue * 100
        return round(yoy, 2)

    except Exception:
        return None

# ============================
#  WSTS（壊れない CSV 版）
# ============================
def get_wsts_status():
    try:
        url = "https://www.wsts.org/Portals/0/Monthly-Semiconductor-Sales.csv"
        df = pd.read_csv(url)

        df = df.tail(4)
        df["MoM"] = df["Sales"].pct_change() * 100
        last3 = df["MoM"].tail(3)

        return all(x < 0 for x in last3)

    except Exception:
        return None

# ============================
#  数値チェック
# ============================
def _is_valid_numeric(value):
    if value is None:
        return False
    try:
        float(value)
        return True
    except:
        return False

def _format_numeric(value, decimals=2):
    if not _is_valid_numeric(value):
        return "N/A"
    value = float(value)
    if decimals == 0:
        return f"{int(round(value)):,}"
    return f"{round(value, decimals):,}"

# ============================
#  SOXデータ
# ============================
def get_silicon_cycle_data():
    empty_data = {
        "SOX_HIGH": None,
        "SOX_CLOSE": None,
        "200MA_NOW": None,
        "200MA_TREND": None,
    }

    try:
        hist = fetch_with_retry("^SOX", period="2y", auto_adjust=False)
        if len(hist) < 200:
            return empty_data

        close = hist["Close"]
        ma_200 = close.rolling(window=200).mean()
        ma_now = safe_float(ma_200.iloc[-1])
        ma_prev_index = -20 if len(hist) > 220 else -1
        ma_prev = safe_float(ma_200.iloc[ma_prev_index])

        return {
            "SOX_HIGH": safe_float(hist["High"].tail(250).max()),
            "SOX_CLOSE": safe_float(close.iloc[-1]),
            "200MA_NOW": ma_now,
            "200MA_TREND": ma_now - ma_prev,
        }
    except Exception:
        return empty_data

# ============================
#  防衛プロトコル本体
# ============================
def execute_silicon_protocol_v10():
    WSTS_3M_MINUS = get_wsts_status()
    TSMC_YOY_PCT = get_tsmc_yoy_pct()
    m_data = get_silicon_cycle_data()

    data_error = False
    if not _is_valid_numeric(m_data.get("SOX_HIGH")): data_error = True
    if not _is_valid_numeric(m_data.get("SOX_CLOSE")): data_error = True
    if not _is_valid_numeric(m_data.get("200MA_NOW")): data_error = True
    if not _is_valid_numeric(m_data.get("200MA_TREND")): data_error = True
    if not _is_valid_numeric(TSMC_YOY_PCT): data_error = True
    if WSTS_3M_MINUS is None: data_error = True

    if not data_error:
        sox_drop = round((m_data["SOX_HIGH"] - m_data["SOX_CLOSE"]) / m_data["SOX_HIGH"] * 100, 2)
        sensor_1 = "🔴" if WSTS_3M_MINUS else "🟢"
        sensor_2 = "🔴" if TSMC_YOY_PCT < 10.0 else "🟢"
        is_below_200ma = m_data["SOX_CLOSE"] < m_data["200MA_NOW"]
        is_downward_trend = m_data["200MA_TREND"] < 0
        sensor_3 = "🔴" if (is_below_200ma and is_downward_trend) else "🟢"
    else:
        sox_drop = None
        sensor_1 = sensor_2 = sensor_3 = "DATA-ERROR"

    jst = pytz.timezone('Asia/Tokyo')
    now_jst = datetime.now(jst)
    time_str = now_jst.strftime('%Y-%m-%d %H:%M:%S')

    output = f"""
================================================================================
👑【プロトコルVer.10.0】防衛プロトコル判定結果
実行時刻(JST): {time_str}
================================================================================
SOX最高値: {_format_numeric(m_data.get('SOX_HIGH'), 0)}
SOX終値  : {_format_numeric(m_data.get('SOX_CLOSE'), 0)}
200MA    : {_format_numeric(m_data.get('200MA_NOW'), 2)}

WSTS     : {sensor_1}
TSMC YoY : {sensor_2}
200MA判定: {sensor_3}

最終フェーズ: {"DATA-ERROR" if data_error else "正常判定"}
================================================================================
"""
    print(output)
    send_discord(output)

# ============================
#  MAIN（必ず最下部）
# ============================
if __name__ == "__main__":
    execute_silicon_protocol_v10()
