/**
 * ASA-ARCH-38.0 - ASA-AI Validator / Establishment Builder (Draft 0.5)
 *
 * Establishes the immutable ASA-AI Extension Intelligence Layer.
 * Consumes frozen ASA-ARCH-35.1 Extension Development Framework by reference.
 * Does NOT mutate Core, Governance, Framework, OPS, or CONNECT contracts.
 *
 * Performs structural validation only — not an inference / discovery engine.
 */

import type { ExtensionDevelopmentFramework } from "../../extension_development_framework/ExtensionDevelopmentFramework";
import {
    AsaAiLayer,
    type AsaAiLayerMetadata,
    type AiLayerSecurityBoundary,
    type AiSiblingIndependence,
} from "./AsaAiLayer";
import {
    freezeAiExtensionContract,
    type AiExtensionContract,
} from "./AiExtensionContract";
import {
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
import {
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
import {
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
import {
    freezeAiRuntimeBoundary,
    freezeAiSessionContract,
    type AiRuntimeBoundary,
    type AiRuntimeLayerKind,
    type AiSessionContract,
} from "./AiRuntimeBoundary";
import {
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
import {
    freezeIntelligenceContract,
    type IntelligenceContract,
    type IntelligenceOperation,
} from "./IntelligenceContract";

const REQUIRED_CORE_VERSION = "ASA-CORE-34.0";
const REQUIRED_FRAMEWORK_ARCH = "ASA-ARCH-35.1";

const REQUIRED_OPS: ReadonlyArray<IntelligenceOperation> = [
    "interpret",
    "analyze",
    "evaluate",
    "explain",
    "summarize",
    "propose",
    "confidence",
    "uncertainty",
];
const REQUIRED_RUNTIME_LAYERS: ReadonlyArray<AiRuntimeLayerKind> = [
    "PROVIDER",
    "RUNTIME",
    "SESSION",
];
const REQUIRED_PROPOSAL_FIELDS: ReadonlyArray<AiProposalField> = [
    "id",
    "title",
    "summary",
    "goal",
    "context",
    "constraints",
    "recommendation",
    "alternatives",
    "expectedBenefit",
    "expectedRisk",
    "decisionImpact",
    "dependencies",
    "proposedAction",
    "confidence",
    "evidence",
    "assumptions",
    "limitations",
    "uncertainties",
    "hallucinationRisk",
    "riskLevel",
    "timestamp",
    "provider",
    "providerVersion",
    "model",
    "modelVersion",
    "knowledgeVersion",
    "sessionId",
];
const REQUIRED_EVIDENCE_TYPES: ReadonlyArray<AiEvidenceType> = [
    "Fact",
    "Observation",
    "External",
    "Derived",
];
const REQUIRED_UNCERTAINTY_FLAGS = [
    "unknown",
    "insufficientEvidence",
    "modelLimitation",
    "dataGap",
    "conflict",
    "hallucinationRisk",
] as const;
const REQUIRED_MEMORY_LAYERS: ReadonlyArray<AiMemoryLayerKind> = [
    "WORKING_MEMORY",
    "SESSION_MEMORY",
    "PERSISTENT_MEMORY",
];
const REQUIRED_LEARNING: ReadonlyArray<AiLearningKind> = [
    "PROMPT_UPDATE",
    "KNOWLEDGE_UPDATE",
    "MODEL_UPDATE",
    "FEEDBACK_LEARNING",
    "RETRAINING",
    "EVALUATION_FEEDBACK",
];
const REQUIRED_INPUTS: ReadonlyArray<AiInputKind> = [
    "OBSERVATION_DATA_OPS",
    "EXTERNAL_DATA_CONNECT",
    "STATIC_KNOWLEDGE",
    "HUMAN_INPUT",
    "GOVERNANCE_INPUT_SNAPSHOT",
];
const REQUIRED_OUTPUTS: ReadonlyArray<AiOutputKind> = [
    "PROPOSAL",
    "RECOMMENDATION",
    "SUMMARY",
    "EVALUATION",
    "EXPLANATION",
    "CLARIFICATION_REQUEST",
];
const REQUIRED_THREATS: ReadonlyArray<AiSecurityThreatKind> = [
    "PROMPT_INJECTION",
    "TOOL_INJECTION",
    "MEMORY_POISONING",
    "MODEL_POISONING",
];
const REQUIRED_AUDIT = [
    "input",
    "output",
    "evidence",
    "assumptions",
    "uncertainties",
    "reasoningSummary",
    "provider",
    "timestamp",
] as const;
const REQUIRED_TRACE = [
    "input",
    "interpretation",
    "analysis",
    "evaluation",
    "proposal",
    "reasoningPath",
] as const;
const REQUIRED_DETERMINISM = [
    "temperature",
    "top_p",
    "randomness",
    "seed",
    "deterministicMode",
    "modelVersion",
    "knowledgeVersion",
    "environmentVersion",
] as const;
const REQUIRED_REG_FIELDS = [
    "metadata",
    "authority",
    "capabilities",
    "version",
    "providerType",
    "securityProfile",
    "memoryPolicy",
    "determinismProfile",
] as const;
const REQUIRED_FALLBACK = [
    "fallbackProvider",
    "fallbackStrategy",
    "fallbackConfidence",
    "manualMode",
] as const;
const REQUIRED_LIFECYCLE: ReadonlyArray<AiProviderLifecycleState> = [
    "Created",
    "Initialized",
    "Active",
    "Failed",
    "Suspended",
    "Reinitialized",
    "Terminated",
];

/**
 * Structural validator that establishes the ASA-AI layer.
 */
export class AiValidator {
    private layerId: string | undefined;
    private architectureVersion: string | undefined;
    private structuralVersion: string | undefined;
    private schemaVersion: string | undefined;
    private creationTimestamp: string | undefined;
    private producerIdentity: string | undefined;
    private sourceFramework: ExtensionDevelopmentFramework | undefined;
    private extensionContract: AiExtensionContract | undefined;
    private intelligenceContract: IntelligenceContract | undefined;
    private runtimeBoundary: AiRuntimeBoundary | undefined;
    private sessionContract: AiSessionContract | undefined;
    private proposalContract: AiProposalContract | undefined;
    private evidenceContract: AiEvidenceContract | undefined;
    private assumptionContract: AiAssumptionContract | undefined;
    private confidenceContract: AiConfidenceContract | undefined;
    private uncertaintyContract: AiUncertaintyContract | undefined;
    private memoryContract: AiMemoryContract | undefined;
    private learningBoundary: AiLearningBoundary | undefined;
    private inputOutputBoundary: AiInputOutputBoundary | undefined;
    private securityContract: AiSecurityContract | undefined;
    private auditContract: AiAuditContract | undefined;
    private traceabilityContract: AiTraceabilityContract | undefined;
    private determinismPolicy: AiDeterminismPolicy | undefined;
    private providerRegistration: AiProviderRegistrationContract | undefined;
    private providerDiscovery: AiProviderDiscoveryContract | undefined;
    private providerSelection: AiProviderSelectionContract | undefined;
    private fallbackStrategy: AiFallbackStrategyContract | undefined;
    private lifecycleContract: AiLifecycleContract | undefined;

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
    withExtensionContract(extensionContract: AiExtensionContract): this {
        this.extensionContract = extensionContract;
        return this;
    }
    withIntelligenceContract(
        intelligenceContract: IntelligenceContract
    ): this {
        this.intelligenceContract = intelligenceContract;
        return this;
    }
    withRuntimeBoundary(runtimeBoundary: AiRuntimeBoundary): this {
        this.runtimeBoundary = runtimeBoundary;
        return this;
    }
    withSessionContract(sessionContract: AiSessionContract): this {
        this.sessionContract = sessionContract;
        return this;
    }
    withProposalContract(proposalContract: AiProposalContract): this {
        this.proposalContract = proposalContract;
        return this;
    }
    withEvidenceContract(evidenceContract: AiEvidenceContract): this {
        this.evidenceContract = evidenceContract;
        return this;
    }
    withAssumptionContract(assumptionContract: AiAssumptionContract): this {
        this.assumptionContract = assumptionContract;
        return this;
    }
    withConfidenceContract(confidenceContract: AiConfidenceContract): this {
        this.confidenceContract = confidenceContract;
        return this;
    }
    withUncertaintyContract(
        uncertaintyContract: AiUncertaintyContract
    ): this {
        this.uncertaintyContract = uncertaintyContract;
        return this;
    }
    withMemoryContract(memoryContract: AiMemoryContract): this {
        this.memoryContract = memoryContract;
        return this;
    }
    withLearningBoundary(learningBoundary: AiLearningBoundary): this {
        this.learningBoundary = learningBoundary;
        return this;
    }
    withInputOutputBoundary(
        inputOutputBoundary: AiInputOutputBoundary
    ): this {
        this.inputOutputBoundary = inputOutputBoundary;
        return this;
    }
    withSecurityContract(securityContract: AiSecurityContract): this {
        this.securityContract = securityContract;
        return this;
    }
    withAuditContract(auditContract: AiAuditContract): this {
        this.auditContract = auditContract;
        return this;
    }
    withTraceabilityContract(
        traceabilityContract: AiTraceabilityContract
    ): this {
        this.traceabilityContract = traceabilityContract;
        return this;
    }
    withDeterminismPolicy(determinismPolicy: AiDeterminismPolicy): this {
        this.determinismPolicy = determinismPolicy;
        return this;
    }
    withProviderRegistration(
        providerRegistration: AiProviderRegistrationContract
    ): this {
        this.providerRegistration = providerRegistration;
        return this;
    }
    withProviderDiscovery(
        providerDiscovery: AiProviderDiscoveryContract
    ): this {
        this.providerDiscovery = providerDiscovery;
        return this;
    }
    withProviderSelection(
        providerSelection: AiProviderSelectionContract
    ): this {
        this.providerSelection = providerSelection;
        return this;
    }
    withFallbackStrategy(fallbackStrategy: AiFallbackStrategyContract): this {
        this.fallbackStrategy = fallbackStrategy;
        return this;
    }
    withLifecycleContract(lifecycleContract: AiLifecycleContract): this {
        this.lifecycleContract = lifecycleContract;
        return this;
    }

    /**
     * Establishes the immutable ASA-AI layer after structural validation.
     */
    establish(): AsaAiLayer {
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
                "ASA-AI establishment failed: exactly one source Extension Development Framework is required"
            );
        }
        const framework = this.sourceFramework;
        if (!Object.isFrozen(framework) || !Object.isFrozen(framework.identity)) {
            throw new Error(
                "ASA-AI establishment failed: source Framework immutability verification failed"
            );
        }
        if (framework.identity.coreVersion !== REQUIRED_CORE_VERSION) {
            throw new Error(
                "ASA-AI establishment failed: Framework must preserve ASA-CORE-34.0"
            );
        }
        if (
            framework.identity.architectureVersion !== REQUIRED_FRAMEWORK_ARCH &&
            framework.metadata.architectureVersion !== REQUIRED_FRAMEWORK_ARCH
        ) {
            throw new Error(
                "ASA-AI establishment failed: Framework must be ASA-ARCH-35.1"
            );
        }
        if (framework.metadata.frameworkStatus !== "defined") {
            throw new Error(
                "ASA-AI establishment failed: Framework status must be defined"
            );
        }

        this.requirePresent(this.extensionContract, "AiExtensionContract");
        this.requirePresent(this.intelligenceContract, "IntelligenceContract");
        this.requirePresent(this.runtimeBoundary, "AiRuntimeBoundary");
        this.requirePresent(this.sessionContract, "AiSessionContract");
        this.requirePresent(this.proposalContract, "AiProposalContract");
        this.requirePresent(this.evidenceContract, "AiEvidenceContract");
        this.requirePresent(this.assumptionContract, "AiAssumptionContract");
        this.requirePresent(this.confidenceContract, "AiConfidenceContract");
        this.requirePresent(this.uncertaintyContract, "AiUncertaintyContract");
        this.requirePresent(this.memoryContract, "AiMemoryContract");
        this.requirePresent(this.learningBoundary, "AiLearningBoundary");
        this.requirePresent(this.inputOutputBoundary, "AiInputOutputBoundary");
        this.requirePresent(this.securityContract, "AiSecurityContract");
        this.requirePresent(this.auditContract, "AiAuditContract");
        this.requirePresent(this.traceabilityContract, "AiTraceabilityContract");
        this.requirePresent(this.determinismPolicy, "AiDeterminismPolicy");
        this.requirePresent(
            this.providerRegistration,
            "AiProviderRegistrationContract"
        );
        this.requirePresent(
            this.providerDiscovery,
            "AiProviderDiscoveryContract"
        );
        this.requirePresent(
            this.providerSelection,
            "AiProviderSelectionContract"
        );
        this.requirePresent(this.fallbackStrategy, "AiFallbackStrategyContract");
        this.requirePresent(this.lifecycleContract, "AiLifecycleContract");

        this.validateExtension(this.extensionContract!);
        this.validateIntelligence(this.intelligenceContract!);
        this.validateRuntime(this.runtimeBoundary!);
        this.validateSession(this.sessionContract!);
        this.validateProposal(this.proposalContract!);
        this.validateEvidence(this.evidenceContract!);
        this.validateAssumption(this.assumptionContract!);
        this.validateConfidence(this.confidenceContract!);
        this.validateUncertainty(this.uncertaintyContract!);
        this.validateMemory(this.memoryContract!);
        this.validateLearning(this.learningBoundary!);
        this.validateInputOutput(this.inputOutputBoundary!);
        this.validateSecurity(this.securityContract!);
        this.validateAudit(this.auditContract!);
        this.validateTrace(this.traceabilityContract!);
        this.validateDeterminism(this.determinismPolicy!);
        this.validateRegistration(this.providerRegistration!);
        this.validateDiscovery(this.providerDiscovery!);
        this.validateSelection(this.providerSelection!);
        this.validateFallback(this.fallbackStrategy!);
        this.validateLifecycle(this.lifecycleContract!);

        const securityBoundary: AiLayerSecurityBoundary = Object.freeze({
            holdsDecisionAuthority: false as const,
            holdsExecutionAuthority: false as const,
            holdsPolicyAuthority: false as const,
            holdsAdvisorResponsibility: true as const,
            forbidsAuthorityEscalation: true as const,
        });
        const siblingIndependence: AiSiblingIndependence = Object.freeze({
            peerToOps: true as const,
            peerToConnect: true as const,
            forbidsOpsDependencyOwnership: true as const,
            forbidsConnectDependencyOwnership: true as const,
            forbidsCoreIntrusion: true as const,
        });
        const metadata: AsaAiLayerMetadata = Object.freeze({
            architectureVersion,
            schemaVersion,
            layerStatus: "established" as const,
            preservesCoreContract: true as const,
            preservesGovernanceContract: true as const,
            preservesFrameworkContract: true as const,
            preservesOpsContract: true as const,
            preservesConnectContract: true as const,
            ...(this.creationTimestamp !== undefined
                ? { creationTimestamp: this.creationTimestamp }
                : {}),
            ...(this.producerIdentity !== undefined
                ? { producerIdentity: this.producerIdentity }
                : {}),
        });

        return new AsaAiLayer({
            identity: Object.freeze({
                layerId,
                extensionId: "ASA-AI" as const,
                coreVersion: REQUIRED_CORE_VERSION,
                architectureVersion,
                structuralVersion,
                sourceFrameworkId: framework.identity.frameworkId,
            }),
            metadata,
            sourceFramework: framework,
            extensionContract: freezeAiExtensionContract(this.extensionContract!),
            intelligenceContract: freezeIntelligenceContract(
                this.intelligenceContract!
            ),
            runtimeBoundary: freezeAiRuntimeBoundary(this.runtimeBoundary!),
            sessionContract: freezeAiSessionContract(this.sessionContract!),
            proposalContract: freezeAiProposalContract(this.proposalContract!),
            evidenceContract: freezeAiEvidenceContract(this.evidenceContract!),
            assumptionContract: freezeAiAssumptionContract(
                this.assumptionContract!
            ),
            confidenceContract: freezeAiConfidenceContract(
                this.confidenceContract!
            ),
            uncertaintyContract: freezeAiUncertaintyContract(
                this.uncertaintyContract!
            ),
            memoryContract: freezeAiMemoryContract(this.memoryContract!),
            learningBoundary: freezeAiLearningBoundary(this.learningBoundary!),
            inputOutputBoundary: freezeAiInputOutputBoundary(
                this.inputOutputBoundary!
            ),
            securityContract: freezeAiSecurityContract(this.securityContract!),
            auditContract: freezeAiAuditContract(this.auditContract!),
            traceabilityContract: freezeAiTraceabilityContract(
                this.traceabilityContract!
            ),
            determinismPolicy: freezeAiDeterminismPolicy(
                this.determinismPolicy!
            ),
            providerRegistration: freezeAiProviderRegistrationContract(
                this.providerRegistration!
            ),
            providerDiscovery: freezeAiProviderDiscoveryContract(
                this.providerDiscovery!
            ),
            providerSelection: freezeAiProviderSelectionContract(
                this.providerSelection!
            ),
            fallbackStrategy: freezeAiFallbackStrategyContract(
                this.fallbackStrategy!
            ),
            lifecycleContract: freezeAiLifecycleContract(
                this.lifecycleContract!
            ),
            securityBoundary,
            siblingIndependence,
        });
    }

    private validateExtension(c: AiExtensionContract): void {
        if (c.id !== "ASA-AI") {
            throw new Error(
                "ASA-AI establishment failed: Extension Identifier must be ASA-AI"
            );
        }
        this.requireNonEmpty(c.version, "extensionContract.version");
        if (c.domain !== "Intelligence" || c.frameworkDomain !== "AI") {
            throw new Error(
                "ASA-AI establishment failed: domain/frameworkDomain must be Intelligence/AI"
            );
        }
        if (c.authority !== "ADVISOR") {
            throw new Error(
                "ASA-AI establishment failed: Authority Declaration must be ADVISOR"
            );
        }
        this.requireNonEmpty(c.description, "extensionContract.description");
        this.requireNonEmpty(
            c.governanceOwner,
            "extensionContract.governanceOwner"
        );
        if (
            !c.compatibility.includes(REQUIRED_CORE_VERSION) ||
            !c.compatibility.includes("ASA-ARCH-35.x") ||
            !c.compatibility.includes("ASA-ARCH-35.1") ||
            !c.compatibility.includes("ASA-ARCH-36.0") ||
            !c.compatibility.includes("ASA-ARCH-37.0")
        ) {
            throw new Error(
                "ASA-AI establishment failed: compatibility must include ASA-CORE-34.0, ASA-ARCH-35.x, ASA-ARCH-35.1, ASA-ARCH-36.0, ASA-ARCH-37.0"
            );
        }
        if (
            c.forbidsExecute !== true ||
            c.forbidsAuthorityEscalation !== true ||
            c.forbidsCoreMutation !== true ||
            c.forbidsFrameworkMutation !== true ||
            c.forbidsGovernanceMutation !== true ||
            c.proposalIsNotExecution !== true ||
            c.generateExecutionProposalIsNotExecutionRequest !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Authority Isolation flags invalid"
            );
        }
        if (
            c.permitsInterpret !== true ||
            c.permitsAnalyze !== true ||
            c.permitsEvaluate !== true ||
            c.permitsExplain !== true ||
            c.permitsRecommend !== true ||
            c.permitsGenerateProposal !== true ||
            c.permitsRequestReview !== true ||
            c.permitsGenerateExecutionProposal !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: ADVISOR permitted operations must all be true"
            );
        }
    }

    private validateIntelligence(c: IntelligenceContract): void {
        this.requireNonEmpty(c.contractId, "intelligenceContract.contractId");
        this.requireAllPresent(c.operations, REQUIRED_OPS, "Intelligence operations");
        if (c.technologyIndependent !== true || c.forbidsVendorCoupling !== true) {
            throw new Error(
                "ASA-AI establishment failed: Intelligence Contract must be technology independent"
            );
        }
    }

    private validateRuntime(c: AiRuntimeBoundary): void {
        this.requireNonEmpty(c.boundaryId, "runtimeBoundary.boundaryId");
        this.requireAllPresent(
            c.layers,
            REQUIRED_RUNTIME_LAYERS,
            "Runtime layers"
        );
        if (
            c.forbidsAsaExecutionAuthority !== true ||
            c.forbidsCoreStateCoupling !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Runtime Boundary Execution Isolation invalid"
            );
        }
    }

    private validateSession(c: AiSessionContract): void {
        this.requireNonEmpty(c.sessionContractId, "sessionContract.sessionContractId");
        if (
            c.requiresSessionIdOnProposal !== true ||
            c.forbidsSessionAsCoreState !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Session Contract flags invalid"
            );
        }
    }

    private validateProposal(c: AiProposalContract): void {
        this.requireNonEmpty(c.proposalContractId, "proposalContract.proposalContractId");
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_PROPOSAL_FIELDS,
            "Proposal fields"
        );
        if (
            c.proposalIsNotExecution !== true ||
            c.forbidsExecutionCommand !== true ||
            c.humanMayRejectWithoutExplanation !== true ||
            c.aiCannotRequireAcceptance !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Proposal Boundary flags invalid"
            );
        }
    }

    private validateEvidence(c: AiEvidenceContract): void {
        this.requireNonEmpty(c.evidenceContractId, "evidenceContract.evidenceContractId");
        this.requireAllPresent(
            c.allowedTypes,
            REQUIRED_EVIDENCE_TYPES,
            "Evidence types"
        );
        if (
            c.requiresSource !== true ||
            c.requiresTimestamp !== true ||
            c.requiresReference !== true ||
            c.requiresConfidence !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Evidence Contract incomplete"
            );
        }
    }

    private validateAssumption(c: AiAssumptionContract): void {
        this.requireNonEmpty(
            c.assumptionContractId,
            "assumptionContract.assumptionContractId"
        );
        if (
            c.requiresDescription !== true ||
            c.requiresProbability !== true ||
            c.requiresImpact !== true ||
            c.requiresConfidence !== true ||
            c.requiresExpiry !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Assumption Contract incomplete"
            );
        }
    }

    private validateConfidence(c: AiConfidenceContract): void {
        this.requireNonEmpty(
            c.confidenceContractId,
            "confidenceContract.confidenceContractId"
        );
        if (
            c.valueRange !== "0.0_TO_1.0" ||
            c.confidenceIsNotCorrectness !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Confidence Contract invalid"
            );
        }
    }

    private validateUncertainty(c: AiUncertaintyContract): void {
        this.requireNonEmpty(
            c.uncertaintyContractId,
            "uncertaintyContract.uncertaintyContractId"
        );
        this.requireAllPresent(
            c.requiredFlags,
            REQUIRED_UNCERTAINTY_FLAGS,
            "Uncertainty flags"
        );
    }

    private validateMemory(c: AiMemoryContract): void {
        this.requireNonEmpty(c.memoryContractId, "memoryContract.memoryContractId");
        this.requireAllPresent(c.layers, REQUIRED_MEMORY_LAYERS, "Memory layers");
        if (
            c.neverPartOfCoreState !== true ||
            c.ownershipExplicitlyDeclared !== true ||
            c.ownershipValidatedByGovernance !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Memory Isolation / Ownership flags invalid"
            );
        }
    }

    private validateLearning(c: AiLearningBoundary): void {
        this.requireNonEmpty(c.learningBoundaryId, "learningBoundary.learningBoundaryId");
        this.requireAllPresent(c.learningKinds, REQUIRED_LEARNING, "Learning kinds");
        if (
            c.forbidsCoreContractsMutation !== true ||
            c.forbidsGovernanceContractsMutation !== true ||
            c.forbidsFrameworkContractsMutation !== true ||
            c.forbidsFrozenExtensionsMutation !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Learning Isolation flags invalid"
            );
        }
    }

    private validateInputOutput(c: AiInputOutputBoundary): void {
        this.requireNonEmpty(c.boundaryId, "inputOutputBoundary.boundaryId");
        this.requireAllPresent(c.allowedInputs, REQUIRED_INPUTS, "AI inputs");
        this.requireAllPresent(c.allowedOutputs, REQUIRED_OUTPUTS, "AI outputs");
        if (
            c.governanceSnapshotGrantsNoAuthority !== true ||
            c.forbidsExecutionCommandOutput !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Input/Output Boundary flags invalid"
            );
        }
    }

    private validateSecurity(c: AiSecurityContract): void {
        this.requireNonEmpty(c.securityContractId, "securityContract.securityContractId");
        this.requireAllPresent(c.threatKinds, REQUIRED_THREATS, "Security threats");
        if (
            c.forbidsGenerateAuthority !== true ||
            c.forbidsBypassValidation !== true ||
            c.forbidsAccessRestrictedState !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Security Compliance flags invalid"
            );
        }
    }

    private validateAudit(c: AiAuditContract): void {
        this.requireNonEmpty(c.auditContractId, "auditContract.auditContractId");
        this.requireAllPresent(c.requiredFields, REQUIRED_AUDIT, "Audit fields");
    }

    private validateTrace(c: AiTraceabilityContract): void {
        this.requireNonEmpty(c.traceContractId, "traceabilityContract.traceContractId");
        this.requireOrdered(c.requiredStages, REQUIRED_TRACE, "Trace stages");
    }

    private validateDeterminism(c: AiDeterminismPolicy): void {
        this.requireNonEmpty(c.policyId, "determinismPolicy.policyId");
        this.requireAllPresent(
            c.requiredMetadata,
            REQUIRED_DETERMINISM,
            "Determinism metadata"
        );
    }

    private validateRegistration(c: AiProviderRegistrationContract): void {
        this.requireNonEmpty(
            c.registrationContractId,
            "providerRegistration.registrationContractId"
        );
        this.requireAllPresent(
            c.requiredFields,
            REQUIRED_REG_FIELDS,
            "Registration fields"
        );
        if (c.authorityMustBeAdvisor !== true) {
            throw new Error(
                "ASA-AI establishment failed: Provider Registration authority must be ADVISOR"
            );
        }
    }

    private validateDiscovery(c: AiProviderDiscoveryContract): void {
        this.requireNonEmpty(
            c.discoveryContractId,
            "providerDiscovery.discoveryContractId"
        );
        if (
            c.isNotRuntimeDiscoveryEngine !== true ||
            c.forbidsFrameworkMutation !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Provider Discovery Contract invalid"
            );
        }
    }

    private validateSelection(c: AiProviderSelectionContract): void {
        this.requireNonEmpty(
            c.selectionContractId,
            "providerSelection.selectionContractId"
        );
        if (
            c.isNotRuntimeSelectionEngine !== true ||
            c.forbidsAutonomousExecution !== true ||
            c.forbidsAuthorityEscalation !== true
        ) {
            throw new Error(
                "ASA-AI establishment failed: Provider Selection Contract invalid"
            );
        }
    }

    private validateFallback(c: AiFallbackStrategyContract): void {
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
                "ASA-AI establishment failed: Fallback must preserve Human Authority"
            );
        }
    }

    private validateLifecycle(c: AiLifecycleContract): void {
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
                "ASA-AI establishment failed: Lifecycle transitions must be explicit"
            );
        }
    }

    private requirePresent<T>(
        value: T | undefined,
        label: string
    ): asserts value is T {
        if (value === undefined) {
            throw new Error(`ASA-AI establishment failed: ${label} is required`);
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
                    `ASA-AI establishment failed: ${label} missing ${item}`
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
                `ASA-AI establishment failed: ${label} incomplete or out of order`
            );
        }
    }

    private requireNonEmpty(value: string | undefined, field: string): string {
        if (value === undefined || value.trim().length === 0) {
            throw new Error(`ASA-AI establishment failed: ${field} is required`);
        }
        return value;
    }
}
