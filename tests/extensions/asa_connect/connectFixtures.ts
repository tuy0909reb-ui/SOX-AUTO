import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { AuthenticationBoundary } from "../../../src/extensions/asa_connect/AuthenticationBoundary";
import type { SecretProtectionContract } from "../../../src/extensions/asa_connect/AuthenticationBoundary";
import type { ConnectExtensionContract } from "../../../src/extensions/asa_connect/ConnectExtensionContract";
import type { ConnectorDefinition } from "../../../src/extensions/asa_connect/ConnectorDefinition";
import type { ConnectorErrorContract } from "../../../src/extensions/asa_connect/ConnectorErrorContract";
import type { ConnectorLifecycleValidatorContract } from "../../../src/extensions/asa_connect/ConnectorLifecycleValidator";
import type { ConnectorRouterContract } from "../../../src/extensions/asa_connect/ConnectorRouter";
import type { DataTransformationContract } from "../../../src/extensions/asa_connect/DataTransformationContract";
import type { ExternalDataContract } from "../../../src/extensions/asa_connect/ExternalDataContract";
import type { ExternalRequestGuard } from "../../../src/extensions/asa_connect/ExternalRequestGuard";
import type { OutboundConnectorBoundary } from "../../../src/extensions/asa_connect/OutboundConnectorBoundary";
import { ConnectValidator } from "../../../src/extensions/asa_connect/ConnectValidator";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "submit.external.request",
            "validate.external.response",
            "transform.external.data",
            "create.integration.event",
        ]),
        forbidsDirectCoreMutation: true as const,
        forbidsAdministratorAuthority: true as const,
    });
}

