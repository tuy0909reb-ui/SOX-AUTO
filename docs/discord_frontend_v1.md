# Discord運用フロントエンド仕様書 v1.1

## （NASDAQ100売却プロトコル）

---

# 1. 目的

本仕様書は **NASDAQ100売却プロトコル** の Discord運用フロントエンドを定義する。

本UIは以下を目的とする。

* スマートフォンで5秒以内に状況を把握できること
* 必要最小限の操作で運用できること
* 既存プロトコルの操作・表示を行うこと

---

# 2. 適用範囲・正本（SoT）

本仕様書は Discord運用フロントエンドの正本（Single Source of Truth）とする。

実装は本仕様書に従うこと。

仕様書に記載されていない事項を実装側で補完・追加・変更してはならない。

設計変更が必要な場合は実装を停止し、設計レビューを行う。

---

# 3. 対象範囲

## 実装対象

* Discord UI
* Embed
* ボタン
* Alert表示
* Log表示
* Watch List表示

## 実装対象外

以下は既存プロトコルが担当する。

* 売却ロジック
* RSI計算
* 52週高値乖離計算
* Futures取得
* 判定アルゴリズム
* スケジューラ
* Bot接続設定
* Discord接続情報

---

# 4. システム構成

Discord UIは判定ロジックを持たない。

```text
Discord UI
        │
        ▼
ndx_ops.py
        │
        ▼
ndx_sell_protocol.py
        │
        ▼
sox_utils.send_discord()
```

| コンポーネント              | 役割        |
| -------------------- | --------- |
| Discord UI           | 操作・表示     |
| ndx_ops.py           | 運用入口      |
| ndx_sell_protocol.py | 判定本体      |
| sox_utils.py         | Discord通知 |

---

# 5. チャンネル構成

```text
📂 DAILY
    🌅 morning
    🌙 evening

📂 ALERT
    🚨 alerts

📂 HISTORY
    📜 log

📂 REFERENCE
    👀 watch-list
```

## 並び順

```text
Morning
Evening
Alert
Log
Watch List
```

毎日使用する順に配置する。

---

# 6. Morning画面

## Embed

表示項目

* Protocol
* Target
* 判定
* RSI
* 52週高値乖離
* 含み益
* 売却条件
* 次回実行

### 表示例

```text
📊 Morning Check

Protocol
NASDAQ100 Sell Protocol

Target
SBI・NASDAQ100

────────────────

判定
🟢 HOLD

RSI
63.2

52週高値乖離
-1.8%

含み益
+8.4%

売却条件

☑ RSI
☒ Futures
☒ BreakEven

次回
Evening
```

## ボタン

* ▶ Morning実行
* 🔄 再実行
* ⏭ スキップ

### ボタン動作

| ボタン       | 動作                                 |
| --------- | ---------------------------------- |
| Morning実行 | `ndx_ops.py` を経由して Morning 判定を実行する |
| 再実行       | 最新状態で Morning 判定を再実行する             |
| スキップ      | 判定を実行せず終了し、Logへ「Morning Skip」を記録する |

---

# 7. Evening画面

Morning画面と同一レイアウトを採用する。

変更点は以下のみ。

* タイトルを Evening Check とする
* 実行ボタンを Evening実行 とする
* 次回表示を Morning とする

ボタン動作は Morning と同様とする。

---

# 8. Alert

Alertは異常時のみ通知する。

通常状態は通知しない。

## 表示項目

* 判定
* RSI
* 52週高値乖離
* 含み益
* 売却条件

## 判定表示

| プロトコル判定 | UI表示   | 色  |
| ------- | ------ | -- |
| HOLD    | Normal | 🟢 |
| 脱出GO    | SELL   | 🔴 |

※ 将来 Warning 相当の判定が追加された場合は仕様変更として追加する。

---

# 9. Log

Botが自動記録する。

ユーザー操作は不要。

## 記録項目

* 日時
* Morning / Evening
* 判定
* RSI
* 52週高値乖離
* 含み益
* 次回実行

スキップ時は

```text
Morning Skip
```

または

```text
Evening Skip
```

を記録する。

---

# 10. Watch List

Watch Listは参照専用とする。

日常運用画面には表示しない。

一覧表示は Discord向けに最適化し、`docs/watch_list_v1.md` をそのまま表示するものではない。

表示内容は監視対象一覧および状態確認を目的とした簡易表示とする。

---

# 11. ボタンID

```text
morning_run
morning_retry
morning_skip

evening_run
evening_retry
evening_skip
```

命名は英小文字＋アンダースコアで統一する。

---

# 12. 通知ルール

| 状態     | 通知      |
| ------ | ------- |
| Normal | 送信しない   |
| SELL   | Alert送信 |

通知疲れを防ぐため、通常状態は通知しない。

---

# 13. 実装ルール

Discord UIは以下のみを担当する。

```text
入力
    ↓
ndx_ops.py
    ↓
ndx_sell_protocol.py
    ↓
結果表示
```

Discord UIは

* 判定を行わない
* 計算を行わない
* 売却ロジックを持たない
* プロトコル状態を書き換えない

---

# 14. 実装時の禁止事項

実装側で以下を独自判断で追加・変更してはならない。

* プロトコル変更
* 売却条件変更
* UI構成変更
* チャンネル追加・削除
* ボタン追加・削除
* 表示項目追加・削除
* 通知ルール変更
* Watch List仕様変更
* 独自判断による最適化

仕様変更が必要な場合は実装を停止し、設計レビューを行う。

---

# 15. 将来拡張

本UIは **NASDAQ100売却プロトコル専用** として実装する。

将来的には

* SOX
* Mega
* Bitcoin

など、他プロトコルへの拡張を想定する。

そのため、すべてのEmbedヘッダーには以下を表示する。

* Protocol
* Target

---

# 16. 変更履歴

| 日付         | 内容                                                               |
| ---------- | ---------------------------------------------------------------- |
| 2026-07-18 | v1.0 初版作成                                                        |
| 2026-07-18 | v1.1 Cursorレビュー反映（表示項目へ修正、Alert判定定義、Skip動作定義、Watch List表示方針を明確化） |
