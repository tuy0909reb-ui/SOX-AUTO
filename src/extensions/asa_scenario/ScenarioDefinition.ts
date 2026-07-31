/**
 * ASA-ARCH-41.0 - Scenario Definition Contract (Draft 0.5)
 *
 * CapabilityReference ≠ Activation / Dependency.
 * intendedOutcomeDescription ≠ Execution Result.
 * Scenario lifecycle ≠ Extension lifecycle.
 */

/** Required ScenarioDefinition fields. */
export type ScenarioDefinitionField =
    | "id"
    | "name"
    | "objective"
    | "scenarioScope"
    | "scenarioParticipants"
    | "capabilityReferences"
    | "interactionIntent"
    | "constraints"
    | "intendedOutcomeDescription"
    | "version"
    | "timestamp";

/** Scenario definition lifecycle states. */
export type ScenarioDefinitionLifecycleState =
    | "Created"
    | "Defined"
    | "Reviewed"
    | "Released"
    | "Deprecated"
    | "Archived"
    | "Rejected";

/**
 * Scenario Definition Contract — schema surface only.
 */
export interface ScenarioDefinitionContract {
    readonly definitionContractId: string;
    readonly requiredFields: ReadonlyArray<ScenarioDefinitionField>;
    readonly capabilityReferencesIdentifyDeclaredOnly: true;
    readonly capabilityReferenceDoesNotReserve: true;
    readonly capabilityReferenceDoesNotActivate: true;
    readonly capabilityReferenceDoesNotCreateDependency: true;
    readonly interactionIntentDescribesRelationshipsOnly: true;
    readonly interactionIntentDoesNotDefineExecutionSequence: true;
    readonly intendedOutcomeIsDescriptiveOnly: true;
    readonly intendedOutcomeIsNotExecutionResult: true;
}

/**
 * Scenario Lifecycle Contract.
 */
export interface ScenarioLifecycleContract {
    readonly lifecycleContractId: string;
    readonly allowedStates: ReadonlyArray<ScenarioDefinitionLifecycleState>;
    readonly scenarioLifecycleIsNotExtensionLifecycle: true;
    readonly releasedDoesNotMeanApproved: true;
    readonly releasedDoesNotMeanExecutable: true;
    readonly transitionsMustBeExplicit: true;
}

export function freezeScenarioDefinitionContract(
    contract: ScenarioDefinitionContract
): ScenarioDefinitionContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}

export function freezeScenarioLifecycleContract(
    contract: ScenarioLifecycleContract
): ScenarioLifecycleContract {
    return Object.freeze({
        ...contract,
        allowedStates: Object.freeze([...contract.allowedStates]),
    });
}
