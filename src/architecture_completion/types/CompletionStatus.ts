/**
 * ASA-ARCH-50.0 — CompletionStatus（evaluation evidence only）
 */

export enum CompletionStatus {
    COMPLETE = "COMPLETE",
    INCOMPLETE = "INCOMPLETE",
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE",
}

export const COMPLETION_STATUSES: readonly CompletionStatus[] = Object.freeze([
    CompletionStatus.COMPLETE,
    CompletionStatus.INCOMPLETE,
    CompletionStatus.INSUFFICIENT_EVIDENCE,
]);

export function isCompletionStatus(value: string): value is CompletionStatus {
    return (COMPLETION_STATUSES as readonly string[]).includes(value);
}
