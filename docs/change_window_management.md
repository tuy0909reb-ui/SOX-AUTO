# Change Window Management（Phase10-1）

仕様: `docs/specs/controlled_production_adoption_phase10_1.md`  
親文書: `docs/controlled_production_adoption.md`  
Change Management: `docs/change_management.md`（Phase7-0）

本番導入は Change Window に従う。

---

## 1. Window Types

```text
Normal Window
Emergency Window
Maintenance Window
Freeze Period
```

---

## 2. Change 制御ルール

* Freeze Period 中は導入禁止
* Emergency Window は Human Approval 必須
* Maintenance Window は Rollback 手順を事前確認
* Normal Window でも Deployment Approval は必須

---

## 3. Human Approval 条件

| Window | 条件 |
|---|---|
| Normal | Deployment Planning + Pre-Deployment Review + Approval |
| Emergency | 緊急 Change フロー + Human Approval + Rollback Ready |
| Maintenance | Rollback 手順確認 + Monitoring Ready |
| Freeze | 導入禁止（例外なしを原則） |

Phase7 Change / Risk フローと整合する。
