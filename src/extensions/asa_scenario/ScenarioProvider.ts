/**
 * ASA-ARCH-41.0 - Scenario Provider / Boundaries / Registry (Draft 0.5)
 *
 * Provider role + input/output + participation + coordination / validation /
 * AI / memory / security / self / registration / discovery / selection /
 * determinism. Structural declarations only.
 */

/** Allowed scenario input kinds. */
export type ScenarioInputKind =
    | "EXTENSION_METADATA"
    | "EXTENSION_CONTRACT_DEFINITION"
    | "DECLARED_CAPABILITY"
    | "REGISTRY_INFORMATION"
    | "COORDINATION_METADATA_REFERENCE"
    | "VALIDATION_RESULT_REFERENCE"
    | "AI_CAPABILITY_REFERENCE"
    | "OPS_OBSERVATION_REFERENCE"
    | "CONNECT_CAPABILITY_REFERENCE"
    | "HUMAN_INSTRUCTION";

/** Allowed scenario output kinds. */
export type ScenarioOutputKind =
    | "SCENARIO_DEFINITION"
    | "SCENARIO_DESCRIPTION"
    | "SCENARIO_COMPOSITION"
    | "SCENARIO_REVIEW_REQUEST";

/** Scenario memory layer kinds. */
export type ScenarioMemoryLayerKind =
    | "SCENARIO_DRAFT_RECORD"
    | "SCENARIO_VERSION_RECORD"
    | "SCENARIO_HISTORY_RECORD";

/**
 * Scenario Provider role.
 * Scenario Provider ≠ Execution Provider.
 */
export interface ScenarioProviderRole {
    readonly roleId: string;
    readonly operations: ReadonlyArray<
        | "createScenarioDefinition"
        | "describeScenario"
        | "composeReference"
        | "addConstraint"
        | "requestReview"
    >;
    readonly createsScenarioDefinitions: true;
    readonly resolvesDeclaredReferences: true;
    readonly describesExtensionComposition: true;
    readonly maintainsScenarioStructure: true;
    readonly providesScenarioInformation: true;
    readonly isNotExecutionProvider: true;
    readonly forbidsExecute: true;
    readonly forbidsInvokeRuntime: true;
    readonly forbidsAuthorize: true;
    readonly forbidsMutateExtension: true;
}

export interface ScenarioInputBoundary {
    readonly boundaryId: string;
    readonly allowedInputs: ReadonlyArray<ScenarioInputKind>;
    readonly inputIsReadOnly: true;
    readonly consumesDeclaredReferencesOnly: true;
    readonly forbidsPrivateExtensionStateAccess: true;
    readonly forbidsInferUndeclaredCapability: true;
    readonly humanInstructionIsScenarioIntentOnly: true;
    readonly humanInstructionIsNotExecutionAuthorization: true;
    readonly humanInstructionOutsideExtensionAuthorityModel: true;
    readonly humanInstructionIsNotAutomaticExecutionAuthorization: true;
}

export interface ScenarioOutputBoundary {
    readonly boundaryId: string;
    readonly allowedOutputs: ReadonlyArray<ScenarioOutputKind>;
    readonly forbidsExecutionCommand: true;
    readonly forbidsRuntimeInvocation: true;
    readonly forbidsPolicyMutation: true;
    readonly forbidsAuthorityChange: true;
    readonly forbidsExtensionMutation: true;
    readonly definitionIsNotExecutionPlan: true;
    readonly compositionIsNotExecutionSequence: true;
    readonly publicationIsNotExecutionAuthorization: true;
    readonly recommendationIsNotExecutionPermission: true;
}

export interface ScenarioParticipationBoundary {
    readonly boundaryId: string;
    readonly participatesViaDeclaredContract: true;
    readonly participatesViaDeclaredCapability: true;
    readonly participatesViaDeclaredMetadata: true;
    readonly forbidsForceParticipation: true;
    readonly forbidsCreateCapability: true;
    readonly forbidsModifyOwnership: true;
    readonly forbidsReserveExtensionAuthority: true;
    readonly forbidsImplicitDependencyCreation: true;
    readonly forbidsImplicitCoordinationDependency: true;
    readonly referencesSiblingsViaDeclaredContractsOnly: true;
}

