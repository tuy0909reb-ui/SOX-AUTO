/**
 * ASA-ARCH-46.0 — EvolutionLifecycleState
 * Declaration reference only — not runtime execution state.
 * Forbidden: ACTIVE / ENABLE / ACTIVATE / EXECUTE / RUN.
 */

export enum EvolutionLifecycleState {
    PROPOSED = "PROPOSED",
    DESIGNING = "DESIGNING",
    APPROVED = "APPROVED",
    IMPLEMENTING = "IMPLEMENTING",
    VERIFIED = "VERIFIED",
    REGISTERED = "REGISTERED",
    FROZEN = "FROZEN",
    SUPERSEDED = "SUPERSEDED",
}

export const EVOLUTION_LIFECYCLE_STATES: readonly EvolutionLifecycleState[] =
    Object.freeze([
        EvolutionLifecycleState.PROPOSED,
        EvolutionLifecycleState.DESIGNING,
        EvolutionLifecycleState.APPROVED,
        EvolutionLifecycleState.IMPLEMENTING,
        EvolutionLifecycleState.VERIFIED,
        EvolutionLifecycleState.REGISTERED,
        EvolutionLifecycleState.FROZEN,
        EvolutionLifecycleState.SUPERSEDED,
    ]);

export function isEvolutionLifecycleState(
    value: string
): value is EvolutionLifecycleState {
    return (EVOLUTION_LIFECYCLE_STATES as readonly string[]).includes(value);
}
