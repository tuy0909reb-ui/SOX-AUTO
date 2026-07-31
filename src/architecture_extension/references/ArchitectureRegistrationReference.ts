/**
 * ASA-ARCH-45.0 — ArchitectureRegistrationReference
 * Immutable reference to architecture / registration artifacts.
 * Registration linkage only — no authority or runtime ownership.
 */

import type { ExtensionIdentifier } from "../types";

export interface ArchitectureRegistrationReference {
    readonly referenceKind: "ArchitectureRegistrationReference";
    readonly architectureId: string;
    readonly registrationId: string;
    readonly extensionId: ExtensionIdentifier | null;
    readonly registrationArtifactReference: string;
    readonly readOnly: true;
    readonly cannotModifySource: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotAuthorizeRuntime: true;
    readonly immutable: true;
}

export function freezeArchitectureRegistrationReference(input: {
    architectureId: string;
    registrationId: string;
    extensionId?: ExtensionIdentifier | null;
    registrationArtifactReference: string;
}): ArchitectureRegistrationReference {
    const architectureId = input.architectureId.trim();
    const registrationId = input.registrationId.trim();
    const registrationArtifactReference =
        input.registrationArtifactReference.trim();
    if (!architectureId || !registrationId || !registrationArtifactReference) {
        throw new Error(
            "ArchitectureRegistrationReference fields must be non-empty"
        );
    }
    return Object.freeze({
        referenceKind: "ArchitectureRegistrationReference",
        architectureId,
        registrationId,
        extensionId: input.extensionId ?? null,
        registrationArtifactReference,
        readOnly: true,
        cannotModifySource: true,
        doesNotOwnAuthority: true,
        doesNotAuthorizeRuntime: true,
        immutable: true,
    });
}
