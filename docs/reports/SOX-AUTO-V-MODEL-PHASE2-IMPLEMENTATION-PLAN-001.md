# SOX-AUTO Phase 2 実施計画 — GitHub Software SoT化 + Lean Vault 実体化

**Record ID:** SOX-AUTO-V-MODEL-PHASE2-IMPLEMENTATION-PLAN-001  
**Title:** 運用非破壊の実施順序・対象分類・リスク／ロールバック  
**Status:** **PLAN ONLY**（git add/commit/push・移動・削除・Scheduler変更 未実施）  
**Date:** 2026-08-11  
**前提監査:** `SOX-AUTO-V-MODEL-PHASE01-VAULT-AUDIT-001`  

```text
目的 = Level 3 復旧可能性を上げる
≠ OneDrive移設そのもの
≠ 無差別 git add .
≠ 現行実行SoT / Scheduler の変更
```

---

## 0. 設計判断（Vモデルへの微修正）

### 採用: **V'（V + Commit-Gate）**

| 層 | 役割（変更なし） |
|---|---|
| GitHub | Software SoT（**現状穴あり → Phase 2Aで埋める**） |
| OneDrive Vault | Durable / Recovery Data（**Phase 2BでLean化**） |
| Google Drive | Collaboration SoT（二重化しない・目録） |
| Local | Execution SoT（**触らない**） |
| Windows | Scheduler 等（**触らない**） |

### Cursor提案（こちらの想定より優先してよい点）

1. **順序は必ず A→B**  
   GitHub Software SoT が埋まる前に丸ごとコピーを消す／Lean化しすぎると、コード保険を失う。  
2. **`.gitignore` を最初に直す**  
   現状 `data/asa_minimum_runtime/` は **ignored ではない**。不用意な `git add data` で Official Records がGitHubに載る危険がある。  
3. **commitは複数スライス**（1巨大commit禁止）  
   レビュー・ロールバック・秘密混入検査が容易。  
4. **Vaultは新ディレクトリ `OneDrive/SOX-VAULT/` 推奨**  
   既存 `OneDrive/SOX-AUTO` 丸ごとをその場で削るより、**新規Leanを作成→検証→旧コピーは保持（削除は最終承認）** が安全。  
5. **code_cold_spareは過渡期のみ**  
   GitHub push 検証後に Vault から外してよい。  
6. **研究用 `run_*.py` / NISA絶対パス脚本は第2波**  
   Level 3（自動運用）に必須なコアを先に載せる。

---

## 1. 現状 Git 実測（計画入力）

| 指標 | 値 |
|---|---|
| branch | `main...origin/main` |
| dirty | ~271（?? ~247 / M ~24） |
| 実行SoT | `C:\Users\User\SOX-AUTO`（変更しない） |
| ODコピー | `C:\Users\User\OneDrive\SOX-AUTO`（第二本番にしない） |

### Modified（既存追跡の更新・別スライスでcommit可）

`.gitignore`, `package.json`, `jest.config.cjs`, `tsconfig.json`, `taxable_account/**` 多数, 関連 tests, 一部 baselines。

### Untracked — コア運用（GitHub化優先）

```text
portfolio/
src/asa_minimum_runtime/
tests/asa_minimum_runtime/
backup_db.py, ops_nightly.py, ops_period_reminder.py
ndx_ops.py, ndx_discord_bot.py, ndx_discord_ui.py, ndx_sell_protocol.py, check_ndx_discord_ui.py
setup_scheduler.py, setup_ndx_scheduler.py
collect_market_daily.py, doctor.py, discord_notify.py
db_stats.py, export_csv.py, health_check.py, integrity_check.py
holdings_cli.py, hypothesis_*.py, init_portfolio_db.py, rebalance_cli.py
portfolio.py, review_monthly.py, review_quarterly.py
pytest.ini, requirements-dev.txt, requirements-semiconductor.txt
taxable_account/domain/asset_registry.py
taxable_account/ops/discord_slash_locale.py
taxable_account/ops/sync_discord_trade_commands.py
taxable_account/trade/routing.py
taxable_account/view/human_display.py
scripts/  tools/  semiconductor_holdings/（コード・設定）
.cursor/rules/（あれば）
.env.example（秘密なし前提で確認済方針）
```

### Untracked — ドキュメント（Software隣接・推奨GitHub）

多数の `docs/baselines/*`, `docs/reports/*`, `docs/specs/*`, `docs/schemas/*`, `docs/principles/*`  
（PC交換・Vモデル調査レポート含む）

### Untracked — 第2波（自動運用Level3に非必須）

多数の `run_*.py`, `analyze_nisa_*.py`, `evaluate_nisa_*.py`, `compare_nisa_*.py`, `prepare_*.py`, `tmp_*`, `_tmp_*` HTML/JS スクrape滓

