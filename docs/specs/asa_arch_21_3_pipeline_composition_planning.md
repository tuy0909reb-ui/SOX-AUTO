# ASA-ARCH-21.3 — Pipeline Composition  
## Architecture Planning Summary

**Revision:** Draft 0.4  
**Parent:** ASA-ARCH-21.2 — Pipeline Definition（FROZEN）  
**Status:** Planning Candidate  
**Freeze Status:** NOT STARTED

---

# 1. Purpose

ASA-ARCH-21.3 は、Pipeline の **構造的合成（Pipeline Composition）** を定義するための Architecture Planning 層である。

21.2 が単一 PipelineDefinition の構造契約を固定したのに対し、  
21.3 は複数構造の合成・層化・結合・分類に関する上位構造契約を計画する。

Behavioral semantics are intentionally excluded.

---

# 2. Position in Architecture

```
20.8 Runtime Execution
20.9.x Orchestration
21.0 Workflow Core
21.1 Workflow Builder
21.2 Pipeline Definition（Invariants → Public Contract → Expansion → Validation → Failure）
21.3 Pipeline Composition   ← this planning summary
```

21.3 depends on the structural contracts defined in 21.2:

• Pipeline Invariants  
• PipelineDefinition Public Contract  
• Expansion Rules  
• Validation Contract  
• Failure Contract  

---

# 3. Architectural Goal

21.3 SHALL define structural composition contracts only.

Goals:

- Enable structural composition of PipelineDefinitions  
- Preserve Determinism / Read-only / Structural-only principles  
- Maintain clear boundaries with Runtime / Workflow / WorkflowBuilder  
- Extend 21.2 without modifying frozen contracts  

Behavioral semantics are intentionally excluded.

---

# 4. Responsibilities

21.3 owns:

- Structural composition responsibility boundaries  
- Structural layering  
- Structural coupling semantics  
- Composition classification  

21.3 does NOT own:

- Runtime execution  
- Scheduling / Dispatch / Engine assignment  
- WorkflowBuilder graph construction  
- Expansion algorithms / Validation algorithms  
- Failure handling / recovery behavior  

---

# 5. Expected Chapters（Planning Outline）

| Chapter | Title |
|---|---|
| Chapter 1 | Composition Scope |
| Chapter 2 | Composition Model |
| Chapter 3 | Structural Layering |
| Chapter 4 | Composition Structure Contract |
| Chapter 5 | Structural Coupling Contract |
| Chapter 6 | Composition Compatibility |
| Chapter 7 | Composition Classification |

Notes:

- Structural layering is introduced as a first-class planning concern.  
- Chapter 5 addresses structural coupling（not runtime dependency resolution）.  
- Chapter 7 defines Composition classification（not behavioral outcomes）.  

---

# 6. Implementation Scope（Planning）

In scope for future 21.3 implementation（declarative contracts only）:

- Composition contract registries  
- Structural layering contracts  
- Structural coupling contracts  
- Composition classification contracts  

Out of scope:

- Composition engines / algorithms  
- Runtime composition  
- WorkflowBuilder changes  
- Orchestrator / ExecutionGraph changes  
- Validation / Expansion behavioral implementations  
- Failure handling / recovery  

---

# 7. Future Architecture Candidates

Candidate topics beyond the initial 21.3 chapter set:

• Structural Identity  
• Structural Versioning  
• Structural Diff  

---

# 8. Architecture Status

Status: Planning Candidate  

Freeze Status: NOT STARTED  

Implementation Status: NOT STARTED  

---

# 9. Constraints

- Documentation / planning only at this revision  
- No modification of ASA-ARCH-20.8〜21.2 frozen contracts  
- Extension only  
- Structural-only semantics  
- Determinism and Read-only philosophy preserved  

---

**End of ASA-ARCH-21.3 Architecture Planning Summary（Draft 0.4）**
