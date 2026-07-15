import json
import os
import datetime
from sox_utils import fetch_with_retry, safe_float, send_discord

MORNING_INPUT_FILE = "morning_input.json"


def load_sox_today():
    """午前基準値を morning_input.json から読み込み、なければ ^SOX 始値で代替。"""
    if os.path.exists(MORNING_INPUT_FILE):
        try:
            with open(MORNING_INPUT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            if data.get("date") == datetime.date.today().isoformat():
                return safe_float(data["SOX_TODAY"])
        except (KeyError, TypeError, ValueError, json.JSONDecodeError):
            pass

    hist = fetch_with_retry("^SOX", period="5d", auto_adjust=False)
    return safe_float(hist["Open"].iloc[-1])


# ================================
# 先物データ取得
# ================================
def get_futures():
    sox_f = safe_float(fetch_with_retry("SOX=F", period="1d", auto_adjust=False)["Close"].iloc[-1])
    nq_f = safe_float(fetch_with_retry("NQ=F", period="1d", auto_adjust=False)["Close"].iloc[-1])
    jpy = safe_float(fetch_with_retry("JPY=X", period="1d", auto_adjust=False)["Close"].iloc[-1])
    vix = safe_float(fetch_with_retry("^VIX", period="1d", auto_adjust=False)["Close"].iloc[-1])
    return sox_f, nq_f, jpy, vix


# ================================
# 12時速報（だましチェック）
# ================================
def pm_12_check():
    sox_today = load_sox_today()
    sox_f, nq_f, jpy, vix = get_futures()

    pm_move = ((sox_f - sox_today) / sox_today) * 100

    # だまし判定
    if pm_move >= 0.5:
        judge = "だまし上げ注意（+0.50%以上）"
    elif pm_move <= -0.5:
        judge = "だまし下げ注意（-0.50%以上）"
    else:
        judge = "騙しなし（午前判定維持）"

    msg = f"【12時速報】\nSOX先物: {pm_move:.2f}%\n→ {judge}"
    send_discord(msg)
    print(msg)


# ================================
# 14時本判定（方向性確定）
# ================================
def pm_14_final():
    sox_today = load_sox_today()
    sox_f, nq_f, jpy, vix = get_futures()

    pm_move = ((sox_f - sox_today) / sox_today) * 100

    # 本物の方向性判定（±0.50%以上）
    if pm_move >= 0.5:
        direction = "上昇（本物）"
    elif pm_move <= -0.5:
        direction = "下落（本物）"
    else:
        direction = "午前判定維持（方向性変わらず）"

    msg = (
        f"【14時本判定】\n"
        f"SOX先物: {pm_move:.2f}%（午前比）\n"
        f"NASDAQ先物: {nq_f:.2f}\n"
        f"→ 午前判定を最終確定：{direction}"
    )

    send_discord(msg)
    print(msg)


if __name__ == "__main__":
    # GitHub Actions (UTC) とローカル (JST) の両方で動くよう UTC 時刻で分岐
    utc_hour = datetime.datetime.now(datetime.UTC).hour

    if utc_hour == 3:
        pm_12_check()
    elif utc_hour == 5:
        pm_14_final()
    else:
        # ローカル手動実行用: JST 12/14 台でも起動できる
        jst = datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=9)
        if 12 <= jst.hour < 13:
            pm_12_check()
        elif 14 <= jst.hour < 15:
            pm_14_final()
        else:
            print(f"pm_sox_protocol.py called at UTC {utc_hour} / JST {jst.hour}; no scheduled PM action.")
