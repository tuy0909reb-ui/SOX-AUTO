/**
 * ASA-ARCH-45.0 — ExtensionResponsibilityDeclarationModel
 * Immutable domain model for responsibility declaration.
 */

import type {
    ExcludedAuthorityResponsibility,
    ExtensionResponsibilityDeclaration,
} from "../contracts";
import { REQUIRED_EXCLUDED_RESPONSIBILITIES } from "../contracts";

export interface ExtensionResponsibilityDeclarationModel {
    readonly representsContract: "ExtensionResponsibilityDeclaration";
    readonly responsibilityDomain: string;
    readonly providedCapability: string;
    readonly excludedResponsibility: readonly ExcludedAuthorityResponsibility[];
    readonly excludesCoreAuthority: true;
    readonly excludesFreezeAuthority: true;
    readonly excludesValidationAuthority: true;
    readonly excludesEvolutionAuthority: true;
    readonly immutable: true;
}

export function freezeExtensionResponsibilityDeclarationModel(input: {
    responsibilityDomain: string;
    providedCapability: string;
}): ExtensionResponsibilityDeclarationModel {
    const domain = input.responsibilityDomain.trim();
    const capability = input.providedCapability.trim();
    if (!domain) {
        throw new Error("responsibilityDomain must be non-empty");
    }
    if (!capability) {
        throw new Error("providedCapability must be non-empty");
    }
    return Object.freeze({
        representsContract: "ExtensionResponsibilityDeclaration",
        responsibilityDomain: domain,
        providedCapability: capability,
        excludedResponsibility: REQUIRED_EXCLUDED_RESPONSIBILITIES,
        excludesCoreAuthority: true,
        excludesFreezeAuthority: true,
        excludesValidationAuthority: true,
        excludesEvolutionAuthority: true,
        immutable: true,
    });
}

export function responsibilityDeclarationModelFromContract(
    contract: ExtensionResponsibilityDeclaration
): ExtensionResponsibilityDeclarationModel {
    return freezeExtensionResponsibilityDeclarationModel({
        responsibilityDomain: contract.responsibilityDomain,
        providedCapability: contract.providedCapability,
    });
}
