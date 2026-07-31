/**
 * ASA-ARCH-45.0 — ExtensionRegistryReader
 * Read-only registry interaction shape. Reference retrieval only.
 */

import type { ExtensionRegistryRecord } from "../models";
import type { ExtensionIdentifier } from "../types";

export interface ExtensionRegistryReader {
    readonly interfaceId: "ExtensionRegistryReader";
    readonly readOnly: true;
    readonly doesNotOwnAuthority: true;
    readonly doesNotActivateExtension: true;
    readonly doesNotApproveExtension: true;

    getRecord(extensionId: ExtensionIdentifier): ExtensionRegistryRecord | null;

    listRecords(): readonly ExtensionRegistryRecord[];

    hasRecord(extensionId: ExtensionIdentifier): boolean;
}
