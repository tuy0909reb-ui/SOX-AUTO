# SOX-AUTO PC交換耐性 — 追加調査（事前準備設計）

**Record ID:** SOX-AUTO-PC-REPLACEMENT-PREP-INVESTIGATION-001  
**Title:** 将来PC交換を前提とした「今やる／後でやる」境界調査  
**Status:** **INVESTIGATION / DESIGN ONLY**（移動・削除・設定変更・Scheduler変更・commit/push 未実施）  
**Date:** 2026-08-11  
**前提調査:** `SOX-AUTO-ONEDRIVE-RELOCATION-IMPACT-INVESTIGATION-001`  
**目的:** 突然のPC不能時でも現行プロトコルを復旧できる状態へ、正常稼働中に前倒しできる準備を特定する  

```text
≠ 今すぐ本番ルートを切り替えること
≠ バックアップ目的だけのコピー
≠ 変更作業の実施
```

---

## 0. 最重要発見（判断を左右する）

### 0.1 二重ツリーが既に存在する

| パス | 属性 | Scheduler参照 | 観測 |
|---|---|---|---|
| `C:\Users\User\SOX-AUTO` | 通常 Directory | **YES（6タスクすべて）** | 現行メイン実行場所 |
| `C:\Users\User\OneDrive\SOX-AUTO` | **ReparsePoint**（OneDrive管理） | NO | 既に `.git` / ASA32件 / `portfolio.db` / webhook あり |

同一 `HEAD`（`109cf843…`）、主要ファイルの SHA256 一致（history / portfolio.db / webhook / `index.ts` 等）。  
working tree dirty もほぼ同規模（約266–267）。

UI表記の `OneDrive\毅 - 個人用\SOX-AUTO` は、実パス `C:\Users\User\OneDrive\SOX-AUTO` と同一候補と見てよい（個人用OneDriveの表示名）。

### 0.2 設計判断への帰結

```text
「これから OneDrive へ移す」ではなく
「既に OneDrive 側コピーがあり、実行は非OneDrive、Schedulerは後者を指す」
```

| やってはいけない（今） | やるべき（今） |
|---|---|
| 第三の場所へ無秩序コピー | **単一SoT（実行ルート）方針の確定** |
| Schedulerを今いじる | 二重ツリーのドリフト監視手順を固定 |
| Active DBを「同期任せ」で二重書き | Git外資産の**コールド保管**と手順書 |
| 「移したつもり」で片系だけ更新 | PC交換 Level 3 不足の解消リスト化 |

**現行運用を壊すリスクがある「本番ルートの OneDrive 切替」は LATER（カットオーバー）**。  
**今必要なのは「失うと戻せないもの」の確保と復旧設計**であり、実行場所の即時変更ではない。

---

## 1. 現時点で移行・整備した方がよいもの（NOW / MOVE / PREPARE）

「PC交換直前では遅い」＝正常環境からしか安全に取れない／ドリフトが進む／記憶が薄れるもの。

### 1.1 Git管理外の運用SoT（最優先）

| 対象 | なぜ今 | 交換直前では遅い理由 | 確認方法（将来） |
|---|---|---|---|
| `data/asa_minimum_runtime/records`（32）+ `history.jsonl` | Official22 / unofficial10。Git 0 tracked。Trialの核 | 障害時に再現不能。Assist後も増える | `asa status` で件数一致 |
| `logs/portfolio/portfolio.db` | Portfolio Fact。再生成困難な蓄積 | collect履歴が飛ぶ | `doctor` / db_stats、バックアップ世代 |
| `logs/portfolio/backups/portfolio_*.db` | 既存週次バックアップ資産 | 世代がローカルのみだと同時喪失 | 最新バックアップ日付 |
| `logs/portfolio/discord_webhook.json` 等 | Taxable/FORTRESS/Portfolio通知の局所設定 | Secretsと別経路。忘れると通知復活不能 | webhook resolve（値は出さない） |
| `logs/ndx/*` webhook系 | NDX通知 | 同上 | NDX dry経路 |
| `data/common_backtest/datasets`（~22MB）+ `reports`（~6.6MB, 多数） | Gitほぼ未追跡の検証成果 | 研究・FORTRESS検証の再現コスト大 | 主要reportパス存在確認 |
| 未commitの作業ツリー（dirty ~267） | 正常PC上の差分が最大の「今しか無い」 | 交換＝未push作業消失 | `git status` / branch比較 |

