/**
 * ASA-ARCH-45.0 — ExtensionReferenceAccess
 * Declarative access shape for approval / supersession / registration references.
 */

import type {
    ArchitectureRegistrationReference,
    ExtensionApprovalReference,
    ExtensionSupersessionReference,
} from "../references";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionReferenceAccess {
    readonly interfaceId: "ExtensionReferenceAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotGrantAuthority: true;
    readonly doesNotActivateExtension: true;

    getApprovalReference(
        extensionId: ExtensionIdentifier
    ): ExtensionApprovalReference | null;

    getSupersessionReference(
        extensionId: ExtensionIdentifier
    ): ExtensionSupersessionReference | null;

    getArchitectureRegistrationReference(
        extensionId: ExtensionIdentifier
    ): ArchitectureRegistrationReference | null;
}
