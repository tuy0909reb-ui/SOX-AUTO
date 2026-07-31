/**
 * ASA-ARCH-38.0 - AI Provider Registration / Discovery / Selection / Fallback (Draft 0.5)
 *
 * Declarative registry surface only — not discovery/selection engines.
 */

/** AI Provider lifecycle (runtime instance states). */
export type AiProviderLifecycleState =
    | "Created"
    | "Initialized"
    | "Active"
    | "Failed"
    | "Suspended"
    | "Reinitialized"
    | "Terminated";

/**
 * Provider Registration Contract.
 */
export interface AiProviderRegistrationContract {
    readonly registrationContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "metadata"
        | "authority"
        | "capabilities"
        | "version"
        | "providerType"
        | "securityProfile"
        | "memoryPolicy"
        | "determinismProfile"
    >;
    readonly authorityMustBeAdvisor: true;
}

/**
 * Provider Discovery Contract — criteria declaration only.
 */
export interface AiProviderDiscoveryContract {
    readonly discoveryContractId: string;
    readonly criteriaDeclaredStructurally: true;
    readonly consumesExtensionRegistryByReference: true;
    readonly forbidsFrameworkMutation: true;
    readonly isNotRuntimeDiscoveryEngine: true;
}

/**
 * Provider Selection Contract — criteria declaration only.
 */
export interface AiProviderSelectionContract {
    readonly selectionContractId: string;
    readonly criteriaDeclaredStructurally: true;
    readonly forbidsAuthorityEscalation: true;
    readonly forbidsAutonomousExecution: true;
    readonly isNotRuntimeSelectionEngine: true;
}

/**
 * Fallback Strategy Contract.
 */
export interface AiFallbackStrategyContract {
    readonly fallbackContractId: string;
    readonly requiredFields: ReadonlyArray<
        | "fallbackProvider"
        | "fallbackStrategy"
        | "fallbackConfidence"
        | "manualMode"
    >;
    readonly manualModePreservesHumanAuthority: true;
}

/**
 * AI Lifecycle Contract — explicit transition surface.
 */
export interface AiLifecycleContract {
    readonly lifecycleContractId: string;
    readonly allowedStates: ReadonlyArray<AiProviderLifecycleState>;
    readonly transitionsMustBeExplicit: true;
}

export function freezeAiProviderRegistrationContract(
    contract: AiProviderRegistrationContract
): AiProviderRegistrationContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeAiProviderDiscoveryContract(
    contract: AiProviderDiscoveryContract
): AiProviderDiscoveryContract {
    return Object.freeze({ ...contract });
}

export function freezeAiProviderSelectionContract(
    contract: AiProviderSelectionContract
): AiProviderSelectionContract {
    return Object.freeze({ ...contract });
}

export function freezeAiFallbackStrategyContract(
    contract: AiFallbackStrategyContract
): AiFallbackStrategyContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeAiLifecycleContract(
    contract: AiLifecycleContract
): AiLifecycleContract {
    return Object.freeze({
        ...contract,
        allowedStates: Object.freeze([...contract.allowedStates]),
    });
}
