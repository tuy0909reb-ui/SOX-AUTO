/**
 * ASA-ARCH-50.0 — branded / opaque identifiers
 */

export type CompletionReportId = string & {
    readonly __brand: "CompletionReportId";
};
export type ArchitectureStateHash = string & {
    readonly __brand: "ArchitectureStateHash";
};
export type EvidenceReference = string & {
    readonly __brand: "EvidenceReference";
};
export type VerificationReference = string & {
    readonly __brand: "VerificationReference";
};
export type FreezeReference = string & {
    readonly __brand: "FreezeReference";
};
export type BaselineDigest = string & { readonly __brand: "BaselineDigest" };
export type RepositoryBaselineReference = string & {
    readonly __brand: "RepositoryBaselineReference";
};

export function asCompletionReportId(value: string): CompletionReportId {
    if (!value.trim()) throw new Error("CompletionReportId must be non-empty");
    return value.trim() as CompletionReportId;
}

export function asArchitectureStateHash(value: string): ArchitectureStateHash {
    if (!value.trim()) {
        throw new Error("ArchitectureStateHash must be non-empty");
    }
    return value.trim() as ArchitectureStateHash;
}

export function asEvidenceReference(value: string): EvidenceReference {
    if (!value.trim()) throw new Error("EvidenceReference must be non-empty");
    return value.trim() as EvidenceReference;
}

export function asVerificationReference(value: string): VerificationReference {
    if (!value.trim()) {
        throw new Error("VerificationReference must be non-empty");
    }
    return value.trim() as VerificationReference;
}

export function asFreezeReference(value: string): FreezeReference {
    if (!value.trim()) throw new Error("FreezeReference must be non-empty");
    return value.trim() as FreezeReference;
}

export function asBaselineDigest(value: string): BaselineDigest {
    if (!value.trim()) throw new Error("BaselineDigest must be non-empty");
    return value.trim() as BaselineDigest;
}

export function asRepositoryBaselineReference(
    value: string
): RepositoryBaselineReference {
    if (!value.trim()) {
        throw new Error("RepositoryBaselineReference must be non-empty");
    }
    return value.trim() as RepositoryBaselineReference;
}