export interface ScenarioCoordinationBoundary {
    readonly boundaryId: string;
    readonly integratesWithCoordinationReadOnly: true;
    readonly mayProvideScenarioStructureReference: true;
    readonly maySupportCoordinationPreparation: true;
    readonly scenarioDefinitionIsNotCoordinationExecution: true;
    readonly scenarioDefinitionIsNotCoordinationAuthority: true;
    readonly coordinationIsNotScenarioAuthority: true;
    readonly scenarioDoesNotRequireCoordination: true;
    readonly coordinationMayConsumeScenarioAsReference: true;
    readonly scenarioDoesNotControlCoordinationBehavior: true;
    readonly scenarioVersionIsNotCoordinationPlanVersion: true;
    readonly forbidsCoordinationDependencyOwnership: true;
}

export interface ScenarioValidationBoundary {
    readonly boundaryId: string;
    readonly integratesWithValidationReadOnly: true;
    readonly validationResultIsNotScenarioControl: true;
    readonly validationResultIsNotScenarioPublication: true;
    readonly validationResultIsNotScenarioActivation: true;
    readonly validationFailureDoesNotAutomaticallyModifyScenario: true;
    readonly forbidsValidationDependencyOwnership: true;
}

export interface ScenarioAiBoundary {
    readonly boundaryId: string;
    readonly mayReferenceAiCapability: true;
    readonly mayDescribeAiRelatedParticipation: true;
    readonly aiCapabilityReferenceIsNotAiAuthority: true;
    readonly aiOutputIsNotScenarioDecision: true;
    readonly forbidsEvaluateAiCorrectness: true;
    readonly forbidsModifyAiDecisions: true;
    readonly forbidsBecomeAiAuthority: true;
}

export interface ScenarioMemoryContract {
    readonly memoryContractId: string;
    readonly layers: ReadonlyArray<ScenarioMemoryLayerKind>;
    readonly memoryIsNotRuntimeState: true;
    readonly memoryIsNotCoreState: true;
    readonly memoryIsNotGovernanceState: true;
    readonly memoryIsNotExecutionState: true;
    readonly ownershipExplicitlyDeclared: true;
    readonly memoryNeverGrantsAuthority: true;
    readonly historyDoesNotBecomeArchitectureState: true;
    readonly scenarioVersionIsNotExtensionContractVersion: true;
    readonly scenarioVersionIsNotCapabilityVersion: true;
}

export interface ScenarioSecurityContract {
    readonly securityContractId: string;
    readonly forbidsGrantPrivileges: true;
    readonly forbidsBypassAuthentication: true;
    readonly forbidsModifySecurityPolicy: true;
    readonly forbidsExposePrivateExtensionState: true;
    readonly forbidsCreateHiddenDependencies: true;
    readonly forbidsCreateImplicitScenarioDependency: true;
    readonly forbidsForgeScenarioDefinition: true;
    readonly forbidsSuppressValidationResult: true;
}

export interface SelfScenarioRestriction {
    readonly restrictionId: string;
    readonly forbidsApproveOwnAuthority: true;
    readonly forbidsModifyOwnContract: true;
    readonly forbidsCertifyOwnCorrectness: true;
    readonly forbidsValidateOwnSecurityCompliance: true;
    readonly requiresIndependentValidation: true;
    readonly independentAuthorityExternalToInstance: true;
}

export interface ScenarioRegistrationContract {
    readonly registrationContractId: string;
    readonly operationLabel: "registerScenarioProvider";
    readonly requiredFields: ReadonlyArray<
        | "metadata"
        | "authority"
        | "capabilities"
        | "version"
        | "scenarioDomainScope"
        | "supportedContracts"
        | "securityProfile"
        | "determinismProfile"
    >;
    readonly authorityMustBeScenarioDesigner: true;
    readonly registrationProvidesIdentificationOnly: true;
    readonly registrationDoesNotGrantExecutionAuthority: true;
    readonly registrationDoesNotGrantScenarioApproval: true;
}

