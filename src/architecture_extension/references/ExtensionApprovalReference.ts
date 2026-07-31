/**
 * ASA-ARCH-45.0 — ExtensionApprovalReference
 * Immutable approval reference object. Traceability only — no authority ownership.
 */

import type { ExtensionApprovalReferenceContract } from "../contracts";
import type { ExtensionApprovalReferenceAssociation } from "../models";
import type {
    ApprovalAuthority,
    ApprovalReference,
    ApprovalTimestampReference,
    ApprovedObjectReference,
    ApprovedVersionReference,
    ExtensionIdentifier,
} from "../types";
import { APPROVAL_AUTHORITY, createApprovalReference } from "../types";

export interface ExtensionApprovalReference {
    readonly referenceKind: "ExtensionApprovalReference";
    readonly referenceToken: ApprovalReference;
    readonly extensionId: ExtensionIdentifier;
    readonly approvalAuthority: ApprovalAuthority;
    readonly approvedObjectReference: ApprovedObjectReference;
    readonly approvedVersionReference: ApprovedVersionReference;
    readonly approvalTimestampReference: ApprovalTimestampReference;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotExecuteApproval: true;
    readonly doesNotModifyLifecycle: true;
    readonly forbidsSelfApproval: true;
    readonly immutable: true;
}

export function freezeExtensionApprovalReference(input: {
    referenceToken: ApprovalReference | string;
    extensionId: ExtensionIdentifier;
    approvedObjectReference: ApprovedObjectReference;
    approvedVersionReference: ApprovedVersionReference;
    approvalTimestampReference: ApprovalTimestampReference;
}): ExtensionApprovalReference {
    const referenceToken =
        typeof input.referenceToken === "string"
            ? createApprovalReference(input.referenceToken)
            : input.referenceToken;
    return Object.freeze({
        referenceKind: "ExtensionApprovalReference",
        referenceToken,
        extensionId: input.extensionId,
        approvalAuthority: APPROVAL_AUTHORITY,
        approvedObjectReference: input.approvedObjectReference,
        approvedVersionReference: input.approvedVersionReference,
        approvalTimestampReference: input.approvalTimestampReference,
        readOnly: true,
        cannotModifySource: true,
        doesNotOwnAuthority: true,
        doesNotGrantAuthority: true,
        doesNotExecuteApproval: true,
        doesNotModifyLifecycle: true,
        forbidsSelfApproval: true,
        immutable: true,
    });
}

export function extensionApprovalReferenceFromContract(
    extensionId: ExtensionIdentifier,
    contract: ExtensionApprovalReferenceContract,
    referenceToken: ApprovalReference | string
): ExtensionApprovalReference {
    return freezeExtensionApprovalReference({
        referenceToken,
        extensionId,
        approvedObjectReference: contract.approvedObjectReference,
        approvedVersionReference: contract.approvedVersionReference,
        approvalTimestampReference: contract.approvalTimestampReference,
    });
}

export function extensionApprovalReferenceFromAssociation(
    association: ExtensionApprovalReferenceAssociation,
    referenceToken: ApprovalReference | string
): ExtensionApprovalReference {
    return freezeExtensionApprovalReference({
        referenceToken,
        extensionId: association.extensionId,
        approvedObjectReference: association.approvedObjectReference,
        approvedVersionReference: association.approvedVersionReference,
        approvalTimestampReference: association.approvalTimestampReference,
    });
}
