/**
 * ASA-ARCH-40.0 - Coordination Result Contract (Draft 0.4)
 *
 * STRUCTURED = coordination structure generated — not execution completed.
 */

/** Coordination result status. */
export type CoordinationResultStatus =
    | "STRUCTURED"
    | "PARTIAL"
    | "INCOMPLETE"
    | "UNKNOWN";

/** Required CoordinationResult fields. */
export type CoordinationResultField =
    | "id"
    | "planId"
    | "status"
    | "results"
    | "findings"
    | "timestamp"
    | "coordinatorVersion";

/**
 * Coordination Result Contract — schema surface only.
 */
export interface CoordinationResultContract {
    readonly resultContractId: string;
    readonly requiredFields: ReadonlyArray<CoordinationResultField>;
    readonly allowedStatuses: ReadonlyArray<CoordinationResultStatus>;
    readonly structuredMeansStructureGenerated: true;
    readonly structuredDoesNotMeanExecutionCompleted: true;
}

export function freezeCoordinationResultContract(
    contract: CoordinationResultContract
): CoordinationResultContract {
    return Object.freeze({
        ...contract,
        requiredFields: Object.freeze([...contract.requiredFields]),
        allowedStatuses: Object.freeze([...contract.allowedStatuses]),
    });
}
