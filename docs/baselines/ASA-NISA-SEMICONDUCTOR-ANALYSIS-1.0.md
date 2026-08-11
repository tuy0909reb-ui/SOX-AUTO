# ASA Knowledge Record — NISA Semiconductor Analysis

**Record ID:** ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
**Title:** NISA長期枠最適化プロジェクト / 半導体商品評価分析結果  
**Document Type:** NISA Long Term Optimization Knowledge Record  
**Category:** Investment Analysis / Semiconductor Strategy Analysis / Portfolio Decision Support  
**Status:** **REGISTERED**（Analysis Result / Judgment Material Only）  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T07:10:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
**Previous Related Record:** ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **UNDECIDED**（判断未確定）  
**Registry Path:** `docs/baselines/ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0.md`

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-NISA-SEMICONDUCTOR-ANALYSIS-1.0.md` | APPROVED |
| Evidence — Structure | `NISA_BACKTEST/reports/semiconductor_structure_report.md` | REFERENCE |
| Evidence — Active Manager | `NISA_BACKTEST/reports/semiconductor_active_manager_report.md` | REFERENCE |
| Evidence — Drawdown Risk | `NISA_BACKTEST/reports/semiconductor_drawdown_risk_report.md` | REFERENCE |
| Evidence — Active Selection | `NISA_BACKTEST/reports/semiconductor_active_selection_report.md` | REFERENCE |
| Evidence — Long-term Evaluation CSV | `NISA_BACKTEST/reports/semiconductor_long_term_risk_evaluation.csv` | REFERENCE |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize implementation, trading rules, or automation.
This record does NOT finalize NISA product selection.
Preserve analysis results and judgment materials only.
```

---

## 1. Purpose

NISA長期枠最適化プロジェクトにおける半導体商品評価分析結果を、  
ASAへ分析知識・検証履歴・判断材料として保存する。

```text
Save Analysis Results / Judgment Materials
≠ Generate New Investment Decision
≠ Predict Future Returns
≠ Change Recommendation Status
```

本Recordは投資判断そのものを保存しない。  
将来のポートフォリオ設計判断に利用するための検証履歴を保存する。

---

## 2. Classification Scope

| Field | Value |
|---|---|
| Registration Name | ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0 |
| Classification | NISA Long Term Optimization Knowledge Record |
| Domains | Investment Analysis; Semiconductor Strategy Analysis; Portfolio Decision Support |
| Config Window | 2018-01-01 → 2026-07-31（各商品取得可能期間内） |
| Active Manager Effective Period | 2022Q4 → 2026Q3（holdings制約内） |

---

## 3. Semiconductor Product Classification Result

| Product | Classification | Comparison Axis Role |
|---|---|---|
| World Semiconductor（野村世界業種別・世界半導体株投資） | **半導体成長企業選択型アクティブファンド**（SOX指数連動ではない） | アクティブ勝者選択 |
| SOXX ETF | 半導体指数ETF | 指数運用 |
| Nissay SOX | SOX指数連動投信 | 指数運用 |

```text
比較軸:
  指数運用  vs  アクティブ勝者選択
```

重要認識: World Semiconductor を指数連動商品と同一クラスで評価しない。

関連設計知識: `ASA-BASELINE-INVESTMENT-DECISION-V1.0-001` §7–§8。

---

## 4. Active Manager Analysis Result（Saved Summary）

**Comparison:** World Semiconductor vs SOXX  
**Effective analysis period:** 2022Q4〜2026Q3  
**Evidence:** `semiconductor_active_manager_report.md` および関連CSV

### 4.1 Major Overweights（average）

| Ticker | Avg Overweight vs SOXX |
|---|---:|
| NVDA | +17.8pp |
| TSM | +9.3pp |
| AVGO | +6.2pp |
| ASML | +3.2pp |
| SK Hynix | +2.9pp |

### 4.2 Active Contribution（cumulative, disclosed scope）

| Ticker | Active Contribution |
|---|---:|
| NVDA | +0.507 |
| TSM | +0.207 |
| AVGO | +0.146 |
| SK Hynix | +0.074 |
| ASML | +0.057 |

**NVDA share of total active contribution:** 約 **53.1%**

### 4.3 Saved Judgment Material（not a trade decision）

```text
World Semiconductor の超過収益は、
ファンドマネージャーによる指数との差分配分判断によって発生した。

ただし、成功寄与は NVDA 等一部銘柄へ集中している。
NVDA除外による能力評価は行わない（集中自体がアクティブ判断）。
```

---

## 5. Drawdown / Risk Analysis Result（Saved Summary）

**Evidence:** `semiconductor_drawdown_risk_report.md`  
**Targets:** World Semiconductor / SOXX ETF / Nissay SOX