**今やる作業の形（実施は別承認）:**  
- Active実行は現状維持しつつ、**コールドコピー**（日付付き）を OneDrive 上の専用保管場所へ  
- または Git へ載せてよいものだけ commit（秘密・巨大binは除外）  
- **二重ツリーがある以上、どちらを正とするかを先に決める**

### 1.2 ドキュメント・仕様（多くは GitHub 可）

| 対象 | 判定 | 注 |
|---|---|---|
| `docs/baselines`（tracked 47）`docs/reports`（tracked 301） | PREPARE: push漏れ確認 | 未tracked docs も status 上あり → 棚卸し |
| Architecture FROZEN | F（GitHub） | cloneで足りる |
| 本調査レポート類 | MOVE/NOW: repo内に残し push推奨 | 手順のSoT化 |

### 1.3 依存・再現メタ（値ではなく一覧）

| 対象 | なぜ今 | 交換直前では遅い |
|---|---|---|
| 実測バージョン記録 | Python 3.14.6 / Node v24.18.0 / npm 11.16.0 / Git 2.55.0 | 「動いていた版」が不明だと Level 2 が難航 |
| `pip freeze` 相当のピン留め手順 | 実環境 63 packages。`requirements-dev.txt` は3行のみで**不足** | 交換時に「何を入れたか」が消える |
| `package-lock.json` | Node再現 | lock無し再installはドリフト |
| Scheduler定義の文書化 | 6タスクの Command/Arguments は今採取可能 | 障害後は旧PCから読めない |

### 1.4 Cursor

| 対象 | 判定 |
|---|---|
| `.cursor/rules/*.mdc`（repo） | Gitで足りる（F） |
| `%APPDATA%\Cursor\User\settings.json` | PREPARE: エクスポート手順のみ。今は本体を移さない |
| `%USERPROFILE%\.cursor` | 同上。秘密・機微の可能性 → 手順と要否判定のみ |

### 1.5 NISA_BACKTEST

| 対象 | 判定 |
|---|---|
| `C:\Users\User\OneDrive\デスクトップ\NISA_BACKTEST` | **既に OneDrive 上**。SOX移設とは別。今はパス固定スクリプトの棚卸し（PREPARE） |

---

## 2. PC交換直前でよいもの（LATER / REBUILD / RECONFIG）

| 対象 | 理由 | 今作るべきか |
|---|---|---|
| Task Scheduler 再登録 | PC固有。今変えると現行パス運用を壊す | **YES: 手順書のみ**（`setup_*.py --install`） |
| Python / Node 再install | 新PC必須 | YES: 版数を記録済み（本レポート） |
| Cursor 再install | 新PC必須 | YES: User settings エクスポート手順 |
| Git 認証（credential） | PC固有 | YES: PAT/SSHの**保管場所方針**のみ（値は書かない） |
| OneDrive クライアント | 新PC必須 | 手順のみ |
| PATH / User env | PC固有 | `.env.example` 項目一覧で足りる。実 `.env` は無い |
| `node_modules` / `dist` / `__pycache__` | 再生成可 | DO NOT MOVE として同期肥大防止 |
| 本番ルートの切替そのもの | プロトコル影響大 | LATER カットオーバー |

---

## 3. 今のうちに仕様・手順を固定すべきもの（PREPARE・秘密値なし）

### 3.1 環境スナップショット（2026-08-11 採取）

| 項目 | 値（非秘密） |
|---|---|
| Active repo | `C:\Users\User\SOX-AUTO` |
| OneDrive mirror候補 | `C:\Users\User\OneDrive\SOX-AUTO`（ReparsePoint） |
| Branch | `main`（`origin/main` 追従、dirty） |
| Remote | `https://github.com/tuy0909reb-ui/SOX-AUTO` |
| Python | 3.14.6（Scheduler実体: `...\Python\pythoncore-3.14-64\python.exe`） |
| Node / npm | v24.18.0 / 11.16.0 |
| Git | 2.55.0.windows.2 |
| ASA | records32 / official22 / unofficial10 / history22 |
| portfolio.db | 存在・876544 bytes（両ツリー同一hash） |
| ローカル `.env` | **無し**（秘密は webhook JSON + GitHub Secrets 側） |

