/**
 * ASA-ARCH-45.0 — ExtensionAuthorityBoundaryContract
 * Prevents Extension authority ownership. Capability ≠ authority.
 */

export interface ExtensionAuthorityBoundaryContract {
    readonly contractId: "ExtensionAuthorityBoundaryContract";
    /** Always false — Extension cannot acquire ASA authority. */
    readonly authorityAcquisitionCapability: false;
    /** Always false — Extension cannot override ASA authority. */
    readonly authorityOverrideCapability: false;
    /** Always false — Extension cannot delegate ASA authority. */
    readonly authorityDelegationCapability: false;
    readonly forbidsAuthorityOwnership: true;
    readonly forbidsAuthorityInheritance: true;
    readonly forbidsCoreAuthorityOverride: true;
    readonly capabilityDoesNotEqualAuthorityOwnership: true;
}

export function freezeExtensionAuthorityBoundaryContract(): ExtensionAuthorityBoundaryContract {
    return Object.freeze({
        contractId: "ExtensionAuthorityBoundaryContract",
        authorityAcquisitionCapability: false,
        authorityOverrideCapability: false,
        authorityDelegationCapability: false,
        forbidsAuthorityOwnership: true,
        forbidsAuthorityInheritance: true,
        forbidsCoreAuthorityOverride: true,
        capabilityDoesNotEqualAuthorityOwnership: true,
    });
}
