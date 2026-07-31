/**
 * ASA-ARCH-35.0 - Extension Governance Layer (Draft 0.3)
 *
 * Declarative type definitions only.
 *
 * Defines the governance structure between Frozen ASA Core (ARCH-34.0)
 * and future Extension Domains. Does NOT extend Core functionality.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 * SHALL NOT mutate Frozen Core contracts.
 */

/** Stable Extension Governance Layer identity. */
export type ExtensionGovernanceLayerId = string;

/** Extension identifier form: ASA-{DOMAIN}. */
export type ExtensionId = string;

/** Frozen Core version reference (structural only). */
export type AsaCoreVersionId = string;

/**
 * Extension Authority Level.
 * ADMINISTRATOR is forbidden and intentionally absent.
 */
export type ExtensionAuthorityLevel =
    | "OBSERVER"
    | "ADVISOR"
    | "REQUESTER"
    | "EXECUTOR";

/**
 * Extension lifecycle states.
 * FROZEN_EXTENSION is distinct from ASA Core Freeze.
 */
export type ExtensionLifecycleState =
    | "PROPOSED"
    | "DESIGNED"
    | "VALIDATED"
    | "ACTIVE"
    | "STABLE"
    | "FROZEN_EXTENSION"
    | "DEPRECATED";

/** Initial Extension Domain kinds. */
export type ExtensionDomainKind = "OPS" | "AI" | "CONNECT";

/**
 * Compatibility declaration (structural version/contract references only).
 * Not a runtime validation engine.
 */
export interface ExtensionCompatibility {
    readonly coreVersion: AsaCoreVersionId;
    readonly contractVersion: string;
    readonly compatibleExtensionIds: ReadonlyArray<ExtensionId>;
}

/**
 * Extension Domain descriptor (ASA-EXTENSION form).
 * Structural governance declaration only.
 */
export interface ExtensionDescriptor {
    readonly id: ExtensionId;
    readonly version: string;
    readonly domain: ExtensionDomainKind;
    readonly contract: string;
    readonly compatibility: ExtensionCompatibility;
    readonly lifecycle: ExtensionLifecycleState;
    readonly authority: ExtensionAuthorityLevel;
    readonly dependency: ReadonlyArray<string>;
    readonly isolation: true;
}

/**
 * Extension Boundary Contract — sole connection contract between Extension and Core.
 * Structural definition only; no executable adapter semantics.
 */
export interface ExtensionBoundaryContract {
    readonly contractId: string;
    readonly coreVersion: AsaCoreVersionId;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
    readonly isolation: true;
    readonly permittedOperationIds: ReadonlyArray<string>;
    readonly forbidsDirectCoreMutation: true;
    readonly forbidsAdministratorAuthority: true;
}

/**
 * Compatibility matrix entry (structural declaration).
 */
export interface ExtensionCompatibilityMatrixEntry {
    readonly coreVersion: AsaCoreVersionId;
    readonly extensionId: ExtensionId;
    readonly extensionVersionRange: string;
    readonly contractVersion: string;
}

/**
 * Regression boundary declaration (structural separation only).
 */
export interface ExtensionRegressionBoundary {
    readonly coreRegressionRequired: true;
    readonly extensionRegressionRequired: true;
    readonly integrationRegressionRequired: true;
    readonly isolationRegressionRequired: true;
}

/**
 * Immutable Extension Governance Layer identity.
 */
export interface ExtensionGovernanceLayerIdentity {
    readonly governanceLayerId: ExtensionGovernanceLayerId;
    readonly coreVersion: AsaCoreVersionId;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural metadata only.
 */
export interface ExtensionGovernanceLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly governanceStatus: "established";
    readonly corePreservationRequired: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Extension Governance Layer shape.
 */
export interface ExtensionGovernanceLayerProps {
    readonly identity: ExtensionGovernanceLayerIdentity;
    readonly metadata: ExtensionGovernanceLayerMetadata;
    readonly extensionBoundaryContract: ExtensionBoundaryContract;
    readonly extensionDescriptors: ReadonlyArray<ExtensionDescriptor>;
    readonly compatibilityMatrix: ReadonlyArray<ExtensionCompatibilityMatrixEntry>;
    readonly regressionBoundary: ExtensionRegressionBoundary;
}
