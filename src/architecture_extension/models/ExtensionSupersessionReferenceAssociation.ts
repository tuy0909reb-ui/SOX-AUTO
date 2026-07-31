/**
 * ASA-ARCH-45.0 — ExtensionSupersessionReferenceAssociation
 * Immutable supersession association. Requires HUMAN_ARCHITECT approval reference.
 */

import type { ExtensionSupersessionReference } from "../contracts";
import type { ApprovalReference, ExtensionIdentifier } from "../types";

export interface ExtensionSupersessionReferenceAssociation {
    readonly representsContract: "ExtensionSupersessionReference";
    readonly previousExtensionReference: ExtensionIdentifier;
    readonly supersedingExtensionReference: ExtensionIdentifier;
    readonly supersessionApprovalReference: ApprovalReference;
    readonly requiresHumanArchitectAuthority: true;
    readonly forbidsSelfSupersession: true;
    readonly immutable: true;
}

export function freezeExtensionSupersessionReferenceAssociation(input: {
    previousExtensionReference: ExtensionIdentifier;
    supersedingExtensionReference: ExtensionIdentifier;
    supersessionApprovalReference: ApprovalReference;
}): ExtensionSupersessionReferenceAssociation {
    if (
        input.previousExtensionReference ===
        input.supersedingExtensionReference
    ) {
        throw new Error(
            "Supersession association requires distinct Extension identifiers"
        );
    }
    return Object.freeze({
        representsContract: "ExtensionSupersessionReference",
        previousExtensionReference: input.previousExtensionReference,
        supersedingExtensionReference: input.supersedingExtensionReference,
        supersessionApprovalReference: input.supersessionApprovalReference,
        requiresHumanArchitectAuthority: true,
        forbidsSelfSupersession: true,
        immutable: true,
    });
}

export function supersessionReferenceAssociationFromContract(
    contract: ExtensionSupersessionReference
): ExtensionSupersessionReferenceAssociation {
    return freezeExtensionSupersessionReferenceAssociation({
        previousExtensionReference: contract.previousExtensionReference,
        supersedingExtensionReference: contract.supersedingExtensionReference,
        supersessionApprovalReference: contract.supersessionApprovalReference,
    });
}
