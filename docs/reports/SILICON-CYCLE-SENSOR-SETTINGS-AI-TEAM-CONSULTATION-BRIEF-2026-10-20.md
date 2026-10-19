# シリコンサイクル監視センサー設定 — AIチーム相談用ブリーフ

**Date:** 2026-10-20  
**From:** Human Architect（実装後の再検討依頼）  
**To:** ChatGPT / Gemini / Copilot / DeepSeek 等  
**Mode:** 相談のみ（いま閾値確定・mainマージ・発注はしない）  

**実装ブランチ（未マージ）:** `cursor/financial-fact-pilot-gate`  
**実装正本（暫定）:** `docs/baselines/ASA-SILICON-CYCLE-MONITOR-MATERIALS-1.0.md`  
**親ルール:** `docs/baselines/ASA-NISA-ANNUAL-PLAN-CONFIRMATION-RULES-1.0.md`  
**Human確定（材料項目）:** `docs/reports/NISA-ANNUAL-PLAN-AI-TEAM-RESPONSE-2026-10-17.md` §3.5 ③  
**レガシー封印:** `docs/baselines/ASA-LEGACY-SOX-SENSOR-SEAL-1.0.md`（解除しない）

---

## 1. 何の相談か（一文）

シリコンサイクル監視の**共有材料パイプラインは実装済み**だが、  
**elevated（警戒）発火条件・閾値・通知頻度・レガシー指標の扱い**が Human 未承認のままなので、main マージ前に各AIへ妥当性を打診する。

---

## 2. 役割の切り分け（混線禁止）

| 用途 | 質問 | 本センサーの役割 |
|---|---|---|
| NISA年次③ | 翌年は年初一括か／買い方再設計か | **材料一覧**（推奨断定なし） |
| 継続監視 | 警戒年は見忘れないか | **通知頻度**の切替材料（買い方自動決定ではない） |
| 特定口座 dd15_ma200 | 局面運用アラート | **別系統**（今回統合しない） |
| 旧 silicon_protocol | 大崩壊・索敵3灯＋Discord | **封印維持**（コード参照のみ） |

```text
やってよい: 閾値・指標セット・頻度の提案と根拠
やってはいけない:
  - 一括／再設計の自動推奨をシステムに埋め込む提案
  - 発注・入替・Decision / Ranking / PFOS 接続
  - レガシー封印解除を前提にした設計
  - taxable dd15 を黙って同一視して「確定」扱い
```

---

## 3. 既に決まっていること（触らない）

| 項目 | 内容 | 根拠 |
|---|---|---|
| 層 | Review／評価材料（再生成）。Fact/Hypothesis/Decision/Position に書かない | portfolio 設計 |
| 出力 | 材料のみ。一括／再設計の自動断定なし | NISA返信 Human確定 |
| 価格必須材料（項目） | SOX vs 200DMA、SOX vs S&P 相対 3M/6M/12M、SOX 12M分位 | 同上 |
| Discord | 専用 webhook。月次#一般・NISA年次・旧 `DISCORD_WEBHOOK_URL` に落とさない | 実装方針 |
| レガシー | `silicon_protocol.py` Discord 封印は維持 | Seal Record |

---

## 4. 実装済みだが「未承認の仮定」になっているもの

ここが今回の本体。実装は動くが、**Human が採否を決めていない**。

### 4.1 elevated（警戒モード）発火

現状コード（`scripts/silicon_cycle/materials.py`）:

```text
elevated = ON  if either:
  (A) SOX終値 < 200DMA  AND  200DMA傾きが下落（約20営業日前比）
  OR
  (B) 250日高値からの下落率 >= 15%
```

| 定数 | 値 | 由来（実装側） | Human承認 |
|---|---|---|---|
| `WATCH_DD_HINT_PCT` | **15%** | taxable `dd15` 系からの借用 | **なし** |
| 200DMA＋傾き | レガシー sensor_3 と同型 | 旧プロトコル | **再検討なし** |

### 4.2 全売却ライン表示

| 定数 | 値 | 由来 | 備考 |
|---|---|---|---|
| `DEFENSE_DROP_EXIT_PCT` | **25%** | 旧 `silicon_protocol` | **表示ラベルのみ**（自動売却はしない） |

### 4.3 レガシー互換灯（任意）

| 指標 | 現状 | Human側メモ |
|---|---|---|
| WSTS 3M MoM マイナス連 | 自動取得→ RED/GREEN/N/A | 返信では「任意・自動は次版」 |
| TSMC YoY | `< 10%` で RED | 旧プロトコル閾値。再検討なし |

### 4.4 通知頻度

| mode | 頻度 | トリガ |
|---|---|---|
| `normal` | 毎月1日 | 既定 |
| `elevated` | **毎週月曜** | `watch_hint` または Human 強制 |

頻度自体も Human 未承認。

---

## 5. 現状スナップショット（as_of 2026-10-17 材料）

正本ファイル: `data/nisa/annual/2027/cycle_gate_202610.md`

