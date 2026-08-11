# ASA Knowledge Record — LongTerm Swing Integrated Strategy

**Record ID:** ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Title:** LongTerm Swing Integrated Strategy Record  
**Document Type:** Design Judgment / Strategy Architecture Knowledge Record  
**ASA Domain:** NISA / 特定口座統合運用設計  
**Category:** LongTerm Strategy Architecture  
**Status:** **DESIGN VALIDATED**  
**Implementation Frozen:** **NO**  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T18:01:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Previous Related Records:**  
- ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-SWING-PROTOCOL-FREEZE-1.0  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN CANDIDATE ONLY**（売買ルール未確定）  
**Registry Path:** `docs/baselines/ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md`

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/bf1e459f-ede9-4634-8542-fc6f04d0db76.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/0f7f8fbc-cb46-42e3-87e6-f5e102f8b69f.json` | CREATED |
| Evidence — Integrated Validation | `data/common_backtest/reports/longterm_swing_integrated_validation/` | REFERENCE |
| Evidence — Robustness Validation | `data/common_backtest/reports/longterm_swing_integrated_robustness_validation/` | REFERENCE |
| Related Component — Swing | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` | CONNECTED |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize implementation, trading rules, or automation.
This record does NOT freeze capital-transfer or product selection.
Design Validated ≠ Implementation Frozen ≠ Live Trading Authorization.
Preserve design judgment and validation evidence only.
Do not mutate existing datasets or protocols.
```

---

## 1. Purpose

中長期成長資産保有とスイング資産活用を統合した運用思想・検証結果を、  
ASA に設計判断記録として保存する。

```text
Save Design Judgment + Validation Evidence
≠ Finalize Trading Rules
≠ Authorize Live Capital Transfer
≠ Freeze Implementation
```

本Recordは売買ルール確定ではない。  
将来の統合運用設計に利用するための思想・候補モデル・耐久性確認を保存する。

---

## 2. Classification Scope

| Field | Value |
|---|---|
| Registration Name | ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0 |
| ASA Domain | NISA / 特定口座統合運用設計 |
| Category | LongTerm Strategy Architecture |
| Status | DESIGN VALIDATED |
| Implementation Frozen | NO |
| Config Window（evidence） | 2005-01-01 → 2026-07-31（SOXX proxy） |

---

## 3. Core Design Philosophy

### 3.1 Medium/Long sleeve

成長局面では余計な売買を行わず保有継続する。

ただし、成長前提が崩れた可能性がある局面では、  
センサーにより警戒状態を検知し、一部資金をスイング運用へ移動する。

### 3.2 Objective（and non-objective）

```text
目的:
  成長資産の長期複利を維持しながら、
  大規模調整時のリスク低減を図る。

非目的:
  暴落の完全回避
  売買タイミング予測による超過収益最大化
```

---

## 4. Adopted Candidate Model（Design Level）

**Name:** `C_70_30 × dd15_ma200`

### 4.1 Normal allocation（design intent）

```text
中長期資産 70%
スイング資産 30%
```

### 4.2 Alert allocation（design intent）

```text
中長期資産 縮小
スイング資産比率 増加
```

※具体的な執行パラメータ・口座配分・商品確定は未凍結。

### 4.3 Why C_70_30（philosophy fit）

| Criterion | Assessment |
|---|---|
| 税引後で BH 以上（全期間） | YES（evidence） |
| DD 改善 | YES（約13pt） |
| 運用可能な回転数 | YES（年次移動 ~1.9回） |
| 成長局面保有思想との一致 | YES（警戒時も LT 主軸） |
| D_SWING より数値最強か | NO — D は数値強いが思想から外れる |

---

## 5. Sensor Philosophy

センサーの役割は売買タイミング予測ではない。

```text
役割:
  「成長局面継続前提が崩れた可能性の確認」
```

### 5.1 Primary

| Sensor | Role | Why |
|---|---|---|
| `dd15_ma200` | Primary | 構造悪化確認 / 説明可能性 / 過去局面で再現性 |

### 5.2 Auxiliary

- DD15
- VIX系

### 5.3 Unresolved（future verification only）

- WSTS
- TSMC YoY
- DRAM
- 半導体需給指標

---

## 6. Validation Evidence Summary（Read-only）

### 6.1 Integrated validation

| Item | Value |
|---|---|
| LT proxy | SOXX |
| Swing sleeve | 282A / 1570（frozen component rules, read-only reuse） |
| Model | C_70_30 × dd15_ma200 |
| After-tax CAGR vs BH | **+1.62%** |
| MaxDD improvement vs BH | **約 13pt** |
| Evidence | `longterm_swing_integrated_validation/` |

### 6.2 Robustness validation

期間分割:

- 2005–2010
- 2011–2015
- 2016–2020
- 2021–2026

結果:

```text
4/5 期間で税引後 BH 超過
```

弱点:

```text
2016–2020 型
特徴:
  - 強い上昇相場
  - 急落後早期回復
  - 警戒解除遅延による機会損失
```

Evidence: `longterm_swing_integrated_robustness_validation/`

| File | Role |
|---|---|
| `period_split.csv` | 期間分割 |
| `allocation_sensitivity.csv` | 配分感度 |
| `hysteresis_analysis.csv` | ヒステリシス |
| `regime_analysis.csv` | 局面別 |
| `robustness_report.md` | 総合レポート |

---

## 7. Design Trade-offs（Recorded）

| Side | Content |
|---|---|
| Merit | 暴落耐性向上 / DD改善 / 長期複利維持 |
| Cost | 強気相場での一時的機会損失 / 復帰遅延 |

これらは欠陥ではなく、設計上受容するトレードオフとして記録する。

---

## 8. Unresolved Items（Not Decided Here）

以下は今後の検証対象であり、本Recordでは確定しない。

1. 成長資産の商品選択（野村世界半導体 / SOX ETF / 2243 等）
2. スイング資産選択（282A / 1570 等の運用上の確定）
3. センサー追加要素
4. 実運用時の判断メモ

---

## 9. Relation to Swing Component

| Related | State |
|---|---|
| ASA-SWING-PROTOCOL-FREEZE-1.0 | **CONNECTED** — スイング袖の VALIDATED COMPONENT |
| Capital-transfer live rules | **NOT AUTHORIZED** |
| Integrated Operations Protocol freeze | **NOT ISSUED** |

```text
本Record = 中長期×スイング統合の設計判断（Design Validated）
SWING-PROTOCOL-FREEZE-1.0 = スイング単体コンポーネント保持
Implementation Frozen = NO
```

SWING 記録当時の「中長期プロトコル未確定」に対し、  
本Recordは統合設計の**親側設計候補**を埋める。  
ただし実装凍結・取引認可は行わない。

---

## 10. Next Phase

```text
1. 商品選択（NISA / 特定）の接続検証
2. 実運用判断メモの起草（2016–2020型の扱い含む）
3. センサー補助要素の要否確認
4. 必要なら Implementation Freeze を別 Version で申請
```

Until then:

```text
Record: ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0
State: DESIGN VALIDATED
Implementation Frozen: NO
Trading Authorization: NOT AUTHORIZED
```

---

## 11. Disclaimer

本記録は定量検証に基づく設計判断の保存であり、投資推奨・将来収益の保証・取引実行の認可・売買ルール確定ではない。  
既存データセットおよび既存プロトコルは変更していない。
