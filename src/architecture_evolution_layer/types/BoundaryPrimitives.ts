/**
 * ASA-ARCH-46.0 — BoundaryPrimitives
 */

export type EvolutionIdentifier = string & {
    readonly __brand: "EvolutionIdentifier";
};

export type IntegrityReference = string & {
    readonly __brand: "IntegrityReference";
};

export type ApprovalReference = string & {
    readonly __brand: "ApprovalReference";
};

export function createEvolutionIdentifier(value: string): EvolutionIdentifier {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("EvolutionIdentifier must be non-empty");
    }
    return Object.freeze(trimmed) as EvolutionIdentifier;
}

export function createIntegrityReference(value: string): IntegrityReference {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("IntegrityReference must be non-empty");
    }
    return Object.freeze(trimmed) as IntegrityReference;
}

export function createApprovalReference(value: string): ApprovalReference {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error("ApprovalReference must be non-empty");
    }
    return Object.freeze(trimmed) as ApprovalReference;
}
