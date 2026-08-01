/**
 * ASA-ARCH-48.0 — Architecture Traceability Layer
 *
 * Append-oriented lifecycle evidence preservation.
 * No decision / approval / freeze / runtime authority.
 *
 * Final Authority: HUMAN_ARCHITECT
 */

export * from "./types";
export * from "./contracts";
export * from "./models";
export * from "./registry";
export * from "./validation";

export const ARCHITECTURE_TRACEABILITY_LAYER = Object.freeze({
    architectureId: "ASA-ARCH-48.0",
    title: "Architecture Traceability Layer",
    packageIdentity: "architecture_traceability",
    classification: "Architecture Support Layer",
    designAuthority: "HUMAN_ARCHITECT",
    finalAuthority: "HUMAN_ARCHITECT",
    operationalAuthority: "OPERATIONS_COORDINATOR",
    traceabilityAuthority: "NONE",
    runtimeAuthority: "NONE",
    decisionAuthority: "NONE",
    principle: "Trace Before Change · Evidence First",
    dependsOnIntelligenceLayer: "ASA-ARCH-47.0",
    dependsOnFoundation: "ASA-FOUNDATION-1.0",
    isAppendOriented: true,
    forbidsSilentReplacement: true,
    hasRuntimeIntegration: false,
    hasDecisionCapability: false,
    hasAuthorityOwnership: false,
    providesTraceVisibilityOnly: true,
    preservesFoundation: true,
    preservesFrozenArchitecture: true,
});
