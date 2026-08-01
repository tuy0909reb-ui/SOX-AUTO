/**
 * ASA-ARCH-46.0 — EvolutionRegistry
 * Deterministic reference storage only.
 */

import type {
    EvolutionRegistryReader,
    EvolutionRegistryWriter,
} from "../interfaces";
import type { EvolutionRegistryRecord } from "../models";
import type { EvolutionIdentifier } from "../types";

export class EvolutionRegistry {
    readonly storesReferencesOnly = true as const;
    readonly doesNotOwnAuthority = true as const;
    readonly doesNotActivate = true as const;
    readonly doesNotApprove = true as const;
    readonly doesNotExecute = true as const;

    private readonly current = new Map<string, EvolutionRegistryRecord>();

    getRecord(evolutionId: EvolutionIdentifier): EvolutionRegistryRecord | null {
        return this.current.get(String(evolutionId)) ?? null;
    }

    listRecords(): readonly EvolutionRegistryRecord[] {
        const records = [...this.current.values()].sort((a, b) =>
            String(a.evolutionId).localeCompare(String(b.evolutionId))
        );
        return Object.freeze(records);
    }

    hasRecord(evolutionId: EvolutionIdentifier): boolean {
        return this.current.has(String(evolutionId));
    }

    storeRecord(record: EvolutionRegistryRecord): EvolutionRegistryRecord {
        this.assertImmutableRecord(record);
        const key = String(record.evolutionId);
        if (this.current.has(key)) {
            throw new Error(
                "Evolution already registered — use replaceRecord for new immutable projection"
            );
        }
        this.current.set(key, record);
        return record;
    }

    replaceRecord(
        evolutionId: EvolutionIdentifier,
        record: EvolutionRegistryRecord
    ): EvolutionRegistryRecord {
        this.assertImmutableRecord(record);
        if (record.evolutionId !== evolutionId) {
            throw new Error(
                "replaceRecord evolutionId must match record.evolutionId"
            );
        }
        const key = String(evolutionId);
        const previous = this.current.get(key);
        if (!previous) {
            throw new Error("Evolution not registered — use storeRecord first");
        }
        if (previous.integrityReference === record.integrityReference) {
            throw new Error(
                "Registry overwrite forbidden — integrityReference must change"
            );
        }
        this.current.set(key, record);
        return record;
    }

    asReader(): EvolutionRegistryReader {
        return Object.freeze({
            role: "EvolutionRegistryReader",
            doesNotOwnAuthority: true,
            doesNotActivate: true,
            getRecord: (id: EvolutionIdentifier) => this.getRecord(id),
            listRecords: () => this.listRecords(),
            hasRecord: (id: EvolutionIdentifier) => this.hasRecord(id),
        });
    }

    asWriter(): EvolutionRegistryWriter {
        return Object.freeze({
            role: "EvolutionRegistryWriter",
            doesNotOwnAuthority: true,
            doesNotActivate: true,
            storeRecord: (record: EvolutionRegistryRecord) =>
                this.storeRecord(record),
            replaceRecord: (
                id: EvolutionIdentifier,
                record: EvolutionRegistryRecord
            ) => this.replaceRecord(id, record),
        });
    }

    private assertImmutableRecord(record: EvolutionRegistryRecord): void {
        if (!record.immutable || !Object.isFrozen(record)) {
            throw new Error("EvolutionRegistryRecord must be immutable/frozen");
        }
        if (
            record.dependsOnExtensionBoundary !== "ASA-ARCH-45.0" ||
            record.dependsOnFoundation !== "ASA-FOUNDATION-1.0"
        ) {
            throw new Error(
                "EvolutionRegistryRecord must declare Ch45 + Foundation dependencies"
            );
        }
    }
}
