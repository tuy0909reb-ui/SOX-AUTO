import yfinance as yf
import pandas as pd
import numpy as np

# ===== 完全自動版 =====

# 今日のSOX基準価額をSOXXから自動取得
soxx = yf.Ticker("SOXX")
today_price = soxx.history(period="1d")["Close"][0]
SOX_TODAY = int(today_price)

# あなたの取得単価・現在評価額（必要なら書き換える）
SOX_MOTOMOTO = 14000
SOX_HYOKA    = 13333

# 季節補正係数（あなたの元コードの値）
SEASON_COEF = {1: 0.93, 2: 0.52, 3: 0.99, 4: 0.98}

# ===== 以下にあなたの元の計算ロジックをそのまま貼る =====

diff = SOX_TODAY - SOX_MOTOMOTO
ratio = SOX_TODAY / SOX_MOTOMOTO

message = f"""
SOX PROTOCOL 自動版

今日のSOX基準価額: {SOX_TODAY}
あなたの取得単価: {SOX_MOTOMOTO}
評価額: {SOX_HYOKA}

差額: {diff}
倍率: {ratio:.2f}倍
"""

print(message)
