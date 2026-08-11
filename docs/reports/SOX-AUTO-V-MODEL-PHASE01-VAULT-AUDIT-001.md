# SOX-AUTO Vモデル Phase 0–1 — 承認評価 + OneDrive Vault 精査

**Record ID:** SOX-AUTO-V-MODEL-PHASE01-VAULT-AUDIT-001  
**Title:** Vモデル承認評価と OneDrive 丸ごとコピー精査（Lean Vault 設計）  
**Status:** **AUDIT / DESIGN ONLY**（移動・削除・切替・Scheduler変更・commit/push 未実施）  
**Date:** 2026-08-11  
**実行SoT:** `C:\Users\User\SOX-AUTO`  
**Vault候補（丸ごとコピー）:** `C:\Users\User\OneDrive\SOX-AUTO`  

```text
Phase 0 = Vモデル成立性・不足資産
Phase 1 = OneDriveコピーの実精査 → Lean Vault 対象確定
≠ 実装変更
```

---

## A. Vモデル承認評価

### 判定: **修正して採用（Adopt with Amendment）**

五層（GitHub / OneDrive Vault / Google Drive / Local Runtime / Windows）の骨格は **採用可能**。  
ただし Phase 0 で **重大な不足** が実測されたため、**修正条件付き承認**とする。

### 必須修正（V' = V + Software Integrity Gate）

| 修正 | 内容 |
|---|---|
| **S1. GitHub Software SoT が現状不完全** | 実行必須コードの多くが **Git 未追跡**（下記）。GitHub clone だけでは Level 2/3 不可 |
| **S2. Vault の過渡的役割** | GitHub が追いつくまで、Vault（または承認後の commit）が **コードのコールドスペア**も担う必要がある |
| **S3. 丸ごとコピー ≠ Vault** | 現状 OneDrive コピーは modules 込みの複製。Lean Vault へ役割変更が必要（実施は別承認） |
| **S4. Active DB は Vault に「実行」として置かない** | バックアップ世代＋任意のコールドスナップショットのみ |

#### S1 実測（GitHub ギャップ）

| 資産 | disk | git tracked | 影響 |
|---|---|---|---|
| `src/asa_minimum_runtime/**` | 22 files | **0** | ASA Runtime 全体が clone 不能 |
| `portfolio/**` | 16 files | **0** | Portfolio Fact層コードが clone 不能 |
| `backup_db.py` / `ops_nightly.py` / `ndx_ops.py` / `setup_*scheduler.py` / `collect_market_daily.py` / `doctor.py` / `discord_notify.py` 等 | 存在 | **NOT_TRACKED** | 自動運用スクリプトが clone 不能 |
| `taxable_account/**` | 97 | **44** | FORTRESS/特定口座の一部のみGitHub |
| working tree | — | dirty ~270行（untracked ~246） | 未反映作業がPC依存 |

**結論:** 「GitHub + Vault + GDrive + 新PC」で Level 3 と言う前に、**Software SoT を GitHub に載せる作業（別承認の commit 計画）が Level 3 の前提条件**。  
それまでは OneDrive 丸ごとコピー／将来の Lean Vault 内 `code_cold_spare` が実質の保険。

Vモデル自体の五層は維持。**「GitHub = 完全な Software SoT」は現状ではなく目標状態**と明記する。

---

## Phase 0 照合結果（要約）

| 問い | 答え |
|---|---|
| 現行プロトコルを V で維持できるか | **実行は Local 維持なら維持可**。復旧は S1 解消が前提 |
| 不足資産 | **未追跡コード**、構造化 Vault、depsピン、GDrive目録、Runbook正本 |
| Vault に入れるべき | 下表 B |
| 入れてはいけない | Active実行DBとしての常用、modules/dist/cache、交互実行用フルツリー |
| GDrive | コラボ正本維持。二重SoT不要（目録） |
| GitHub | コード目標SoT。**今は穴がある** |
| Local | 実行SoT + Active DB + runtime 生成物 |
| 再生成 | modules/dist/cache/scratch 等 |

### Local ↔ OneDrive コピー照合

- 主要ハッシュ一致: ASA history、`portfolio.db`、webhook 3種、seal、lockfile  
- ディレクトリサイズほぼ一致（docs のみ Local が新しいレポート分やや大きい: 972 vs 968 files）  
- コピーは **鮮度が高い保全**だが、**Lean ではない**（modules 49MB 等を含む）

---

