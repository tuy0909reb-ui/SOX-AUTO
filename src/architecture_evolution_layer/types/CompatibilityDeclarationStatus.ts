/**
 * ASA-ARCH-46.0 — CompatibilityDeclarationStatus
 * Declaration of compatibility evaluation — not runtime policy.
 */

export enum CompatibilityDeclarationStatus {
    REQUIRED = "REQUIRED",
    COMPATIBLE = "COMPATIBLE",
    INCOMPATIBLE = "INCOMPATIBLE",
    PRESERVED = "PRESERVED",
    UNKNOWN = "UNKNOWN",
}

export const COMPATIBILITY_DECLARATION_STATUSES: readonly CompatibilityDeclarationStatus[] =
    Object.freeze([
        CompatibilityDeclarationStatus.REQUIRED,
        CompatibilityDeclarationStatus.COMPATIBLE,
        CompatibilityDeclarationStatus.INCOMPATIBLE,
        CompatibilityDeclarationStatus.PRESERVED,
        CompatibilityDeclarationStatus.UNKNOWN,
    ]);

export function isCompatibilityDeclarationStatus(
    value: string
): value is CompatibilityDeclarationStatus {
    return (COMPATIBILITY_DECLARATION_STATUSES as readonly string[]).includes(
        value
    );
}
