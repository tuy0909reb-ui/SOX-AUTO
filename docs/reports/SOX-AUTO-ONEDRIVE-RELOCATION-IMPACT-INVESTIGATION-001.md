# SOX-AUTO OneDrive 移設影響調査（実装・プロトコル）

**Record ID:** SOX-AUTO-ONEDRIVE-RELOCATION-IMPACT-INVESTIGATION-001  
**Title:** ローカル `C:\Users\User\SOX-AUTO` → `OneDrive\毅 - 個人用\SOX-AUTO` 移設影響調査  
**Status:** **INVESTIGATION ONLY**（移動・削除・設定変更・commit・push 未実施）  
**Date:** 2026-08-11  
**Current root:** `C:\Users\User\SOX-AUTO`  
**Proposed root:** `OneDrive\毅 - 個人用\SOX-AUTO`（フルパスは環境依存・要確認）  
**Git remote:** `https://github.com/tuy0909reb-ui/SOX-AUTO`  

```text
Purpose = メイン実行環境としての移設可否・支障洗い出し
≠ バックアップ設計
≠ 移設実施
≠ コード修正
```

---

## 0. 総合判定（先に読む）

| 結論 | 内容 |
|---|---|
| **コード本体（相対パス中心）** | 移設しても多くの本番経路は動く見込み（**A** 多） |
| **ブロッカー** | Windows Task Scheduler が **絶対パス固定**（**D / F**） |
| **データ消失リスク** | ASA Official Record・`portfolio.db`・webhook JSON は **Git未追跡**。フォルダ丸ごと移さないとプロトコル資産が欠落（**F / E**） |
| **OneDrive固有リスク** | SQLite・`node_modules`・同期遅延/オンライン専用（**C / E**） |
| **GitHub Actions / Discord Secrets** | リポジトリ配置に非依存（**A**）。ただしローカル通知パスは別（**D/F**） |
| **NISA絶対パス** | SOX-AUTOではなく `OneDrive\デスクトップ\NISA_BACKTEST` 依存（**B**はNISA系スクリプト。SOX移設そのものとは別件） |

**推奨姿勢（実施前）:**  
「Git clone で復元」ではなく「**現ツリーを物理移設＋Scheduler再登録＋Always keep on this device＋秘密/DBの同期方針決定**」が前提。

---

## 分類凡例

| 記号 | 意味 |
|---|---|
| **A** | 移設しても問題なし（相対/`__file__`/CI） |
| **B** | 移設前に修正が必要（コード・設定の欠陥） |
| **C** | OneDrive配下に置かない方がよい（または同期除外すべき） |
| **D** | Windows側で再設定が必要 |
| **E** | 要確認 |
| **F** | 移設によって既存プロトコルに影響する可能性あり |

---

## A: 移設しても問題なし

### A1. ASA Minimum Runtime（コア）

| 項目 | 内容 |
|---|---|
| **対象** | `src/asa_minimum_runtime/**`（Storage/History/CommitAPI/Assist/CLI） |
| **現在の参照** | `data/asa_minimum_runtime` は **cwd相対**（`process.cwd()` / `--root`）。Assist文書は `--repo-root` または cwd |
| **移設後** | 新フォルダを cwd / Cursor workspace にすれば動作継続見込み |
| **対応** | 移設後は必ずリポジトリルートで `npm run asa` / Assist を実行。Cursorでフォルダを開き直す |

### A2. taxable_account / FORTRESS コード経路

| 項目 | 内容 |
|---|---|
| **対象** | `taxable_account/**`（`Path(__file__).parents[2]` で ROOT） |
| **現在の参照** | リポジトリ相対。webhook は env または `logs/**/discord_webhook.json` |
| **移設後** | コードパスは問題になりにくい |
| **対応** | なし（ただし webhook ファイルと env の持ち越しは **F/D**） |

### A3. Git / GitHub Actions

