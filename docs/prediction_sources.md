# Prediction Sources（Phase9-4）

仕様: `docs/specs/predictive_aiops_research_phase9_4.md`  
親文書: `docs/predictive_aiops_research.md`

予測入力ソースの利用可否を定義する。Phase8-2 Knowledge Operations と整合する。

---

## 1. 利用可能

* Metrics
* Logs
* Incident History
* Reliability Report
* Knowledge Repository
* Policy Information

---

## 2. 利用禁止

* Secret
* Credential
* Production Write
* 未検証 Knowledge

---

## 3. 接続

* Phase8-2: Official / Validated Knowledge のみ確定根拠可。Draft 不可
* Phase9-2: Policy Information は参照のみ（Policy 更新禁止）
