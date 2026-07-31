/**
 * ASA-ARCH-40.0 - Coordinator Selection / Fallback / Lifecycle / Determinism (Draft 0.4)
 *
 * Structural declarations only — not selection / scheduling engines.
 */

/** Coordinator lifecycle states. */
export type CoordinatorLifecycleState =
    | "Created"
    | "Initialized"
    | "Active"
    | "Failed"
    | "Suspended"
    | "Reinitialized"
    | "Terminated";

/**
 * Coordinator Selection Contract — recommendation only.
 */
export interface CoordinatorSelectionContract {
    readonly selectionContractId: string;
    readonly operationLabel: "selectCoordinator";
    readonly criteriaDeclaredStructurally: true;
    readonly producesRecommendationOnly: true;
    readonly forbidsGrantOperationalAuthority: true;
    readonly forbidsAuthorityEscalation: true;
    readonly forbidsAutonomousExecution: true;
    readonly isNotRuntimeSelectionEngine: true;
}

/**
 * Fallback Strategy Contract.
 */
export interface CoordinatorFallbackStrategyContract {
    readonly fallbackContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "fallbackCoordinator"
        | "manualCoordinationMode"
        | "coordinationConfidence"
    >;
    readonly manualModePreservesHumanAuthority: true;
}

/**
 * Coordinator Lifecycle Contract.
 */
export interface CoordinatorLifecycleContract {
    readonly lifecycleContractId: string;
    readonly allowedStates: ReadonlyArray<CoordinatorLifecycleState>;
    readonly transitionsMustBeExplicit: true;
}

/**
 * Determinism metadata for coordination records.
 */
export interface CoordinationDeterminismPolicy {
    readonly policyId: string;
    readonly requiredMetadata: ReadonlyArray<
        | "coordinatorVersion"
        | "contractVersion"
        | "participantVersion"
        | "interactionVersion"
        | "contractResolutionVersion"
        | "orderingRuleVersion"
        | "environmentVersion"
        | "configurationVersion"
        | "timestamp"
    >;
}

export function freezeCoordinatorSelectionContract(
    contract: CoordinatorSelectionContract
): CoordinatorSelectionContract {
    return Object.freeze({ ...contract });
}

export function freezeCoordinatorFallbackStrategyContract(
    contract: CoordinatorFallbackStrategyContract
): CoordinatorFallbackStrategyContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeCoordinatorLifecycleContract(
    contract: CoordinatorLifecycleContract
): CoordinatorLifecycleContract {
    return Object.freeze({
        ...contract,
        allowedStates: Object.freeze([...contract.allowedStates]),
    });
}

export function freezeCoordinationDeterminismPolicy(
    policy: CoordinationDeterminismPolicy
): CoordinationDeterminismPolicy {
    return Object.freeze({
        ...policy,
        requiredMetadata: Object.freeze([...policy.requiredMetadata]),
    });
}
