# Portfolio judgment verification

人間向けの利用ガイドです。  
**設計規範の正本は** [`.cursor/rules/portfolio-judgment-verification.mdc`](../.cursor/rules/portfolio-judgment-verification.mdc) **のみ**です（実装前の判断手順・設計変更ルール・禁止事項はそちらを参照）。

## 目的

価格を溜めるシステムではありません。

市場事実・投資仮説・（将来の）意思決定・実際の保有を分けて記録し、**過去の投資判断を後から検証する**ためのシステムです。

## 全体像

```text
Fact (市場 SoT)
    |
Hypothesis  -->  (future) Decision  -->  Position
                      \_______________/
                              |
                           Review（生成物）
```

| 層 | 一言 |
|---|---|
| **Fact** | 市場で起きたこと（価格・為替・リバランス等） |
| **Hypothesis** | その時点で何を考えていたか |
| **Decision** | 仮説を行動意図へ変換（未実装・予約） |
| **Position** | 実際の保有・取得額・評価額 |
| **Review** | 上記を突合する再生成可能な検証 |

資産（Mega 系列 / SOXX / FNGS / QQQ）は同格。比較セットはレビュー時に指定します。

## DB構成

パス: `logs/portfolio/portfolio.db`

| テーブル | 層 | 役割 |
|---|---|---|
| `meta` | — | schema / purpose |
| `asset` | Fact マスタ | 比較対象の定義（追加は INSERT） |
| `market_daily` | Fact | 日次価格（縦持ち） |
| `fx_daily` | Fact | USDJPY |
| `rebalance_event` | Fact | 指数入替など |
| `hypothesis` | Hypothesis | 仮説・期待順位・根拠・状態 |
| `hypothesis_review` | Hypothesis（人間検証メモ） | validated 等のレビュー記録 |
| `holdings_snapshot` | Position | `position_id` 単位の保有スナップショット |
| `review_run` / `review_metric` | Review | 月次・四半期などの生成キャッシュ |

## ディレクトリ構成

```text
portfolio/           # DB・指標・レビュー共通ロジック
  README.md          # 本ガイド
  db.py / metrics.py / mega_proxy.py / review_common.py
.cursor/rules/
  portfolio-judgment-verification.mdc   # 設計正本
logs/portfolio/
  portfolio.db
init_portfolio_db.py
collect_market_daily.py
hypothesis_cli.py
hypothesis_review_cli.py
holdings_cli.py
rebalance_cli.py
review_monthly.py
review_quarterly.py
test_portfolio_db.py
```

## CLI一覧

| コマンド | 層 | 用途 |
|---|---|---|
| `python init_portfolio_db.py` | — | DB 初期化・asset シード |
| `python collect_market_daily.py` | Fact | 日次収集（既定開始 `2022-01-01`） |
| `python hypothesis_cli.py` | Hypothesis | 仮説の登録・更新・一覧 |
| `python hypothesis_review_cli.py` | Hypothesis | 人間による仮説検証メモ |
| `python holdings_cli.py` | Position | ポジション別保有スナップショット |
| `python rebalance_cli.py` | Fact | リバランス／構成変更イベント |
| `python review_monthly.py` | Review | 月次レビュー |
| `python review_quarterly.py` | Review | 四半期レビュー |

## 運用の流れ

### 1. 初期化

```bash
python init_portfolio_db.py
```

### 2. 日次収集（Fact）

対象: `MEGA10_PROXY` / `SOXX` / `FNGS` / `QQQ` / `USDJPY`  
既定期間: **2022-01-01 → 今日**（既存行は PRIMARY KEY で重複追加しない）

```bash
python collect_market_daily.py
python collect_market_daily.py --start 2022-01-01
python collect_market_daily.py --import-csv MEGA10_FUND path\to\nav.csv
```

ログに各資産の件数・取得可能期間・正常な履歴不足（ETF設定前など）が出ます。

### 3. 仮説・保有（Hypothesis / Position）

```bash
python hypothesis_cli.py add --as-of 2026-07-01 --title "..." --thesis "..." \
  --expected-ranking MEGA10_PROXY,FNGS,QQQ,SOXX --horizon 3M

python holdings_cli.py add --as-of 2026-07-15 --position-id nisa_growth_mega \
  --cost-jpy 1200000 --value-jpy 1250000 --hypothesis-id 1

python hypothesis_review_cli.py add --hypothesis-id 1 --review-date 2026-09-30 \
  --actual-ranking FNGS,SOXX,MEGA10_PROXY,QQQ --result partially_validated \
  --comment "..."
```

### 4. レビュー（Review）

```bash
python review_monthly.py --year 2026 --month 7 --compare-mode intersection
python review_monthly.py --year 2026 --month 7 --compare-mode calendar
python review_quarterly.py --year 2026 --quarter 3 --compare-mode intersection
```

出力には必ず次が含まれます。

- `Comparison mode`
- `Compare period`
- `Compare reason`

#### compare-mode

| モード | 意味 |
|---|---|
| `intersection`（既定） | 全比較対象に価格がある日だけ。開始が遅い資産は期間を後ろに寄せる（欠損扱いしない） |
| `calendar` | 同じ暦期間。期間内にデータが無い資産は比較対象外 |

## 運用コマンド

### 日常運用（portfolio.py）

```bash
python portfolio.py              # 状態・案内・必要な入力・レビュー案内
python portfolio.py --update     # Backup → Collect → Doctor → Status
```

起動時: Portfolio Status / Today's checklist / Reminder / 運用サマリー（直近30日）。
初回のみ: DB / Scheduler / Backup / Runtime / Asset の確認。

### 管理者向けCLI（保守・診断・設定）

日常入口とは責務分離。参照系は副作用なし。

```bash
python doctor.py                 # 一括診断（参照）
python health_check.py           # 健全性（参照）
python integrity_check.py        # integrity（参照）
python db_stats.py               # 統計（参照）
python backup_db.py              # バックアップ（更新）
python export_csv.py market_daily
python setup_scheduler.py        # Usage のみ（変更なし）
python setup_scheduler.py --list
python setup_scheduler.py --install
python setup_scheduler.py --uninstall
```

共通オプション（既存CLI含む）:

```bash
python doctor.py --version
python collect_market_daily.py --dry-run
python review_monthly.py --year 2026 --month 7 --dry-run
python holdings_cli.py import-csv path\to\file.csv --dry-run
```

Runtime ログ: `logs/runtime/YYYY-MM-DD.log`

## 設計について

層の責務・実装前ゲート・設計変更・SoT・禁止事項の詳細は変更せず、正本のみを参照してください。

→ [`.cursor/rules/portfolio-judgment-verification.mdc`](../.cursor/rules/portfolio-judgment-verification.mdc)

運用で見つかった改善候補は、すぐ設計変更せず [ISSUES.md](ISSUES.md) に記録し、継続発生を確認してから検討します。
