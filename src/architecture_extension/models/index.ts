/**
 * ASA-ARCH-45.0 — models layer public surface (within package).
 */

export {
    extensionIdentityFromContract,
    freezeExtensionIdentity,
    type ExtensionIdentity,
} from "./ExtensionIdentity";

export {
    extensionBoundaryFromContract,
    freezeExtensionBoundary,
    type ExtensionBoundary,
} from "./ExtensionBoundary";

export {
    freezeExtensionResponsibilityDeclarationModel,
    responsibilityDeclarationModelFromContract,
    type ExtensionResponsibilityDeclarationModel,
} from "./ExtensionResponsibilityDeclarationModel";

export {
    authorityBoundaryModelFromContract,
    freezeExtensionAuthorityBoundaryModel,
    type ExtensionAuthorityBoundaryModel,
} from "./ExtensionAuthorityBoundaryModel";

export {
    dependencyBoundaryModelFromContract,
    freezeExtensionDependencyBoundaryModel,
    type ExtensionDependencyBoundaryModel,
} from "./ExtensionDependencyBoundaryModel";

export {
    freezeExtensionLifecycleDeclarationModel,
    lifecycleDeclarationModelFromContract,
    type ExtensionLifecycleDeclarationModel,
} from "./ExtensionLifecycleDeclarationModel";

export {
    approvalReferenceAssociationFromContract,
    freezeExtensionApprovalReferenceAssociation,
    type ExtensionApprovalReferenceAssociation,
} from "./ExtensionApprovalReferenceAssociation";

export {
    compatibilityReferenceAssociationFromContract,
    freezeExtensionCompatibilityReferenceAssociation,
    type ExtensionCompatibilityReferenceAssociation,
} from "./ExtensionCompatibilityReferenceAssociation";

export {
    freezeExtensionSupersessionReferenceAssociation,
    supersessionReferenceAssociationFromContract,
    type ExtensionSupersessionReferenceAssociation,
} from "./ExtensionSupersessionReferenceAssociation";

export {
    freezeExtensionRegistryRecord,
    type ExtensionRegistryRecord,
} from "./ExtensionRegistryRecord";

export {
    freezeExtensionRegistryHistoryRecord,
    type ExtensionRegistryHistoryRecord,
} from "./ExtensionRegistryHistoryRecord";
