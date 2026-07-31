/**
 * ASA-ARCH-36.0 - ASA-OPS Logging Layer (Draft 0.4)
 *
 * Declarative Runtime Event Record contract.
 * Immutable record shape only — not a logging engine.
 */

/** Logging event categories. */
export type OpsLogEventKind =
    | "EXECUTION_EVENT"
    | "WORKFLOW_EVENT"
    | "EXTENSION_EVENT"
    | "ERROR_EVENT"
    | "SECURITY_EVENT";

/**
 * Immutable log record shape (structural).
 */
export interface OpsLogRecordShape {
    readonly immutableRecord: true;
    readonly requiresTimestamp: true;
    readonly requiresSourceIdentification: true;
    readonly requiresCorrelationId: true;
}

/**
 * Logging Layer Contract.
 */
export interface OpsLoggingContract {
    readonly loggingId: string;
    readonly responsibility: "RUNTIME_EVENT_RECORD";
    readonly eventKinds: ReadonlyArray<OpsLogEventKind>;
    readonly recordShape: OpsLogRecordShape;
}

export function freezeOpsLoggingContract(
    contract: OpsLoggingContract
): OpsLoggingContract {
    return Object.freeze({
        ...contract,
        eventKinds: Object.freeze([...contract.eventKinds]),
        recordShape: Object.freeze({ ...contract.recordShape }),
    });
}
