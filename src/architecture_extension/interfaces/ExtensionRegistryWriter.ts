/**
 * ASA-ARCH-45.0 — ExtensionRegistryWriter
 * Registry write shape for storing immutable reference records only.
 * Does not approve, activate, or execute extensions.
 */

import type { ExtensionRegistryRecord } from "../models";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionRegistryWriter {
    readonly interfaceId: "ExtensionRegistryWriter";
    readonly storesReferencesOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly doesNotApproveExtension: true;
    readonly doesNotExecuteExtension: true;

    /**
     * Store an immutable registry reference record.
     * Must not mutate an existing immutable record in place.
     */
    storeRecord(record: ExtensionRegistryRecord): ExtensionRegistryRecord;

    /**
     * Replace current projection by storing a new immutable record.
     * Prior record becomes historical via history writer/reader — not mutated.
     */
    replaceRecord(
        extensionId: ExtensionIdentifier,
        record: ExtensionRegistryRecord
    ): ExtensionRegistryRecord;
}
