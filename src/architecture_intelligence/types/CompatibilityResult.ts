/**
 * ASA-ARCH-47.0 — CompatibilityResult（declaration only）
 */

export enum CompatibilityResult {
    COMPATIBLE = "COMPATIBLE",
    INCOMPATIBLE = "INCOMPATIBLE",
    REQUIRES_REVIEW = "REQUIRES_REVIEW",
    UNKNOWN = "UNKNOWN",
}

export const COMPATIBILITY_RESULTS: readonly CompatibilityResult[] =
    Object.freeze([
        CompatibilityResult.COMPATIBLE,
        CompatibilityResult.INCOMPATIBLE,
        CompatibilityResult.REQUIRES_REVIEW,
        CompatibilityResult.UNKNOWN,
    ]);

export function isCompatibilityResult(
    value: string
): value is CompatibilityResult {
    return (COMPATIBILITY_RESULTS as readonly string[]).includes(value);
}
