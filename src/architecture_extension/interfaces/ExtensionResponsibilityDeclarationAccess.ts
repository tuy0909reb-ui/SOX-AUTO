/**
 * ASA-ARCH-45.0 — ExtensionResponsibilityDeclarationAccess
 * Declarative access shape for responsibility declaration models.
 */

import type { ExtensionResponsibilityDeclarationModel } from "../models";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionResponsibilityDeclarationAccess {
    readonly interfaceId: "ExtensionResponsibilityDeclarationAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly excludesCoreAuthority: true;
    readonly excludesFreezeAuthority: true;
    readonly excludesValidationAuthority: true;
    readonly excludesEvolutionAuthority: true;

    getResponsibilityDeclaration(
        extensionId: ExtensionIdentifier
    ): ExtensionResponsibilityDeclarationModel | null;
}
