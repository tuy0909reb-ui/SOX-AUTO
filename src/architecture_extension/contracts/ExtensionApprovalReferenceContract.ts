/**
 * ASA-ARCH-45.0 — ExtensionApprovalReferenceContract
 * Architectural approval traceability. Extension cannot self-approve.
 */

import type {
    ApprovalAuthority,
    ApprovalTimestampReference,
    ApprovedObjectReference,
    ApprovedVersionReference,
} from "../types";
import { APPROVAL_AUTHORITY } from "../types";

export interface ExtensionApprovalReferenceContract {
    readonly contractId: "ExtensionApprovalReferenceContract";
    readonly approvalAuthority: ApprovalAuthority;
    readonly approvedObjectReference: ApprovedObjectReference;
    readonly approvedVersionReference: ApprovedVersionReference;
    readonly approvalTimestampReference: ApprovalTimestampReference;
    readonly forbidsSelfApproval: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotExecuteApproval: true;
    readonly doesNotModifyLifecycle: true;
}

export function freezeExtensionApprovalReferenceContract(input: {
    approvedObjectReference: ApprovedObjectReference;
    approvedVersionReference: ApprovedVersionReference;
    approvalTimestampReference: ApprovalTimestampReference;
}): ExtensionApprovalReferenceContract {
    return Object.freeze({
        contractId: "ExtensionApprovalReferenceContract",
        approvalAuthority: APPROVAL_AUTHORITY,
        approvedObjectReference: input.approvedObjectReference,
        approvedVersionReference: input.approvedVersionReference,
        approvalTimestampReference: input.approvalTimestampReference,
        forbidsSelfApproval: true,
        doesNotGrantAuthority: true,
        doesNotExecuteApproval: true,
        doesNotModifyLifecycle: true,
    });
}
