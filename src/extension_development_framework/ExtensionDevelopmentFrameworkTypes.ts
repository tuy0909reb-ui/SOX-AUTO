/**
 * ASA-ARCH-35.1 - Extension Development Framework (Draft 0.2)
 *
 * Declarative type definitions only.
 *
 * Defines the shared Extension Development Standard for Extension Domains.
 * Consumes frozen ASA-ARCH-35.0 Extension Governance Layer by reference.
 * Does NOT replace or mutate Governance or Core contracts.
 *
 * SHALL NOT contain runtime, planning, discovery, selection, resolution,
 * binding, loading, scheduling, or dependency-analysis semantics.
 */

import type { ExtensionGovernanceLayer } from "../extension_governance/ExtensionGovernanceLayer";
import type {
    AsaCoreVersionId,
    ExtensionAuthorityLevel,
    ExtensionDomainKind,
    ExtensionId,
} from "../extension_governance/ExtensionGovernanceTypes";

/** Stable Extension Development Framework identity. */
export type ExtensionDevelopmentFrameworkId = string;

/**
 * Framework lifecycle template states.
 * FROZEN here means Extension Freeze (domain artifact), not ASA Core Freeze.
 */
export type ExtensionFrameworkLifecycleState =
    | "PROPOSED"
    | "DESIGNED"
    | "VALIDATED"
    | "ACTIVE"
    | "STABLE"
    | "FROZEN"
    | "DEPRECATED";

/** Governance owner — Architecture Governance responsibility subject. */
export type ExtensionGovernanceOwnerId = string;

/**
 * Extension Metadata (required template fields).
 */
export interface ExtensionMetadata {
    readonly id: ExtensionId;
    readonly version: string;
    readonly domain: ExtensionDomainKind;
    readonly description: string;
    readonly governanceOwner: ExtensionGovernanceOwnerId;
}

/**
 * Error Contract — structural failure notification / recovery declaration.
 */
export interface ExtensionErrorContract {
    readonly errorType: string;
    readonly failureState: string;
    readonly recoveryPolicy: string;
    readonly notificationPolicy: string;
}

/**
 * Extension Contract Template — Input / Processing / Output / Error.
 */
export interface ExtensionContractTemplate {
    readonly inputContractIds: ReadonlyArray<string>;
    readonly processingBoundaryId: string;
    readonly outputContractIds: ReadonlyArray<string>;
    readonly errorContract: ExtensionErrorContract;
    readonly forbidsCoreMutation: true;
    readonly forbidsGovernanceMutation: true;
}

/**
 * Capability Binding Contract — Extension → Capability Contract → Execution Boundary.
 * Does not mutate Capability.
 */
export interface ExtensionCapabilityBindingContract {
    readonly bindingId: string;
    readonly capabilityContractId: string;
    readonly forbidsDirectCapabilityMutation: true;
}

/**
 * Authority Declaration.
 * Declared Authority must be <= Approved Authority.
 * Runtime escalation is forbidden.
 */
export interface ExtensionAuthorityDeclaration {
    readonly declaredAuthority: ExtensionAuthorityLevel;
    readonly approvedAuthority: ExtensionAuthorityLevel;
    readonly forbidsRuntimeEscalation: true;
}

/**
 * Compatibility Declaration for Core + Governance.
 */
export interface ExtensionFrameworkCompatibilityDeclaration {
    readonly compatibleCore: AsaCoreVersionId;
    readonly compatibleGovernance: string;
    readonly requiresVersionMatch: true;
    readonly requiresContractMatch: true;
    readonly requiresRuntimeValidation: true;
    readonly requiresRegressionPass: true;
}

/**
 * Validation Pipeline declaration (structural stages only).
 */
export interface ExtensionValidationPipelineDeclaration {
    readonly stages: ReadonlyArray<
        | "PROPOSAL"
        | "CONTRACT_VALIDATION"
        | "AUTHORITY_VALIDATION"
        | "COMPATIBILITY_VALIDATION"
        | "SECURITY_VALIDATION"
        | "REGRESSION"
        | "ACTIVE"
    >;
}

/**
 * Security Validation checklist (structural required flags).
 */
export interface ExtensionSecurityValidationDeclaration {
    readonly permissionBoundaryRequired: true;
    readonly dataAccessScopeRequired: true;
    readonly externalCommunicationRequired: true;
    readonly secretHandlingRequired: true;
    readonly authorityComplianceRequired: true;
}

/**
 * Regression Standard (structural required flags).
 */
export interface ExtensionRegressionStandard {
    readonly unitTestRequired: true;
    readonly contractTestRequired: true;
    readonly integrationTestRequired: true;
    readonly isolationTestRequired: true;
}

/**
 * Extension Communication Contract principle.
 * Direct internal API access between extensions is forbidden.
 */
export interface ExtensionCommunicationContract {
    readonly forbidsDirectInternalAccess: true;
    readonly requiresBoundaryContract: true;
    readonly requiresContractCompatibility: true;
    readonly requiresVersionCompatibility: true;
    readonly requiresAuthorityValidation: true;
}

/**
 * Shared ASA-EXTENSION Template Contract.
 */
export interface ExtensionTemplateContract {
    readonly metadata: ExtensionMetadata;
    readonly contract: ExtensionContractTemplate;
    readonly authority: ExtensionAuthorityDeclaration;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly dependency: ReadonlyArray<ExtensionId>;
    readonly compatibility: ExtensionFrameworkCompatibilityDeclaration;
    readonly validation: ExtensionValidationPipelineDeclaration;
    readonly securityValidation: ExtensionSecurityValidationDeclaration;
    readonly regressionStandard: ExtensionRegressionStandard;
    readonly communicationContract: ExtensionCommunicationContract;
    readonly capabilityBinding?: ExtensionCapabilityBindingContract;
}

/**
 * Immutable framework identity.
 */
export interface ExtensionDevelopmentFrameworkIdentity {
    readonly frameworkId: ExtensionDevelopmentFrameworkId;
    readonly sourceGovernanceLayerId: string;
    readonly coreVersion: AsaCoreVersionId;
    readonly architectureVersion: string;
    readonly structuralVersion: string;
}

/**
 * Structural metadata only.
 */
export interface ExtensionDevelopmentFrameworkMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly frameworkStatus: "defined";
    readonly preservesGovernanceContract: true;
    readonly preservesCoreContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Established Extension Development Framework shape.
 */
export interface ExtensionDevelopmentFrameworkProps {
    readonly identity: ExtensionDevelopmentFrameworkIdentity;
    readonly metadata: ExtensionDevelopmentFrameworkMetadata;
    readonly sourceGovernanceLayer: ExtensionGovernanceLayer;
    readonly extensionTemplate: ExtensionTemplateContract;
}

/** Re-export governance types for framework consumers. */
export type {
    AsaCoreVersionId,
    ExtensionAuthorityLevel,
    ExtensionDomainKind,
    ExtensionGovernanceLayer,
    ExtensionId,
};
