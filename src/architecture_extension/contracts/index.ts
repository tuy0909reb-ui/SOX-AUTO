/**
 * ASA-ARCH-45.0 — contracts layer public surface (within package).
 */

export {
    createCreationReference,
    freezeExtensionIdentityContract,
    type CreationReference,
    type ExtensionIdentityContract,
} from "./ExtensionIdentityContract";

export {
    freezeExtensionBoundaryContract,
    type ExtensionBoundaryContract,
} from "./ExtensionBoundaryContract";

export {
    REQUIRED_EXCLUDED_RESPONSIBILITIES,
    freezeExtensionResponsibilityDeclaration,
    type ExcludedAuthorityResponsibility,
    type ExtensionResponsibilityDeclaration,
} from "./ExtensionResponsibilityDeclaration";

export {
    freezeExtensionAuthorityBoundaryContract,
    type ExtensionAuthorityBoundaryContract,
} from "./ExtensionAuthorityBoundaryContract";

export {
    freezeExtensionDependencyBoundaryContract,
    type DependencyDirection,
    type ExtensionDependencyBoundaryContract,
} from "./ExtensionDependencyBoundaryContract";

export {
    freezeExtensionLifecycleDeclarationContract,
    type ExtensionLifecycleDeclarationContract,
    type LifecycleDeclarationAuthority,
} from "./ExtensionLifecycleDeclarationContract";

export {
    freezeExtensionApprovalReferenceContract,
    type ExtensionApprovalReferenceContract,
} from "./ExtensionApprovalReferenceContract";

export {
    freezeExtensionContractCompatibilityReference,
    type ExtensionContractCompatibilityReference,
} from "./ExtensionContractCompatibilityReference";

export {
    freezeExtensionSupersessionReference,
    type ExtensionSupersessionReference,
} from "./ExtensionSupersessionReference";
