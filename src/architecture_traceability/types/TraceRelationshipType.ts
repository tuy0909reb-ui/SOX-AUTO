/**
 * ASA-ARCH-48.0 — TraceRelationshipType
 */

export enum TraceRelationshipType {
    CREATED_FROM = "CREATED_FROM",
    IMPLEMENTS = "IMPLEMENTS",
    VERIFIED_BY = "VERIFIED_BY",
    FROZEN_BY = "FROZEN_BY",
    ANCHORED_BY = "ANCHORED_BY",
    EVOLVED_FROM = "EVOLVED_FROM",
}

export const TRACE_RELATIONSHIP_TYPES: readonly TraceRelationshipType[] =
    Object.freeze([
        TraceRelationshipType.CREATED_FROM,
        TraceRelationshipType.IMPLEMENTS,
        TraceRelationshipType.VERIFIED_BY,
        TraceRelationshipType.FROZEN_BY,
        TraceRelationshipType.ANCHORED_BY,
        TraceRelationshipType.EVOLVED_FROM,
    ]);

export function isTraceRelationshipType(
    value: string
): value is TraceRelationshipType {
    return (TRACE_RELATIONSHIP_TYPES as readonly string[]).includes(value);
}
