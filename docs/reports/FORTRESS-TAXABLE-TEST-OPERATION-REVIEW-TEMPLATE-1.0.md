# FORTRESS-TAXABLE-TEST-OPERATION-REVIEW-TEMPLATE-1.0

# 5万円テスト運用 — Review 記録テンプレート

**Document ID:** `FORTRESS-TAXABLE-TEST-OPERATION-REVIEW-TEMPLATE-1.0`  
**Date:** 2026-08-08  
**Classification:** Test Operation Review（検証系・人手記録）  

---

## 位置付け

```text
本記録は Review（検証メモ）である。

NOT:
  - Journal
  - Fact Schema
  - State SoT
  - ASA Completion 対象
  - Protocol / Decision / Sensor / Logic へのフィードバック入力
```

**使い方:** 本ファイルをコピーし、日付またはイベント単位で記入する。  
正式な約定事実は従来どおり Trade Report → Journal。本記録へ Fact を代替保存しない。

**関連方針:** Entry 条件成立通知後に初回購入（月曜強制投入なし）。  
本テストをもって投資戦略の最終判定・Protocol 採用可否判断は行わない。

---

## 1. 基本情報

| 項目 | 記入 |
|---|---|
| 日付 | YYYY-MM-DD |
| 対象銘柄 | （例: 1570 / 282A / 野村世界半導体株投資 / CASH） |
| 投入額 | （例: 50000 JPY） |
| 保有状態 | （例: 未保有 / 保有中・銘柄・概算評価） |

---

## 2. System 状態

| 項目 | 記入 |
|---|---|
| Sensor 状態 | |
| Decision 状態 | |
| Display 内容 | 命令 / 司令判断 / 作戦理由 / 戦力状況（要約で可） |
| 通知日時 | YYYY-MM-DD HH:MM（未通知なら —） |

---

## 3. Human Action

| 項目 | 記入 |
|---|---|
| 実行 / 見送り | 実行（購入・売却） / 見送り |
| 判断日時 | YYYY-MM-DD HH:MM |
| 判断理由 | |

見送りの場合は Trade Fact 節を「なし」とし、State が更新されていないことを確認して記録する。

---

## 4. Trade Fact（参照メモ）

Journal の代替ではない。報告後に要約を転記する。

| 項目 | 記入 |
|---|---|
| 売買日 | YYYY-MM-DD / なし |
| 価格 | / なし |
| 数量 | / なし |
| Trade Report 結果 | ACCEPTED / REJECTED / 未報告 / なし |
| 報告経路 | Discord `/購入報告` `/売却報告` / CLI / なし |

---

## 5. 結果

サイクル終了時または評価時点で記入。途中は空欄可。

| 項目 | 記入 |
|---|---|
| 損益 | （概算可。通貨・基準日を明記） |
| 保有期間 | |
| 最大 DD | （概算可） |
| 売買回数 | （本テスト開始からの累計） |

---

## 6. 振り返り

| 項目 | 記入 |
|---|---|
| Protocol 通りだったか | YES / NO / 一部 — 理由 |
| 人間判断との差分 | （Decision / Display と実際の行動の差） |
| 運用上の問題点 | （通知・判断・売買・報告・State 整合） |
| 改善候補 | （将来メモ。本記録から Logic へ自動反映しない） |

---

## 記入例（空のままコピー用ブロック）

```text
# Review — YYYY-MM-DD — <銘柄>

## 1. 基本情報
日付:
対象銘柄:
投入額: 50000 JPY
保有状態:

## 2. System状態
Sensor:
Decision:
Display:
通知日時:

## 3. Human Action
実行/見送り:
判断日時:
判断理由:

## 4. Trade Fact
売買日:
価格:
数量:
Trade Report結果:
報告経路:

## 5. 結果
損益:
保有期間:
最大DD:
売買回数:

## 6. 振り返り
Protocol通り:
人間判断との差分:
運用上の問題点:
改善候補:
```
