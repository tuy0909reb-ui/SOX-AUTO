/**
 * ASA-ARCH-37.0 - ASA-CONNECT Validator / Establishment Builder (Draft 0.3)
 *
 * Establishes the immutable ASA-CONNECT External Integration Boundary Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, Framework, or OPS contracts.
 *
 * Performs structural validation only — not a runtime validator engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import {
    AsaConnectLayer,
    type AsaConnectLayerMetadata,
    type ConnectCapabilitySeparation,
    type ConnectCommunicationContract,
    type ConnectSecurityBoundary,
} from "./AsaConnectLayer";
import {
    freezeAuthenticationBoundary,
    freezeSecretProtectionContract,
    type AuthenticationBoundary,
    type AuthenticationMaterialKind,
    type SecretProtectionContract,
} from "./AuthenticationBoundary";
import {
    freezeConnectExtensionContract,
    type ConnectExtensionContract,
} from "./ConnectExtensionContract";
import {
    freezeConnectorDefinition,
    type ConnectorDefinition,
    type ConnectorType,
} from "./ConnectorDefinition";
import {
    freezeConnectorErrorContract,
    type ConnectorErrorClassification,
    type ConnectorErrorContract,
    type ConnectorExternalErrorKind,
} from "./ConnectorErrorContract";
import {
    freezeConnectorLifecycleValidatorContract,
    type ConnectorLifecycleValidatorContract,
} from "./ConnectorLifecycleValidator";
import {
    freezeConnectorRouterContract,
    type ConnectorRouterContract,
} from "./ConnectorRouter";
import {
    freezeDataTransformationContract,
    type DataTransformationContract,
} from "./DataTransformationContract";
import {
    freezeExternalDataContract,
    type ExternalDataContract,
    type ExternalDataValidationKind,
} from "./ExternalDataContract";
import {
    freezeExternalRequestGuard,
    type ExternalRequestGuard,
    type ExternalRequestProtectionKind,
} from "./ExternalRequestGuard";
import {
    freezeOutboundConnectorBoundary,
    type OutboundConnectorBoundary,
    type OutboundCommunicationKind,
} from "./OutboundConnectorBoundary";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";
const REQUIRED_CONNECTOR_TYPES: ReadonlyArray<ConnectorType> = [
    "API",
    "DATABASE",
    "FILE",
    "NOTIFICATION",
];
const REQUIRED_AUTH_MATERIALS: ReadonlyArray<AuthenticationMaterialKind> = [
    "API_KEY",
    "TOKEN",
    "CREDENTIAL",
    "SECRET_REFERENCE",
];
const REQUIRED_DATA_VALIDATIONS: ReadonlyArray<ExternalDataValidationKind> = [
    "SCHEMA",
    "VERSION",
    "INTEGRITY",
    "COMPATIBILITY",
];
const REQUIRED_DATA_PIPELINE = [
    "EXTERNAL_DATA",
    "SCHEMA_VALIDATION",
    "INTEGRITY_VALIDATION",
    "NORMALIZATION",
    "BOUNDARY_CONTRACT",
] as const;
const REQUIRED_TRANSFORM_PIPELINE = [
    "EXTERNAL_FORMAT",
    "TRANSFORMATION",
    "OUTPUT_VALIDATION",
    "ASA_COMPATIBLE_FORMAT",
] as const;
const REQUIRED_ERROR_KINDS: ReadonlyArray<ConnectorExternalErrorKind> = [
    "TIMEOUT",
    "AUTHENTICATION_FAILURE",
    "RATE_LIMIT",
    "SCHEMA_MISMATCH",
    "EXTERNAL_SERVICE_FAILURE",
    "CONNECTION_FAILURE",
];
const REQUIRED_ERROR_CLASSES: ReadonlyArray<ConnectorErrorClassification> = [
    "TRANSIENT_ERROR",
    "PERMANENT_ERROR",
    "SECURITY_ERROR",
    "VALIDATION_ERROR",
];
const REQUIRED_PROTECTION: ReadonlyArray<ExternalRequestProtectionKind> = [
    "RATE_LIMIT",
    "REQUEST_VALIDATION",
    "PAYLOAD_SIZE",
    "ABUSE_PREVENTION",
];
const REQUIRED_OUTBOUND_KINDS: ReadonlyArray<OutboundCommunicationKind> = [
    "NOTIFICATION_DELIVERY",
    "EXTERNAL_API_REQUEST",
    "EXTERNAL_DATA_EXPORT",
];
const REQUIRED_OUTBOUND_PIPELINE = [
    "ASA",
    "BOUNDARY_CONTRACT",
    "CONNECTOR",
    "EXTERNAL_SYSTEM",
] as const;
const REQUIRED_LIFECYCLE_STATES: ReadonlyArray<ExtensionFrameworkLifecycleState> =
    [
        "PROPOSED",
        "DESIGNED",
        "VALIDATED",
        "ACTIVE",
        "STABLE",
        "FROZEN",
        "DEPRECATED",
    ];

/**
 * Structural validator that establishes the ASA-CONNECT layer.
 */
