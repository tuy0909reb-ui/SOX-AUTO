# ASA Knowledge Record — NISA Long Term Portfolio Design

**Record ID:** ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0  
**Title:** 新NISA 1800万円枠 長期ポートフォリオ設計記録  
**Document Type:** Analysis / Design Record  
**ASA Domain:** NISA長期運用設計  
**Category:** NISA Long Term Portfolio Design  
**Status:** **DESIGN VALIDATED**  
**Implementation Frozen:** **NO**  
**Investment Execution:** **NOT AUTHORIZED**  
**Trading Authorization:** **NOT AUTHORIZED**  
**Version:** 1.0  
**Date:** 2026-08-03  
**Timestamp:** 2026-08-03T06:55:00+09:00  
**Authority:** HUMAN_ARCHITECT  
**Registration:** ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0  
**Request:** ASA-NISA-PORTFOLIO-DESIGN-REGISTRATION-REQUEST-1.0  
**Previous Related Records:**  
- ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0  
- ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0  
- ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0  
- ASA-LONGTERM-SWING-INTEGRATED-STRATEGY-1.0  
**Subsequent Decision Record:** ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0（2026-08-10・最終採用意思決定）  
**Implementation Authorization:** **NOT AUTHORIZED**  
**Runtime Activation:** **NONE**  
**Investment Decision Status:** **DESIGN RECORD ONLY**（実行拘束なし）／最終採用の意思決定は `ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0` を参照

| Artifact | Path | Status |
|---|---|---|
| Knowledge Record | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0.md` | REGISTERED |
| Registration Report | `docs/reports/ASA-REGISTER-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0.md` | APPROVED |
| Runtime Decision Record | `data/asa_minimum_runtime/records/e5c30001-ede9-4634-8542-fc6f04d0db79.json` | CREATED |
| Runtime Verification Record | `data/asa_minimum_runtime/records/e5c30002-cb46-42e3-87e6-f5e102f8b672.json` | CREATED |
| Related — Portfolio Decision | `docs/baselines/ASA-NISA-LONG-TERM-PORTFOLIO-DECISION-1.0.md` | CONNECTED |
| Related — NISA Semiconductor Analysis | `docs/baselines/ASA-NISA-SEMICONDUCTOR-ANALYSIS-1.0.md` | CONNECTED |
| Related — Taxable Growth Asset | `docs/baselines/ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0.md` | CONNECTED |

```text
This record does NOT create an ASA Architecture Chapter (ASA-ARCH-*).
This record does NOT authorize investment execution or trading.
This record does NOT bind future buy/sell decisions.
ANALYSIS / DESIGN RECORD ONLY.
Preserve allocation design intent and review framework.
```

---

## 1. Registration Purpose

新NISA 1800万円枠について、2031年までの投入方針および長期運用設計を記録する。

目的:

- 投資判断材料の保存
- 設計思想の固定
- 将来見直し時の比較基準保持

```text
Status: ANALYSIS / DESIGN RECORD ONLY
Investment Execution: NOT AUTHORIZED
```

将来の売買判断・投資実行を拘束するものではない。

---

## 2. Design Objective

| Field | Value |
|---|---|
| Primary objective | **税引後資産最大化**（非課税枠の長期複利を含む） |

評価軸:

- 長期成長性
- 非課税メリット最大化
- 継続可能性
- 将来変更余地
- 投資判断の再現性

```text
単純な最大リターン追求ではなく、
長期保有可能な成長資産配置を目的とする。
```

---

## 3. NISA Allocation Decision

### 3.1 Tsumitate Investment Frame（つみたて投資枠）

| Field | Value |
|---|---|
| Amount | **600万円** |
| Asset | ニッセイNYSE FANG+ |
| Role | AI・デジタル成長企業群への長期投資 |
| Allocation status | **固定候補として登録** |

Investment Thesis:

```text
AI活用企業、
大型成長企業、
デジタルプラットフォーム企業の成長取り込み。
```

### 3.2 Growth Investment Frame（成長投資枠）

| Field | Value |
|---|---|
| Amount | **1200万円** |
| Asset | 野村世界業種別投資シリーズ **世界半導体株投資** |
| Role | AI時代の半導体成長領域への長期投資 |
| Allocation status | **固定候補として登録** |

Investment Thesis:

```text
AIインフラ、
半導体製造、
GPU、
メモリ、
関連成長企業への投資。
```

Selection Reason（recorded）:

- SOX指数型との比較分析済み
- 高い成長実績
- アクティブ選択効果を確認
- 半導体企業群の中で銘柄選択による超過リターン可能性を評価

```text
注意:
本判断は「半導体が永久に主役」という前提ではない。

