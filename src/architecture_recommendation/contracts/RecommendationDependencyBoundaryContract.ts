/**
 * ASA-ARCH-49.0 — RecommendationDependencyBoundaryContract
 */

export interface RecommendationDependencyBoundaryContract {
    readonly contractId: "RecommendationDependencyBoundaryContract";
    readonly allowedDependencyDirection: "Intelligence+Traceability→Recommendation";
    readonly dependsOnIntelligenceLayer: "ASA-ARCH-47.0";
    readonly dependsOnTraceabilityLayer: "ASA-ARCH-48.0";
    readonly dependsOnFoundation: "ASA-FOUNDATION-1.0";
    readonly consumesPublishedContractsOnly: true;
    readonly forbidsRuntimeDependency: true;
    readonly forbidsOperationalExecutionDependency: true;
    readonly forbidsExternalIntegrationRuntimeDependency: true;
    readonly forbidsAutomaticModificationPipelineDependency: true;
}

export function freezeRecommendationDependencyBoundaryContract(): RecommendationDependencyBoundaryContract {
    return Object.freeze({
        contractId: "RecommendationDependencyBoundaryContract",
        allowedDependencyDirection: "Intelligence+Traceability→Recommendation",
        dependsOnIntelligenceLayer: "ASA-ARCH-47.0",
        dependsOnTraceabilityLayer: "ASA-ARCH-48.0",
        dependsOnFoundation: "ASA-FOUNDATION-1.0",
        consumesPublishedContractsOnly: true,
        forbidsRuntimeDependency: true,
        forbidsOperationalExecutionDependency: true,
        forbidsExternalIntegrationRuntimeDependency: true,
        forbidsAutomaticModificationPipelineDependency: true,
    });
}
