/**
 * ASA-ARCH-45.0 — ExtensionResponsibilityDeclaration
 * Declares Extension responsibility scope. No authority ownership.
 */

export type ExcludedAuthorityResponsibility =
    | "Core Authority"
    | "Freeze Authority"
    | "Validation Authority"
    | "Evolution Authority";

export const REQUIRED_EXCLUDED_RESPONSIBILITIES: readonly ExcludedAuthorityResponsibility[] =
    Object.freeze([
        "Core Authority",
        "Freeze Authority",
        "Validation Authority",
        "Evolution Authority",
    ]);

export interface ExtensionResponsibilityDeclaration {
    readonly contractId: "ExtensionResponsibilityDeclaration";
    readonly responsibilityDomain: string;
    readonly providedCapability: string;
    readonly excludedResponsibility: readonly ExcludedAuthorityResponsibility[];
    readonly excludesCoreAuthority: true;
    readonly excludesFreezeAuthority: true;
    readonly excludesValidationAuthority: true;
    readonly excludesEvolutionAuthority: true;
}

export function freezeExtensionResponsibilityDeclaration(input: {
    responsibilityDomain: string;
    providedCapability: string;
}): ExtensionResponsibilityDeclaration {
    const domain = input.responsibilityDomain.trim();
    const capability = input.providedCapability.trim();
    if (!domain) {
        throw new Error("responsibilityDomain must be non-empty");
    }
    if (!capability) {
        throw new Error("providedCapability must be non-empty");
    }
    return Object.freeze({
        contractId: "ExtensionResponsibilityDeclaration",
        responsibilityDomain: domain,
        providedCapability: capability,
        excludedResponsibility: REQUIRED_EXCLUDED_RESPONSIBILITIES,
        excludesCoreAuthority: true,
        excludesFreezeAuthority: true,
        excludesValidationAuthority: true,
        excludesEvolutionAuthority: true,
    });
}
