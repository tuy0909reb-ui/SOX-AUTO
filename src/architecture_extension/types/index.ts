/**
 * ASA-ARCH-45.0 — types layer public surface (within package).
 * Package root public export: ../index.ts
 */

export {
    createExtensionIdentifier,
    type ExtensionIdentifier,
} from "./ExtensionIdentifier";

export {
    APPROVAL_AUTHORITY,
    createApprovalReference,
    type ApprovalAuthority,
    type ApprovalReference,
} from "./ApprovalReference";

export {
    COMPATIBILITY_STATUSES,
    CompatibilityStatus,
    isCompatibilityStatus,
} from "./CompatibilityStatus";

export {
    ExtensionLifecycleDeclarationState,
    LIFECYCLE_DECLARATION_STATES,
    LifecycleDeclarationState,
    isLifecycleDeclarationState,
} from "./LifecycleDeclarationState";

export {
    createApprovalTimestampReference,
    createApprovedObjectReference,
    createApprovedVersionReference,
    createCompatibleBoundaryReference,
    createContractVersionReference,
    createExtensionName,
    createExtensionVersionReference,
    createIdentityHashReference,
    type ApprovalTimestampReference,
    type ApprovedObjectReference,
    type ApprovedVersionReference,
    type CompatibleBoundaryReference,
    type ContractVersionReference,
    type ExtensionName,
    type ExtensionVersionReference,
    type IdentityHashReference,
} from "./BoundaryPrimitives";
