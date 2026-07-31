/**
 * ASA-ARCH-45.0 — references layer public surface (within package).
 */

export {
    extensionApprovalReferenceFromAssociation,
    extensionApprovalReferenceFromContract,
    freezeExtensionApprovalReference,
    type ExtensionApprovalReference,
} from "./ExtensionApprovalReference";

export {
    extensionCompatibilityReferenceFromAssociation,
    extensionCompatibilityReferenceFromContract,
    freezeExtensionCompatibilityReference,
    type ExtensionCompatibilityReference,
} from "./ExtensionCompatibilityReference";

export {
    extensionSupersessionReferenceFromAssociation,
    extensionSupersessionReferenceFromContract,
    freezeExtensionSupersessionReference,
    type ExtensionSupersessionReference,
} from "./ExtensionSupersessionReference";

export {
    extensionContractCompatibilityReferenceFromContract,
    freezeExtensionContractCompatibilityReference,
    type ExtensionContractCompatibilityReference,
} from "./ExtensionContractCompatibilityReference";

export {
    freezeArchitectureRegistrationReference,
    type ArchitectureRegistrationReference,
} from "./ArchitectureRegistrationReference";

export {
    boundaryRelationshipReferenceFromDependencyContract,
    boundaryRelationshipReferenceFromDependencyModel,
    freezeBoundaryRelationshipReference,
    type BoundaryRelationshipDirection,
    type BoundaryRelationshipReference,
} from "./BoundaryRelationshipReference";
