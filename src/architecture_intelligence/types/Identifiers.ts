/**
 * ASA-ARCH-47.0 — branded identifiers
 */

export type ArchitectureIdentity = string & {
    readonly __brand: "ArchitectureIdentity";
};

export type CandidateIdentity = string & {
    readonly __brand: "CandidateIdentity";
};

export type EvidenceIdentity = string & {
    readonly __brand: "EvidenceIdentity";
};

export type EvolutionRequestIdentity = string & {
    readonly __brand: "EvolutionRequestIdentity";
};

function brandNonEmpty<T extends string>(
    value: string,
    label: string
): T {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${label} must be non-empty`);
    }
    return trimmed as T;
}

export function createArchitectureIdentity(value: string): ArchitectureIdentity {
    return brandNonEmpty(value, "ArchitectureIdentity");
}

export function createCandidateIdentity(value: string): CandidateIdentity {
    return brandNonEmpty(value, "CandidateIdentity");
}

export function createEvidenceIdentity(value: string): EvidenceIdentity {
    return brandNonEmpty(value, "EvidenceIdentity");
}

export function createEvolutionRequestIdentity(
    value: string
): EvolutionRequestIdentity {
    return brandNonEmpty(value, "EvolutionRequestIdentity");
}
