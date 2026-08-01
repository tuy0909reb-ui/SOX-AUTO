/**
 * ASA-ARCH-48.0 — ArchitectureTraceRecord
 */

import type {
    ArtifactReference,
    DigestReference,
    EvidenceReference,
    LifecycleStatus,
    TraceId,
    TraceRelationshipType,
} from "../types";

export interface ArchitectureTraceRecord {
    readonly kind: "ArchitectureTraceRecord";
    readonly traceId: TraceId;
    readonly sourceArtifact: ArtifactReference;
    readonly targetArtifact: ArtifactReference;
    readonly relationshipType: TraceRelationshipType;
    readonly evidenceReference: EvidenceReference;
    readonly digestReference: DigestReference;
    readonly lifecycleStatus: LifecycleStatus;
    readonly createdAt: string;
    readonly createdBy: string;
    readonly immutableStatus: true;
    readonly immutable: true;
    readonly doesNotDecide: true;
}

export function freezeArchitectureTraceRecord(input: {
    traceId: TraceId;
    sourceArtifact: ArtifactReference;
    targetArtifact: ArtifactReference;
    relationshipType: TraceRelationshipType;
    evidenceReference: EvidenceReference;
    digestReference: DigestReference;
    lifecycleStatus: LifecycleStatus;
    createdAt: string;
    createdBy: string;
}): ArchitectureTraceRecord {
    if (!input.createdAt.trim()) {
        throw new Error("createdAt must be non-empty");
    }
    if (!input.createdBy.trim()) {
        throw new Error("createdBy must be non-empty");
    }
    return Object.freeze({
        kind: "ArchitectureTraceRecord",
        traceId: input.traceId,
        sourceArtifact: input.sourceArtifact,
        targetArtifact: input.targetArtifact,
        relationshipType: input.relationshipType,
        evidenceReference: input.evidenceReference,
        digestReference: input.digestReference,
        lifecycleStatus: input.lifecycleStatus,
        createdAt: input.createdAt.trim(),
        createdBy: input.createdBy.trim(),
        immutableStatus: true,
        immutable: true,
        doesNotDecide: true,
    });
}
