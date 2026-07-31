/**
 * ASA-ARCH-40.0 - ASA-COORDINATION Establishment Builder (Draft 0.4)
 *
 * Establishes the immutable ASA-COORDINATION Extension Coordination Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, Framework, or frozen Extensions 36–39.
 *
 * Performs structural validation only — not a coordination / discovery engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import {
    AsaCoordinationLayer,
    type AsaCoordinationLayerMetadata,
    type CoordinationLayerSecurityBoundary,
    type CoordinationSiblingIndependence,
} from "./AsaCoordinationLayer";
import {
    freezeCoordinationConfidenceContract,
    type CoordinationConfidenceContract,
} from "./contracts/CoordinationConfidence";
import {
    freezeCoordinationContract,
    type CoordinationContract,
    type CoordinationOperation,
} from "./contracts/CoordinationContract";
import {
    freezeCoordinationPlanContract,
    type CoordinationPlanContract,
    type CoordinationPlanField,
} from "./contracts/CoordinationPlan";
import {
    freezeCoordinationResultContract,
    type CoordinationResultContract,
    type CoordinationResultField,
    type CoordinationResultStatus,
} from "./contracts/CoordinationResult";
import {
    freezeCoordinatorContract,
    type CoordinatorContract,
} from "./coordinator/CoordinatorContract";
import {
    freezeCoordinationAiBoundary,
    freezeCoordinationInputBoundary,
    freezeCoordinationOutputBoundary,
    freezeCoordinationProviderRole,
    freezeCoordinationSecurityContract,
    freezeExtensionParticipationBoundary,
    freezeHumanAuthorityPreservationBoundary,
    freezeSelfCoordinationRestriction,
    type CoordinationAiBoundary,
    type CoordinationInputBoundary,
    type CoordinationInputKind,
    type CoordinationOutputBoundary,
    type CoordinationOutputKind,
    type CoordinationProviderRole,
    type CoordinationSecurityContract,
    type ExtensionParticipationBoundary,
    type HumanAuthorityPreservationBoundary,
    type SelfCoordinationRestriction,
} from "./coordinator/CoordinationProvider";
import {
    freezeCoordinationMemoryContract,
    type CoordinationMemoryContract,
    type CoordinationMemoryLayerKind,
} from "./memory/CoordinationMemoryContract";
import {
    freezeCoordinatorDiscoveryContract,
    type CoordinatorDiscoveryContract,
} from "./registry/CoordinatorDiscovery";
import {
    freezeCoordinatorRegistrationContract,
    type CoordinatorRegistrationContract,
} from "./registry/CoordinatorRegistration";
import {
    freezeCoordinationDeterminismPolicy,
    freezeCoordinatorFallbackStrategyContract,
    freezeCoordinatorLifecycleContract,
    freezeCoordinatorSelectionContract,
    type CoordinationDeterminismPolicy,
    type CoordinatorFallbackStrategyContract,
    type CoordinatorLifecycleContract,
    type CoordinatorLifecycleState,
    type CoordinatorSelectionContract,
} from "./registry/CoordinatorSelection";
import {
    freezeCoordinationValidationBoundary,
    type CoordinationValidationBoundary,
} from "./validation/CoordinationValidationBoundary";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";

const REQUIRED_OPS: ReadonlyArray<CoordinationOperation> = [
    "coordinate",
    "resolveContractReference",
    "orderInteraction",
    "compose",
    "aggregate",
    "report",
];
const REQUIRED_PLAN_FIELDS: ReadonlyArray<CoordinationPlanField> = [
    "id",
    "coordinationIntent",
    "participants",
    "interactionSequence",
    "constraints",
    "dependencies",
    "expectedInteractionResult",
    "timestamp",
];
const REQUIRED_RESULT_FIELDS: ReadonlyArray<CoordinationResultField> = [
    "id",
    "planId",
    "status",
    "results",
    "findings",
    "timestamp",
    "coordinatorVersion",
];
const REQUIRED_STATUSES: ReadonlyArray<CoordinationResultStatus> = [
    "STRUCTURED",
    "PARTIAL",
    "INCOMPLETE",
    "UNKNOWN",
];
const REQUIRED_CONFIDENCE_FIELDS = [
    "value",
    "reason",
    "calculationMethod",
] as const;
const REQUIRED_INPUTS: ReadonlyArray<CoordinationInputKind> = [
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
];
const REQUIRED_OUTPUTS: ReadonlyArray<CoordinationOutputKind> = [
    "COORDINATION_PLAN",
    "COORDINATION_RESULT",
    "COORDINATION_REPORT",
    "INTERACTION_RECOMMENDATION",
    "REVIEW_REQUEST",
];
const REQUIRED_MEMORY: ReadonlyArray<CoordinationMemoryLayerKind> = [
    "WORKING_COORDINATION_CONTEXT",
    "SESSION_COORDINATION_CONTEXT",
    "HISTORICAL_COORDINATION_RECORD",
];
const REQUIRED_REG_FIELDS = [
    "metadata",
    "authority",
    "capabilities",
    "version",
    "coordinationScope",
    "supportedContracts",
    "interactionPolicy",
    "securityProfile",
    "determinismProfile",
] as const;
const REQUIRED_FALLBACK = [
    "fallbackCoordinator",
    "manualCoordinationMode",
    "coordinationConfidence",
] as const;
const REQUIRED_DETERMINISM = [
    "coordinatorVersion",
    "contractVersion",
    "participantVersion",
    "interactionVersion",
    "contractResolutionVersion",
    "orderingRuleVersion",
    "environmentVersion",
    "configurationVersion",
    "timestamp",
] as const;
const REQUIRED_LIFECYCLE: ReadonlyArray<CoordinatorLifecycleState> = [
    "Created",
    "Initialized",
    "Active",
    "Failed",
    "Suspended",
    "Reinitialized",
    "Terminated",
];

/**
 * Structural validator that establishes the ASA-COORDINATION layer.
 */
