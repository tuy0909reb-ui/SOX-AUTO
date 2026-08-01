/**
 * ASA-ARCH-46.0 — EvolutionDependencyBoundaryContract
 * Allowed: Future → Ch46 → Ch45 → Foundation
 * Forbidden: Foundation → Ch46
 */

export interface EvolutionDependencyBoundaryContract {
    readonly contractId: "EvolutionDependencyBoundaryContract";
    readonly allowedDependencyDirection: "Future→Ch46→Ch45→Foundation";
    readonly forbidsFoundationDependingOnEvolution: true;
    readonly forbidsReverseDependencyIntoFoundation: true;
    readonly requiresExtensionBoundaryProvider: "ASA-ARCH-45.0";
    readonly requiresFoundationReference: "ASA-FOUNDATION-1.0";
    readonly preservesDependencyDirection: true;
}

export function freezeEvolutionDependencyBoundaryContract(): EvolutionDependencyBoundaryContract {
    return Object.freeze({
        contractId: "EvolutionDependencyBoundaryContract",
        allowedDependencyDirection: "Future→Ch46→Ch45→Foundation",
        forbidsFoundationDependingOnEvolution: true,
        forbidsReverseDependencyIntoFoundation: true,
        requiresExtensionBoundaryProvider: "ASA-ARCH-45.0",
        requiresFoundationReference: "ASA-FOUNDATION-1.0",
        preservesDependencyDirection: true,
    });
}
