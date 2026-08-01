/**
 * ASA-ARCH-46.0 — Architecture Evolution Layer
 *
 * Public package export boundary only.
 * No runtime initialization, side effects, auto-registration,
 * evolution activation, decision capability, or authority ownership.
 *
 * Design Authority / Final Authority: HUMAN_ARCHITECT
 * Evolution / Runtime / Decision Authority: NONE
 *
 * Package identity is architecture_evolution_layer
 * （distinct from ASA-ARCH-42.0 architecture_evolution）.
 */

export * from "./types";
export * from "./contracts";
export * from "./models";
export * from "./interfaces";
export * from "./registry";
export * from "./validation";

export const ARCHITECTURE_EVOLUTION_LAYER = Object.freeze({
    architectureId: "ASA-ARCH-46.0",
    title: "Architecture Evolution Layer",
    packageIdentity: "architecture_evolution_layer",
    designAuthority: "HUMAN_ARCHITECT",
    finalAuthority: "HUMAN_ARCHITECT",
    evolutionAuthority: "NONE",
    runtimeAuthority: "NONE",
    decisionAuthority: "NONE",
    principle: "Evolution without mutation",
    dependsOnExtensionBoundary: "ASA-ARCH-45.0",
    dependsOnFoundation: "ASA-FOUNDATION-1.0",
    hasRuntimeIntegration: false,
    hasDecisionCapability: false,
    hasAuthorityOwnership: false,
    hasPluginFramework: false,
    hasDynamicLoading: false,
    preservesFoundation: true,
    preservesCh1ToCh45: true,
});
