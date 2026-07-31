/**
 * ASA-ARCH-45.0 — Architecture Extension Boundary Layer
 *
 * Public package export boundary only.
 * No runtime initialization, side effects, auto-registration,
 * extension activation, decision capability, or authority ownership.
 *
 * Design Authority / Final Authority: HUMAN_ARCHITECT
 * Extension / Runtime / Decision Authority: NONE
 */

export * from "./types";
export * from "./contracts";
export * from "./models";
export * from "./interfaces";
export * from "./registry";
export * from "./validation";

/** Reference objects — aliased where names collide with contracts. */
export {
    extensionApprovalReferenceFromAssociation,
    extensionApprovalReferenceFromContract,
    freezeExtensionApprovalReference,
    type ExtensionApprovalReference,
    extensionCompatibilityReferenceFromAssociation,
    extensionCompatibilityReferenceFromContract,
    freezeExtensionCompatibilityReference,
    type ExtensionCompatibilityReference,
    extensionSupersessionReferenceFromAssociation,
    extensionSupersessionReferenceFromContract,
    freezeExtensionSupersessionReference as freezeExtensionSupersessionReferenceObject,
    type ExtensionSupersessionReference as ExtensionSupersessionReferenceObject,
    extensionContractCompatibilityReferenceFromContract,
    freezeExtensionContractCompatibilityReference as freezeExtensionContractCompatibilityReferenceObject,
    type ExtensionContractCompatibilityReference as ExtensionContractCompatibilityReferenceObject,
    freezeArchitectureRegistrationReference,
    type ArchitectureRegistrationReference,
    boundaryRelationshipReferenceFromDependencyContract,
    boundaryRelationshipReferenceFromDependencyModel,
    freezeBoundaryRelationshipReference,
    type BoundaryRelationshipDirection,
    type BoundaryRelationshipReference,
} from "./references";

export const ARCHITECTURE_EXTENSION_LAYER = Object.freeze({
    architectureId: "ASA-ARCH-45.0",
    title: "Architecture Extension Boundary Layer",
    packageIdentity: "architecture_extension",
    designAuthority: "HUMAN_ARCHITECT",
    finalAuthority: "HUMAN_ARCHITECT",
    extensionAuthority: "NONE",
    runtimeAuthority: "NONE",
    decisionAuthority: "NONE",
    principle: "Extension Isolation First",
    hasRuntimeIntegration: false,
    hasDecisionCapability: false,
    hasAuthorityOwnership: false,
    hasPluginFramework: false,
    hasDynamicLoading: false,
    preservesCh35: true,
    preservesCh42: true,
    preservesCh43: true,
    preservesCh44: true,
});
