/**
 * ASA-ARCH-47.0 — Architecture Intelligence Layer
 *
 * Public package export boundary only.
 * No runtime initialization, automatic decisions, approvals, or freeze authority.
 *
 * Design Authority / Final Authority: HUMAN_ARCHITECT
 * Intelligence / Runtime / Decision Authority: NONE
 *
 * Principle: Architecture Intelligence without Architecture Autonomy
 */

export * from "./types";
export * from "./contracts";
export * from "./models";
export * from "./knowledge";
export * from "./analyzer";
export * from "./report";
export * from "./evidence";
export * from "./validation";

export const ARCHITECTURE_INTELLIGENCE_LAYER = Object.freeze({
    architectureId: "ASA-ARCH-47.0",
    title: "Architecture Intelligence Layer",
    packageIdentity: "architecture_intelligence",
    classification: "Architecture Support Layer",
    designAuthority: "HUMAN_ARCHITECT",
    finalAuthority: "HUMAN_ARCHITECT",
    intelligenceAuthority: "NONE",
    runtimeAuthority: "NONE",
    decisionAuthority: "NONE",
    principle: "Architecture Intelligence without Architecture Autonomy",
    dependsOnEvolutionLayer: "ASA-ARCH-46.0",
    dependsOnFoundation: "ASA-FOUNDATION-1.0",
    hasRuntimeIntegration: false,
    hasDecisionCapability: false,
    hasAuthorityOwnership: false,
    hasAutomaticApproval: false,
    hasAutomaticFreeze: false,
    providesEvidenceOnly: true,
    preservesFoundation: true,
    preservesFrozenArchitecture: true,
});
