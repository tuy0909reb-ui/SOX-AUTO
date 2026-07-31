import { ExtensionGovernanceBuilder } from "../../../src/extension_governance/ExtensionGovernanceBuilder";
import type {
    ExtensionBoundaryContract,
    ExtensionCompatibilityMatrixEntry,
    ExtensionDescriptor,
    ExtensionRegressionBoundary,
} from "../../../src/extension_governance/ExtensionGovernanceTypes";
import { ExtensionDevelopmentFrameworkBuilder } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkBuilder";
import type { ExtensionTemplateContract } from "../../../src/extension_development_framework/ExtensionDevelopmentFrameworkTypes";
import type { ScenarioCompositionContract } from "../../../src/extensions/asa_scenario/ScenarioComposition";
import type {
    ScenarioContract,
    ScenarioExtensionContract,
} from "../../../src/extensions/asa_scenario/ScenarioContract";
import type {
    ScenarioDefinitionContract,
    ScenarioLifecycleContract,
} from "../../../src/extensions/asa_scenario/ScenarioDefinition";
import type {
    ScenarioAiBoundary,
    ScenarioCoordinationBoundary,
    ScenarioDeterminismPolicy,
    ScenarioDiscoveryContract,
    ScenarioInputBoundary,
    ScenarioMemoryContract,
    ScenarioOutputBoundary,
    ScenarioParticipationBoundary,
    ScenarioProviderRole,
    ScenarioRegistrationContract,
    ScenarioSecurityContract,
    ScenarioSelectionContract,
    ScenarioValidationBoundary,
    SelfScenarioRestriction,
} from "../../../src/extensions/asa_scenario/ScenarioProvider";
import { ScenarioValidator } from "../../../src/extensions/asa_scenario/ScenarioValidator";