export interface ScenarioDiscoveryContract {
    readonly discoveryContractId: string;
    readonly operationLabel: "discoverScenarios";
    readonly returnsScenarioMetadataOnly: true;
    readonly forbidsExecuteScenario: true;
    readonly forbidsModifyScenarioDefinition: true;
    readonly isNotRuntimeDiscoveryEngine: true;
}

export interface ScenarioSelectionContract {
    readonly selectionContractId: string;
    readonly operationLabel: "recommendScenario";
    readonly producesRecommendationOnly: true;
    readonly recommendationIsNotOptimizationAuthority: true;
    readonly recommendationIsNotDecisionAuthority: true;
    readonly forbidsAuthorizeExecution: true;
    readonly forbidsModifyScenarioDefinition: true;
    readonly forbidsCreateScenarioAuthority: true;
    readonly isNotRuntimeSelectionEngine: true;
}

export interface ScenarioDeterminismPolicy {
    readonly policyId: string;
    readonly requiredMetadata: ReadonlyArray<
        | "scenarioVersion"
        | "definitionHash"
        | "referenceHash"
        | "contractVersion"
        | "participantVersion"
        | "referenceResolutionVersion"
        | "constraintVersion"
        | "environmentVersion"
        | "configurationVersion"
        | "timestamp"
    >;
}

export function freezeScenarioProviderRole(
    role: ScenarioProviderRole
): ScenarioProviderRole {
    return Object.freeze({
        ...role,
        operations: Object.freeze([...role.operations]),
    });
}

export function freezeScenarioInputBoundary(
    boundary: ScenarioInputBoundary
): ScenarioInputBoundary {
    return Object.freeze({
        ...boundary,
        allowedInputs: Object.freeze([...boundary.allowedInputs]),
    });
}

export function freezeScenarioOutputBoundary(
    boundary: ScenarioOutputBoundary
): ScenarioOutputBoundary {
    return Object.freeze({
        ...boundary,
        allowedOutputs: Object.freeze([...boundary.allowedOutputs]),
    });
}

export function freezeScenarioParticipationBoundary(
    boundary: ScenarioParticipationBoundary
): ScenarioParticipationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeScenarioCoordinationBoundary(
    boundary: ScenarioCoordinationBoundary
): ScenarioCoordinationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeScenarioValidationBoundary(
    boundary: ScenarioValidationBoundary
): ScenarioValidationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeScenarioAiBoundary(
    boundary: ScenarioAiBoundary
): ScenarioAiBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeScenarioMemoryContract(
    contract: ScenarioMemoryContract
): ScenarioMemoryContract {
    return Object.freeze({
        ...contract,
        layers: Object.freeze([...contract.layers]),
    });
}

export function freezeScenarioSecurityContract(
    contract: ScenarioSecurityContract
): ScenarioSecurityContract {
    return Object.freeze({ ...contract });
}

export function freezeSelfScenarioRestriction(
    restriction: SelfScenarioRestriction
): SelfScenarioRestriction {
    return Object.freeze({ ...restriction });
}

export function freezeScenarioRegistrationContract(
    contract: ScenarioRegistrationContract
): ScenarioRegistrationContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeScenarioDiscoveryContract(
    contract: ScenarioDiscoveryContract
): ScenarioDiscoveryContract {
    return Object.freeze({ ...contract });
}

export function freezeScenarioSelectionContract(
    contract: ScenarioSelectionContract
): ScenarioSelectionContract {
    return Object.freeze({ ...contract });
}

export function freezeScenarioDeterminismPolicy(
    policy: ScenarioDeterminismPolicy
): ScenarioDeterminismPolicy {
    return Object.freeze({
        ...policy,
        requiredMetadata: Object.freeze([...policy.requiredMetadata]),
    });
}
