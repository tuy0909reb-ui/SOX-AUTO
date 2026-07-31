/**
 * ASA-ARCH-36.0 - ASA-OPS Monitoring Layer (Draft 0.4)
 *
 * Declarative Runtime Observation / metrics contract.
 * Not a monitoring engine.
 */

/** Monitoring observation categories. */
export type OpsMonitoringTargetKind =
    | "CORE_HEALTH"
    | "EXTENSION_HEALTH"
    | "RUNTIME_HEALTH"
    | "PERFORMANCE_METRICS"
    | "LATENCY"
    | "AVAILABILITY"
    | "FAILURE_RATE"
    | "RESOURCE_USAGE";

/**
 * Monitoring Layer Contract.
 */
export interface OpsMonitoringContract {
    readonly monitoringId: string;
    readonly responsibility: "RUNTIME_OBSERVATION";
    readonly purpose: "SYSTEM_WIDE_OPERATIONAL_VISIBILITY";
    readonly targets: ReadonlyArray<OpsMonitoringTargetKind>;
    readonly forbidsStateMutation: true;
}

export function freezeOpsMonitoringContract(
    contract: OpsMonitoringContract
): OpsMonitoringContract {
    return Object.freeze({
        ...contract,
        targets: Object.freeze([...contract.targets]),
    });
}
