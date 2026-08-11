# ASA Component Knowledge Record — Swing Protocol Freeze Candidate

**Component ID:** SWING-PROTOCOL-FREEZE-1.0  
**Title:** Swing Trading Protocol v1.0（Standalone Component）  
**Document Type:** Component Knowledge Record / Freeze Candidate  
**Category:** Taxable-account Swing Trading Component  
**ASA Status:** **VALIDATED COMPONENT / FREEZE CANDIDATE**  
**Integration:** **PENDING**  
**Formal ASA Freeze Registration:** **NOT ISSUED**  
**Version:** 1.0  
**Date:** 2026-08-02  
**Timestamp:** 2026-08-02T15:40:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-SWING-PROTOCOL-FREEZE-1.0  
**Revision:** Workflow Boundary Correction  
**Previous Related Record:** ASA-BASELINE-INVESTMENT-DECISION-V1.0-001  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Trading Rule Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Integrated Operations Freeze:** **NOT ISSUED**

| Artifact | Path | Status |
|---|---|---|
| Component Knowledge Record | `docs/baselines/ASA-SWING-PROTOCOL-FREEZE-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-SWING-PROTOCOL-FREEZE-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/f89661f6-f9d5-47ec-b39b-593a2fc05f4c.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/b8803b86-65f2-42d5-88f1-8ed1f0de0fbe.json` | CREATED |
| Protocol Spec Snapshot | `data/common_backtest/reports/swing_protocol_freeze/SWING_PROTOCOL_v1.0_FREEZE.md` | REFERENCE |
| Freeze Manifest | `data/common_backtest/reports/swing_protocol_freeze/freeze_manifest.json` | REFERENCE |
| Validation Index | `data/common_backtest/reports/swing_protocol_freeze/validation_reference.md` | REFERENCE |

```text
This record does NOT mean Integrated Operations Protocol completion.
This record does NOT authorize trading, automation, or capital transfer rules.
SWING-PROTOCOL-FREEZE-1.0 = Standalone Swing Component only.
Integration = PENDING（dependent parent: 中長期運用プロトコル — undefined）.
```

---

## 1. Purpose

スイング戦略単体の検証完了結果を ASA に記録し、仕様候補として保持する。

```text
Record Validated Swing Component
≠ Complete Integrated Operations Protocol
≠ Authorize Live Trading
≠ Define Capital Transfer Boundaries
```

---

## 2. Positioning

SWING-PROTOCOL-FREEZE-1.0 は、将来の統合運用プロトコルを構成する**一要素**として記録する。

| Field | Value |
|---|---|
| Scope | Swing Trading Component |
| Boundary | Standalone Component Only |
| State | VALIDATED COMPONENT |
| Freeze class | FREEZE CANDIDATE（component-level hold） |
| Integration | PENDING |

### Excluded（未登録範囲）

- 中長期運用プロトコル
- 成長局面判定
- 中長期売却条件
- 資金移動条件
- 再投入条件
- 統合ポートフォリオ設計

**理由:** 中長期プロトコルが未確定であり、統合境界を定義する段階ではない。

---

## 3. Recorded Decision（Component Hold）

スイング戦略単体検証は完了。  
以下仕様を**固定候補**として保持する（統合正式凍結ではない）。

### 3.1 Entry

- 判定: EOD（日次終値後）
- 優先順位: (1) 1570条件 (2) 282A条件 (3) CASH
- 1570: 日経225 52週高値比 <= -15%
- 282A: `semi_signal`
- 新規判定はフラット時のみ

### 3.2 Holding

- 保有中の局面変化による切替なし（Case A）
- 禁止: 1570↔282A 移行、保有中追加判断
- 局面判定は Entry 専用情報

### 3.3 Exit

- 282A: 基本保有 15営業日 + 異常時撤退
- 1570: 基本保有 20営業日
- +10%利確等は比較検証済・必須採用しない
- 固定損切: 採用しない

### 3.4 Execution

- 翌営業日約定
- 想定 slippage 片道 0.1%（許容最大 0.3%）
- 厳格指値必須運用: 禁止（必須条件化しない）

### 3.5 Capital（component feasibility）

- 500万円: 運用可能（検証済）
- 1000万円: 運用可能（検証済）
- ※資金移動ルール自体は本記録の対象外

---

## 4. Evidence（Read-only）

| Evidence | Path |
|---|---|
| Transition Validation | `data/common_backtest/reports/swing_transition_validation/` |
| Execution Cost Validation | `data/common_backtest/reports/swing_execution_cost_validation/` |
| Protocol Freeze Package | `data/common_backtest/reports/swing_protocol_freeze/` |
| Integrated BT（component） | `data/common_backtest/reports/swing_integrated_backtest/` |
| Exit Validation | `data/common_backtest/reports/swing_exit_validation/` |
| Capital Validation | `data/common_backtest/reports/swing_capital_validation/` |

Confirmed:

- Case A（非切替）採用
- 翌営業・手数料・TER・slippage・税引後でも期待値維持
- 500万 / 1000万の執行成立

---

## 5. Freeze Boundary

| In scope（component hold） | Out of scope（not registered） |
|---|---|
| Entry / Holding / Exit / Execution 仕様候補 | 中長期との接続 |
| スタンドアロン検証証跡 | 資金移動 |
| FREEZE CANDIDATE 保持 | 運用全体ルール |
| | ASA 正式統合凍結 |

変更が必要な場合は **新 Version** として別検証する（本 1.0 を上書きしない）。

---

## 6. Next Phase

```text
1. 中長期運用プロトコル確定
2. スイングプロトコルとの境界設計
3. 統合運用プロトコル設計
4. ASA 正式凍結登録
```

Until then:

```text
Component: SWING-PROTOCOL-FREEZE-1.0
State: VALIDATED COMPONENT
Integration: PENDING
Reason: Dependent parent protocol（中長期運用プロトコル）未確定
```

---

## 7. Disclaimer

本記録は定量検証に基づくコンポーネント仕様保持であり、投資推奨・将来収益の保証・取引実行の認可ではない。
