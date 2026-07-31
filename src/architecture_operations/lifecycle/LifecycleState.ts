/**
 * ASA-ARCH-44.0 — LifecycleState
 * Declared architecture lifecycle state only.
 * Contains no authority decision, validation result, or approval logic.
 */

export enum ArchitectureLifecycleState {
    REGISTERED = "REGISTERED",
    DESIGNING = "DESIGNING",
    IMPLEMENTED = "IMPLEMENTED",
    VERIFIED = "VERIFIED",
    FREEZE_CANDIDATE = "FREEZE_CANDIDATE",
    FROZEN = "FROZEN",
    SUPERSEDED = "SUPERSEDED",
}

export const LIFECYCLE_STATES: readonly ArchitectureLifecycleState[] =
    Object.freeze([
        ArchitectureLifecycleState.REGISTERED,
        ArchitectureLifecycleState.DESIGNING,
        ArchitectureLifecycleState.IMPLEMENTED,
        ArchitectureLifecycleState.VERIFIED,
        ArchitectureLifecycleState.FREEZE_CANDIDATE,
        ArchitectureLifecycleState.FROZEN,
        ArchitectureLifecycleState.SUPERSEDED,
    ]);

export function isLifecycleState(
    value: string
): value is ArchitectureLifecycleState {
    return (LIFECYCLE_STATES as readonly string[]).includes(value);
}
