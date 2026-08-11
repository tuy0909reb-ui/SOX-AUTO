# SOX-AUTO 永続保管・実行モデル — 実装根拠付き最終提案

**Record ID:** SOX-AUTO-DURABLE-STORAGE-ARCHITECTURE-001  
**Title:** PC交換耐性のための保管・実行アーキテクチャ（自由設計）  
**Status:** **DESIGN PROPOSAL ONLY**（移動・設定変更・Scheduler変更・commit/push 未実施）  
**Date:** 2026-08-11  
**実行SoT（現行）:** `C:\Users\User\SOX-AUTO`  
**OneDriveコピー:** `C:\Users\User\OneDrive\SOX-AUTO` = 相談直前の丸ごと保全コピー（二重運用ではない）  

```text
目的 = 現運用を壊さず、突然のPC不能でも Level 3 復旧へ近づける
≠ OneDrive移設そのものを目的化しない
≠ A/B/Cの強制選択
```

---

## 0. 実装から導いた結論（先に読む）

### 推奨モデル名: **Vault + Local Runtime（V）**

A/B/Cより適合する独自案:

```text
GitHub          = バージョン管理されたコード・仕様・CI（ソフトウェアSoT）
OneDrive Vault  = 再生成不能な運用資産の「復旧パック」（整理された保管）
Google Drive    = コラボ成果物のSoT（無理にOneDriveへ二重化しない）
Local Runtime   = 現行実行ツリー + Active SQLite + 再生成依存
Windows         = Scheduler / 認証 / ランタイムインストール
```

| 従来案 | 本提案との関係 |
|---|---|
| **A** 全面OneDrive実行 | **採用しない**（SQLite・modules・On-Demand・Scheduler起動リスク） |
| **B** 大部分OneDrive＋ホットローカル | **将来オプション**（カットオーバー後の姿に近い） |
| **C** ローカル維持＋OneDriveバックアップ | **Vの当面フェーズ**に包含（ただし「丸ごとコピー」より**構造化Vault**へ進化） |
| **V（推奨）** | 実行はローカル維持。OneDriveは**構造化復旧パック**。GitHubはコード。GDriveはコラボSoT |

**なぜVか（実装根拠）:**

1. 書き込みホットパスは `logs/portfolio/portfolio.db`（SQLite）と logs 周辺に集中。ここを同期実行面に置くのが最大リスク。  
2. ASA SoT・docs・ソースは相対パス／低頻度更新でクラウド保管向き。  
3. `node_modules`/`dist`/cache は再生成可能で同期害が大きい（現状146MB中 modulesだけで~49MB・5144 files）。  
4. 既にある OneDrive 丸ごとコピーは **node_modules込み**で、復旧パックとして最適形ではない。  
5. GitHubに載らない資産（ASA records、DB、webhook JSON、common_backtest）が Level 1 の穴。  
6. Google Drive はリポジトリ内に実SoT連携なし（仕様上のConnector言及のみ）。コラボ成果をPC交換対策だけでOneDrive二重化する必然は薄い。  
7. 現行 Scheduler は `C:\Users\User\SOX-AUTO` 固定。今切替ると運用を壊す。

**希望フローとの関係:**

```text
新PC → OneDrive同期（Vault）→ GitHub clone → Vaultを所定位置へ復元
    → npm ci / build / pip → Scheduler再登録 → 確認
```

「OneDriveを開くだけ」より1ステップ多いが、**現行を壊さず Level 3 に届く最短安全路**。  
将来、慣れたら B-lean（作業ツリー自体をOneDrive化）へ進めてもよい。

---

## 1. 五層の役割分担（推奨アーキテクチャ）

| 層 | 役割 | 置くもの | 置かないもの |
|---|---|---|---|
| **GitHub** | ソフトウェアSoT・協調履歴 | `src`/`scripts`/`docs`（追跡分）/`tests`/`taxable_account`/`portfolio`コード、Actions、lockfile、`.env.example`、Cursor rules | ASA本番records、`portfolio.db`、webhook実体、秘密値、巨大bin |
| **OneDrive Vault** | PC交換時の個人運用資産パック | ASA SoT一式、DB世代バックアップ、webhook JSON、未追跡の重要 `common_backtest`/`research` 成果、Runbook、環境スナップショット（版数・Scheduler定義・復元チェックリスト） | `node_modules`、`dist`、pycache、丸ごと作業コピーの常用 |
| **Google Drive** | コラボ成果物SoT | 共同作成ドキュメント・共有成果 | SOX runtime、Scheduler、SQLite実行、秘密の単一保管先化 |
| **Local Runtime** | いま動かす場所 | 現行 `C:\Users\User\SOX-AUTO`、Active DB、modules、dist、cache、高頻度logs | 「唯一の永久バックアップ」を兼ねさせない |
| **Windows** | 機械固有 | Scheduler、Python/Node/Git/Cursor、資格情報ストア、Always-keep | データSoTそのもの |

