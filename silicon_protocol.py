import pandas as pd
import yfinance as yf
from datetime import datetime
import pytz

def get_silicon_cycle_data():
    """SOX指数の株価、200日移動平均線、および傾きを精密にデジタル取得"""
    data = {}

    t = yf.Ticker("^SOX")
    hist = t.history(period="2y") # 過去2年分の株価をロード

    if not hist.empty:
        # 52週最高値
        data["SOX_HIGH"] = hist["High"].tail(250).max()
        # 最新終値
        data["SOX_CLOSE"] = hist["Close"].iloc[-1]

        # 200日移動平均線の算出（過去200営業日分の平均をローリング）
        hist["200MA"] = hist["Close"].rolling(window=200).mean()

        # 最新の200MAとその1ヶ月前（約20営業日前）の200MAを比較して傾きを判定
        data["200MA_NOW"] = hist["200MA"].iloc[-1]
        data["200MA_PREV"] = hist["200MA"].iloc[-20] if len(hist) > 220 else hist["200MA"].iloc[-1]

        # 200日移動平均線の傾き（プラスなら右肩上がり、マイナスなら右肩下がり）
        data["200MA_TREND"] = data["200MA_NOW"] - data["200MA_PREV"]
    else:
        data["SOX_HIGH"] = 1.0
        data["SOX_CLOSE"] = 1.0
        data["200MA_NOW"] = 1.0
        data["200MA_TREND"] = 0.0

    return data

def execute_silicon_protocol_v10():
    # ==========================================
    # 【指揮官・月末手動入力エリア】※公式IRやニュースを見てここだけ書き換えてください
    # ==========================================
    # 📡 センサー①：WSTSデータ（世界半導体出荷額が3ヶ月連続前月比マイナスなら True / 正常なら False）
    WSTS_3M_MINUS = False

    # 📡 センサー②：TSMC月次売上高（前年同月比％の数値をそのまま入力。例: 30.1%なら 30.1）
    TSMC_YOY_PCT = 30.1
    # ==========================================

    # 市場データの自動取得
    m_data = get_silicon_cycle_data()

    # 算術計算（SOX最高値からの下落率）
    sox_drop = round((m_data["SOX_HIGH"] - m_data["SOX_CLOSE"]) / m_data["SOX_HIGH"] * 100, 2)

    # --- 3大センサーの冷徹な個別ジャッジ ---
    # 🚨 センサー①：WSTSデータ
    sensor_1 = "🔴 点灯（危険：実需決壊）" if WSTS_3M_MINUS else "🟢 白（正常）"

    # 🚨 センサー②：TSMC月次売上（前年比マイナス、またはプラス1桁％台[10%未満]で赤点灯）
    sensor_2 = "🔴 点灯（危険：ダムの根元が詰まり過剰在庫突入）" if TSMC_YOY_PCT < 10.0 else "🟢 白（正常）"

    # 🚨 センサー③：SOX指数の200日移動平均線の傾き
    is_below_200ma = m_data["SOX_CLOSE"] < m_data["200MA_NOW"]
    is_downward_trend = m_data["200MA_TREND"] < 0
    sensor_3 = "🔴 点灯（危険：プロの売り抜け完了、下落トレンド転換）" if (is_below_200ma and is_downward_trend) else "🟢 白（正常）"

    # 点灯数のカウント
    red_count = sum([WSTS_3M_MINUS, (TSMC_YOY_PCT < 10.0), (is_below_200ma and is_downward_trend)])

    # 最終執行コマンドの判定（株価が25%以上下落、かつセンサーが2つ以上赤）
    if sox_drop >= 25.0 and red_count >= 2:
        final_command = """⚔️【 退避（EXECUTE-EVACUATION） 】⚔️
本格的なシリコンサイクルの崩壊（底なしの谷）と断定。
大暴落の初期フェーズと捉え、利益が出ているうちに特定口座の【楽天SOX（320万円枠）】を即座に全額利益確定（売却）せよ！
クリーンな現金をあおぞら銀行等の安全な金庫へ退避させ、40%〜50%引きの谷底での再投入（口数強奪）に備えよ。"""
    else:
        final_command = """⚔️【 静観（NO-ACTION） 】⚔️
ただの一時的な調整（押し目）。週足・月足の実需バックボーンは崩壊していない。
余計な狼狽売りは一切せず、10月1日始動の「毎日分割＆可変爆撃プロトコル」を脳死状態で淡々と走らせ続けよ。"""

    # 日本時間の実行時刻取得
    jst = pytz.timezone('Asia/Tokyo')
    now_jst = datetime.now(jst)
    time_str = now_jst.strftime('%Y-%m-%d %H:%M:%S')

    # 出力
    output = f"""
================================================================================
👑【プロトコルVer.10.0】シリコンサイクル大崩壊・索敵3大センサー判定結果 👑
実行時刻(JST): {time_str}
================================================================================

1. 自動取得データ（参照：Yahoo Finance）
   * SOX指数 52週最高値   : {m_data['SOX_HIGH']:,}
   * SOX指数 現在確定終値 : {m_data['SOX_CLOSE']:,}
   * SOX指数 200日移動平均: {round(m_data['200MA_NOW'], 2):,} （直近トレンド: {"右肩下がり" if is_downward_trend else "右肩上がり維持"}）
   * [URL] https://yahoo.com

2. 算術データ計算結果（退避デッドライン: 25.0%下落）
   * SOX最高値からの現在下落率 : {sox_drop}%

3. 3大防衛センサーの点灯ステータス
   * 📡 センサー① 【WSTS世界出荷額】: {sensor_1}
     （根拠：3ヶ月連続前月比マイナスの{"発生を検知" if WSTS_3M_MINUS else "なし、正常"}）
   * 📡 センサー② 【TSMC月次売上高】: {sensor_2}
     （根拠：直近の前年同月比売上成長率 {TSMC_YOY_PCT}%）
   * 📡 センサー③ 【SOX指数200MA】   : {sensor_3}
     （根拠：株価の200日線割れ={"あり" if is_below_200ma else "なし"} ＆ 200MAの傾き={"下向き" if is_downward_trend else "下向き維持"})

4. ⚔️【最終執行コマンド】
   * 現在の崩壊センサー赤点灯数 : {red_count} 個
   * 現在の株価下落フェーズ     : {"25%以上の深刻な下落圏" if sox_drop >= 25.0 else "25%未満の通常調整圏"}

   {final_command}
================================================================================
"""
    print(output)

if __name__ == "__main__":
    execute_silicon_protocol_v10()
