# FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-PLAN-1.0

**Document ID:** `FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-PLAN-1.0`  
**Title:** Live State Alignment — Implementation Impact Plan  
**種別:** Implementation Planning Only（影響範囲確認。実装・Freeze 改訂の実行ではない）  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-PLAN-1.0.md`  
**Status:** **PLAN COMPLETE / IMPLEMENTATION NOT AUTHORIZED**  

**Parent Decision:**

- `docs/reports/FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0.md`（D1 / D2 / D3）

**制約遵守（本文書）:** 実装変更なし / Schema変更なし / Freeze変更なし  

---

## Summary

| 項目 | 結論 |
|---|---|
| 主変更面 | Live ops の `RuntimeConfig` 配線 + Runtime `step` の Fill 系自動発火の Live 無効化 |
| Schema | **不要** |
| Protocol 条件式 | **不要** |
| Display / Evidence Freeze | **REOPEN 不要**（挙動観測の変化のみ） |
| HTR Freeze | **REOPEN 不要**（思想強化。契約変更なし） |
| Runtime Freeze | **Code 前に CR / 運用節追随が必要**（frozen ops chain の挙動変更） |
| 実装規模（見積） | **小〜中**（設定分離中心）。Recovery 自動経路まで D1 厳格適用するなら **中** |

---

## 1. Live Position 更新を HTR + Trade Fact 後へ寄せる — 対象列挙

### 1.1 対象イベント（D1）

| イベント | Live で許す発火源 | 現行の余分な発火源 |
|---|---|---|
| `ENTRY_FILLED` | HTR Port /（管理）`--record-entry` | `auto_fill=True`（Live ops は既に False） |
| `EXIT_FILLED` | HTR Port /（管理）`--record-exit` | **`auto_exit_fill`（Live で有効）** |
| `TRANSFER_COMPLETE`（事実同期） | HTR Growth SELL | **`auto_transfer`（Live で有効）** |
| `RECOVERY_COMPLETE`（事実同期） | HTR Growth BUY | **Runtime Alert OFF 経路で無条件発火**（フラグなし） |
| `DELAYED_FILL_RECOVERY` | HTR Port のみ | なし（対象外で維持） |

Decision として Live でも残す（報告前に進めてよい）:

- `ALERT_ON` / `ALERT_OFF`
- `EXIT_PENDING` への遷移（`ALERT_ON` の結果）
- `SIGNAL_ENTRY_AVAILABLE` / `SIGNAL_LOST` / `REENTRY_SIGNAL`
- `STOP_TRIGGERED` / `TIME_EXIT_DUE`（→ `PositionState.EXIT` まで）
- Asset Selection / Risk arming
- ViewModel / Discord Projection

### 1.2 対象 Runtime 経路

```text
[Live daily]
python -m taxable_account.ops --as-of … --state-file …
  → TaxableAccountRuntime.step(as_of)
      → DetectionAdapter.condition_on
      → ALERT_ON / ALERT_OFF / selection / stop / time_exit / entry ready
      → ★ 変更対象: auto_transfer → TRANSFER_COMPLETE
      → ★ 変更対象: auto_exit_fill → EXIT_FILLED
      → ★ 要設計確認: Alert OFF → RECOVERY_COMPLETE（無条件）
      → project_view_model / project_discord_payload（変更不要）

[Live fact sync — 維持・正経路]
Discord: ops.discord_trade_bot → DiscordTradeInputAdapter → TradeReportPort
CLI:     --report-buy / --report-sell → TradeReportPort
  → Journal.append → routing → engine.on_event(FILL系) → FileStateStore.save
