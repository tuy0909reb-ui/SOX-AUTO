# ASA Design Knowledge Record — Investment Decision Architecture

**Baseline ID:** ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
**Title:** 特定口座局面運用システム / 半導体商品選択アーキテクチャ設計記録  
**Document Type:** Design Knowledge Record（Topic Baseline）  
**Category:** Investment Decision Architecture  
**Status:** **REGISTERED**（Definition / Knowledge Only）  
**Version:** V1.0  
**Sequence:** 001  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T03:05:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-BASELINE-INVESTMENT-DECISION-V1.0-001  
**Previous Record:** NONE  
**Previous Freeze:** NONE  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Registry Path:** `docs/baselines/ASA-BASELINE-INVESTMENT-DECISION-V1.0-001.md`

| Artifact | Path | Status |
|---|---|---|
| Design Knowledge Record | `docs/baselines/ASA-BASELINE-INVESTMENT-DECISION-V1.0-001.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-BASELINE-INVESTMENT-DECISION-V1.0-001.md` | APPROVED |
| Evidence — Active Selection | `NISA_BACKTEST/reports/semiconductor_active_selection_report.md` | REFERENCE |
| Evidence — Structure | `NISA_BACKTEST/reports/semiconductor_structure_report.md` | REFERENCE |
| Evidence — Data Quality | `NISA_BACKTEST/reports/semiconductor_data_quality_report.md` | REFERENCE |

```text
This baseline does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This baseline does NOT authorize implementation, trading rules, or automation.
Investment Decision Architecture ≠ ASA Minimum Runtime / Architecture Evolution Sequence.
```

---

## 1. Purpose

特定口座資産を対象とした局面運用システムについて、設計思想・判断構造・商品分類・分析結果を  
ASA設計知識として初回登録し、将来の検証・改訂の参照点とする。

```text
Record Design Knowledge
≠ Authorize Trading
≠ Authorize Implementation
```

---

## 2. Design Principles（Maintained）

| # | Principle | Statement |
|---|---|---|
| 1 | NISA | 長期保有・複利最大化。枠消化と継続保有を優先する。 |
| 2 | 特定口座 | 局面判断・機動的運用。環境認識に応じたエクスポージャー調整を許容する。 |
| 3 | SOX Sensor | 売買指示層ではない。市場環境認識層（Sensor）として位置づける。 |
| 4 | 商品選択 | 市場局面に応じたリスクエクスポージャー選択である。銘柄当てではない。 |
| 5 | アクティブ評価 | 集中投資結果を「単なる集中効果」へ単純還元しない。銘柄選択・配分判断を含む運用判断結果として評価する。 |

---

## 3. NISA と特定口座の役割分離

```text
NISA（長期枠）
  → Horizon: multi-year / full contribution cycle
  → Objective: compound growth / tax-advantaged hold
  → Behavior: 継続投入・低頻度変更・耐性重視

特定口座（局面運用）
  → Horizon: regime-dependent
  → Objective: risk-on / risk-off のエクスポージャー制御
  → Behavior: Sensor認識 → 人間判断 → 商品選択（自動化は未承認）
```

| Account | May do | Must not do（本Record時点） |
|---|---|---|
| NISA | 長期配分・分割/一括投入の検証・継続性評価 | 短期売買最適化・自動売買 |
| 特定口座 | 局面認識に基づく商品エクスポージャー選択の設計議論 | 実装化された売買ロジック・自動執行 |

分離の目的は、長期複利資産と局面対応資産の判断基準混線を防ぐことである。

---

## 4. 特定口座局面運用思想

特定口座は「常時フル投資」を前提としない。  
市場局面（Regime）に応じて、半導体リスクへの参加度を選択する。

```text
Regime Recognition（SOX Sensor）
        ↓
Human Decision Gate
        ↓
Product Exposure Selection
        ↓
（将来）Execution — NOT AUTHORIZED in this registration
```

運用判断の単位は「銘柄の当て」ではなく、**どの半導体エクスポージャー構造を取るか**である。

---

## 5. SOX Sensor 設計思想

### 5.1 Role

```text
SOX Sensor = Market Environment Recognition Layer
```

