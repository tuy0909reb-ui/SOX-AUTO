/**
 * ASA-ARCH-49.0 — ConstraintStatus
 */

export enum ConstraintStatus {
    SATISFIED = "SATISFIED",
    PARTIAL = "PARTIAL",
    VIOLATED = "VIOLATED",
    UNKNOWN = "UNKNOWN",
    NOT_EVALUATED = "NOT_EVALUATED",
}

export const CONSTRAINT_STATUSES: readonly ConstraintStatus[] = Object.freeze([
    ConstraintStatus.SATISFIED,
    ConstraintStatus.PARTIAL,
    ConstraintStatus.VIOLATED,
    ConstraintStatus.UNKNOWN,
    ConstraintStatus.NOT_EVALUATED,
]);

export function isConstraintStatus(value: string): value is ConstraintStatus {
    return (CONSTRAINT_STATUSES as readonly string[]).includes(value);
}
