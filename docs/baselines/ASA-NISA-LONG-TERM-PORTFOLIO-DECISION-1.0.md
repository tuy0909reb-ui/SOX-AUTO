# ASA Knowledge Record — NISA Long-Term Portfolio Decision

**Record ID:** ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0  
**Title:** NISA LONG-TERM PORTFOLIO DECISION RECORD  
**Document Type:** Decision Record（意思決定記録）  
**ASA Domain:** NISA長期運用 / 口座役割分離  
**Category:** NISA Long-Term Portfolio Decision  
**Status:** **DECISION REGISTERED**  
**Implementation Frozen:** **NO**  
**Investment Execution:** **NOT AUTHORIZED**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Version:** 1.0  
**Date:** 2026-08-10  
**Timestamp:** 2026-08-10T17:39:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0  
**Request:** ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-REGISTRATION-REQUEST-1.0  
**Previous / Related Records:**  
- ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0（設計記録・本Decisionの前提）  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
- ASA-BASELINE-INVESTMENT-DECISION-V1.0-001（NISA↔特定の役割分離原則）  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DECISION RECORDED**（実行拘束なし）

| Artifact | Path | Status |
|---|---|---|
| Decision Record | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/f6d40001-ede9-4634-8542-fc6f04d0db80.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/f6d40002-cb46-42e3-87e6-f5e102f8b673.json` | CREATED |
| Related — Portfolio Design | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0.md` | CONNECTED |
| Evidence — Info Complementarity | `scratch/nisa_7fund_comparison_001/reports/info_electronics_complementarity_check.md` | REFERENCE |
| Evidence — Full PF Comparison | `scratch/nisa_7fund_comparison_001/reports/nisa_full_pf_comparison_report.md` | REFERENCE |
| Evidence — Verification | `scratch/nisa_7fund_comparison_001/reports/investment_decision_analysis_003_verification.md` | REFERENCE |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize investment execution or trading.
This record is NOT a product ranking.
It records a role-separated NISA vs Taxable (FORTRESS) portfolio decision.
DECISION RECORD ONLY — no broker binding.
```

---

## 1. Purpose

新NISA **1,800万円枠**を、**20年以上**の長期運用で**税引後資産最大化**するための意思決定を、ASAに登録する。

```text
Record the decision
≠ Rank products by past CAGR
≠ Authorize buys/sells
≠ Bind broker automation
```

---

## 2. Operating Principles（Fixed）

| # | Principle | Statement |
|---|---|---|
| 1 | NISA用途 | **長期保有専用**。短期売買判断をNISA内で行わない |
| 2 | 特定口座（FORTRESS） | **局面対応・戦術運用**を担当 |
| 3 | 役割分離 | 同一商品が両口座に現れても、判断基準を混線させない |
| 4 | 評価単位 | 商品単体ランキングではなく、**口座役割＋PF全体** |

```text
NISA     = long-horizon compound / tax-advantaged hold
FORTRESS = regime / tactical exposure control
```

---

## 3. Adopted Allocation（最終採用案）

### 3.1 つみたて投資枠

| Field | Value |
|---|---|
| Amount | **600万円** |
| Asset | **FANG+系ファンド**（設計記録上の参照実装: ニッセイNYSE FANG+） |
| Role | 大型成長株コア / メガキャップ成長への長期投資 |
| Status | **採用** |

### 3.2 成長投資枠

| Field | Value |
|---|---|
| Amount | **1,200万円** |
| Asset | **野村世界業種別投資シリーズ 世界半導体株投資** |
| Role | AI・半導体成長サイクルへの集中投資 / NISA成長枠の期待値最大化 |
| Status | **採用** |

### 3.3 Aggregate

| Frame | Amount | Asset |
|---|---:|---|
| つみたて | 6,000,000 | FANG+系 |
| 成長 | 12,000,000 | 野村世界半導体 |
| **合計** | **18,000,000** | — |

```text
Adopted PF shorthand:
A案 = FANG+600 + 野村1200
```

---

## 4. Decision Rationale（判断根拠）

| # | Ground | Statement |
|---|---|---|
| 1 | Horizon | 投資期間 **20年以上** |
| 2 | Capital nature | **緊急性のない資金**（暴落時に強制売却しない前提） |
| 3 | Risk management locus | **特定口座（FORTRESS）側でリスク管理を別設計** |
| 4 | Investment hypothesis | **今後5年程度の半導体サイクル回復・成長可能性**を仮説として採用（永久固定ではない） |

```text
NISA側で半導体集中を取る理由:
期待値最大化をNISA非課税複利に載せる一方、
経路リスク・局面対応はFORTRESSに分離する。
```

---

## 5. Alternatives Considered（検討履歴）

### 5.1 野村900万円 + 情報エレクトロニクス300万円（B案）

| Item | Result |
|---|---|
| Evidence | `info_electronics_complementarity_check.md` / `nisa_full_pf_comparison_report.md` |
| Observed | CAGR低下 **約1.4pt** / MDD改善 **約1.5pt** / Sharpe改善 |
| Complementarity | 半導体弱気局面での下支えは**実在**（同時下落のみではない） |
| Classification | 「期待リターンを犠牲にした分散」（期待値ほぼ維持型の補完ではない） |
| **Decision** | **現時点で不採用** |

```text
判断:
分散効果は確認されたが、
期待値低下を許容するほどのリスク低減ではない。
（経路リスクの緩和はFORTRESS側設計で担う）
```

### 5.2 メガ10 / S&P500 Top10

| Item | Result |
|---|---|
| Overlap | **FANG+との成長波重複が大きい** |
| Diversification | 独立したリスク源泉としての分散効果が**限定的** |
| Quality notes | Top10 PROXYは参考のみ / Tracers・メガ10実投信は短期 |
| **Decision** | **不採用** |

### 5.3 その他7商品候補（AB / BG / FT 等）

| Item | Result |
|---|---|
| Context | NISA全体PF（FANG+600固定）での補完候補比較 |
| Result | 野村期待値維持＋半導体集中低減の主解としては情報エレ以外に優位候補なし |
| **Decision** | 成長枠の代替本命としては**不採用**（将来再評価の候補リストには残しうる） |

---

## 6. Re-evaluation Triggers（再評価条件）

次のいずれかを検知した場合、本Decisionを見直し対象とする（自動売買トリガではない）:

1. **半導体成長仮説の崩壊**（需要・利益配分・技術世代の構造変化）
2. **競争優位性の変化**（野村アクティブ効果の持続性喪失、指数対比の構造劣後など）
3. **NISA全体の集中リスク許容範囲超過**（心理的・財務的に長期保有継続が困難と判断される場合）

関連する設計上の再評価枠（2031以降のIndustry / Fund / Alternative）は  
`ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0` を継承する。

---

## 7. Relationship to Design Record & Taxable Account

| Record / Account | Role vs this Decision |
|---|---|
| ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0 | 配分・投入スケジュール等の**設計記録**。本Recordはそれを前提に**意思決定を確定記録** |
| Taxable / FORTRESS | 局面対応・戦術。NISAの長期保有判断を代替しない |
| PROTO100 / Swing系 | 特定口座の戦術レイヤ。NISA内短期売買には適用しない |

```text
Same underlying theme (e.g. semiconductors) may appear in both accounts.
Decision criteria remain separated:
  NISA      = hold / compound
  FORTRESS  = regime / tactical