| 指標 | 値 |
|---|---|
| SOX終値 | 11137（effective_end 2026-10-16） |
| 250日高値 | 14635 |
| 高値下落率 | **23.90%** |
| 全売却ライン(-25%) | 未到達 |
| 200DMA | 10598（終値は**上**／傾き下落**なし**） |
| 12M分位 | 0.56 |
| vs S&P 3M | **-8.1pt** |
| vs S&P 6M | +10.1pt |
| vs S&P 12M | +47.0pt |
| WSTS / TSMC | 当該生成時 N/A |
| **watch_hint elevated** | **YES**（理由: `drop_from_high_ge_15pct` のみ） |

含意: 200DMAはまだ割っていないのに、15%ルールだけで **週次通知モード**に入っている。  
この挙動が「シリコンサイクル警戒」として妥当かが最大の論点。

---

## 6. 各AIへの質問（必ず番号で答える）

### Q1. elevated 発火条件（最重要）

次のどれを初版の既定にするべきか。**1つ推奨＋却下理由**を書く。

| 案 | 内容 |
|---|---|
| **A** | 現状維持: DD≥15% **または** (200DMA割れ∧傾き下落) |
| **B** | DD≥**25%**（防衛ラインと同値）または (200DMA割れ∧傾き下落) |
| **C** | **価格トレンドのみ**: (200DMA割れ∧傾き下落)。DDは表示だけ（elevatedに使わない） |
| **D** | **自動 elevated なし**。頻度切替は Human 手動のみ。DD/200DMAは材料表示のみ |
| **E** | 別案（具体的に。閾値と論理を明記） |

答えるとき必ず書く:

```text
推奨案:
根拠（投資判断・運用負荷・誤警報の観点）:
現状スナップショット（DD≈24%・200DMA上）での挙動予測:
判断禁止範囲（この案でもやってはいけないこと）:
```

### Q2. 通知頻度

| 案 | normal | elevated |
|---|---|---|
| **F1** | 月次 | 週次（現状） |
| **F2** | 月次 | 月次のまま（elevatedは文面フラグのみ） |
| **F3** | 四半期 | 月次 |
| **F4** | 別案 | |

NISA年次③（11月集中）との二重通知をどう避けるかも一言。

### Q3. WSTS / TSMC

| 案 | 内容 |
|---|---|
| **G1** | 初版から自動取得＋RED/GREEN（現状）。壊れたら N/A |
| **G2** | 自動は出さず、レポートに Human 記入欄のみ（NISA返信「次版」に忠実） |
| **G3** | 取得はするが灯色・閾値は出さず生数値のみ |

TSMC YoY の 10% 閾値を残すなら、根拠か「暫定ラベル」明示の要否。

### Q4. -25% 全売却ライン表示

| 案 | 内容 |
|---|---|
| **H1** | 表示維持（自動売却なし・文言で材料と明記） |
| **H2** | 文言を「高値からの距離」だけにし、「全売却」語を消す |
| **H3** | 年次③からは外し、継続監視ダイジェストのみ |

「防衛確定」誤読リスクへの対処を必須で書く。

### Q5. main マージの条件

実装パイプライン（材料JSON/MD・専用Discord・workflow）を main に載せる前に、  
**最低限 Human がサインすべき項目リスト**を5個以内で提案する。

---

## 7. 回答フォーマット（厳守）

各AIは次の見出しだけで返す（長文エッセイ禁止）。

```text
# シリコンサイクルセンサー設定 回答
回答者: （モデル名）
日付:

## 採否サマリ
Q1: 
Q2: 
Q3: 
Q4: 
Q5: （箇条書き≤5）

## Q1 詳細
（§6の所定欄）

## リスク・反対意見
（自分の推奨が外れたとき一番痛い失敗モードを1つ）

## Humanが今すぐ決めなくてよいこと
（後回し可能な項目）
```

---

## 8. 参照パス（実装・材料）

| 種類 | Path |
|---|---|
| 材料コア | `scripts/silicon_cycle/materials.py` |
| 年次③ | `scripts/nisa_annual/build_cycle_gate.py` |
| 通知 | `scripts/silicon_cycle/run_notify.py` |
| 状態 | `data/ops/silicon_cycle_watch.json` |
| サンプル材料 | `data/nisa/annual/2027/cycle_gate_202610.md` |
| Workflow | `.github/workflows/silicon-cycle-watch.yml` |
| 旧3センサー | `silicon_protocol.py`（封印） |

---

## 9. Human側の使い方

1. 本ファイルを各AIに渡す（このままコピペ可）  
2. 回答を回収し、矛盾点だけを突き合わせる  
3. Human が Q1〜Q4 を採択したら実装修正 → その後 main マージ  
4. 採択前に main へマージしない  

**返信の置き場（予定）:**  
`docs/reports/SILICON-CYCLE-SENSOR-SETTINGS-AI-TEAM-RESPONSE-2026-10-20.md`  
（Humanが四案を合成したあと作成）
