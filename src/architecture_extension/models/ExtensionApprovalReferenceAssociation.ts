/**
 * ASA-ARCH-45.0 — ExtensionApprovalReferenceAssociation
 * Immutable association of approval reference to an Extension object.
 * Association does not grant authority or execute approval.
 */

import type { ExtensionApprovalReferenceContract } from "../contracts";
import type {
    ApprovalAuthority,
    ApprovalTimestampReference,
    ApprovedObjectReference,
    ApprovedVersionReference,
    ExtensionIdentifier,
} from "../types";
import { APPROVAL_AUTHORITY } from "../types";

export interface ExtensionApprovalReferenceAssociation {
    readonly representsContract: "ExtensionApprovalReferenceContract";
    readonly extensionId: ExtensionIdentifier;
    readonly approvalAuthority: ApprovalAuthority;
    readonly approvedObjectReference: ApprovedObjectReference;
    readonly approvedVersionReference: ApprovedVersionReference;
    readonly approvalTimestampReference: ApprovalTimestampReference;
    readonly forbidsSelfApproval: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotExecuteApproval: true;
    readonly doesNotModifyLifecycle: true;
    readonly immutable: true;
}

export function freezeExtensionApprovalReferenceAssociation(input: {
    extensionId: ExtensionIdentifier;
    approvedObjectReference: ApprovedObjectReference;
    approvedVersionReference: ApprovedVersionReference;
    approvalTimestampReference: ApprovalTimestampReference;
}): ExtensionApprovalReferenceAssociation {
    return Object.freeze({
        representsContract: "ExtensionApprovalReferenceContract",
        extensionId: input.extensionId,
        approvalAuthority: APPROVAL_AUTHORITY,
        approvedObjectReference: input.approvedObjectReference,
        approvedVersionReference: input.approvedVersionReference,
        approvalTimestampReference: input.approvalTimestampReference,
        forbidsSelfApproval: true,
        doesNotGrantAuthority: true,
        doesNotExecuteApproval: true,
        doesNotModifyLifecycle: true,
        immutable: true,
    });
}

export function approvalReferenceAssociationFromContract(
    extensionId: ExtensionIdentifier,
    contract: ExtensionApprovalReferenceContract
): ExtensionApprovalReferenceAssociation {
    return freezeExtensionApprovalReferenceAssociation({
        extensionId,
        approvedObjectReference: contract.approvedObjectReference,
        approvedVersionReference: contract.approvedVersionReference,
        approvalTimestampReference: contract.approvalTimestampReference,
    });
}