- 入力: 価格・ボラティリティ・トレンド・関連指数等の観測（設計対象）
- 出力: 局面ラベル / リスク状態の認識結果
- **非出力:** 売買指示、注文、自動リバランス

### 5.2 Boundary

| Layer | Responsibility |
|---|---|
| Sensor | 認識・状態表現 |
| Decision Gate | 人間による採用/却下 |
| Product Map | 局面に対応する商品クラス選択 |
| Execution | 未承認（本Recordでは定義のみ） |

```text
Sensor ≠ Trader
Recognition ≠ Instruction
```

---

## 6. Market Regime 設計

Regime は売買シグナルではなく、エクスポージャー選択の文脈である。

| Regime（概念） | 意図するエクスポージャー姿勢 | 備考 |
|---|---|---|
| Risk-On / Trend | 成長・半導体ベータの許容 | 集中アクティブも選択肢 |
| Neutral / Carry | 分散指数・中程度参加 | 説明容易性を優先しうる |
| Risk-Off / Stress | 縮小・待機・低ベータ | Sensorが「指示」しない。人間が縮小を判断 |
| Recovery / Re-entry | 段階的復帰 | 特定口座の機動性を活用 |

Regime定義の詳細閾値・実装パラメータは **本登録の範囲外**（Implementation NOT AUTHORIZED）。

---

## 7. 半導体商品分類

| Class | 代表商品 | 構造特性 | 口座上の主な役割仮説 |
|---|---|---|---|
| A. US SOX / 円建て指数 | **2243** Global X 半導体 ETF（SOX円換算連動） / Nissay SOX / SOXX | 分散〜準分散、指数連動 | 特定口座の基線ベータ / NISAでも説明容易 |
| B. Japan Semi 集中指数 | **282A** Global X 半導体・トップ10-日本株式 ETF | 国内Top10、高集中・国内要因 | 局面ごとの日本半導体エクスポージャー |
| C. Global Active | **野村** World Semiconductor（世界業種別・世界半導体株投資） | アクティブ、高集中（NVDA等）、グローバル | 超過追求・集中リスク許容時 |
| D. Adjacent Growth | FANG+ / Information Electronics 等 | 半導体以外の成長/関連 | 分散・補完（NISA側で検証済み） |

分類の目的はランキングではなく、**局面×エクスポージャー構造**の対応表を作ること。

---

## 8. 商品評価（設計知識）

### 8.1 2243 — Global X 半導体 ETF

| Item | Assessment |
|---|---|
| Benchmark intent | SOX（配当込み）円換算連動 |
| Structure | 米国半導体ユニバースの指数型（約30銘柄級） |
| Account fit | 特定口座の「標準半導体ベータ」候補。円建て・東証売買で運用しやすい |
| Relation to SOXX/Nissay | 同系（SOX系）。保有・費用・分配・トラッキングで差が出る |
| Design note | Sensor連動の基線商品として扱いやすい。アクティブ超過の対比ベンチにもなる |

定量BTの詳細は NISA_BACKTEST の SOX/ニッセイ/SOXX 比較を参照。2243単体の専用長期パネル評価は今後の検証対象。

### 8.2 282A — Global X 半導体・トップ10-日本株式 ETF

| Item | Assessment |
|---|---|
| Benchmark intent | 日本半導体 Top10 指数連動 |
| Structure | 高集中（10銘柄）、国内要因・為替影響が米国SOXと異なる |
| Account fit | 特定口座で「日本半導体局面」を切り出す道具 |
| Risk | 銘柄数制約により局面変動が大きい |
| Design note | 2243（米国SOX）と役割重複させない。Regimeごとに使い分ける |

設定が新しいため、長期共通期間評価は制約大。短期観測・構造比較を優先する。

### 8.3 野村半導体（World Semiconductor）

| Item | Assessment |
|---|---|
| Type | グローバル・アクティブ |
| Structure evidence | TOP集中が高く、NVDA等への高ウェイトが継続しやすい（structure analysis） |
| vs SOX/SOXX | 最終リターン優位局面あり。要因は「単なる運」ではなく **保有比率差・集中を含む運用判断結果** として評価する |
| Cost | 指数型より高い前提。費用対効果は超過の持続性・集中耐性とセットで判断 |
| Account fit | NISA長期での中核候補になりうる一方、特定口座では Regime=Risk-On 時の選択的採用が設計上自然 |