## B. OneDrive Vault 対象一覧（入れる）

実施時の推奨ルート（最小変更・既存構造利用）:

```text
OneDrive/SOX-VAULT/          ← 新規Lean（推奨）
  または
OneDrive/SOX-AUTO/ を役割変更し中身をLean化（別承認）

推奨レイアウト（リポジトリ相対パスを維持 = 復元が楽）:
  data/asa_minimum_runtime/          ★必須
  data/common_backtest/              ★必須（datasets+reports）
  data/backtest/                     ★推奨（gitignore・再生成コスト高）
  logs/portfolio/backups/            ★必須（既存 backup_db 成果）
  logs/portfolio/discord_webhook.json ★必須（秘匿）
  logs/ndx/discord_webhook.json       ★必須（秘匿）
  logs/ndx/discord_ui_webhooks.json   ★必須（秘匿）
  research/                          ★推奨（未追跡・再生成困難）
  semiconductor_holdings/            △データ成果があれば
  RECOVERY/                          ★Runbook・版数・Scheduler定義・検証手順
  code_cold_spare/                   ★過渡期のみ（S1解消まで）
    portfolio/
    src/asa_minimum_runtime/
    ops scripts一式（backup_db, ops_nightly, ndx_*, setup_*, collect_*, doctor, discord_notify, …）
    taxable_account/ の未追跡分
```

### 精査表（主要エントリ）

| 現在の場所 | Git | 用途 | 再生成 | 更新 | OD適性 | Vault | Local維持 | GitHub | GDrive | PC交換 | 理由 |
|---|---|---|---|---|---|---|---|---|---|---|
| `data/asa_minimum_runtime/records/*.json`（32） | untracked | ASA SoT | **不可** | 低〜中 | **高** | **Yes** | Yes（実行） | No（秘密でないが運用SoT） | No | **Yes** | Official/orphanの正。Vault主保管向き |
| `data/asa_minimum_runtime/history/history.jsonl` | untracked | History | **不可** | 低〜中 | **高** | **Yes** | Yes | No | No | **Yes** | Official条件の片翼 |
| `data/asa_minimum_runtime/drafts/` | untracked | Draft | 可（破棄可） | 低 | 中 | No（空なら不要） | Yes | No | No | No | Official前。必要なら任意 |
| `logs/portfolio/backups/portfolio_*.db`（8, ~6.6MB） | ignored | DB世代backup | 条件付 | 週次 | **高** | **Yes** | Yes | No | No | **Yes** | 既存機構の成果。オフサイト化対象 |
| `logs/portfolio/portfolio.db` | ignored | **Active DB** | 不可（内容） | 高（設計上） | **低（実行）** | **Cold copy のみ可** / ActiveはNo | **Yes Active** | No | No | 復元用にYes | 実行はLocal。Vaultは最新backupで足りる＋任意スナップショット |
| `logs/portfolio/discord_webhook.json` | ignored | Discord設定 | 不可 | 低 | 中※秘匿 | **Yes（秘匿扱い）** | Yes | **No** | No | **Yes** | GitHub Secretsと役割分担可。ファイル復元経路が現行実装の主 |
| `logs/ndx/discord_*.json` | ignored | NDX通知設定 | 不可 | 低 | 中※秘匿 | **Yes** | Yes | No | No | **Yes** | 同上 |
| `logs/runtime/` / nightly text | ignored | 運用ログ | 可 | 高 | 低 | No | Yes | No | No | No | 再生成・ノイズ |
| `data/common_backtest/datasets/` | ignored | 検証入力 | 条件付 | 低 | 高 | **Yes** | Yes | No | No | **Yes** | ~22MB。再取得コスト大 |
| `data/common_backtest/reports/` | untracked | 検証成果 | 条件付 | 低 | 高 | **Yes** | Yes | 一部docs化は可 | No | **Yes** | ~6.6MB。判断証跡 |
| `data/backtest/` | ignored | 旧/補助データ | 条件付 | 低 | 中 | **Yes推奨** | Yes | No | No | Yes | ~5MB |
| `research/` | untracked | 研究資産 | 条件付 | 低 | 高 | **Yes** | Yes | 選別後可 | 目録 | Yes | Git外 |
| `code_cold_spare`（未追跡実行コード） | untracked | Software | 不可※手元のみ | 中 | 中 | **Yes（過渡）** | Yes | **目標Yes** | No | **必須（今）** | S1解消までVault必須保険 |
| Runbook / 版数 / Scheduler定義 | 一部reports | 復旧手順 | 不可（知識） | 低 | **高** | **Yes** | — | Yes（公開可部分） | No | **Yes** | Level 3 の手順SoT |

