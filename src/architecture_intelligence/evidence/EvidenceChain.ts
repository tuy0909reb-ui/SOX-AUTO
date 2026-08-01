/**
 * ASA-ARCH-47.0 — EvidenceChain
 * Traceability store: Requirement → … → Freeze Result（declaration references）.
 */

import type { EvidenceRecord } from "../models";
import type { EvidenceIdentity } from "../types";

export const EVIDENCE_CHAIN_STAGES: readonly string[] = Object.freeze([
    "Requirement",
    "Architecture Change Proposal",
    "Impact Analysis",
    "Verification Requirement",
    "Human Architect Decision",
    "Architecture Registration",
    "Freeze Result",
]);

export class EvidenceChain {
    readonly maintainsAccountability = true as const;
    readonly doesNotDecide = true as const;
    readonly doesNotOwnAuthority = true as const;

    private readonly records = new Map<string, EvidenceRecord>();

    append(record: EvidenceRecord): EvidenceRecord {
        if (!record.immutable || !Object.isFrozen(record)) {
            throw new Error("EvidenceRecord must be immutable");
        }
        const key = String(record.evidenceId);
        if (this.records.has(key)) {
            throw new Error("Evidence already recorded — append is immutable");
        }
        this.records.set(key, record);
        return record;
    }

    get(evidenceId: EvidenceIdentity): EvidenceRecord | null {
        return this.records.get(String(evidenceId)) ?? null;
    }

    list(): readonly EvidenceRecord[] {
        return Object.freeze(
            [...this.records.values()].sort((a, b) =>
                String(a.evidenceId).localeCompare(String(b.evidenceId))
            )
        );
    }

    stages(): readonly string[] {
        return EVIDENCE_CHAIN_STAGES;
    }
}