export class ConnectValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private extensionContract: ConnectExtensionContract | undefined;
    private connectors: ConnectorDefinition[] | undefined;
    private externalData: ExternalDataContract | undefined;
    private transformation: DataTransformationContract | undefined;
    private router: ConnectorRouterContract | undefined;
    private authentication: AuthenticationBoundary | undefined;
    private secretProtection: SecretProtectionContract | undefined;
    private errorContract: ConnectorErrorContract | undefined;
    private requestGuard: ExternalRequestGuard | undefined;
    private outboundBoundary: OutboundConnectorBoundary | undefined;
    private lifecycleValidator: ConnectorLifecycleValidatorContract | undefined;

    withLayerId(layerId: string): this {
        this.layerId = layerId;
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

    withSourceFramework(sourceFramework: ExtensionDevelopmentFramework): this {
        this.sourceFramework = sourceFramework;
        return this;
    }

    withExtensionContract(extensionContract: ConnectExtensionContract): this {
        this.extensionContract = extensionContract;
        return this;
    }

    withConnectors(connectors: ReadonlyArray<ConnectorDefinition>): this {
        this.connectors = [...connectors];
        return this;
    }

    withExternalData(externalData: ExternalDataContract): this {
        this.externalData = externalData;
        return this;
    }

    withTransformation(transformation: DataTransformationContract): this {
        this.transformation = transformation;
        return this;
    }

    withRouter(router: ConnectorRouterContract): this {
        this.router = router;
        return this;
    }

    withAuthentication(authentication: AuthenticationBoundary): this {
        this.authentication = authentication;
        return this;
    }

    withSecretProtection(secretProtection: SecretProtectionContract): this {
        this.secretProtection = secretProtection;
        return this;
    }

    withErrorContract(errorContract: ConnectorErrorContract): this {
        this.errorContract = errorContract;
        return this;
    }

    withRequestGuard(requestGuard: ExternalRequestGuard): this {
        this.requestGuard = requestGuard;
        return this;
    }

    withOutboundBoundary(outboundBoundary: OutboundConnectorBoundary): this {
        this.outboundBoundary = outboundBoundary;
        return this;
    }

    withLifecycleValidator(
        lifecycleValidator: ConnectorLifecycleValidatorContract
    ): this {
        this.lifecycleValidator = lifecycleValidator;
        return this;
    }

    /**
     * Establishes the immutable ASA-CONNECT layer after structural validation.
     */
    establish(): AsaConnectLayer {
        const layerId = this.requireNonEmpty(this.layerId, "layerId");
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

        if (!this.sourceFramework) {
            throw new Error(
                "ASA-CONNECT establishment failed: exactly one source Extension Development Framework is required"
            );
        }

        const framework = this.sourceFramework;

        if (!Object.isFrozen(framework) || !Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-CONNECT establishment failed: source Framework immutability verification failed"
            );
        }

        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-CONNECT establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }

        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }

        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-CONNECT establishment failed: Framework status must be defined"
            );
        }

        this.requirePresent(this.extensionContract, "ConnectExtensionContract");
        this.requirePresent(this.connectors, "Connector definitions");
        this.requirePresent(this.externalData, "ExternalDataContract");
        this.requirePresent(this.transformation, "DataTransformationContract");
        this.requirePresent(this.router, "ConnectorRouter");
        this.requirePresent(this.authentication, "AuthenticationBoundary");
        this.requirePresent(this.secretProtection, "SecretProtectionContract");
        this.requirePresent(this.errorContract, "ConnectorErrorContract");
        this.requirePresent(this.requestGuard, "ExternalRequestGuard");
        this.requirePresent(this.outboundBoundary, "OutboundConnectorBoundary");
        this.requirePresent(
            this.lifecycleValidator,
            "ConnectorLifecycleValidator"
        );

        this.validateExtensionContract(this.extensionContract!);
        this.validateConnectors(this.connectors!);
        this.validateExternalData(this.externalData!);
        this.validateTransformation(this.transformation!);
        this.validateRouter(this.router!);
        this.validateAuthentication(this.authentication!);
        this.validateSecretProtection(this.secretProtection!);
        this.validateErrorContract(this.errorContract!);
        this.validateRequestGuard(this.requestGuard!);
        this.validateOutbound(this.outboundBoundary!);
        this.validateLifecycle(this.lifecycleValidator!);

        const securityBoundary: ConnectSecurityBoundary = Object.freeze({
            holdsDecisionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsConnectionResponsibility: true as const,
            holdsValidationResponsibility: true as const,
            holdsTransformationResponsibility: true as const,
        });

        const capabilitySeparation: ConnectCapabilitySeparation = Object.freeze(
            {
                connectorIsNotCapability: true as const,
                forbidsExternalApiCapabilityRegistration: true as const,
                forbidsConnectorCapabilityOwnership: true as const,
                permitsCapabilityRequestViaExecutionBoundary: true as const,
            }
        );

        const communicationContract: ConnectCommunicationContract =
            Object.freeze({
                requiresAuthorityValidation: true as const,
                requiresCompatibilityValidation: true as const,
                requiresSchemaValidation: true as const,
                requiresBoundaryContract: true as const,
                forbidsDirectExtensionInternalAccess: true as const,
                forbidsExternalDirectCoreAccess: true as const,
            });

        const metadata: AsaConnectLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            preservesOpsContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaConnectLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-CONNECT" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            extensionContract: freezeConnectExtensionContract(
                this.extensionContract!
            ),
            connectors: Object.freeze(
                this.connectors!.map((c) => freezeConnectorDefinition(c))
            ),
            externalData: freezeExternalDataContract(this.externalData!),
            transformation: freezeDataTransformationContract(
                this.transformation!
            ),
            router: freezeConnectorRouterContract(this.router!),
            authentication: freezeAuthenticationBoundary(this.authentication!),
            secretProtection: freezeSecretProtectionContract(
                this.secretProtection!
            ),
            errorContract: freezeConnectorErrorContract(this.errorContract!),
            requestGuard: freezeExternalRequestGuard(this.requestGuard!),
            outboundBoundary: freezeOutboundConnectorBoundary(
                this.outboundBoundary!
            ),
            lifecycleValidator: freezeConnectorLifecycleValidatorContract(
                this.lifecycleValidator!
            ),
            securityBoundary,
            capabilitySeparation,
            communicationContract,
        });
    }

    private validateExtensionContract(
        contract: ConnectExtensionContract
    ): void {
        if (contract.id !== "ASA-CONNECT") {
            throw new Error(
                "ASA-CONNECT establishment failed: Extension Identifier must be ASA-CONNECT"
            );
        }
        this.requireNonEmpty(contract.version, "extensionContract.version");
        if (contract.domain !== "ExternalIntegration") {
            throw new Error(
                "ASA-CONNECT establishment failed: domain must be ExternalIntegration"
            );
        }
        if (contract.frameworkDomain !== "CONNECT") {
            throw new Error(
                "ASA-CONNECT establishment failed: frameworkDomain must be CONNECT"
            );
        }
        if (contract.authority !== "REQUESTER") {
            throw new Error(
                "ASA-CONNECT establishment failed: Authority Declaration must be REQUESTER"
            );
        }
        if (contract.requesterIsNotExecutionAuthority !== true) {
            throw new Error(
                "ASA-CONNECT establishment failed: REQUESTER must not equal Execution Authority"
            );
        }
        this.requireNonEmpty(
            contract.description,
            "extensionContract.description"
        );
        this.requireNonEmpty(
            contract.governanceOwner,
            "extensionContract.governanceOwner"
        );
        if (
            !contract.compatibility ||
            !contract.compatibility.includes(REQUIRED_CORE_VERSION) ||
            !contract.compatibility.includes("ASA-ARCH-35.x") ||
            !contract.compatibility.includes("ASA-ARCH-35.1") ||
            !contract.compatibility.includes("ASA-ARCH-36.0")
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: compatibility must include ASA-CORE-34.0, ASA-ARCH-35.x, ASA-ARCH-35.1, ASA-ARCH-36.0"
            );
        }
        if (
            contract.forbidsDecisionMaking !== true ||
            contract.forbidsDirectExecution !== true ||
            contract.forbidsCapabilityMutation !== true ||
            contract.forbidsCapabilityOwnership !== true ||
            contract.forbidsPolicyModification !== true ||
            contract.forbidsCoreMutation !== true ||
            contract.forbidsGovernanceMutation !== true ||
            contract.forbidsRegistryMutation !== true ||
            contract.forbidsWorkflowModification !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Authority / Preservation forbid flags must all be true"
            );
        }
        if (
            contract.permitsSubmitExternalRequest !== true ||
            contract.permitsValidateExternalResponse !== true ||
            contract.permitsTransformExternalData !== true ||
            contract.permitsCreateIntegrationEvent !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: REQUESTER permitted operations must all be true"
            );
        }
        if (!REQUIRED_LIFECYCLE_STATES.includes(contract.lifecycle)) {
            throw new Error(
                "ASA-CONNECT establishment failed: invalid Extension lifecycle state"
            );
        }
    }

    private validateConnectors(connectors: ConnectorDefinition[]): void {
        if (connectors.length === 0) {
            throw new Error(
                "ASA-CONNECT establishment failed: at least one ConnectorDefinition is required"
            );
        }
        const types = new Set(connectors.map((c) => c.type));
        for (const required of REQUIRED_CONNECTOR_TYPES) {
            if (!types.has(required)) {
                throw new Error(
                    `ASA-CONNECT establishment failed: Connector type ${required} is required`
                );
            }
        }
        for (const connector of connectors) {
            this.requireNonEmpty(connector.id, "connector.id");
            this.requireNonEmpty(connector.version, "connector.version");
            this.requireNonEmpty(connector.endpoint, "connector.endpoint");
            this.requireNonEmpty(
                connector.securityPolicy,
                "connector.securityPolicy"
            );
            if (
                !connector.validationRules ||
                connector.validationRules.length === 0
            ) {
                throw new Error(
                    "ASA-CONNECT establishment failed: connector.validationRules required"
                );
            }
            if (
                connector.forbidsBusinessDecision !== true ||
                connector.forbidsPolicyDecision !== true ||
                connector.forbidsExecutionDecision !== true ||
                connector.isNotCapabilityProvider !== true
            ) {
                throw new Error(
                    "ASA-CONNECT establishment failed: Connector decision / capability forbid flags must all be true"
                );
            }
        }
    }

    private validateExternalData(contract: ExternalDataContract): void {
        this.requireNonEmpty(contract.contractId, "externalData.contractId");
        if (
            contract.treatsExternalDataAsUntrusted !== true ||
            contract.validationBeforeTrust !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: External Data must be untrusted with Validation Before Trust"
            );
        }
        this.requireOrdered(contract.pipeline, REQUIRED_DATA_PIPELINE, "External Data pipeline");
        this.requireAllPresent(
            contract.requiredValidations,
            REQUIRED_DATA_VALIDATIONS,
            "External Data validations"
        );
    }

    private validateTransformation(
        contract: DataTransformationContract
    ): void {
        this.requireNonEmpty(
            contract.transformationId,
            "transformation.transformationId"
        );
        if (contract.responsibility !== "DATA_CONVERSION") {
            throw new Error(
                "ASA-CONNECT establishment failed: Transformation responsibility must be DATA_CONVERSION"
            );
        }
        this.requireOrdered(
            contract.pipeline,
            REQUIRED_TRANSFORM_PIPELINE,
            "Transformation pipeline"
        );
        if (
            contract.forbidsBusinessDecision !== true ||
            contract.forbidsPolicyDecision !== true ||
            contract.forbidsExecutionDecision !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Transformation forbid flags must all be true"
            );
        }
    }

    private validateRouter(contract: ConnectorRouterContract): void {
        this.requireNonEmpty(contract.routerId, "router.routerId");
        if (
            contract.permitsEndpointSelection !== true ||
            contract.permitsConnectionSelection !== true ||
            contract.forbidsWorkflowSelection !== true ||
            contract.forbidsPolicyDecision !== true ||
            contract.isNotDecisionLayer !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Routing Restriction flags invalid"
            );
        }
    }

    private validateAuthentication(boundary: AuthenticationBoundary): void {
        this.requireNonEmpty(boundary.boundaryId, "authentication.boundaryId");
        this.requireAllPresent(
            boundary.materialKinds,
            REQUIRED_AUTH_MATERIALS,
            "Authentication materials"
        );
        if (
            boundary.secretsRemainInsideConnectorBoundary !== true ||
            boundary.forbidsSecretToCoreContract !== true ||
            boundary.forbidsSecretToExtensionOutput !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Secret Isolation flags must all be true"
            );
        }
    }

    private validateSecretProtection(
        contract: SecretProtectionContract
    ): void {
        this.requireNonEmpty(contract.protectionId, "secretProtection.protectionId");
        if (
            contract.providesSecretHandlingBoundary !== true ||
            contract.isNotSecretOwnership !== true ||
            contract.creationDelegatedExternally !== true ||
            contract.rotationDelegatedExternally !== true ||
            contract.expirationDelegatedExternally !== true ||
            contract.revocationDelegatedExternally !== true ||
            contract.usageLimitedToConnectorConnection !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Secret Ownership Separation flags must all be true"
            );
        }
    }

    private validateErrorContract(contract: ConnectorErrorContract): void {
        this.requireNonEmpty(
            contract.errorContractId,
            "errorContract.errorContractId"
        );
        this.requireAllPresent(
            contract.externalErrorKinds,
            REQUIRED_ERROR_KINDS,
            "Error external kinds"
        );
        this.requireAllPresent(
            contract.classifications,
            REQUIRED_ERROR_CLASSES,
            "Error classifications"
        );
        this.requireOrdered(
            contract.pipeline,
            ["EXTERNAL_ERROR", "CONNECTOR_ERROR_CONTRACT", "ASA_ERROR_HANDLING"],
            "Error pipeline"
        );
    }

    private validateRequestGuard(guard: ExternalRequestGuard): void {
        this.requireNonEmpty(guard.guardId, "requestGuard.guardId");
        this.requireAllPresent(
            guard.protectionKinds,
            REQUIRED_PROTECTION,
            "External Request Protection kinds"
        );
        if (guard.authorityMode !== "OBSERVATION_VALIDATION_ONLY") {
            throw new Error(
                "ASA-CONNECT establishment failed: ExternalRequestGuard authority must be OBSERVATION_VALIDATION_ONLY"
            );
        }
        if (
            guard.forbidsDecisionAuthority !== true ||
            guard.forbidsExecutionAuthority !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: ExternalRequestGuard must forbid Decision / Execution Authority"
            );
        }
    }

    private validateOutbound(boundary: OutboundConnectorBoundary): void {
        this.requireNonEmpty(boundary.boundaryId, "outboundBoundary.boundaryId");
        this.requireOrdered(
            boundary.pipeline,
            REQUIRED_OUTBOUND_PIPELINE,
            "Outbound pipeline"
        );
        this.requireAllPresent(
            boundary.communicationKinds,
            REQUIRED_OUTBOUND_KINDS,
            "Outbound communication kinds"
        );
        if (
            boundary.forbidsCoreDirectExternalAccess !== true ||
            boundary.requiresValidationAndSecurityBoundary !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Outbound Boundary flags must all be true"
            );
        }
    }

    private validateLifecycle(
        contract: ConnectorLifecycleValidatorContract
    ): void {
        this.requireNonEmpty(
            contract.lifecycleValidatorId,
            "lifecycleValidator.lifecycleValidatorId"
        );
        this.requireOrdered(
            contract.allowedStates,
            REQUIRED_LIFECYCLE_STATES,
            "Lifecycle states"
        );
        if (
            contract.requiresGovernanceValidation !== true ||
            contract.isGovernanceManaged !== true ||
            contract.forbidsIndividualImplementationJudgment !== true
        ) {
            throw new Error(
                "ASA-CONNECT establishment failed: Lifecycle Governance flags must all be true"
            );
        }
    }

    private requirePresent<T>(
        value: T | undefined,
        label: string
    ): asserts value is T {
        if (value === undefined) {
            throw new Error(
                `ASA-CONNECT establishment failed: ${label} is required`
            );
        }
    }

    private requireAllPresent<T extends string>(
        actual: ReadonlyArray<T>,
        required: ReadonlyArray<T>,
        label: string
    ): void {
        for (const item of required) {
            if (!actual.includes(item)) {
                throw new Error(
                    `ASA-CONNECT establishment failed: ${label} missing ${item}`
                );
            }
        }
    }

    private requireOrdered(
        actual: ReadonlyArray<string>,
        required: ReadonlyArray<string>,
        label: string
    ): void {
        if (
            !actual ||
            actual.length !== required.length ||
            required.some((s, i) => actual[i] !== s)
        ) {
            throw new Error(
                `ASA-CONNECT establishment failed: ${label} incomplete or out of order`
            );
        }
    }

    private requireNonEmpty(
        value: string | undefined,
        field: string
    ): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ASA-CONNECT establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
