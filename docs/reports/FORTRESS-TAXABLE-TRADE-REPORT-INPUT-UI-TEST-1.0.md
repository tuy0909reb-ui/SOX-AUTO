# FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-TEST-1.0

**Document ID:** `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-TEST-1.0`  
**Title:** Discord Trade Report — 実入力 UI 操作確認  
**種別:** Live Discord Input UI Verification  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-TEST-1.0.md`  

**対象:** Discord 入力 UI のみ  
**対象外:** Human Display / Evidence / Protocol / Logic / Schema 再確認  

**制約遵守:** Code変更なし / Logic変更なし / Schema変更なし  

**Related:**

| 文書 | 役割 |
|---|---|
| `FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0` | Adapter / Port 経路 PASS（本 UI 実操作とは別） |
| `taxable_account/ops/discord_trade_bot.py` | slash / Choice / Confirm・Cancel ボタン |
| Operation Rulebook（FROZEN） | Trade Report 運用境界 |

---

## 判定

### **FAIL**

**理由:** Desktop / Mobile Discord での**実入力操作が未完了**（エージェント環境が `https://discord.com/login` で停止。ログイン・スラッシュ実行不可）。

```text
判定ラベル: FAIL（Live UI Verification Incomplete）
UI欠陥による FAIL ではない
入力UI修正: 現時点で必須検討なし（静的契約レビュー）
PASS 条件未達: 「実運用で迷わず可能」を眼で確認できていない
```

**PASS にするには:** Human Operator が §5 チェックリストを Desktop + Mobile で実行し、本記録を更新する。

---

## 1. エージェント実施結果

| 項目 | 結果 |
|---|---|
| Discord チャンネル到達 | **BLOCKED**（login） |
| 購入 slash 実操作 | **NOT RUN** |
| 売却 slash 実操作 | **NOT RUN** |
| 入力エラー実操作 | **NOT RUN**（経路は INPUT-TEST-1.0 で PASS） |
| Desktop Discord | **NOT RUN** |
| Mobile Discord | **NOT RUN**（エージェント不可） |

Browser 観測: Discord Login（Email / Password / QR）— 操作者認証が必要。

---

## 2. 静的 UI 契約レビュー（参考・修正強制なし）

実装変更なし。眼確認の代替ではない。

### 2.1 購入・売却コマンド表面

| 要素 | 実装 |
|---|---|
| 起動 | `/report_buy` → 局所名「購入報告」/ `/report_sell` →「売却報告」 |
| Choice | `1570` / `282A` / `世界半導体株投資`（3択） |
| 入力欄名 | 銘柄 / 約定価格 / 約定日（推奨 YYYYMMDD） / 数量 |
| Preview | Fortress 4項目 + 詳細（購入対象\|売却対象 vs 現在保有 vs 約定内容） |
| Confirm | ボタン「確認する」（danger） |
| Cancel | ボタン「キャンセル」（secondary） |

### 2.2 確認観点（静的）

| 観点 | 所見 |
|---|---|
| Choice が迷わない | 3銘柄・表示名が短い → 設計上問題なし |
| 入力欄名称 | 日本語 describe → 理解しやすい |
| Confirm 前確認 | Preview に対象・保有・価格・日・数量 → 設計上満たす |
| 売却と現在保有の混同防止 | `売却対象` と `現在保有` を分離表示 |
| 誤選択への気付き | Preview 対比 + Confirm 明示文 |
| 誤タップ | Confirm=danger / Cancel=secondary（意図的に慎重操作） |

### 2.3 入力エラー（経路確認は既存 PASS）

`FORTRESS-TAXABLE-TRADE-REPORT-INPUT-TEST-1.0` より:

| ケース | 受付 | Position | ACCEPTED Fact |
|---|---|---|---|
| 不正日付・銘柄・保有不一致・重複 | 拒否 | 変更なし | なし |

UI 上の未入力は Discord 側 required フィールドに依存（ライブ未確認）。

---

## 3. 確認項目ステータス（本記録時点）

### 1. 購入報告入力

| 確認 | ライブ | 静的 |
|---|---|---|
| コマンド起動〜Confirm | 未実施 | 契約あり |
| Choice / 欄名 / Preview / スマホ易さ | 未実施 | 契約上問題なし |

### 2. 売却報告入力

| 確認 | ライブ | 静的 |
|---|---|---|
| コマンド起動〜Confirm | 未実施 | 契約あり |
| 保有対比・誤選択気付き | 未実施 | Preview 設計あり |

### 3. 入力エラー

| 確認 | ライブ UI | 経路テスト |
|---|---|---|
| 未入力・不正日付・数量・保有不一致・重複 | 未実施 | 経路 PASS（未入力の Discord ネイティブ検証は未確認） |

### 4. 端末

| 端末 | 結果 |
|---|---|
| Desktop Discord | **NOT RUN** |
| Mobile Discord | **NOT RUN** |

---

## 4. FAIL 後の扱い

| 選択肢 | 本記録の推奨 |
|---|---|
| 入力 UI 修正の即時着手 | **不要**（欠陥未確認） |
| Human Desktop/Mobile 眼確認 | **必要**（PASS への唯一経路） |
| Code / Logic / Schema 変更 | **禁止のまま** |

---

## 5. Human チェックリスト（PASS 昇格用）

Desktop と Mobile それぞれで実施し、結果を本ファイルに追記する。

```text
[ ] /購入報告 または /report_buy 起動
[ ] Choice で銘柄選択（迷わない）
[ ] 価格・YYYYMMDD・数量入力（欄名が分かる / 見切れない）
[ ] Preview で内容確認できる
[ ] 「確認する」/「キャンセル」が押せる・誤タップしにくい
[ ] /売却報告 同様 + 売却対象と現在保有を見比べられる
[ ] 不正日付または保有不一致で拒否され、Position が進まない
[ ] Desktop: PASS / FAIL
[ ] Mobile: PASS / FAIL
```

両方 PASS かつ運用判断「迷わず可能」→ 本記録の判定を **PASS** に更新してよい。

---

## Version

```text
Status: FAIL（Live UI Verification Incomplete）
FORTRESS-TAXABLE-TRADE-REPORT-INPUT-UI-TEST-1.0

Live Discord: BLOCKED at login
UI fix required now: NO
Code/Logic/Schema: NONE
Next: Human Desktop + Mobile checklist (§5)
```
