/**
 * ASA-ARCH-45.0 — ExtensionAuthorityBoundaryModel
 * Immutable domain model: authority ownership always absent.
 */

import type { ExtensionAuthorityBoundaryContract } from "../contracts";

export interface ExtensionAuthorityBoundaryModel {
    readonly representsContract: "ExtensionAuthorityBoundaryContract";
    readonly authorityAcquisitionCapability: false;
    readonly authorityOverrideCapability: false;
    readonly authorityDelegationCapability: false;
    readonly forbidsAuthorityOwnership: true;
    readonly forbidsAuthorityInheritance: true;
    readonly forbidsCoreAuthorityOverride: true;
    readonly capabilityDoesNotEqualAuthorityOwnership: true;
    readonly immutable: true;
}

export function freezeExtensionAuthorityBoundaryModel(): ExtensionAuthorityBoundaryModel {
    return Object.freeze({
        representsContract: "ExtensionAuthorityBoundaryContract",
        authorityAcquisitionCapability: false,
        authorityOverrideCapability: false,
        authorityDelegationCapability: false,
        forbidsAuthorityOwnership: true,
        forbidsAuthorityInheritance: true,
        forbidsCoreAuthorityOverride: true,
        capabilityDoesNotEqualAuthorityOwnership: true,
        immutable: true,
    });
}

export function authorityBoundaryModelFromContract(
    _contract: ExtensionAuthorityBoundaryContract
): ExtensionAuthorityBoundaryModel {
    return freezeExtensionAuthorityBoundaryModel();
}
