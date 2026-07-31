/**
 * ASA-ARCH-40.0 - Coordination Provider / Boundaries (Draft 0.4)
 *
 * Provider role + input/output + participation + AI + security +
 * self-coordination + human authority preservation.
 * Structural declarations only.
 */

/** Allowed coordination input kinds. */
export type CoordinationInputKind =
    | "EXTENSION_METADATA"
    | "EXTENSION_CONTRACT_DEFINITION"
    | "DECLARED_CAPABILITY"
    | "REGISTRY_INFORMATION"
    | "VALIDATION_RESULT"
    | "AI_PROPOSAL_REFERENCE"
    | "OPS_OBSERVATION_REFERENCE"
    | "CONNECT_DATA_REFERENCE"
    | "GOVERNANCE_INPUT_SNAPSHOT"
    | "HUMAN_INSTRUCTION";

/** Allowed coordination output kinds. */
export type CoordinationOutputKind =
    | "COORDINATION_PLAN"
    | "COORDINATION_RESULT"
    | "COORDINATION_REPORT"
    | "INTERACTION_RECOMMENDATION"
    | "REVIEW_REQUEST";

/**
 * Coordination Provider role.
 * Coordination Provider ≠ Execution Provider.
 */
export interface CoordinationProviderRole {
    readonly roleId: string;
    readonly composesExtensionInteractions: true;
    readonly createsCoordinationPlans: true;
    readonly resolvesDeclaredContractRelationships: true;
    readonly aggregatesResults: true;
    readonly providesCoordinationInformation: true;
    readonly isNotExecutionProvider: true;
}

/**
 * Coordination Input Boundary.
 */
export interface CoordinationInputBoundary {
    readonly boundaryId: string;
    readonly allowedInputs: ReadonlyArray<CoordinationInputKind>;
    readonly inputIsReadOnly: true;
    readonly consumesDeclaredContractsOnly: true;
    readonly forbidsPrivateExtensionStateAccess: true;
    readonly forbidsInferUndeclaredCapability: true;
    readonly governanceSnapshotIsReferenceOnly: true;
    readonly governanceSnapshotGrantsNoAuthority: true;
    readonly governanceSnapshotImmutable: true;
    readonly humanInstructionIsCoordinationIntentOnly: true;
    readonly humanInstructionDoesNotBypassExtensionAuthority: true;
    readonly humanInstructionOutsideExtensionAuthorityModel: true;
    readonly humanInstructionIsNotAutomaticExecutionAuthorization: true;
}

/**
 * Coordination Output Boundary.
 */
export interface CoordinationOutputBoundary {
    readonly boundaryId: string;
    readonly allowedOutputs: ReadonlyArray<CoordinationOutputKind>;
    readonly forbidsExecutionCommand: true;
    readonly forbidsMutationRequest: true;
    readonly forbidsPolicyMutation: true;
    readonly forbidsRuntimeMutation: true;
    readonly forbidsAuthorityChange: true;
    readonly recommendationIsNotExecution: true;
    readonly planIsNotExecutionPlan: true;
    readonly forbidsAutomaticExecuteActions: true;
    readonly forbidsGenerateExecutionPermission: true;
}

/**
 * Extension Participation Boundary.
 */
export interface ExtensionParticipationBoundary {
    readonly boundaryId: string;
    readonly participatesViaDeclaredContract: true;
    readonly participatesViaDeclaredCapability: true;
    readonly participatesViaDeclaredMetadata: true;
    readonly participationIsVoluntary: true;
    readonly forbidsForceExtensionExecution: true;
    readonly forbidsCreateExtensionAuthority: true;
    readonly forbidsModifyExtensionOwnership: true;
    readonly referencesOpsConnectAiValidationViaDeclaredContractsOnly: true;
    readonly forbidsPrivateStateAccess: true;
    readonly forbidsImplicitDependencyCreation: true;
}

/**
 * Human / Authority Preservation Boundary.
 */
export interface HumanAuthorityPreservationBoundary {
    readonly boundaryId: string;
    readonly coordinatorCannotBecomeDecisionAuthority: true;
    readonly coordinatorCannotReplaceHumanOrGovernanceAuthority: true;
    readonly coordinatorCannotApproveOwnRecommendations: true;
    readonly flowIsCoordinatorToPlanToOwnerToAuthorityDecision: true;
}

/**
 * AI Integration Boundary.
 */
export interface CoordinationAiBoundary {
    readonly boundaryId: string;
    readonly mayConsumeAiProposalReference: true;
    readonly aiProposalIsNotCoordinationAuthority: true;
    readonly aiOutputIsNotExecutionInstruction: true;
    readonly forbidsEvaluateAiCorrectness: true;
    readonly forbidsModifyAiDecisions: true;
    readonly forbidsBecomeAiAuthority: true;
    readonly forbidsGenerateAiExecutionInstruction: true;
}

/**
 * Security Contract for Coordination.
 */
export interface CoordinationSecurityContract {
    readonly securityContractId: string;
    readonly forbidsGrantPrivileges: true;
    readonly forbidsBypassAuthentication: true;
    readonly forbidsOverrideSecurityPolicy: true;
    readonly forbidsModifyExtensionSecurity: true;
    readonly forbidsHideCoordinationFailure: true;
    readonly forbidsManipulateCoordinationResult: true;
    readonly forbidsForgeCoordinationContext: true;
    readonly forbidsSuppressExtensionFailure: true;
}

/**
 * Self Coordination Restriction.
 */
export interface SelfCoordinationRestriction {
    readonly restrictionId: string;
    readonly forbidsApproveOwnAuthority: true;
    readonly forbidsModifyOwnContract: true;
    readonly forbidsCertifyOwnCorrectness: true;
    readonly forbidsValidateOwnSecurityCompliance: true;
    readonly forbidsValidateOwnCoordinationCorrectness: true;
    readonly requiresIndependentValidation: true;
    readonly independentAuthorityExternalToInstance: true;
}

export function freezeCoordinationProviderRole(
    role: CoordinationProviderRole
): CoordinationProviderRole {
    return Object.freeze({ ...role });
}

export function freezeCoordinationInputBoundary(
    boundary: CoordinationInputBoundary
): CoordinationInputBoundary {
    return Object.freeze({
        ...boundary,
        allowedInputs: Object.freeze([...boundary.allowedInputs]),
    });
}

export function freezeCoordinationOutputBoundary(
    boundary: CoordinationOutputBoundary
): CoordinationOutputBoundary {
    return Object.freeze({
        ...boundary,
        allowedOutputs: Object.freeze([...boundary.allowedOutputs]),
    });
}

export function freezeExtensionParticipationBoundary(
    boundary: ExtensionParticipationBoundary
): ExtensionParticipationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeHumanAuthorityPreservationBoundary(
    boundary: HumanAuthorityPreservationBoundary
): HumanAuthorityPreservationBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeCoordinationAiBoundary(
    boundary: CoordinationAiBoundary
): CoordinationAiBoundary {
    return Object.freeze({ ...boundary });
}

export function freezeCoordinationSecurityContract(
    contract: CoordinationSecurityContract
): CoordinationSecurityContract {
    return Object.freeze({ ...contract });
}

export function freezeSelfCoordinationRestriction(
    restriction: SelfCoordinationRestriction
): SelfCoordinationRestriction {
    return Object.freeze({ ...restriction });
}
