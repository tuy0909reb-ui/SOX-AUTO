/**
 * ASA-ARCH-40.0 - ASA-COORDINATION Extension Coordination Layer (Draft 0.4)
 *
 * Immutable aggregate of Coordination domain contracts.
 * Coordinator provider — not an Execution subject.
 *
 * SHALL NOT contain routing, execution, workflow, discovery,
 * or selection engines.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import type { CoordinationConfidenceContract } from "./contracts/CoordinationConfidence";
import type { CoordinationContract } from "./contracts/CoordinationContract";
import type { CoordinationPlanContract } from "./contracts/CoordinationPlan";
import type { CoordinationResultContract } from "./contracts/CoordinationResult";
import type { CoordinatorContract } from "./coordinator/CoordinatorContract";
import type {
    CoordinationAiBoundary,
    CoordinationInputBoundary,
    CoordinationOutputBoundary,
    CoordinationProviderRole,
    CoordinationSecurityContract,
    ExtensionParticipationBoundary,
    HumanAuthorityPreservationBoundary,
    SelfCoordinationRestriction,
} from "./coordinator/CoordinationProvider";
import type { CoordinationMemoryContract } from "./memory/CoordinationMemoryContract";
import type { CoordinatorDiscoveryContract } from "./registry/CoordinatorDiscovery";
import type { CoordinatorRegistrationContract } from "./registry/CoordinatorRegistration";
import type {
    CoordinationDeterminismPolicy,
    CoordinatorFallbackStrategyContract,
    CoordinatorLifecycleContract,
    CoordinatorSelectionContract,
} from "./registry/CoordinatorSelection";
import type { CoordinationValidationBoundary } from "./validation/CoordinationValidationBoundary";

/** Stable Coordination layer identity. */
export type AsaCoordinationLayerId = string;

/**
 * Security / authority boundary summary.
 */
export interface CoordinationLayerSecurityBoundary {
    readonly holdsDecisionAuthority: false;
    readonly holdsExecutionAuthority: false;
    readonly holdsPolicyAuthority: false;
    readonly holdsCoordinatorResponsibility: true;
    readonly forbidsAuthorityEscalation: true;
}

/**
 * Sibling extension independence declaration.
 */
export interface CoordinationSiblingIndependence {
    readonly peerToOps: true;
    readonly peerToConnect: true;
    readonly peerToAi: true;
    readonly peerToValidation: true;
    readonly forbidsOpsDependencyOwnership: true;
    readonly forbidsConnectDependencyOwnership: true;
    readonly forbidsAiDependencyOwnership: true;
    readonly forbidsValidationDependencyOwnership: true;
    readonly forbidsCoreIntrusion: true;
}

/**
 * Structural metadata only.
 */
export interface AsaCoordinationLayerMetadata {
    readonly architectureVersion: string;
    readonly schemaVersion: string;
    readonly layerStatus: "established";
    readonly preservesCoreContract: true;
    readonly preservesGovernanceContract: true;
    readonly preservesFrameworkContract: true;
    readonly preservesOpsContract: true;
    readonly preservesConnectContract: true;
    readonly preservesAiContract: true;
    readonly preservesValidationContract: true;
    readonly creationTimestamp?: string;
    readonly producerIdentity?: string;
}

/**
 * Immutable Coordination layer props.
 */
export interface AsaCoordinationLayerProps {
    readonly identity: {
        readonly layerId: AsaCoordinationLayerId;
        readonly extensionId: "ASA-COORDINATION";
        readonly coreVersion: "ASA-CORE-34.0";
        readonly architectureVersion: string;
        readonly structuralVersion: string;
        readonly sourceFrameworkId: string;
    };
    readonly metadata: AsaCoordinationLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly coordinatorContract: CoordinatorContract;
    readonly coordinationContract: CoordinationContract;
    readonly planContract: CoordinationPlanContract;
    readonly resultContract: CoordinationResultContract;
    readonly confidenceContract: CoordinationConfidenceContract;
    readonly providerRole: CoordinationProviderRole;
    readonly inputBoundary: CoordinationInputBoundary;
    readonly outputBoundary: CoordinationOutputBoundary;
    readonly participationBoundary: ExtensionParticipationBoundary;
    readonly humanAuthorityBoundary: HumanAuthorityPreservationBoundary;
    readonly aiBoundary: CoordinationAiBoundary;
    readonly securityContract: CoordinationSecurityContract;
    readonly selfCoordinationRestriction: SelfCoordinationRestriction;
    readonly memoryContract: CoordinationMemoryContract;
    readonly validationBoundary: CoordinationValidationBoundary;
    readonly coordinatorRegistration: CoordinatorRegistrationContract;
    readonly coordinatorDiscovery: CoordinatorDiscoveryContract;
    readonly coordinatorSelection: CoordinatorSelectionContract;
    readonly fallbackStrategy: CoordinatorFallbackStrategyContract;
    readonly lifecycleContract: CoordinatorLifecycleContract;
    readonly determinismPolicy: CoordinationDeterminismPolicy;
    readonly securityBoundary: CoordinationLayerSecurityBoundary;
    readonly siblingIndependence: CoordinationSiblingIndependence;
}