```

### 1.3 対象ファイル（実装時タッチ候補）

| 優先 | ファイル | 理由 |
|---|---|---|
| **P0** | `taxable_account/ops/__main__.py` | Live が `auto_transfer=True` 固定、`auto_exit_fill` 未指定。ここが D1/D2 の最短レバー |
| **P0** | `taxable_account/runtime/session.py` | `RuntimeConfig` 定義と `step()` 内の auto 発火本体（L82–101, L124–127, entry auto_fill） |
| **P1** | `taxable_account/README.md` | Live/Paper 前提の運用説明（Freeze 外ドキュメント） |
| **P1** | `taxable_account/validation/live_dry_run.py` | `auto_transfer=True` 固定。Simulation と Live のラベル分離 |
| **P1** | `taxable_account/validation/operational_replay.py` | Paper 前提の auto_*。Simulation 用途として明示維持 |
| **P2** | `taxable_account/validation/operational_readiness.py` | 既定 `RuntimeConfig()`（paper 既定）。ゲート再実行要否 |
| **P2** | tests: `test_taxable_account_runtime_integration.py` 他 | 既定 `RuntimeConfig()` 依存。Live 契約テストの追加候補 |
| **維持（原則変更なし）** | `trade/port.py`, `trade/routing.py`, `trade/journal.py`, `trade/discord_input.py`, `ops/discord_trade_bot.py` | 既に HTR 正経路 |
| **維持** | `view/human_display.py`, `view/discord_adapter.py`, `view/view_model.py` | Display Freeze。写像ロジック変更は本 Plan の必須範囲外 |
| **維持** | `decision/*`, `detection/*`, `domain/*` schema | Protocol / Schema 非対象 |
| **維持（管理経路）** | `ops/__main__.py` の `--record-entry` / `--record-exit` | Freeze 上ショートカット。削除は本 Plan 必須ではない（通常 Live 非推奨の文書化のみ可） |

### 1.4 実装しない範囲（本 Alignment の非目標）

- 3層 Schema 分離（Decision D3 = 将来）
- Broker Adapter
- 新 Domain Event 名の導入（イベント改名は別 Design）
- Human Display / Evidence 文言 Freeze 改訂
- Fact Journal の Ledger 化

---

## 2. `auto_transfer` / `auto_exit_fill` を Decision/Simulation 用途に維持する分離箇所

### 2.1 分離原則（D2）

```text
同一フラグを残す（Schema 変更なし）。
呼び出し側で Live vs Paper/Simulation を分離する。

Live ops:
  auto_transfer = False
  auto_exit_fill = False
  auto_fill = False          # 既存どおり

Paper / Replay / Readiness / 単体 Runtime 試験:
  auto_* = True を明示してよい
  （「実約定完了」とは解釈しない — Decision/Simulation）
```

### 2.2 分離が必要な箇所（チェックリスト）

| 箇所 | 現状 | 分離後の扱い |
|---|---|---|
| `RuntimeConfig` クラス既定 | 三者とも `True`（paper 友好） | **既定は Paper のままでよい**。またはコメント強化のみ。Live は呼び出し側で必ず False |
| `ops/__main__.py` `--as-of` 経路 | `auto_transfer=True`, `auto_exit_fill` 暗黙 True | **Live: 両方 False**。必要なら `--paper-auto-*` 明示オプトイン |
| `live_dry_run.py` | transfer True / fill 引数 | 「dry-run / simulation」と命名・コメント。Live ops と混線させない |
| `operational_replay.py` | auto_* True 前提のシナリオ記述 | Simulation 用途として維持。ノートに D2 を明記 |
| `operational_readiness.py` | 既定 RuntimeConfig | Phase7 再実行方針を CR で決める（Paper ゲートか Live 契約ゲートか） |
| ライブラリ直呼び `TaxableAccountRuntime()` | paper 既定 | 誤用防止はドキュメント / 将来の factory（`live_config()` / `paper_config()`）任意 |

### 2.3 Runtime `step` 内の発火点マップ

| 行近傍（session.py） | 条件 | D2 分類 |
|---|---|---|
| bootstrap / Alert ON + `auto_transfer` | → `TRANSFER_COMPLETE` | Simulation のみ（Live off） |
| Alert OFF + `auto_exit_fill` + EXIT | → `EXIT_FILLED` | Simulation のみ（Live off） |
| step 末尾 EXIT + `auto_exit_fill` | → `EXIT_FILLED` | Simulation のみ（Live off） |
| `_maybe_enter` + `auto_fill` | → `ENTRY_FILLED` | 既存どおり Live off |
| Alert OFF → **`RECOVERY_COMPLETE` 無条件** | フラグなし | **§2.4 未決事項** |

### 2.4 未決（実装 CR で Design 確定が必要）— Recovery

D1 は Growth BUY 対応の `RECOVERY_COMPLETE` を「Fact 後のみ」と書く。  
現行 `session.py` は Alert OFF 後に **フラグ無しで** `RECOVERY_COMPLETE` を発火する。

| オプション | 内容 | 影響 |
|---|---|---|
| **R1（最小）** | 本 Alignment は transfer/exit_fill のみ。Recovery 自動は別 CR | 実装小。D1 部分適用 |
| **R2（厳格）** | Live では `RECOVERY_COMPLETE` も HTR Growth BUY 後のみ。Runtime 自動を Live で止める（要フラグ or Live 分岐） | D1 完全。Regime が `REENTRY_PENDING` に滞留し得る（Display 上は望ましい場合あり） |

**本 Plan の推奨（非拘束）:** 第一 CR は **R1（transfer + exit_fill）**。Recovery は第二 CR。

---

## 3. 既存 Freeze への影響確認

| Freeze | 影響 | REOPEN 要否 | 備考 |
|---|---|---|---|
| **Runtime Freeze** `ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0` | **あり（運用挙動）** | **版上げ追随 CR が必要**（本文書では Freeze を書き換えない） | frozen ops chain の Live 結果が変わる。Unfreeze rule: CR + registration |
| **HTR Port** `…-HUMAN-TRADE-REPORT-PORT-1.0` | **なし〜強化** | **不要** | Live fill 確認前提と一致。Port 契約・Fact schema 不変 |
| **Human Display** `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` | **観測変化のみ** | **不要** | EXIT_PENDING / EXIT 表示が報告まで残り得る。4項目契約・写像 SoT 不変 |
| **Evidence** `…-EVIDENCE-1.0` | **観測変化のみ** | **不要** | 詳細出る状態の滞在時間が伸び得る。規則不変 |
| Mapping | 同上 | **不要** | |
| Detailed Spec / Protocol 条件 Freeze | **解釈緊張のみ** | **本 Alignment では必須改訂なし** | `TRANSFER_COMPLETE = ops ack` 字面は残る。Live Ownership は Decision ADR が正。全面 Spec 改訂は別判断 |

### Runtime Freeze で追随が必要になり得る記述（参照用・ここでは改訂しない）

- Normal operations § の「日次 step 後の状態」前提
- `auto_fill=False` のみ言及している Live premise（transfer/exit_fill を明示追加する必要）
- `--record-*` を「通常 Live」と誤読させない注記

### HTR / Display / Evidence

```text
Code が D1/D2 どおり動いても:
  - Human 入力契約は同じ
  - 主表示4項目・Evidence 規則は同じ
→ Freeze REOPEN 理由にならない
```

---

## 4. Code 変更前に必要な文書更新（Change Request）

### 結論: **YES — Code 前に CR が必要**

Runtime Freeze:

> Changes require a new change request / registration — not ad-hoc “improvement” work.

Live の日次 `step` が `TRANSFER_COMPLETE` / `EXIT_FILLED` を自動で踏まなくなるのは、  
**frozen normal operations の挙動変更**に該当する。

### 推奨文書シーケンス（実行は別指示）

| 順 | 文書 | 必須? | 内容 |
|---|---|---|---|
| 1 | **Change Request**（例: `docs/change_requests/asa_cr_taxable_live_state_alignment_001.md`） | **必須** | Scope: Live `auto_transfer`/`auto_exit_fill`=False、R1/R2、非目標、テスト計画、Freeze 非改訂範囲 |
| 2 | **Implementation Authorization**（Human / Owner APPROVE） | **必須** | 本 Plan だけでは実装許可にならない |
| 3 | Runtime Freeze **追随記録**（1.0 追記 or 1.1 登録） | **Code と同梱または直後** | 本制約下では「いま」書かない。CR 承認後 |
| 4 | Operation Rulebook ACTIVE 昇格 | 任意 | Ownership Decision と揃えるとよい |
| 5 | HTR / Display / Evidence Freeze 改訂 | **不要** | |
| 6 | Schema / Detailed Spec 全面改訂 | **不要（第一 CR）** | |

### CR に含めるべき受け入れ条件（案）

```text
Live ops --as-of:
  ALERT_ON 後も EXIT_PENDING が残る（auto_transfer しない）
  EXIT 後も EXIT_FILLED しない（auto_exit_fill しない）
  同条件で HTR SELL/BUY 後のみ該当 FILL/TRANSFER が進む
  Journal に ACCEPTED Fact がある

Paper/Replay:
  auto_* True で従来シナリオが通る（Simulation）

Protocol:
  Entry/Exit/Risk/Selection 条件式 Diff なし
Schema:
  TaxableAccountState / Trade Fact Diff なし
Display Freeze:
  写像契約 Diff なし
```

---

## 5. 推奨実装フェーズ（認可後・参考）

本文書は実装を許可しない。認可後の切り方のみ記す。

| Phase | 内容 | Schema |
|---|---|---|
| **F0** | CR + Authorization | — |
| **F1** | Live ops: `auto_transfer=False`, `auto_exit_fill=False`（+ CLI オプトイン任意） | なし |
| **F2** | コメント / README / live_dry_run ラベル分離 | なし |
| **F3** | Live 契約テスト追加（Case A/B） | なし |
| **F4** | Runtime Freeze 追随登録 | なし |
| **F5（別 CR）** | Recovery R2（任意） | なし |
| **将来** | 3層分離（D3） | あり得る |

最小実装差分の中心:

```text
ops/__main__.py の RuntimeConfig(...)
  auto_transfer=False
  auto_exit_fill=False
  auto_fill=False  # 既存
```

これだけで Live 日次経路の D1/D2 の大半は満たせる。  
`session.py` 本体の条件式削除は必須ではない（フラグ off で足りる）。

---

## 6. リスクと回帰

| リスク | 内容 | 緩和 |
|---|---|---|
| Growth 滞留 | EXIT_PENDING が報告まで続く | Display が売却命令を出し続ける — 仕様どおり |
| Swing EXIT 滞留 | STOP/TIME 後 EXIT のまま | 売却報告まで Display が売却 — 仕様どおり |
| Replay/Readiness 失敗 | paper 既定前提のゲート | Simulation では auto_* True を維持 |
| record-* 誤用 | Journal なし State 更新 | 文書で通常 Live 非推奨（削除は別判断） |
| Recovery 二重 | R1 のまま Alert OFF で RECOVERY 自動 | F5 で扱う |

---

## 7. 確認事項への直接回答

### 確認1 — 対象ファイル・Runtime 経路

列挙済み（§1.2–1.3）。中核は `ops/__main__.py` + `runtime/session.py` の Live 日次 `step`。正経路 HTR は維持。

### 確認2 — auto_* 分離箇所

列挙済み（§2.2–2.3）。**フラグ削除ではなく呼び出し側分離**。Recovery 無条件発火は別決（§2.4）。

### 確認3 — Freeze 影響

| Freeze | 影響 |
|---|---|
| Runtime | あり → CR + 追随必要 |
| HTR | REOPEN 不要 |
| Human Display | REOPEN 不要 |
| Evidence | REOPEN 不要 |

### 確認4 — Code 前の文書更新

**必要。** 最低限 Change Request + Implementation Authorization。  
Runtime Freeze 本文の改訂は CR 承認後（本 Plan 制約下では実施しない）。

---

## Version

```text
Status: PLAN COMPLETE / IMPLEMENTATION NOT AUTHORIZED
FORTRESS-TAXABLE-LIVE-STATE-ALIGNMENT-IMPLEMENTATION-PLAN-1.0

Parent: FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0 (D1/D2)

Code: NONE / Schema: NONE / Freeze: NONE
Next gate: Change Request + Authorization (not this document)
```
