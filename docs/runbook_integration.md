# Runbook Integration（Phase8-2）

仕様: `docs/specs/knowledge_operations_phase8_2.md`  
Knowledge Management: `docs/knowledge_management.md`  
Incident Response: `docs/incident_response.md`（Phase6-3-A）  
Trust Level: `docs/knowledge_trust_level.md`

Incident 対応時に関連 Runbook を検索・参照する流れを定義する。  
AI による Runbook 正式変更は禁止する。

---

## 1. フロー（固定）

```text
Incident
   ↓
Knowledge Search
   ↓
Related Runbook
   ↓
Human Review
   ↓
Action
```

| 段階 | 内容 |
|---|---|
| Incident | 検知・初動（`incident_response.md`） |
| Knowledge Search | 関連手順・過去 INC / Review を検索 |
| Related Runbook | **最新 Approved（Official）を優先** |
| Human Review | 適用可否・差分・環境適合を人間が判断 |
| Action | 承認済み手順の実行 / CHG / Deploy 等 |

---

## 2. 優先順位

1. Official / 最新 Approved Runbook
2. Validated の関連記録
3. Historical（過去手順）— **参考のみ**
4. Draft — 使用不可

過去手順を現行手順として確定しない。

---

## 3. AI 利用時

* Search / 候補提示は Phase8-1 Decision Support に従う
* 参照 Runbook の Trust Level / Version を AIA- に記録
* AI が Runbook 文言を「更新案」として出してもよいが、正式反映は Human + CHG（`knowledge_versioning.md`）

---

## 4. 禁止事項

* AI による Runbook 正式変更
* Historical / Draft のみでの Action 確定
* Human Review 省略
* Secrets を Runbook Knowledge に埋め込むこと