### 3.2 Scheduler 6タスク（再作成に必要な情報）

再登録手段（現行スクリプトが正）:

```text
python setup_scheduler.py --install
python setup_ndx_scheduler.py --install
```

| Task | 実質実行 |
|---|---|
| SOXAUTO_Portfolio_Nightly | weekday 20:30 → `ops_nightly.py` |
| SOXAUTO_Portfolio_WeeklyBackup | Sun 10:00 → `backup_db.py` |
| SOXAUTO_Portfolio_MonthlyReminder | monthly 1日 09:00 → `ops_period_reminder.py --kind monthly` |
| SOXAUTO_Portfolio_QuarterlyReminder | JAN/APR/JUL/OCT 1日 09:15 → `--kind quarterly` |
| SOXAUTO_NDX_AM | weekday 08:30 → `ndx_ops.py --run am` |
| SOXAUTO_NDX_PM | weekday 14:05 → `ndx_ops.py --run pm` |

共通形: `cd /d <REPO>` && `<python.exe>` `<script>`  
**作業ディレクトリ = リポジトリルート必須。**

### 3.3 秘密・認証の「置き場」だけ（値は書かない）

| 必要物 | 復元元 |
|---|---|
| Discord webhook URL | `logs/portfolio/discord_webhook.json` / `logs/ndx/*`、または GitHub Secrets `DISCORD_WEBHOOK_URL` / `TAXABLE_DISCORD_WEBHOOK` |
| Discord bot token | GitHub Secrets `DISCORD_TOKEN`（ローカル `.env` 無し） |
| Git push 認証 | ユーザーの credential manager / PAT 保管方針 |
| SOX_MOTOMOTO / SOX_HYOKA | GitHub Secrets（Legacy。SEALED中は通常不要） |

### 3.4 依存の穴

| 層 | 現状 | 固定すべきこと |
|---|---|---|
| Node | `package.json` + `package-lock.json` | lock を失わない／push |
| Python | `requirements-dev.txt` 過少、実機 63 pkgs | **freeze 成果物の生成手順**（ファイル作成は別承認） |
| Semiconductor | `requirements-semiconductor.txt` | 研究再現用に維持 |

### 3.5 ASA / Portfolio / FORTRESS / NDX 経路（復旧チェックリスト用）

```text
ASA:     repo root → npm run build → npm run asa -- status
Portfolio: python doctor.py / collect_market_daily.py（Scheduler経由）
FORTRESS/Taxable Discord: taxable_account + webhook resolve（logs or env）
NDX: ndx_ops.py AM/PM + logs/ndx
Legacy SOX: SEALED維持（復旧優先度低）
```

---

## 4. OneDriveへ移す／移さない（A–F）

前提: **Active実行DB** と **コールド保管** を分離する。

| 記号 | 意味 |
|---|---|
| **A** | 今の時点で OneDrive へ（保管・同期） |
| **B** | OneDrive上でもよいが **Always keep on this device** |
| **C** | OneDriveに置かない（または同期除外） |
| **D** | PC交換時に再生成 |
| **E** | PC交換時に再設定 |
| **F** | GitHubから再取得 |

| 対象 | 分類 | 理由 |
|---|---|---|
| Git tracked コード・docs（push済） | **F** | cloneで足りる |
| 未push / dirty 差分 | **A+今commit方針** | GitHub未反映は OneDrive だけでは不十分、まず追跡可能に |
| ASA records/history | **A または B** | Git外。コールド複製を今。Activeは単一ルート |
| `portfolio.db` **実行** | **B 慎重** または ローカル維持 | OneDrive上の**アクティブ実行は非推奨寄り** |
| `portfolio.db` **バックアップコピー** | **A** | 週次バックアップのオフサイト化。実行と分離 |
| webhook JSON | **A（暗号化保管方針）** | 値をレポートに出さない。ファイル自体は必須資産 |
| `data/common_backtest` | **A** | Git外の検証成果 |
| `node_modules` / `dist` | **C / D** | 同期害。交換時 `npm ci` / `npm run build` |
| `__pycache__` / pytest cache | **C / D** | |
| `.git` を OneDrive で「動かしながら同期」 | **C 気味** | 競合リスク。保管用ミラーと作業用を分けるのが安全 |
| Scheduler | **E** | |
| Python/Node/Cursor本体 | **D/E** | |
| NISA_BACKTEST | 既に OneDrive（**B**） | スクリプト絶対パスは別課題 |

