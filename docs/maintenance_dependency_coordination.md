# Maintenance Dependency Coordination（Phase11-1）

仕様: `docs/specs/lifecycle_maintenance_phase11_1.md`  
親文書: `docs/lifecycle_maintenance.md`  
Dependency Review（Phase11-0）: `docs/dependency_review.md`

---

## 1. Coordination Order

```text
AI
↓
Automation
↓
Policy
↓
Documentation
↓
Operation
```

依存関係の影響を評価し、順序を守って維持作業を調整する。未評価の依存変更は禁止。
