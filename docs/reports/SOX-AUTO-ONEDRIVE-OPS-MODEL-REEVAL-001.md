# SOX-AUTO 運用方式再評価 — OneDrive主保管 vs ローカル実行（A/B/C）

**Record ID:** SOX-AUTO-ONEDRIVE-OPS-MODEL-REEVAL-001  
**Title:** PC交換耐性を目的とした運用方式比較（前提訂正後）  
**Status:** **INVESTIGATION / DESIGN ONLY**（移動・設定変更・Scheduler変更・commit/push 未実施）  
**Date:** 2026-08-11  
**前提訂正:** OneDrive\SOX-AUTO は相談開始直前の**丸ごと保全コピー**。実行SoTは常に `C:\Users\User\SOX-AUTO` のみ。長期二重運用ではない。  

```text
目的 = 将来PC交換を容易にする段階移行の設計判断
≠ 今すぐ切替
≠ 単なるバックアップ賛美
```

---

## 0. 訂正後の前提と実測

| 項目 | 値 |
|---|---|
| 実行SoT | `C:\Users\User\SOX-AUTO`（Scheduler 6タスクもここ） |
| OneDrive保全コピー | `C:\Users\User\OneDrive\SOX-AUTO`（今回作成・ReparsePoint） |
| SOX-AUTO 総量 | **約 146 MB / ~20,278 files** |
| OneDrive クォータ | **20 GB**（共有） |
| 既観測の他消費 | Documents ~249MB、Desktop ~144MB（うち NISA_BACKTEST ~81MB）、画像 ~69MB、SOXコピー ~146MB → 合計おおよそ **0.6 GB 級** |

**容量結論（SOX単体）:** 20GBに対し SOX-AUTO 146MB は余裕。制約は「SOXが大きすぎる」ではなく、**共有20GBの残り・同期ファイル数・実行相性**。

再生成除外後の目安:

| 除外 | 概算削減 |
|---|---|
| `node_modules` | ~49 MB（5144 files） |
| `dist` | ~4.4 MB |
| `scratch` + `_tmp_dump` | ~3.3 MB |
| `__pycache__`（ネスト含む） | ~7 MB |
| **Lean運用ツリー目安** | **約 80–90 MB**（`.git` ~24MB 含む） |

Gitオブジェクト自体は小さい（pack ~数MB級）。重いのは未追跡の `data/common_backtest`・`logs`・生成物。

---

## 1. 「ローカル最小・OneDrive主保管」は妥当か

**結論: 目標としては妥当。ただし「リポジトリ丸ごとを同期しながら全日実行する」は危険。**

実装を見ると、書き込みホットパスは少数に集中している。

| ホットパス | 実装 | OneDrive適性 |
|---|---|---|
| `logs/portfolio/portfolio.db` | SQLite（`DEFAULT_DB_PATH`、相対） | **避ける（実行DB）** |
| `logs/portfolio/**` nightly/backup | 高頻度 append/copy | 慎重（Always-keep必須） |
| `logs/runtime` | 小ログ | 可（Always-keep推奨） |
| `data/asa_minimum_runtime` | JSON/jsonl 低頻度 | **保管・実行ともに可**（Always-keep） |
| `data/common_backtest` | 読多・時々書 | 保管向き。大量同期注意 |
| `node_modules` / `dist` / pycache | 再生成 | **置くな** |
| `src`/`docs`/`tests`/Python・TSソース | 相対パス中心 | **OneDrive主で可** |
| `.git` | 多数小ファイル | **可だが同期競合リスクあり**（運用規律必要） |

したがってユーザー案の骨格:

```text
OneDrive: ソース・仕様・ASA・研究データ・設定・Git
Local:    Active SQLite / node_modules / cache / 再生成物 / 高頻度logs
```

は **技術的に成立する（方式B）**。  
ただし現状コードは DB を `logs/portfolio/portfolio.db` 固定相対参照しており、**「repoはOneDrive、DBだけ完全にrepo外ローカル」にするには** 後で `--db` / 環境変数の**明示運用**か、junction が必要（今は変更しない）。

---

## 2. 項目1–20の評価

凡例: **OK** / **条件付き** / **避ける** / **危険**

