/**
 * ASA-ARCH-45.0 — ExtensionSupersessionReference (reference object)
 * Immutable supersession traceability. Distinct from the contracts-layer contract type.
 */

import type { ExtensionSupersessionReference as SupersessionContract } from "../contracts";
import type { ExtensionSupersessionReferenceAssociation } from "../models";
import type { ApprovalReference, ExtensionIdentifier } from "../types";

export interface ExtensionSupersessionReference {
    readonly referenceKind: "ExtensionSupersessionReference";
    readonly previousExtensionReference: ExtensionIdentifier;
    readonly supersedingExtensionReference: ExtensionIdentifier;
    readonly supersessionApprovalReference: ApprovalReference;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly requiresHumanArchitectAuthority: true;
    readonly forbidsSelfSupersession: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotExecuteSupersession: true;
    readonly immutable: true;
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
            "Supersession reference requires distinct Extension identifiers"
        );
    }
    return Object.freeze({
        referenceKind: "ExtensionSupersessionReference",
        previousExtensionReference: input.previousExtensionReference,
        supersedingExtensionReference: input.supersedingExtensionReference,
        supersessionApprovalReference: input.supersessionApprovalReference,
        readOnly: true,
        cannotModifySource: true,
        requiresHumanArchitectAuthority: true,
        forbidsSelfSupersession: true,
        doesNotOwnAuthority: true,
        doesNotExecuteSupersession: true,
        immutable: true,
    });
}

export function extensionSupersessionReferenceFromContract(
    contract: SupersessionContract
): ExtensionSupersessionReference {
    return freezeExtensionSupersessionReference({
        previousExtensionReference: contract.previousExtensionReference,
        supersedingExtensionReference: contract.supersedingExtensionReference,
        supersessionApprovalReference: contract.supersessionApprovalReference,
    });
}

export function extensionSupersessionReferenceFromAssociation(
    association: ExtensionSupersessionReferenceAssociation
): ExtensionSupersessionReference {
    return freezeExtensionSupersessionReference({
        previousExtensionReference: association.previousExtensionReference,
        supersedingExtensionReference: association.supersedingExtensionReference,
        supersessionApprovalReference: association.supersessionApprovalReference,
    });
}
