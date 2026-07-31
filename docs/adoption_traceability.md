# Adoption Traceability（Phase10-0）

仕様: `docs/specs/production_adoption_governance_phase10_0.md`  
親文書: `docs/production_adoption_governance.md`  
Audit: `docs/adoption_audit.md`

Research → Production の追跡モデルを定義する。

---

## 1. Trace Model

```text
Research ID
    ↓
Validation ID
    ↓
Candidate ID
    ↓
Adoption ID
    ↓
Production Record
```

---

## 2. 要件

* 全 ID を Research Audit と関連付ける
* Phase7〜Phase10 全体で追跡可能とする
* Adoption Audit と Production Record を対応付ける

---

## 3. Phase 接続

| 区間 | 内容 |
|---|---|
| Phase9 | Research / Validation / Candidate |
| Phase10-0 | Adoption Review / Adoption ID / Production Record |
| Phase7 | Change / Risk / Rollback 記録との相互参照 |