| 項目 | 内容 |
|---|---|
| **対象** | `.git`、`.github/workflows/*` |
| **現在の参照** | Actions は `actions/checkout` + Secrets（`DISCORD_*`）。ローカル絶対パスなし |
| **移設後** | remote はそのまま。Legacy SOX cron は SEALED のまま |
| **対応** | 移設は `git mv` ではなくフォルダ移動でも `.git` ごと移せば履歴維持可。**push不要** |

### A4. Discord「クラウド側」通知（Secrets）

| 項目 | 内容 |
|---|---|
| **対象** | GitHub Secrets: `DISCORD_TOKEN`, `DISCORD_WEBHOOK_URL`, `TAXABLE_DISCORD_WEBHOOK` 等 |
| **現在の参照** | CI / 環境変数。ローカルパス非依存 |
| **移設後** | Actions経路は影響なし |
| **対応** | なし |

### A5. `__dirname` / `Path(__file__)` ベースのテスト・ビルド

| 項目 | 内容 |
|---|---|
| **対象** | `tests/**`、多数の TS/Python |
| **現在の参照** | 相対・モジュール相対 |
| **移設後** | 一般に問題なし |
| **対応** | 移設後 `npm run build` / `npm test` / 主要 pytest を一度実行して確認（**E**と併用） |

### A6. `_tmp_dump/**` の絶対パス

| 項目 | 内容 |
|---|---|
| **対象** | `_tmp_dump/*.py` に大量の `C:\Users\User\SOX-AUTO` |
| **現在の参照** | 開発用ワンショット。本番プロトコル外 |
| **移設後** | 壊れても運用非影響 |
| **対応** | 不要なら放置可。使うならパス更新（優先度低） |

---

## B: 移設前に修正が必要

※「SOX-AUTOをOneDriveへ移す」そのもののブロッカーではないが、**関連運用が壊れている/壊れやすい**もの。

### B1. NISA_BACKTEST 絶対パス（多数スクリプト）

| 項目 | 内容 |
|---|---|
| **対象** | 例: `analyze_nisa_*.py`, `evaluate_nisa_*.py`, `compare_nisa_*.py`, `prepare_nisa_long_term_nav.py`, `organize_common_backtest_data.py`, `semiconductor_holdings/paths.py`, `scratch/nisa_*` |
| **現在の参照** | `C:\Users\User\OneDrive\デスクトップ\NISA_BACKTEST` 固定 |
| **移設後の問題** | SOX-AUTO移設では直接壊れない。ただし NISA系を SOX から実行する運用は **既にデスクトップOneDrive依存**。パス変更・デスクトップ同期設定で停止しうる |
| **必要な対応** | 環境変数/`Path(__file__)`相対化、または設定ファイル化。移設プロジェクトとは分離してよいが、プロトコル上 NISA研究があるなら先に直す価値あり |

### B2. `.gitignore` に `node_modules` / `dist` が無い

| 項目 | 内容 |
|---|---|
| **対象** | ルート `.gitignore`（現状 `node_modules`/`dist` 未記載）。ローカルに各 ~49MB / ~4MB |
| **現在の参照** | 未追跡（`git ls-files` 0件）だが OneDrive 同期対象になりうる |
| **移設後の問題** | 同期衝突・ロック・肥大化。実行中の Node が同期と競合 |
| **必要な対応** | 移設前に `.gitignore` 追加 **または** OneDrive「同期しない」設定。移設後は `npm ci` / `npm run build` で再生成可能 |

---

## C: OneDrive配下に置かない方がよい（または同期除外）

### C1. SQLite `logs/portfolio/portfolio.db`（最重要）

| 項目 | 内容 |
|---|---|
| **対象** | `portfolio/db.py`, `DEFAULT_DB_PATH=logs/portfolio/portfolio.db`（約 0.9MB、実運用中） |
| **現在の参照** | cwd相対の SQLite。`collect_market_daily` / holdings / review / nightly |
| **移設後の問題** | OneDrive同期中のロック・部分同期・オンライン専用化で **DB破損・書き込み失敗** が典型リスク。Portfolio / Fact層に直結 |
| **必要な対応** | (1) DBを常に「このデバイス上に保持」、(2) 可能なら `logs/` を同期除外し別ローカルにjunction、(3) バックアップは既存 `SOXAUTO_Portfolio_WeeklyBackup` を移設後も維持 |