function sampleBoundaryContract(): ExtensionBoundaryContract {
    return Object.freeze({
        contractId: "ext.boundary.contract.v1",
        coreVersion: "ASA-CORE-34.0",
        architectureVersion: "ASA-ARCH-35.0",
        structuralVersion: "0.3",
        isolation: true as const,
        permittedOperationIds: Object.freeze([
            "define",
            "describe",
            "compose.reference",
            "add.constraint",
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
        .withGovernanceLayerId("egl-scenario")
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
            id: "ASA-SCENARIO",
            version: "1.0.0",
            domain: "OPS" as const,
            description:
                "Scenario development template host for ASA-ARCH-41.0 (Framework domain constrained to OPS|AI|CONNECT)",
            governanceOwner: "ASA-GOV-SCENARIO",
        }),
        contract: Object.freeze({
            inputContractIds: Object.freeze(["ext.scenario.input.v1"]),
            processingBoundaryId: "ext.scenario.processing.v1",
            outputContractIds: Object.freeze(["ext.scenario.output.v1"]),
            errorContract: Object.freeze({
                errorType: "SCENARIO_FAILURE",
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
        .withFrameworkId("edf-scenario")
        .withArchitectureVersion("ASA-ARCH-35.1")
        .withStructuralVersion("0.2")
        .withSchemaVersion("0.2")
        .withSourceGovernanceLayer(establishGovernance())
        .withExtensionTemplate(sampleFrameworkTemplate())
        .define();
}

export function sampleExtensionContract(): ScenarioExtensionContract {
    return Object.freeze({
        id: "ASA-SCENARIO",
        version: "1.0.0",
        domain: "Scenario",
        frameworkDomain: "SCENARIO",
        authority: "SCENARIO_DESIGNER",
        lifecycle: "VALIDATED",
        compatibility: Object.freeze([
            "ASA-CORE-34.0",
            "ASA-ARCH-35.x",
            "ASA-ARCH-35.1",
            "ASA-ARCH-36.0",
            "ASA-ARCH-37.0",
            "ASA-ARCH-38.0",
            "ASA-ARCH-39.0",
            "ASA-ARCH-40.0",
        ]),
        description: "ASA-SCENARIO Extension Scenario Definition Layer",
        governanceOwner: "ASA-GOV-SCENARIO",
        scenarioIsNotAuthority: true,
        scenarioIsNotExecution: true,
        scenarioDefinitionIsNotExecutionPlan: true,
        scenarioDefinitionIsNotCoordinationPlan: true,
        scenarioIsNotWorkflowEngine: true,
        compositionIsNotInvocation: true,
        referenceIsNotDependency: true,
        descriptionIsNotDecision: true,
        constraintIsNotPolicy: true,
        scenarioIsNotGovernance: true,
        interactionIntentIsNotExecutionSequence: true,
        interactionIntentIsNotExecutionOrder: true,
        declarativeAuthorityIsNotOperationalAuthority: true,
        scenarioDescriptionIsNotExecutionPermission: true,
        scenarioDefinitionIsNotApprovalResult: true,
        forbidsExecute: true,
        forbidsInvokeRuntime: true,
        forbidsModifyExtensionContract: true,
        forbidsCreateExtensionAuthority: true,
        forbidsCoreMutation: true,
        forbidsFrameworkMutation: true,
        forbidsGovernanceMutation: true,
        forbidsOverrideValidationResult: true,
        forbidsBypassCoordinationBoundary: true,
        forbidsGenerateExecutionPermission: true,
        forbidsApproveScenarioExecution: true,
        forbidsAuthorityEscalation: true,
        permitsDefineScenarioMetadata: true,
        permitsReferenceDeclaredExtensionCapabilities: true,
        permitsDefineScenarioObjective: true,
        permitsDefineExpectedInteraction: true,
        permitsDefineScenarioConstraints: true,
        permitsGenerateScenarioDescription: true,
        permitsRequestReview: true,
    });
}

export function sampleScenarioContract(): ScenarioContract {
    return Object.freeze({
        contractId: "scen.contract.v1",
        operations: Object.freeze([
            "define",
            "describe",
            "composeReference",
            "addConstraint",
            "review",
        ] as const),
        technologyIndependent: true,
        forbidsVendorCoupling: true,
        forbidsExecute: true,
        forbidsInvokeRuntime: true,
        forbidsAuthorize: true,
        forbidsMutateExtension: true,
    });
}

export function sampleDefinition(): ScenarioDefinitionContract {
    return Object.freeze({
        definitionContractId: "scen.definition.v1",
        requiredFields: Object.freeze([
            "id",
            "name",
            "objective",
            "scenarioScope",
            "scenarioParticipants",
            "capabilityReferences",
            "interactionIntent",
            "constraints",
            "intendedOutcomeDescription",
            "version",
            "timestamp",
        ] as const),
        capabilityReferencesIdentifyDeclaredOnly: true,
        capabilityReferenceDoesNotReserve: true,
        capabilityReferenceDoesNotActivate: true,
        capabilityReferenceDoesNotCreateDependency: true,
        interactionIntentDescribesRelationshipsOnly: true,
        interactionIntentDoesNotDefineExecutionSequence: true,
        intendedOutcomeIsDescriptiveOnly: true,
        intendedOutcomeIsNotExecutionResult: true,
    });
}

export function sampleComposition(): ScenarioCompositionContract {
    return Object.freeze({
        compositionContractId: "scen.composition.v1",
        requiredFields: Object.freeze([
            "scenarioId",
            "components",
            "relationships",
            "constraints",
            "compositionType",
            "timestamp",
        ] as const),
        allowedCompositionTypes: Object.freeze([
            "static",
            "dynamic",
            "conditional",
        ] as const),
        compositionDefinesStructureOnly: true,
        compositionDoesNotDefineExecutionOrder: true,
        compositionDoesNotOwnExtensions: true,
        compositionDoesNotModifyExtensionOwnership: true,
        dynamicCompositionIsNotDynamicExecution: true,
        compositionModeIsNotExecutionMode: true,
    });
}

export function sampleLifecycle(): ScenarioLifecycleContract {
    return Object.freeze({
        lifecycleContractId: "scen.lifecycle.v1",
        allowedStates: Object.freeze([
            "Created",
            "Defined",
            "Reviewed",
            "Released",
            "Deprecated",
            "Archived",
            "Rejected",
        ] as const),
        scenarioLifecycleIsNotExtensionLifecycle: true,
        releasedDoesNotMeanApproved: true,
        releasedDoesNotMeanExecutable: true,
        transitionsMustBeExplicit: true,
    });
}

export function sampleProvider(): ScenarioProviderRole {
    return Object.freeze({
        roleId: "scen.provider.v1",
        operations: Object.freeze([
            "createScenarioDefinition",
            "describeScenario",
            "composeReference",
            "addConstraint",
            "requestReview",
        ] as const),
        createsScenarioDefinitions: true,
        resolvesDeclaredReferences: true,
        describesExtensionComposition: true,
        maintainsScenarioStructure: true,
        providesScenarioInformation: true,
        isNotExecutionProvider: true,
        forbidsExecute: true,
        forbidsInvokeRuntime: true,
        forbidsAuthorize: true,
        forbidsMutateExtension: true,
    });
}

export function sampleInput(): ScenarioInputBoundary {
    return Object.freeze({
        boundaryId: "scen.input.v1",
        allowedInputs: Object.freeze([
            "EXTENSION_METADATA",
            "EXTENSION_CONTRACT_DEFINITION",
            "DECLARED_CAPABILITY",
            "REGISTRY_INFORMATION",
            "COORDINATION_METADATA_REFERENCE",
            "VALIDATION_RESULT_REFERENCE",
            "AI_CAPABILITY_REFERENCE",
            "OPS_OBSERVATION_REFERENCE",
            "CONNECT_CAPABILITY_REFERENCE",
            "HUMAN_INSTRUCTION",
        ] as const),
        inputIsReadOnly: true,
        consumesDeclaredReferencesOnly: true,
        forbidsPrivateExtensionStateAccess: true,
        forbidsInferUndeclaredCapability: true,
        humanInstructionIsScenarioIntentOnly: true,
        humanInstructionIsNotExecutionAuthorization: true,
        humanInstructionOutsideExtensionAuthorityModel: true,
        humanInstructionIsNotAutomaticExecutionAuthorization: true,
    });
}

export function sampleOutput(): ScenarioOutputBoundary {
    return Object.freeze({
        boundaryId: "scen.output.v1",
        allowedOutputs: Object.freeze([
            "SCENARIO_DEFINITION",
            "SCENARIO_DESCRIPTION",
            "SCENARIO_COMPOSITION",
            "SCENARIO_REVIEW_REQUEST",
        ] as const),
        forbidsExecutionCommand: true,
        forbidsRuntimeInvocation: true,
        forbidsPolicyMutation: true,
        forbidsAuthorityChange: true,
        forbidsExtensionMutation: true,
        definitionIsNotExecutionPlan: true,
        compositionIsNotExecutionSequence: true,
        publicationIsNotExecutionAuthorization: true,
        recommendationIsNotExecutionPermission: true,
    });
}

export function sampleParticipation(): ScenarioParticipationBoundary {
    return Object.freeze({
        boundaryId: "scen.participation.v1",
        participatesViaDeclaredContract: true,
        participatesViaDeclaredCapability: true,
        participatesViaDeclaredMetadata: true,
        forbidsForceParticipation: true,
        forbidsCreateCapability: true,
        forbidsModifyOwnership: true,
        forbidsReserveExtensionAuthority: true,
        forbidsImplicitDependencyCreation: true,
        forbidsImplicitCoordinationDependency: true,
        referencesSiblingsViaDeclaredContractsOnly: true,
    });
}

export function sampleCoordination(): ScenarioCoordinationBoundary {
    return Object.freeze({
        boundaryId: "scen.coordination.v1",
        integratesWithCoordinationReadOnly: true,
        mayProvideScenarioStructureReference: true,
        maySupportCoordinationPreparation: true,
        scenarioDefinitionIsNotCoordinationExecution: true,
        scenarioDefinitionIsNotCoordinationAuthority: true,
        coordinationIsNotScenarioAuthority: true,
        scenarioDoesNotRequireCoordination: true,
        coordinationMayConsumeScenarioAsReference: true,
        scenarioDoesNotControlCoordinationBehavior: true,
        scenarioVersionIsNotCoordinationPlanVersion: true,
        forbidsCoordinationDependencyOwnership: true,
    });
}

export function sampleValidation(): ScenarioValidationBoundary {
    return Object.freeze({
        boundaryId: "scen.validation.v1",
        integratesWithValidationReadOnly: true,
        validationResultIsNotScenarioControl: true,
        validationResultIsNotScenarioPublication: true,
        validationResultIsNotScenarioActivation: true,
        validationFailureDoesNotAutomaticallyModifyScenario: true,
        forbidsValidationDependencyOwnership: true,
    });
}

export function sampleAi(): ScenarioAiBoundary {
    return Object.freeze({
        boundaryId: "scen.ai.v1",
        mayReferenceAiCapability: true,
        mayDescribeAiRelatedParticipation: true,
        aiCapabilityReferenceIsNotAiAuthority: true,
        aiOutputIsNotScenarioDecision: true,
        forbidsEvaluateAiCorrectness: true,
        forbidsModifyAiDecisions: true,
        forbidsBecomeAiAuthority: true,
    });
}

export function sampleMemory(): ScenarioMemoryContract {
    return Object.freeze({
        memoryContractId: "scen.memory.v1",
        layers: Object.freeze([
            "SCENARIO_DRAFT_RECORD",
            "SCENARIO_VERSION_RECORD",
            "SCENARIO_HISTORY_RECORD",
        ] as const),
        memoryIsNotRuntimeState: true,
        memoryIsNotCoreState: true,
        memoryIsNotGovernanceState: true,
        memoryIsNotExecutionState: true,
        ownershipExplicitlyDeclared: true,
        memoryNeverGrantsAuthority: true,
        historyDoesNotBecomeArchitectureState: true,
        scenarioVersionIsNotExtensionContractVersion: true,
        scenarioVersionIsNotCapabilityVersion: true,
    });
}

export function sampleSecurity(): ScenarioSecurityContract {
    return Object.freeze({
        securityContractId: "scen.security.v1",
        forbidsGrantPrivileges: true,
        forbidsBypassAuthentication: true,
        forbidsModifySecurityPolicy: true,
        forbidsExposePrivateExtensionState: true,
        forbidsCreateHiddenDependencies: true,
        forbidsCreateImplicitScenarioDependency: true,
        forbidsForgeScenarioDefinition: true,
        forbidsSuppressValidationResult: true,
    });
}

export function sampleSelf(): SelfScenarioRestriction {
    return Object.freeze({
        restrictionId: "scen.self.v1",
        forbidsApproveOwnAuthority: true,
        forbidsModifyOwnContract: true,
        forbidsCertifyOwnCorrectness: true,
        forbidsValidateOwnSecurityCompliance: true,
        requiresIndependentValidation: true,
        independentAuthorityExternalToInstance: true,
    });
}

export function sampleRegistration(): ScenarioRegistrationContract {
    return Object.freeze({
        registrationContractId: "scen.registration.v1",
        operationLabel: "registerScenarioProvider",
        requiredFields: Object.freeze([
            "metadata",
            "authority",
            "capabilities",
            "version",
            "scenarioDomainScope",
            "supportedContracts",
            "securityProfile",
            "determinismProfile",
        ] as const),
        authorityMustBeScenarioDesigner: true,
        registrationProvidesIdentificationOnly: true,
        registrationDoesNotGrantExecutionAuthority: true,
        registrationDoesNotGrantScenarioApproval: true,
    });
}

export function sampleDiscovery(): ScenarioDiscoveryContract {
    return Object.freeze({
        discoveryContractId: "scen.discovery.v1",
        operationLabel: "discoverScenarios",
        returnsScenarioMetadataOnly: true,
        forbidsExecuteScenario: true,
        forbidsModifyScenarioDefinition: true,
        isNotRuntimeDiscoveryEngine: true,
    });
}

export function sampleSelection(): ScenarioSelectionContract {
    return Object.freeze({
        selectionContractId: "scen.selection.v1",
        operationLabel: "recommendScenario",
        producesRecommendationOnly: true,
        recommendationIsNotOptimizationAuthority: true,
        recommendationIsNotDecisionAuthority: true,
        forbidsAuthorizeExecution: true,
        forbidsModifyScenarioDefinition: true,
        forbidsCreateScenarioAuthority: true,
        isNotRuntimeSelectionEngine: true,
    });
}

export function sampleDeterminism(): ScenarioDeterminismPolicy {
    return Object.freeze({
        policyId: "scen.determinism.v1",
        requiredMetadata: Object.freeze([
            "scenarioVersion",
            "definitionHash",
            "referenceHash",
            "contractVersion",
            "participantVersion",
            "referenceResolutionVersion",
            "constraintVersion",
            "environmentVersion",
            "configurationVersion",
            "timestamp",
        ] as const),
    });
}

export function baseScenarioValidator(): ScenarioValidator {
    return new ScenarioValidator()
        .withLayerId("scen-layer-ok")
        .withArchitectureVersion("ASA-ARCH-41.0")
        .withStructuralVersion("0.5")
        .withSchemaVersion("0.5")
        .withSourceFramework(establishFramework())
        .withExtensionContract(sampleExtensionContract())
        .withScenarioContract(sampleScenarioContract())
        .withDefinitionContract(sampleDefinition())
        .withCompositionContract(sampleComposition())
        .withLifecycleContract(sampleLifecycle())
        .withProviderRole(sampleProvider())
        .withInputBoundary(sampleInput())
        .withOutputBoundary(sampleOutput())
        .withParticipationBoundary(sampleParticipation())
        .withCoordinationBoundary(sampleCoordination())
        .withValidationBoundary(sampleValidation())
        .withAiBoundary(sampleAi())
        .withMemoryContract(sampleMemory())
        .withSecurityContract(sampleSecurity())
        .withSelfScenarioRestriction(sampleSelf())
        .withRegistrationContract(sampleRegistration())
        .withDiscoveryContract(sampleDiscovery())
        .withSelectionContract(sampleSelection())
        .withDeterminismPolicy(sampleDeterminism());
}