```text
          GitHub (code)
              ↑ push
Local Runtime ←→ 開発・自動運用（現行）
              ↓ 構造化コピー（人または将来スクリプト）
         OneDrive Vault (durable ops assets)
              ↑
         Google Drive (collab SoT) ── 索引だけrepo/docsに任意記載
```

---

## 2. 実装調査サマリ（分類の根拠）

### 2.1 パス・実行

| 領域 | 実装の性質 | 保管示唆 |
|---|---|---|
| ASA Runtime | cwd相対 `data/asa_minimum_runtime`；CommitAPI；低頻度書込 | Vault向き。実行もローカルツリー内で可 |
| Portfolio | `DEFAULT_DB_PATH=logs/portfolio/portfolio.db`；多数CLIが接続；`--db`上書き可（例: collect） | **Active=Local**。Backup=Vault |
| Taxable/FORTRESS | `Path(__file__).parents[2]`；webhookは env または `logs/**/discord_webhook.json` | コード=GitHub。webhook=Vault |
| NDX | Scheduler→`ndx_ops.py`；`logs/ndx` | 実行=Local。設定=Vault |
| NISA scripts | `OneDrive\デスクトップ\NISA_BACKTEST` 絶対パス多数 | データは既にOneDrive。コードはGitHub。GDriveとは別 |
| GitHub Actions | checkout＋Secrets | PC配置非依存 |
| Cursor | repo rulesはGit；User settingsはAppData | rules=GitHub。User=Windows再設定 |

### 2.2 portfolio.db（重点）

| 観測 | 意味 |
|---|---|
| Active ~856KB、mtime 2026-08-05 | 直近書込は数日前（Nightly不安定の可能性と整合） |
| `backup_db.py` 週次、`logs/portfolio/backups/`、KEEP=20 | **Local Active + 世代バックアップ**が既に実装済み |
| 最新backup名 `portfolio_20260809_*` | Scheduler週次は動いている |
| OneDrive上でのActive実行 | 同期ロック破損リスク → **非推奨** |

**推奨（現状実装を壊さない）:**

```text
Local Active DB（現行パス）
  + 既存 weekly backup（local）
  + OneDrive Vault へ「検証済み世代コピー」（オフサイト）
  ± 将来: --db で Local専用パスへ分離（任意・要承認）
```

比較:

| 方式 | 判定 |
|---|---|
| OneDrive上 Active DB | **却下** |
| Local Active + OneDrive backup | **推奨（今の延長）** |
| Local Active + 世代backupのみ（オフサイト無し） | PC全損で同死 → **不足** |
| 別クラウドのみ | 可だが OneDrive が既にあるなら二重化不要 |

### 2.3 Google Drive

- リポジトリに実データのSoT接続なし（アーキ仕様の Connector 言及のみ）。  
- コラボ成果がGDriveにあるなら **GDriveを正として維持**。  
- PC交換対策だけを理由に OneDriveへ全面二重化は **コスト＞便益**（容量・鮮度・どちらが正か問題）。  
- やるなら: **目録（何が・どのフォルダ・誰が正）** を Runbook に書く。必要最小の「手元に無いと困る」ものだけ任意ミラー。

### 2.4 容量

SOX ~146MB、Lean ~80–90MB、OneDrive全体使用 ~0.6GB級 / 20GB。  
**容量は設計の律速ではない。** 律速は「再生成不能資産の所在」と「実行ホットパス」。

---

## 3. Level 1–3 復旧性（現状 → V達成後）

| Level | 現状 | V（Vault整備後） |
|---|---|---|
| **1** コード＋重要データ | 部分（Git外がローカルと丸ごとコピーに依存。コピーはmodules肥大・鮮度管理が曖昧） | **到達可**（VaultにASA/DB backup/webhook/重要data） |
| **2** 手動実行 | 手順あれば可（depsピン不足） | **到達可**（clone+npm ci+build+pip pin+Vault復元） |
| **3** 自動運用 | **未到達**（Scheduler・認証・検証） | **手順付きで到達可**（install scripts既存。起動遅延設計をRunbookへ） |

Level 3 不足（今埋められるのは主に準備）:

1. 構造化 Vault（丸ごとコピーの代替）  
2. dirty / 未push の GitHub 反映方針  
3. Python 依存ピン（実機63 vs requirements-dev 3行）  
4. Runbook（Scheduler定義・版数・検証コマンド）— 一部は既存調査レポートに採取済  
5. GDrive目録  
6. Discord秘密の復元元チェック（値は書かない）  
7. カットオーバーしない限り「OneDriveを開くだけ」にはならない（Vのトレードオフ）

---

## 4. A–G 判断（今やる／やらない）

