/**
 * ASA-ARCH-46.0 — EvolutionAuthorityBoundaryContract
 * Evolution capability ≠ authority ownership.
 */

export interface EvolutionAuthorityBoundaryContract {
    readonly contractId: "EvolutionAuthorityBoundaryContract";
    readonly authorityAcquisitionCapability: false;
    readonly authorityOverrideCapability: false;
    readonly authorityDelegationCapability: false;
    readonly forbidsAuthorityOwnership: true;
    readonly forbidsAuthorityMigrationFromFoundation: true;
    readonly forbidsIndependentArchitecturalAuthority: true;
    readonly capabilityDoesNotEqualAuthorityOwnership: true;
    readonly designAuthority: "HUMAN_ARCHITECT";
    readonly finalAuthority: "HUMAN_ARCHITECT";
    readonly evolutionAuthority: "NONE";
    readonly runtimeAuthority: "NONE";
    readonly decisionAuthority: "NONE";
}

export function freezeEvolutionAuthorityBoundaryContract(): EvolutionAuthorityBoundaryContract {
    return Object.freeze({
        contractId: "EvolutionAuthorityBoundaryContract",
        authorityAcquisitionCapability: false,
        authorityOverrideCapability: false,
        authorityDelegationCapability: false,
        forbidsAuthorityOwnership: true,
        forbidsAuthorityMigrationFromFoundation: true,
        forbidsIndependentArchitecturalAuthority: true,
        capabilityDoesNotEqualAuthorityOwnership: true,
        designAuthority: "HUMAN_ARCHITECT",
        finalAuthority: "HUMAN_ARCHITECT",
        evolutionAuthority: "NONE",
        runtimeAuthority: "NONE",
        decisionAuthority: "NONE",
    });
}
