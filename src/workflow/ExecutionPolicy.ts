import { ErrorPolicyKind, SchedulingPolicyKind } from "../orchestration/types";

/**
 * Declares execution behavior only.
 * SHALL NOT perform execution control.
 * Runtime control remains with Orchestrator (20.9.x) / future 21.5.
 */
export interface ExecutionPolicy {
    readonly errorPolicy?: ErrorPolicyKind;
    readonly schedulingPolicy?: SchedulingPolicyKind;
    readonly maxConcurrency?: number;
    /** Declarative retry intent only — not executed by Workflow Core. */
    readonly retryDeclared?: boolean;
    /** Declarative timeout intent only — not executed by Workflow Core. */
    readonly timeoutDeclared?: boolean;
}

export function freezeExecutionPolicy(policy: ExecutionPolicy): Readonly<ExecutionPolicy> {
    return Object.freeze({ ...policy });
}

/**
 * ExecutionPolicy helpers — declarative inspection only.
 */
export class ExecutionPolicyView {
    constructor(private readonly policy: Readonly<ExecutionPolicy>) {}

    get declared(): Readonly<ExecutionPolicy> {
        return this.policy;
    }

    /** No execution control methods are provided by design. */
}
