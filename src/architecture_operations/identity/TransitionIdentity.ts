/**
 * ASA-ARCH-44.0 — TransitionIdentity
 * Immutable identity for a lifecycle transition record.
 */

export type TransitionIdentity = string & {
    readonly __brand: "TransitionIdentity";
};

export function createTransitionIdentity(value: string): TransitionIdentity {
    const v = value.trim();
    if (!v) {
        throw new Error("TransitionIdentity must be non-empty");
    }
    return Object.freeze(v) as TransitionIdentity;
}
