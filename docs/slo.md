# SLO Management（Phase7-1）

仕様: `docs/specs/reliability_management_phase7_1.md`  
SLI / Trend / 改善: `docs/reliability.md`  
Review: `docs/review_process.md`  
Governance: `docs/governance.md` / `docs/change_management.md`

本ドキュメントは SLO の**管理方針**のみを定義する。  
目標数値は本フェーズでは固定しない。自動制御・自動計測基盤は実装しない。

---

## 1. SLO 対象

SLI（`docs/reliability.md`）に対応する管理対象の例:

| SLO 候補 | 対応 SLI | 評価の観点 |
|---|---|---|
| Workflow 成功率 | Workflow Success Rate | CI / 運用 Workflow の安定性 |
| Deploy 成功率 | Deploy Success Rate | デプロイ経路の安定性 |
| 可用性 | Availability | 本番相当経路の継続利用可否 |
| 初動時間 | Incident Response Time | 障害対応の速さ |
| 復旧時間 | Recovery Time | 影響からの回復の速さ |

初期運用では、データが安定して取れる候補から順に対象化する（一度にすべてを必須化しない）。

---

## 2. 目標値設定方法

1. 十分な観測期間の実績を `reliability.md` の測定方法で確認する
2. Governance / Risk（Phase7-0）で影響を評価する
3. Change Management で目標値の採用を承認する
4. 承認後に本表へ「現行 Target」を追記する（未承認の数値は正式 Target としない）

```text
SLO:
  （例）Workflow成功率

Target:
  （未設定）※例示の 99% 等は固定しない。成熟後に承認して記載

Evaluation:
  Monthly
```

| 項目 | 現行方針 |
|---|---|
| Target 値 | **未固定**（承認後に記載） |
| 設定単位 | 月次評価に耐える期間実績を基礎とする |
| 変更 | Target 変更も Change Management 必須 |

---

## 3. 達成状況の確認方法

* 確認周期: **Monthly**（Reliability Review と同時）
* 確認材料: Actions 履歴、Daily Operation Report、Incident 記録、Status Collection
* 確認手順: `docs/review_process.md`
* データ不足の指標は「評価対象外」とし、達成／未達を捏造しない

---

## 4. 未達時の扱い

| 状態 | 対応 |
|---|---|
| Target 未設定 | 未達判定せず、設定優先の Improvement Item とする |
| Target 設定済かつ未達 | 改善対象として記録し、Trend / 原因仮説を Review に残す |
| 連続未達 | Risk 再評価のうえ改善案を Change Management へ起案 |
| データ不足で判定不能 | 評価対象外＋計測改善を Improvement Item にする |

未達を Success 扱いにしない。自動縮退・自動制御は行わない。

---

## 5. Error Budget（概念のみ）

Error Budget は「SLO 未達を許容する余地」の**概念**として認識する。

本フェーズでは:

* 予算の数値化・消化トラッキングの本格運用は行わない
* 未達時のリリース停止などの自動ポリシーは導入しない
* 将来 Phase で計測基盤と合わせて導入可能とする

---

## 6. SLA との関係

* 本ドキュメントは内部信頼性管理（SLO）のみ
* 外部契約としての SLA 管理は対象外