**Vaultコア容量見積:** 約 **44MB**（ASA+common_backtest+backtest+backups+dbスナップ+research+holdings）  
**+ code_cold_spare:** 数MB〜十数MB（modules無し）  
**合計 Vault目標: ≪ 100MB**（20GB中に余裕極大）

---

## C. Vaultから除外するもの

| 対象 | 分類 | 理由 |
|---|---|---|
| `node_modules/`（~49MB, 5144f） | **再生成** | `npm ci`。同期害最大 |
| `dist/` | **再生成** | `npm run build` |
| `__pycache__` / `.pytest_cache` | **再生成** | |
| `scratch/` / `_tmp_dump/` | **Local/破棄可** | |
| `.git/` をVault主対象にすること | **GitHub** | cloneが正。同期上の.git常用はリスク |
| フル `src` の恒久Vault化（S1解消後） | **GitHub** | 過渡期のみ cold spare |
| Active DB を同期上で「常用実行」 | **Local** | |
| `auto-scribe-ai/` 丸ごと（~7MB） | **条件付き除外** | ASA Runtimeと別系統。必要なら選別。原則Vault必須ではない |
| 丸ごとコピーの常用維持 | **廃止予定** | Lean Vaultへ |

---

## D. Google Driveに残すもの

| 方針 | 内容 |
|---|---|
| **SoT維持** | コラボで作成され GDrive が正となっている成果物一式 |
| **Vault複製** | **原則しない**（二重SoT回避） |
| **Runbook** | フォルダ名 / URL / 所有者 / 「SOX復旧に要否」の目録のみ |
| **例外コピー** | SOX Level 3 に **ファイル実体が必須** かつ GDrive永久保証が弱いものだけ（現状リポ内からは該当を特定不能 → 目録作業で確定） |

リポジトリ内に GDrive 実データ連携は無し。

---

## E. GitHubに残すもの（Software SoT）

| 状態 | 対象 |
|---|---|
| **既に載っている** | 一部 `taxable_account`、Legacy SOX scripts、docs baselines/reports（多数）、releases、seal json、Actions 等 |
| **載せるべき（未達＝今の穴）** | `portfolio/**`、`src/asa_minimum_runtime/**`、ops/NDX/Scheduler setup、`collect_*`/`doctor`/`backup_db`/`discord_notify`、taxable 未追跡分、package/lock の最新、Assisted Loop 関連 tests |
| **載せない** | ASA records、portfolio.db、webhook 実体、logs、`.env` 実値 |

---

## F. Localに残すもの（Active Runtime）

| 対象 | 理由 |
|---|---|
| `C:\Users\User\SOX-AUTO` 全体（現行実行） | 唯一の実行SoT |
| Active `logs/portfolio/portfolio.db` | SQLite実行 |
| `node_modules` / `dist` / caches | 実行・再生成 |
| 高頻度 `logs/runtime`・nightly 出力 | |
| Scheduler が指すパス上の脚本 | 今は変更禁止 |

---

## G. PC交換時に再構築するもの

- Python / Node / Git / Cursor / OneDrive client  
- `npm ci` / `npm run build`  
- pip（ピン後）  
- Scheduler `setup_*.py --install`  
- 認証（GitHub、Discord）  
- Always-keep（Vault/作業ツリーをOD上で使う場合）  

---

## H. 今すぐ実施してよいこと（運用非破壊・要別承認で実作業）

今回は未実施。承認後に安全な順:

1. **GitHub 穴の解消計画**（commit対象リスト確定 → 別依頼で commit）※最優先  
2. Vault ディレクトリ設計の確定（本レポート B）  
3. 丸ごとコピーを「実行禁止・保全」と明記した運用  
4. ASA件数・backup世代・webhook存在の定期点検  
5. Runbook 初版を docs に固定（公開可能部分）  
6. GDrive 目録テンプレ記入（Human）  

---

## I. PC交換直前に実施すること

- Vault 鮮度の最終同期（ASA hash、最新 backup）  
- code_cold_spare が不要か（GitHub完全なら削除可）確認  
- 秘密・認証の手元確認  
- 旧PC Scheduler 停止計画  

---

## J. PC交換時に実施すること（復旧手順）

