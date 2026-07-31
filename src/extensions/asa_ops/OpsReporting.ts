/**
 * ASA-ARCH-36.0 - ASA-OPS Reporting Layer (Draft 0.4)
 *
 * Declarative Operational Status Reporting contract.
 * Display / notification only — does not mutate Runtime state.
 */

/** Reporting input sources. */
export type OpsReportingInputKind = "HEALTH" | "AUDIT" | "MONITORING";

/** Reporting output kinds. */
export type OpsReportingOutputKind =
    | "HEALTH_SUMMARY"
    | "AUDIT_SUMMARY"
    | "MONITORING_SUMMARY"
    | "OPERATIONAL_METRICS";

/**
 * Reporting Layer Contract.
 */
export interface OpsReportingContract {
    readonly reportingId: string;
    readonly responsibility: "OPERATIONAL_STATUS_REPORTING";
    readonly inputs: ReadonlyArray<OpsReportingInputKind>;
    readonly outputs: ReadonlyArray<OpsReportingOutputKind>;
    readonly displayAndNotificationOnly: true;
    readonly forbidsRuntimeStateMutation: true;
}

export function freezeOpsReportingContract(
    contract: OpsReportingContract
): OpsReportingContract {
    return Object.freeze({
        ...contract,
        inputs: Object.freeze([...contract.inputs]),
        outputs: Object.freeze([...contract.outputs]),
    });
}
