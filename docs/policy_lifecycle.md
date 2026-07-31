# Policy Lifecycle（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`  
Version: `docs/policy_version_management.md`

Policy の成熟度を管理する。Version とは独立に扱う。

---

## 1. Lifecycle

```text
Draft
    ↓
Review
    ↓
Validated
    ↓
Candidate
    ↓
Archived
```

---

## 2. 要件

* Lifecycle は Version と独立管理
* Review は Human 必須
* Validated 以降は変更禁止（差分は新 Version）

---

## 3. 本番との境界

* Lifecycle 進行は研究対象の成熟度管理である
* Candidate / Future Adoption への昇格は Transition 文書に従う
* Production Policy への Lifecycle 適用は禁止
