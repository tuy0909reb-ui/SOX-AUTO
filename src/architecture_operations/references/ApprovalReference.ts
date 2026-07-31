/**
 * ASA-ARCH-44.0 — ApprovalReference
 * Read-only reference to HUMAN_ARCHITECT approval artifacts.
 */

import type { ApprovalReferenceKind } from "../contracts/ApprovalReferenceContract";

export interface ApprovalReference {
    readonly kind: ApprovalReferenceKind;
    readonly artifactId: string;
    readonly sourceAuthority: "HUMAN_ARCHITECT";
    readonly readOnly: true;
    readonly cannotModifySource: true;
}

export function createApprovalReference(
    kind: ApprovalReferenceKind,
    artifactId: string
): ApprovalReference {
    const id = artifactId.trim();
    if (!id) {
        throw new Error("ApprovalReference artifactId must be non-empty");
    }
    return Object.freeze({
        kind,
        artifactId: id,
        sourceAuthority: "HUMAN_ARCHITECT",
        readOnly: true,
        cannotModifySource: true,
    });
}
