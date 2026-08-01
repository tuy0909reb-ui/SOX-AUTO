import {
    CompatibilityDeclarationStatus,
    EvolutionLifecycleState,
    createApprovalReference,
    createArchitectureIdentifier,
    createEvolutionIdentifier,
    createIntegrityReference,
    freezeEvolutionBoundary,
    freezeEvolutionCompatibilityDeclaration,
    freezeEvolutionIdentity,
    freezeEvolutionRegistryRecord,
} from "../../src/architecture_evolution_layer";

export function sampleEvolutionIdentity() {
    return freezeEvolutionIdentity({
        evolutionId: createEvolutionIdentifier("EVOL-46-001"),
        architectureId: createArchitectureIdentifier("ASA-ARCH-46.0"),
        title: "Architecture Evolution Layer",
    });
}

export function sampleEvolutionBoundary() {
    return freezeEvolutionBoundary();
}

export function sampleCompatibilityDeclaration() {
    return freezeEvolutionCompatibilityDeclaration({
        targetArchitectureId: createArchitectureIdentifier("ASA-FOUNDATION-1.0"),
        status: CompatibilityDeclarationStatus.REQUIRED,
    });
}

export function sampleRegistryRecord(
    integrity = "integrity-46-001"
) {
    return freezeEvolutionRegistryRecord({
        evolutionId: createEvolutionIdentifier("EVOL-46-001"),
        architectureId: createArchitectureIdentifier("ASA-ARCH-46.0"),
        declarationState: EvolutionLifecycleState.APPROVED,
        approvalReference: createApprovalReference(
            "ASA-AUTH-IMPLEMENT-ARCH-46.0-001"
        ),
        integrityReference: createIntegrityReference(integrity),
    });
}
