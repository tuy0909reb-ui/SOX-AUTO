/**
 * ASA-ARCH-49.0 — branded / opaque identifiers
 */

export type CandidateId = string & { readonly __brand: "CandidateId" };
export type RecommendationId = string & { readonly __brand: "RecommendationId" };
export type RecommendationSetId = string & {
    readonly __brand: "RecommendationSetId";
};
export type ArchitectureStateHash = string & {
    readonly __brand: "ArchitectureStateHash";
};
export type TraceabilityReference = string & {
    readonly __brand: "TraceabilityReference";
};
export type EvidenceReference = string & {
    readonly __brand: "EvidenceReference";
};
export type IntelligenceOutputReference = string & {
    readonly __brand: "IntelligenceOutputReference";
};

export function asCandidateId(value: string): CandidateId {
    if (!value.trim()) throw new Error("CandidateId must be non-empty");
    return value.trim() as CandidateId;
}

export function asRecommendationId(value: string): RecommendationId {
    if (!value.trim()) throw new Error("RecommendationId must be non-empty");
    return value.trim() as RecommendationId;
}

export function asRecommendationSetId(value: string): RecommendationSetId {
    if (!value.trim()) throw new Error("RecommendationSetId must be non-empty");
    return value.trim() as RecommendationSetId;
}

export function asArchitectureStateHash(value: string): ArchitectureStateHash {
    if (!value.trim()) {
        throw new Error("ArchitectureStateHash must be non-empty");
    }
    return value.trim() as ArchitectureStateHash;
}

export function asTraceabilityReference(value: string): TraceabilityReference {
    if (!value.trim()) {
        throw new Error("TraceabilityReference must be non-empty");
    }
    return value.trim() as TraceabilityReference;
}

export function asEvidenceReference(value: string): EvidenceReference {
    if (!value.trim()) throw new Error("EvidenceReference must be non-empty");
    return value.trim() as EvidenceReference;
}

export function asIntelligenceOutputReference(
    value: string
): IntelligenceOutputReference {
    if (!value.trim()) {
        throw new Error("IntelligenceOutputReference must be non-empty");
    }
    return value.trim() as IntelligenceOutputReference;
}
