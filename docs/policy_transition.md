# Policy Transition（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`

Policy as Code Research の Exit Criteria と、Phase9-3 / Phase10 への橋渡しを定義する。

---

## 1. Exit Criteria

```text
Research
    ↓
Validated
    ↓
Candidate
    ↓
Future Adoption
```

Future Adoption は Phase10 候補。

---

## 2. Phase9-3 接続

```text
Phase9-2
Policy as Code Research
        ↓
Validated Policy
        ↓
Phase9-3
Autonomous Operations Research
        ↓
Candidate Automation
        ↓
Phase10
Production Adoption
```

---

## 3. 要件

* Human Approval 必須
* Research Audit（Policy 案 / Validation / Test / Review / 採否理由 / Version 履歴）を保持
* 本番 Policy への直接昇格・適用は禁止