### Untracked — データ（GitHub禁止寄り）

```text
data/asa_minimum_runtime/   ★Vault（gitignore追加必須）
data/common_backtest/       ★Vault（datasetsは既にignore）
data/ops/                   要個別確認→概ねVault or Local
logs/**                     既にignore / Vaultは選別コピー
```

### Secretスキャン（計画時点）

`portfolio/`, `src/asa_minimum_runtime/`, 主要ops脚本に対し webhook URL実体・ハードコードtokenの簡易検索 → **ヒットなし**。  
ただし **commit直前に再スキャン必須**（特に `discord_notify.py`, ndx bot, taxable sync）。  
`logs/**/discord_webhook.json` は **GitHub禁止・Vault秘匿**。

---

# A. GitHub化対象（実体単位）

## Slice G0 — 安全網（最初）

| 対象 | 内容 |
|---|---|
| `.gitignore` 更新 | 下記 I |
| （任意）`git check-ignore` 検証メモ | ASA records が ignore されること |

## Slice G1 — ASA Minimum Runtime（最優先コア）

| 対象 |
|---|
| `src/asa_minimum_runtime/**` |
| `tests/asa_minimum_runtime/**` |
| 関連 `package.json` / `jest.config.cjs` / `tsconfig.json` の modified |

## Slice G2 — Portfolio + 日次運用

| 対象 |
|---|
| `portfolio/**` |
| `portfolio.py` |
| `backup_db.py`, `collect_market_daily.py`, `doctor.py`, `ops_nightly.py`, `ops_period_reminder.py` |
| `discord_notify.py`（URLハードコード無きこと再確認） |
| `db_stats.py`, `export_csv.py`, `health_check.py`, `integrity_check.py` |
| `holdings_cli.py`, `hypothesis_*.py`, `init_portfolio_db.py`, `rebalance_cli.py` |
| `review_monthly.py`, `review_quarterly.py` |
| `test_portfolio_db.py`, `pytest.ini`, `requirements-*.txt` |

## Slice G3 — NDX + Scheduler定義コード

| 対象 |
|---|
| `ndx_ops.py`, `ndx_discord_*.py`, `ndx_sell_protocol.py`, `check_ndx_discord_ui.py` |
| `setup_scheduler.py`, `setup_ndx_scheduler.py` |

※ Schedulerの**Windows登録状態**はコード化済み。マシン固有パスはinstall時に生成。

## Slice G4 — Taxable / FORTRESS 残り

| 対象 |
|---|
| modified `taxable_account/**` + 関連 tests |
| untracked: `asset_registry.py`, `human_display.py`, `routing.py`, `sync_discord_trade_commands.py`, `discord_slash_locale.py` |

## Slice G5 — ツール・補助コード

| 対象 |
|---|
| `scripts/**`, `tools/**`, `semiconductor_holdings/**`（秘密・生HTML除外） |
| `.cursor/rules/**` |
| `.env.example` |

## Slice G6 — Docs / Specs / Baselines / Reports

| 対象 |
|---|
| untracked `docs/**`（公開可能な調査・登録・仕様） |
| modified baselines |

巨大でもSoftware隣接の正本。Vault不要。

## Slice G7 — 研究ランナー第2波（任意・分割可）

| 対象 | 注意 |
|---|---|
| `run_*.py`, `analyze_nisa_*.py` 等 | 絶対パス `NISA_BACKTEST` 含む→**コードとして載せてよいが実行は環境依存** |
| `_tmp_*.html/js`, `tmp_*` | **原則GitHub不可**（Cへ） |

## Slice G8 — Actions（要中身レビュー）

| 対象 | 注意 |
|---|---|
| `.github/workflows/{deploy,maintenance,operations,release}.yml` | 秘密・破壊的deployが無いかレビュー後。疑わしければ見送り |

---

# B. GitHub化しないもの

| 対象 | 推奨保管 | 理由 |
|---|---|---|
| `data/asa_minimum_runtime/**` | **Vault** | 運用SoT。再生成不可 |
| `logs/portfolio/portfolio.db` | **Local Active** | 実行DB |
| `logs/portfolio/backups/**` | **Vault** | 既存backup成果 |
| `logs/**/discord_webhook*.json` | **Vault（秘匿）** | Secret |
| `logs/runtime`, nightly txt | Local / 破棄可 | 再生成 |
| `data/common_backtest/datasets/**` | **Vault**（既ignore） | 大・再取得コスト |
| `data/common_backtest/reports/**` | **Vault**（選んで一部docs化可） | 成果証跡 |
| `data/backtest/**` | **Vault** | ignore済 |
| `node_modules/`, `dist/` | **再生成** | |
| `_tmp_*`, `tmp_*`, scrape HTML | **破棄 or Local** | |
| `auto-scribe-ai/` 全体 | **別判断**（必須Vaultではない） | ASA Runtimeと別系統 |
| Active `.env` | 存在せず / 禁止 | |
| Google Driveコラボ実体 | **GDrive SoT** | 二重化しない |

