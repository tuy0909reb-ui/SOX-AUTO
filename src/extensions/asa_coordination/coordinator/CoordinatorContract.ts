/**
 * ASA-ARCH-40.0 - Coordinator Extension Contract (Draft 0.4)
 *
 * Declarative metadata / authority / compatibility surface for
 * the Extension Coordination Layer.
 *
 * Authority is fixed to COORDINATOR (introduced by this Extension;
 * not a mutation of frozen ExtensionAuthorityLevel).
 * Coordination ≠ Authority; Coordination ≠ Execution.
 * SHALL NOT contain routing / execution / workflow engines.
 */

import type { ExtensionFrameworkLifecycleState } from "../../../extension_development_framework/ExtensionDevelopmentFrameworkTypes";

/** Fixed Extension Identifier for ASA-COORDINATION. */
export type AsaCoordinationExtensionId = "ASA-COORDINATION";

/** Architecture domain label. */
export type AsaCoordinationDomainLabel = "Coordination";

/**
 * Local framework-domain label for this Extension.
 * Distinct from frozen ExtensionDomainKind (OPS | AI | CONNECT).
 */
export type AsaCoordinationFrameworkDomain = "COORDINATION";

/**
 * COORDINATOR authority introduced by ASA-ARCH-40.0.
 * Not extracted from frozen ExtensionAuthorityLevel.
 */
export type CoordinationAuthorityLevel = "COORDINATOR";

/**
 * ASA-COORDINATION Extension Metadata Contract.
 * Authority is structurally fixed to COORDINATOR.
 */
export interface CoordinatorContract {
    readonly id: AsaCoordinationExtensionId;
    readonly version: string;
    readonly domain: AsaCoordinationDomainLabel;
    readonly frameworkDomain: AsaCoordinationFrameworkDomain;
    readonly authority: CoordinationAuthorityLevel;
    readonly lifecycle: ExtensionFrameworkLifecycleState;
    readonly compatibility: ReadonlyArray<string>;
    readonly description: string;
    readonly governanceOwner: string;
    readonly coordinationIsNotAuthority: true;
    readonly coordinationIsNotExecution: true;
    readonly routingIsNotExecution: true;
    readonly sequenceIsNotControl: true;
    readonly aggregationIsNotDecision: true;
    readonly compositionIsNotMutation: true;
    readonly coordinationPlanIsNotExecutionPlan: true;
    readonly coordinationSequenceIsNotExecutionSequence: true;
    readonly interactionOrderingIsNotExecutionOrdering: true;
    readonly coordinationIsNotWorkflowExecution: true;
    readonly coordinationIsNotGovernance: true;
    readonly recommendationIsNotExecution: true;
    readonly authorityIsMetadataOnly: true;
    readonly forbidsExecute: true;
    readonly forbidsInitiateCapabilityExecution: true;
    readonly forbidsOverrideExtensionAuthority: true;
    readonly forbidsExtensionContractMutation: true;
    readonly forbidsCoreMutation: true;
    readonly forbidsFrameworkMutation: true;
    readonly forbidsGovernanceMutation: true;
    readonly forbidsGrantAuthority: true;
    readonly forbidsBypassValidation: true;
    readonly forbidsRuntimeStateMutation: true;
    readonly forbidsAutomaticDecisionMaking: true;
    readonly forbidsAutomaticCorrection: true;
    readonly forbidsAuthorityEscalation: true;
    readonly permitsObserveExtensionMetadata: true;
    readonly permitsResolveDeclaredContractReferences: true;
    readonly permitsCreateCoordinationPlan: true;
    readonly permitsDefineInteractionOrdering: true;
    readonly permitsAggregateExtensionResults: true;
    readonly permitsGenerateCoordinationReport: true;
    readonly permitsGenerateInteractionRecommendation: true;
    readonly permitsRequestReview: true;
}

export function freezeCoordinatorContract(
    contract: CoordinatorContract
): CoordinatorContract {
    return Object.freeze({
        ...contract,
        compatibility: Object.freeze([...contract.compatibility]),
    });
}
