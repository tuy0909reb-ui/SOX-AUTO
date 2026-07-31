/**
 * ASA-ARCH-45.0 — ExtensionSupersessionReference
 * Supersession traceability. Requires HUMAN_ARCHITECT approval reference.
 */

import type { ApprovalReference, ExtensionIdentifier } from "../types";

export interface ExtensionSupersessionReference {
    readonly contractId: "ExtensionSupersessionReference";
    readonly previousExtensionReference: ExtensionIdentifier;
    readonly supersedingExtensionReference: ExtensionIdentifier;
    readonly supersessionApprovalReference: ApprovalReference;
    readonly requiresHumanArchitectAuthority: true;
    readonly forbidsSelfSupersession: true;
}

export function freezeExtensionSupersessionReference(input: {
    previousExtensionReference: ExtensionIdentifier;
    supersedingExtensionReference: ExtensionIdentifier;
    supersessionApprovalReference: ApprovalReference;
}): ExtensionSupersessionReference {
    if (
        input.previousExtensionReference ===
        input.supersedingExtensionReference
    ) {
        throw new Error(
            "Supersession requires distinct previous and superseding Extension identifiers"
        );
    }
    return Object.freeze({
        contractId: "ExtensionSupersessionReference",
        previousExtensionReference: input.previousExtensionReference,
        supersedingExtensionReference: input.supersedingExtensionReference,
        supersessionApprovalReference: input.supersessionApprovalReference,
        requiresHumanArchitectAuthority: true,
        forbidsSelfSupersession: true,
    });
}
