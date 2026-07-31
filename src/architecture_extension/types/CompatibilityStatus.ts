/**
 * ASA-ARCH-45.0 — CompatibilityStatus
 * Contract compatibility declaration values only.
 * Compatibility does not grant authority or runtime capability.
 */

export enum CompatibilityStatus {
    COMPATIBLE = "COMPATIBLE",
    INCOMPATIBLE = "INCOMPATIBLE",
    REQUIRES_REVIEW = "REQUIRES_REVIEW",
    SUPERSEDED = "SUPERSEDED",
}

export const COMPATIBILITY_STATUSES: readonly CompatibilityStatus[] =
    Object.freeze([
        CompatibilityStatus.COMPATIBLE,
        CompatibilityStatus.INCOMPATIBLE,
        CompatibilityStatus.REQUIRES_REVIEW,
        CompatibilityStatus.SUPERSEDED,
    ]);

export function isCompatibilityStatus(
    value: string
): value is CompatibilityStatus {
    return (COMPATIBILITY_STATUSES as readonly string[]).includes(value);
}
