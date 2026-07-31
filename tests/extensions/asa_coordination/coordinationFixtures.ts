import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { CoordinationConfidenceContract } from "../../../src/extensions/asa_coordination/contracts/CoordinationConfidence";
import type { CoordinationContract } from "../../../src/extensions/asa_coordination/contracts/CoordinationContract";
import type { CoordinationPlanContract } from "../../../src/extensions/asa_coordination/contracts/CoordinationPlan";
import type { CoordinationResultContract } from "../../../src/extensions/asa_coordination/contracts/CoordinationResult";
import type { CoordinatorContract } from "../../../src/extensions/asa_coordination/coordinator/CoordinatorContract";
import type {
    CoordinationAiBoundary,
    CoordinationInputBoundary,
    CoordinationOutputBoundary,
    CoordinationProviderRole,
    CoordinationSecurityContract,
    ExtensionParticipationBoundary,
    HumanAuthorityPreservationBoundary,
    SelfCoordinationRestriction,
} from "../../../src/extensions/asa_coordination/coordinator/CoordinationProvider";
import { CoordinationValidator } from "../../../src/extensions/asa_coordination/CoordinationValidator";
import type { CoordinationMemoryContract } from "../../../src/extensions/asa_coordination/memory/CoordinationMemoryContract";
import type { CoordinatorDiscoveryContract } from "../../../src/extensions/asa_coordination/registry/CoordinatorDiscovery";
import type { CoordinatorRegistrationContract } from "../../../src/extensions/asa_coordination/registry/CoordinatorRegistration";
import type {
    CoordinationDeterminismPolicy,
    CoordinatorFallbackStrategyContract,
    CoordinatorLifecycleContract,
    CoordinatorSelectionContract,
} from "../../../src/extensions/asa_coordination/registry/CoordinatorSelection";
import type { CoordinationValidationBoundary } from "../../../src/extensions/asa_coordination/validation/CoordinationValidationBoundary";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "observe.metadata",
            "resolve.contract",
            "create.plan",
            "order.interaction",
            "aggregate",
            "report",
            "recommend",
            "request.review",
        ]),
        forbidsDirectCoreMutation: true as const,
        forbidsAdministratorAuthority: true as const,
    });
}