| 区分 | 内容 |
|---|---|
| **A 今すぐ価値が高い** | Vault設計に沿った**保全対象リスト確定**；ASA件数・DB backup・webhook存在の点検；dirty棚卸し；丸ごとコピーを「常用実行」にしない宣言 |
| **B 今は採取・手順のみ** | Scheduler XML相当情報、版数、復旧手順、GDrive目録テンプレ、pip freeze手順 |
| **C PC交換直前** | 最終Vault鮮度確認、秘密の手元確認、旧PC Scheduler停止計画 |
| **D 新PCで再生成** | Python/Node/Git/Cursor、`npm ci`、`dist`、pycache、（venv） |
| **E 移さない方がよい** | Active SQLiteを同期実行面へ；node_modulesをクラウド主保管；Schedulerを今変更 |
| **F 本番変更リスク大** | 実行SoT切替、Active DB移動、6タスク付け替え、交互実行 |
| **G 今移すと交換が楽** | **再生成不能資産のVault化**（ASA、DB世代、webhook、重要common_backtest）。コードのpush。※作業ツリー全体のOneDrive常用化は必須ではない |

---

## 5. 最終12項目への回答

### 1. 今すぐやること（承認後の作業イメージ・今回は未実施）
- 「実行=Local / 復旧=Vault」方針の確定  
- OneDrive上の丸ごとコピーを**実行に使わない**  
- Vault用ディレクトリ設計（例: `OneDrive/SOX-VAULT/` または既存コピーの**中身をLean化して役割変更**）— 実施は別承認  
- ASA / DB backup / webhook / 重要data のチェックリスト実行  

### 2. 今は準備だけ
- Runbook正本化  
- 環境スナップショット（版数・タスク定義）  
- depsピン手順  
- GDrive成果物目録  

### 3. PC交換直前
- Vault最終同期確認  
- 秘密・認証の手元確認  
- （任意）B-lean切替をやるならこの時点  

### 4. 新PCで再構築
- OSアプリ群、clone、npm/pip、Scheduler `--install`、Always-keep（Vault/作業ツリー用いる場合）  

### 5. 移動してはいけない（今）
- 実行SoT、Active DB、Scheduler参照、プロトコル意味  

### 6. OneDriveに置くもの
- **Vault:** ASA SoT、DBバックアップ世代、webhook JSON、未追跡の重要検証成果、Runbook  
- （任意将来）Lean作業ツリー  
- **置かない:** modules/dist/cacheを主対象にしない  

### 7. Google Driveに残すもの
- コラボ成果の正本  
- OneDriveへの強制二重化はしない（目録で足りる）  

### 8. GitHubに置くもの
- コード・仕様・テスト・CI・lock・rules  
- dirtyの反映  
- 秘密・DB・webhook実体は載せない  

### 9. Localに残すもの
- 現行実行ツリー  
- Active `portfolio.db`  
- modules/dist/cache  
- 高頻度logs  

### 10. 再生成するもの
- node_modules、dist、pycache、pytest_cache、（多くの）中間scratch  

### 11. PC交換時の認証・設定
- GitHub認証、Discord Secrets/webhookファイル復元、Python/Node path、Cursor、OneDrive、Scheduler  

### 12. Level 3不足
- 構造化Vault未整備（丸ごとコピー≠Vault）  
- depsピン不足  
- dirty未整理  
- 自動起動の「ログオン後遅延」設計未文書化  
- 復旧ドリル未実施  

---

## 6. 推奨しないこと（明確）

1. **今すぐA（全面OneDrive実行）** — プロトコル安定性を落とす。  
2. **丸ごとコピーを第二の本番にする** — ドリフトと誤実行。  
3. **GDriveコラボをPC交換理由だけでOneDriveへ全複製** — 二重SoT化。  
4. **Active SQLiteを同期フォルダで常用** — 最大の技術的危険。  
5. **「ローカル最小」を、ホットパス安全性より優先** — しない。  

---

## 7. 段階ロードマップ（承認後）

```text
Phase 0  今: 実行Local維持。丸ごとコピーは保全扱い。交互実行禁止。
Phase 1  Vault: 再生成不能資産だけを構造化してOneDriveへ（Lean）。検証（件数・hash）。
Phase 2  GitHub: dirty整理・push。depsピン成果物。
Phase 3  Runbook: Level1–3チェックリスト固定。GDrive目録。
Phase 4  （任意）B-lean: 作業ツリーをOneDrive化 + modules除外 + Always-keep + Scheduler切替。
Phase 5  新PC: clone + Vault復元 + rebuild + Scheduler → ドリルでLevel3確認。
```

**Phase 0–3だけで「突然壊れても復旧できる」に大きく近づく。**  
Phase 4は「日常もクラウド作業ツリー」にしたい場合の追加であり、必須ではない。

---

## 8. 一言で答えると

> 最適は「OneDriveへ全部移す」でも「ローカルに全部残す」でもない。  
> **GitHub＝コード、OneDrive＝再生成不能な運用Vault、Google Drive＝コラボ正本、Local＝実行カーネル、Windows＝機械設定** の五層。  
> 今は実行を触らず Vault と Runbook を正常環境から固めるのが、実装・プロトコル・PC交換耐性の交点として最適。

---

## 9. 今回実施しなかったこと

ファイル移動・削除・rename・本番SoT変更・Scheduler変更・Active DB移動・commit/push・クラウド間移動・プロトコル変更 — **すべて未実施**。

実施が必要な変更は、本提案の承認後に別依頼とする。

---

# End
