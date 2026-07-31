import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { AiExtensionContract } from "../../../src/extensions/asa_ai/AiExtensionContract";
import type { IntelligenceContract } from "../../../src/extensions/asa_ai/IntelligenceContract";
import type {
    AiRuntimeBoundary,
    AiSessionContract,
} from "../../../src/extensions/asa_ai/AiRuntimeBoundary";
import type {
    AiAssumptionContract,
    AiConfidenceContract,
    AiEvidenceContract,
    AiProposalContract,
    AiUncertaintyContract,
} from "../../../src/extensions/asa_ai/AiProposalContract";
import type {
    AiInputOutputBoundary,
    AiLearningBoundary,
    AiMemoryContract,
} from "../../../src/extensions/asa_ai/AiMemoryContract";
import type {
    AiAuditContract,
    AiDeterminismPolicy,
    AiSecurityContract,
    AiTraceabilityContract,
} from "../../../src/extensions/asa_ai/AiSecurityContract";
import type {
    AiFallbackStrategyContract,
    AiLifecycleContract,
    AiProviderDiscoveryContract,
    AiProviderRegistrationContract,
    AiProviderSelectionContract,
} from "../../../src/extensions/asa_ai/AiProviderRegistration";
import { AiValidator } from "../../../src/extensions/asa_ai/AiValidator";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "interpret",
            "analyze",
            "evaluate",
            "explain",
            "recommend",
            "generate.proposal",
            "request.review",
        ]),
        forbidsDirectCoreMutation: true as const,
        forbidsAdministratorAuthority: true as const,
    });
}

