/**
 * ASA-ARCH-38.0 - ASA-AI Extension Intelligence Layer (Draft 0.5)
 *
 * Public package exports.
 */

export {
    AsaAiLayer,
    type AsaAiLayerId,
    type AsaAiLayerMetadata,
    type AsaAiLayerProps,
    type AiLayerSecurityBoundary,
    type AiSiblingIndependence,
} from "./AsaAiLayer";
export {
    freezeAiExtensionContract,
    type AiExtensionContract,
    type AsaAiDomainLabel,
    type AsaAiExtensionId,
    type AsaAiFrameworkDomain,
} from "./AiExtensionContract";
export {
    freezeAiInputOutputBoundary,
    freezeAiLearningBoundary,
    freezeAiMemoryContract,
    type AiInputKind,
    type AiInputOutputBoundary,
    type AiLearningBoundary,
    type AiLearningKind,
    type AiMemoryContract,
    type AiMemoryLayerKind,
    type AiOutputKind,
} from "./AiMemoryContract";
export {
    freezeAiAssumptionContract,
    freezeAiConfidenceContract,
    freezeAiEvidenceContract,
    freezeAiProposalContract,
    freezeAiUncertaintyContract,
    type AiAssumptionContract,
    type AiConfidenceContract,
    type AiEvidenceContract,
    type AiEvidenceType,
    type AiProposalContract,
    type AiProposalField,
    type AiUncertaintyContract,
} from "./AiProposalContract";
export {
    freezeAiFallbackStrategyContract,
    freezeAiLifecycleContract,
    freezeAiProviderDiscoveryContract,
    freezeAiProviderRegistrationContract,
    freezeAiProviderSelectionContract,
    type AiFallbackStrategyContract,
    type AiLifecycleContract,
    type AiProviderDiscoveryContract,
    type AiProviderLifecycleState,
    type AiProviderRegistrationContract,
    type AiProviderSelectionContract,
} from "./AiProviderRegistration";
export {
    freezeAiRuntimeBoundary,
    freezeAiSessionContract,
    type AiRuntimeBoundary,
    type AiRuntimeLayerKind,
    type AiSessionContract,
} from "./AiRuntimeBoundary";
export {
    freezeAiAuditContract,
    freezeAiDeterminismPolicy,
    freezeAiSecurityContract,
    freezeAiTraceabilityContract,
    type AiAuditContract,
    type AiDeterminismPolicy,
    type AiSecurityContract,
    type AiSecurityThreatKind,
    type AiTraceabilityContract,
} from "./AiSecurityContract";
export { AiValidator } from "./AiValidator";
export {
    freezeIntelligenceContract,
    type IntelligenceContract,
    type IntelligenceOperation,
} from "./IntelligenceContract";
