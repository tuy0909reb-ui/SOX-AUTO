# Adoption Exit Criteria（Phase10-0）

仕様: `docs/specs/production_adoption_governance_phase10_0.md`  
親文書: `docs/production_adoption_governance.md`  
Post-Adoption: `docs/post_adoption_review.md`

採用後に廃止・差し戻し・Rollback を行う条件を定義する。

---

## 1. Exit / Rollback 条件

* KPI 未達
* Incident 増加
* Security Risk 顕在化
* Reliability 低下
* Cost 超過（維持コスト超過）
* Governance 逸脱

---

## 2. 判断

```text
Rollback is controlled by Human Approval.
```

* 品質低下 / Security Issue / Reliability 低下 / Governance 逸脱は Rollback 対象
* AI 単独での廃止・Rollback 判断は禁止
* Rollback Record を Adoption Audit に残す

---

## 3. 接続

* Phase7 Incident / Change / Risk フローと整合する
* 差し戻し後は Phase9 Candidate / Research 再評価へ戻し得る（追跡 ID を維持）
