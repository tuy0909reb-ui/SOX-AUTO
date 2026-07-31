# ASA-ARCH-21.2 Verification Mapping — Chapter 3

Architecture traceability: each Expansion Rule → representation → test → VP.

| Rule | Spec § | Representation | Test | VP |
|---|---|---|---|---|
| ER-1 Deterministic Expansion | §2 | `ExpansionRules` registry | expansion_rules | VP-302 |
| ER-2 Single Expansion | §2 | registry | expansion_rules | VP-302 |
| ER-3 Acyclic Expansion | §2 | registry（no cycle detector） | expansion_rules | VP-304 |
| ER-4 Structure Only | §2 | registry + forbidden list | expansion_rules | VP-303 |
| ER-5 Expansion Operation | §3 | registry（no subject/component） | expansion_rules | VP-304 |
| ER-6 WorkflowBuilder Boundary | §3 | registry | expansion_rules | VP-306 |
| ER-7 Sequence Expansion | §4 | registry | expansion_rules | VP-303 |
| ER-8 Parallel Expansion | §4 | registry | expansion_rules | VP-303 |
| ER-9 Branch Expansion | §4 | registry | expansion_rules | VP-303 |
| ER-10 Merge Expansion | §4 | registry | expansion_rules | VP-303 |
| ER-11 NestedPipeline Expansion | §4 | registry | expansion_rules | VP-303 |
| ER-12 StepDefinition Expansion | §5 | registry | expansion_rules | VP-303 |
| ER-13 Structural Composition | §5 | composition map | expansion_rules | VP-303 |
| ER-14 Valid Expansion | §6 | registry | expansion_rules | VP-303 |
| ER-15 Invalid Expansion | §6 | invalid categories（no fail impl） | expansion_rules | VP-304 |
| Frozen Ch1/Ch2 preserved | §8 | architecture_constraints / hash checks | architecture_constraints | VP-306 / VP-307 |
