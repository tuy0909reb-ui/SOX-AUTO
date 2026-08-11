# FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0

**Document ID:** `FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0`  
**Title:** Taxable Account — State Ownership Short-term Decision  
**種別:** Architecture Decision Record（方針決定。実装・Freeze 改訂の実行ではない）  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0.md`  
**Status:** **DECIDED**  

**Parent reviews:**

- `docs/reports/FORTRESS-TAXABLE-STATE-OWNERSHIP-ARCHITECTURE-REVIEW-1.0.md`（RETURN FOR REVISION）
- `docs/reports/FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0.md`（CONDITIONAL PASS）

**制約遵守（本文書）:** Code変更なし / Schema変更なし / Freeze変更なし  

**本文書が許可しないもの:** 実装着手、Freeze REOPEN、Schema 変更。  
**本文書が許可するもの:** 短期 Ownership 方針の正としての参照、将来 CR の Design 前提。

---

## Decision Summary

| # | 決定 |
|---|---|
| **D1** | 短期運用方針として、**Live の Position 更新（約定完了相当）は Human Trade Report + Trade Fact 確定後のみ**とする |
| **D2** | `auto_transfer` / `auto_exit_fill` は **B: Decision / Simulation 用**として扱う（Live Position 更新としては維持しない） |
| **D3** | **3層分離（Decision / Human Action / Position）は将来拡張として記録する**（本決定では採用・実装しない） |

---

## 1. 確認 — Live Position 更新方針と既存 Freeze 思想

### 決定する方針（D1）

```text
Live:
  Decision 進行（機会検知・EXIT_PENDING・ENTRY_READY・STOP/TIME 条件成立等）
    → 報告前に進めてよい

  Position 更新（約定完了相当）
    ENTRY_FILLED / EXIT_FILLED
    Growth SELL に対応する TRANSFER_COMPLETE（事実同期）
    Growth BUY に対応する RECOVERY_COMPLETE（事実同期）
    → Human Trade Report 受理 + Trade Fact（Journal）確定後のみ
```

背景 Case:

| Case | Decision | Human Action | Position（Live） |
|---|---|---|---|
| A: 売却実行→報告 | 売却指示あり | Trade Fact あり | 報告後に更新 |
| B: 未実行 | 売却指示のまま | Trade Fact なし | **更新しない** |

### 既存 Freeze 思想との整合

| 権威 | 整合判定 | 根拠 |
|---|---|---|
| **HTR Port Freeze** | **整合** | Live は fill 確認入力前提（`auto_fill=True` 禁止）。Trade Fact = 証券事実、Port 経由で State 同期。人間遅延を許す設計そのもの |
| **Runtime Freeze** | **方向整合 / 現状運用テキストとは未一致** | Broker 自動発注は未認可。Live `auto_fill=False` は一致。一方 Normal ops に `--record-*` ショートカットが残り、本文書の「Fact 確定後のみ」より緩い。**Freeze 本文の改訂は別 CR**（本決定では触らない） |
| **Detailed Spec** | **部分緊張** | `TRANSFER_COMPLETE` を「ops / execution ack」と書く。D1 は Live での当該イベントを **事実同期側**に寄せる読みを採る。Spec 字面の全面置換はしない；Ownership 上の Live 解釈を本決定で固定する |
| **Human Display / Evidence Freeze** | **整合** | Display は写像のみ。Ownership 変更は Freeze REOPEN を要求しない（命令が「売却」のまま残る時間が増え得るだけ） |
| **Operation Rulebook（DRAFT）** | **整合** | Human Execution Boundary / 報告後 State 更新と一致。Rulebook 昇格時は本決定を前提にできる |

### 確認1の結論

```text
方針 D1 は HTR Freeze 思想・Rulebook 思想と整合する。
Protocol 条件式（Entry/Exit/Risk/Selection）の変更を意味しない。

