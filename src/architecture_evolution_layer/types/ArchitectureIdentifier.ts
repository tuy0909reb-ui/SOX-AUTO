/**
 * ASA-ARCH-46.0 — ArchitectureIdentifier
 */

export type ArchitectureIdentifier = string & {
    readonly __brand: "ArchitectureIdentifier";
};

export function createArchitectureIdentifier(
    value: string
): ArchitectureIdentifier {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("ArchitectureIdentifier must be non-empty");
    }
    if (!/^ASA-ARCH-\d+(\.\d+)?$/.test(trimmed) && trimmed !== "ASA-FOUNDATION-1.0") {
        throw new Error(
            "ArchitectureIdentifier must match ASA-ARCH-*.* or ASA-FOUNDATION-1.0"
        );
    }
    return Object.freeze(trimmed) as ArchitectureIdentifier;
}
