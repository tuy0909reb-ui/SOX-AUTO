# AI Recommendation Policy（Phase8-1）

仕様: `docs/specs/ai_decision_support_phase8_1.md`  
Decision Support: `docs/ai_decision_support.md`  
Validation: `docs/ai_validation.md`  
AI Governance: `docs/ai_governance.md`

AI による**候補提示**の方針のみを定義する。確定判断・自動実行は禁止する。

---

## 1. 候補提示の対象

| 種別 | 例 | 備考 |
|---|---|---|
| 障害対応候補 | 初動の確認項目追加、Rollback 検討の是非の「論点」 | Rollback 要否の確定は人間（Incident Response） |
| 改善候補 | Reliability / Security Improvement Item | CHG へ進む場合は Change Management |
| 変更影響候補 | Workflow / 文書変更時の影響チェックリスト | 影響の最終評価は人間 |
| Security 確認項目 | Secrets / Dependency Review の確認漏れ候補 | Security 判断の確定は人間 |

---

## 2. Recommendation Generation 要件

* **複数候補**の提示を可能とする（単一断定を避ける）
* 各候補に**推奨理由**を記録する（なぜ候補か）
* **推奨内容**と**根拠情報（Evidence）**を分離して記録する
* 「採用すべき」等の確定判断表現は使わず、「候補」「要検証」と明示する

記録例（要約）:

```text
Candidate ID: C1 / C2 / …
Description:
Rationale:
Evidence refs:（ID / URL / 文書）
Confidence:（任意・補助）
```

---

## 3. Recommendation Confidence Handling

| 扱い | 内容 |
|---|---|
| Confidence の位置づけ | 参考・補助情報のみ。判断根拠にしない |
| High Confidence | Human Review を**省略しない** |
| Low Confidence | **追加確認必須**（Evidence の再取得、別ソース突合、専門家確認等） |
| Confidence なし | 問題なし。Validation + Human Review で進める |

禁止:

* Confidence のみでの採用判断
* Confidence を理由とした自動実行
* High Confidence を「承認済み」とみなすこと

---

## 4. Human Review への引き渡し

候補セットを Human Review に渡す際、最低限含める:

* 候補一覧（複数可）
* 各候補の理由
* Evidence 参照（または「未検証」明示）
* Confidence（あれば）と Low 時の追加確認状況
* AIA- ID

Validation（`ai_validation.md`）未完了の候補は Approve 対象にしない。

---

## 5. 禁止事項

* 単一候補の断定採用強制
* Evidence なし推奨の正式採用
* AI による最終判断・本番操作
* Confidence による Approval 代替
