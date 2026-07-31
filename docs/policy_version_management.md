# Policy Version Management（Phase9-2）

仕様: `docs/specs/policy_as_code_research_phase9_2.md`  
親文書: `docs/policy_as_code_research.md`  
Lifecycle: `docs/policy_lifecycle.md`

Policy Version を管理する。Version と Lifecycle は独立概念として扱う。

---

## 1. Version 状態（研究）

```text
Policy Draft
Approved Candidate
Deprecated
Archived
```

---

## 2. 要件

* Version 固定
* 差分追跡
* 履歴保持
* Review 必須

---

## 3. Version と Lifecycle の分離

| 概念 | 役割 |
|---|---|
| Version | 成果物の版・差分・履歴 |
| Lifecycle | 成熟度（Draft → Review → Validated → Candidate → Archived） |

* Lifecycle は Version と独立管理する
* Validated 以降の内容変更は禁止（差分は新 Version）
* 本番 Policy の Version 切替・適用は禁止