function sampleDescriptors(): ExtensionDescriptor[] {
    return [
        Object.freeze({
            id: "ASA-OPS",
            version: "1.0.0",
            domain: "OPS" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-AI"]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "OBSERVER" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
        Object.freeze({
            id: "ASA-AI",
            version: "1.0.0",
            domain: "AI" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze(["ASA-OPS"]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "ADVISOR" as const,
            dependency: Object.freeze([] as string[]),
            isolation: true as const,
        }),
    ];
}

function sampleMatrix(): ExtensionCompatibilityMatrixEntry[] {
    return [
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-OPS",
            extensionVersionRange: "1.x",
            contractVersion: "1.0.0",
        }),
        Object.freeze({
            coreVersion: "ASA-CORE-34.0",
            extensionId: "ASA-AI",
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
        .withGovernanceLayerId("egl-coordination")
        .withArchitectureVersion("ASA-ARCH-35.0")
        .withStructuralVersion("0.3")
        .withSchemaVersion("0.3")
        .withExtensionBoundaryContract(sampleBoundaryContract())
        .withExtensionDescriptors(sampleDescriptors())
        .withCompatibilityMatrix(sampleMatrix())
        .withRegressionBoundary(sampleRegression())
        .establish();
}

/**
 * Framework template uses frozen ExtensionDomainKind (OPS|AI|CONNECT)
 * and ExtensionAuthorityLevel ranks. COORDINATOR / COORDINATION are
 * declared on CoordinatorContract (local to ASA-ARCH-40.0).
 */
function sampleFrameworkTemplate(): ExtensionTemplateContract {
    return Object.freeze({
        metadata: Object.freeze({
            id: "ASA-COORDINATION",
            version: "1.0.0",
            domain: "OPS" as const,
            description:
                "Coordination development template host for ASA-ARCH-40.0 (Framework domain constrained to OPS|AI|CONNECT)",
            governanceOwner: "ASA-GOV-COORDINATION",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.coordination.input.v1"]),
            processingBoundaryId: "ext.coordination.processing.v1",
            outputContractIds: Object.freeze(["ext.coordination.output.v1"]),
            errorContract: Object.freeze({
                errorType: "COORDINATION_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true as const,
            forbidsGovernanceMutation: true as const,
        }),
        authority: Object.freeze({
            declaredAuthority: "OBSERVER" as const,
            approvedAuthority: "OBSERVER" as const,
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
        .withFrameworkId("edf-coordination")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleCoordinatorContract(): CoordinatorContract {
    return Object.freeze({
        id: "ASA-COORDINATION",
        version: "1.0.0",
        domain: "Coordination",
        frameworkDomain: "COORDINATION",
        authority: "COORDINATOR",
        lifecycle: "VALIDATED",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
            "ASA-ARCH-37.0",
            "ASA-ARCH-38.0",
            "ASA-ARCH-39.0",
        ]),
        description: "ASA-COORDINATION Extension Coordination Layer",
        governanceOwner: "ASA-GOV-COORDINATION",
        coordinationIsNotAuthority: true,
        coordinationIsNotExecution: true,
        routingIsNotExecution: true,
        sequenceIsNotControl: true,
        aggregationIsNotDecision: true,
        compositionIsNotMutation: true,
        coordinationPlanIsNotExecutionPlan: true,
        coordinationSequenceIsNotExecutionSequence: true,
        interactionOrderingIsNotExecutionOrdering: true,
        coordinationIsNotWorkflowExecution: true,
        coordinationIsNotGovernance: true,
        recommendationIsNotExecution: true,
        authorityIsMetadataOnly: true,
        forbidsExecute: true,
        forbidsInitiateCapabilityExecution: true,
        forbidsOverrideExtensionAuthority: true,
        forbidsExtensionContractMutation: true,
        forbidsCoreMutation: true,
        forbidsFrameworkMutation: true,
        forbidsGovernanceMutation: true,
        forbidsGrantAuthority: true,
        forbidsBypassValidation: true,
        forbidsRuntimeStateMutation: true,
        forbidsAutomaticDecisionMaking: true,
        forbidsAutomaticCorrection: true,
        forbidsAuthorityEscalation: true,
        permitsObserveExtensionMetadata: true,
        permitsResolveDeclaredContractReferences: true,
        permitsCreateCoordinationPlan: true,
        permitsDefineInteractionOrdering: true,
        permitsAggregateExtensionResults: true,
        permitsGenerateCoordinationReport: true,
        permitsGenerateInteractionRecommendation: true,
        permitsRequestReview: true,
    });
}

export function sampleCoordinationContract(): CoordinationContract {
    return Object.freeze({
        contractId: "coord.contract.v1",
        operations: Object.freeze([
            "coordinate",
            "resolveContractReference",
            "orderInteraction",
            "compose",
            "aggregate",
            "report",
        ] as const),
        technologyIndependent: true,
        forbidsVendorCoupling: true,
        forbidsExecute: true,
        forbidsMutate: true,
        forbidsAuthorize: true,
        forbidsAutonomousExecution: true,
    });
}

export function samplePlan(): CoordinationPlanContract {
    return Object.freeze({
        planContractId: "coord.plan.v1",
        requiredFields: Object.freeze([
            "id",
            "coordinationIntent",
            "participants",
            "interactionSequence",
            "constraints",
            "dependencies",
            "expectedInteractionResult",
            "timestamp",
        ] as const),
        interactionSequenceIsCoordinationRelationshipOnly: true,
        interactionSequenceIsNotExecutionOrder: true,
        planIsNotExecutionPlan: true,
    });
}

export function sampleResult(): CoordinationResultContract {
    return Object.freeze({
        resultContractId: "coord.result.v1",
        requiredFields: Object.freeze([
            "id",
            "planId",
            "status",
            "results",
            "findings",
            "timestamp",
            "coordinatorVersion",
        ] as const),
        allowedStatuses: Object.freeze([
            "STRUCTURED",
            "PARTIAL",
            "INCOMPLETE",
            "UNKNOWN",
        ] as const),
        structuredMeansStructureGenerated: true,
        structuredDoesNotMeanExecutionCompleted: true,
    });
}

export function sampleConfidence(): CoordinationConfidenceContract {
    return Object.freeze({
        confidenceContractId: "coord.confidence.v1",
        valueRange: "0.0_TO_1.0",
        requiredFields: Object.freeze([
            "value",
            "reason",
            "calculationMethod",
        ] as const),
        confidenceIsNotExecutionPermission: true,
        confidenceIsNotAuthority: true,
        confidenceIsNotDecisionConfidence: true,
    });
}

export function sampleProviderRole(): CoordinationProviderRole {
    return Object.freeze({
        roleId: "coord.provider.v1",
        composesExtensionInteractions: true,
        createsCoordinationPlans: true,
        resolvesDeclaredContractRelationships: true,
        aggregatesResults: true,
        providesCoordinationInformation: true,
        isNotExecutionProvider: true,
    });
}

export function sampleInput(): CoordinationInputBoundary {
    return Object.freeze({
        boundaryId: "coord.input.v1",
        allowedInputs: Object.freeze([
            "EXTENSION_METADATA",
            "EXTENSION_CONTRACT_DEFINITION",
            "DECLARED_CAPABILITY",
            "REGISTRY_INFORMATION",
            "VALIDATION_RESULT",
            "AI_PROPOSAL_REFERENCE",
            "OPS_OBSERVATION_REFERENCE",
            "CONNECT_DATA_REFERENCE",
            "GOVERNANCE_INPUT_SNAPSHOT",
            "HUMAN_INSTRUCTION",
        ] as const),
        inputIsReadOnly: true,
        consumesDeclaredContractsOnly: true,
        forbidsPrivateExtensionStateAccess: true,
        forbidsInferUndeclaredCapability: true,
        governanceSnapshotIsReferenceOnly: true,
        governanceSnapshotGrantsNoAuthority: true,
        governanceSnapshotImmutable: true,
        humanInstructionIsCoordinationIntentOnly: true,
        humanInstructionDoesNotBypassExtensionAuthority: true,
        humanInstructionOutsideExtensionAuthorityModel: true,
        humanInstructionIsNotAutomaticExecutionAuthorization: true,
    });
}

export function sampleOutput(): CoordinationOutputBoundary {
    return Object.freeze({
        boundaryId: "coord.output.v1",
        allowedOutputs: Object.freeze([
            "COORDINATION_PLAN",
            "COORDINATION_RESULT",
            "COORDINATION_REPORT",
            "INTERACTION_RECOMMENDATION",
            "REVIEW_REQUEST",
        ] as const),
        forbidsExecutionCommand: true,
        forbidsMutationRequest: true,
        forbidsPolicyMutation: true,
        forbidsRuntimeMutation: true,
        forbidsAuthorityChange: true,
        recommendationIsNotExecution: true,
        planIsNotExecutionPlan: true,
        forbidsAutomaticExecuteActions: true,
        forbidsGenerateExecutionPermission: true,
    });
}

export function sampleParticipation(): ExtensionParticipationBoundary {
    return Object.freeze({
        boundaryId: "coord.participation.v1",
        participatesViaDeclaredContract: true,
        participatesViaDeclaredCapability: true,
        participatesViaDeclaredMetadata: true,
        participationIsVoluntary: true,
        forbidsForceExtensionExecution: true,
        forbidsCreateExtensionAuthority: true,
        forbidsModifyExtensionOwnership: true,
        referencesOpsConnectAiValidationViaDeclaredContractsOnly: true,
        forbidsPrivateStateAccess: true,
        forbidsImplicitDependencyCreation: true,
    });
}

export function sampleHuman(): HumanAuthorityPreservationBoundary {
    return Object.freeze({
        boundaryId: "coord.human.v1",
        coordinatorCannotBecomeDecisionAuthority: true,
        coordinatorCannotReplaceHumanOrGovernanceAuthority: true,
        coordinatorCannotApproveOwnRecommendations: true,
        flowIsCoordinatorToPlanToOwnerToAuthorityDecision: true,
    });
}

export function sampleAi(): CoordinationAiBoundary {
    return Object.freeze({
        boundaryId: "coord.ai.v1",
        mayConsumeAiProposalReference: true,
        aiProposalIsNotCoordinationAuthority: true,
        aiOutputIsNotExecutionInstruction: true,
        forbidsEvaluateAiCorrectness: true,
        forbidsModifyAiDecisions: true,
        forbidsBecomeAiAuthority: true,
        forbidsGenerateAiExecutionInstruction: true,
    });
}

export function sampleSecurity(): CoordinationSecurityContract {
    return Object.freeze({
        securityContractId: "coord.security.v1",
        forbidsGrantPrivileges: true,
        forbidsBypassAuthentication: true,
        forbidsOverrideSecurityPolicy: true,
        forbidsModifyExtensionSecurity: true,
        forbidsHideCoordinationFailure: true,
        forbidsManipulateCoordinationResult: true,
        forbidsForgeCoordinationContext: true,
        forbidsSuppressExtensionFailure: true,
    });
}

export function sampleSelf(): SelfCoordinationRestriction {
    return Object.freeze({
        restrictionId: "coord.self.v1",
        forbidsApproveOwnAuthority: true,
        forbidsModifyOwnContract: true,
        forbidsCertifyOwnCorrectness: true,
        forbidsValidateOwnSecurityCompliance: true,
        forbidsValidateOwnCoordinationCorrectness: true,
        requiresIndependentValidation: true,
        independentAuthorityExternalToInstance: true,
    });
}

export function sampleMemory(): CoordinationMemoryContract {
    return Object.freeze({
        memoryContractId: "coord.memory.v1",
        layers: Object.freeze([
            "WORKING_COORDINATION_CONTEXT",
            "SESSION_COORDINATION_CONTEXT",
            "HISTORICAL_COORDINATION_RECORD",
        ] as const),
        memoryIsNotRuntimeState: true,
        memoryIsNotCoreState: true,
        memoryIsNotGovernanceState: true,
        memoryIsNotExecutionState: true,
        ownershipExplicitlyDeclared: true,
        memoryNeverBecomesCoreState: true,
        memoryNeverGrantsAuthority: true,
        historicalRecordRequiresRetentionPolicy: true,
        retentionPolicyGoverned: true,
        retentionDoesNotCreateAuthority: true,
        retentionPolicyReferenceOnly: true,
    });
}

export function sampleValidationBoundary(): CoordinationValidationBoundary {
    return Object.freeze({
        boundaryId: "coord.validation.v1",
        integratesWithAsaValidationReadOnly: true,
        mayValidateCoordinationPlanStructure: true,
        mayValidateCoordinationResultIntegrity: true,
        integrationIsReadOnly: true,
        validationResultIsNotCoordinationControl: true,
        validationFailureDoesNotAutomaticallyStopOrMutateCoordination: true,
        forbidsValidationControllingCoordinationAutomatically: true,
        forbidsValidationDependencyOwnership: true,
    });
}

export function sampleRegistration(): CoordinatorRegistrationContract {
    return Object.freeze({
        registrationContractId: "coord.registration.v1",
        operationLabel: "registerCoordinator",
        requiredFields: Object.freeze([
            "metadata",
            "authority",
            "capabilities",
            "version",
            "coordinationScope",
            "supportedContracts",
            "interactionPolicy",
            "securityProfile",
            "determinismProfile",
        ] as const),
        authorityMustBeCoordinator: true,
        authorityIsDescriptiveMetadataOnly: true,
        registrationDoesNotGrantOperationalAuthority: true,
    });
}

export function sampleDiscovery(): CoordinatorDiscoveryContract {
    return Object.freeze({
        discoveryContractId: "coord.discovery.v1",
        operationLabel: "discoverCoordinators",
        criteriaDeclaredStructurally: true,
        returnsMetadataReferencesOnly: true,
        consumesExtensionRegistryByReference: true,
        registryIsNotExecutionAuthority: true,
        forbidsInstantiateOrAuthorizeCoordinator: true,
        forbidsFrameworkMutation: true,
        isNotRuntimeDiscoveryEngine: true,
    });
}

export function sampleSelection(): CoordinatorSelectionContract {
    return Object.freeze({
        selectionContractId: "coord.selection.v1",
        operationLabel: "selectCoordinator",
        criteriaDeclaredStructurally: true,
        producesRecommendationOnly: true,
        forbidsGrantOperationalAuthority: true,
        forbidsAuthorityEscalation: true,
        forbidsAutonomousExecution: true,
        isNotRuntimeSelectionEngine: true,
    });
}

export function sampleFallback(): CoordinatorFallbackStrategyContract {
    return Object.freeze({
        fallbackContractId: "coord.fallback.v1",
        requiredFields: Object.freeze([
            "fallbackCoordinator",
            "manualCoordinationMode",
            "coordinationConfidence",
        ] as const),
        manualModePreservesHumanAuthority: true,
    });
}

export function sampleLifecycle(): CoordinatorLifecycleContract {
    return Object.freeze({
        lifecycleContractId: "coord.lifecycle.v1",
        allowedStates: Object.freeze([
            "Created",
            "Initialized",
            "Active",
            "Failed",
            "Suspended",
            "Reinitialized",
            "Terminated",
        ] as const),
        transitionsMustBeExplicit: true,
    });
}

export function sampleDeterminism(): CoordinationDeterminismPolicy {
    return Object.freeze({
        policyId: "coord.determinism.v1",
        requiredMetadata: Object.freeze([
            "coordinatorVersion",
            "contractVersion",
            "participantVersion",
            "interactionVersion",
            "contractResolutionVersion",
            "orderingRuleVersion",
            "environmentVersion",
            "configurationVersion",
            "timestamp",
        ] as const),
    });
}

export function baseCoordinationValidator(): CoordinationValidator {
    return new CoordinationValidator()
        .withLayerId("coord-layer-ok")
        .withArchitectureVersion("ASA-ARCH-40.0")
        .withStructuralVersion("0.4")
        .withSchemaVersion("0.4")
        .withSourceFramework(establishFramework())
        .withCoordinatorContract(sampleCoordinatorContract())
        .withCoordinationContract(sampleCoordinationContract())
        .withPlanContract(samplePlan())
        .withResultContract(sampleResult())
        .withConfidenceContract(sampleConfidence())
        .withProviderRole(sampleProviderRole())
        .withInputBoundary(sampleInput())
        .withOutputBoundary(sampleOutput())
        .withParticipationBoundary(sampleParticipation())
        .withHumanAuthorityBoundary(sampleHuman())
        .withAiBoundary(sampleAi())
        .withSecurityContract(sampleSecurity())
        .withSelfCoordinationRestriction(sampleSelf())
        .withMemoryContract(sampleMemory())
        .withValidationBoundary(sampleValidationBoundary())
        .withCoordinatorRegistration(sampleRegistration())
        .withCoordinatorDiscovery(sampleDiscovery())
        .withCoordinatorSelection(sampleSelection())
        .withFallbackStrategy(sampleFallback())
        .withLifecycleContract(sampleLifecycle())
        .withDeterminismPolicy(sampleDeterminism());
}