---

# C. OneDrive Vault対象（Lean）

推奨実体パス（新規）:

```text
C:\Users\User\OneDrive\SOX-VAULT\
```

| Vault相対 | ソース（Local） | 必須 |
|---|---|---|
| `data/asa_minimum_runtime/` | 同左 | ★ |
| `data/common_backtest/` | 同左（datasets+reports） | ★ |
| `data/backtest/` | 同左 | 推奨 |
| `logs/portfolio/backups/` | 同左 | ★ |
| `logs/portfolio/discord_webhook.json` | 同左 | ★秘匿 |
| `logs/ndx/discord_webhook.json` | 同左 | ★秘匿 |
| `logs/ndx/discord_ui_webhooks.json` | 同左 | ★秘匿 |
| `research/` | 同左 | 推奨 |
| `RECOVERY/RUNBOOK.md` | 新規作成（計画承認後） | ★ |
| `RECOVERY/env_snapshot.md` | 版数・タスク名・検証コマンド（秘密値なし） | ★ |
| `code_cold_spare/`（過渡） | G1–G3 相当の未pushツリー | ★ until GitHub verified |

**入れない:** Active `portfolio.db`（代わりに backups）、modules、dist、`.git`作業コピー、丸ごと146MB。

容量目標: **≪100MB**（code_cold_spare込みでも小さい）。

---

# D. Vault除外

`node_modules`, `dist`, caches, `scratch`, `_tmp_dump`, Active DB常用, フルソースの恒久保管（GitHub後）, 丸ごとコピーの常用維持。

---

# E. Localに残すもの

| 対象 | 理由 |
|---|---|
| `C:\Users\User\SOX-AUTO` 全体 | 唯一の実行SoT |
| Active `portfolio.db` | SQLite実行 |
| modules/dist/cache | runtime |
| Schedulerが指すパス | 変更禁止（本Phase） |
| 高頻度logs | |

---

# F. Google Driveに残すもの

- コラボ正本はそのまま。  
- Vaultへ実体コピーしない。  
- `RECOVERY/google_drive_index.md` に **場所・ファイル名・用途・要否** のみ（Human記入。推測で埋めない）。

---

# G. 再生成（PC交換時）

Python / Node / Git / Cursor / `npm ci` / `npm run build` / pip（ピン後） / pycache / Scheduler `--install`。

---

# H. Secret / Credential 配置

| 種類 | 実行時 | 復旧保険 | CI |
|---|---|---|---|
| Discord webhook URL | Local `logs/**/*.json` or env | **Vault（ACL制限・共有リンク禁止）** | GitHub Secrets |
| Discord bot token | env / 未使用時は無し | Secretsマネージャ方針（値をdocsに書かない） | `DISCORD_TOKEN` |
| Git認証 | Windows Credential | ユーザー保管 | — |
| `.env` | Local only（gitignore） | 項目は `.env.example` | — |

**GitHubリポジトリにSecret実体を置かない。**

---

# I. `.gitignore` 変更案

現行の穴: `node_modules`/`dist` 未記載、`data/asa_minimum_runtime/` 未ignore。

提案（Additive）:

```gitignore
# Regenerable / heavy
node_modules/
dist/
.pytest_cache/
**/__pycache__/

# ASA operational SoT（Vaultへ。GitHub禁止）
data/asa_minimum_runtime/

# Keep existing:
# logs/, data/backtest/, data/common_backtest/datasets/, .env rules, _*.py, _*.txt
```

任意:

```gitignore
data/common_backtest/reports/
data/ops/
*.html
_tmp_*/
tmp_*/
```

**影響:** 今後誤って ASA records を add しにくくなる。reportsをignoreするとGitHubに証跡を載せにくくなる→**reportsはVault必須・GitHubは選別docsで可**なら ignore推奨。

`.env.example` は現行 `!.env.example` を維持。

---

# J. Vaultディレクトリ構造案（最小変更）

```text
OneDrive/
  SOX-VAULT/                          ← 新規Lean（推奨）
    data/
      asa_minimum_runtime/            ← robocopy/mirror from Local
      common_backtest/
      backtest/
    logs/
      portfolio/
        backups/
        discord_webhook.json
      ndx/
        discord_webhook.json
        discord_ui_webhooks.json
    research/
    RECOVERY/
      RUNBOOK.md
      env_snapshot.md
      google_drive_index.md           ← Human
      VERIFY_CHECKLIST.md
    code_cold_spare/                  ← 過渡期のみ
      （G1–G3相当）
  SOX-AUTO/                           ← 既存丸ごと：検証完了まで保持（削除は最終承認）
```