| # | 論点 | 判定 | 要点 |
|---|---|---|---|
| 1 | OneDrive上でGit通常運用 | **条件付き** | 可能。`.git`のロック競合・同期中 `index` 破損は実在リスク。同時に他PC/他ツールで触らない。可能なら作業中一時同期停止 |
| 2 | OneDrive上でPython運用 | **条件付き** | ソース実行は可。`__pycache__` 同期除外。import多数は初回ハイドレート遅延 |
| 3 | Node/npm | **避ける（modules）** | ソースは可。`node_modules` を同期対象にすると最悪クラス |
| 4 | CursorでOneDrive開く | **条件付き** | 可。Always-keep推奨。検索/indexがクラウドプレースホルダだと遅い・欠落 |
| 5 | pytest | **条件付き** | 可。cache除外。大量I/Oテストはローカル世代が速い |
| 6 | Git操作 | **条件付き** | commit/checkout中の同期は危険。単一ライター |
| 7 | logs書き込み | **条件付き** | 小ログ可。高頻度はローカル寄り |
| 8 | JSON/CSV更新 | **OK〜条件付き** | ASA JSONは低頻度で適合。巨大CSV連続書は同期負荷 |
| 9 | SQLite実行DB | **危険〜避ける** | Active `portfolio.db` を同期フォルダで回すのは本システムの最大技術リスク |
| 10 | node_modules | **危険** | 除外必須 |
| 11 | pycache/pytest_cache | **避ける** | 除外 |
| 12 | dist | **避ける** | 除外し `npm run build` |
| 13 | ASA SoT | **OK** | 小さい（~0.05MB）。OneDrive主保管に**向く**。Always-keep |
| 14 | portfolio投資データ | **分離** | **DB実行=ローカル寄り** / **バックアップ・エクスポート=OneDrive** |
| 15 | Discord webhook JSON | **OK（秘匿）** | OneDrive可。Git禁止維持。暗号化・権限に注意 |
| 16 | Scheduler→OneDrive脚本 | **条件付き** | パス切替後は可。**起動直後の未同期/未マウントが最大の運用リスク** |
| 17 | Files On-Demand | **危険（自動運用）** | 朝のNDX/Nightlyが「ファイル無し」で落ちる。重要ツリーは Always keep |
| 18 | 同期ロック・競合 | **条件付き** | SQLite/Git/node_modulesで顕在化 |
| 19 | 起動直後自動処理 | **危険** | Schedulerに遅延（ログオン後15–30分）を設計に入れるべき |
| 20 | 20GBで維持 | **OK（SOX単体）** | Lean ~90MB。共有クォータ全体の残りを別途監視 |

---

## 3. 方式A/B/C比較

### A — ほぼ全体をOneDriveで日常開発・実行

| 観点 | 評価 |
|---|---|
| PC交換耐性 | 高（同期できていれば） |
| 現行プロトコル安全性 | **低**（SQLite・Scheduler起動・node_modules・Git競合） |
| 20GB | SOX単体は足りるが、modules同梱146MB×filesが多い |
| 実装変更 | ほぼ不要（切替のみ） |
| **判定** | **非推奨（日常実行の主方式としては危険）** |

「OneDriveをメイン保管にする」こと自体より、**「同期対象上でSQLiteとnode_modulesを回す」ことが危険**。

### B — 大部分OneDrive、相性の悪いものだけローカル

| 観点 | 評価 |
|---|---|
| PC交換耐性 | **最高に近い**（目標フローに一致） |
| 現行プロトコル安全性 | **中〜高**（分離設計を守れば） |
| 20GB | Lean配置で余裕 |
| 実装変更 | **最小〜段階的**（当面は同期除外+Always-keep+切替。DB外出しは任意の次段） |
| **判定** | **推奨第1位** |

### C — ローカル維持、OneDriveはバックアップのみ

| 観点 | 評価 |
|---|---|
| PC交換耐性 | 中（復旧はコピー作業が増える） |
| 現行プロトコル安全性 | **最高**（現状維持） |
| 運用負荷 | バックアップ規律が人依存 |
| **判定** | **当面の安全策としては有効。最終形としては弱い** |

既に保全コピーがあるため、**今すぐAに振る理由はない**。  
目標がPC交換容易化なら **Bへ段階移行**が合理的。Cは「切替前の暫定」。

---

## 4. 推奨順位と推奨構成

### 推奨順位

```text
1位: B（ハイブリッド）
2位: C（暫定・切替まで現行維持）
3位: A（日常実行の全面OneDrive化は非推奨）
```

### 推奨構成（B・実装ベース）

```text
[OneDrive\SOX-AUTO]  ← 将来の主ツリー（カットオーバー後）
  ├─ src, scripts, tools, docs, tests
  ├─ portfolio/, taxable_account/, research/, semiconductor_holdings/
  ├─ data/asa_minimum_runtime/     ★SoT（Always keep）
  ├─ data/common_backtest/         ★検証資産（Always keep、大め）
  ├─ docs, .cursor/rules, specs
  ├─ .git                          （単一ライター規律）
  ├─ logs/portfolio/discord_webhook.json 等の設定
  ├─ logs/portfolio/backups/       ★DBコールドバックアップ
  └─ （同期除外）node_modules, dist, __pycache__, .pytest_cache, scratch, _tmp_dump

[Local-only overlay]
  ├─ node_modules/                 npm ci で再生成
  ├─ dist/                         npm run build
  ├─ __pycache__, .pytest_cache
  └─ Active SQLite の扱い:
       当面: repo内 logs/portfolio/portfolio.db を Always keep + 同期競合に注意
       望ましい次段: ローカル専用パスへ分離（要運用設計。今はコード変更しない）
```

**Webhook JSONは OneDrive 上で可**（プロトコル上必須・小さい）。Gitには載せない。

