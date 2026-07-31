# ASA-ARCH-39.0 Verification Mapping — ASA-VALIDATION Extension Validation & Assurance Layer

| Contract | Spec § | Implementation | Test | Verification Criteria |
|---|---|---|---|---|
| Core Preservation | §32 | Core 34.0 + forbid flags | Conformance.test | Core non-mutation |
| Governance / Framework Preservation | §32 | preserve flags + Framework 35.1 | Conformance.test | Non-mutation |
| OPS / CONNECT / AI Preservation | §2 / §20 | preserve + no package imports | Validator.test | Sibling independence |
| Authority VALIDATOR | §5–6 | `authority: VALIDATOR` | Validator.test | Non-VALIDATOR rejected |
| Execution Isolation | §6 / §8 | `forbidsExecute` / Output Boundary | Layer.test | No Execution Authority |
| Validation Contract | §10 | operations surface | Layer.test | Technology independent |
| Result / Confidence / Risk | §11–12 / §14 | result + confidence + risk | Layer.test | Assessment only |
| Finding Model | §13 | FindingContract | Layer.test | Severity / status |
| Evidence Integrity | §15 | AssuranceEvidenceContract | Validator.test | No fabrication |
| Input / Observation Boundary | §7 | Input + Observation | Layer.test | Read-only / registry metadata |
| Output / Certification Boundary | §8 / §19 | Output + Certification | Layer.test | No correction / no auth grant |
| Self Validation Restriction | §29 | SelfValidationRestriction | Layer.test | Independent validation |
| AI Output Validation | §30 | AiOutputValidationBoundary | Layer.test | Not AI authority |
| Memory Boundary | §21 | ValidationMemoryBoundary | Layer.test | Not Core state |
| Security Compliance | §22 | forbidden behaviors | Layer.test | No forge / suppress |
| Audit Compatibility | §20 | read-only OPS/CONNECT/AI | Layer.test | Read-only |
| Determinism | §28 | required metadata | Layer.test | Required versions |
| Registration / Discovery / Selection | §24–26 | structural contracts | Validator.test | Not runtime engines |
| Fallback / Lifecycle | §23 / §27 | fallback + lifecycle | Layer.test | Explicit transitions |
| Isolation | — | regression + forbid Core | Conformance.test | Removable |
| Deterministic Establishment | — | same inputs | Conformance.test | Equal JSON |
| Result Reproducibility | — | determinism + establish | Conformance.test | Equal JSON |
