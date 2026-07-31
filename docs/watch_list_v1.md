# Watch List v1.0

---

## 1. 目的・禁止事項

### 目的

市場・指数・商品・資産を **継続観察するために整理・管理する**。

### 禁止事項（目的に含めない）

* 売買判断
* プロトコル実行
* シグナル生成
* CLI機能
* DB管理
* 自動売買
* 保有の台帳管理

### Position の責務

* Watch List は **観察対象一覧** である。
* 保有情報の SoT は **既存の Portfolio / Position** 側である。
* Watch List の `position` は保有を管理するものではなく、**保有資産を観察対象として一覧化しているだけ**である。
* 保有情報が Watch List と Portfolio / Position で異なる場合は、**Portfolio / Position を正**とする。

### Research の扱い

* Research 中のテーマは `research/` のみで管理する。
* Watch List へ登録するのは、Research 完了後に **継続ウォッチ** と判断された対象のみとする。
* Research 中の対象は Watch List に登録しない。

---

## 2. 役割の定義（role）

| role | 意味 |
|---|---|
| `protocol_input` | 現行プロトコルが参照する市場 |
| `position` | 保有資産を観察対象として一覧化（SoT は Portfolio / Position） |
| `watch` | 売買せず継続観察 |

---

## 3. status の定義と適用範囲

定義されている状態:

```text
researching
evaluated
watching
parked
dropped
```

### 適用ルール

* `status` は **Research / Watch の状態のみ**を表す。
* Watch List 上で `status` を持つのは **`watch` 行のみ**。
* `protocol_input` と `position` には `status` を適用しない（列は `-`）。
* Research 中（`researching`）および評価完了直後で未登録の状態は、Watch List 行としては持たない（実体は `research/` 側）。
* Watch List に載る `watch` 行の `status` は、実務上 `watching` / `parked` / `dropped` を用いる。
* プロトコル採用（組込）は Watch List のステータスにしない。

---

## 4. 一覧表

| id | name | role | status | theme | vehicle | research | notes | reviewed |
|---|---|---|---|---|---|---|---|---|
| nasdaq100 | NASDAQ100 | protocol_input | - | mega_tech | index | - | | |
| soxx | SOXX | protocol_input | - | semiconductor_us | etf | - | | |
| fngs_tsumitate | つみたてFANG+ | position | - | mega_tech | fund | - | | |
| mega_growth | 成長投資メガ | position | - | mega_tech | fund | - | | |
| nikkei_semi | 日経半導体 | watch | watching | semiconductor_jp | etf(200A) | [research/nikkei_semiconductor_report.md](../research/nikkei_semiconductor_report.md) | | |
| btc | Bitcoin | watch | watching | crypto | spot/other | [research/bitcoin_report.md](../research/bitcoin_report.md) | | |

---

## 5. 頻度ガイド（確認の目安・非ルール）

| 頻度 | 見るもの |
|---|---|
| 毎日 | `protocol_input` と必要なら `position` の概況 |
| 毎週 | 全 `watching` の「変だったか」だけ |
| 毎月 | Researchリンクの再読 or reviewed 更新 |

---

## 6. Research 索引

| id | Research |
|---|---|
| nikkei_semi | [research/nikkei_semiconductor_report.md](../research/nikkei_semiconductor_report.md) |
| btc | [research/bitcoin_report.md](../research/bitcoin_report.md) |

Research 成果の本文はここにコピーしない。リンク参照のみ。

---

## 7. 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-18 | Watch List v1.0 作成（初版） |
| 2026-07-18 | Implementation Audit：Design Review 未記載の補完（notes / reviewed 記入、Research 索引の判定列等）を削除 |