**ASA Recordsは OneDrive 主保管で問題ない側**（低頻度・小容量・再生成不能 → むしろ置くべき）。

---

## 5. 最終12問への回答

### 1. A/B/C推奨順位
**B → C（暫定） → A（日常実行としては却下）**

### 2. 推奨構成
上記ハイブリッドB。実行SoTを将来 OneDrive ツリーに一本化し、再生成物と（可能なら）Active SQLite をローカル側に分離。

### 3. OneDriveに置くもの
ソース、仕様、tests、ASA SoT、common_backtest、research成果、webhook設定、DB**バックアップ**、`.git`（規律付き）、docs。

### 4. ローカルに残すもの
`node_modules`、`dist`、pycache/pytest_cache、一時ファイル。  
**Active SQLiteはローカル寄りが安全**（当面Always-keep妥協可）。

### 5. GitHubに置くもの
追跡済みコード・docs・ロックファイル。**ASA本番records、portfolio.db、webhook、logsは載せない**（現状どおり）。

### 6. 再生成するもの
node_modules、dist、pycache、（必要なら）一部reportsの再計算。

### 7. PC交換時だけ設定するもの
Python/Node/Git/Cursor install、認証、OneDrive client、**Scheduler再登録**、Always-keep確認。

### 8. 今は変更してはいけないもの
- 実行SoT（`C:\Users\User\SOX-AUTO`）の廃止やScheduler付け替え  
- 現行6タスクの停止  
- Active DBの無計画移動  
- 保全コピーへの「交互実行」

### 9. 今のうちに変更・移行してよいもの（実施は別承認）
- 保全コピーから **node_modules/dist/cacheを同期対象外**にする整理方針  
- ASA/DBバックアップ/webhook の**検証付き保全**（コピーの鮮度確認）  
- dirtyのcommit方針、pip freeze手順の固定  
- Runbook固定  
- ※「実行ルート切替」自体はまだ不要

### 10. PC交換時に残る作業
OneDrive同期確認 → lean依存の再生成 → Scheduler install → asa status / doctor / NDX / webhook resolve。

### 11. 20GBで成立するか
**SOX単体は成立（Lean ~90MB）。**  
注意は共有20GB（Documents/Desktop/NISA/画像と共用）。SOXのために容量不足になる見通しは現状薄い。

### 12. 現行プロトコルへの影響
| 方式 | 影響 |
|---|---|
| 今C維持+保全 | **影響なし**（推奨暫定） |
| Bへカットオーバー | Scheduler再指し・Always-keep・起動遅延設計が必要。手順を踏めば維持可 |
| A全面 | Discord/Portfolio/NDX自動系が不安定化するリスク高 |

---

## 6. 目標復旧フローへの適合

希望フロー:

```text
新PC → OneDrive同期 → SOX-AUTOを開く → ローカル依存再構築 → Scheduler再登録 → 確認
```

| 方式 | 適合 |
|---|---|
| **B** | **最も適合** |
| C | 追加で「ローカルへ巨大復元」が残る |
| A | 同期後すぐ開けるが、運用が壊れやすい |

B達成時のローカル再構築は実質:

```text
npm ci
npm run build
（任意）pip install -r <pinned>
python setup_scheduler.py --install
python setup_ndx_scheduler.py --install
Always keep 確認
asa status / doctor
```

---

## 7. 明確な警告（遠慮なく）

1. **Active `portfolio.db` を OneDrive 同期の「普通の同期ファイル」として書き続けるのは危険。**  
   バックアップとしてOneDriveに置くのは推奨。実行DBとしては最悪クラスの相性。  
2. **`node_modules` を OneDrive に置くのは危険。** 現保全コピーに含まれている点は、容量・ファイル数・同期の無駄。  
3. **Files On-Demand + 朝Scheduler** は、プロトコル停止の典型パターン。Always-keepと起動遅延が必要。  
4. **GitをOneDrive上で「複数場所から同時」は危険。** 単一実行ツリー原則を崩すな。  
5. 逆に **ASA JSON SoT・docs・ソースをローカルに過剰固定する必要はない。** これらはOneDrive主保管向き。

---

## 8. 段階移行（設計のみ・今は実行しない）

```text
Stage 0（今）: 実行=ローカルSoT維持。OneDrive=保全。交互実行禁止。
Stage 1: 保全コピーをLean化方針（modules等除外）。鮮度検証。
Stage 2: Runbook / 依存ピン / Always-keepリスト固定。
Stage 3: カットオーバー（実行SoTをOneDriveツリーへ）+ Scheduler再登録 + 検証。
Stage 4（任意）: Active DBのローカル分離（運用パス設計）。
```

**Stage 0–2は現行運用を壊さずPC交換耐性を上げられる。**  
**Stage 3が「ローカル依存を減らす」本番。**

---

## 9. 今回やらなかったこと

ファイル移動・削除・同期設定変更・Scheduler変更・git commit/push — すべて未実施。

---

# End