```

---

## 8. Registration Scope

### REGISTER

- NISA長期PFの**最終採用案**（FANG+600 / 野村1200）
- NISA＝長期保有専用、FORTRESS＝局面・戦術、の役割分離
- B案（情報エレ300）不採用理由
- メガ10 / Top10 不採用理由
- 判断根拠（20年・緊急資金でない・FORTRESS側リスク管理・半導体仮説）
- 再評価条件

### DO NOT REGISTER / NOT AUTHORIZED

- 投資実行・売買認可
- ブローカー自動積立の拘束
- 商品優劣の永久ランキング
- 将来収益保証
- 半導体テーマの永久固定
- ASA-ARCH-* 新設
- 既存 Runtime Freeze の改訂
- NISA内での短期売買プロトコル導入

---

## 9. Decision Boundary

| YES | NO |
|---|---|
| 現時点のNISA配分意思決定の保存 | 売買の実行拘束 |
| 不採用案とその理由の保存 | 「情報エレが無意味」という主張 |
| 役割分離の再確認 | FORTRESS戦術ルールの変更 |
| 再評価条件の明記 | 2031以降の入替先の確定 |

---

## 10. Disclaimer

本記録はNISA長期ポートフォリオの**意思決定保存**であり、  
投資推奨・将来収益の保証・取引実行の認可ではない。  
商品単体の優劣ランキングとして解釈してはならない。
