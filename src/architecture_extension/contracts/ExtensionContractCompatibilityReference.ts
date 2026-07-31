/**
 * ASA-ARCH-45.0 — ExtensionContractCompatibilityReference
 * Contract version compatibility reference. Compatibility ≠ authority.
 */

import type {
    CompatibleBoundaryReference,
    CompatibilityStatus,
    ContractVersionReference,
} from "../types";
import { isCompatibilityStatus } from "../types";

export interface ExtensionContractCompatibilityReference {
    readonly contractId: "ExtensionContractCompatibilityReference";
    readonly contractVersionReference: ContractVersionReference;
    readonly compatibleBoundaryReference: CompatibleBoundaryReference;
    readonly compatibilityStatusReference: CompatibilityStatus;
    readonly compatibilityDoesNotGrantAuthority: true;
}

export function freezeExtensionContractCompatibilityReference(input: {
    contractVersionReference: ContractVersionReference;
    compatibleBoundaryReference: CompatibleBoundaryReference;
    compatibilityStatusReference: CompatibilityStatus | string;
}): ExtensionContractCompatibilityReference {
    const status = input.compatibilityStatusReference;
    if (typeof status === "string" && !isCompatibilityStatus(status)) {
        throw new Error(`Invalid CompatibilityStatus: ${status}`);
    }
    return Object.freeze({
        contractId: "ExtensionContractCompatibilityReference",
        contractVersionReference: input.contractVersionReference,
        compatibleBoundaryReference: input.compatibleBoundaryReference,
        compatibilityStatusReference: status as CompatibilityStatus,
        compatibilityDoesNotGrantAuthority: true,
    });
}