現行 Live ops 実装（auto_transfer=True / auto_exit_fill 既定 True）および
Runtime Freeze の一部運用記述とは、まだ一致していない。
→ 実装・Freeze 文書の追随は「後日 CR」。本決定はその Design 前提を固定する。
```

**整合判定ラベル:** **CONDITIONAL ALIGNMENT（思想 YES / 現行 Live 配線は未追随）**

---

## 2. 確認 — `auto_transfer` / `auto_exit_fill` の扱い

### 決定（D2）

| フラグ | 決定 | 意味 |
|---|---|---|
| `auto_transfer` | **B** | Decision / Simulation 用。Live Position（事実同期）更新としては扱わない |
| `auto_exit_fill` | **B** | 同上 |
| `auto_fill`（参考） | 既存どおり | Live では False（HTR Freeze）。Paper/Simulation のみ True 可 |

**採用しない選択肢:**

| 選択肢 | 判定 |
|---|---|
| **A: Live Position 更新処理として維持** | **却下** — Case B を消し、HTR Growth SELL 前提と衝突する |

### D2 の運用含意（実装しないが方針として固定）

```text
Paper / Simulation / Replay:
  auto_transfer / auto_exit_fill を Decision 進行・試験短縮に使ってよい
  （「実約定が起きた」とは解釈しない）

Live:
  上記フラグによる EXIT_FILLED / TRANSFER_COMPLETE（事実同期）を
  Position 更新手段として用いない
  Position 更新の正経路 = TradeReportPort → Journal → Routing
```

`--record-entry` / `--record-exit` は Runtime Freeze 上の管理ショートカットとして残存し得るが、  
**通常 Live 運用の正経路ではない**（HTR / `--report-*` / Discord Port が正）。  
本決定は record 経路の削除を命じない（Freeze 非変更）。

---

## 3. 確認 — 3層分離の将来扱い

### 決定（D3）

**3層分離（Decision / Human Action / Position）は将来拡張として記録する。**

```text
将来目標（NOT NOW）:

  Decision State     … プロトコル判断・段階・命令（再生可能）
  Human Action       … Trade Fact / Journal
  Position State     … Actual Position（または報告から畳み込んだ保有投影）
                       を Decision と物理/論理分離
```

| 項目 | 本決定での扱い |
|---|---|
| 短期採用 | **しない** |
| Schema 分離 | **しない**（制約どおり） |
| 記録 | **する** — 長期目標形として本 ADR に残す |
| 短期との関係 | 短期は **D1+D2（Architecture 案B）** で Case A/B を運用保証し、案C は版上げ CR 待ち |

---

## 4. 短期 Ownership モデル（決定後の読み方）

```text
Sensor / Decision
  → Decision 進行（機会・待ち・売却指示・Entry Ready 等）
  → Human Display（命令）

Human Execution（Broker・システム外）

Human Trade Report
  → Trade Fact + Journal 確定
  → はじめて Live Position 更新（約定完了相当イベント）
```

| 層 | 短期の正 |
|---|---|
| Decision | Detection + Engine イベント（Fill 系を除く） |
| Human Action | Trade Fact / Journal |
| Position（Live） | HTR 受理後に更新される State フィールド（held/entry/exit 等） |

独立 Position SoT テーブルは短期では作らない（D3 = 将来）。

---

## 5. 明示的に変更しないもの

本文書の決定にもかかわらず、**いまは変更しない**:

- Code / Logic / RuntimeConfig 既定値  
- Schema / `TaxableAccountState` 形  
- すべての Freeze 本文  
- Protocol Entry / Exit / Risk / Selection 条件  
- Human Display / Evidence 契約  
- HTR Port の外部契約（強化方向の解釈のみ）  

追随が必要な場合の想定 CR 種別（許可ではない）:

1. Live ops / RuntimeConfig 既定の Paper 分離（D2 実装）  
2. Runtime Freeze 運用節の Ownership 追随（Freeze 版上げ）  
3. 将来: 3層分離 Design（D3）  

---

## 6. 判定との関係

| 先行 | 本決定の応答 |
|---|---|
| Ownership Architecture Review = RETURN FOR REVISION | 短期方針 **D1+D2** を DECIDED とし、差し戻し論点を閉じる |
| 3層分離 | 将来拡張（D3）として開き続ける |
| 実装 | **未着手のまま**（別途明示許可が必要） |

---

## Version

```text
Status: DECIDED
FORTRESS-TAXABLE-STATE-OWNERSHIP-DECISION-1.0

D1: Live Position update only after HTR + Trade Fact
    → Aligns with HTR/Rulebook; Live wiring follow-up = future CR
D2: auto_transfer / auto_exit_fill = Decision/Simulation (B), not Live Position (A)
D3: 3-layer separation recorded as future extension (not now)

Code: NONE / Schema: NONE / Freeze: NONE
```
