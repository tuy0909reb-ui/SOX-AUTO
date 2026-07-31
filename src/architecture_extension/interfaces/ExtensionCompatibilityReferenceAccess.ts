/**
 * ASA-ARCH-45.0 — ExtensionCompatibilityReferenceAccess
 * Declarative access shape for compatibility references.
 */

import type {
    ExtensionCompatibilityReference,
    ExtensionContractCompatibilityReference,
} from "../references";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionCompatibilityReferenceAccess {
    readonly interfaceId: "ExtensionCompatibilityReferenceAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly compatibilityDoesNotGrantAuthority: true;
    readonly doesNotActivateExtension: true;

    getCompatibilityReference(
        extensionId: ExtensionIdentifier
    ): ExtensionCompatibilityReference | null;

    getContractCompatibilityReference(
        extensionId: ExtensionIdentifier
    ): ExtensionContractCompatibilityReference | null;
}
