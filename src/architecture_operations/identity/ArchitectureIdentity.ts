/**
 * ASA-ARCH-44.0 — ArchitectureIdentity
 * Immutable identity for an architecture chapter.
 */

export type ArchitectureIdentity = string & {
    readonly __brand: "ArchitectureIdentity";
};

export function createArchitectureIdentity(value: string): ArchitectureIdentity {
    const v = value.trim();
    if (!v) {
        throw new Error("ArchitectureIdentity must be non-empty");
    }
    return Object.freeze(v) as ArchitectureIdentity;
}
