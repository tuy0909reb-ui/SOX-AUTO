# FORTRESS-TAXABLE-STATE-OWNERSHIP-ARCHITECTURE-REVIEW-1.0

**Document ID:** `FORTRESS-TAXABLE-STATE-OWNERSHIP-ARCHITECTURE-REVIEW-1.0`  
**Title:** Taxable Account — State Ownership Architecture Review  
**種別:** Architecture Review Only（責務境界の確認。修正指示・実装許可ではない）  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-STATE-OWNERSHIP-ARCHITECTURE-REVIEW-1.0.md`  

**Related（読取のみ）:**

- `docs/reports/FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0.md`
- `docs/baselines/FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0.md`
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0.md`
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0.md`
- `docs/baselines/ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0.md`
- `docs/baselines/FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0.md`（+ Mapping / Evidence）

**制約遵守:** Code変更なし / Logic変更なし / Schema変更なし / Freeze変更なし

---

## 判定

### **RETURN FOR REVISION**

**理由（要約）:**

HTR 導入の動機（人間が即時執行できない → Case A / Case B の差分を残す）は妥当である。  
しかし現行 Ownership では、特に Growth 移管・Exit 完了について:

- Protocol Decision の進行
- Human Action の有無
- Actual Position の同期

が **同一 `TaxableAccountState` + 二重意味イベント** に畳み込まれ、  
背景にある比較検証（後から Case A vs Case B を区別する）を **アーキテクチャとして保証できない**。

本判定は Protocol 条件・HTR Port・Display Freeze の破棄を意味しない。  
**State Ownership（何がどの層の正か）を Design Decision で改訂してから**、  
Rulebook の Human Execution Boundary を Live 正として昇格すべき、という意味での RETURN である。

---

## 背景の再定式化

```text
目的とする検証軸（3層）:

1. Decision   … プロトコル通りならどう動いたか（何をすべきだったか）
2. Human Action … 実際に人間が何をしたか（報告された行為）
3. Actual Position … 結果として資産がどうなったか（保有の真実）
```

背景の運用例:

| Case | Human | Trade Fact | 望まれる記録 |
|---|---|---|---|
| **A** | EXIT_PENDING 表示後に売却実行 | あり | Decision=売却指示 / Action=売却 / Position=移管後 |
| **B** | 未実行 | なし | Decision=売却指示のまま / Action=なし / Position=旧保有のまま |

現行が保証すべきなのは **B が A に見えないこと**（State だけ見て「移管完了」と誤読しないこと）である。

---

## 1. 現行 State 責務確認

凡例: **D** = Decision / **H** = Human Action / **P** = Actual Position

| 対象 | 現行の意味（実装・Freeze） | 主に表すもの | D / H / P |
|---|---|---|---|
| **TaxableAccountState** | Protocol Runtime 永続 SoT。Regime・Position・signals・entry/exit 簿記を一体保持 | 「運用マシンの現在地」。Decision 進行と、Fill 後の疑似 Position が同居 | **D 主体 + 部分 P（同期後）**。**H を保持しない** |
| **Regime State** | Growth/Swing 袖モード（GROWTH / EXIT_PENDING / SWING / REENTRY） | 袖戦略の判断状態 | **D** |
| **Position State** | Swing ライフサイクル（WAIT…ENTRY_READY…ACTIVE…EXIT…） | 袖内ポジション段階。Fill 後は保有同期に近づく | **D（段階）+ 部分 P（FILLED 後）** |
| **Trade Fact** | 証券世界の売買報告（asset/side/date/price/quantity/confirm） | 人間が報告した約定 | **H**（報告ベース）。Broker 一次真実の代理 |
| **Journal** | Trade Fact の append-only 証拠。State SoT ではない | Human Action の時系列 | **H の保管**。P の Ledger ではない |

### 整理（所有の欠落）

```text
現行で明確:
  D ← Regime / 多くの Position 段階 / Selection / Risk trigger
  H ← Trade Fact + Journal（報告されたときのみ）

