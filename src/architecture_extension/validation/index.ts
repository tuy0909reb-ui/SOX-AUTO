/**
 * ASA-ARCH-45.0 — validation layer public surface (within package).
 * Read-only inspection only — no registry mutation / no authority.
 */

export {
    freezeInspectionResult,
    mergeInspectionResults,
} from "./inspectionResult";

export {
    validateIdentityConformity,
    validateIdentityContract,
    validateIdentityModel,
} from "./IdentityValidation";

export {
    validateBoundaryContract,
    validateBoundaryModel,
} from "./BoundaryValidation";

export {
    validateDeterministicLookup,
    validateRegistryIsolation,
    validateRegistryRecordIntegrity,
} from "./RegistryValidation";

export {
    detectReverseDependencyDeclaration,
    validateBoundaryRelationshipReference,
    validateDependencyBoundaryContract,
    validateDependencyBoundaryModel,
} from "./DependencyValidation";

export {
    validateApprovalReferenceAuthority,
    validateAuthorityBoundaryContract,
    validateAuthorityBoundaryModel,
    validateResponsibilityExclusions,
} from "./AuthorityValidation";

export {
    validateCompatibilityContract,
    validateCompatibilityReference,
    validateContractCompatibilityReference,
} from "./CompatibilityValidation";

export {
    PROHIBITED_CAPABILITY_TOKENS,
    detectProhibitedCapabilityTokens,
    validateDecisionCapabilityAbsence,
    validateLifecycleDeclarationStateAbsenceOfRuntime,
    validateRuntimeCapabilityAbsence,
} from "./ProhibitedCapabilityValidation";

export {
    validateAllFrozenLayersPresent,
    validateFrozenLayerPreservation,
    type FrozenLayerDigestEvidence,
    type FrozenLayerId,
} from "./FrozenLayerPreservationValidation";

export { ExtensionBoundaryValidator } from "./ExtensionBoundaryValidator";