function sampleDescriptors(): ExtensionDescriptor[] {
    return [
        Object.freeze({
            id: "ASA-AI",
            version: "1.0.0",
            domain: "AI" as const,
            contract: "ext.boundary.contract.v1",
            compatibility: Object.freeze({
                coreVersion: "ASA-CORE-34.0",
                contractVersion: "1.0.0",
                compatibleExtensionIds: Object.freeze([
                    "ASA-OPS",
                    "ASA-CONNECT",
                ]),
            }),
            lifecycle: "VALIDATED" as const,
            authority: "ADVISOR" as const,
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
                compatibleExtensionIds: Object.freeze(["ASA-AI"]),
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
            extensionId: "ASA-AI",
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
        .withGovernanceLayerId("egl-ai")
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
            id: "ASA-AI",
            version: "1.0.0",
            domain: "AI" as const,
            description: "AI development template for ASA-ARCH-38.0",
            governanceOwner: "ASA-GOV-AI",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.ai.input.v1"]),
            processingBoundaryId: "ext.ai.processing.v1",
            outputContractIds: Object.freeze(["ext.ai.output.v1"]),
            errorContract: Object.freeze({
                errorType: "AI_FAILURE",
                failureState: "FAILED",
                recoveryPolicy: "HALT",
                notificationPolicy: "GOVERNANCE_NOTIFY",
            }),
            forbidsCoreMutation: true as const,
            forbidsGovernanceMutation: true as const,
        }),
        authority: Object.freeze({
            declaredAuthority: "ADVISOR" as const,
            approvedAuthority: "ADVISOR" as const,
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
        .withFrameworkId("edf-ai")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleAiExtensionContract(): AiExtensionContract {
    return Object.freeze({
        id: "ASA-AI",
        version: "1.0.0",
        domain: "Intelligence",
        frameworkDomain: "AI",
        authority: "ADVISOR",
        lifecycle: "VALIDATED",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
            "ASA-ARCH-37.0",
        ]),
        description: "ASA-AI Extension Intelligence Layer",
        governanceOwner: "ASA-GOV-AI",
        intelligenceIsNotAuthority: true,
        proposalIsNotExecution: true,
        knowledgeIsNotSystemState: true,
        memoryIsNotCoreState: true,
        learningIsNotArchitectureMutation: true,
        inferenceIsNotTruth: true,
        confidenceIsNotCorrectness: true,
        forbidsExecute: true,
        forbidsOverrideValidation: true,
        forbidsOverrideGovernance: true,
        forbidsOverridePolicy: true,
        forbidsCoreMutation: true,
        forbidsFrameworkMutation: true,
        forbidsGovernanceMutation: true,
        forbidsAuthorityEscalation: true,
        forbidsRuntimeCapabilityRegistration: true,
        forbidsRuntimeStateMutation: true,
        forbidsSelfModification: true,
        forbidsRequireAcceptance: true,
        permitsInterpret: true,
        permitsAnalyze: true,
        permitsEvaluate: true,
        permitsExplain: true,
        permitsRecommend: true,
        permitsGenerateProposal: true,
        permitsRequestReview: true,
        permitsGenerateExecutionProposal: true,
        generateExecutionProposalIsNotExecutionRequest: true,
    });
}

export function sampleIntelligence(): IntelligenceContract {
    return Object.freeze({
        contractId: "ai.intelligence.v1",
        operations: Object.freeze([
            "interpret",
            "analyze",
            "evaluate",
            "explain",
            "summarize",
            "propose",
            "confidence",
            "uncertainty",
        ] as const),
        technologyIndependent: true,
        forbidsVendorCoupling: true,
    });
}

export function sampleRuntime(): AiRuntimeBoundary {
    return Object.freeze({
        boundaryId: "ai.runtime.v1",
        layers: Object.freeze(["PROVIDER", "RUNTIME", "SESSION"] as const),
        providerIsCapabilitySource: true,
        runtimeIsIntelligenceEnvironment: true,
        sessionIsInferenceContext: true,
        forbidsAsaExecutionAuthority: true,
        forbidsCoreStateCoupling: true,
    });
}

export function sampleSession(): AiSessionContract {
    return Object.freeze({
        sessionContractId: "ai.session.v1",
        requiresSessionIdOnProposal: true,
        sessionIsEphemeralContext: true,
        forbidsSessionAsCoreState: true,
    });
}

export function sampleProposal(): AiProposalContract {
    return Object.freeze({
        proposalContractId: "ai.proposal.v1",
        requiredFields: Object.freeze([
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
        ] as const),
        proposalIsNotExecution: true,
        forbidsExecutionCommand: true,
        forbidsPolicyMutation: true,
        forbidsRuntimeMutation: true,
        humanMayRejectWithoutExplanation: true,
        aiCannotRequireAcceptance: true,
    });
}

export function sampleEvidence(): AiEvidenceContract {
    return Object.freeze({
        evidenceContractId: "ai.evidence.v1",
        allowedTypes: Object.freeze([
            "Fact",
            "Observation",
            "External",
            "Derived",
        ] as const),
        requiresSource: true,
        requiresTimestamp: true,
        requiresReference: true,
        requiresConfidence: true,
    });
}

export function sampleAssumption(): AiAssumptionContract {
    return Object.freeze({
        assumptionContractId: "ai.assumption.v1",
        requiresDescription: true,
        requiresProbability: true,
        requiresImpact: true,
        requiresConfidence: true,
        requiresExpiry: true,
    });
}

export function sampleConfidence(): AiConfidenceContract {
    return Object.freeze({
        confidenceContractId: "ai.confidence.v1",
        valueRange: "0.0_TO_1.0",
        requiresReason: true,
        requiresEstimationMethod: true,
        confidenceIsNotCorrectness: true,
    });
}

export function sampleUncertainty(): AiUncertaintyContract {
    return Object.freeze({
        uncertaintyContractId: "ai.uncertainty.v1",
        requiredFlags: Object.freeze([
            "unknown",
            "insufficientEvidence",
            "modelLimitation",
            "dataGap",
            "conflict",
            "hallucinationRisk",
        ] as const),
    });
}

export function sampleMemory(): AiMemoryContract {
    return Object.freeze({
        memoryContractId: "ai.memory.v1",
        layers: Object.freeze([
            "WORKING_MEMORY",
            "SESSION_MEMORY",
            "PERSISTENT_MEMORY",
        ] as const),
        neverPartOfCoreState: true,
        ownershipExplicitlyDeclared: true,
        ownershipValidatedByGovernance: true,
        sessionMemoryEphemeral: true,
        workingMemoryScoped: true,
        persistentMemoryGovernedByPolicy: true,
    });
}

export function sampleLearning(): AiLearningBoundary {
    return Object.freeze({
        learningBoundaryId: "ai.learning.v1",
        learningKinds: Object.freeze([
            "PROMPT_UPDATE",
            "KNOWLEDGE_UPDATE",
            "MODEL_UPDATE",
            "FEEDBACK_LEARNING",
            "RETRAINING",
            "EVALUATION_FEEDBACK",
        ] as const),
        forbidsCoreContractsMutation: true,
        forbidsGovernanceContractsMutation: true,
        forbidsFrameworkContractsMutation: true,
        forbidsFrozenExtensionsMutation: true,
    });
}

export function sampleInputOutput(): AiInputOutputBoundary {
    return Object.freeze({
        boundaryId: "ai.io.v1",
        allowedInputs: Object.freeze([
            "OBSERVATION_DATA_OPS",
            "EXTERNAL_DATA_CONNECT",
            "STATIC_KNOWLEDGE",
            "HUMAN_INPUT",
            "GOVERNANCE_INPUT_SNAPSHOT",
        ] as const),
        allowedOutputs: Object.freeze([
            "PROPOSAL",
            "RECOMMENDATION",
            "SUMMARY",
            "EVALUATION",
            "EXPLANATION",
            "CLARIFICATION_REQUEST",
        ] as const),
        governanceSnapshotIsReferenceOnly: true,
        governanceSnapshotGrantsNoAuthority: true,
        governanceSnapshotImmutable: true,
        forbidsDirectRuntimeState: true,
        forbidsDirectCapabilityState: true,
        forbidsDirectPolicyState: true,
        forbidsExecutionCommandOutput: true,
        forbidsPolicyMutationOutput: true,
        forbidsRuntimeMutationOutput: true,
    });
}

export function sampleSecurity(): AiSecurityContract {
    return Object.freeze({
        securityContractId: "ai.security.v1",
        threatKinds: Object.freeze([
            "PROMPT_INJECTION",
            "TOOL_INJECTION",
            "MEMORY_POISONING",
            "MODEL_POISONING",
        ] as const),
        detectMitigateReportRequired: true,
        forbidsGenerateAuthority: true,
        forbidsCreatePrivileges: true,
        forbidsBypassValidation: true,
        forbidsBypassAuthentication: true,
        forbidsModifySecurityPolicy: true,
        forbidsAccessRestrictedState: true,
        modelPoisoningIsProviderResponsibility: true,
    });
}

export function sampleAudit(): AiAuditContract {
    return Object.freeze({
        auditContractId: "ai.audit.v1",
        requiredFields: Object.freeze([
            "input",
            "output",
            "evidence",
            "assumptions",
            "uncertainties",
            "reasoningSummary",
            "provider",
            "timestamp",
        ] as const),
    });
}

export function sampleTrace(): AiTraceabilityContract {
    return Object.freeze({
        traceContractId: "ai.trace.v1",
        requiredStages: Object.freeze([
            "input",
            "interpretation",
            "analysis",
            "evaluation",
            "proposal",
            "reasoningPath",
        ] as const),
    });
}

export function sampleDeterminism(): AiDeterminismPolicy {
    return Object.freeze({
        policyId: "ai.determinism.v1",
        requiredMetadata: Object.freeze([
            "temperature",
            "top_p",
            "randomness",
            "seed",
            "deterministicMode",
            "modelVersion",
            "knowledgeVersion",
            "environmentVersion",
        ] as const),
    });
}

export function sampleRegistration(): AiProviderRegistrationContract {
    return Object.freeze({
        registrationContractId: "ai.registration.v1",
        requiredFields: Object.freeze([
            "metadata",
            "authority",
            "capabilities",
            "version",
            "providerType",
            "securityProfile",
            "memoryPolicy",
            "determinismProfile",
        ] as const),
        authorityMustBeAdvisor: true,
    });
}

export function sampleDiscovery(): AiProviderDiscoveryContract {
    return Object.freeze({
        discoveryContractId: "ai.discovery.v1",
        criteriaDeclaredStructurally: true,
        consumesExtensionRegistryByReference: true,
        forbidsFrameworkMutation: true,
        isNotRuntimeDiscoveryEngine: true,
    });
}

export function sampleSelection(): AiProviderSelectionContract {
    return Object.freeze({
        selectionContractId: "ai.selection.v1",
        criteriaDeclaredStructurally: true,
        forbidsAuthorityEscalation: true,
        forbidsAutonomousExecution: true,
        isNotRuntimeSelectionEngine: true,
    });
}

export function sampleFallback(): AiFallbackStrategyContract {
    return Object.freeze({
        fallbackContractId: "ai.fallback.v1",
        requiredFields: Object.freeze([
            "fallbackProvider",
            "fallbackStrategy",
            "fallbackConfidence",
            "manualMode",
        ] as const),
        manualModePreservesHumanAuthority: true,
    });
}

export function sampleLifecycle(): AiLifecycleContract {
    return Object.freeze({
        lifecycleContractId: "ai.lifecycle.v1",
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

export function baseAiValidator(): AiValidator {
    return new AiValidator()
        .withLayerId("ai-layer-ok")
        .withArchitectureVersion("ASA-ARCH-38.0")
        .withStructuralVersion("0.5")
        .withSchemaVersion("0.5")
        .withSourceFramework(establishFramework())
        .withExtensionContract(sampleAiExtensionContract())
        .withIntelligenceContract(sampleIntelligence())
        .withRuntimeBoundary(sampleRuntime())
        .withSessionContract(sampleSession())
        .withProposalContract(sampleProposal())
        .withEvidenceContract(sampleEvidence())
        .withAssumptionContract(sampleAssumption())
        .withConfidenceContract(sampleConfidence())
        .withUncertaintyContract(sampleUncertainty())
        .withMemoryContract(sampleMemory())
        .withLearningBoundary(sampleLearning())
        .withInputOutputBoundary(sampleInputOutput())
        .withSecurityContract(sampleSecurity())
        .withAuditContract(sampleAudit())
        .withTraceabilityContract(sampleTrace())
        .withDeterminismPolicy(sampleDeterminism())
        .withProviderRegistration(sampleRegistration())
        .withProviderDiscovery(sampleDiscovery())
        .withProviderSelection(sampleSelection())
        .withFallbackStrategy(sampleFallback())
        .withLifecycleContract(sampleLifecycle());
}