現行で曖昧・不足:
  P ← 独立 SoT が無い。
      held_asset / entry_* / exit_* は State 内の「同期簿記」であり、
      auto_* や --record-* でも更新され、H と必ず対応しない。
```

**Actual Position（証券会社の真実）** はシステム外にあり、  
システム内で最も近いのは **受理済み Trade Fact の積み上げ** だが、  
それは Ledger 化されておらず、State の `held_asset` と自動照合する層もない。

---

## 2. Event 意味確認

| Event | 現在の意味（併存） | 望ましい意味（比較検証の観点） | 多重意味問題 |
|---|---|---|---|
| **TRANSFER_COMPLETE** | (1) Runtime `auto_transfer`: Alert 後の **ops/execution ack**（Detailed Spec）→ Regime を SWING へ進める **D 進行** (2) HTR Growth SELL: 人間売却報告のルート → **H→P 同期** として使われる | **分離が必要**。D なら「移管判断の完了／袖切替許可」と H/P「野村売却完了」を別名または別記録にすべき | **あり（本レビューの中核）** |
| **EXIT_FILLED** | (1) HTR / `--record-exit`: 実約定（価格・日付）で Position 同期 **H→P** (2) `auto_exit_fill`: mark price で同ステップ完了 → **D 進行に見える P 更新** | Live では **B: 実際の取引完了（H 報告後）** のみが P を動かすべき。Exit **条件成立**は別イベント（既存 STOP/TIME）で足りる | **あり**（Live 既定で顕在） |
| **RECOVERY_COMPLETE** | (1) Runtime: Alert OFF + Model B 経路で Regime 復帰 **D** (2) HTR Growth BUY: 人間の買戻し報告ルート **H→P** | D（復帰条件充足）と H/P（Growth 再保有の事実）を分離しないと Case A/B が潰れる | **あり** |

### A vs B ラベル（現状）

| Event | 現状どちらが強いか | 備考 |
|---|---|---|
| TRANSFER_COMPLETE | Live Runtime では **A（Decision 遷移）が先行**。HTR では **B（取引完了）経路** | 同一名で A/B 兼用 |
| EXIT_FILLED | 名称は **B**。`auto_exit_fill` 時は **A 的に発火**しつつ P フィールドを書き換え | 名前と Live 挙動が不一致 |
| RECOVERY_COMPLETE | Spec 上 Detection/D 寄り。HTR でも **B 経路** | 兼用 |

---

## 3. auto 系 Runtime 確認

| フラグ | 設計コメント上の意図 | Live ops 実挙動 | A（Decision 内部）か B（Actual Position）か | Rulebook（Human 最終実行者）との整合 |
|---|---|---|---|---|
| **auto_fill** | Paper: ENTRY_READY→ENTRY_FILLED | **False** | Live では無効 → Entry の P 更新は H 待ち | **整合** |
| **auto_transfer** | Paper: EXIT_PENDING→TRANSFER_COMPLETE | **True 固定** | State/Regime を進めるため **A 意図に見えるが、held/transfer フラグまで動かし HTR SELL 前提を壊し得る → 実質 B 汚染** | **非整合**（Case B を State 上消去し得る） |
| **auto_exit_fill** | Paper: EXIT→EXIT_FILLED | **既定 True（未上書き）** | mark で exit_* / Position を更新 → **B（Actual 相当）を無人で書く** | **非整合** |

**回答:**  
コメント上は **A（Simulation / Decision 進行用）** を名乗っている。  
Live での `auto_transfer` / `auto_exit_fill` は **Actual Position 相当フィールドを更新する B 行為**になっており、  
Rulebook「Human が最終実行者」および背景の Case A/B 検証と **両立しない**。

`auto_fill=False` のみ HTR Freeze / Runtime Freeze と整合。  
**Ownership 改訂なしに Rulebook を Live 正と読むことはできない。**

---

## 4. 推奨 Architecture 案の比較

### 案A — 現 State を Decision 中心として維持。Position/Facts を別管理

```text
TaxableAccountState  ≈ Decision SoT（判断・段階・命令源）
Trade Fact / Journal = Human Action
（将来）Position 投影 or Broker snapshot = Actual Position
```

| 項目 | 評価 |
|---|---|
| **メリット** | Protocol Freeze（条件式）への侵襲が小さい。Decision 再生（「プロトコル通りなら」）が State から読みやすい。HTR/Journal を H 軸として活かせる |
| **デメリット** | いま State に載っている entry/exit/held を「Decision ではない」と切り出す定義作業が要る。Display が「戦力状況」に何を出すか再契約が必要 |
| **現行 Freeze への影響** | Protocol 条件: 低〜中（意味の読み替え）。HTR: 低（強化）。Runtime: 中（`auto_*` を Decision-only と再定義）。Display: 中（P 表示の Soruce 明示） |
| **実装規模** | 中（意味固定＋Live 既定の切り分けが主。本レビュー範囲外） |
| **推奨度** | ★★★☆☆ — 最小侵襲で比較軸を文書化できるが、P 層が「将来」だと検証が弱い |

### 案B — Live では Human Trade Report 後のみ Position 更新

```text
Live:
  Decision イベント（ALERT / ENTRY_READY / STOP / TIME_EXIT…）は進める
  ENTRY_FILLED / EXIT_FILLED /（事実としての）TRANSFER / Recovery fill
  → HTR 後のみ
