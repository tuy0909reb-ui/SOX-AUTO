/**
 * ASA-ARCH-40.0 - Coordination Plan Contract (Draft 0.4)
 *
 * interactionSequence defines coordination relationships only —
 * not execution ordering.
 */

/** Required CoordinationPlan fields. */
export type CoordinationPlanField =
    | "id"
    | "coordinationIntent"
    | "participants"
    | "interactionSequence"
    | "constraints"
    | "dependencies"
    | "expectedInteractionResult"
    | "timestamp";

/**
 * Coordination Plan Contract — schema surface only.
 */
export interface CoordinationPlanContract {
    readonly planContractId: string;
    readonly requiredFields: ReadonlyArray<CoordinationPlanField>;
    readonly interactionSequenceIsCoordinationRelationshipOnly: true;
    readonly interactionSequenceIsNotExecutionOrder: true;
    readonly planIsNotExecutionPlan: true;
}

export function freezeCoordinationPlanContract(
    contract: CoordinationPlanContract
): CoordinationPlanContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
    });
}
