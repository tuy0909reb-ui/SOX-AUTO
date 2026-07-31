# ASA-ARCH-21.3 Verification Mapping — Chapter 5

Architecture traceability: each Composition Invariant → representation → test → acceptance section.

| Contract | Spec § | Representation | Test | Acceptance Section |
|---|---|---|---|---|
| CI-1 Structural Identity | §2 | `CompositionInvariants` registry | composition_invariants | CI-1–CI-10 |
| CI-2 Structural Determinism | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-3 Hierarchical Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-4 Encapsulation Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-5 Responsibility Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-6 Structural Consistency | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-7 Dependency Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-8 Recursive Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-9 Downstream Integrity | §2 | registry | composition_invariants | CI-1–CI-10 |
| CI-10 Behavioral Exclusion | §2 | registry | composition_invariants | CI-1–CI-10 |
| Invariant Verification | §3 | `COMPOSITION_INVARIANT_VERIFICATION` | composition_invariants | Invariant Verification |
| Invariant Outcome | §4 | `COMPOSITION_INVARIANT_OUTCOME` | composition_invariants | Invariant Outcome |
| Frozen 20.8〜21.3 Ch1–Ch4 preserved | — | architecture_constraints | architecture_constraints | Backward Compatibility |
