/**
 * ASA-ARCH-45.0 — ExtensionIdentity
 * Immutable domain model for Extension identity.
 */

import type { ExtensionIdentityContract, CreationReference } from "../contracts";
import type {
    ExtensionIdentifier,
    ExtensionName,
    ExtensionVersionReference,
    IdentityHashReference,
} from "../types";

export interface ExtensionIdentity {
    readonly representsContract: "ExtensionIdentityContract";
    readonly extensionId: ExtensionIdentifier;
    readonly extensionName: ExtensionName;
    readonly extensionVersionReference: ExtensionVersionReference;
    readonly creationReference: CreationReference;
    readonly identityHashReference: IdentityHashReference;
    readonly immutable: true;
}

export function freezeExtensionIdentity(input: {
    extensionId: ExtensionIdentifier;
    extensionName: ExtensionName;
    extensionVersionReference: ExtensionVersionReference;
    creationReference: CreationReference;
    identityHashReference: IdentityHashReference;
}): ExtensionIdentity {
    return Object.freeze({
        representsContract: "ExtensionIdentityContract",
        extensionId: input.extensionId,
        extensionName: input.extensionName,
        extensionVersionReference: input.extensionVersionReference,
        creationReference: input.creationReference,
        identityHashReference: input.identityHashReference,
        immutable: true,
    });
}

export function extensionIdentityFromContract(
    contract: ExtensionIdentityContract
): ExtensionIdentity {
    return freezeExtensionIdentity({
        extensionId: contract.extensionId,
        extensionName: contract.extensionName,
        extensionVersionReference: contract.extensionVersionReference,
        creationReference: contract.creationReference,
        identityHashReference: contract.identityHashReference,
    });
}
