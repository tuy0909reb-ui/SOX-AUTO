/**
 * ASA-ARCH-37.0 - ASA-CONNECT External Integration Boundary Layer (Draft 0.3)
 *
 * Public package exports.
 */

export {
    freezeAuthenticationBoundary,
    freezeSecretProtectionContract,
    type AuthenticationBoundary,
    type AuthenticationMaterialKind,
    type SecretProtectionContract,
} from "./AuthenticationBoundary";
export {
    AsaConnectLayer,
    type AsaConnectLayerId,
    type AsaConnectLayerMetadata,
    type AsaConnectLayerProps,
    type ConnectCapabilitySeparation,
    type ConnectCommunicationContract,
    type ConnectSecurityBoundary,
} from "./AsaConnectLayer";
export {
    freezeConnectExtensionContract,
    type AsaConnectDomainLabel,
    type AsaConnectExtensionId,
    type AsaConnectFrameworkDomain,
    type ConnectExtensionContract,
} from "./ConnectExtensionContract";
export {
    freezeConnectorDefinition,
    type ConnectorDefinition,
    type ConnectorType,
} from "./ConnectorDefinition";
export {
    freezeConnectorErrorContract,
    type ConnectorErrorClassification,
    type ConnectorErrorContract,
    type ConnectorExternalErrorKind,
} from "./ConnectorErrorContract";
export {
    freezeConnectorLifecycleValidatorContract,
    type ConnectorLifecycleValidatorContract,
} from "./ConnectorLifecycleValidator";
export {
    freezeConnectorRouterContract,
    type ConnectorRouterContract,
} from "./ConnectorRouter";
export { ConnectValidator } from "./ConnectValidator";
export {
    freezeDataTransformationContract,
    type DataTransformationContract,
} from "./DataTransformationContract";
export {
    freezeExternalDataContract,
    type ExternalDataContract,
    type ExternalDataValidationKind,
} from "./ExternalDataContract";
export {
    freezeExternalRequestGuard,
    type ExternalRequestGuard,
    type ExternalRequestProtectionKind,
} from "./ExternalRequestGuard";
export {
    freezeOutboundConnectorBoundary,
    type OutboundCommunicationKind,
    type OutboundConnectorBoundary,
} from "./OutboundConnectorBoundary";
