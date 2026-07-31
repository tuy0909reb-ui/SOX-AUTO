/**
 * ASA-ARCH-39.0 - Validator Registration / Discovery / Selection / Fallback (Draft 0.4)
 *
 * Declarative registry surface only — not discovery/selection engines.
 */

/** Validation Provider lifecycle states. */
export type ValidationProviderLifecycleState =
    | "Created"
    | "Initialized"
    | "Active"
    | "Failed"
    | "Suspended"
    | "Reinitialized"
    | "Terminated";

/**
 * Validator Registration Contract.
 */
export interface ValidatorRegistrationContract {
    readonly registrationContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "metadata"
        | "authority"
        | "capabilities"
        | "version"
        | "validationScope"
        | "securityProfile"
        | "ruleVersion"
        | "validationModel"
    >;
    readonly authorityMustBeValidator: true;
}

/**
 * Validator Discovery Contract — criteria declaration only.
 */
export interface ValidatorDiscoveryContract {
    readonly discoveryContractId: string;
    readonly operationLabel: "discoverValidators";
    readonly criteriaDeclaredStructurally: true;
    readonly consumesExtensionRegistryByReference: true;
    readonly registryIsNotExecutionAuthority: true;
    readonly forbidsFrameworkMutation: true;
    readonly isNotRuntimeDiscoveryEngine: true;
}

/**
 * Validator Selection Contract — criteria declaration only.
 */
export interface ValidatorSelectionContract {
    readonly selectionContractId: string;
    readonly operationLabel: "selectValidator";
    readonly criteriaDeclaredStructurally: true;
    readonly forbidsAuthorityEscalation: true;
    readonly forbidsAutonomousExecution: true;
    readonly isNotRuntimeSelectionEngine: true;
}

/**
 * Fallback Strategy Contract.
 */
export interface ValidatorFallbackStrategyContract {
    readonly fallbackContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "fallbackValidator"
        | "manualValidationMode"
        | "validationConfidence"
    >;
    readonly manualModePreservesHumanAuthority: true;
}

/**
 * Validation Lifecycle Contract — explicit transition surface.
 */
export interface ValidationLifecycleContract {
    readonly lifecycleContractId: string;
    readonly allowedStates: ReadonlyArray<ValidationProviderLifecycleState>;
    readonly transitionsMustBeExplicit: true;
}

export function freezeValidatorRegistrationContract(
    contract: ValidatorRegistrationContract
): ValidatorRegistrationContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeValidatorDiscoveryContract(
    contract: ValidatorDiscoveryContract
): ValidatorDiscoveryContract {
    return Object.freeze({ ...contract });
}

export function freezeValidatorSelectionContract(
    contract: ValidatorSelectionContract
): ValidatorSelectionContract {
    return Object.freeze({ ...contract });
}

export function freezeValidatorFallbackStrategyContract(
    contract: ValidatorFallbackStrategyContract
): ValidatorFallbackStrategyContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeValidationLifecycleContract(
    contract: ValidationLifecycleContract
): ValidationLifecycleContract {
    return Object.freeze({
        ...contract,
        allowedStates: Object.freeze([...contract.allowedStates]),
    });
}
