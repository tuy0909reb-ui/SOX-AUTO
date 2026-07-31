/**
 * ASA-ARCH-42.0 test fixtures
 */

import { ArchitectureEvolutionBuilder } from "../../src/architecture_evolution/ArchitectureEvolutionBuilder";
import { createContractSnapshot } from "../../src/architecture_evolution/ContractSnapshot";
import type { DependencyGraph } from "../../src/architecture_evolution/ImpactAnalyzer";

export function baseEvolutionBuilder(): ArchitectureEvolutionBuilder {
    return new ArchitectureEvolutionBuilder()
        .withLayerId("evo-test")
        .withCreationTimestamp("2026-07-30T00:00:00Z")
        .withProducerIdentity("asa-test");
}

export function sampleCurrentSnapshot() {
    return createContractSnapshot({
        snapshotId: "snap-current-001",
        kind: "CURRENT_CONTRACT",
        version: "1.0.0",
        architecture_version: "ASA-ARCH-42.0",
        timestamp: "2026-07-30T00:00:00Z",
        payload: {
            "ext.contract.A": { version: "1.0.0" },
            "ext.contract.B": { version: "1.0.0" },
        },
    });
}

export function sampleProposedCompatibleSnapshot() {
    return createContractSnapshot({
        snapshotId: "snap-proposed-001",
        kind: "PROPOSED_CONTRACT",
        version: "1.1.0",
        architecture_version: "ASA-ARCH-42.0",
        timestamp: "2026-07-30T01:00:00Z",
        payload: {
            "ext.contract.A": { version: "1.0.0" },
            "ext.contract.B": { version: "1.1.0" },
            "ext.contract.C": { version: "1.0.0" },
        },
    });
}

export function sampleProposedCoreBreakSnapshot() {
    return createContractSnapshot({
        snapshotId: "snap-proposed-core",
        kind: "PROPOSED_CONTRACT",
        version: "2.0.0",
        architecture_version: "ASA-ARCH-42.0",
        timestamp: "2026-07-30T01:00:00Z",
        payload: {
            "ext.contract.A": { version: "1.0.0" },
            ASA_CORE: { version: "mutated" },
            core_contract: { mutated: true },
        },
    });
}

export function sampleProposedBreakingExtensionSnapshot() {
    return createContractSnapshot({
        snapshotId: "snap-proposed-break",
        kind: "PROPOSED_CONTRACT",
        version: "2.0.0",
        architecture_version: "ASA-ARCH-42.0",
        timestamp: "2026-07-30T01:00:00Z",
        payload: {
            "ext.contract.A": { version: "2.0.0", breaking: true },
            // B removed — breaking
        },
    });
}

export function sampleDependencyGraph(): DependencyGraph {
    return Object.freeze({
        nodes: Object.freeze([
            "ext.contract.A",
            "ext.contract.B",
            "ASA-SCENARIO",
            "ASA-COORDINATION",
        ]),
        edges: Object.freeze([
            Object.freeze({ from: "ASA-COORDINATION", to: "ext.contract.A" }),
            Object.freeze({ from: "ext.contract.A", to: "ext.contract.B" }),
            Object.freeze({ from: "ext.contract.B", to: "ASA-SCENARIO" }),
        ]),
    });
}