export class CoordinationValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private coordinatorContract: CoordinatorContract | undefined;
    private coordinationContract: CoordinationContract | undefined;
    private planContract: CoordinationPlanContract | undefined;
    private resultContract: CoordinationResultContract | undefined;
    private confidenceContract: CoordinationConfidenceContract | undefined;
    private providerRole: CoordinationProviderRole | undefined;
    private inputBoundary: CoordinationInputBoundary | undefined;
    private outputBoundary: CoordinationOutputBoundary | undefined;
    private participationBoundary: ExtensionParticipationBoundary | undefined;
    private humanAuthorityBoundary: HumanAuthorityPreservationBoundary | undefined;
    private aiBoundary: CoordinationAiBoundary | undefined;
    private securityContract: CoordinationSecurityContract | undefined;
    private selfCoordinationRestriction: SelfCoordinationRestriction | undefined;
    private memoryContract: CoordinationMemoryContract | undefined;
    private validationBoundary: CoordinationValidationBoundary | undefined;
    private coordinatorRegistration: CoordinatorRegistrationContract | undefined;
    private coordinatorDiscovery: CoordinatorDiscoveryContract | undefined;
    private coordinatorSelection: CoordinatorSelectionContract | undefined;
    private fallbackStrategy: CoordinatorFallbackStrategyContract | undefined;
    private lifecycleContract: CoordinatorLifecycleContract | undefined;
    private determinismPolicy: CoordinationDeterminismPolicy | undefined;

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
    withCoordinatorContract(coordinatorContract: CoordinatorContract): this {
        this.coordinatorContract = coordinatorContract;
        return this;
    }
    withCoordinationContract(
        coordinationContract: CoordinationContract
    ): this {
        this.coordinationContract = coordinationContract;
        return this;
    }
    withPlanContract(planContract: CoordinationPlanContract): this {
        this.planContract = planContract;
        return this;
    }
    withResultContract(resultContract: CoordinationResultContract): this {
        this.resultContract = resultContract;
        return this;
    }
    withConfidenceContract(
        confidenceContract: CoordinationConfidenceContract
    ): this {
        this.confidenceContract = confidenceContract;
        return this;
    }
    withProviderRole(providerRole: CoordinationProviderRole): this {
        this.providerRole = providerRole;
        return this;
    }
    withInputBoundary(inputBoundary: CoordinationInputBoundary): this {
        this.inputBoundary = inputBoundary;
        return this;
    }
    withOutputBoundary(outputBoundary: CoordinationOutputBoundary): this {
        this.outputBoundary = outputBoundary;
        return this;
    }
    withParticipationBoundary(
        participationBoundary: ExtensionParticipationBoundary
    ): this {
        this.participationBoundary = participationBoundary;
        return this;
    }
    withHumanAuthorityBoundary(
        humanAuthorityBoundary: HumanAuthorityPreservationBoundary
    ): this {
        this.humanAuthorityBoundary = humanAuthorityBoundary;
        return this;
    }
    withAiBoundary(aiBoundary: CoordinationAiBoundary): this {
        this.aiBoundary = aiBoundary;
        return this;
    }
    withSecurityContract(securityContract: CoordinationSecurityContract): this {
        this.securityContract = securityContract;
        return this;
    }
    withSelfCoordinationRestriction(
        selfCoordinationRestriction: SelfCoordinationRestriction
    ): this {
        this.selfCoordinationRestriction = selfCoordinationRestriction;
        return this;
    }
    withMemoryContract(memoryContract: CoordinationMemoryContract): this {
        this.memoryContract = memoryContract;
        return this;
    }
    withValidationBoundary(
        validationBoundary: CoordinationValidationBoundary
    ): this {
        this.validationBoundary = validationBoundary;
        return this;
    }
    withCoordinatorRegistration(
        coordinatorRegistration: CoordinatorRegistrationContract
    ): this {
        this.coordinatorRegistration = coordinatorRegistration;
        return this;
    }
    withCoordinatorDiscovery(
        coordinatorDiscovery: CoordinatorDiscoveryContract
    ): this {
        this.coordinatorDiscovery = coordinatorDiscovery;
        return this;
    }
    withCoordinatorSelection(
        coordinatorSelection: CoordinatorSelectionContract
    ): this {
        this.coordinatorSelection = coordinatorSelection;
        return this;
    }
    withFallbackStrategy(
        fallbackStrategy: CoordinatorFallbackStrategyContract
    ): this {
        this.fallbackStrategy = fallbackStrategy;
        return this;
    }
    withLifecycleContract(lifecycleContract: CoordinatorLifecycleContract): this {
        this.lifecycleContract = lifecycleContract;
        return this;
    }
    withDeterminismPolicy(determinismPolicy: CoordinationDeterminismPolicy): this {
        this.determinismPolicy = determinismPolicy;
        return this;
    }

    establish(): AsaCoordinationLayer {
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
                "ASA-COORDINATION establishment failed: exactly one source Extension Development Framework is required"
            );
        }
        const framework = this.sourceFramework;
        if (!Object.isFrozen(framework) || !Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-COORDINATION establishment failed: source Framework immutability verification failed"
            );
        }
        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }
        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }
        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-COORDINATION establishment failed: Framework status must be defined"
            );
        }

        this.requirePresent(this.coordinatorContract, "CoordinatorContract");
        this.requirePresent(this.coordinationContract, "CoordinationContract");
        this.requirePresent(this.planContract, "CoordinationPlanContract");
        this.requirePresent(this.resultContract, "CoordinationResultContract");
        this.requirePresent(
            this.confidenceContract,
            "CoordinationConfidenceContract"
        );
        this.requirePresent(this.providerRole, "CoordinationProviderRole");
        this.requirePresent(this.inputBoundary, "CoordinationInputBoundary");
        this.requirePresent(this.outputBoundary, "CoordinationOutputBoundary");
        this.requirePresent(
            this.participationBoundary,
            "ExtensionParticipationBoundary"
        );
        this.requirePresent(
            this.humanAuthorityBoundary,
            "HumanAuthorityPreservationBoundary"
        );
        this.requirePresent(this.aiBoundary, "CoordinationAiBoundary");
        this.requirePresent(
            this.securityContract,
            "CoordinationSecurityContract"
        );
        this.requirePresent(
            this.selfCoordinationRestriction,
            "SelfCoordinationRestriction"
        );
        this.requirePresent(this.memoryContract, "CoordinationMemoryContract");
        this.requirePresent(
            this.validationBoundary,
            "CoordinationValidationBoundary"
        );
        this.requirePresent(
            this.coordinatorRegistration,
            "CoordinatorRegistrationContract"
        );
        this.requirePresent(
            this.coordinatorDiscovery,
            "CoordinatorDiscoveryContract"
        );
        this.requirePresent(
            this.coordinatorSelection,
            "CoordinatorSelectionContract"
        );
        this.requirePresent(
            this.fallbackStrategy,
            "CoordinatorFallbackStrategyContract"
        );
        this.requirePresent(this.lifecycleContract, "CoordinatorLifecycleContract");
        this.requirePresent(
            this.determinismPolicy,
            "CoordinationDeterminismPolicy"
        );

        this.validateCoordinator(this.coordinatorContract!);
        this.validateCoordination(this.coordinationContract!);
        this.validatePlan(this.planContract!);
        this.validateResult(this.resultContract!);
        this.validateConfidence(this.confidenceContract!);
        this.validateProvider(this.providerRole!);
        this.validateInput(this.inputBoundary!);
        this.validateOutput(this.outputBoundary!);
        this.validateParticipation(this.participationBoundary!);
        this.validateHuman(this.humanAuthorityBoundary!);
        this.validateAi(this.aiBoundary!);
        this.validateSecurity(this.securityContract!);
        this.validateSelf(this.selfCoordinationRestriction!);
        this.validateMemory(this.memoryContract!);
        this.validateValidationBoundary(this.validationBoundary!);
        this.validateRegistration(this.coordinatorRegistration!);
        this.validateDiscovery(this.coordinatorDiscovery!);
        this.validateSelection(this.coordinatorSelection!);
        this.validateFallback(this.fallbackStrategy!);
        this.validateLifecycle(this.lifecycleContract!);
        this.validateDeterminism(this.determinismPolicy!);

        const securityBoundary: CoordinationLayerSecurityBoundary = Object.freeze({
            holdsDecisionAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            holdsCoordinatorResponsibility: true as const,
            forbidsAuthorityEscalation: true as const,
        });
        const siblingIndependence: CoordinationSiblingIndependence = Object.freeze({
            peerToOps: true as const,
            peerToConnect: true as const,
            peerToAi: true as const,
            peerToValidation: true as const,
            forbidsOpsDependencyOwnership: true as const,
            forbidsConnectDependencyOwnership: true as const,
            forbidsAiDependencyOwnership: true as const,
            forbidsValidationDependencyOwnership: true as const,
            forbidsCoreIntrusion: true as const,
        });
        const metadata: AsaCoordinationLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            preservesOpsContract: true as const,
            preservesConnectContract: true as const,
            preservesAiContract: true as const,
            preservesValidationContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaCoordinationLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-COORDINATION" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            coordinatorContract: freezeCoordinatorContract(
                this.coordinatorContract!
            ),
            coordinationContract: freezeCoordinationContract(
                this.coordinationContract!
            ),
            planContract: freezeCoordinationPlanContract(this.planContract!),
            resultContract: freezeCoordinationResultContract(
                this.resultContract!
            ),
            confidenceContract: freezeCoordinationConfidenceContract(
                this.confidenceContract!
            ),
            providerRole: freezeCoordinationProviderRole(this.providerRole!),
            inputBoundary: freezeCoordinationInputBoundary(this.inputBoundary!),
            outputBoundary: freezeCoordinationOutputBoundary(
                this.outputBoundary!
            ),
            participationBoundary: freezeExtensionParticipationBoundary(
                this.participationBoundary!
            ),
            humanAuthorityBoundary: freezeHumanAuthorityPreservationBoundary(
                this.humanAuthorityBoundary!
            ),
            aiBoundary: freezeCoordinationAiBoundary(this.aiBoundary!),
            securityContract: freezeCoordinationSecurityContract(
                this.securityContract!
            ),
            selfCoordinationRestriction: freezeSelfCoordinationRestriction(
                this.selfCoordinationRestriction!
            ),
            memoryContract: freezeCoordinationMemoryContract(
                this.memoryContract!
            ),
            validationBoundary: freezeCoordinationValidationBoundary(
                this.validationBoundary!
            ),
            coordinatorRegistration: freezeCoordinatorRegistrationContract(
                this.coordinatorRegistration!
            ),
            coordinatorDiscovery: freezeCoordinatorDiscoveryContract(
                this.coordinatorDiscovery!
            ),
            coordinatorSelection: freezeCoordinatorSelectionContract(
                this.coordinatorSelection!
            ),
            fallbackStrategy: freezeCoordinatorFallbackStrategyContract(
                this.fallbackStrategy!
            ),
            lifecycleContract: freezeCoordinatorLifecycleContract(
                this.lifecycleContract!
            ),
            determinismPolicy: freezeCoordinationDeterminismPolicy(
                this.determinismPolicy!
            ),
            securityBoundary,
            siblingIndependence,
        });
    }

    private validateCoordinator(c: CoordinatorContract): void {
        if (c.id !== "ASA-COORDINATION") {
            throw new Error(
                "ASA-COORDINATION establishment failed: Extension Identifier must be ASA-COORDINATION"
            );
        }
        this.requireNonEmpty(c.version, "coordinatorContract.version");
        if (c.domain !== "Coordination" || c.frameworkDomain !== "COORDINATION") {
            throw new Error(
                "ASA-COORDINATION establishment failed: domain/frameworkDomain must be Coordination/COORDINATION"
            );
        }
        if (c.authority !== "COORDINATOR") {
            throw new Error(
                "ASA-COORDINATION establishment failed: Authority Declaration must be COORDINATOR"
            );
        }
        this.requireNonEmpty(c.description, "coordinatorContract.description");
        this.requireNonEmpty(
            c.governanceOwner,
            "coordinatorContract.governanceOwner"
        );
        if (
            !c.compatibility.includes(REQUIRED_CORE_VERSION) ||
            !c.compatibility.includes("ASA-ARCH-35.x") ||
            !c.compatibility.includes("ASA-ARCH-35.1") ||
            !c.compatibility.includes("ASA-ARCH-36.0") ||
            !c.compatibility.includes("ASA-ARCH-37.0") ||
            !c.compatibility.includes("ASA-ARCH-38.0") ||
            !c.compatibility.includes("ASA-ARCH-39.0")
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: compatibility must include ASA-CORE-34.0 and ASA-ARCH-35.x/35.1/36.0/37.0/38.0/39.0"
            );
        }
        if (
            c.forbidsExecute !== true ||
            c.forbidsInitiateCapabilityExecution !== true ||
            c.forbidsCoreMutation !== true ||
            c.forbidsFrameworkMutation !== true ||
            c.forbidsGovernanceMutation !== true ||
            c.forbidsGrantAuthority !== true ||
            c.coordinationIsNotExecution !== true ||
            c.authorityIsMetadataOnly !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Authority Isolation flags invalid"
            );
        }
        if (
            c.permitsObserveExtensionMetadata !== true ||
            c.permitsResolveDeclaredContractReferences !== true ||
            c.permitsCreateCoordinationPlan !== true ||
            c.permitsDefineInteractionOrdering !== true ||
            c.permitsAggregateExtensionResults !== true ||
            c.permitsGenerateCoordinationReport !== true ||
            c.permitsGenerateInteractionRecommendation !== true ||
            c.permitsRequestReview !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: COORDINATOR permitted operations must all be true"
            );
        }
    }

    private validateCoordination(c: CoordinationContract): void {
        this.requireNonEmpty(c.contractId, "coordinationContract.contractId");
        this.requireAllPresent(
            c.operations,
            REQUIRED_OPS,
            "Coordination operations"
        );
        if (
            c.forbidsExecute !== true ||
            c.forbidsMutate !== true ||
            c.forbidsAuthorize !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Coordination Contract must forbid execute/mutate/authorize"
            );
        }
    }

    private validatePlan(c: CoordinationPlanContract): void {
        this.requireNonEmpty(c.planContractId, "planContract.planContractId");
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_PLAN_FIELDS,
            "Plan fields"
        );
        if (
            c.interactionSequenceIsNotExecutionOrder !== true ||
            c.planIsNotExecutionPlan !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Execution Sequence Isolation invalid"
            );
        }
    }

    private validateResult(c: CoordinationResultContract): void {
        this.requireNonEmpty(c.resultContractId, "resultContract.resultContractId");
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_RESULT_FIELDS,
            "Result fields"
        );
        this.requireAllPresent(c.allowedStatuses, REQUIRED_STATUSES, "Statuses");
        if (c.structuredDoesNotMeanExecutionCompleted !== true) {
            throw new Error(
                "ASA-COORDINATION establishment failed: STRUCTURED must not mean execution completed"
            );
        }
    }

    private validateConfidence(c: CoordinationConfidenceContract): void {
        this.requireNonEmpty(
            c.confidenceContractId,
            "confidenceContract.confidenceContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_CONFIDENCE_FIELDS,
            "Confidence fields"
        );
        if (
            c.valueRange !== "0.0_TO_1.0" ||
            c.confidenceIsNotExecutionPermission !== true ||
            c.confidenceIsNotAuthority !== true ||
            c.confidenceIsNotDecisionConfidence !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Confidence Boundary invalid"
            );
        }
    }

    private validateProvider(c: CoordinationProviderRole): void {
        this.requireNonEmpty(c.roleId, "providerRole.roleId");
        if (c.isNotExecutionProvider !== true) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Provider must not be Execution Provider"
            );
        }
    }

    private validateInput(c: CoordinationInputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "inputBoundary.boundaryId");
        this.requireAllPresent(c.allowedInputs, REQUIRED_INPUTS, "Inputs");
        if (
            c.inputIsReadOnly !== true ||
            c.forbidsPrivateExtensionStateAccess !== true ||
            c.forbidsInferUndeclaredCapability !== true ||
            c.humanInstructionIsNotAutomaticExecutionAuthorization !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Input Boundary invalid"
            );
        }
    }

    private validateOutput(c: CoordinationOutputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "outputBoundary.boundaryId");
        this.requireAllPresent(c.allowedOutputs, REQUIRED_OUTPUTS, "Outputs");
        if (
            c.forbidsExecutionCommand !== true ||
            c.forbidsGenerateExecutionPermission !== true ||
            c.planIsNotExecutionPlan !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Output / Non-Execution Boundary invalid"
            );
        }
    }

    private validateParticipation(c: ExtensionParticipationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "participationBoundary.boundaryId");
        if (
            c.forbidsForceExtensionExecution !== true ||
            c.forbidsPrivateStateAccess !== true ||
            c.forbidsImplicitDependencyCreation !== true ||
            c.referencesOpsConnectAiValidationViaDeclaredContractsOnly !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Extension Isolation invalid"
            );
        }
    }

    private validateHuman(c: HumanAuthorityPreservationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "humanAuthorityBoundary.boundaryId");
        if (
            c.coordinatorCannotBecomeDecisionAuthority !== true ||
            c.coordinatorCannotReplaceHumanOrGovernanceAuthority !== true ||
            c.coordinatorCannotApproveOwnRecommendations !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Human Authority Preservation invalid"
            );
        }
    }

    private validateAi(c: CoordinationAiBoundary): void {
        this.requireNonEmpty(c.boundaryId, "aiBoundary.boundaryId");
        if (
            c.forbidsEvaluateAiCorrectness !== true ||
            c.forbidsModifyAiDecisions !== true ||
            c.forbidsBecomeAiAuthority !== true ||
            c.aiOutputIsNotExecutionInstruction !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: AI Boundary invalid"
            );
        }
    }

    private validateSecurity(c: CoordinationSecurityContract): void {
        this.requireNonEmpty(
            c.securityContractId,
            "securityContract.securityContractId"
        );
        if (
            c.forbidsGrantPrivileges !== true ||
            c.forbidsForgeCoordinationContext !== true ||
            c.forbidsManipulateCoordinationResult !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Security Compliance invalid"
            );
        }
    }

    private validateSelf(c: SelfCoordinationRestriction): void {
        this.requireNonEmpty(c.restrictionId, "selfCoordinationRestriction.restrictionId");
        if (
            c.forbidsApproveOwnAuthority !== true ||
            c.forbidsModifyOwnContract !== true ||
            c.forbidsCertifyOwnCorrectness !== true ||
            c.forbidsValidateOwnSecurityCompliance !== true ||
            c.forbidsValidateOwnCoordinationCorrectness !== true ||
            c.requiresIndependentValidation !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Self Coordination Restriction invalid"
            );
        }
    }

    private validateMemory(c: CoordinationMemoryContract): void {
        this.requireNonEmpty(c.memoryContractId, "memoryContract.memoryContractId");
        this.requireAllPresent(c.layers, REQUIRED_MEMORY, "Memory layers");
        if (
            c.memoryIsNotCoreState !== true ||
            c.memoryNeverGrantsAuthority !== true ||
            c.ownershipExplicitlyDeclared !== true ||
            c.retentionDoesNotCreateAuthority !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Memory Boundary invalid"
            );
        }
    }

    private validateValidationBoundary(c: CoordinationValidationBoundary): void {
        this.requireNonEmpty(c.boundaryId, "validationBoundary.boundaryId");
        if (
            c.integrationIsReadOnly !== true ||
            c.validationResultIsNotCoordinationControl !== true ||
            c.forbidsValidationControllingCoordinationAutomatically !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Validation Boundary invalid"
            );
        }
    }

    private validateRegistration(c: CoordinatorRegistrationContract): void {
        this.requireNonEmpty(
            c.registrationContractId,
            "coordinatorRegistration.registrationContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_REG_FIELDS,
            "Registration fields"
        );
        if (
            c.authorityMustBeCoordinator !== true ||
            c.registrationDoesNotGrantOperationalAuthority !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Registration Compliance invalid"
            );
        }
    }

    private validateDiscovery(c: CoordinatorDiscoveryContract): void {
        this.requireNonEmpty(
            c.discoveryContractId,
            "coordinatorDiscovery.discoveryContractId"
        );
        if (
            c.returnsMetadataReferencesOnly !== true ||
            c.forbidsInstantiateOrAuthorizeCoordinator !== true ||
            c.isNotRuntimeDiscoveryEngine !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Discovery Contract invalid"
            );
        }
    }

    private validateSelection(c: CoordinatorSelectionContract): void {
        this.requireNonEmpty(
            c.selectionContractId,
            "coordinatorSelection.selectionContractId"
        );
        if (
            c.producesRecommendationOnly !== true ||
            c.forbidsGrantOperationalAuthority !== true ||
            c.isNotRuntimeSelectionEngine !== true
        ) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Selection Contract invalid"
            );
        }
    }

    private validateFallback(c: CoordinatorFallbackStrategyContract): void {
        this.requireNonEmpty(
            c.fallbackContractId,
            "fallbackStrategy.fallbackContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_FALLBACK,
            "Fallback fields"
        );
        if (c.manualModePreservesHumanAuthority !== true) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Fallback must preserve Human Authority"
            );
        }
    }

    private validateLifecycle(c: CoordinatorLifecycleContract): void {
        this.requireNonEmpty(
            c.lifecycleContractId,
            "lifecycleContract.lifecycleContractId"
        );
        this.requireOrdered(
            c.allowedStates,
            REQUIRED_LIFECYCLE,
            "Lifecycle states"
        );
        if (c.transitionsMustBeExplicit !== true) {
            throw new Error(
                "ASA-COORDINATION establishment failed: Lifecycle transitions must be explicit"
            );
        }
    }

    private validateDeterminism(c: CoordinationDeterminismPolicy): void {
        this.requireNonEmpty(c.policyId, "determinismPolicy.policyId");
        this.requireAllPresent(
            c.requiredMetadata,
            REQUIRED_DETERMINISM,
            "Determinism metadata"
        );
    }

    private requirePresent<T>(
        value: T | undefined,
        label: string
    ): asserts value is T {
        if (value === undefined) {
            throw new Error(
                `ASA-COORDINATION establishment failed: ${label} is required`
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
                    `ASA-COORDINATION establishment failed: ${label} missing ${item}`
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
                `ASA-COORDINATION establishment failed: ${label} incomplete or out of order`
            );
        }
    }

    private requireNonEmpty(value: string | undefined, field: string): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(
                `ASA-COORDINATION establishment failed: ${field} is required`
            );
        }
        return value;
    }
}
