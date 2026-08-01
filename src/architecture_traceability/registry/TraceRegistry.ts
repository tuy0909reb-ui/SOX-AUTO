/**
 * ASA-ARCH-48.0 — TraceRegistry
 * Append-oriented; forbids silent replacement.
 */

import type { ArchitectureTraceRecord } from "../models";
import type { ArtifactReference, TraceId } from "../types";

export class TraceRegistry {
    readonly isAppendOriented = true as const;
    readonly forbidsSilentReplacement = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotOwnAuthority = true as const;

    private readonly byId = new Map<string, ArchitectureTraceRecord>();
    private readonly bySource = new Map<string, ArchitectureTraceRecord[]>();

    append(record: ArchitectureTraceRecord): ArchitectureTraceRecord {
        if (!record.immutable || !Object.isFrozen(record)) {
            throw new Error("ArchitectureTraceRecord must be immutable");
        }
        const key = String(record.traceId);
        if (this.byId.has(key)) {
            throw new Error(
                "Trace already recorded — silent replacement forbidden"
            );
        }
        this.byId.set(key, record);
        const sourceKey = String(record.sourceArtifact);
        const list = this.bySource.get(sourceKey) ?? [];
        list.push(record);
        this.bySource.set(sourceKey, list);
        return record;
    }

    get(traceId: TraceId): ArchitectureTraceRecord | null {
        return this.byId.get(String(traceId)) ?? null;
    }

    listBySource(
        sourceArtifact: ArtifactReference
    ): readonly ArchitectureTraceRecord[] {
        const list = this.bySource.get(String(sourceArtifact)) ?? [];
        return Object.freeze([...list]);
    }

    list(): readonly ArchitectureTraceRecord[] {
        return Object.freeze(
            [...this.byId.values()].sort((a, b) =>
                String(a.traceId).localeCompare(String(b.traceId))
            )
        );
    }

    hasRelationship(
        sourceArtifact: ArtifactReference,
        relationshipType: string
    ): boolean {
        return this.listBySource(sourceArtifact).some(
            (r) => r.relationshipType === relationshipType
        );
    }
}
