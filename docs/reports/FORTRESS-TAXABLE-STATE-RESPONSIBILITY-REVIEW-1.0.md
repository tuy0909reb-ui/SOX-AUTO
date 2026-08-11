# FORTRESS-TAXABLE State Responsibility Review

**Document ID:** `FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0`  
**Title:** FORTRESS-TAXABLE State Responsibility Review  
**種別:** Design Review Only（意味確認。修正指示ではない）  
**Date:** 2026-08-08  
**Path:** `docs/reports/FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0.md`  

**参照（読取のみ・本レビューは変更しない）:**

| 文書 | 役割 |
|---|---|
| `FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0` | Human Execution Boundary / 運用読み方（DRAFT） |
| `ASA-TAXABLE-ACCOUNT-PROTOCOL-RUNTIME-FREEZE-1.0` | Live ops 認可・運用手順 |
| `ASA-TAXABLE-ACCOUNT-PROTOCOL-HUMAN-TRADE-REPORT-PORT-1.0` | Trade Fact 入力境界 |
| `FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0` / Mapping / Evidence | Human Display |
| `ASA-TAXABLE-ACCOUNT-PROTOCOL-DETAILED-SPEC-1.0` | State / Event 意味の設計正 |
| 実装 | `taxable_account/`（Code / Logic / Schema 変更なし） |

**制約遵守:** Code変更なし / Logic変更なし / Schema変更なし / Freeze文書変更なし

---

## 判定

### **CONDITIONAL PASS**

層分離（Sensor → Decision → Display → Human → Trade Report → Fact）の**意図**は文書・実装の両方で説明可能である。  
ただし `TRANSFER_COMPLETE` / Live 時の `auto_transfer`・`auto_exit_fill` について、  
「戦略判断の仮想遷移」と「証券世界の約定事実」の意味が**同一イベントに二重定義**されており、  
Rulebook の Human Execution Boundary と現行 Live Runtime は**完全には一致しない**。

本判定は「今すぐ壊れいている」ではなく、  
**Architecture の意味が一意に読める状態ではない（CONDITIONAL）**ことを示す。

---

## 1. 現在の State 責務一覧

### 1.1 各オブジェクトが表すもの

| 対象 | 実装上の役割 | A/B 判定（本レビュー） |
|---|---|---|
| **TaxableAccountState** | Protocol Runtime の永続 SoT（`FileStateStore`）。Regime / Position / シグナル投影 / エントリ・エグジット簿記フィールドを保持 | **主に B: 戦略判断上の仮想（運用）状態**。証券会社残高台帳ではない |
| **PositionState** | Swing 袖のポジション・ライフサイクル（WAIT→…→ENTRY_READY→POSITION_ACTIVE→EXIT→…） | **B（仮想）**。`ENTRY_FILLED` / `EXIT_FILLED` 適用後は「同期済み運用簿記」に近づくが、Broker Ledger ではない |
| **RegimeState**（Growth/Swing） | Growth ↔ Swing 袖の戦略モード（GROWTH_ACTIVE / EXIT_PENDING / SWING_ACTIVE / REENTRY_PENDING） | **B（仮想）**。袖切替の判断状態 |
| **Trade Fact** | 証券世界で起きた売買の報告レコード（asset / side / date / price / quantity / confirm） | **A: 現実の約定事実（報告ベース）** |
| **Journal** | Trade Fact の append-only 証拠層。State SoT ではない | **A の証拠保管**。Protocol Decision の入力に使わない（HTR Freeze） |

**結論 A（全体）:**  
現行 Architecture は **二重 SoT** である。

```text
TaxableAccountState  = Protocol 運用状態の正（仮想〜同期簿記）
Trade Fact / Journal = 証券約定事実の正（報告された事実）
```

HTR Freeze も明示する:

> Trade Fact = 実際に発生した取引事実  
> Position State = 現在の Runtime 状態管理のみ

「現実の資産状態」そのものは **Broker（人間の目）** にあり、システム内では Trade Fact がそれに最も近い。

