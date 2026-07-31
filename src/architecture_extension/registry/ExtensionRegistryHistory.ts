/**
 * ASA-ARCH-45.0 — ExtensionRegistryHistory
 * Append-only historical reference store. No lifecycle execution / authority.
 */

import type { ExtensionRegistryHistoryReader } from "../interfaces";
import type { ExtensionRegistryHistoryRecord } from "../models";
import type { ExtensionIdentifier } from "../types";

export class ExtensionRegistryHistory implements ExtensionRegistryHistoryReader {
    readonly interfaceId = "ExtensionRegistryHistoryReader" as const;
    readonly readOnly = true as const;
    readonly doesNotOwnAuthority = true as const;
    readonly doesNotActivateExtension = true as const;

    private readonly historyByExtension = new Map<
        string,
        ExtensionRegistryHistoryRecord[]
    >();

    append(record: ExtensionRegistryHistoryRecord): ExtensionRegistryHistoryRecord {
        if (!record.immutable) {
            throw new Error("History record must be immutable");
        }
        const key = String(record.extensionId);
        const existing = this.historyByExtension.get(key) ?? [];
        const next = Object.freeze([...existing, record]) as ExtensionRegistryHistoryRecord[];
        this.historyByExtension.set(key, [...next]);
        return record;
    }

    getHistory(
        extensionId: ExtensionIdentifier
    ): readonly ExtensionRegistryHistoryRecord[] {
        const key = String(extensionId);
        const records = this.historyByExtension.get(key) ?? [];
        return Object.freeze([...records]);
    }

    getLatestHistory(
        extensionId: ExtensionIdentifier
    ): ExtensionRegistryHistoryRecord | null {
        const history = this.getHistory(extensionId);
        if (history.length === 0) {
            return null;
        }
        return history[history.length - 1] ?? null;
    }

    clearForTest(): void {
        this.historyByExtension.clear();
    }
}