Paper:
  auto_* 明示的に Simulation
```

| 項目 | 評価 |
|---|---|
| **メリット** | 背景 Case A/B を State 上でも区別しやすい。Rulebook / HTR Growth SELL ガードと一致。Exit 未報告なら EXIT_PENDING/EXIT が残る |
| **デメリット** | Live ops 既定・replay 前提の見直し。Detailed Spec「TRANSFER_COMPLETE = ops ack」との読み調整が必要。未報告が長引くと Decision と Display が「売り待ち」で滞留（それは仕様として望ましい場合あり） |
| **現行 Freeze への影響** | Runtime Freeze / ops 既定: **高**。HTR: 整合方向。Protocol 条件式: 低（イベント発火タイミングの運用変更）。Display: 低〜中 |
| **実装規模** | 小〜中（主に Live `RuntimeConfig` と経路の意味固定。Schema 必須ではない） |
| **推奨度** | ★★★★☆ — 現行コンポーネントのままで Case A/B を最も早く保証しやすい |

### 案C — Decision State / Human Action / Position State の 3 層分離

```text
Decision State  … プロトコル判断・段階・命令（再生可能）
Human Action    … Trade Fact / Journal（報告の正）
Position State  … Actual（または報告から畳み込んだ保有投影）を Decision と分離
```

| 項目 | 評価 |
|---|---|
| **メリット** | 確認事項5の3軸比較を **第一級** で満たす。イベント多重意味を構造で禁止できる。長期の検証可能性が最大 |
| **デメリット** | Schema / 永続モデル / ViewModel / Display 写像の再設計が大きい。既存 Freeze の「Position SoT = TaxableAccountState 内」前提と衝突し得る |
| **現行 Freeze への影響** | **高**（新 Design + 版上げが必要。本レビューは Freeze 変更しない） |
| **実装規模** | 大 |
| **推奨度** | ★★★★★（目標アーキテクチャ） / 短期採用は ★★☆☆☆ |

### 比較サマリ

| 案 | 比較検証（§5） | Freeze 侵襲 | 短期現実性 | 推奨度 |
|---|---|---|---|---|
| A | 部分（P が弱い） | 中 | 中 | 中 |
| B | 高（現行部品で） | 中（Runtime/ops） | **高** | **短期推奨** |
| C | **最高** | 高 | 低 | **長期推奨** |

**Architecture 推奨（非拘束・実装許可ではない）:**

```text
段階導入:
  今すぐの Design Decision → 案B を Live Ownership の正とする
  中長期の目標形     → 案C（Decision / Human Action / Position の明示分離）
  案A               → 案C に至る過渡の文書戦略として併用可
                     （State を Decision と読む、と先に宣言する）