### 1.2 確認事項 B — 報告前に遷移してよい State vs 報告後に確定すべき State

| 分類 | イベント / 状態 | 意味 |
|---|---|---|
| **報告前に遷移してよい（判断・準備）** | `ALERT_ON` / `ALERT_OFF`、`EXIT_PENDING`、`ENTRY_READY`、`WATCH` / `REENTRY_WAIT`、`STOP_TRIGGERED` / `TIME_EXIT_DUE`（Exit 条件成立）、Asset Selection、Risk arming、`signals` / `alert_on` | 「売買すべき／待機すべき」戦略判断。Human Display の命令源 |
| **Trade Report（または同等の人間確認入力）後に確定すべき（事実同期）** | `ENTRY_FILLED`、`EXIT_FILLED`（実約定価格・日付）、`DELAYED_FILL_RECOVERY`、Growth `SELL`→`TRANSFER_COMPLETE`（HTR 経路）、Growth `BUY`→`RECOVERY_COMPLETE`（HTR 経路） | 「売買が完了した」事実に紐づく同期 |
| **仕様上あいまい（二重定義）** | Runtime の `TRANSFER_COMPLETE`（`auto_transfer`）、Runtime の `EXIT_FILLED`（`auto_exit_fill`）、Runtime の `RECOVERY_COMPLETE`（Alert OFF 経路） | Detailed Spec は `TRANSFER_COMPLETE` を「ops / execution ack」、HTR は Human SELL 事実ルートにも使用 |

---

## 2. Human Execution Boundary との一致点

Rulebook 想定フローと一致している点:

1. **Sensor / Detection** は `MarketCondition` / signals のみ。Broker・Display・Fact を書かない。  
2. **Decision**（Regime / Selection / Position / Risk）は Domain Event と State 遷移のみ。Broker 発注 API はない。  
3. **Human Display / Discord Projection** は読取写像のみ。State を直接書き換えない。  
4. **Broker 自動発注は未実装・Runtime Freeze でも未認可。**  
5. **Live ops の `auto_fill=False`** により、Swing **Entry**（`ENTRY_FILLED`）は原則 Human Trade Report（または ENTRY_READY 限定の `--record-entry`）待ち。  
6. **Discord `/report_*` → Port → Journal → Routing → State** は Rulebook の報告経路と一致。  
7. **Trade Fact は Decision 再計算に使わない**（quantity も Position 制御禁止）— HTR Freeze どおり。

---

## 3. 不一致点

### 3.1 Live Runtime の内部自動完了

| フラグ | Live ops（`python -m taxable_account.ops`） | Rulebook 読みとの関係 |
|---|---|---|
| `auto_fill` | **False**（一致） | Entry 事実は人間報告前提 |
| `auto_transfer` | **True 固定** | Growth 移管完了を報告前に State 確定し得る |
| `auto_exit_fill` | **既定 True（未上書き）** | Exit 完了を mark price で報告前に State 確定し得る |
| recovery 自動 | Alert OFF 経路で `RECOVERY_COMPLETE` 等 | HTR Growth BUY 経路と二重 |

これらは Broker 自動発注ではないが、**Protocol State 上は「約定完了相当」の遷移を人間報告なしで行う**。  
Rulebook の「Live 約定の真実は証券会社 → 報告を受けて初めて Fact 化」とは、**State 側が先行する**点で不一致。

### 3.2 `TRANSFER_COMPLETE` の意味二重性（本レビューの中核）

現行で Alert 成立 →（`auto_transfer`）→ `TRANSFER_COMPLETE` → Swing 側、という流れは:

| 読み | 妥当性 |
|---|---|
| **A. 売買完了した事実** | HTR Growth SELL が同じイベントにルーティングされるため、「事実」としても使われている。しかし `auto_transfer` 時は Journal に約定事実が無い |
| **B. 売買すべき戦略判断** | `EXIT_PENDING` と Display「野村売却」が示すのは判断・命令。`TRANSFER_COMPLETE` を戦略進行の ack と読めば Detailed Spec「ops / execution ack」と整合 |

