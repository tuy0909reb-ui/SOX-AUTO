/**
 * ASA-ARCH-45.0 — ExtensionContractCompatibilityReference (reference object)
 * Links an Extension to a contract compatibility declaration for traceability.
 */

import type { ExtensionContractCompatibilityReference as CompatibilityContract } from "../contracts";
import type {
    CompatibleBoundaryReference,
    CompatibilityStatus,
    ContractVersionReference,
    ExtensionIdentifier,
} from "../types";
import { isCompatibilityStatus } from "../types";
import type { ExtensionCompatibilityReference } from "./ExtensionCompatibilityReference";
import { freezeExtensionCompatibilityReference } from "./ExtensionCompatibilityReference";

export interface ExtensionContractCompatibilityReference {
    readonly referenceKind: "ExtensionContractCompatibilityReference";
    readonly extensionId: ExtensionIdentifier;
    readonly linkedContractId: "ExtensionContractCompatibilityReference";
    readonly contractVersionReference: ContractVersionReference;
    readonly compatibleBoundaryReference: CompatibleBoundaryReference;
    readonly compatibilityStatusReference: CompatibilityStatus;
    readonly compatibilityReference: ExtensionCompatibilityReference;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly compatibilityDoesNotGrantAuthority: true;
    readonly doesNotOwnAuthority: true;
    readonly immutable: true;
}

export function freezeExtensionContractCompatibilityReference(input: {
    extensionId: ExtensionIdentifier;
    contractVersionReference: ContractVersionReference;
    compatibleBoundaryReference: CompatibleBoundaryReference;
    compatibilityStatusReference: CompatibilityStatus | string;
}): ExtensionContractCompatibilityReference {
    const status = input.compatibilityStatusReference;
    if (typeof status === "string" && !isCompatibilityStatus(status)) {
        throw new Error(`Invalid CompatibilityStatus: ${status}`);
    }
    const compatibilityReference = freezeExtensionCompatibilityReference({
        extensionId: input.extensionId,
        contractVersionReference: input.contractVersionReference,
        compatibleBoundaryReference: input.compatibleBoundaryReference,
        compatibilityStatusReference: status,
    });
    return Object.freeze({
        referenceKind: "ExtensionContractCompatibilityReference",
        extensionId: input.extensionId,
        linkedContractId: "ExtensionContractCompatibilityReference",
        contractVersionReference: input.contractVersionReference,
        compatibleBoundaryReference: input.compatibleBoundaryReference,
        compatibilityStatusReference: status as CompatibilityStatus,
        compatibilityReference,
        readOnly: true,
        cannotModifySource: true,
        compatibilityDoesNotGrantAuthority: true,
        doesNotOwnAuthority: true,
        immutable: true,
    });
}

export function extensionContractCompatibilityReferenceFromContract(
    extensionId: ExtensionIdentifier,
    contract: CompatibilityContract
): ExtensionContractCompatibilityReference {
    return freezeExtensionContractCompatibilityReference({
        extensionId,
        contractVersionReference: contract.contractVersionReference,
        compatibleBoundaryReference: contract.compatibleBoundaryReference,
        compatibilityStatusReference: contract.compatibilityStatusReference,
    });
}