### 5.1 Maximum Drawdown（available NAV windows）

| Fund | Max Drawdown |
|---|---:|
| World Semiconductor | −38.6% |
| SOXX ETF | −46.3% |
| Nissay SOX | −45.5% |

### 5.2 Major Crisis Windows

| Window | World | SOXX | Nissay |
|---|---:|---:|---:|
| 2022 semiconductor adjustment | −30.6% | −46.1% | insufficient overlap |
| 2024 semiconductor adjustment | −38.6% | −41.8% | −45.5% |

### 5.3 Saved Judgment Material

```text
World Semiconductor は高集中型であるが、
対象期間では SOX 指数型より浅い下落を示した。

これは将来保証ではなく、実績比較の判断材料である。
```

---

## 6. Concentration Risk Information

### 6.1 Average TOP1 Weight

| Fund | Avg TOP1 |
|---|---:|
| World Semiconductor | 26.7% |
| Nissay SOX | 11.3% |
| SOXX ETF | 8.8% |

### 6.2 SEMI_2024 NVDA Impact Estimate

| Fund | NVDA Weight (asof crisis start) | Drawdown Contribution |
|---|---:|---:|
| World Semiconductor | 29.2% | −3.61pp |
| Nissay SOX | 15.3% | −1.89pp |
| SOXX ETF | 8.5% | −1.06pp |

計算定義: `drawdown_contribution = (weight/100) × ticker_return`（推測補完なし）

### 6.3 Saved Judgment Material

```text
World Semiconductor は、
勝者集中による上振れ効果と、
集中銘柄逆風時の下落リスクを併せ持つ。
```

---

## 7. NISA Decision Connection（Undecided）

### 7.1 Current Decision State

```text
NISA product selection status = UNDECIDED
```

**Reason recorded:**  
NISA評価には、特定口座SOX運用プロトコルが影響するため、商品単体比較のみでは確定しない。

### 7.2 Current Role Hypotheses（not adopted decisions）

| Account | Role Hypothesis | Candidates（仮説） |
|---|---|---|
| NISA | 長期成長枠 | SOX指数商品 / World Semiconductor |
| 特定口座 | 局面運用枠 | SOX ETF / シリコンサイクル判断運用 |

```text
Hypothesis ≠ Decision
Candidate ≠ Recommendation
```

---

## 8. Future Judgment Frame（Handoff Only）

NISA最終判断は、商品単体比較ではなく次の積で評価する。

```text
商品 × 運用プロトコル × ポートフォリオ役割
```

### 8.1 Planned Comparison Sets（not executed here）

| ID | NISA sleeve | Taxable sleeve |
|---|---|---|
| A | NISA SOX | 特定口座 SOX ETF |
| B | NISA World Semiconductor | 特定口座 SOX ETF |
| C | NISA 混合 | 特定口座 SOX ETF |

### 8.2 Planned Evaluation Metrics

- 最終資産額
- CAGR
- 最大含み損
- 回復期間
- 投入タイミング影響
- 継続可能性

```text
Next = Portfolio-role verification design
≠ Immediate product recommendation
≠ Implementation authorization
```

---

## 9. Authority & Non-Goals

### Authorized by this registration

- Preservation of semiconductor analysis summaries
- Preservation of NISA judgment materials / undecided state
- Cross-reference to existing NISA_BACKTEST evidence artifacts
- Handoff frame for subsequent portfolio-role evaluation

### Explicitly NOT authorized / NOT performed

- Generation of new investment decisions
- Future return prediction / scenario price forecasting
- Change of recommendation status
- Modification of existing analysis result files
- Trading rule encoding / runtime activation
- ASA-ARCH-* chapter creation or mutation

---

## 10. Related Record IDs

| ID | Relation |
|---|---|
| ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0 | **This record** |
| ASA-REGISTER-NISA-SEMICONDUCTOR-ANALYSIS-1.0 | Registration report |
| ASA-BASELINE-INVESTMENT-DECISION-V1.0-001 | Parent design knowledge（roles / product classes） |
| ASA-REGISTER-BASELINE-INVESTMENT-DECISION-V1.0-001 | Parent registration |
| ASA-BASELINE-MINIMUM-RUNTIME-V0.1-001 | Related exclusion: Investment Decision Logic outside Minimum Runtime |

---

## 11. Change Control

```text
REGISTERED → SUPERSEDED（by 1.1 / 2.0 new record）
```

Requires HUMAN_ARCHITECT approval and additive new file.  
In-place silent rewrite of analysis meaning is prohibited.

---

## 12. Closing Statement

```text
Analysis preserved.
Judgment remains undecided.
NISA final choice requires product × protocol × portfolio role.
No trading authorization issued.
```