---

## 9. Active Selection Analysis 結果（登録時点の証拠要約）

Evidence path: `NISA_BACKTEST/reports/semiconductor_active_selection_report.md`  
Config window: 2018-01-01〜2026-07-31（実効比較は holdings 制約内）

### 9.1 要約（vs SOXX、四半期平均・推定）

| Factor | Mean（概算） | 解釈 |
|---|---:|---|
| Total Excess Return | +2.20%/期 | 野村がSOXXを上回る平均超過（期間依存） |
| A 銘柄比率差効果 | +5.34%/期 | 支配的な説明項（推定） |
| B 集中度効果（診断） | +3.19%/期 | Aと概念重複しうる診断指標 |
| C 指数構成差 | −4.80%/期 | 非重複・構成差は逆方向にも作用 |
| D 残差 | +1.66%/期 | FX・費用・非開示銘柄・タイミング差等 |

### 9.2 構造・寄与の要点

- 開示寄与の期間合算では NVDA 寄与が World ≫ SOXX。
- 直近ウェイト差例（World − SOXX）: NVDA 約 +16.6pp、TSM 約 +10.2pp。
- Nissay ↔ SOXX は上位重複が大きく、指数連動同士の構造差は小さい。

### 9.3 設計上の結論（断定禁止・判断材料）

```text
野村の優位性は「純粋な銘柄選択アルファ」単独では説明しない。
保有比率差・集中を含むアクティブ運用判断の結果として評価する。
→ Principle #5 を維持。
```

指数型（2243 / Nissay / SOXX）で十分かは、  
**集中リスクを意図的に取るか**の人間判断に依存する。

---

## 10. 今後の検証方針

| ID | Verification Theme | Goal | Constraint |
|---|---|---|---|
| V-ID-01 | 2243 専用NAV/保有時系列の整備 | SOX系円建て基線の定量比較 | 推測補完禁止 |
| V-ID-02 | 282A 観測期間の延長 | 日本Top10集中の局面特性確認 | 短期断定禁止 |
| V-ID-03 | Regimeラベル（人手）× 事後リターン | Sensor設計の有効性検証 | 自動売買禁止 |
| V-ID-04 | 野村 Active Selection の期間ロバスト性 | 超過要因の安定性確認 | 最適化探索禁止 |
| V-ID-05 | NISA配分との役割衝突チェック | 口座間の方針混線防止 | 既存NISA SoTを壊さない |

```text
Next step = Verification Design
≠ Implementation
≠ Trading Automation
```

---

## 11. Authority & Non-Goals

### Authorized by this registration

- Design knowledge recording
- Product classification language
- Reference to existing analysis artifacts

### Explicitly NOT authorized

- Code / implementation changes
- Trading rule encoding
- Automated order / rebalance
- Modification of ASA-ARCH-* frozen chapters
- Conversion of Sensor output into trade instructions

---

## 12. Related Record IDs

| ID | Relation |
|---|---|
| ASA-BASELINE-INVESTMENT-DECISION-V1.0-001 | **This record** |
| ASA-REGISTER-BASELINE-INVESTMENT-DECISION-V1.0-001 | Registration report |
| ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001 | Related: Minimum Runtime explicitly excludes Investment Decision Logic |
| ASA-ARCH-13.0 | Related: Knowledge Layer（記録保全の上位思想） |
| ASA-ARCH-50.0 | Related: Architecture Completion（別系列。本Recordは非Chapter） |
| Previous Design Record | **NONE** |

---

## 13. Change Control

Allowed transition after registration:

```text
REGISTERED → SUPERSEDED（by V1.1 / V2.0 new baseline）
```

Requires: HUMAN_ARCHITECT approval and new baseline file（additive）。  
In-place silent rewrite of design meaning is prohibited.

---

## 14. Closing Statement

```text
NISA compounds.
Taxable account regimes.
SOX Sensor recognizes; humans decide.
Products express exposure — not predictions.
Active concentration is a judgment result, not a residual to dismiss.
```

本Recordは投資推奨ではない。検証・設計議論のための設計知識である。
