/**
 * ASA-ARCH-46.0 — FoundationCompatibilityContract
 */

export interface FoundationCompatibilityContract {
    readonly contractId: "FoundationCompatibilityContract";
    readonly foundationId: "ASA-FOUNDATION-1.0";
    readonly foundationMustRemainFrozen: true;
    readonly compatibilityRequired: true;
    readonly forbidsFoundationModification: true;
    readonly forbidsAuthorityOverride: true;
    readonly requiresIntegrityCheckBeforeRegistration: true;
}

export function freezeFoundationCompatibilityContract(): FoundationCompatibilityContract {
    return Object.freeze({
        contractId: "FoundationCompatibilityContract",
        foundationId: "ASA-FOUNDATION-1.0",
        foundationMustRemainFrozen: true,
        compatibilityRequired: true,
        forbidsFoundationModification: true,
        forbidsAuthorityOverride: true,
        requiresIntegrityCheckBeforeRegistration: true,
    });
}
