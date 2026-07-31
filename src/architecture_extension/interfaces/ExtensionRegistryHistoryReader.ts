/**
 * ASA-ARCH-45.0 — ExtensionRegistryHistoryReader
 * Read-only historical registry reference access.
 */

import type { ExtensionRegistryHistoryRecord } from "../models";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionRegistryHistoryReader {
    readonly interfaceId: "ExtensionRegistryHistoryReader";
    readonly readOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;

    getHistory(
        extensionId: ExtensionIdentifier
    ): readonly ExtensionRegistryHistoryRecord[];

    getLatestHistory(
        extensionId: ExtensionIdentifier
    ): ExtensionRegistryHistoryRecord | null;
}