**現状の実装は A と B を同一イベント名で兼用している。**  
そのため Live で `auto_transfer=True` のあと Human が Growth SELL 報告すると、`EXIT_PENDING` 前提が崩れ **Reject（`growth_sell_requires_exit_pending`）** し得る — Rulebook フロー（表示→約定→報告→State）と矛盾し得る。

### 3.3 Journal なしで State が確定する経路

存在する（意図的・歴史的）:

| 経路 | 通常 Live 運用か |
|---|---|
| Runtime `auto_*` | Live ops でも transfer/exit は有効（上記） |
| CLI `--record-entry` / `--record-exit` | **管理・ショートカット**（Runtime Freeze 明記）。Port/Journal 迂回 |
| 検証 / readiness / replay の直 `on_event` | テスト・演習 |

→ **Trade Fact は「証券約定事実の正本」であるが、「State 確定の唯一経路」ではない。**

### 3.4 文書階層の緊張

Rulebook（DRAFT）は Freeze 優先を自ら宣言。  
一方 Rulebook の Human Execution Boundary 厳格読解は、Runtime Freeze が残す `--record-*` と Live `auto_transfer` と衝突する。  
**運用正の読みが文書間で一意でない。**

---

## 4. 修正不要なもの

本レビュー時点で **意味が明確で、Human Execution Boundary と矛盾しない／意図的二重 SoT として維持すべきもの**:

- Sensor / Decision / Display の層分離  
- Broker 自動発注の不在  
- Live `auto_fill=False`（Entry）  
- Trade Fact / Journal の「証拠層」定義（State SoT にしない）  
- Discord Trade Report が Port を迂回しないこと  
- Human Display / Evidence Freeze の主表示契約  
- PositionState enum・Entry/Exit/Risk 条件式そのもの（Protocol Rule）  
- 「State = Protocol 運用 SoT」「Fact = 証券事実 SoT」という**二重 SoT 自体**（分離は正しい）

---

## 5. 修正が必要な場合の設計案（A/B）

※ 本節は**選択肢の提示のみ**。採用・実装・Freeze 改訂の指示ではない。

### 論点: Live における `TRANSFER_COMPLETE` / Exit Fill / Recovery の意味

#### 案 A — State を「戦略仮想」として公認し、Fact と分離を固定する

```text
方針:
  TRANSFER_COMPLETE / 一部 EXIT・Recovery 自動遷移
  = 戦略モード進行（B: 判断上の仮想状態）
  Trade Fact / Journal
  = 証券約定の唯一の事実正本（A）
  Human Display
  = 仮想 State から「今買う/売る」を出すが、
    State の SWING 移行と Broker 約定の完了は一致しなくてよい
```

| 利点 | 欠点 |
|---|---|
| 現行 Runtime（`auto_transfer` 等）と Detailed Spec「ops ack」に近い | Rulebook「報告後に State 更新」の厳格読解とは一致しない |
| Growth SELL 報告は「事実記録」に縮退させ、State 必須条件を緩和する必要あり | Display「売却」と State「既に Swing」のズレを運用で許容する説明が要る |

#### 案 B — Rulebook Human Execution Boundary を Live の正とし、事実同期まで State を進めない

```text
方針:
  EXIT_PENDING / EXIT / REENTRY_PENDING は「判断・命令」まで
  TRANSFER_COMPLETE / EXIT_FILLED /（該当する）RECOVERY_COMPLETE
  = Human Trade Report（または同等 Port）後のみ
  Live: auto_transfer=False, auto_exit_fill=False
  Paper: 現行 auto_* を Simulation 用に明示分離
```

| 利点 | 欠点 |
|---|---|
| Rulebook フローと HTR Growth SELL ガードが一致 | Runtime / ops 既定・検証前提の見直しが必要（別 CR） |
| 「仮想」と「事実」の境界がイベント単位で一意 | Freeze / Runtime 改訂ゲートが発生し得る |