### portfolio.db 最適方式（現行運用を壊さない）

```text
推奨（段階）:

[今 PREPARE/MOVE]
  Active DB = 現状のまま（Schedulerが指すツリー）
  追加: 日付付きコールドコピーを OneDrive 保管領域へ
       （logs/portfolio/backups のオフサイト複製）

[カットオーバー時 LATER]
  単一実行ルートを決める
  もし実行ルートを OneDrive 配下にするなら:
    - portfolio.db は Always keep on this device
    - 可能なら「実行はローカル、OneDriveはバックアップのみ」を維持

[禁止に近い]
  二つのツリーへ交互に collect する
  オンライン専用のまま SQLite を書く
```

**「OneDriveにバックアップとして保存」≠「OneDrive上でアクティブDBとして実行」**

---

## 5. 完全復旧性（Level 1–3）

仮定: 旧PC突然不能。手元は OneDrive + GitHub + 認証 + 手順書。

| Level | 定義 | 現到達 | 不足 |
|---|---|---|---|
| **1** | コード・仕様・主要データを復元 | **部分到達** | dirty未push、Git外ASA/DB/webhook/common_backtest が OneDrive に**確実に**残っているかの運用保証が弱い。二重ツリーのどちらが最新か不明瞭になりうる |
| **2** | 実行可能（build/test/手動CLI） | **手順あれば可** | Python/Node版、`pip` ピン不足、`npm ci`、Cursor。requirements ギャップ |
| **3** | 自動運用（Scheduler+Discord+ASA+FORTRESS+NDX） | **未到達** | Scheduler再登録、webhook復元、単一SoT確定、DB方針、動作検証、（任意）env |

### Level 3 到達に不足しているもの（今できるのは主に PREPARE/MOVE）

1. **単一実行ルート方針**の文書確定  
2. Git外資産の**検証済みオフサイト複製**（ASA / DB backup / webhook / common_backtest）  
3. **dirty の commit/push または明示バックアップ**  
4. **Python 依存のピン留め成果物**（freeze）  
5. **復旧手順書**（本レポートを正式 Runbook 化）  
6. Scheduler install 手順の確認（スクリプトは既存）  
7. Discord 秘密の復元元チェックリスト（値なし）  
8. カットオーバー検証リスト（asa status / doctor / NDX list / webhook resolve）

---

## 6. 「今やる」と「後でやる」境界表

| 区分 | 対象 | 今やる理由 | 今やる作業 | PC交換直前でよい作業 | 注意点 |
|---|---|---|---|---|---|
| **NOW** | 二重ツリーの認識と単一SoT方針 | 既に2コピー。誤更新が最大リスク | 方針決定（実行=どちら／保管=どちら） | ルート切替そのもの | 今切替ると Scheduler/運用に影響 |
| **NOW** | ASA SoT 保全 | Git外・再生成不能 | コールド複製の実施計画・件数記録 | — | ActiveとBackupを混同しない |
| **NOW** | portfolio バックアップのオフサイト | DB喪失が致命 | backups の OneDrive 保管計画 | Active DBの配置変更 | **実行とバックアップ分離** |
| **NOW** | webhook JSON 保全 | 局所秘密・Git外 | 保管場所方針（値は秘匿） | 新PCへ配置 | レポートにURLを書かない |
| **NOW** | dirty / 未push | 交換=消失 | 棚卸し・commit方針（実施は承認後） | — | 秘密をcommitしない |
| **NOW** | common_backtest 成果 | Git外 | 保管対象に含める | — | datasets大きい |
| **PREPARE** | Scheduler手順 | 旧PCからしか正確採取できない定義がある | 本表・setupスクリプトを正とする | `--install` 実行 | 今は **変更しない** |
| **PREPARE** | 版数・依存 | 動いていた版の記録 | 本レポートの版数固定／freeze手順 | install | requirements-dev 不足 |
| **PREPARE** | Discord復元チェックリスト | Secrets配置の確認 | 項目リストのみ | Secrets再設定 | |
| **PREPARE** | Cursor User設定 | AppDataはPC固有 | エクスポート手順 | 再install+import | |
| **MOVE** | コールド保管一式 | オフサイトが Level1 の鍵 | OneDrive保管領域へ複製（実行非切替） | — | `OneDrive\SOX-AUTO` 既存と衝突注意 |
| **LATER** | 実行ルートの OneDrive 化 | 運用影響大 | — | カットオーバー | Scheduler再指し |
| **LATER** | Scheduler 再登録 | PC固有 | — | uninstall/install | |
| **REBUILD** | node_modules/dist | 再生成可 | — | npm ci / build | OneDrive同期から除外 |
| **REBUILD** | Python venv/packages | 再生成可 | freeze成果があれば容易 | pip install | |
| **RECONFIG** | Git認証・PATH・OneDrive client | PC固有 | 方針のみ | 実設定 | |
| **DO NOT MOVE** | オンライン専用のままの Active SQLite | 破損リスク | — | — | Always-keep 必須なら B |
| **DO NOT MOVE** | node_modules を「保管の主役」に | 無意味・有害 | 同期除外 | 再生成 | |
| **VERIFY** | 復旧ドリル | Level3の唯一の証明 | チェックリスト作成 | 新PCまたは副環境で実施 | 現行を止めない範囲で |

