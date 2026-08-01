/**
 * ASA-ARCH-50.0 — CompletionDependencyBoundaryContract
 */

export interface CompletionDependencyBoundaryContract {
    readonly contractId: "CompletionDependencyBoundaryContract";
    readonly allowedDependencyDirection: "FrozenLayers→CompletionEvaluation";
    readonly dependsOnExtensionBoundary: "ASA-ARCH-45.0";
    readonly dependsOnEvolutionLayer: "ASA-ARCH-46.0";
    readonly dependsOnIntelligenceLayer: "ASA-ARCH-47.0";
    readonly dependsOnTraceabilityLayer: "ASA-ARCH-48.0";
    readonly dependsOnRecommendationLayer: "ASA-ARCH-49.0";
    readonly dependsOnFoundation: "ASA-FOUNDATION-1.0";
    readonly consumesPublishedContractsOnly: true;
    readonly forbidsFrozenArchitectureModification: true;
    readonly forbidsCoreRuntimeDependency: true;
    readonly forbidsOperationalRuntimeDependency: true;
}

export function freezeCompletionDependencyBoundaryContract(): CompletionDependencyBoundaryContract {
    return Object.freeze({
        contractId: "CompletionDependencyBoundaryContract",
        allowedDependencyDirection: "FrozenLayers→CompletionEvaluation",
        dependsOnExtensionBoundary: "ASA-ARCH-45.0",
        dependsOnEvolutionLayer: "ASA-ARCH-46.0",
        dependsOnIntelligenceLayer: "ASA-ARCH-47.0",
        dependsOnTraceabilityLayer: "ASA-ARCH-48.0",
        dependsOnRecommendationLayer: "ASA-ARCH-49.0",
        dependsOnFoundation: "ASA-FOUNDATION-1.0",
        consumesPublishedContractsOnly: true,
        forbidsFrozenArchitectureModification: true,
        forbidsCoreRuntimeDependency: true,
        forbidsOperationalRuntimeDependency: true,
    });
}
