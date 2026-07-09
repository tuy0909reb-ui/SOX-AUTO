import json
from sox_protocol import execute_sox_protocol, send_discord

# 朝の入力を読み込む
with open("morning_input.json", "r") as f:
    data = json.load(f)

SOX_TODAY = data["SOX_TODAY"]
SOX_MOTOMOTO = data["SOX_MOTOMOTO"]
SOX_HYOKA = data["SOX_HYOKA"]

# 午後判定を実行
result = execute_sox_protocol(SOX_TODAY, SOX_MOTOMOTO, SOX_HYOKA)

print("【PM判定結果】")
print(result)

# Discordへ送信
send_discord(result)
