/**
 * ASA-ARCH-45.0 — ExtensionContractAccess
 * Declarative access shape for Extension contracts. No execution / authority.
 */

import type {
    ExtensionAuthorityBoundaryContract,
    ExtensionBoundaryContract,
    ExtensionDependencyBoundaryContract,
    ExtensionIdentityContract,
    ExtensionLifecycleDeclarationContract,
    ExtensionResponsibilityDeclaration,
} from "../contracts";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionContractAccess {
    readonly interfaceId: "ExtensionContractAccess";
    readonly declarativeOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;

    getIdentityContract(
        extensionId: ExtensionIdentifier
    ): ExtensionIdentityContract | null;

    getBoundaryContract(
        extensionId: ExtensionIdentifier
    ): ExtensionBoundaryContract | null;

    getResponsibilityDeclaration(
        extensionId: ExtensionIdentifier
    ): ExtensionResponsibilityDeclaration | null;

    getAuthorityBoundaryContract(
        extensionId: ExtensionIdentifier
    ): ExtensionAuthorityBoundaryContract | null;

    getDependencyBoundaryContract(
        extensionId: ExtensionIdentifier
    ): ExtensionDependencyBoundaryContract | null;

    getLifecycleDeclarationContract(
        extensionId: ExtensionIdentifier
    ): ExtensionLifecycleDeclarationContract | null;
}
