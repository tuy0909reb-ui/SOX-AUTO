/**
 * ASA-ARCH-43.0 test fixtures
 */

import { ArchitectureValidationBuilder } from "../../src/architecture_validation/ArchitectureValidationBuilder";
import { hashArtifact } from "../../src/architecture_validation/HashIntegrity";
import { createFrozenContractSnapshot } from "../../src/architecture_validation/ContractValidator";
import type { ArchitectureSnapshotView } from "../../src/architecture_validation/DriftDetector";
import { freezeValidationRuleSet } from "../../src/architecture_validation/ValidationRules";

export function baseValidationBuilder(): ArchitectureValidationBuilder {
    return new ArchitectureValidationBuilder()
        .withLayerId("val-test")
        .withCreationTimestamp("2026-07-30T00:00:00Z")
        .withProducerIdentity("asa-test");
}

export function sampleFrozenContract() {
    return createFrozenContractSnapshot({
        contractId: "ext.contract.A",
        payload: { version: "1.0.0", authority: "OBSERVER" },
    });
}

export function sampleRegisteredOk() {
    const frozen = sampleFrozenContract();
    return {
        snapshotId: "reg-ok",
        contracts: Object.freeze({
            [frozen.contractId]: frozen.payload,
        }) as Readonly<Record<string, unknown>>,
        hash: hashArtifact({ [frozen.contractId]: frozen.payload }),
    };
}

export function sampleRegisteredModified() {
    return {
        snapshotId: "reg-mod",
        contracts: Object.freeze({
            "ext.contract.A": { version: "9.9.9", mutated: true },
        }) as Readonly<Record<string, unknown>>,
        hash: hashArtifact({
            "ext.contract.A": { version: "9.9.9", mutated: true },
        }),
    };
}

export function sampleHistoricalSnapshot(): ArchitectureSnapshotView {
    return Object.freeze({
        snapshotId: "hist-001",
        contracts: Object.freeze({ A: { v: "1" } }),
        boundaries: Object.freeze({ coreWrite: false }),
        implementationMetadata: Object.freeze({
            artifact: "pkg",
            version: "1.0.0",
            hash: "abc",
        }),
        records: Object.freeze({ r1: { status: "FROZEN" } }),
        evidence: Object.freeze({ e1: { hash: "ehash" } }),
    });
}

export function sampleDriftedSnapshot(): ArchitectureSnapshotView {
    return Object.freeze({
        snapshotId: "curr-001",
        contracts: Object.freeze({ A: { v: "2" } }),
        boundaries: Object.freeze({ coreWrite: false }),
        implementationMetadata: Object.freeze({
            artifact: "pkg",
            version: "1.0.1",
            hash: "def",
        }),
        records: Object.freeze({ r1: { status: "FROZEN" } }),
        evidence: Object.freeze({ e1: { hash: "ehash" } }),
    });
}

export function approvedRuleSetHash(): string {
    return freezeValidationRuleSet().hash;
}
