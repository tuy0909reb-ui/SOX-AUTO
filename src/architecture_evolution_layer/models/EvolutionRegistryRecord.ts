/**
 * ASA-ARCH-46.0 — EvolutionRegistryRecord
 */

import type {
    ApprovalReference,
    ArchitectureIdentifier,
    EvolutionIdentifier,
    EvolutionLifecycleState,
    IntegrityReference,
} from "../types";

export interface EvolutionRegistryRecord {
    readonly kind: "EvolutionRegistryRecord";
    readonly evolutionId: EvolutionIdentifier;
    readonly architectureId: ArchitectureIdentifier;
    readonly declarationState: EvolutionLifecycleState;
    readonly dependsOnExtensionBoundary: "ASA-ARCH-45.0";
    readonly dependsOnFoundation: "ASA-FOUNDATION-1.0";
    readonly approvalReference: ApprovalReference;
    readonly integrityReference: IntegrityReference;
    readonly immutable: true;
    readonly storesReferenceOnly: true;
    readonly doesNotActivate: true;
    readonly doesNotOwnAuthority: true;
}

export function freezeEvolutionRegistryRecord(input: {
    evolutionId: EvolutionIdentifier;
    architectureId: ArchitectureIdentifier;
    declarationState: EvolutionLifecycleState;
    approvalReference: ApprovalReference;
    integrityReference: IntegrityReference;
}): EvolutionRegistryRecord {
    return Object.freeze({
        kind: "EvolutionRegistryRecord",
        evolutionId: input.evolutionId,
        architectureId: input.architectureId,
        declarationState: input.declarationState,
        dependsOnExtensionBoundary: "ASA-ARCH-45.0",
        dependsOnFoundation: "ASA-FOUNDATION-1.0",
        approvalReference: input.approvalReference,
        integrityReference: input.integrityReference,
        immutable: true,
        storesReferenceOnly: true,
        doesNotActivate: true,
        doesNotOwnAuthority: true,
    });
}
