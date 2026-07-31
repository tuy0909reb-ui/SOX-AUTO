/**
 * ASA-ARCH-35.1 - Extension Development Framework Builder (Draft 0.2)
 *
 * Defines the immutable Extension Development Framework standard.
 * Consumes ASA-ARCH-35.0 Extension Governance Layer exclusively.
 * Does NOT mutate Core or Governance contracts.
 *
 * Performs structural template validation only.
 */

import type { ExtensionGovernanceLayer } from "../extension_governance/ExtensionGovernanceLayer";
import type { ExtensionAuthorityLevel } from "../extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFramework } from "./ExtensionDevelopmentFramework";
import type {
    ExtensionDevelopmentFrameworkMetadata,
    ExtensionTemplateContract,
} from "./ExtensionDevelopmentFrameworkTypes";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_GOVERNANCE_COMPAT = "ASA-ARCH-35.x";
const EXTENSION_ID_PATTERN = /^ASA-[A-Z][A-Z0-9-]*$/;

const AUTHORITY_RANK: Record<ExtensionAuthorityLevel, number> = {
    OBSERVER: 0,
    ADVISOR: 1,
    REQUESTER: 2,
    EXECUTOR: 3,
};

const REQUIRED_VALIDATION_STAGES = [
    "PROPOSAL",
    "CONTRACT_VALIDATION",
    "AUTHORITY_VALIDATION",
    "COMPATIBILITY_VALIDATION",
    "SECURITY_VALIDATION",
    "REGRESSION",
    "ACTIVE",
] as const;

/**
 * Structural builder that defines the Extension Development Framework.
 */
export class ExtensionDevelopmentFrameworkBuilder {
    private frameworkId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceGovernanceLayer: ExtensionGovernanceLayer | undefined;
    private extensionTemplate: ExtensionTemplateContract | undefined;

    withFrameworkId(frameworkId: string): this {
        this.frameworkId = frameworkId;
        return this;
    }

    withArchitectureVersion(architectureVersion: string): this {
        this.architectureVersion = architectureVersion;
        return this;
    }

    withStructuralVersion(structuralVersion: string): this {
        this.structuralVersion = structuralVersion;
        return this;
    }

    withSchemaVersion(schemaVersion: string): this {
        this.schemaVersion = schemaVersion;
        return this;
    }

    withCreationTimestamp(creationTimestamp: string): this {
        this.creationTimestamp = creationTimestamp;
        return this;
    }

    withProducerIdentity(producerIdentity: string): this {
        this.producerIdentity = producerIdentity;
        return this;
    }

    /**
     * Supplies exactly one frozen ASA-ARCH-35.0 Governance Layer by reference.
     */
    withSourceGovernanceLayer(
        sourceGovernanceLayer: ExtensionGovernanceLayer
    ): this {
        this.sourceGovernanceLayer = sourceGovernanceLayer;
        return this;
    }

    withExtensionTemplate(extensionTemplate: ExtensionTemplateContract): this {
        this.extensionTemplate = extensionTemplate;
        return this;
    }

