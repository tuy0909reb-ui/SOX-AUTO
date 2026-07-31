/**
 * ASA-ARCH-36.0 - ASA-OPS Health Check Contract (Draft 0.4)
 *
 * Health Status is an Observation result and MUST NOT alter
 * Execution Permission.
 */

/** Health status values. */
export type OpsHealthStatus =
    | "Healthy"
    | "Warning"
    | "Critical"
    | "Unavailable";

/**
 * Health Check Contract.
 */
export interface OpsHealthContract {
    readonly healthId: string;
    readonly allowedStatuses: ReadonlyArray<OpsHealthStatus>;
    readonly statusIsObservationResult: true;
    readonly forbidsExecutionPermissionChange: true;
}

export function freezeOpsHealthContract(
    contract: OpsHealthContract
): OpsHealthContract {
    return Object.freeze({
        ...contract,
        allowedStatuses: Object.freeze([...contract.allowedStatuses]),
    });
}
