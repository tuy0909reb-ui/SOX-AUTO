/**
 * ASA-ARCH-45.0 — ExtensionIdentifier
 * Immutable Extension identity primitive.
 * Declarative / runtime-independent. Identity mutation is prohibited.
 */

export type ExtensionIdentifier = string & {
    readonly __brand: "ExtensionIdentifier";
};

export function createExtensionIdentifier(value: string): ExtensionIdentifier {
    const v = value.trim();
    if (!v) {
        throw new Error("ExtensionIdentifier must be non-empty");
    }
    return Object.freeze(v) as ExtensionIdentifier;
}
