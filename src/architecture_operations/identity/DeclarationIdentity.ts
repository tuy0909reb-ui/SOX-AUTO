/**
 * ASA-ARCH-44.0 — DeclarationIdentity
 * Immutable identity for a registered architecture declaration.
 */

export type DeclarationIdentity = string & {
    readonly __brand: "DeclarationIdentity";
};

export function createDeclarationIdentity(value: string): DeclarationIdentity {
    const v = value.trim();
    if (!v) {
        throw new Error("DeclarationIdentity must be non-empty");
    }
    return Object.freeze(v) as DeclarationIdentity;
}
