# ASA-ARCH-21.3 Verification Mapping — Chapter 1

Architecture traceability: each Composition Principle → representation → test → acceptance section.

| Contract | Spec § | Representation | Test | Acceptance Section |
|---|---|---|---|---|
| CP-1 Declarative Composition | §2 | `CompositionPrinciples` registry | composition_principles | CP-1–CP-10 |
| CP-2 Structural Composition | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-3 Deterministic Composition | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-4 Read-only Composition | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-5 Structural Responsibility | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-6 Structural Consistency | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-7 Encapsulation | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-8 Hierarchical Composition | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-9 NestedPipeline Composition | §2 | registry | composition_principles | CP-1–CP-10 |
| CP-10 Downstream Compatibility | §2 | registry | composition_principles | CP-1–CP-10 |
| Principle Boundary | §3 | `COMPOSITION_PRINCIPLE_BOUNDARY` | composition_principles | Principle Boundary |
| Principle Outcome | §4 | `COMPOSITION_PRINCIPLE_OUTCOME` | composition_principles | Principle Outcome |
| Frozen 20.8〜21.2 preserved | — | architecture_constraints / no reverse deps | architecture_constraints | Backward Compatibility |
