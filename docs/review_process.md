# Reliability Review Process（Phase7-1）

仕様: `docs/specs/reliability_management_phase7_1.md`  
Reliability: `docs/reliability.md`  
SLO: `docs/slo.md`  
Governance / 承認: `docs/governance.md` / `docs/change_management.md`

信頼性の定期評価手順を定義する。  
レビュー責任者・承認経路は Phase7-0 Governance に従う。自動判断は禁止。

---

## 1. レビュー周期

| 種別 | 周期 | 備考 |
|---|---|---|
| Monthly Review | 毎月 1 回 | 原則必須。未実施は未完了 |
| Ad-hoc Review | 重大 Incident 後など | 必要時。Monthly を置き換えない |

---

## 2. 評価項目（固定）

毎回、以下を確認する（飛ばさない）。

| 項目 | 内容 | 主なソース |
|---|---|---|
| Monthly 期間の SLI 状況 | 取得可能な指標の列挙・欠測の明示 | `reliability.md`、Actions、Daily Report |
| SLO 達成状況 | Target 未設定 / 達成 / 未達 / 評価対象外 | `slo.md` |
| Failure Trend | Failure Count、Workflow / Deploy 失敗傾向 | Maintenance Failure Summary、Actions |
| Incident History | 期間内 Incident、Severity、復旧 | `incident_template.md` 記録 |
| Improvement Item | 新規・継続・完了の改善候補 | 本記録、CHG 参照 |

---

## 3. Trend Analysis（レビュー内）

`docs/reliability.md` §3 に従い、少なくとも次を記述する。

* Failure Count の増減
* Incident Frequency
* Recovery Time の傾向（データがある場合）
* Deploy Failure Trend

分析結果から改善候補を抽出する。AI / 自動判定で確定しない。

---

## 4. 記録方法

レビューごとに記録を残す（場所は任意: Issue / docs 配下コピー / 運用メモ）。最低項目:

```text
Review ID: REL-YYYYMM-NNN
期間:
実施日:
実施者:
承認者:（Phase7-0 に従う）
SLI要約:
SLO状況:（未設定 / 達成 / 未達 / 評価対象外）
Failure Trend:
Incident History:
Improvement Items:
  - ID / 内容 / 優先度 / 関連 CHG（あれば）
次回までのアクション:
```

Improvement Item を実施する場合は、必ず `docs/change_management.md` で起案・承認する。

---

## 5. 承認経路（Phase7-0）

1. Review 記録を作成する
2. 改善を伴う場合は Risk 評価（`risk_management.md`）を付す
3. Change Management で承認を得る（未承認の改善適用禁止）
4. Review 自体の「実施完了」も承認者確認を推奨（未確認は未完了扱い可）

---

## 6. Improvement Cycle との接続

```text
Measure → Analyze（本 Review）→ Improve（CHG）→ Review（次回）
```

詳細: `docs/reliability.md` §4

---

## 7. 未実施・不備時

| 状態 | 扱い |
|---|---|
| Monthly Review 未実施 | 未完了 |
| 必須項目欠落 | 未完了（補正して完了扱いにしない） |
| データ不足 | 該当指標は評価対象外と明記し、Review 自体は実施可能 |
