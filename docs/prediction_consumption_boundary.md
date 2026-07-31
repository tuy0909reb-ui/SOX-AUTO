# Prediction Consumption Boundary（Phase9-4）

仕様: `docs/specs/predictive_aiops_research_phase9_4.md`  
親文書: `docs/predictive_aiops_research.md`

予測結果の利用境界を明確化する。

---

## 1. Consumption Flow

```text
Prediction
    ↓
Human Review
    ↓
Decision Support
    ↓
Automation Candidate（研究）
```

---

## 2. 原則

* Prediction だけでは実行されない
* Automation Candidate は研究専用
* Production 適用は Phase10 で判断

---

## 3. Interface

### Policy Interface（Phase9-2）

```text
Validated Policy
        ↓
Policy Evaluation
        ↓
Predictive Research
```

* Policy 更新は行わない / Policy は参照のみ / Policy 評価は研究専用

### Autonomous Interface（Phase9-3）

```text
Prediction
    ↓
Human Review
    ↓
Autonomous Candidate（研究）
```

* Prediction は自律運用を直接起動しない
* Autonomous Candidate は研究専用