```text
1. OneDrive 同期（Vault）
2. GitHub clone → Local Runtime 配置
3. （必要なら）Vault の code_cold_spare を重ねる ※S1解消後は不要
4. Vault から data/asa_*, data/common_backtest, logs/portfolio/backups, webhook JSON を復元
5. 最新 backup から Active portfolio.db を配置（または backup を正として copy）
6. npm ci && npm run build / pip install
7. setup_scheduler.py --install / setup_ndx_scheduler.py --install
8. 検証: asa status / doctor / NDX dry / webhook resolve / taxable smoke
9. Level 3 確認
```

---

## K. 現在のプロトコルへの影響（Phase 0–1 設計のみ）

| 領域 | 影響 | 注 |
|---|---|---|
| ASA | **影響なし**（設計） | Vault化は保管。実行はLocal |
| Portfolio | **影響なし**（設計） | Active DB非移動。backupのオフサイトは条件付き改善 |
| FORTRESS / 特定口座 | **影響なし**（設計） | コード穴は GitHub 側リスク（復旧時） |
| NDX AM/PM | **影響なし**（設計） | Scheduler未変更 |
| Discord | **影響なし**（設計） | webhook Vault化は秘匿保管の話 |
| 自動運用全般 | **影響なし**（今） | 切替・Scheduler変更をしない限り |

**条件付き:** GitHub 未反映のまま旧PCが死ぬと、Vault無しではコードもデータも危うい。丸ごとコピーがある間は保険あり。

---

## 秘密（webhook）の置き場判断

| 置き場 | 評価 |
|---|---|
| GitHub リポジトリ | **禁止**（現行どおり） |
| GitHub Secrets | CI用。ローカル実装はファイル/env優先 |
| OneDrive Vault（制限ACL） | **可**（復旧必須）。暗号化・リンク共有禁止を Runbook へ |
| Local `logs/**` | **現行実行用** |

役割分担: **実行=Localファイル or env / 復旧保険=Vault / CI=Secrets**。

---

## ASA: Vaultを主保管にしてよいか

**Yes（永続保管の主）。**  
実装はパス相対の JSON/jsonl。低頻度・小容量（~0.05MB）。同期実行リスクは小さい。  
ただし **実行中の書き込み先は当面 Local ツリー**（Vのまま）。Vaultは同期されたコピー／復元元。

---

## Lean Vault 変換設計（実施は別承認）

```text
現状: OneDrive/SOX-AUTO = 146MB 丸ごと（modules込み）

目標:
  OneDrive/SOX-VAULT/  ~50–80MB（code_cold_spare含む過渡期）
  または SOX-AUTO を空にして VAULT のみ残す

原則:
  - リポジトリ相対パスを維持（復元スクリプトが単純）
  - Active DB は入れない（backups を入れる）
  - modules/dist/git 作業コピーを入れない
  - 既存 backup_db.py の出力をオフサイトへコピーする運用を最小追加
```

---

## Level 判定

| Level | 現在 | Phase1 Vault+ S1(GitHub) 後 |
|---|---|---|
| 1 | 部分（丸ごとコピー頼み） | **到達** |
| 2 | GitHubのみでは **不可**（コード穴） | **到達**（clone+復元） |
| 3 | **未到達** | **手順付きで到達可**（Scheduler再登録＋検証） |

### Level 3 不足チェックリスト

1. □ 未追跡実行コードの GitHub 化（S1）  
2. □ Lean Vault 実体化（本精査どおり）  
3. □ deps ピン  
4. □ Runbook  
5. □ GDrive 目録  
6. □ 復旧ドリル（1回）  

---

## 容量

| 項目 | 値 |
|---|---|
| OneDrive 使用概算 | ~610 MB |
| クォータ | 20 GB |
| 残概算 | **~19.4 GB** |
| Vault目標 | **≪ 100 MB** |
| 余裕 | **十分** |

---

## 最終一文

> **Vモデルは修正条件付きで承認相当。**  
> 最大の発見は「データより先に、実行コードの多くが GitHub に無い」こと。  
> OneDrive 丸ごとコピーは優秀な一時保険だが Vault ではない。  
> 次の実施承認では **(1) Software を GitHub へ載せる計画** と **(2) Lean Vault 化** をセットで扱うべき。

---

## 今回実施しなかったこと

移動・削除・rename・本番切替・Scheduler・Active DB移動・OD実行化・GDrive移動・commit/push — **すべて未実施**。
