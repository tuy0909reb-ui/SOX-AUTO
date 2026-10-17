# NISA 翌年計画 — AIチームへの返信（Human確定）

**Date:** 2026-10-17  
**From:** Human Architect  
**To:** AI実装チーム  
**Basis:** 相談ブリーフ＋ ChatGPT / Gemini / Copilot / DeepSeek 回答の合成  
**Parent brief:** `docs/reports/NISA-ANNUAL-PLAN-AI-TEAM-CONSULTATION-BRIEF-2026-10-17.md`  
**Rules SoT:** `docs/baselines/ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0.md`

---

## 1. 一文の結論

**DeepSeek案を骨格とし、ChatGPTの安全弁（P0独立完了）と Gemini の「11/1材料同梱目標」を足す。**  
Copilotの「T1は2027〜なのでP2後回し可」も採る。  
自動入替・自動発注はしない。実装は通知と判断材料まで。

---

## 2. 採否サマリ（四案）

| 論点 | ChatGPT | Gemini | Copilot | DeepSeek | **Human確定** |
|---|---|---|---|---|---|
| P0 vs P1 | P0先行 | 一包み必達 | 一包み | P0先行 | **P0単独必須＋P1は11/1同梱目標** |
| レポート置き場 | `data/nisa/...` | `common_backtest/.../nisa_annual` | `.../annual/` | `data/nisa/annual` | **`data/nisa/annual/`** |
| T1累計 | 台帳集計 | portfolioに累計JSON | opsに累計 | 開始=rules／累計=台帳 | **DeepSeek（累計手入力JSON禁止）** |
| ③サイクル | 材料・閾値未固定 | 推奨文言あり | 二択ラベル | 材料＋弱いサマリ | **材料のみ。推奨・自動判定なし** |
| P2時期 | 後続 | 11/1に薄く含める | 後回し可 | 11月内可 | **後回し可（必須はP0→P1）** |

---

## 3. Human確定仕様

### 3.1 準備の本線（変更しない）

```text
① 市場動向 … ハイテク／半導体のままでよいか
② 投入アイテム … メガ10／FANG+／ニッセイ／2243／野村
③ シリコンサイクル … 投入時期（問題なし→年初一括／問題あり→買い方再設計）
```

- つみたて・成長とも **基本は年初一括**（サイクル問題なしが前提）  
  - 成長: `ASA-NISA-GROWTH-BUY-METHOD-ANNUAL-LUMP-NISSAY-1.0`  
  - つみたて: `ASA-NISA-TSUMITATE-BUY-METHOD-ANNUAL-LUMP-1.0`
- クレジット分割のハード締切 = **前月10日**（1月投入 → **12月10日**）
- キック開始 = **毎年11月**
- T3/T4 = 独立メーターではない。①②の結果を見たHumanラベル

### 3.2 優先度と完了条件

| Priority | 内容 | 完了条件 |
|---|---|---|
| **P0（必須・単独）** | 11/1キック＋締切リマインド | P1未完でも **必ず出す** |
| **P1（同梱目標）** | ①市場動向＋②5商品横断の初版 | 11/1に載せられれば理想。遅れてもP0は止めない |
| **P2（後続）** | T1/T2発火表示、③材料ゲート | 11月キックの必須条件にしない |
| **P3** | 満額後 1/5利確ゲート | 定義のみ後回し可 |

**失敗コスト:** P0漏れ（12/10締切落とし）＞ P1漏れ（手動材料で凌げる）

### 3.3 P0 通知仕様

| 通知 | 発火 | 必須内容 |
|---|---|---|
| 年次キック | **毎年 11/1** | ①②③開始。つみたて・成長とも基本年初一括。分割なら前月10日＝12/10ハード締切 |
| 締切リマインド | **毎年 12/1** | 投入アイテム確定したか（分割なら必須） |
| 締切直前 | **毎年 12/8** | 未確定なら警告（分割経路） |

- Discordは **月次 `#一般` と分離**（専用webhook）
- 分割フラグ忘れで通知が飛ばないよう、**12/1・12/8は毎年出してよい**（文面で「分割なら確定必須」）
- 二重送信防止・送信失敗時の再送をP0に含める
- 文面は「材料／確認開始」。**推奨・自動入替なし**。末尾に禁止フッタ固定可

**キック文面の最小例:**

```text
【NISA翌年計画キック】

2027年投入の確認を開始してください。

① 市場動向（ハイテク／半導体の継続可否）
② 投入アイテム（メガ10／FANG+／ニッセイSOX／2243／野村）
③ シリコンサイクル（年初一括でよいか／買い方再設計か）

つみたて・成長とも、サイクルに問題なければ基本は年初一括です。
判断はHuman。自動入替・自動発注はしません。

クレジット分割の場合、投入アイテムのハード締切は 12月10日（前月10日）です。
```

### 3.4 P1 レポート仕様

**置き場（確定）:**

```text
data/nisa/annual/
  YYYY/
    market_trend_YYYYMM.md|.json     # ①
    item_compare_YYYYMM.md|.json     # ②
    cycle_gate_YYYYMM.md|.json       # ③（P2）
  latest/                            # 通知参照用（任意）
```

`data/common_backtest/reports/` は既存BT・月次監視用。**年次運用ログと混ぜない。**  
読み取り参照のみ可。封印済み再検証ディレクトリは上書き禁止。

**①市場動向（初版）**

