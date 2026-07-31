/**
 * ASA-ARCH-36.0 - ASA-OPS Execution Trace Contract (Draft 0.4)
 *
 * Declarative Execution Path Visibility contract.
 * Trace declares path stages only — not a tracer runtime.
 */

/** Ordered execution path stages for visibility. */
export type OpsExecutionTraceStage =
    | "REQUEST"
    | "EXTENSION_IDENTIFIER"
    | "EXTENSION_BOUNDARY"
    | "WORKFLOW"
    | "CAPABILITY"
    | "EXECUTION"
    | "RESULT";

/**
 * Execution Trace Contract.
 */
export interface OpsExecutionTraceContract {
    readonly traceId: string;
    readonly purpose: "EXECUTION_PATH_VISIBILITY";
    readonly stages: ReadonlyArray<OpsExecutionTraceStage>;
    readonly observationOnly: true;
    readonly forbidsExecutionControl: true;
}

export function freezeOpsExecutionTraceContract(
    contract: OpsExecutionTraceContract
): OpsExecutionTraceContract {
    return Object.freeze({
        ...contract,
        stages: Object.freeze([...contract.stages]),
    });
}