**本レビューの推奨ラベル（非拘束）:**  
意味の一意化が目的なら **案 B** が Rulebook と HTR の字面に近い。  
現行コードを「戦略仮想マシン」と割り切るなら **案 A** で文書上の定義を揃える方が小さい。  
いずれも **実装変更は別 Design Review / 別認可** が必要。

---

## 6. 実装変更不要の範囲

本 Design Review Only の結論として、**いま変更してはならない／変更不要**:

- 一切の Code / Logic / Schema  
- 既存 Freeze 文書の改訂・REOPEN  
- Sensor・Decision・Display・Evidence の再設計  
- Trade Fact スキーマ、Journal 形式  
- Protocol Entry/Exit/Risk 条件  
- Broker Adapter の新規導入  

許容される後続（別指示時のみ）:

- Rulebook を ACTIVE/FROZEN へ昇格する際の文言明確化  
- 案 A/B いずれかを選ぶ **Design Decision 記録**  
- その決定後の、限定された RuntimeConfig / ops 既定 / HTR ガード整合 CR  

---

## 付録 — 確認対象への直接回答

### 確認対象 2: auto_* / recovery 分類

| 機構 | 設計意図（コメント・既定） | Live ops 実挙動 | 分類 |
|---|---|---|---|
| `auto_fill` | Paper: ENTRY_READY→ENTRY_FILLED | **False** → 事実待ち | Live では **A 無効（Paper 用）** |
| `auto_transfer` | Paper: EXIT_PENDING→TRANSFER_COMPLETE | **True** → State 先行 | Live では **B 相当として動作中**（文書上は Paper コメント） |
| `auto_exit_fill` | Paper: EXIT→EXIT_FILLED | **True** → State 先行 | Live では **B 相当として動作中** |
| recovery 自動遷移 | Detection/Runtime 経路 | Alert OFF で進行し得る | **判断経路（B）と HTR 事実経路が併存** |

### 確認対象 3: Growth→Swing の `TRANSFER_COMPLETE`

**現状の正しい読み（一意化前）:**  
イベント名は **B（戦略進行 ack）として Runtime が使い、A（売買事実）として HTR も使う** — 二重定義。  
Trade Report との整合は **未解決（§3.2 / §5）**。

### 確認対象 4: Trade Report Port

| 問い | 回答 |
|---|---|
| Trade Fact は約定事実の唯一の正本か | **証券約定事実としては Yes。State 確定の唯一経路としては No** |
| Journal なしで State 確定する経路があるか | **Yes**（`auto_*`、`--record-*`、検証直呼び） |
| `--record-entry` / `--record-exit` | Runtime Freeze 上の **管理・ショートカット経路**。通常 Live の正は `--report-*` / Discord Port |

### 確認対象 5: 文書階層（運用上の正系統）

衝突時の読み順（本レビューの整理）:

```text
1. Protocol 条件の正
   DETAILED-SPEC / 各 Protocol Freeze（Entry・Exit・Risk・Selection）

2. Live ops 認可・手順の正
   RUNTIME-FREEZE-1.0

3. 証券事実入力の正
   HUMAN-TRADE-REPORT-PORT-1.0

4. 人間への見せ方の正
   FORTRESS-TAXABLE-HUMAN-DISPLAY-1.0
   + Mapping + Evidence

5. 運用の読み方（DRAFT・Freeze 非上書き）
   FORTRESS-TAXABLE-OPERATION-RULEBOOK-1.0
```

Rulebook 自身: 「衝突時は各 Freeze / Spec が優先」。  
したがって Rulebook を理由に Freeze を破る解釈はしない。  
一方で Rulebook が目指す Human Execution Boundary を Live の一意な正にするには、**§5 の Design Decision（案 A または B）が別途必要**。

---

## Version

```text
Status: DESIGN REVIEW COMPLETE
Judgment: CONDITIONAL PASS
FORTRESS-TAXABLE-STATE-RESPONSIBILITY-REVIEW-1.0

Changes: 本レポート新規のみ
Code: NONE / Logic: NONE / Schema: NONE / Freeze docs: NONE
```
