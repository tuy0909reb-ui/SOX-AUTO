import {
    LifecycleStatus,
    TraceRelationshipType,
    createArtifactReference,
    createDigestReference,
    createEvidenceReference,
    createTraceId,
    freezeArchitectureTraceRecord,
} from "../../src/architecture_traceability";

export function sampleTraceRecord(
    overrides?: Partial<{
        traceId: string;
        relationshipType: TraceRelationshipType;
    }>
) {
    return freezeArchitectureTraceRecord({
        traceId: createTraceId(overrides?.traceId ?? "TR-48-001"),
        sourceArtifact: createArtifactReference("ASA-ARCH-48.0"),
        targetArtifact: createArtifactReference(
            "docs/specs/asa_arch_48_0_architecture_traceability.md"
        ),
        relationshipType:
            overrides?.relationshipType ?? TraceRelationshipType.CREATED_FROM,
        evidenceReference: createEvidenceReference(
            "ASA-REGISTER-ARCH-48.0-001"
        ),
        digestReference: createDigestReference(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        ),
        lifecycleStatus: LifecycleStatus.REGISTERED,
        createdAt: "2026-08-01T11:45:03+09:00",
        createdBy: "HUMAN_ARCHITECT",
    });
}
