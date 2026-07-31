/**
 * ASA-ARCH-36.0 - ASA-OPS Observation Contract (Draft 0.4)
 *
 * Declares observation targets only. Observation does not mutate state.
 */

/** Targets OPS may observe (read-only). */
export type OpsObservationTargetKind =
    | "CORE"
    | "WORKFLOW"
    | "CAPABILITY"
    | "EXTENSION"
    | "RUNTIME_STATE"
    | "OPERATIONAL_METRICS";

/**
 * Observation Contract — structural target declaration.
 * Observation only; no state mutation.
 */
export interface OpsObservationContract {
    readonly observationId: string;
    readonly targets: ReadonlyArray<OpsObservationTargetKind>;
    readonly observationOnly: true;
    readonly forbidsStateMutation: true;
}

export function freezeOpsObservationContract(
    contract: OpsObservationContract
): OpsObservationContract {
    return Object.freeze({
        ...contract,
        targets: Object.freeze([...contract.targets]),
    });
}