| 項目 | 内容 |
|---|---|
| 必須指数 | S&P500、NASDAQ系、ハイテク（例: XLK）、SOX |
| 出さない | **ダウ** |
| 期間例 | 1M / 3M / 6M / 12M 騰落、対S&P相対 |
| 任意 | 主要セクター対S&P相対（探索。即採用禁止） |
| 結論欄 | **判断材料と未解決事項のみ**（継続推奨の自動文言禁止） |

**②投入アイテム横断（初版・軸固定）**

候補（同じ土俵）: **メガ10 / FANG+ / ニッセイSOX / 2243 / 野村**

| 初版比較軸（固定） | 備考 |
|---|---|
| リターン（共通窓） | 窓・価格種別（分配再投資等）を明示 |
| 最大DD | |
| ボラティリティ | |
| コスト（信託報酬等） | |
| NAV/価格の履歴年数 | |
| （任意）対S&P超過 | |

- 月次の半導体袖決め手監視（野村／SOXX／2243／ニッセイ）と **出力を分ける**
- 一律順位＝採用、にしない。現行ニッセイ方針の自動覆し禁止
- 軸の拡張は次年版

### 3.5 P2 SoT・③（後続だが仕様は固定）

**T1**

| データ | 置き場 |
|---|---|
| 開始（例: `start_fiscal_year: 2027`） | `ops/rules/` 系の宣言JSON |
| 累計投入額 | **既存 portfolio 台帳から集計** |
| 発火結果 | ジョブのログ／dated JSON（SoTにしない） |

禁止: `cumulative_amount` を別JSONに手入力して台帳と二重化すること。  
Gemini案の `data/portfolio/nisa_accumulation_tracker.json` に累計を持たせる案は **不採用**。

**T2:** 既存NAVパネルの履歴年数。新規SoT不要。発火有無の表示のみ。  
**T3/T4:** Human欄のみ。自動判定に含めない。

**③シリコンサイクル（初版）**

| 種別 | 内容 |
|---|---|
| 必須（価格から） | SOX vs 200DMA位置、SOX vs S&P相対（3M/6M/12M）、SOX 12M分位など |
| 任意（Human欄） | WSTS在庫・出荷、ガイダンス等（自動取得は次版） |
| 出力 | **材料一覧のみ**。システムが「一括推奨／再設計推奨」と断定しない |
| 役割 | 買い方の再設計検討材料。商品自動変更・発注ではない |

---

## 4. スケジュール（今日＝2026-10-17起点）

※ DeepSeekの「9月開始」前提は **捨てる**（もう過ぎている）。

```text
〜10月末
  P0 実装＋ドライラン（最優先）

11/1
  キック本番
  P1があれば同梱。なくてもキックは出す

11月中
  P1①②初版を揃える
  （余裕があれば③材料の骨）

その後
  P2 T1/T2表示、③最小、満額後C定義
```

**工数目安:** P0約2〜3人日、P1①②あわせて約5〜8人日（再利用前提・要実測）。  
Geminiの「総4人日で全部」は楽観寄り。保険はDeepSeek帯。

---

## 5. 禁止事項（再掲・違反したら差し戻し）

```text
- 商品の自動入替・自動発注
- 月次決め手監視を「何を持つか」と同一視
- セクター探索結果の即採用
- ダウを必須参照に追加
- 封印済み再検証ディレクトリの上書き
- 累計投入の手入力二重SoT
- ③出力での一括／再設計の自動確定文言
```

---

## 6. 実装状況 / 次アクション

**P0（2026-10-17 Cursor実装）:**

| Item | Path |
|---|---|
| CLI | `scripts/nisa_annual/run_notify.py` |
| Workflow | `.github/workflows/nisa-annual-notify.yml` |
| Config | `data/ops/nisa_annual_notify.json` |
| Sent log | `data/ops/nisa_annual_notify_sent.json` |
| README | `scripts/nisa_annual/README.md` |

Human側の残り: Discord専用webhook作成 → secret `NISA_ANNUAL_DISCORD_WEBHOOK` または  
`logs/nisa_annual/discord_webhook.json` → ドライラン後 `--discord-live` 確認。

**P1以降:** ①②レポート・T1/T2・③は未着手（本ファイル §3.4–3.5）。

---

## 7. 参照パス

| Doc | Path |
|---|---|
| 本返信（実装スコープ正） | `docs/reports/NISA-ANNUAL-PLAN-AI-TEAM-RESPONSE-2026-10-17.md` |
| 相談ブリーフ | `docs/reports/NISA-ANNUAL-PLAN-AI-TEAM-CONSULTATION-BRIEF-2026-10-17.md` |
| 確認ルール | `docs/baselines/ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0.md` |
| つみたて年初一括 | `docs/baselines/ASA-NISA-TSUMITATE-BUY-METHOD-ANNUAL-LUMP-1.0.md` |
| 成長年初一括 | `docs/baselines/ASA-NISA-GROWTH-BUY-METHOD-ANNUAL-LUMP-NISSAY-1.0.md` |
| 中間見直しT1–T4 | `docs/baselines/ASA-NISA-GROWTH-SEMICONDUCTOR-ADOPTION-RATIONALE-AND-MIDCOURSE-REVIEW-GATE-1.0.md` |

---

## 8. 成功条件

```text
Humanが毎年11/1の通知で①②③を迷わず始められる。
クレジット分割の年は、12/10（前月10日）までに②が確定できるリマインドがある。
採用・発注はHumanのまま。自動は検知・材料・通知に限る。
```

**End of response to AI team.**