---

## 7. 明確な区別（依頼の核心）

### 今 OneDrive へ「移す／切替」すると現運用に支障が出やすいもの

- 実行ルートの切替（Schedulerが旧パス固定のまま）
- Active `portfolio.db` を同期競合下で書き続けること
- 二重ツリーへの交互書き込み
- 今の Scheduler uninstall（通知・collect停止）

→ **LATER / 慎重カットオーバー**

### 今のうちに移しておかないと PC交換時に困るもの

- ASA Official/unofficial（Git外）
- portfolio.db と backups（Git外）
- Discord webhook JSON（Git外）
- common_backtest のローカル成果（Git外）
- 未pushのコード差分
- 「動いていた」版数・Scheduler定義・復元手順

→ **NOW（保全）+ PREPARE（手順）**。必ずしも「本番実行を OneDrive に移す」ではない。

---

## 8. 推奨シーケンス（変更はまだしない・設計のみ）

```text
Phase P0  方針: 実行SoTを1つに決める（現状は非OneDrive実行が事実上の正）
Phase P1  保全: Git外資産のコールドオフサイト + dirty棚卸し
Phase P2  手順: Runbook確定（本調査を正本化）+ pip freeze成果物計画
Phase P3  検証: Level1点検（件数・hash）を定期化
Phase P4  交換時: REBUILD/RECONFIG → Scheduler → VERIFY → Level3
```

**突然壊れても Level3 にしたいなら、P1–P2 を現PC健在のうちに完了させる。**  
**P4 の実行切替は、健在なうちに「予行」できるとなお良いが、現行6タスクを止めない予行設計が必要。**

---

## 9. 最終回答（分離）

### 1. 今すぐ移行・整備するもの
- Git外: ASA / DBバックアップ / webhook / common_backtest の**確実なオフサイト保全**  
- dirty の追跡可能化方針  
- 二重ツリーの単一SoT方針決定  

### 2. 今は手順だけ準備するもの
- Scheduler 再install 手順  
- 版数・依存・Discord復元元チェックリスト  
- Cursor User 設定エクスポート手順  
- Level1–3 検証リスト  

### 3. PC交換直前に実施するもの
- 実行ルート最終切替（行う場合）  
- Scheduler 再登録  
- 認証・PATH・OneDrive client  

### 4. PC交換時に再生成するもの
- node_modules / dist / pycache  
-（方針次第）venv  

### 5. OneDriveへ置かない／置いても実行しないもの
- Active SQLite をオンライン専用で回すこと  
- node_modules を同期の主対象にすること  

### 6. 現行プロトコル影響で慎重なもの
- Scheduler 変更  
- 実行ルート切替  
- portfolio.db の配置変更  
- 二重書き  

---

## 10. 今回実施しなかったこと

ファイル移動・削除・rename・設定変更・Scheduler変更・git commit/push・実行ルート切替 — **すべて未実施**。

---

# End
