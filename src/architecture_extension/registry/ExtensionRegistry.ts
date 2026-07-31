/**
 * ASA-ARCH-45.0 — ExtensionRegistry
 * Deterministic reference storage only.
 * Does not activate, execute, approve, decide, or own authority.
 */

import type {
    ExtensionRegistryHistoryReader,
    ExtensionRegistryInteractionBoundary,
    ExtensionRegistryReader,
    ExtensionRegistryWriter,
} from "../interfaces";
import {
    freezeExtensionRegistryHistoryRecord,
    type ExtensionRegistryHistoryRecord,
    type ExtensionRegistryRecord,
} from "../models";
import type { ExtensionIdentifier } from "../types";
import { ExtensionRegistryHistory } from "./ExtensionRegistryHistory";
import {
    freezeExtensionRegistryRecordReference,
    type ExtensionRegistryRecordReference,
} from "./ExtensionRegistryRecordReference";

export class ExtensionRegistry {
    readonly storesReferencesOnly = true as const;
    readonly doesNotOwnAuthority = true as const;
    readonly doesNotActivateExtension = true as const;
    readonly doesNotApproveExtension = true as const;
    readonly doesNotExecuteExtension = true as const;

    private readonly current = new Map<string, ExtensionRegistryRecord>();
    private readonly recordReferences = new Map<
        string,
        ExtensionRegistryRecordReference
    >();
    private readonly historyStore = new ExtensionRegistryHistory();

    getRecord(extensionId: ExtensionIdentifier): ExtensionRegistryRecord | null {
        return this.current.get(String(extensionId)) ?? null;
    }

    getRecordReference(
        extensionId: ExtensionIdentifier
    ): ExtensionRegistryRecordReference | null {
        return this.recordReferences.get(String(extensionId)) ?? null;
    }

    listRecords(): readonly ExtensionRegistryRecord[] {
        const records = [...this.current.values()].sort((a, b) =>
            String(a.extensionId).localeCompare(String(b.extensionId))
        );
        return Object.freeze(records);
    }

    hasRecord(extensionId: ExtensionIdentifier): boolean {
        return this.current.has(String(extensionId));
    }

    storeRecord(record: ExtensionRegistryRecord): ExtensionRegistryRecord {
        this.assertImmutableRecord(record);
        const key = String(record.extensionId);
        if (this.current.has(key)) {
            throw new Error(
                "Extension already registered — use replaceRecord for new immutable projection"
            );
        }
        this.current.set(key, record);
        this.recordReferences.set(
            key,
            freezeExtensionRegistryRecordReference({ record })
        );
        return record;
    }

    replaceRecord(
        extensionId: ExtensionIdentifier,
        record: ExtensionRegistryRecord
    ): ExtensionRegistryRecord {
        this.assertImmutableRecord(record);
        if (record.extensionId !== extensionId) {
            throw new Error(
                "replaceRecord extensionId must match record.extensionId"
            );
        }
        const key = String(extensionId);
        const previous = this.current.get(key);
        if (!previous) {
            throw new Error("Extension not registered — use storeRecord first");
        }
        if (previous.integrityReference === record.integrityReference) {
            throw new Error(
                "Registry overwrite forbidden — integrityReference must change"
            );
        }

        const historyRecord = freezeExtensionRegistryHistoryRecord({
            extensionId,
            previousDeclarationState: previous.declarationState,
            nextDeclarationState: record.declarationState,
            supersessionApprovalReference: null,
            historicalTransitionReference: `${previous.integrityReference}->${record.integrityReference}`,
        });
        this.historyStore.append(historyRecord);

        this.current.set(key, record);
        this.recordReferences.set(
            key,
            freezeExtensionRegistryRecordReference({ record })
        );
        return record;
    }

    getHistory(
        extensionId: ExtensionIdentifier
    ): readonly ExtensionRegistryHistoryRecord[] {
        return this.historyStore.getHistory(extensionId);
    }

    getLatestHistory(
        extensionId: ExtensionIdentifier
    ): ExtensionRegistryHistoryRecord | null {
        return this.historyStore.getLatestHistory(extensionId);
    }

    /**
     * Structural integrity verification reference for a stored record.
     * Inspection helper only — not an authority decision.
     */
    verifyRegistryIntegrityReference(
        extensionId: ExtensionIdentifier
    ): string | null {
        const record = this.getRecord(extensionId);
        const reference = this.getRecordReference(extensionId);
        if (!record || !reference) {
            return null;
        }
        if (record.integrityReference !== reference.registryIntegrityReference) {
            throw new Error("Registry integrity reference mismatch");
        }
        return reference.registryIntegrityReference;
    }

    asReader(): ExtensionRegistryReader {
        return Object.freeze({
            interfaceId: "ExtensionRegistryReader" as const,
            readOnly: true as const,
            doesNotOwnAuthority: true as const,
            doesNotActivateExtension: true as const,
            doesNotApproveExtension: true as const,
            getRecord: (id: ExtensionIdentifier) => this.getRecord(id),
            listRecords: () => this.listRecords(),
            hasRecord: (id: ExtensionIdentifier) => this.hasRecord(id),
        });
    }

    asWriter(): ExtensionRegistryWriter {
        return Object.freeze({
            interfaceId: "ExtensionRegistryWriter" as const,
            storesReferencesOnly: true as const,
            doesNotOwnAuthority: true as const,
            doesNotActivateExtension: true as const,
            doesNotApproveExtension: true as const,
            doesNotExecuteExtension: true as const,
            storeRecord: (record: ExtensionRegistryRecord) =>
                this.storeRecord(record),
            replaceRecord: (
                id: ExtensionIdentifier,
                record: ExtensionRegistryRecord
            ) => this.replaceRecord(id, record),
        });
    }

    asHistoryReader(): ExtensionRegistryHistoryReader {
        return this.historyStore;
    }

    asInteractionBoundary(): ExtensionRegistryInteractionBoundary {
        return Object.freeze({
            interfaceId: "ExtensionRegistryInteractionBoundary" as const,
            storesReferencesOnly: true as const,
            doesNotOwnAuthority: true as const,
            doesNotActivateExtension: true as const,
            doesNotApproveExtension: true as const,
            doesNotExecuteExtension: true as const,
            reader: this.asReader(),
            writer: this.asWriter(),
            historyReader: this.asHistoryReader(),
        });
    }

    private assertImmutableRecord(record: ExtensionRegistryRecord): void {
        if (!record.immutable) {
            throw new Error("Registry accepts immutable records only");
        }
        if (
            !record.doesNotActivateExtension ||
            !record.doesNotExecuteExtension ||
            !record.doesNotApproveExtension
        ) {
            throw new Error(
                "Registry rejects records that claim activation / execution / approval capability"
            );
        }
    }
}
