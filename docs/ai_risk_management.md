# AI Risk Management（Phase8-0）

仕様: `docs/specs/ai_operations_governance_phase8_0.md`  
AI Governance: `docs/ai_governance.md`  
Phase7-0 Risk: `docs/risk_management.md`  
Change Management: `docs/change_management.md`

AI 利用に特有のリスク分類と軽減策を定義し、Phase7-0 Risk Management に接続する。  
AI によるリスク最終判定の自動化は行わない。

---

## 1. 対象リスク

| リスク | 内容 | 典型例 |
|---|---|---|
| 誤情報 | 事実と異なる分析・要約 | 存在しない Failure を断定 |
| 古い情報 | 陳腐化した仕様・過去ログに基づく提案 | 廃止済み Workflow 前提の改善案 |
| 過剰自動化 | AI 提案の自動実行・承認省略 | Suggestion → Deploy の直結 |
| 権限逸脱 | AI 利用や提案が権限・Secrets 境界を超える | Secret をプロンプトに含める、権限外変更の推奨 |

---

## 2. Risk 分類（Phase7-0 接続）

AI 利用・AI 由来の変更は `docs/risk_management.md` の Low / Medium / High で評価する。

| 等級 | AI 文脈の目安 | Automation / 変更への影響 |
|---|---|---|
| Low | 文書下書き・参照案内。本番影響なし。Validation 容易 | 記録付きで利用可 |
| Medium | 運用判断材料・改善候補。採否で影響あり | Human Review + Approval 必須 |
| High | 本番変更・Rollback・Secrets / Security に直結し得る提案 | AI 単独では扱わない。人間が再設計。自動実行禁止 |

迷う場合は高い等級とする。

---

## 3. リスク軽減策

| リスク | 軽減策 |
|---|---|
| 誤情報 | Output Validation、Reference Data 必須、断定口調の提案は要裏取り |
| 古い情報 | 参照文書・Actions の日時確認、仕様 Version の明示 |
| 過剰自動化 | Human-in-the-loop 固定、Phase7-3 ゲート、AI→Execution 直結禁止 |
| 権限逸脱 | Secret 非入力、権限外操作の提案は却下、Security Policy 確認 |

---

## 4. Human Review 条件

次のいずれかに該当する場合、Human Review（Validation + 必要なら Approval）必須:

* Medium / High Risk
* Incident / Security / Deploy / Rollback に関する提案
* Change 起案の根拠に AI 出力を含める場合
* Reliability / Security Review への正式反映

Low かつ本番非影響（下書き・整理）でも、本番反映前には Validation を行う。

---

## 5. Phase7-0 との接続

```text
AI 利用 / AI 由来の変更起案
        ↓
AI Risk 分類（本文書）
        ↓
Phase7-0 Risk 評価・受容（risk_management.md）
        ↓
Change Management（必要時）
        ↓
Advanced Automation Approval（実行時）
```

AI Risk 評価不足のまま実行・適用しない。補正して Low 扱いにしない。

---

## 6. 禁止事項

* AI による Risk 等級の正式確定の自動化
* High Risk 提案の自動実行
* Risk 記録なしの AI 由来本番変更
