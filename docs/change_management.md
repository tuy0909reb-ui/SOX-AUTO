# Change Management（Phase7-0）

仕様: `docs/specs/operational_governance_phase7_0.md`  
Governance: `docs/governance.md`  
リスク評価: `docs/risk_management.md`

運用に関わる変更を安全に管理する。未承認変更は許可しない。  
変更の自動適用・変更管理の自動化は行わない。

---

## 1. 変更対象

| 対象 | 例 | 備考 |
|---|---|---|
| 運用ルール | `operations.md` / `governance.md` / Runbook | 文書変更も本フロー対象 |
| Workflow | maintenance / operations 等の運用 Automation | 既存 Test/Release/Deploy の責務変更は原則禁止領域（要 High リスク＋上位判断） |
| Monitoring / Observability 設定文書 | `observability.md` の条件・項目 | 収集基盤導入は対象外（別 Phase） |
| Automation 設定 | schedule・収集範囲の文書／運用 WF | 自動復旧追加は禁止 |
| 通知ルール | 通知経路の文書定義 | Secrets 直書き禁止 |

対象外（本フローで「実装決定」しない）:

* `tools/secretary/` の機能変更
* 技術実装方式・アーキテクチャ変更の決定
* Infrastructure / Database / Secrets / Security 設定の変更作業そのもの

---

## 2. 標準フロー（必須）

```text
変更起案
    ↓
影響確認
    ↓
承認
    ↓
適用
    ↓
結果確認
```

### 2-1 変更起案

記録項目（最低）:

* 変更 ID（例: `CHG-YYYYMMDD-NNN`）
* 起案者 / 日時
* 変更内容（何をどう変えるか）
* 目的
* 影響範囲（Workflow / 環境 / 文書）
* リスク評価結果（`risk_management.md`）
* ロールバック方針（文書差し戻し / 設定復帰など。自動 Rollback ではない）

### 2-2 影響確認

固定チェック:

* [ ] Phase5 品質フローへの影響
* [ ] Phase6 Deploy / Secrets / Monitor / Incident への影響
* [ ] Automation が人間判断を侵食しないこと
* [ ] Secrets 露出リスクなし
* [ ] `tools/secretary/` 変更を含まないこと

### 2-3 承認

* 承認工程は必須（未承認は適用禁止）
* 実装担当と承認担当は分離可能（同一人物の単独承認を避ける運用を推奨）
* リスク等級に応じた承認（`risk_management.md` の受容基準）

| リスク | 承認 |
|---|---|
| Low | 通常承認で適用可能 |
| Medium | 追加確認後に適用判断 |
| High | 適用延期または上位判断 |

### 2-4 適用

* 承認済み内容のみ適用する
* 適用時に範囲を広げない（スコープクリープ禁止）

### 2-5 結果確認

* 意図どおりか確認する
* 失敗時は計画した復帰手順を実施し、結果を記録する
* 成功に見せかける補正は禁止

---

## 3. 緊急変更

適用条件（すべて満たす場合のみ）:

* production またはサービス継続に関わる急迫の障害
* 通常承認を待つと被害が拡大する
* 変更範囲が最小である

緊急フロー:

```text
緊急起案（変更ID・理由・最小差分）
    ↓
可能な範囲での口頭/即時承認（事後必ず文書化）
    ↓
最小適用
    ↓
結果確認
    ↓
事後に標準フロー記録を完成（未完成は未完了）
```

禁止:

* 緊急を理由とした `tools/secretary/` の無審査変更
* 緊急を理由とした自動復旧・自動 Rollback の常設化
* 事後記録の省略

---

## 4. 未承認変更の扱い

* 発見次第差し戻し（未承認扱い）
* 適用済みなら影響確認のうえ復帰を検討し、Incident / Change 記録に残す
* 「動いているからよい」での追認のみは禁止（リスク再評価必須）
