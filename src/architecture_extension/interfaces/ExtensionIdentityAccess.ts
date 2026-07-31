/**
 * ASA-ARCH-45.0 — ExtensionIdentityAccess
 * Declarative access shape for Extension identity models.
 */

import type { ExtensionIdentity } from "../models";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionIdentityAccess {
    readonly interfaceId: "ExtensionIdentityAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly forbidsIdentityMutation: true;

    getIdentity(extensionId: ExtensionIdentifier): ExtensionIdentity | null;

    hasIdentity(extensionId: ExtensionIdentifier): boolean;
}
