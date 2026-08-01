/**
 * ASA-ARCH-49.0 — Architecture Recommendation Boundary Layer
 *
 * Structured evolution recommendation from evidence / intelligence / traceability.
 * No decision / approval / freeze / runtime / automatic modification authority.
 *
 * Principle: Recommendation Capability ≠ Decision Authority
 * Final Authority: HUMAN_ARCHITECT
 */

export * from "./types";
export * from "./contracts";
export * from "./models";
export * from "./lifecycle";
export * from "./generation";
export * from "./validation";

export const ARCHITECTURE_RECOMMENDATION_LAYER = Object.freeze({
    architectureId: "ASA-ARCH-49.0",
    title: "Architecture Recommendation Boundary Layer",
    packageIdentity: "architecture_recommendation",
    classification: "Architecture Support Layer",
    designAuthority: "HUMAN_ARCHITECT",
    finalAuthority: "HUMAN_ARCHITECT",
    operationalAuthority: "OPERATIONS_COORDINATOR",
    recommendationAuthority: "STRUCTURAL_ONLY",
    decisionAuthority: "NONE",
    approvalAuthority: "NONE",
    freezeAuthority: "NONE",
    runtimeAuthority: "NONE",
    principle: "Recommendation Capability ≠ Decision Authority",
    dependsOnIntelligenceLayer: "ASA-ARCH-47.0",
    dependsOnTraceabilityLayer: "ASA-ARCH-48.0",
    dependsOnFoundation: "ASA-FOUNDATION-1.0",
    hasRuntimeIntegration: false,
    hasDecisionCapability: false,
    hasApprovalCapability: false,
    hasAuthorityOwnership: false,
    hasAutomaticArchitectureCreation: false,
    hasAutomaticModification: false,
    providesRecommendationOnly: true,
    lifecycleTerminatesBeforeDecision: true,
    isDeterministic: true,
    preservesFoundation: true,
    preservesFrozenArchitecture: true,
});
