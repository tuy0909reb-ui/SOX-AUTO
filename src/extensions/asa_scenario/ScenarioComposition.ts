/**
 * ASA-ARCH-41.0 - Scenario Composition Contract (Draft 0.5)
 *
 * Dynamic Composition ≠ Dynamic Execution.
 * Composition Mode ≠ Execution Mode.
 */

/** Composition type kinds. */
export type ScenarioCompositionType = "static" | "dynamic" | "conditional";

/** Required ScenarioComposition fields. */
export type ScenarioCompositionField =
    | "scenarioId"
    | "components"
    | "relationships"
    | "constraints"
    | "compositionType"
    | "timestamp";

/**
 * Scenario Composition Contract — schema surface only.
 */
export interface ScenarioCompositionContract {
    readonly compositionContractId: string;
    readonly requiredFields: ReadonlyArray<ScenarioCompositionField>;
    readonly allowedCompositionTypes: ReadonlyArray<ScenarioCompositionType>;
    readonly compositionDefinesStructureOnly: true;
    readonly compositionDoesNotDefineExecutionOrder: true;
    readonly compositionDoesNotOwnExtensions: true;
    readonly compositionDoesNotModifyExtensionOwnership: true;
    readonly dynamicCompositionIsNotDynamicExecution: true;
    readonly compositionModeIsNotExecutionMode: true;
}

export function freezeScenarioCompositionContract(
    contract: ScenarioCompositionContract
): ScenarioCompositionContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
        allowedCompositionTypes: Object.freeze([
            ...contract.allowedCompositionTypes,
        ]),
    });
}
