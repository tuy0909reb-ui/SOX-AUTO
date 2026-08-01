/**
 * ASA-ARCH-48.0 — branded identifiers
 */

export type TraceId = string & { readonly __brand: "TraceId" };
export type ArtifactReference = string & {
    readonly __brand: "ArtifactReference";
};
export type EvidenceReference = string & {
    readonly __brand: "EvidenceReference";
};
export type DigestReference = string & { readonly __brand: "DigestReference" };

function nonEmpty<T extends string>(value: string, label: string): T {
    const trimmed = value.trim();
    if (!trimmed) throw new Error(`${label} must be non-empty`);
    return trimmed as T;
}

export function createTraceId(value: string): TraceId {
    return nonEmpty(value, "TraceId");
}

export function createArtifactReference(value: string): ArtifactReference {
    return nonEmpty(value, "ArtifactReference");
}

export function createEvidenceReference(value: string): EvidenceReference {
    return nonEmpty(value, "EvidenceReference");
}

export function createDigestReference(value: string): DigestReference {
    const trimmed = value.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(trimmed) && !trimmed.startsWith("ref:")) {
        throw new Error(
            "DigestReference must be sha256 hex or ref:* identifier"
        );
    }
    return trimmed as DigestReference;
}
