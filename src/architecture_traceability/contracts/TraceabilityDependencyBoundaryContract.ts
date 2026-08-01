/**
 * ASA-ARCH-48.0 — TraceabilityDependencyBoundaryContract
 */

export interface TraceabilityDependencyBoundaryContract {
    readonly contractId: "TraceabilityDependencyBoundaryContract";
    readonly allowedDependencyDirection: "Frozen→EvidenceRefs→Trace→Visibility";
    readonly forbidsRuntimeDependency: true;
    readonly forbidsFoundationModification: true;
    readonly dependsOnIntelligenceLayer: "ASA-ARCH-47.0";
    readonly dependsOnFoundation: "ASA-FOUNDATION-1.0";
    readonly architectureDoesNotDependOnTraceability: true;
}

export function freezeTraceabilityDependencyBoundaryContract(): TraceabilityDependencyBoundaryContract {
    return Object.freeze({
        contractId: "TraceabilityDependencyBoundaryContract",
        allowedDependencyDirection: "Frozen→EvidenceRefs→Trace→Visibility",
        forbidsRuntimeDependency: true,
        forbidsFoundationModification: true,
        dependsOnIntelligenceLayer: "ASA-ARCH-47.0",
        dependsOnFoundation: "ASA-FOUNDATION-1.0",
        architectureDoesNotDependOnTraceability: true,
    });
}
