/**
 * ASA-ARCH-45.0 — ExtensionCompatibilityReference
 * Immutable compatibility reference. Compatibility does not grant authority.
 */

import type { ExtensionContractCompatibilityReference as CompatibilityContract } from "../contracts";
import type { ExtensionCompatibilityReferenceAssociation } from "../models";
import type {
    CompatibleBoundaryReference,
    CompatibilityStatus,
    ContractVersionReference,
    ExtensionIdentifier,
} from "../types";
import { isCompatibilityStatus } from "../types";

export interface ExtensionCompatibilityReference {
    readonly referenceKind: "ExtensionCompatibilityReference";
    readonly extensionId: ExtensionIdentifier;
    readonly contractVersionReference: ContractVersionReference;
    readonly compatibleBoundaryReference: CompatibleBoundaryReference;
    readonly compatibilityStatusReference: CompatibilityStatus;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly compatibilityDoesNotGrantAuthority: true;
    readonly doesNotOwnAuthority: true;
    readonly immutable: true;
}

export function freezeExtensionCompatibilityReference(input: {
    extensionId: ExtensionIdentifier;
    contractVersionReference: ContractVersionReference;
    compatibleBoundaryReference: CompatibleBoundaryReference;
    compatibilityStatusReference: CompatibilityStatus | string;
}): ExtensionCompatibilityReference {
    const status = input.compatibilityStatusReference;
    if (typeof status === "string" && !isCompatibilityStatus(status)) {
        throw new Error(`Invalid CompatibilityStatus: ${status}`);
    }
    return Object.freeze({
        referenceKind: "ExtensionCompatibilityReference",
        extensionId: input.extensionId,
        contractVersionReference: input.contractVersionReference,
        compatibleBoundaryReference: input.compatibleBoundaryReference,
        compatibilityStatusReference: status as CompatibilityStatus,
        readOnly: true,
        cannotModifySource: true,
        compatibilityDoesNotGrantAuthority: true,
        doesNotOwnAuthority: true,
        immutable: true,
    });
}

export function extensionCompatibilityReferenceFromContract(
    extensionId: ExtensionIdentifier,
    contract: CompatibilityContract
): ExtensionCompatibilityReference {
    return freezeExtensionCompatibilityReference({
        extensionId,
        contractVersionReference: contract.contractVersionReference,
        compatibleBoundaryReference: contract.compatibleBoundaryReference,
        compatibilityStatusReference: contract.compatibilityStatusReference,
    });
}

export function extensionCompatibilityReferenceFromAssociation(
    association: ExtensionCompatibilityReferenceAssociation
): ExtensionCompatibilityReference {
    return freezeExtensionCompatibilityReference({
        extensionId: association.extensionId,
        contractVersionReference: association.contractVersionReference,
        compatibleBoundaryReference: association.compatibleBoundaryReference,
        compatibilityStatusReference: association.compatibilityStatusReference,
    });
}