### C2. `node_modules/` / 活発な `dist/`

| 項目 | 内容 |
|---|---|
| **対象** | ビルド成果・依存 |
| **問題** | 多数小ファイル＋ロック。OneDrive向きでない |
| **対応** | 同期除外、または移設後再install/build |

### C3. `__pycache__` / 一時 `scratch` 大量CSV（任意）

| 項目 | 内容 |
|---|---|
| **対象** | キャッシュ・実験データ |
| **問題** | 同期ノイズ |
| **対応** | 除外推奨。必須資産ではない |

---

## D: Windows側で再設定が必要

### D1. Task Scheduler（確定ブロッカー）

| 項目 | 内容 |
|---|---|
| **対象** | `SOXAUTO_Portfolio_*`（4）, `SOXAUTO_NDX_AM/PM`（2） |
| **現在の参照** | `cmd /c cd /d "C:\Users\User\SOX-AUTO" && "...\python.exe" "C:\Users\User\SOX-AUTO\..."` |
| **移設後の問題** | **旧パスを指したまま夜間・NDXが失敗**。Discord通知・market collect・backupが止まる（**F**） |
| **必要な対応** | 移設後に必ず: `python setup_scheduler.py --uninstall` → `--install`、`python setup_ndx_scheduler.py --uninstall` → `--install`（新ROOTで再登録）。Python本体パスも新環境で確認 |

### D2. Cursor / IDE workspace

| 項目 | 内容 |
|---|---|
| **対象** | Cursor で開いている `C:\Users\User\SOX-AUTO` |
| **問題** | 旧パスのままでは編集・ターミナル cwd・ASA Assist の repo-root がずれる |
| **対応** | 新パスで Folder を開き直す。必要なら最近使ったワークスペース履歴の整理 |

### D3. ユーザー環境変数 / 手動ショートカット

| 項目 | 内容 |
|---|---|
| **対象** | `.env`（現状リポジトリ直下に **無し**）、スタートアップ、手動 `.bat`、デスクトップショートカット |
| **問題** | 旧パス参照が残ると通知・bot起動失敗 |
| **対応** | 手元のショートカットと User env を棚卸し。Secretsは GitHub側は不要変更 |

### D4. OneDrive「常にこのデバイスに保持」

| 項目 | 内容 |
|---|---|
| **対象** | 少なくとも `logs/portfolio/`、`data/asa_minimum_runtime/`、`.git/` |
| **問題** | オンライン専用だと実行時に欠け・遅延 |
| **対応** | 対象フォルダを Always keep on this device |

---

## E: 要確認

### E1. 移設先フルパスと日本語ディレクトリ名

| 項目 | 内容 |
|---|---|
| **対象** | `OneDrive\毅 - 個人用\SOX-AUTO` |
| **問題** | 一部ツール・古いBAT・引用符なしコマンドが非ASCIIパスで失敗しうる。空白・「-」も注意 |
| **対応** | 移設前に実フルパスを確認。Schedulerは引用符付き（現行スクリプトは対応）だが、手動コマンドを検証 |

### E2. ASA Official Records が Git 未追跡

| 項目 | 内容 |
|---|---|
| **対象** | `data/asa_minimum_runtime/records/*`, `history/history.jsonl`（status `??`） |
| **問題** | **cloneだけでは Official/orphan が復元されない**。Trial・Write Discipline・Assisted LoopのSoT欠落 |
| **対応** | 物理コピー必須。移設後 `npm run asa -- status` で records/official/unofficial 件数照合（現状 32 / 22 / 10） |

### E3. `logs/` 全体（gitignored）

