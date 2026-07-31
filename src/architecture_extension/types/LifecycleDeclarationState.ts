/**
 * ASA-ARCH-45.0 — LifecycleDeclarationState
 * Architectural declaration reference only — not runtime execution state.
 * Forbidden concepts (ACTIVE / ENABLE / ACTIVATE / EXECUTE / RUN) are absent.
 */

export enum LifecycleDeclarationState {
    REGISTERED = "REGISTERED",
    DESIGNING = "DESIGNING",
    VERIFIED = "VERIFIED",
    APPROVED = "APPROVED",
    DEPRECATED = "DEPRECATED",
    SUPERSEDED = "SUPERSEDED",
}

/** Contract-aligned alias (ExtensionLifecycleDeclarationState). */
export type ExtensionLifecycleDeclarationState = LifecycleDeclarationState;
export const ExtensionLifecycleDeclarationState = LifecycleDeclarationState;

export const LIFECYCLE_DECLARATION_STATES: readonly LifecycleDeclarationState[] =
    Object.freeze([
        LifecycleDeclarationState.REGISTERED,
        LifecycleDeclarationState.DESIGNING,
        LifecycleDeclarationState.VERIFIED,
        LifecycleDeclarationState.APPROVED,
        LifecycleDeclarationState.DEPRECATED,
        LifecycleDeclarationState.SUPERSEDED,
    ]);

export function isLifecycleDeclarationState(
    value: string
): value is LifecycleDeclarationState {
    return (LIFECYCLE_DECLARATION_STATES as readonly string[]).includes(value);
}
