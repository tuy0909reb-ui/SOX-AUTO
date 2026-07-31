/**
 * ASA-ARCH-41.0 - Scenario Extension Contract (Draft 0.5)
 *
 * Declarative metadata / authority / operations surface for
 * the Extension Scenario Definition Layer.
 *
 * Authority is fixed to SCENARIO_DESIGNER (Declarative Authority;
 * not a mutation of frozen ExtensionAuthorityLevel).
 * Scenario ≠ Authority; Scenario ≠ Execution.
 * SHALL NOT contain scenario / workflow / execution engines.
 */

import type { ExtensionFrameworkLifecycleState } from "../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/** Fixed Extension Identifier for ASA-SCENARIO. */
export type AsaScenarioExtensionId = "ASA-SCENARIO";

/** Architecture domain label. */
export type AsaScenarioDomainLabel = "Scenario";

/**
 * Local framework-domain label for this Extension.
 * Distinct from frozen ExtensionDomainKind (OPS | AI | CONNECT).
 */
export type AsaScenarioFrameworkDomain = "SCENARIO";

/**
 * SCENARIO_DESIGNER authority introduced by ASA-ARCH-41.0.
 * Declarative Authority only — not extracted from frozen ExtensionAuthorityLevel.
 */
export type ScenarioAuthorityLevel = "SCENARIO_DESIGNER";

/** Declared Scenario Contract operations. */
export type ScenarioOperation =
    | "define"
    | "describe"
    | "composeReference"
    | "addConstraint"
    | "review";

/**
 * Scenario Extension Metadata Contract.
 * Authority is structurally fixed to SCENARIO_DESIGNER.
 */
export interface ScenarioExtensionContract {
    readonly id: AsaScenarioExtensionId;
    readonly version: string;
    readonly domain: AsaScenarioDomainLabel;
    readonly frameworkDomain: AsaScenarioFrameworkDomain;
    readonly authority: ScenarioAuthorityLevel;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly scenarioIsNotAuthority: true;
    readonly scenarioIsNotExecution: true;
    readonly scenarioDefinitionIsNotExecutionPlan: true;
    readonly scenarioDefinitionIsNotCoordinationPlan: true;
    readonly scenarioIsNotWorkflowEngine: true;
    readonly compositionIsNotInvocation: true;
    readonly referenceIsNotDependency: true;
    readonly descriptionIsNotDecision: true;
    readonly constraintIsNotPolicy: true;
    readonly scenarioIsNotGovernance: true;
    readonly interactionIntentIsNotExecutionSequence: true;
    readonly interactionIntentIsNotExecutionOrder: true;
    readonly declarativeAuthorityIsNotOperationalAuthority: true;
    readonly scenarioDescriptionIsNotExecutionPermission: true;
    readonly scenarioDefinitionIsNotApprovalResult: true;
    readonly forbidsExecute: true;
    readonly forbidsInvokeRuntime: true;
    readonly forbidsModifyExtensionContract: true;
    readonly forbidsCreateExtensionAuthority: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsFrameworkMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsOverrideValidationResult: true;
    readonly forbidsBypassCoordinationBoundary: true;
    readonly forbidsGenerateExecutionPermission: true;
    readonly forbidsApproveScenarioExecution: true;
    readonly forbidsAuthorityEscalation: true;
    readonly permitsDefineScenarioMetadata: true;
    readonly permitsReferenceDeclaredExtensionCapabilities: true;
    readonly permitsDefineScenarioObjective: true;
    readonly permitsDefineExpectedInteraction: true;
    readonly permitsDefineScenarioConstraints: true;
    readonly permitsGenerateScenarioDescription: true;
    readonly permitsRequestReview: true;
}

/**
 * Scenario Contract — method surface only.
 */
export interface ScenarioContract {
    readonly contractId: string;
    readonly operations: ReadonlyArray<ScenarioOperation>;
    readonly technologyIndependent: true;
    readonly forbidsVendorCoupling: true;
    readonly forbidsExecute: true;
    readonly forbidsInvokeRuntime: true;
    readonly forbidsAuthorize: true;
    readonly forbidsMutateExtension: true;
}

export function freezeScenarioExtensionContract(
    contract: ScenarioExtensionContract
): ScenarioExtensionContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}

export function freezeScenarioContract(
    contract: ScenarioContract
): ScenarioContract {
    return Object.freeze({
        ...contract,
        operations: Object.freeze([...contract.operations]),
    });
}
