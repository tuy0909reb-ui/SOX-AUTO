/**
 * ASA-ARCH-47.0 — ArchitectureKnowledgeModel
 * Reference store for architecture context. Does not decide.
 */

import type { ArchitectureKnowledgeRecord } from "../models";
import type { ArchitectureIdentity } from "../types";

export class ArchitectureKnowledgeModel {
    readonly storesReferencesOnly = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotOwnAuthority = true as const;

    private readonly records = new Map<string, ArchitectureKnowledgeRecord>();

    store(record: ArchitectureKnowledgeRecord): ArchitectureKnowledgeRecord {
        if (!record.immutable || !Object.isFrozen(record)) {
            throw new Error("ArchitectureKnowledgeRecord must be immutable");
        }
        const key = String(record.architectureId);
        if (this.records.has(key)) {
            throw new Error(
                "Architecture knowledge already stored — replace explicitly"
            );
        }
        this.records.set(key, record);
        return record;
    }

    replace(
        architectureId: ArchitectureIdentity,
        record: ArchitectureKnowledgeRecord
    ): ArchitectureKnowledgeRecord {
        if (!record.immutable || !Object.isFrozen(record)) {
            throw new Error("ArchitectureKnowledgeRecord must be immutable");
        }
        if (record.architectureId !== architectureId) {
            throw new Error("architectureId mismatch on replace");
        }
        if (!this.records.has(String(architectureId))) {
            throw new Error("Architecture knowledge not stored — use store");
        }
        this.records.set(String(architectureId), record);
        return record;
    }

    get(
        architectureId: ArchitectureIdentity
    ): ArchitectureKnowledgeRecord | null {
        return this.records.get(String(architectureId)) ?? null;
    }

    list(): readonly ArchitectureKnowledgeRecord[] {
        return Object.freeze(
            [...this.records.values()].sort((a, b) =>
                String(a.architectureId).localeCompare(String(b.architectureId))
            )
        );
    }
}