    /**
     * Defines the immutable Extension Development Framework after structural validation.
     */
    define(): ExtensionDevelopmentFramework {
        const frameworkId = this.requireNonEmpty(
            this.frameworkId,
            "frameworkId"
        );
        const architectureVersion = this.requireNonEmpty(
            this.architectureVersion,
            "architectureVersion"
        );
        const structuralVersion = this.requireNonEmpty(
            this.structuralVersion,
            "structuralVersion"
        );
        const schemaVersion = this.requireNonEmpty(
            this.schemaVersion,
            "schemaVersion"
        );

        if (!this.sourceGovernanceLayer) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: exactly one source Governance Layer is required"
            );
        }

        const governance = this.sourceGovernanceLayer;

        if (!Object.isFrozen(governance)) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: source Governance Layer immutability verification failed"
            );
        }

        if (!Object.isFrozen(governance.identity)) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: source Governance Layer identity immutability verification failed"
            );
        }

        if (governance.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Governance Layer must preserve ASA-CORE-34.0"
            );
        }

        if (governance.metadata.governanceStatus !== "established") {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Governance Layer status must be established"
            );
        }

        if (!this.extensionTemplate) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Extension Template Contract is required"
            );
        }

        this.validateTemplate(this.extensionTemplate);

        const metadata: ExtensionDevelopmentFrameworkMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            frameworkStatus: "defined" as const,
            preservesGovernanceContract: true as const,
            preservesCoreContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new ExtensionDevelopmentFramework({
            identity: Object.freeze({
                frameworkId,
                sourceGovernanceLayerId: governance.identity.governanceLayerId,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
            }),
            metadata,
            sourceGovernanceLayer: governance,
            extensionTemplate: this.extensionTemplate,
        });
    }

    private validateTemplate(template: ExtensionTemplateContract): void {
        const meta = template.metadata;
        this.requireNonEmpty(meta.id, "extensionTemplate.metadata.id");
        if (!EXTENSION_ID_PATTERN.test(meta.id)) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: invalid Extension Identifier"
            );
        }
        this.requireNonEmpty(meta.version, "extensionTemplate.metadata.version");
        this.requireNonEmpty(
            meta.description,
            "extensionTemplate.metadata.description"
        );
        this.requireNonEmpty(
            meta.governanceOwner,
            "extensionTemplate.metadata.governanceOwner"
        );
        if (
            meta.domain !== "OPS" &&
            meta.domain !== "AI" &&
            meta.domain !== "CONNECT"
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: metadata.domain must be OPS | AI | CONNECT"
            );
        }

        const contract = template.contract;
        if (
            !contract.inputContractIds ||
            contract.inputContractIds.length === 0
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Input Contract is required"
            );
        }
        this.requireNonEmpty(
            contract.processingBoundaryId,
            "extensionTemplate.contract.processingBoundaryId"
        );
        if (
            !contract.outputContractIds ||
            contract.outputContractIds.length === 0
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Output Contract is required"
            );
        }
        this.requireNonEmpty(
            contract.errorContract.errorType,
            "extensionTemplate.contract.errorContract.errorType"
        );
        this.requireNonEmpty(
            contract.errorContract.failureState,
            "extensionTemplate.contract.errorContract.failureState"
        );
        this.requireNonEmpty(
            contract.errorContract.recoveryPolicy,
            "extensionTemplate.contract.errorContract.recoveryPolicy"
        );
        this.requireNonEmpty(
            contract.errorContract.notificationPolicy,
            "extensionTemplate.contract.errorContract.notificationPolicy"
        );
        if (contract.forbidsCoreMutation !== true) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: forbidsCoreMutation must be true"
            );
        }
        if (contract.forbidsGovernanceMutation !== true) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: forbidsGovernanceMutation must be true"
            );
        }

        const authority = template.authority;
        if (authority.forbidsRuntimeEscalation !== true) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: forbidsRuntimeEscalation must be true"
            );
        }
        if (
            AUTHORITY_RANK[authority.declaredAuthority] >
            AUTHORITY_RANK[authority.approvedAuthority]
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Declared Authority must be <= Approved Authority"
            );
        }
        if (
            meta.domain === "AI" &&
            authority.declaredAuthority === "EXECUTOR"
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: AI Authority Restriction — ASA-AI domain must not declare EXECUTOR"
            );
        }

        if (!template.lifecycle) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: lifecycle is required"
            );
        }

        // Circular dependency: template must not depend on its own id.
        if (template.dependency.includes(meta.id)) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: circular dependency is forbidden"
            );
        }
        for (let i = 0; i < template.dependency.length; i++) {
            this.requireNonEmpty(
                template.dependency[i],
                `extensionTemplate.dependency[${i}]`
            );
            if (!EXTENSION_ID_PATTERN.test(template.dependency[i])) {
                throw new Error(
                    "ExtensionDevelopmentFramework definition failed: invalid dependency Extension Identifier"
                );
            }
        }

        const compat = template.compatibility;
        if (compat.compatibleCore !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Compatible Core must be ASA-CORE-34.0"
            );
        }
        if (compat.compatibleGovernance !== REQUIRED_GOVERNANCE_COMPAT) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Compatible Governance must be ASA-ARCH-35.x"
            );
        }
        if (
            compat.requiresVersionMatch !== true ||
            compat.requiresContractMatch !== true ||
            compat.requiresRuntimeValidation !== true ||
            compat.requiresRegressionPass !== true
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Compatibility verification flags must all be true"
            );
        }

        if (
            !template.validation.stages ||
            template.validation.stages.length !==
                REQUIRED_VALIDATION_STAGES.length ||
            REQUIRED_VALIDATION_STAGES.some(
                (s, i) => template.validation.stages[i] !== s
            )
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Validation Pipeline stages are incomplete"
            );
        }

        const security = template.securityValidation;
        if (
            security.permissionBoundaryRequired !== true ||
            security.dataAccessScopeRequired !== true ||
            security.externalCommunicationRequired !== true ||
            security.secretHandlingRequired !== true ||
            security.authorityComplianceRequired !== true
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Security Validation flags must all be true"
            );
        }

        const regression = template.regressionStandard;
        if (
            regression.unitTestRequired !== true ||
            regression.contractTestRequired !== true ||
            regression.integrationTestRequired !== true ||
            regression.isolationTestRequired !== true
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Regression Standard flags must all be true"
            );
        }

        const communication = template.communicationContract;
        if (
            communication.forbidsDirectInternalAccess !== true ||
            communication.requiresBoundaryContract !== true ||
            communication.requiresContractCompatibility !== true ||
            communication.requiresVersionCompatibility !== true ||
            communication.requiresAuthorityValidation !== true
        ) {
            throw new Error(
                "ExtensionDevelopmentFramework definition failed: Communication Contract flags must all be true"
            );
        }

        if (template.capabilityBinding) {
            this.requireNonEmpty(
                template.capabilityBinding.bindingId,
                "extensionTemplate.capabilityBinding.bindingId"
            );
            this.requireNonEmpty(
                template.capabilityBinding.capabilityContractId,
                "extensionTemplate.capabilityBinding.capabilityContractId"
            );
            if (
                template.capabilityBinding.forbidsDirectCapabilityMutation !==
                true
            ) {
                throw new Error(
                    "ExtensionDevelopmentFramework definition failed: forbidsDirectCapabilityMutation must be true"
                );
            }
        }
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ExtensionDevelopmentFramework definition failed: ${field} is required`
            );
        }
        return value;
    }
}
