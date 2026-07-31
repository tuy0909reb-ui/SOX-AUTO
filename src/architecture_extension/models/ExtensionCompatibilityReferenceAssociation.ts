/**
 * ASA-ARCH-45.0 — ExtensionCompatibilityReferenceAssociation
 * Immutable compatibility reference association. Compatibility ≠ authority.
 */

import type { ExtensionContractCompatibilityReference } from "../contracts";
import type {
    CompatibleBoundaryReference,
    CompatibilityStatus,
    ContractVersionReference,
    ExtensionIdentifier,
} from "../types";
import { isCompatibilityStatus } from "../types";

export interface ExtensionCompatibilityReferenceAssociation {
    readonly representsContract: "ExtensionContractCompatibilityReference";
    readonly extensionId: ExtensionIdentifier;
    readonly contractVersionReference: ContractVersionReference;
    readonly compatibleBoundaryReference: CompatibleBoundaryReference;
    readonly compatibilityStatusReference: CompatibilityStatus;
    readonly compatibilityDoesNotGrantAuthority: true;
    readonly immutable: true;
}

export function freezeExtensionCompatibilityReferenceAssociation(input: {
    extensionId: ExtensionIdentifier;
    contractVersionReference: ContractVersionReference;
    compatibleBoundaryReference: CompatibleBoundaryReference;
    compatibilityStatusReference: CompatibilityStatus | string;
}): ExtensionCompatibilityReferenceAssociation {
    const status = input.compatibilityStatusReference;
    if (typeof status === "string" && !isCompatibilityStatus(status)) {
        throw new Error(`Invalid CompatibilityStatus: ${status}`);
    }
    return Object.freeze({
        representsContract: "ExtensionContractCompatibilityReference",
        extensionId: input.extensionId,
        contractVersionReference: input.contractVersionReference,
        compatibleBoundaryReference: input.compatibleBoundaryReference,
        compatibilityStatusReference: status as CompatibilityStatus,
        compatibilityDoesNotGrantAuthority: true,
        immutable: true,
    });
}

export function compatibilityReferenceAssociationFromContract(
    extensionId: ExtensionIdentifier,
    contract: ExtensionContractCompatibilityReference
): ExtensionCompatibilityReferenceAssociation {
    return freezeExtensionCompatibilityReferenceAssociation({
        extensionId,
        contractVersionReference: contract.contractVersionReference,
        compatibleBoundaryReference: contract.compatibleBoundaryReference,
        compatibilityStatusReference: contract.compatibilityStatusReference,
    });
}
