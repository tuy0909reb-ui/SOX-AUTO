/**
 * ASA-ARCH-45.0 — ExtensionBoundaryDeclarationAccess
 * Declarative access shape for Extension boundary declaration models.
 */

import type { ExtensionBoundary } from "../models";
import type { BoundaryRelationshipReference } from "../references";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionBoundaryDeclarationAccess {
    readonly interfaceId: "ExtensionBoundaryDeclarationAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly forbidsLifecycleMutation: true;

    getBoundary(extensionId: ExtensionIdentifier): ExtensionBoundary | null;

    getBoundaryRelationship(
        extensionId: ExtensionIdentifier
    ): BoundaryRelationshipReference | null;
}
