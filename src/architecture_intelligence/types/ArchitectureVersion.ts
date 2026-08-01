/**
 * ASA-ARCH-47.0 — ArchitectureVersion
 * Lifecycle identity — independent from software implementation version.
 */

export type ArchitectureVersion = string & {
    readonly __brand: "ArchitectureVersion";
};

export function createArchitectureVersion(value: string): ArchitectureVersion {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("ArchitectureVersion must be non-empty");
    }
    return trimmed as ArchitectureVersion;
}