```

---

## 5. 比較検証用途

| 検証軸 | 現行で可能か | 条件・欠陥 |
|---|---|---|
| **プロトコル通りならどう動いたか** | **部分的 Yes** | Detection→Decision のイベント履歴・State 再生で近似可能。ただし `auto_*` が「執行済み」まで進めると Decision と Execution が混線 |
| **実際に人間が何をしたか** | **Yes（報告分のみ）** | Journal の ACCEPTED/REJECTED Trade Fact。未報告（Case B）は「記録が無い」ことでしか表現されない — それは正しいが、State が先に進むと「未報告なのに完了」と誤読される |
| **結果として資産がどうなったか** | **弱い** | Broker 一次データなし。State の held/entry/exit は P の代理だが auto/record でも更新される。Journal 積み上げの正式な Position 投影はない |

### 背景 Case への当てはめ

| Case | 現行 Live（`auto_transfer`/`auto_exit_fill` On） | Ownership 改訂後に望む姿（案B/C） |
|---|---|---|
| **A** 売却実行→報告 | Journal あり。State も完了。比較は可能だが「誰が State を進めたか」が曖昧 | Decision=指示 / H=Fact / P=同期 が一意 |
| **B** 未実行 | Journal なしなのに State が TRANSFER/EXIT_FILLED 済みになり **得る** → **差分消失** | Decision=指示のまま / H=なし / P=旧保有のまま → **差分が残る** |

**結論:**  
現状のままでは、目的とする「後から Case A/B を検証可能」は **アーキテクチャ保証されていない**。  
これが本レビューを **RETURN FOR REVISION** とする直接理由である。

---

## 6. 改訂に向けた Design Decision 論点（実装しない）

Freeze / Code を触らず、次の Architecture Decision で決めるべき問い:

1. Live で `TRANSFER_COMPLETE` は **D 専用**か **H/P 専用**か（兼用禁止を宣言するか）  
2. Live で `auto_transfer` / `auto_exit_fill` を **Paper 限定**とするか  
3. Actual Position のシステム内代理を **Journal のみ**とするか、**分離 Position 投影**を将来持つか（案C）  
4. Human Display「戦力状況」は D か P か（混在禁止のルール）  
5. Rulebook を ACTIVE にする前に、上記 Ownership を Rulebook §3 に反映するか  

本レビューはいずれの採用も指示しない。

---

## 7. 変更しないもの（本レビューの範囲）

- Code / Logic / Schema  
- 既存 Freeze 文書  
- Protocol Entry/Exit/Risk/Selection 条件式  
- HTR Port の存在意義（人間遅延を許す入力境界 — **動機は PASS**）  
- Human Display / Evidence の凍結契約  

---

## 8. 先行レビューとの関係

| 文書 | 判定 | 本レビューとの差 |
|---|---|---|
| `FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0` | CONDITIONAL PASS | 「意味が一意でない」ことを確認 |
| **本文書** | **RETURN FOR REVISION** | 「比較検証という目的に対し Ownership が不足」と昇格して差し戻し |

矛盾ではなく、**確認深度の違い**である。

---

## Version

```text
Status: ARCHITECTURE REVIEW COMPLETE
Judgment: RETURN FOR REVISION
FORTRESS-TAXABLE-STATE-OWNERSHIP-ARCHITECTURE-REVIEW-1.0

Purpose unmet without Ownership Design Decision:
  Decision vs Human Action vs Actual Position comparability (Case A/B)

Recommended direction (non-binding):
  Near-term ownership: Option B
  Long-term target: Option C

Changes: 本レポート新規のみ
Code: NONE / Logic: NONE / Schema: NONE / Freeze: NONE
```
