/**
 * ASA-ARCH-37.0 - ASA-CONNECT External Integration Boundary Layer (Draft 0.3)
 *
 * Immutable aggregate of CONNECT domain contracts.
 * External Integration Boundary Provider — not an Execution subject.
 *
 * SHALL NOT contain networking, connector runtime, scheduling,
 * or execution-control semantics.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type {
    AuthenticationBoundary,
    SecretProtectionContract,
} from "./AuthenticationBoundary";
import type { ConnectExtensionContract } from "./ConnectExtensionContract";
import type { ConnectorDefinition } from "./ConnectorDefinition";
import type { ConnectorErrorContract } from "./ConnectorErrorContract";
import type { ConnectorLifecycleValidatorContract } from "./ConnectorLifecycleValidator";
import type { ConnectorRouterContract } from "./ConnectorRouter";
import type { DataTransformationContract } from "./DataTransformationContract";
import type { ExternalDataContract } from "./ExternalDataContract";
import type { ExternalRequestGuard } from "./ExternalRequestGuard";
import type { OutboundConnectorBoundary } from "./OutboundConnectorBoundary";

/** Stable CONNECT layer identity. */
export type AsaConnectLayerId = string;

/**
 * Security Boundary — CONNECT holds no Decision / Policy / Execution Authority.
 */
export interface ConnectSecurityBoundary {
    readonly holdsDecisionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsConnectionResponsibility: true;
    readonly holdsValidationResponsibility: true;
    readonly holdsTransformationResponsibility: true;
}

/**
 * Capability Binding Separation — Connector is not Capability.
 */
export interface ConnectCapabilitySeparation {
    readonly connectorIsNotCapability: true;
    readonly forbidsExternalApiCapabilityRegistration: true;
    readonly forbidsConnectorCapabilityOwnership: true;
    readonly permitsCapabilityRequestViaExecutionBoundary: true;
}

/**
 * Extension / External Communication Contract.
 */
export interface ConnectCommunicationContract {
    readonly requiresAuthorityValidation: true;
    readonly requiresCompatibilityValidation: true;
    readonly requiresSchemaValidation: true;
    readonly requiresBoundaryContract: true;
    readonly forbidsDirectExtensionInternalAccess: true;
    readonly forbidsExternalDirectCoreAccess: true;
}

/**
 * Structural metadata only.
 */
export interface AsaConnectLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly preservesOpsContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Immutable CONNECT layer props.
 */
export interface AsaConnectLayerProps {
    readonly identity: {
        readonly layerId: AsaConnectLayerId;
        readonly extensionId: "ASA-CONNECT";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaConnectLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ConnectExtensionContract;
    readonly connectors: ReadonlyArray<ConnectorDefinition>;
    readonly externalData: ExternalDataContract;
    readonly transformation: DataTransformationContract;
    readonly router: ConnectorRouterContract;
    readonly authentication: AuthenticationBoundary;
    readonly secretProtection: SecretProtectionContract;
    readonly errorContract: ConnectorErrorContract;
    readonly requestGuard: ExternalRequestGuard;
    readonly outboundBoundary: OutboundConnectorBoundary;
    readonly lifecycleValidator: ConnectorLifecycleValidatorContract;
    readonly securityBoundary: ConnectSecurityBoundary;
    readonly capabilitySeparation: ConnectCapabilitySeparation;
    readonly communicationContract: ConnectCommunicationContract;
}

/**
 * Immutable ASA-CONNECT External Integration Boundary Layer.
 */
export class AsaConnectLayer implements AsaConnectLayerProps {
    readonly identity: AsaConnectLayerProps["identity"];
    readonly metadata: AsaConnectLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: ConnectExtensionContract;
    readonly connectors: ReadonlyArray<ConnectorDefinition>;
    readonly externalData: ExternalDataContract;
    readonly transformation: DataTransformationContract;
    readonly router: ConnectorRouterContract;
    readonly authentication: AuthenticationBoundary;
    readonly secretProtection: SecretProtectionContract;
    readonly errorContract: ConnectorErrorContract;
    readonly requestGuard: ExternalRequestGuard;
    readonly outboundBoundary: OutboundConnectorBoundary;
    readonly lifecycleValidator: ConnectorLifecycleValidatorContract;
    readonly securityBoundary: ConnectSecurityBoundary;
    readonly capabilitySeparation: ConnectCapabilitySeparation;
    readonly communicationContract: ConnectCommunicationContract;

    /**
     * Package-internal constructor.
     * Prefer ConnectValidator.establish().
     */
    constructor(init: AsaConnectLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.extensionContract = init.extensionContract;
        this.connectors = Object.freeze([...init.connectors]);
        this.externalData = init.externalData;
        this.transformation = init.transformation;
        this.router = init.router;
        this.authentication = init.authentication;
        this.secretProtection = init.secretProtection;
        this.errorContract = init.errorContract;
        this.requestGuard = init.requestGuard;
        this.outboundBoundary = init.outboundBoundary;
        this.lifecycleValidator = init.lifecycleValidator;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.capabilitySeparation = Object.freeze({
            ...init.capabilitySeparation,
        });
        this.communicationContract = Object.freeze({
            ...init.communicationContract,
        });
        Object.freeze(this);
    }
}