復元時は Vault の相対パスを Local repo ルートへ重ねるだけでよい。

---

# K. 実施順序（安全順）

```text
Phase 2-0  承認ゲート（本計画）
    ↓
Phase 2-A1  .gitignore 更新 + 検証（ASAがignoreされること）     [低]
    ↓
Phase 2-A2  Secret再スキャン → Slice G1 commit+push            [中]
    ↓
Phase 2-A3  Slice G2 commit+push                               [中]
    ↓
Phase 2-A4  Slice G3 commit+push                               [中]
    ↓
Phase 2-A5  Slice G4（taxable）commit+push                     [中]
    ↓
Phase 2-A6  Slice G5–G6（tools/docs）                          [低〜中]
    ↓
Phase 2-A7  新clone smoke: build/test/asa CLI（別dir）         [中]
    ↓
Phase 2-B1  OneDrive/SOX-VAULT 新規作成 + データ類コピー       [中]
    ↓
Phase 2-B2  webhook秘匿コピー + ACL確認                        [中]
    ↓
Phase 2-B3  code_cold_spare 投入（A7成功まで必須）             [低]
    ↓
Phase 2-B4  RECOVERY docs 作成                                 [低]
    ↓
Phase 2-B5  Vault検証（件数・hash照合）                        [中]
    ↓
Phase 2-B6  （任意・後）丸ごと SOX-AUTO コピーの削除承認       [高※削除時]
    ↓
Phase 2-C   G7研究ランナー等（任意）                            [低]
```

**現行 Local 実行・Schedulerは全工程で非変更。**

---

# L. リスク評価

| 作業 | リスク | 内容 |
|---|---|---|
| `.gitignore` | 低 | 追跡済みには影響小。新規誤add防止 |
| G1–G3 commit | 中 | 秘密混入・巨大バイナリ混入 |
| G4 taxable | 中 | 表示/Discord経路の差分レビュー必要 |
| G8 Actions | 中〜高 | 意図しないCI発火 |
| Vaultコピー | 中 | 経路間違い・webhook漏洩（共有設定） |
| 丸ごと削除 | **高** | A7+B5完了前は禁止 |
| Scheduler/実行SoT変更 | **対象外（禁止）** | |

---

# M. ロールバック

| 変更 | 戻し方 |
|---|---|
| `.gitignore` | `git checkout -- .gitignore`（commit前）/ revert commit |
| 各Slice commit | `git revert`（push後）または resetは共有前のみ |
| push済み不適切ファイル | history書き換えより **新commitで削除 + rotate秘密** |
| Vaultコピー失敗 | Localが正。Vaultを消して再コピー |
| 誤って丸ごと削除 | Local + GitHub（A完了後）から再建。削除前は禁止 |
| Local実行障害 | 本計画ではLocalを変えないため原理的に非該当 |

---

# N. PC交換Runbookへの反映（本Phase完了後の簡略化）

**完了前:** 丸ごとODコピー頼り + GitHub不完全。  
**完了後:**

```text
1. OneDrive で SOX-VAULT 同期
2. git clone GitHub → Local Runtime
3. Vault から data/asa_*, common_backtest, backups, webhook を配置
4. 最新 backup → portfolio.db
5. npm ci && npm run build && pip install -r <pin>
6. setup_scheduler / setup_ndx_scheduler --install
7. VERIFY_CHECKLIST（asa status / doctor / NDX / Discord resolve）
```

`code_cold_spare` 手順は **A7成功後にRunbookから削除可能**。

---

## 代替案（却下理由つき）

| 案 | 判断 |
|---|---|
| 先に丸ごとLean化してコードはコピー頼み | **却下**（GitHub目標に逆行・ドリフト） |
| `git add .` 一発 | **却下**（ASA/データ/HTML/秘密混入） |
| Active DBをVaultで実行 | **却下** |
| GDriveへ運用SoT移管 | **却下**（プロトコル外・二重化） |

---

## 承認後の「最初の実装依頼」文面案

```text
Phase 2-A1/A2 実施:
1) .gitignore を計画Iどおり更新
2) Secret再スキャン
3) Slice G1（asa_minimum_runtime + tests + package関連）のみ commit
（pushは明示指示があるまで保留でも可）
Local実行・Scheduler・Vault実体化はまだ触らない
```

---

## 最終チェック（計画の自己評価）

| 問い | 答え |
|---|---|
| 現行運用を壊すか | **計画上No**（実行SoT/Scheduler非変更） |
| Level 2到達に足りるか | A完了で **Yes** |
| Level 3到達に足りるか | A+B+交換時Schedulerで **Yes** |
| この順番で安全か | **A（gitignore→コアcommit→clone検証）→B（Lean Vault）** が安全 |

---

# End of Plan

**実作業は未実施。本計画の承認後にスライス実施を別依頼すること。**
