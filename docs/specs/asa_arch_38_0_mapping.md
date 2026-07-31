# ASA-ARCH-38.0 Verification Mapping — ASA-AI Extension Intelligence Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §19 | Core 34.0 + forbid flags | Conformance.test | Core non-mutation |
| Governance / Framework Preservation | §19 | preserve flags + Framework 35.1 | Conformance.test | Non-mutation |
| OPS / CONNECT Preservation | §2 | preserve + no package imports | Validator.test | Sibling independence |
| Authority ADVISOR | §5 | `authority: ADVISOR` | Validator.test | Non-ADVISOR rejected |
| Execution Isolation | §5 | `forbidsExecute` / Runtime Boundary | Layer.test | No Execution Authority |
| Intelligence Contract | §25 | operations surface | Layer.test | Technology independent |
| Proposal Boundary | §10 | `AiProposalContract` | Validator.test | Proposal ≠ Execution |
| Evidence / Confidence / Uncertainty | §11–14 | related contracts | Fixtures / establish | Required fields |
| Memory Isolation / Ownership | §15 | `AiMemoryContract` | Validator.test | Never Core State |
| Learning Isolation | §16 | `AiLearningBoundary` | Layer.test | No frozen mutation |
| Security Compliance | §18 | threat kinds + forbid flags | Layer.test | No authority creation |
| Audit / Traceability | §28–29 | audit + trace contracts | Layer.test | Required stages |
| Determinism | §30 | metadata requirements | Layer.test | Required metadata |
| Registration / Discovery / Selection | §23–26 | structural contracts | Validator.test | Not runtime engines |
| Fallback / Lifecycle | §22 / §27 | fallback + lifecycle | Layer.test | Explicit transitions |
| Isolation | — | regression + forbid Core | Conformance.test | AI removable |
| Deterministic Establishment | — | same inputs | Conformance.test | Equal JSON |