2031年以降、
- 産業構造変化
- AI投資環境
- 半導体利益配分
- 新しい成長テーマ
を再評価する。
```

### 3.3 Aggregate Snapshot

| Frame | Amount | Asset |
|---|---:|---|
| つみたて | 6,000,000 | ニッセイNYSE FANG+ |
| 成長 | 12,000,000 | 野村世界半導体 |
| **合計** | **18,000,000** | — |

---

## 4. Investment Schedule

| Field | Value |
|---|---|
| 投入期間 | **2027年〜2031年** |
| つみたて 年間 | 120万円 |
| 成長 年間 | 240万円 |
| 年間合計 | **360万円** |

```text
特徴:
最終保有額では集中して見えるが、
投入は5年間分散される。

Growth Investment Frame:
1200万円 = 240万円 × 5年間
```

---

## 5. Portfolio Philosophy

```text
本設計は、「半導体への永久固定投資」ではない。

現在の判断:
AI・半導体領域は、今後5年間において高い成長期待を持つ領域。

そのため、
2031年まで: 現在有望な成長領域へ非課税資金を投入。
2031年以降: 市場環境変化に応じて再評価。
```

---

## 6. Future Review Framework（2031年以降）

### Industry

- AI投資継続性
- 半導体需要成長
- 利益配分変化

### Fund

- 野村半導体のアクティブ効果継続性
- 指数比較
- コスト差

### Alternative（比較候補）

- Mega10
- 情報エレクトロニクス
- その他成長商品

```text
目的: 将来の主役交代への対応。
```

---

## 7. NISA Flexibility

```text
新NISA制度上、
売却後は翌年以降、取得価額分の投資枠再利用が可能。

そのため、2031年満額到達後も、段階的な入替を可能とする。

想定例:
1200万円枠を5分割。
1単位: 240万円。
必要時、段階的更新を検討する。
```

本Recordは入替の実行を認可しない。柔軟性の設計認識のみを記録する。

---

## 8. Relationship With Taxable Account

| Account | Asset | Role |
|---|---|---|
| **NISA** | 野村世界半導体（成長枠）/ FANG+（つみたて） | **長期複利保有**（非課税） |
| **Taxable** | 野村世界半導体 | **局面運用対象**（PROTO100等） |

```text
同一商品でも役割を分離する。
NISA = 長期複利保有
Taxable = 局面運用対象
```

Related:

- `ASA-TAXABLE-GROWTH-ASSET-SELECTION-NOMURA-SEMICONDUCTOR-1.0`
- `ASA-TAXABLE-SWING-PROTOCOL-100-TRANSFER-STRATEGY-1.0`

---

## 9. Registration Scope

### REGISTER

- NISA allocation design（つみたて600万 FANG+ / 成長1200万 野村半導体）
- 2031年までの投入スケジュール（年360万 × 5年）
- 設計思想（永久固定ではない / 2031以降再評価）
- Future review framework
- NISA枠再利用による段階入替の設計認識
- 特定口座との役割分離（長期保有 vs 局面運用）

### DO NOT REGISTER / NOT AUTHORIZED

- 投資実行・売買認可
- 自動積立・ブローカー設定の拘束
- 2031年以降の商品入替確定
- 将来収益保証
- ASA Architecture Chapter（ASA-ARCH-*）新設
- 既存 Freeze 改訂
- 特定口座 PROTO100 の実装凍結

---

## 10. Decision Boundary

| YES | NO |
|---|---|
| 現時点のNISA配分設計の保存 | 投資実行の拘束 |
| 2031年までの投入方針の比較基準 | 永久保有保証 |
| 役割分離（NISA vs 特定）の明記 | 2031以降の入替先の確定 |
| 将来再評価フレームワークの保持 | 売買タイミングの指示 |

---

## 11. Next Phase

```text
1. 投入期間中のモニタリング（設計逸脱の有無）
2. 2031年以降の Industry / Fund / Alternative 再評価
3. 必要時のみ段階入替設計の別検証
```

Until then:

```text
Record: ASA-NISA-LONG-TERM-PORTFOLIO-DESIGN-1.0
State: DESIGN VALIDATED
Investment Execution: NOT AUTHORIZED
Implementation Frozen: NO
```

---

## 12. Disclaimer

本記録はNISA長期配分の設計判断保存であり、  
投資推奨・将来収益の保証・取引実行の認可・永久固定ではない。  
依頼原文末尾が途切れていたため、Registration Scope の NOT 側は既存ASA登録慣行に沿って補完した。