| 項目 | 内容 |
|---|---|
| **対象** | `logs/portfolio/discord_webhook.json`（**存在確認済**）、NDX webhook、runtime logs、DB |
| **問題** | Gitに無い。フォルダ移設漏れ＝Discord局所設定喪失 |
| **対応** | `logs` を必ず同梱。移設後に taxable / portfolio の dry-run で webhook 解決確認 |

### E4. Portfolio Nightly の直近失敗コード

| 項目 | 内容 |
|---|---|
| **対象** | `SOXAUTO_Portfolio_Nightly` Last result `-2147020576`（他タスクは 0 もあり） |
| **問題** | 移設前から不安定な可能性。OneDrive化で悪化しうる |
| **対応** | 移設前に Nightly 手動実行で原因切り分け（パス/ネットワーク/yfinance等） |

### E5. PC交換時の「OneDrive復元だけで足りるか」

| 項目 | 内容 |
|---|---|
| **足りるもの** | 同期済みソース、docs、（同期していれば）logs/ASA data |
| **足りないもの** | Task Scheduler、Python/Nodeインストール、Cursor、User env/Secretsローカル、`node_modules`、デバイス固有の Always-keep 状態、GitHub Secrets（クラウド側は残る） |
| **判定** | **「OneDrive復元＝現環境の完全再構築」ではない**（**D**が残る） |

### E6. Git 作業中ファイルと OneDrive 同時同期

| 項目 | 内容 |
|---|---|
| **対象** | `.git/index`, packfiles |
| **問題** | 理論上、同期競合でリポジトリ破損がありうる（頻度は環境依存） |
| **対応** | 可能なら `.git` を同期対象外＋別バックアップ、または「作業中は一時的に同期一時停止」運用を検討 |

---

## F: 移設によって既存プロトコルに影響する可能性あり

### F1. Portfolio 運用プロトコル（Fact / collect / reminder / Discord）

| 項目 | 内容 |
|---|---|
| **対象** | Scheduler → `ops_nightly.py` / `backup_db.py` / `ops_period_reminder.py` → `portfolio.db` / `discord_notify.py` |
| **影響** | Scheduler未更新＝**日次収集・週次backup・月次/四半期リマインダ・Discord停止**。DBがオンライン専用＝書き込み失敗 |
| **対応** | D1 + C1 必須 |

### F2. NDX 運用

| 項目 | 内容 |
|---|---|
| **対象** | `SOXAUTO_NDX_AM/PM` → `ndx_ops.py` → `logs/ndx/*` |
| **影響** | 同上。パス固定のため移設直後に停止 |
| **対応** | `setup_ndx_scheduler.py` 再install |

### F3. Taxable / FORTRESS Discord Operator

| 項目 | 内容 |
|---|---|
| **対象** | `taxable_account/view/webhook_config.py` → env or `logs/portfolio/discord_webhook.json` |
| **影響** | コードは相対で耐える。`logs` 未移設または未ローカル化だと **通知不能**（プロトコル表示経路の欠落） |
| **対応** | logs 同梱 + 移設後に Phase8 系 dry-run / test-send（送信は承認後） |

### F4. ASA（Minimum Runtime / Trial / Assisted Loop）

| 項目 | 内容 |
|---|---|
| **対象** | `data/asa_minimum_runtime`（Official 22 + orphan 10）、CLI cwd |
| **影響** | データ未移設＝**Trial SoT喪失**。cwd違い＝空の新 dataRoot を作り「Recordが消えた」ように見える |
| **対応** | データ物理移設 + status 件数照合。Assistは新 repo root で実行 |

### F5. Legacy SOX Sensor（SEALED）

| 項目 | 内容 |
|---|---|
| **対象** | `legacy_sox_sensor_seal.json` + Actions |
| **影響** | 移設自体では封印は破れない。ローカル絶対パス依存なし |
| **対応** | 特になし（封印維持） |

### F6. NISA / 研究プロトコル

| 項目 | 内容 |
|---|---|
| **対象** | NISA_BACKTEST 絶対パススクリプト群 |
| **影響** | SOX移設とは独立だが、研究再現がデスクトップOneDrive前提のまま |
| **対応** | B1。SOXメイン移設の必須条件ではない |

