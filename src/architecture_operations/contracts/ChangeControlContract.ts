/**
 * ASA-ARCH-44.0 — ChangeControlContract
 * Architecture change impact declaration only.
 * Does not execute changes or perform Ch42 impact evaluation.
 */

export interface ChangeControlContract {
    readonly change: string;
    readonly target: string;
    readonly dependencyImpact: boolean;
    readonly compatibilityImpact: boolean;
    readonly artifactImpact: boolean;
    readonly freezeImpact: boolean;
    readonly requiresVerification: boolean;
    readonly requiresHumanApproval: boolean;
    readonly evolutionReference: string | null;
    readonly doesNotExecuteChanges: true;
    readonly doesNotPerformImpactEvaluation: true;
    readonly consumesPublishedProposalsOnly: true;
    readonly forbidsInvokeEvolutionIntelligence: true;
}

export function freezeChangeControlContract(
    declaration: Omit<
        ChangeControlContract,
        | "doesNotExecuteChanges"
        | "doesNotPerformImpactEvaluation"
        | "consumesPublishedProposalsOnly"
        | "forbidsInvokeEvolutionIntelligence"
    >
): ChangeControlContract {
    return Object.freeze({
        ...declaration,
        doesNotExecuteChanges: true,
        doesNotPerformImpactEvaluation: true,
        consumesPublishedProposalsOnly: true,
        forbidsInvokeEvolutionIntelligence: true,
    });
}