function sampleDescriptors(): ExtensionDescriptor[] {
    return [
        Object.freeze({
            id: "ASA-CONNECT",
            version: "1.0.0",
            domain: "CONNECT" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze([
                    "ASA-OPS",
                    "ASA-AI",
                ]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "REQUESTER" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
        Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-CONNECT"]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "OBSERVER" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
    ];
}

function sampleMatrix(): ExtensionCompatibilityMatrixEntry[] {
    return [
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-CONNECT",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-OPS",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
    ];
}

function sampleRegression(): ExtensionRegressionBoundary {
    return Object.freeze({
        coreRegressionRequired: true as const,
        extensionRegressionRequired: true as const,
        integrationRegressionRequired: true as const,
        isolationRegressionRequired: true as const,
    });
}

function establishGovernance() {
    return new ExtensionGovernanceBuilder()
        .withGovernanceLayerId("egl-connect")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

function sampleFrameworkTemplate(): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({
            id: "ASA-CONNECT",
            version: "1.0.0",
            domain: "CONNECT" as const,
            description: "CONNECT development template for ASA-ARCH-37.0",
            governanceOwner: "ASA-GOV-CONNECT",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.connect.input.v1"]),
            processingBoundaryId: "ext.connect.processing.v1",
            outputContractIds: Object.freeze(["ext.connect.output.v1"]),
            errorContract: Object.freeze({
                errorType: "CONNECT_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true as const,
            forbidsGovernanceMutation: true as const,
        }),
        authority: Object.freeze({
            declaredAuthority: "REQUESTER" as const,
            approvedAuthority: "REQUESTER" as const,
            forbidsRuntimeEscalation: true as const,
        }),
        lifecycle: "VALIDATED" as const,
        dependency: Object.freeze([] as string[]),
        compatibility: Object.freeze({
            compatibleCore: "ASA-CORE-34.0" as const,
            compatibleGovernance: "ASA-ARCH-35.x",
            requiresVersionMatch: true as const,
            requiresContractMatch: true as const,
            requiresRuntimeValidation: true as const,
            requiresRegressionPass: true as const,
        }),
        validation: Object.freeze({
            stages: Object.freeze([
                "PROPOSAL",
                "CONTRACT_VALIDATION",
                "AUTHORITY_VALIDATION",
                "COMPATIBILITY_VALIDATION",
                "SECURITY_VALIDATION",
                "REGRESSION",
                "ACTIVE",
            ] as const),
        }),
        securityValidation: Object.freeze({
            permissionBoundaryRequired: true as const,
            dataAccessScopeRequired: true as const,
            externalCommunicationRequired: true as const,
            secretHandlingRequired: true as const,
            authorityComplianceRequired: true as const,
        }),
        regressionStandard: Object.freeze({
            unitTestRequired: true as const,
            contractTestRequired: true as const,
            integrationTestRequired: true as const,
            isolationTestRequired: true as const,
        }),
        communicationContract: Object.freeze({
            forbidsDirectInternalAccess: true as const,
            requiresBoundaryContract: true as const,
            requiresContractCompatibility: true as const,
            requiresVersionCompatibility: true as const,
            requiresAuthorityValidation: true as const,
        }),
    });
}

export function establishFramework() {
    return new ExtensionDevelopmentFrameworkBuilder()
        .withFrameworkId("edf-connect")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleConnectExtensionContract(): ConnectExtensionContract {
    return Object.freeze({
        id: "ASA-CONNECT",
        version: "1.0.0",
        domain: "ExternalIntegration",
        frameworkDomain: "CONNECT",
        authority: "REQUESTER",
        lifecycle: "VALIDATED",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
        ]),
        description: "ASA-CONNECT External Integration Boundary Layer",
        governanceOwner: "ASA-GOV-CONNECT",
        forbidsDecisionMaking: true,
        forbidsDirectExecution: true,
        forbidsCapabilityMutation: true,
        forbidsCapabilityOwnership: true,
        forbidsPolicyModification: true,
        forbidsCoreMutation: true,
        forbidsGovernanceMutation: true,
        forbidsRegistryMutation: true,
        forbidsWorkflowModification: true,
        requesterIsNotExecutionAuthority: true,
        permitsSubmitExternalRequest: true,
        permitsValidateExternalResponse: true,
        permitsTransformExternalData: true,
        permitsCreateIntegrationEvent: true,
    });
}

export function sampleConnectors(): ConnectorDefinition[] {
    return [
        Object.freeze({
            id: "conn.api.v1",
            type: "API",
            version: "1.0.0",
            endpoint: "https://example.invalid/api",
            capabilities: Object.freeze(["request.format", "response.receive"]),
            validationRules: Object.freeze(["schema.v1", "auth.required"]),
            securityPolicy: "tls.required",
            responsibility: "EXTERNAL_CONNECTION_MANAGEMENT",
            forbidsBusinessDecision: true,
            forbidsPolicyDecision: true,
            forbidsExecutionDecision: true,
            isNotCapabilityProvider: true,
        }),
        Object.freeze({
            id: "conn.db.v1",
            type: "DATABASE",
            version: "1.0.0",
            endpoint: "db://example.invalid/primary",
            capabilities: Object.freeze(["query.bound"]),
            validationRules: Object.freeze(["schema.v1"]),
            securityPolicy: "credential.ref.only",
            responsibility: "EXTERNAL_CONNECTION_MANAGEMENT",
            forbidsBusinessDecision: true,
            forbidsPolicyDecision: true,
            forbidsExecutionDecision: true,
            isNotCapabilityProvider: true,
        }),
        Object.freeze({
            id: "conn.file.v1",
            type: "FILE",
            version: "1.0.0",
            endpoint: "file://example.invalid/inbox",
            capabilities: Object.freeze(["file.receive"]),
            validationRules: Object.freeze(["path.allowlist"]),
            securityPolicy: "path.sandbox",
            responsibility: "EXTERNAL_CONNECTION_MANAGEMENT",
            forbidsBusinessDecision: true,
            forbidsPolicyDecision: true,
            forbidsExecutionDecision: true,
            isNotCapabilityProvider: true,
        }),
        Object.freeze({
            id: "conn.notify.v1",
            type: "NOTIFICATION",
            version: "1.0.0",
            endpoint: "notify://example.invalid/channel",
            capabilities: Object.freeze(["notify.deliver"]),
            validationRules: Object.freeze(["payload.size"]),
            securityPolicy: "token.ref.only",
            responsibility: "EXTERNAL_CONNECTION_MANAGEMENT",
            forbidsBusinessDecision: true,
            forbidsPolicyDecision: true,
            forbidsExecutionDecision: true,
            isNotCapabilityProvider: true,
        }),
    ];
}

export function sampleExternalData(): ExternalDataContract {
    return Object.freeze({
        contractId: "connect.external.data.v1",
        treatsExternalDataAsUntrusted: true,
        validationBeforeTrust: true,
        pipeline: Object.freeze([
            "EXTERNAL_DATA",
            "SCHEMA_VALIDATION",
            "INTEGRITY_VALIDATION",
            "NORMALIZATION",
            "BOUNDARY_CONTRACT",
        ] as const),
        requiredValidations: Object.freeze([
            "SCHEMA",
            "VERSION",
            "INTEGRITY",
            "COMPATIBILITY",
        ] as const),
    });
}

export function sampleTransformation(): DataTransformationContract {
    return Object.freeze({
        transformationId: "connect.transform.v1",
        responsibility: "DATA_CONVERSION",
        pipeline: Object.freeze([
            "EXTERNAL_FORMAT",
            "TRANSFORMATION",
            "OUTPUT_VALIDATION",
            "ASA_COMPATIBLE_FORMAT",
        ] as const),
        forbidsBusinessDecision: true,
        forbidsPolicyDecision: true,
        forbidsExecutionDecision: true,
    });
}

export function sampleRouter(): ConnectorRouterContract {
    return Object.freeze({
        routerId: "connect.router.v1",
        responsibility: "ENDPOINT_AND_CONNECTION_SELECTION",
        permitsEndpointSelection: true,
        permitsConnectionSelection: true,
        forbidsWorkflowSelection: true,
        forbidsPolicyDecision: true,
        isNotDecisionLayer: true,
    });
}

export function sampleAuthentication(): AuthenticationBoundary {
    return Object.freeze({
        boundaryId: "connect.auth.v1",
        materialKinds: Object.freeze([
            "API_KEY",
            "TOKEN",
            "CREDENTIAL",
            "SECRET_REFERENCE",
        ] as const),
        secretsRemainInsideConnectorBoundary: true,
        forbidsSecretToCoreContract: true,
        forbidsSecretToExtensionOutput: true,
    });
}

export function sampleSecretProtection(): SecretProtectionContract {
    return Object.freeze({
        protectionId: "connect.secret.v1",
        providesSecretHandlingBoundary: true,
        isNotSecretOwnership: true,
        creationDelegatedExternally: true,
        rotationDelegatedExternally: true,
        expirationDelegatedExternally: true,
        revocationDelegatedExternally: true,
        usageLimitedToConnectorConnection: true,
    });
}

export function sampleErrorContract(): ConnectorErrorContract {
    return Object.freeze({
        errorContractId: "connect.error.v1",
        externalErrorKinds: Object.freeze([
            "TIMEOUT",
            "AUTHENTICATION_FAILURE",
            "RATE_LIMIT",
            "SCHEMA_MISMATCH",
            "EXTERNAL_SERVICE_FAILURE",
            "CONNECTION_FAILURE",
        ] as const),
        classifications: Object.freeze([
            "TRANSIENT_ERROR",
            "PERMANENT_ERROR",
            "SECURITY_ERROR",
            "VALIDATION_ERROR",
        ] as const),
        pipeline: Object.freeze([
            "EXTERNAL_ERROR",
            "CONNECTOR_ERROR_CONTRACT",
            "ASA_ERROR_HANDLING",
        ] as const),
    });
}

export function sampleRequestGuard(): ExternalRequestGuard {
    return Object.freeze({
        guardId: "connect.guard.v1",
        protectionKinds: Object.freeze([
            "RATE_LIMIT",
            "REQUEST_VALIDATION",
            "PAYLOAD_SIZE",
            "ABUSE_PREVENTION",
        ] as const),
        authorityMode: "OBSERVATION_VALIDATION_ONLY",
        forbidsDecisionAuthority: true,
        forbidsExecutionAuthority: true,
        purpose: "EXTERNAL_DEPENDENCY_AND_ASA_BOUNDARY_PROTECTION",
    });
}

export function sampleOutbound(): OutboundConnectorBoundary {
    return Object.freeze({
        boundaryId: "connect.outbound.v1",
        pipeline: Object.freeze([
            "ASA",
            "BOUNDARY_CONTRACT",
            "CONNECTOR",
            "EXTERNAL_SYSTEM",
        ] as const),
        communicationKinds: Object.freeze([
            "NOTIFICATION_DELIVERY",
            "EXTERNAL_API_REQUEST",
            "EXTERNAL_DATA_EXPORT",
        ] as const),
        forbidsCoreDirectExternalAccess: true,
        requiresValidationAndSecurityBoundary: true,
    });
}

export function sampleLifecycle(): ConnectorLifecycleValidatorContract {
    return Object.freeze({
        lifecycleValidatorId: "connect.lifecycle.v1",
        allowedStates: Object.freeze([
            "PROPOSED",
            "DESIGNED",
            "VALIDATED",
            "ACTIVE",
            "STABLE",
            "FROZEN",
            "DEPRECATED",
        ] as const),
        requiresGovernanceValidation: true,
        isGovernanceManaged: true,
        forbidsIndividualImplementationJudgment: true,
    });
}

export function baseConnectValidator(): ConnectValidator {
    return new ConnectValidator()
        .withLayerId("connect-layer-ok")
        .withArchitectureVersion("ASA-ARCH-37.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withSourceFramework(establishFramework())
        .withExtensionContract(sampleConnectExtensionContract())
        .withConnectors(sampleConnectors())
        .withExternalData(sampleExternalData())
        .withTransformation(sampleTransformation())
        .withRouter(sampleRouter())
        .withAuthentication(sampleAuthentication())
        .withSecretProtection(sampleSecretProtection())
        .withErrorContract(sampleErrorContract())
        .withRequestGuard(sampleRequestGuard())
        .withOutboundBoundary(sampleOutbound())
        .withLifecycleValidator(sampleLifecycle());
}
