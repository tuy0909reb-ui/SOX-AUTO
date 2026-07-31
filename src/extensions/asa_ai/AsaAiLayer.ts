/**
 * ASA-ARCH-38.0 - ASA-AI Extension Intelligence Layer model (Draft 0.5)
 *
 * Immutable aggregate of AI domain contracts.
 * Advisor / Proposal provider — not an Execution subject.
 *
 * SHALL NOT contain inference, model loading, networking,
 * discovery engines, or selection engines.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { AiExtensionContract } from "./AiExtensionContract";
import type {
    AiLearningBoundary,
    AiInputOutputBoundary,
    AiMemoryContract,
} from "./AiMemoryContract";
import type {
    AiAssumptionContract,
    AiConfidenceContract,
    AiEvidenceContract,
    AiProposalContract,
    AiUncertaintyContract,
} from "./AiProposalContract";
import type {
    AiFallbackStrategyContract,
    AiLifecycleContract,
    AiProviderDiscoveryContract,
    AiProviderRegistrationContract,
    AiProviderSelectionContract,
} from "./AiProviderRegistration";
import type {
    AiRuntimeBoundary,
    AiSessionContract,
} from "./AiRuntimeBoundary";
import type {
    AiAuditContract,
    AiDeterminismPolicy,
    AiSecurityContract,
    AiTraceabilityContract,
} from "./AiSecurityContract";
import type { IntelligenceContract } from "./IntelligenceContract";

/** Stable AI layer identity. */
export type AsaAiLayerId = string;

/**
 * Security / authority boundary summary for AI layer.
 */
export interface AiLayerSecurityBoundary {
    readonly holdsDecisionAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly holdsAdvisorResponsibility: true;
    readonly forbidsAuthorityEscalation: true;
}

/**
 * Sibling extension independence declaration.
 */
export interface AiSiblingIndependence {
    readonly peerToOps: true;
    readonly peerToConnect: true;
    readonly forbidsOpsDependencyOwnership: true;
    readonly forbidsConnectDependencyOwnership: true;
    readonly forbidsCoreIntrusion: true;
}

/**
 * Structural metadata only.
 */
export interface AsaAiLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly preservesOpsContract: true;
    readonly preservesConnectContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Immutable AI layer props.
 */
export interface AsaAiLayerProps {
    readonly identity: {
        readonly layerId: AsaAiLayerId;
        readonly extensionId: "ASA-AI";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaAiLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: AiExtensionContract;
    readonly intelligenceContract: IntelligenceContract;
    readonly runtimeBoundary: AiRuntimeBoundary;
    readonly sessionContract: AiSessionContract;
    readonly proposalContract: AiProposalContract;
    readonly evidenceContract: AiEvidenceContract;
    readonly assumptionContract: AiAssumptionContract;
    readonly confidenceContract: AiConfidenceContract;
    readonly uncertaintyContract: AiUncertaintyContract;
    readonly memoryContract: AiMemoryContract;
    readonly learningBoundary: AiLearningBoundary;
    readonly inputOutputBoundary: AiInputOutputBoundary;
    readonly securityContract: AiSecurityContract;
    readonly auditContract: AiAuditContract;
    readonly traceabilityContract: AiTraceabilityContract;
    readonly determinismPolicy: AiDeterminismPolicy;
    readonly providerRegistration: AiProviderRegistrationContract;
    readonly providerDiscovery: AiProviderDiscoveryContract;
    readonly providerSelection: AiProviderSelectionContract;
    readonly fallbackStrategy: AiFallbackStrategyContract;
    readonly lifecycleContract: AiLifecycleContract;
    readonly securityBoundary: AiLayerSecurityBoundary;
    readonly siblingIndependence: AiSiblingIndependence;
}

/**
 * Immutable ASA-AI Extension Intelligence Layer.
 */
export class AsaAiLayer implements AsaAiLayerProps {
    readonly identity: AsaAiLayerProps["identity"];
    readonly metadata: AsaAiLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly extensionContract: AiExtensionContract;
    readonly intelligenceContract: IntelligenceContract;
    readonly runtimeBoundary: AiRuntimeBoundary;
    readonly sessionContract: AiSessionContract;
    readonly proposalContract: AiProposalContract;
    readonly evidenceContract: AiEvidenceContract;
    readonly assumptionContract: AiAssumptionContract;
    readonly confidenceContract: AiConfidenceContract;
    readonly uncertaintyContract: AiUncertaintyContract;
    readonly memoryContract: AiMemoryContract;
    readonly learningBoundary: AiLearningBoundary;
    readonly inputOutputBoundary: AiInputOutputBoundary;
    readonly securityContract: AiSecurityContract;
    readonly auditContract: AiAuditContract;
    readonly traceabilityContract: AiTraceabilityContract;
    readonly determinismPolicy: AiDeterminismPolicy;
    readonly providerRegistration: AiProviderRegistrationContract;
    readonly providerDiscovery: AiProviderDiscoveryContract;
    readonly providerSelection: AiProviderSelectionContract;
    readonly fallbackStrategy: AiFallbackStrategyContract;
    readonly lifecycleContract: AiLifecycleContract;
    readonly securityBoundary: AiLayerSecurityBoundary;
    readonly siblingIndependence: AiSiblingIndependence;

    /**
     * Package-internal constructor.
     * Prefer AiValidator.establish().
     */
    constructor(init: AsaAiLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.extensionContract = init.extensionContract;
        this.intelligenceContract = init.intelligenceContract;
        this.runtimeBoundary = init.runtimeBoundary;
        this.sessionContract = init.sessionContract;
        this.proposalContract = init.proposalContract;
        this.evidenceContract = init.evidenceContract;
        this.assumptionContract = init.assumptionContract;
        this.confidenceContract = init.confidenceContract;
        this.uncertaintyContract = init.uncertaintyContract;
        this.memoryContract = init.memoryContract;
        this.learningBoundary = init.learningBoundary;
        this.inputOutputBoundary = init.inputOutputBoundary;
        this.securityContract = init.securityContract;
        this.auditContract = init.auditContract;
        this.traceabilityContract = init.traceabilityContract;
        this.determinismPolicy = init.determinismPolicy;
        this.providerRegistration = init.providerRegistration;
        this.providerDiscovery = init.providerDiscovery;
        this.providerSelection = init.providerSelection;
        this.fallbackStrategy = init.fallbackStrategy;
        this.lifecycleContract = init.lifecycleContract;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.siblingIndependence = Object.freeze({
            ...init.siblingIndependence,
        });
        Object.freeze(this);
    }
}