/**
 * Immutable ASA-COORDINATION Extension Coordination Layer.
 */
export class AsaCoordinationLayer implements AsaCoordinationLayerProps {
    readonly identity: AsaCoordinationLayerProps["identity"];
    readonly metadata: AsaCoordinationLayerMetadata;
    readonly sourceFramework: ExtensionDevelopmentFramework;
    readonly coordinatorContract: CoordinatorContract;
    readonly coordinationContract: CoordinationContract;
    readonly planContract: CoordinationPlanContract;
    readonly resultContract: CoordinationResultContract;
    readonly confidenceContract: CoordinationConfidenceContract;
    readonly providerRole: CoordinationProviderRole;
    readonly inputBoundary: CoordinationInputBoundary;
    readonly outputBoundary: CoordinationOutputBoundary;
    readonly participationBoundary: ExtensionParticipationBoundary;
    readonly humanAuthorityBoundary: HumanAuthorityPreservationBoundary;
    readonly aiBoundary: CoordinationAiBoundary;
    readonly securityContract: CoordinationSecurityContract;
    readonly selfCoordinationRestriction: SelfCoordinationRestriction;
    readonly memoryContract: CoordinationMemoryContract;
    readonly validationBoundary: CoordinationValidationBoundary;
    readonly coordinatorRegistration: CoordinatorRegistrationContract;
    readonly coordinatorDiscovery: CoordinatorDiscoveryContract;
    readonly coordinatorSelection: CoordinatorSelectionContract;
    readonly fallbackStrategy: CoordinatorFallbackStrategyContract;
    readonly lifecycleContract: CoordinatorLifecycleContract;
    readonly determinismPolicy: CoordinationDeterminismPolicy;
    readonly securityBoundary: CoordinationLayerSecurityBoundary;
    readonly siblingIndependence: CoordinationSiblingIndependence;

    /**
     * Package-internal constructor.
     * Prefer CoordinationValidator.establish().
     */
    constructor(init: AsaCoordinationLayerProps) {
        this.identity = Object.freeze({ ...init.identity });
        this.metadata = Object.freeze({ ...init.metadata });
        this.sourceFramework = init.sourceFramework;
        this.coordinatorContract = init.coordinatorContract;
        this.coordinationContract = init.coordinationContract;
        this.planContract = init.planContract;
        this.resultContract = init.resultContract;
        this.confidenceContract = init.confidenceContract;
        this.providerRole = init.providerRole;
        this.inputBoundary = init.inputBoundary;
        this.outputBoundary = init.outputBoundary;
        this.participationBoundary = init.participationBoundary;
        this.humanAuthorityBoundary = init.humanAuthorityBoundary;
        this.aiBoundary = init.aiBoundary;
        this.securityContract = init.securityContract;
        this.selfCoordinationRestriction = init.selfCoordinationRestriction;
        this.memoryContract = init.memoryContract;
        this.validationBoundary = init.validationBoundary;
        this.coordinatorRegistration = init.coordinatorRegistration;
        this.coordinatorDiscovery = init.coordinatorDiscovery;
        this.coordinatorSelection = init.coordinatorSelection;
        this.fallbackStrategy = init.fallbackStrategy;
        this.lifecycleContract = init.lifecycleContract;
        this.determinismPolicy = init.determinismPolicy;
        this.securityBoundary = Object.freeze({ ...init.securityBoundary });
        this.siblingIndependence = Object.freeze({
            ...init.siblingIndependence,
        });
        Object.freeze(this);
    }
}
