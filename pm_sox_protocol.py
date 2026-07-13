import json
import yfinance as yf
from sox_protocol import send_discord
import datetime

# ================================
# 先物データ取得
# ================================
def get_futures():
    sox_f = yf.Ticker("^SOX").history(period="1d")["Close"].iloc[-1]
    nq_f = yf.Ticker("NQ=F").history(period="1d")["Close"].iloc[-1]
    jpy = yf.Ticker("JPY=X").history(period="1d")["Close"].iloc[-1]
    vix = yf.Ticker("^VIX").history(period="1d")["Close"].iloc[-1]
    return sox_f, nq_f, jpy, vix

# ================================
# 12時速報（だましチェック）
# ================================
def pm_12_check():
    with open("morning_input.json", "r") as f:
        data = json.load(f)

    sox_today = data["SOX_TODAY"]
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
    with open("morning_input.json", "r") as f:
        data = json.load(f)

    sox_today = data["SOX_TODAY"]
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

# ================================
# GitHub Actions 用：UTC 時刻で判定
# ================================
if __name__ == "__main__":
    hour = datetime.datetime.utcnow().hour

    if hour == 3:
        pm_12_check
