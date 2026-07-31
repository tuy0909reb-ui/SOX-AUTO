# Maintenance Scheduling Policy（Phase11-1）

仕様: `docs/specs/lifecycle_maintenance_phase11_1.md`  
親文書: `docs/lifecycle_maintenance.md`

---

## 1. Policy

```text
Routine
Emergency
Deferred
Restricted
```

| Policy | 意味 |
|---|---|
| Routine | 計画どおり実施 |
| Emergency | 緊急 Window で実施（承認必須） |
| Deferred | 延期（理由・期限を記録） |
| Restricted | 制約 Window / Freeze 等により制限 |

Scheduling Policy は Decision Gate（POSTPONE 等）と整合する。
