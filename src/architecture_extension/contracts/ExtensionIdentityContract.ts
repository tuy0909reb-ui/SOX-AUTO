/**
 * ASA-ARCH-45.0 — ExtensionIdentityContract
 * Immutable Extension identification. Declarative only.
 */

import type {
    ExtensionIdentifier,
    ExtensionName,
    ExtensionVersionReference,
    IdentityHashReference,
} from "../types";

export type CreationReference = string & {
    readonly __brand: "CreationReference";
};

export function createCreationReference(value: string): CreationReference {
    const v = value.trim();
    if (!v) {
        throw new Error("CreationReference must be non-empty");
    }
    return Object.freeze(v) as CreationReference;
}

export interface ExtensionIdentityContract {
    readonly contractId: "ExtensionIdentityContract";
    readonly extensionId: ExtensionIdentifier;
    readonly extensionName: ExtensionName;
    readonly extensionVersionReference: ExtensionVersionReference;
    readonly creationReference: CreationReference;
    readonly identityHashReference: IdentityHashReference;
    readonly identityImmutable: true;
    readonly forbidsIdentityMutation: true;
}

export function freezeExtensionIdentityContract(input: {
    extensionId: ExtensionIdentifier;
    extensionName: ExtensionName;
    extensionVersionReference: ExtensionVersionReference;
    creationReference: CreationReference;
    identityHashReference: IdentityHashReference;
}): ExtensionIdentityContract {
    return Object.freeze({
        contractId: "ExtensionIdentityContract",
        extensionId: input.extensionId,
        extensionName: input.extensionName,
        extensionVersionReference: input.extensionVersionReference,
        creationReference: input.creationReference,
        identityHashReference: input.identityHashReference,
        identityImmutable: true,
        forbidsIdentityMutation: true,
    });
}