---

## 調査項目 1–20 への対応表

| # | 調査テーマ | 主分類 | 要約 |
|---|---|---|---|
| 1 | 絶対パスハードコード | B / A | 本番コアに `C:\Users\User\SOX-AUTO` ほぼ無し（`_tmp_dump`のみ）。NISAは別絶対パス多数 |
| 2 | 現配置前提 | D / F | **Task Scheduler** が現配置前提 |
| 3 | 実行パス依存 | A / D | コードは `__file__`/cwd。Scheduler/Pythonパスは再設定 |
| 4 | 設定内パス | A / E | `.env.example` にパス無し。実 `.env` 無し |
| 5 | `.env` / 秘密 | E / F | `.env`未使用。秘密は GitHub Secrets + `logs/**/discord_webhook.json` |
| 6 | data/docs/logs等 | A / F | 相対参照。**logs・ASA data はGit外** |
| 7 | Git移設可否 | A / E | `.git`ごと移動可。OneDrive上の `.git` 同期は注意 |
| 8 | Cursor設定 | D | workspace開き直し。repo内 rules は相対で問題小 |
| 9 | GitHub Actions | A | 配置非依存。Legacy SEALED維持 |
| 10 | Discordローカルパス | F | webhook JSON が `logs/` 依存 |
| 11 | Task Scheduler | D / F | **6タスクが旧絶対パス**（確認済） |
| 12 | テストパス | A | 相対中心。NISA系は絶対 |
| 13 | cwd前提 | A / E | ASA CLI・portfolio相対パスは cwd依存 → ルートで実行 |
| 14 | SQLite | C / F | `portfolio.db` あり。OneDriveリスク高 |
| 15 | 同期中アクセス | C / E | DB・node_modules・.git |
| 16 | オンライン専用 | D / E | Always keep 必須 |
| 17 | 同期非推奨 | C | `node_modules`, `dist`, 可能なら `logs/*.db`, `__pycache__` |
| 18 | Windows再設定 | D | Scheduler、Cursor、Keep-on-device、Python/Node |
| 19 | PC交換復元 | E | OneDriveだけでは不完全（Dが残る） |
| 20 | プロトコル影響 | F | Portfolio/NDX/Taxable Discord/ASA SoT |

---

## プロトコル別影響サマリ

| プロトコル | 影響 | 条件付きで守る要件 |
|---|---|---|
| ASA Runtime / Trial / Assisted Loop | **F**（データ・cwd） | `data/asa_minimum_runtime` 完全移設 + ルート実行 |
| FORTRESS / taxable Discord | **F**（webhookファイル） | `logs/portfolio/discord_webhook.json` 移設 or env |
| Portfolio Fact/DB | **C/F** | SQLite方針 + Scheduler再登録 |
| NDX | **D/F** | Scheduler再登録 + `logs/ndx` |
| Legacy SOX Sensor | **A** | SEALED維持。Actions非依存 |
| NISA研究 | **B/E** | デスクトップ `NISA_BACKTEST`（SOX移設と別） |
| GitHub通知Secrets | **A** | 変更不要 |

---

## 移設前チェックリスト（実施は別承認）

1. Task Scheduler 6本の現状バックアップ（`--list` 出力保存）  
2. `data/asa_minimum_runtime` 件数記録（32/22/10）  
3. `logs/portfolio/portfolio.db` と webhook JSON の存在確認  
4. OneDrive 実フルパス確認（日本語・空白）  
5. 同期除外方針決定（最低: `node_modules`, 推奨: SQLite方針）  
6. 移設は **カットオーバー**（旧パスの Scheduler を止めてから新パスで install）  
7. 移設後検証: `asa status` / Scheduler list / portfolio doctor / taxable webhook resolve  

---

## 今回やらなかったこと

- ファイル移動・削除  
- 設定変更・Scheduler変更  
- commit / push  
- コード修正  

---

# End of Investigation
