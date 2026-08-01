/**
 * ASA-ARCH-47.0 — IntelligenceDependencyBoundaryContract
 */

export interface IntelligenceDependencyBoundaryContract {
    readonly contractId: "IntelligenceDependencyBoundaryContract";
    readonly allowedDependencyDirection: "Frozen→Knowledge→Analysis→Evidence";
    readonly forbidsFoundationModification: true;
    readonly forbidsCoreArchitectureChange: true;
    readonly architectureDoesNotDependOnIntelligence: true;
    readonly dependsOnEvolutionLayer: "ASA-ARCH-46.0";
    readonly dependsOnFoundation: "ASA-FOUNDATION-1.0";
}

export function freezeIntelligenceDependencyBoundaryContract(): IntelligenceDependencyBoundaryContract {
    return Object.freeze({
        contractId: "IntelligenceDependencyBoundaryContract",
        allowedDependencyDirection: "Frozen→Knowledge→Analysis→Evidence",
        forbidsFoundationModification: true,
        forbidsCoreArchitectureChange: true,
        architectureDoesNotDependOnIntelligence: true,
        dependsOnEvolutionLayer: "ASA-ARCH-46.0",
        dependsOnFoundation: "ASA-FOUNDATION-1.0",
    });
}
